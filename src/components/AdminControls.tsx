import { useState } from 'react';
import type { Socket } from 'socket.io-client';

export function AdminControls({ socket, roomCode }: { socket: Socket | null; roomCode: string }) {
  const [topic, setTopic] = useState('');

  return (
    <div style={{ position: 'absolute', left: 0, top: 0 }}>
      <label htmlFor="topic-input">Topic</label>
      <input id="topic-input" value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={280} />
      <button onClick={() => socket?.emit('round:start', { roomCode, topic })}>Start round</button>
      <button
        onClick={() => socket?.emit('timer:start', { roomCode, endsAt: Date.now() + 60_000 })}
      >
        Start 60s timer
      </button>
      <button onClick={() => socket?.emit('round:reveal', { roomCode })}>Reveal</button>
      <button onClick={() => socket?.emit('round:revote', { roomCode })}>Revote</button>
      <button onClick={() => socket?.emit('room:close', { roomCode })}>Close room</button>
    </div>
  );
}
