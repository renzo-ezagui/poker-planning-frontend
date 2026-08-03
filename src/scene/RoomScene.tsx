import { useParams, useSearchParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRoomSocket } from '../socket/useRoomSocket';
import { Table } from './Table';
import { Seat } from './Seat';
import { ChatPanel } from '../components/ChatPanel';
import { StatsPanel } from '../components/StatsPanel';
import { AdminControls } from '../components/AdminControls';

export function RoomScene() {
  const { code } = useParams();
  const [params] = useSearchParams();
  const name = params.get('name') ?? '';
  // participantId is part of the hook's contract (Task 12) but not needed by
  // this scene yet; own-seat highlighting will consume it in a later task.
  const { role, socket, connected } = useRoomSocket(code ?? '', name);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 4, 6] }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[0, 5, 0]} />
        <Table />
        <Seat position={[0, 0.5, 3]} name={name} hasVoted={false} revealed={false} value="" />
        <OrbitControls />
      </Canvas>
      <ChatPanel socket={socket} name={name} roomCode={code ?? ''} />
      <StatsPanel socket={socket} />
      {role === 'voter' && connected && <AdminControls socket={socket} roomCode={code ?? ''} />}
    </div>
  );
}
