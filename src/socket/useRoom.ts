import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config';

export interface RosterEntry {
  participantId: string;
  name: string;
  isSpectator: boolean;
  isHost: boolean;
  muted: boolean;
}

export interface Vote {
  participantId: string;
  value: string;
}

export interface Stats {
  avg: number;
  median: number;
  variance: number;
}

export interface ChatMessage {
  participantId?: string;
  name: string;
  text: string;
  ts: number;
}

export type RoomStatus = 'idle' | 'connecting' | 'joined' | 'error' | 'removed' | 'closed';

export interface RoomState {
  status: RoomStatus;
  errorCode?: string;
  message?: string;
  participantId: string | null;
  role: 'voter' | 'spectator' | null;
  isHost: boolean;
  muted: boolean;
  deckType: string;
  topic: string;
  roundActive: boolean;
  revealed: boolean;
  timerEndsAt: number | null;
  participants: RosterEntry[];
  votedIds: string[];
  votes: Vote[];
  stats: Stats | null;
  myVote: string | null;
  messages: ChatMessage[];
  exportCsv: string | null;
  notice: { text: string; kind: 'info' | 'error'; id: number } | null;
}

const initial: RoomState = {
  status: 'idle',
  participantId: null,
  role: null,
  isHost: false,
  muted: false,
  deckType: 'fibonacci',
  topic: '',
  roundActive: false,
  revealed: false,
  timerEndsAt: null,
  participants: [],
  votedIds: [],
  votes: [],
  stats: null,
  myVote: null,
  messages: [],
  exportCsv: null,
  notice: null,
};

type Action =
  | { type: 'connecting' }
  | { type: 'joined'; payload: any }
  | { type: 'roster'; participants: RosterEntry[] }
  | { type: 'voted'; participantId: string }
  | { type: 'myVote'; value: string }
  | { type: 'roundStart'; topic: string }
  | { type: 'reveal'; votes: Vote[]; stats: Stats | null }
  | { type: 'revote' }
  | { type: 'timer'; endsAt: number }
  | { type: 'chat'; message: ChatMessage }
  | { type: 'muted'; muted: boolean }
  | { type: 'removed'; message: string }
  | { type: 'closed'; csv: string; reason: string }
  | { type: 'error'; message: string; code?: string }
  | { type: 'notice'; text: string; kind: 'info' | 'error' }
  | { type: 'clearNotice' };

// errors that mean we never got (or lost) a seat, as opposed to a rejected action
const FATAL_CODES = new Set(['room_not_found', 'banned', 'name_in_use', 'invalid_name', 'rate_limited']);

let noticeId = 0;

function reducer(state: RoomState, action: Action): RoomState {
  switch (action.type) {
    case 'connecting':
      return { ...state, status: state.status === 'joined' ? 'joined' : 'connecting' };
    case 'joined': {
      const p = action.payload;
      const rs = p.roomState ?? {};
      const votes: Vote[] = rs.reveal?.votes ?? [];
      return {
        ...state,
        status: 'joined',
        errorCode: undefined,
        message: undefined,
        participantId: p.participantId,
        role: p.role,
        isHost: Boolean(p.isHost),
        muted: Boolean(p.muted),
        deckType: rs.deckType ?? state.deckType,
        topic: rs.topic ?? '',
        roundActive: Boolean(rs.roundActive),
        revealed: rs.revealState === 'revealed',
        timerEndsAt: rs.timerEndsAt ?? null,
        participants: rs.participants ?? [],
        votedIds: rs.votedIds ?? [],
        votes,
        stats: rs.reveal?.stats ?? null,
        myVote: votes.find((v) => v.participantId === p.participantId)?.value ?? state.myVote,
      };
    }
    case 'roster':
      return { ...state, participants: action.participants };
    case 'voted':
      return state.votedIds.includes(action.participantId)
        ? state
        : { ...state, votedIds: [...state.votedIds, action.participantId] };
    case 'myVote':
      return { ...state, myVote: action.value };
    case 'roundStart':
      return {
        ...state,
        topic: action.topic,
        roundActive: true,
        revealed: false,
        votes: [],
        stats: null,
        votedIds: [],
        myVote: null,
        timerEndsAt: null,
      };
    case 'reveal':
      return { ...state, revealed: true, votes: action.votes, stats: action.stats, timerEndsAt: null };
    case 'revote':
      return { ...state, revealed: false, votes: [], stats: null, votedIds: [], myVote: null, timerEndsAt: null };
    case 'timer':
      return { ...state, timerEndsAt: action.endsAt };
    case 'chat':
      return { ...state, messages: [...state.messages.slice(-199), action.message] };
    case 'muted':
      return {
        ...state,
        muted: action.muted,
        notice: {
          text: action.muted ? 'The host muted you in chat.' : 'The host unmuted you.',
          kind: 'info',
          id: ++noticeId,
        },
      };
    case 'removed':
      return { ...state, status: 'removed', message: action.message };
    case 'closed':
      return { ...state, status: 'closed', exportCsv: action.csv, message: action.reason };
    case 'error':
      if (state.status !== 'joined' && action.code && FATAL_CODES.has(action.code)) {
        return { ...state, status: 'error', errorCode: action.code, message: action.message };
      }
      return { ...state, notice: { text: action.message, kind: 'error', id: ++noticeId } };
    case 'notice':
      return { ...state, notice: { text: action.text, kind: action.kind, id: ++noticeId } };
    case 'clearNotice':
      return { ...state, notice: null };
  }
}

export function tokenKey(code: string) {
  return `poker-planning:${code}:token`;
}

export function hasSeat(code: string): boolean {
  try {
    return Boolean(localStorage.getItem(tokenKey(code)));
  } catch {
    return false;
  }
}

export interface JoinRequest {
  name: string;
  isSpectator: boolean;
}

export function useRoom(code: string, join: JoinRequest | null) {
  const [state, dispatch] = useReducer(reducer, initial);
  const socketRef = useRef<Socket | null>(null);
  const joinRef = useRef(join);
  joinRef.current = join;

  const active = join !== null;

  useEffect(() => {
    if (!active) return;
    dispatch({ type: 'connecting' });
    const s = io(SOCKET_URL, { withCredentials: true, transports: ['websocket', 'polling'] });
    socketRef.current = s;
    let removed = false;

    const doJoin = () => {
      const req = joinRef.current;
      let token: string | undefined;
      try {
        token = localStorage.getItem(tokenKey(code)) ?? undefined;
      } catch {
        token = undefined;
      }
      s.emit('join', { roomCode: code, name: req?.name ?? '', token, isSpectator: req?.isSpectator ?? false });
    };

    s.on('connect', doJoin);
    s.on('joined', (payload) => {
      try {
        localStorage.setItem(tokenKey(code), payload.token);
      } catch {
        // storage unavailable — reconnection just won't survive a reload
      }
      dispatch({ type: 'joined', payload });
    });
    s.on('participant:update', (p) => {
      if (Array.isArray(p?.participants)) dispatch({ type: 'roster', participants: p.participants });
    });
    s.on('participant:voted', (p) => dispatch({ type: 'voted', participantId: p.participantId }));
    s.on('round:start', (p) => dispatch({ type: 'roundStart', topic: p.topic ?? '' }));
    s.on('round:reveal', (p) => dispatch({ type: 'reveal', votes: p.votes ?? [], stats: p.stats ?? null }));
    s.on('round:revote', () => dispatch({ type: 'revote' }));
    s.on('timer:start', (p) => dispatch({ type: 'timer', endsAt: p.endsAt }));
    s.on('chat:message', (m) => dispatch({ type: 'chat', message: m }));
    s.on('moderation:muted', (p) => dispatch({ type: 'muted', muted: Boolean(p.muted) }));
    s.on('moderation:removed', (p) => {
      removed = true;
      try {
        localStorage.removeItem(tokenKey(code));
      } catch {
        // ignore
      }
      dispatch({ type: 'removed', message: p.message });
    });
    s.on('room:close', (p) => {
      removed = true;
      dispatch({ type: 'closed', csv: p.exportCsv ?? '', reason: p.reason ?? 'closed' });
    });
    s.on('error', (p) => dispatch({ type: 'error', message: p?.message ?? 'Something went wrong', code: p?.code }));
    s.on('disconnect', (reason) => {
      // the server only drops us on purpose when this seat was taken over by
      // another tab/window (kick, ban and close announce themselves first)
      if (!removed && reason === 'io server disconnect') {
        dispatch({ type: 'removed', message: 'You opened this table in another tab or window.' });
      }
    });

    return () => {
      s.removeAllListeners();
      s.close();
      socketRef.current = null;
    };
  }, [code, active]);

  const emit = useCallback((event: string, payload: Record<string, unknown> = {}) => {
    socketRef.current?.emit(event, { roomCode: code, ...payload });
  }, [code]);

  const actions = useMemo(
    () => ({
      vote(value: string) {
        dispatch({ type: 'myVote', value });
        emit('vote:cast', { value });
      },
      chat(text: string) {
        emit('chat:message', { text });
      },
      startRound(topic: string) {
        emit('round:start', { topic });
      },
      reveal() {
        emit('round:reveal');
      },
      revote() {
        emit('round:revote');
      },
      startTimer(seconds: number) {
        emit('timer:start', { endsAt: Date.now() + seconds * 1000 });
      },
      kick(participantId: string) {
        emit('participant:kick', { participantId });
      },
      mute(participantId: string, muted: boolean) {
        emit('participant:mute', { participantId, muted });
      },
      ban(participantId: string) {
        emit('participant:ban', { participantId });
      },
      unban(ip: string) {
        emit('participant:unban', { ip });
      },
      closeRoom() {
        emit('room:close');
      },
      notify(text: string, kind: 'info' | 'error' = 'info') {
        dispatch({ type: 'notice', text, kind });
      },
      clearNotice() {
        dispatch({ type: 'clearNotice' });
      },
    }),
    [emit],
  );

  const onEvent = useCallback((event: string, handler: (...args: any[]) => void) => {
    const s = socketRef.current;
    s?.on(event, handler);
    return () => {
      s?.off(event, handler);
    };
  }, []);

  return { state, actions, onEvent };
}
