import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { CloseIcon, SlidersIcon } from './Icons';
import { THEMES, THEME_IDS } from '../themes';

export interface HostActions {
  startRound: (topic: string) => void;
  reveal: () => void;
  revote: () => void;
  startTimer: (seconds: number) => void;
  unban: (ip: string) => void;
  setTheme: (theme: string) => void;
  closeRoom: () => void;
}

export function HostDock({
  code,
  roundActive,
  revealed,
  votedCount,
  voterCount,
  actions,
  theme,
  onInvite,
  subscribe,
}: {
  theme: string;
  code: string;
  roundActive: boolean;
  revealed: boolean;
  votedCount: number;
  voterCount: number;
  actions: HostActions;
  onInvite: () => void;
  subscribe: (event: string, handler: () => void) => () => void;
}) {
  const [open, setOpen] = useState(() => window.innerWidth > 900);
  const [topic, setTopic] = useState('');
  const [bans, setBans] = useState<string[]>([]);
  const [confirmClose, setConfirmClose] = useState(false);

  const loadBans = useCallback(() => {
    api<{ bannedIps: string[] }>(`/rooms/${code}/banned-ips`)
      .then((r) => setBans(r.bannedIps))
      .catch(() => setBans([]));
  }, [code]);

  useEffect(() => {
    loadBans();
    return subscribe('bans:changed', loadBans);
  }, [loadBans, subscribe]);

  function start(e: React.FormEvent) {
    e.preventDefault();
    actions.startRound(topic.trim());
    setTopic('');
  }

  if (!open) {
    return (
      <button className="btn dock-toggle panel" onClick={() => setOpen(true)}>
        <SlidersIcon /> Host controls
      </button>
    );
  }

  const canReveal = roundActive && !revealed;

  return (
    <section className="dock panel" aria-label="Host controls">
      <div className="dock-head">
        <span className="eyebrow">Host controls</span>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setOpen(false)} aria-label="Hide host controls">
          <CloseIcon />
        </button>
      </div>

      <form className="dock-row" onSubmit={start}>
        <label htmlFor="topic-input" className="sr-only">
          Next topic
        </label>
        <input
          id="topic-input"
          className="input"
          placeholder={roundActive ? 'Next story…' : 'What are we estimating?'}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          maxLength={280}
          autoComplete="off"
        />
        <button className="btn btn-primary" type="submit" style={{ flex: 'none' }}>
          {roundActive ? 'Next' : 'Start'}
        </button>
      </form>

      <div className="dock-row">
        <button className="btn btn-primary" disabled={!canReveal} onClick={actions.reveal}>
          Reveal{canReveal && voterCount > 0 ? ` · ${votedCount}/${voterCount}` : ''}
        </button>
        <button className="btn" disabled={!roundActive} onClick={actions.revote}>
          Revote
        </button>
      </div>

      <div className="dock-row">
        {[30, 60, 120].map((s) => (
          <button key={s} className="btn btn-sm" disabled={!canReveal} onClick={() => actions.startTimer(s)}>
            {s < 60 ? `${s}s` : `${s / 60}m`} timer
          </button>
        ))}
      </div>

      <div className="dock-row">
        <button className="btn btn-sm" onClick={onInvite}>
          Invite
        </button>
        {confirmClose ? (
          <>
            <button className="btn btn-sm btn-danger" onClick={actions.closeRoom}>
              Close for everyone
            </button>
            <button className="btn btn-sm btn-ghost" onClick={() => setConfirmClose(false)}>
              Cancel
            </button>
          </>
        ) : (
          <button className="btn btn-sm btn-danger" onClick={() => setConfirmClose(true)}>
            End session
          </button>
        )}
      </div>

      <div className="dock-section">
        <div className="eyebrow" style={{ marginBottom: 8 }}>
          Table theme
        </div>
        <div className="seg" role="group" aria-label="Table theme">
          {THEME_IDS.map((id) => (
            <button type="button" key={id} aria-pressed={theme === id} onClick={() => actions.setTheme(id)}>
              {THEMES[id].name}
            </button>
          ))}
        </div>
      </div>

      {bans.length > 0 && (
        <div className="dock-section">
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            Banned
          </div>
          {bans.map((ip) => (
            <div className="ban-row" key={ip}>
              <span className="muted">{ip}</span>
              <button className="btn btn-sm btn-ghost" onClick={() => actions.unban(ip)}>
                Unban
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
