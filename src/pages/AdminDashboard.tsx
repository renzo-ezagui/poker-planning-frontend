import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ApiError, type PublicRoom } from '../lib/api';
import { DECK_LABELS } from '../lib/decks';
import { InviteModal } from '../components/InviteModal';

function timeLeft(expiresAt: string) {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return 'expired';
  const h = Math.floor(ms / 3600_000);
  const m = Math.floor((ms % 3600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [me, setMe] = useState<string | null>(null);
  const [rooms, setRooms] = useState<PublicRoom[]>([]);
  const [deckType, setDeckType] = useState<'fibonacci' | 'tshirt'>('fibonacci');
  const [hours, setHours] = useState(8);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState<string | null>(null);

  const loadRooms = useCallback(() => {
    api<PublicRoom[]>('/rooms/mine').then(setRooms).catch(() => setRooms([]));
  }, []);

  useEffect(() => {
    api<{ username: string }>('/auth/me')
      .then((r) => {
        setMe(r.username);
        loadRooms();
      })
      .catch(() => navigate('/admin/login', { replace: true }));
  }, [navigate, loadRooms]);

  async function createRoom(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const room = await api<PublicRoom>('/rooms', {
        method: 'POST',
        body: JSON.stringify({ deckType, expiresInHours: hours }),
      });
      loadRooms();
      setInvite(room.code);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) navigate('/admin/login', { replace: true });
      else setError(err instanceof ApiError && err.status === 429 ? 'You’ve opened a lot of tables this hour. Try again later.' : 'Couldn’t create the table.');
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await api('/auth/logout', { method: 'POST' }).catch(() => undefined);
    navigate('/admin/login');
  }

  if (!me) {
    return (
      <div className="page">
        <div className="spinner" style={{ marginTop: 120 }} />
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-head">
        <Link to="/" className="brand">
          <span className="brand-mark">P</span> Planning Poker
        </Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link to="/help" className="btn btn-ghost btn-sm">
            Help
          </Link>
          <span className="muted" style={{ fontSize: 13 }}>
            {me}
          </span>
          <button className="btn btn-sm" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <div className="dash">
        <form className="sheet panel" onSubmit={createRoom} style={{ maxWidth: 'none' }}>
          <h2>Open a table</h2>
          <div className="field">
            <span className="label">Deck</span>
            <div className="deck-pick">
              {(['fibonacci', 'tshirt'] as const).map((d) => (
                <button type="button" key={d} className="deck-option" aria-pressed={deckType === d} onClick={() => setDeckType(d)}>
                  <strong>{DECK_LABELS[d].name}</strong>
                  <small>{DECK_LABELS[d].preview}</small>
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <span className="label">Closes after</span>
            <div className="seg" role="group" aria-label="Table lifetime">
              {[2, 8, 24].map((h) => (
                <button type="button" key={h} aria-pressed={hours === h} onClick={() => setHours(h)}>
                  {h} hours
                </button>
              ))}
            </div>
          </div>
          {error && <div className="error-text">{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: '100%', height: 46, marginTop: 24 }}>
            {busy ? 'Opening…' : 'Open table'}
          </button>
        </form>

        <section>
          <h2>Your open tables</h2>
          {rooms.length === 0 ? (
            <div className="empty">No open tables. Open one and share the invite.</div>
          ) : (
            <div className="room-list">
              {rooms.map((r) => (
                <div className="room-item panel" key={r.code}>
                  <div>
                    <div className="room-code">{r.code}</div>
                    <div className="room-meta">
                      {DECK_LABELS[r.deckType]?.name} · {timeLeft(r.expiresAt)}
                    </div>
                  </div>
                  <div className="room-meta" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.currentTopic ? `Last topic: ${r.currentTopic}` : 'No rounds yet'}
                  </div>
                  <div className="room-actions">
                    <button className="btn btn-sm" onClick={() => setInvite(r.code)}>
                      Invite
                    </button>
                    <Link className="btn btn-sm btn-primary" to={`/r/${r.code}`}>
                      Sit at table
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {invite && <InviteModal code={invite} onClose={() => setInvite(null)} />}
    </div>
  );
}
