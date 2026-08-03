import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRoomSocket } from '../socket/useRoomSocket';
import { Table } from './Table';
import { Seat } from './Seat';
import { ChatPanel } from '../components/ChatPanel';
import { StatsPanel } from '../components/StatsPanel';
import { AdminControls } from '../components/AdminControls';
import { VotingCards } from '../components/VotingCards';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export function RoomScene() {
  const { code } = useParams();
  const [params] = useSearchParams();
  const name = params.get('name') ?? '';
  const isSpectator = params.get('spectator') === 'true';
  const { participantId, role, socket, connected } = useRoomSocket(code ?? '', name, isSpectator);

  const [deckType, setDeckType] = useState<string>('fibonacci');
  const [revealed, setRevealed] = useState(false);
  const [myValue, setMyValue] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/rooms/${code}/is-admin`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : { isAdmin: false }))
      .then((data) => setIsAdmin(Boolean(data.isAdmin)))
      .catch(() => setIsAdmin(false));
  }, [code]);

  useEffect(() => {
    fetch(`${API_URL}/rooms/${code}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((room) => room && setDeckType(room.deckType))
      .catch(() => {});
  }, [code]);

  useEffect(() => {
    if (!socket) return;
    const onReveal = (payload: { votes: { participantId: string; value: string }[] }) => {
      setRevealed(true);
      const mine = payload.votes.find((v) => v.participantId === participantId);
      if (mine) setMyValue(mine.value);
    };
    const onRoundStart = () => {
      setRevealed(false);
      setMyValue('');
    };
    const onRevote = () => {
      setRevealed(false);
      setMyValue('');
    };
    const onError = (payload: { message: string }) => setNotice(payload.message);
    const onRoomClose = () => setNotice('This room has been closed by the admin.');

    socket.on('round:reveal', onReveal);
    socket.on('round:start', onRoundStart);
    socket.on('round:revote', onRevote);
    socket.on('error', onError);
    socket.on('room:close', onRoomClose);

    return () => {
      socket.off('round:reveal', onReveal);
      socket.off('round:start', onRoundStart);
      socket.off('round:revote', onRevote);
      socket.off('error', onError);
      socket.off('room:close', onRoomClose);
    };
  }, [socket, participantId]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 4, 6] }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[0, 5, 0]} />
        <Table />
        <Seat position={[0, 0.5, 3]} name={name} hasVoted={myValue !== ''} revealed={revealed} value={myValue} />
        <OrbitControls />
      </Canvas>
      <ChatPanel socket={socket} name={name} roomCode={code ?? ''} />
      <StatsPanel socket={socket} />
      {notice && <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)' }}>{notice}</div>}
      {isAdmin && connected && <AdminControls socket={socket} roomCode={code ?? ''} />}
      {role === 'voter' && connected && !revealed && (
        <VotingCards
          deckType={deckType}
          socket={socket}
          roomCode={code ?? ''}
          participantId={participantId ?? ''}
          disabled={!connected}
        />
      )}
    </div>
  );
}
