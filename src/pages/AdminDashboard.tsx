import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export function AdminDashboard() {
  const [deckType, setDeckType] = useState<'fibonacci' | 'tshirt'>('fibonacci');
  const [expiresInHours, setExpiresInHours] = useState(8);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  async function createRoom() {
    const res = await fetch(`${API_URL}/rooms`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deckType, expiresInHours }),
    });
    const room = await res.json();
    setInviteUrl(`${window.location.origin}/?room=${room.code}`);
  }

  return (
    <div>
      <h1>Admin dashboard</h1>
      <select value={deckType} onChange={(e) => setDeckType(e.target.value as any)}>
        <option value="fibonacci">Fibonacci</option>
        <option value="tshirt">T-shirt sizes</option>
      </select>
      <input
        type="number"
        value={expiresInHours}
        onChange={(e) => setExpiresInHours(Number(e.target.value))}
        min={1}
        max={72}
      />
      <button onClick={createRoom}>Create room</button>
      {inviteUrl && (
        <div>
          <a href={inviteUrl}>{inviteUrl}</a>
          <QRCodeSVG value={inviteUrl} />
        </div>
      )}
    </div>
  );
}
