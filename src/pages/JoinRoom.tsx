import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function JoinRoom() {
  const [name, setName] = useState('');
  const [isSpectator, setIsSpectator] = useState(false);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const roomCode = params.get('room') ?? '';

  function handleJoin() {
    navigate(`/room/${roomCode}?name=${encodeURIComponent(name)}&spectator=${isSpectator}`);
  }

  return (
    <div>
      <h1>Join a room</h1>
      <label htmlFor="name-input">Your name</label>
      <input id="name-input" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
      <label>
        <input
          type="checkbox"
          checked={isSpectator}
          onChange={(e) => setIsSpectator(e.target.checked)}
        />
        Join as spectator
      </label>
      <button disabled={name.trim().length === 0} onClick={handleJoin}>
        Join
      </button>
    </div>
  );
}
