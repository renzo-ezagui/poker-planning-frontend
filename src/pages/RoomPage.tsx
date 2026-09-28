import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useRoom, hasSeat, type JoinRequest } from '../socket/useRoom';
import { TableScene } from '../scene/TableScene';
import { Hand } from '../components/Hand';
import { HostDock } from '../components/HostDock';
import { ChatDrawer } from '../components/ChatDrawer';
import { Results } from '../components/Results';
import { Timer } from '../components/Timer';
import { InviteModal } from '../components/InviteModal';
import { ChatIcon, PeopleIcon, SlidersIcon, SoundOffIcon, SoundOnIcon } from '../components/Icons';
import { JoinForm } from '../components/JoinForm';
import { BootScreen, FKeyBar } from '../components/Terminal';
import { playChip, playFlip, setSoundEnabled, soundEnabled } from '../lib/sound';
import { api, type PublicRoom } from '../lib/api';
import { ThemeContext, themeFor } from '../themes';
import { setSoundStyle } from '../lib/sound';

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

function downloadCsv(code: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `planning-poker-${code}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function RoomPage() {
  const params = useParams();
  const code = (params.code ?? '').toUpperCase();
  const [join, setJoin] = useState<JoinRequest | null>(() =>
    hasSeat(code) ? { name: '', isSpectator: false } : null,
  );
  const [room, setRoom] = useState<PublicRoom | null | 'missing'>(null);

  useEffect(() => {
    api<PublicRoom>(`/rooms/${code}`)
      .then(setRoom)
      .catch(() => setRoom('missing'));
  }, [code]);

  if (!join) {
    const theme = themeFor(room && room !== 'missing' ? room.theme : null);
    const closed = room === 'missing' || (room && room.status !== 'open');
    return (
      <ThemeContext.Provider value={theme}>
      <div className="themed" data-theme={theme.id}>
      <div className="page">
        <header className="page-head">
          <Link to="/" className="brand">
            <span className="brand-mark">P</span> Planning Poker
          </Link>
        </header>
        <div className="hero">
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Table {code}
          </div>
          <h1>{closed ? 'This table is closed' : theme.copy.joinTitle}</h1>
          <p>
            {closed
              ? 'The session has ended or the link is wrong. Ask the host for a fresh invite.'
              : room && room.currentTopic
                ? `Now estimating: ${room.currentTopic}`
                : 'Pick a name so the others know whose card is whose.'}
          </p>
        </div>
        {!closed && <JoinForm onJoin={setJoin} />}
      </div>
      </div>
      </ThemeContext.Provider>
    );
  }

  return (
    <Table
      code={code}
      join={join}
      initialTheme={room && room !== 'missing' ? room.theme : undefined}
      onLeave={() => setJoin(null)}
    />
  );
}

function Table({
  code,
  join,
  initialTheme,
  onLeave,
}: {
  code: string;
  join: JoinRequest;
  initialTheme?: string;
  onLeave: () => void;
}) {
  const { state, actions, onEvent } = useRoom(code, join);
  // until we're seated the socket hasn't told us the theme; the REST lookup has
  const theme = themeFor(state.status === 'joined' ? state.theme : (initialTheme ?? state.theme));
  useEffect(() => setSoundStyle(theme.sound), [theme.sound]);
  const [chatOpen, setChatOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [hostOpen, setHostOpen] = useState(() => window.innerWidth > 900);
  const compact = useMediaQuery('(max-width: 640px)');
  const [booting, setBooting] = useState(true);
  const [sound, setSound] = useState(soundEnabled());
  const [unread, setUnread] = useState(0);
  const seenMessages = useRef(0);

  useEffect(() => {
    if (chatOpen) {
      seenMessages.current = state.messages.length;
      setUnread(0);
    } else {
      setUnread(state.messages.length - seenMessages.current);
    }
  }, [chatOpen, state.messages.length]);

  // sounds on reveal: a flip per card, then a chip clink
  const prevRevealed = useRef(state.revealed);
  useEffect(() => {
    if (state.revealed && !prevRevealed.current && state.status === 'joined') {
      state.votes.slice(0, 12).forEach((_, i) => playFlip(i * 0.12));
      playChip(Math.min(12, state.votes.length) * 0.12 + 0.25);
    }
    prevRevealed.current = state.revealed;
  }, [state.revealed, state.votes, state.status]);

  useEffect(() => {
    if (!state.notice) return;
    const id = setTimeout(actions.clearNotice, 3800);
    return () => clearTimeout(id);
  }, [state.notice, actions]);

  const fkeys = useMemo(
    () => ({
      help: () => window.open('/help', '_blank', 'noopener'),
      chat: () => setChatOpen((o) => !o),
      host: () => setHostOpen((o) => !o),
      reveal: actions.reveal,
      revote: actions.revote,
      timer: () => actions.startTimer(60),
    }),
    [actions],
  );

  const voters = useMemo(() => state.participants.filter((p) => !p.isSpectator), [state.participants]);
  const votedCount = voters.filter((p) => state.votedIds.includes(p.participantId)).length;

  const waitingOn = voters.length - votedCount;
  const handHint = !state.roundActive
    ? state.isHost
      ? 'Type what you’re estimating in host controls, then press Start.'
      : 'Waiting for the host to start a round.'
    : state.revealed
      ? state.isHost
        ? 'Type the next story, or press Revote to vote again.'
        : 'Waiting for the next round.'
      : state.role === 'spectator'
        ? `${votedCount} of ${voters.length} voted`
        : state.myVote
          ? waitingOn > 0
            ? `Vote in. Waiting on ${waitingOn} more — you can still change it.`
            : 'Everyone’s in. Waiting for the host to reveal.'
          : 'Pick a card below.';

  return (
    <ThemeContext.Provider value={theme}>
    <div className="themed" data-theme={theme.id}>
    <div className="room">
      <TableScene
        theme={theme}
        participants={state.participants}
        meId={state.participantId}
        votedIds={state.votedIds}
        votes={state.votes}
        revealed={state.revealed}
        myVote={state.myVote}
        canModerate={state.isHost}
        actions={actions}
      />

      <header className="topbar">
        <div className="topbar-left">
          <Link to="/" className="brand" aria-label="Planning Poker home">
            <span className="brand-mark">P</span>
          </Link>
          <button className="code-chip" onClick={() => setInviteOpen(true)} title="Invite people">
            <span className="eyebrow">Table</span>
            {code}
          </button>
        </div>
        <div className="topbar-right">
          <Timer endsAt={state.timerEndsAt} />
          <a href="/help" target="_blank" rel="noreferrer" className="btn btn-icon panel help-link" aria-label="How it works (opens in a new tab)" title="How it works">
            ?
          </a>
          <div className="people-chip" title="People at the table">
            <PeopleIcon />
            <strong>{state.participants.length}</strong>
          </div>
          <button
            className="btn btn-icon panel"
            onClick={() => {
              setSoundEnabled(!sound);
              setSound(!sound);
            }}
            aria-label={sound ? 'Mute sounds' : 'Enable sounds'}
            aria-pressed={sound}
          >
            {sound ? <SoundOnIcon /> : <SoundOffIcon />}
          </button>
          {state.isHost && state.status === 'joined' && (
            <button
              className="btn btn-icon panel"
              onClick={() => setHostOpen((o) => !o)}
              aria-label={hostOpen ? 'Hide host controls' : 'Show host controls'}
              aria-expanded={hostOpen}
              title="Host controls"
            >
              <SlidersIcon />
            </button>
          )}
          <button
            className="btn btn-icon panel"
            style={{ position: 'relative' }}
            onClick={() => setChatOpen((o) => !o)}
            aria-label="Toggle chat"
            aria-expanded={chatOpen}
          >
            <ChatIcon />
            {unread > 0 && !chatOpen && <span className="badge">{unread}</span>}
          </button>
        </div>
      </header>

      <div className="topic">
        {state.roundActive ? (
          <>
            <div className="eyebrow">{state.revealed ? theme.copy.revealed : theme.copy.nowEstimating}</div>
            <h1>{state.topic || 'Untitled story'}</h1>
            {handHint && <div className="topic-hint">{handHint}</div>}
            {compact && state.revealed && (
              <Results votes={state.votes} stats={state.stats} deckType={state.deckType} inline />
            )}
          </>
        ) : (
          state.status === 'joined' && (
            <>
              <div className="waiting">{theme.copy.quiet}</div>
              {handHint && <div className="topic-hint">{handHint}</div>}
            </>
          )
        )}
      </div>

      {!compact && state.revealed && <Results votes={state.votes} stats={state.stats} deckType={state.deckType} />}

      {state.role === 'voter' && state.status === 'joined' && state.roundActive && !state.revealed && (
        <Hand deckType={state.deckType} selected={state.myVote} disabled={false} hint={null} onPick={actions.vote} />
      )}

      {state.isHost && state.status === 'joined' && hostOpen && (
        <HostDock
          onClose={() => setHostOpen(false)}
          code={code}
          roundActive={state.roundActive}
          revealed={state.revealed}
          votedCount={votedCount}
          voterCount={voters.length}
          actions={actions}
          theme={state.theme}
          onInvite={() => setInviteOpen(true)}
          subscribe={onEvent}
        />
      )}

      {chatOpen && (
        <ChatDrawer messages={state.messages} muted={state.muted} onSend={actions.chat} onClose={() => setChatOpen(false)} />
      )}

      {inviteOpen && <InviteModal code={code} onClose={() => setInviteOpen(false)} />}

      {state.notice && (
        <div className={`toast${state.notice.kind === 'error' ? ' error' : ''}`} role="status" key={state.notice.id}>
          {state.notice.text}
        </div>
      )}

      {theme.terminal && state.status === 'joined' && (
        <FKeyBar
          code={code}
          people={state.participants.length}
          isHost={state.isHost}
          canReveal={state.roundActive && !state.revealed}
          roundActive={state.roundActive}
          actions={fkeys}
        />
      )}

      {theme.terminal && booting && (state.status === 'connecting' || state.status === 'joined' || state.status === 'idle') ? (
        <BootScreen code={code} done={state.status === 'joined'} onFinished={() => setBooting(false)} />
      ) : (
        <StateOverlay code={code} state={state} onLeave={onLeave} />
      )}
    </div>
    </div>
    </ThemeContext.Provider>
  );
}

function StateOverlay({
  code,
  state,
  onLeave,
}: {
  code: string;
  state: ReturnType<typeof useRoom>['state'];
  onLeave: () => void;
}) {
  if (state.status === 'connecting' || state.status === 'idle') {
    return (
      <div className="state">
        <div>
          <div className="spinner" />
          <p className="muted">Finding your seat…</p>
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    const retryable = state.errorCode === 'name_in_use' || state.errorCode === 'invalid_name';
    return (
      <div className="state">
        <div className="sheet panel">
          <h2>{state.errorCode === 'banned' ? 'You can’t join this table' : 'Couldn’t take a seat'}</h2>
          <p>{state.message}</p>
          <div className="state-actions">
            {retryable && (
              <button className="btn btn-primary" onClick={onLeave}>
                Choose another name
              </button>
            )}
            <Link to="/" className="btn">
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (state.status === 'removed') {
    return (
      <div className="state">
        <div className="sheet panel">
          <h2>You left the table</h2>
          <p>{state.message}</p>
          <div className="state-actions">
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Rejoin
            </button>
            <Link to="/" className="btn">
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (state.status === 'closed') {
    return (
      <div className="state">
        <div className="sheet panel">
          <div className="eyebrow" style={{ marginBottom: 8 }}>
            Table {code}
          </div>
          <h2>{state.message === 'expired' ? 'Time’s up for this table' : 'Session ended'}</h2>
          <p>Thanks for playing. The round history is ready to download.</p>
          <div className="state-actions">
            {state.exportCsv && (
              <button className="btn btn-primary" onClick={() => downloadCsv(code, state.exportCsv ?? '')}>
                Download CSV
              </button>
            )}
            <Link to="/" className="btn">
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
