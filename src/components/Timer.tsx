import { useEffect, useRef, useState } from 'react';
import { playChime } from '../lib/sound';

export function Timer({ endsAt }: { endsAt: number | null }) {
  const [now, setNow] = useState(() => Date.now());
  const chimed = useRef<number | null>(null);

  useEffect(() => {
    if (!endsAt) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [endsAt]);

  const remaining = endsAt ? Math.max(0, Math.ceil((endsAt - now) / 1000)) : 0;

  useEffect(() => {
    if (endsAt && remaining === 0 && chimed.current !== endsAt) {
      chimed.current = endsAt;
      playChime();
    }
  }, [endsAt, remaining]);

  if (!endsAt) return null;
  const done = remaining === 0;
  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, '0');
  return (
    <div className={`timer${done ? ' done' : ''}`} role="timer" aria-live="polite">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 2M9 2h6" strokeLinecap="round" />
      </svg>
      {done ? "Time's up" : `${mm}:${ss}`}
    </div>
  );
}
