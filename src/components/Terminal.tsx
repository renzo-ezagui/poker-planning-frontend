import { useEffect, useRef, useState } from 'react';

const BOOT_LINES = (code: string) => [
  'Starting MS-DOS...',
  '',
  'HIMEM is testing extended memory...done.',
  `C:\\> PLANNING.EXE /TABLE:${code}`,
  '',
  'Loading deck ............... [OK]',
  'Shuffling cards ............ [OK]',
  'Connecting to table ........ [OK]',
  '',
];

/** Short DOS-style boot shown while joining a terminal-themed table. */
export function BootScreen({ code, done, onFinished }: { code: string; done: boolean; onFinished: () => void }) {
  const lines = BOOT_LINES(code);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (shown >= lines.length) return;
    const id = setTimeout(() => setShown((n) => n + 1), shown < 3 ? 140 : 190);
    return () => clearTimeout(id);
  }, [shown, lines.length]);

  useEffect(() => {
    if (done && shown >= lines.length) {
      const id = setTimeout(onFinished, 350);
      return () => clearTimeout(id);
    }
  }, [done, shown, lines.length, onFinished]);

  return (
    <div className="boot" aria-hidden>
      {lines.slice(0, shown).map((l, i) => (
        <div key={i}>{l.includes('[OK]') ? <>{l.replace('[OK]', '')}<span className="ok">[OK]</span></> : l || ' '}</div>
      ))}
      <span className="cursor">█</span>
    </div>
  );
}

export interface FKeyActions {
  help: () => void;
  chat: () => void;
  host?: () => void;
  reveal?: () => void;
  revote?: () => void;
  timer?: () => void;
}

/** Bottom status bar with working F-key shortcuts. */
export function FKeyBar({
  code,
  people,
  isHost,
  canReveal,
  roundActive,
  actions,
}: {
  code: string;
  people: number;
  isHost: boolean;
  canReveal: boolean;
  roundActive: boolean;
  actions: FKeyActions;
}) {
  const barRef = useRef<HTMLDivElement>(null);

  // publish the bar's height so the hand and host window can sit above it
  useEffect(() => {
    const el = barRef.current;
    const room = el?.parentElement;
    if (!el || !room) return;
    const ro = new ResizeObserver(() => room.style.setProperty('--fbar-h', `${el.offsetHeight}px`));
    ro.observe(el);
    return () => {
      ro.disconnect();
      room.style.removeProperty('--fbar-h');
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, (() => void) | undefined> = {
        F1: actions.help,
        F9: actions.chat,
        ...(isHost
          ? {
              F2: canReveal ? actions.reveal : undefined,
              F3: roundActive ? actions.revote : undefined,
              F4: canReveal ? actions.timer : undefined,
              F10: actions.host,
            }
          : {}),
      };
      const fn = map[e.key];
      if (fn) {
        e.preventDefault();
        fn();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [actions, isHost, canReveal, roundActive]);

  return (
    <div className="fbar" role="toolbar" aria-label="Keyboard shortcuts" ref={barRef}>
      <button onClick={actions.help}>
        <b>F1</b> Help
      </button>
      {isHost && (
        <>
          <button onClick={actions.reveal} disabled={!canReveal}>
            <b>F2</b> Reveal
          </button>
          <button onClick={actions.revote} disabled={!roundActive}>
            <b>F3</b> Revote
          </button>
          <button onClick={actions.timer} disabled={!canReveal}>
            <b>F4</b> Timer 60s
          </button>
        </>
      )}
      <button onClick={actions.chat}>
        <b>F9</b> Chat
      </button>
      {isHost && (
        <button onClick={actions.host}>
          <b>F10</b> Host
        </button>
      )}
      <span className="right">
        TABLE {code} · {people} USER{people === 1 ? '' : 'S'}
      </span>
    </div>
  );
}
