import { useState } from 'react';
import type { JoinRequest } from '../socket/useRoom';
import { useTheme } from '../themes';

const NAME_KEY = 'poker-planning:name';

function rememberedName() {
  try {
    return localStorage.getItem(NAME_KEY) ?? '';
  } catch {
    return '';
  }
}

export function JoinForm({ onJoin }: { onJoin: (req: JoinRequest) => void }) {
  const [name, setName] = useState(rememberedName);
  const [isSpectator, setIsSpectator] = useState(false);
  const theme = useTheme();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      localStorage.setItem(NAME_KEY, trimmed);
    } catch {
      // ignore
    }
    onJoin({ name: trimmed, isSpectator });
  }

  return (
    <form className="sheet panel" onSubmit={submit}>
      <div className="field">
        <label className="label" htmlFor="name-input">
          Your name
        </label>
        <input
          id="name-input"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          autoComplete="nickname"
          autoFocus
          placeholder="e.g. Renata"
        />
      </div>
      <div className="field">
        <span className="label">I'm here to</span>
        <div className="seg" role="group" aria-label="Role">
          <button type="button" aria-pressed={!isSpectator} onClick={() => setIsSpectator(false)}>
            Vote
          </button>
          <button type="button" aria-pressed={isSpectator} onClick={() => setIsSpectator(true)}>
            Watch
          </button>
        </div>
      </div>
      <button className="btn btn-primary" type="submit" disabled={!name.trim()} style={{ width: '100%', height: 46, marginTop: 24 }}>
        {theme.copy.takeSeat}
      </button>
    </form>
  );
}
