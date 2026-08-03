import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3000';

export function useRoomSocket(roomCode: string, name: string, isSpectator = false) {
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [role, setRole] = useState<'voter' | 'spectator' | null>(null);
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const storageKey = `poker-planning:${roomCode}:token`;
    const s = io(SOCKET_URL, { withCredentials: true });

    const doJoin = () => {
      const existingToken = localStorage.getItem(storageKey) ?? undefined;
      s.emit('join', { roomCode, name, token: existingToken, isSpectator });
    };

    s.on('joined', (payload: { participantId: string; token: string; role: 'voter' | 'spectator' }) => {
      localStorage.setItem(storageKey, payload.token);
      setParticipantId(payload.participantId);
      setRole(payload.role);
      setConnected(true);
    });

    s.on('disconnect', () => setConnected(false));

    s.on('connect', doJoin);

    setSocket(s);

    return () => {
      s.close();
    };
  }, [roomCode, name, isSpectator]);

  return { participantId, role, socket, connected };
}
