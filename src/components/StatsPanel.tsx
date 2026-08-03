import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';

export function StatsPanel({ socket }: { socket: Socket | null }) {
  const [stats, setStats] = useState<{ avg: number; median: number; variance: number } | null>(null);

  useEffect(() => {
    if (!socket) return;
    const handler = (payload: any) => setStats(payload.stats ?? null);
    socket.on('round:reveal', handler);
    return () => socket.off('round:reveal', handler);
  }, [socket]);

  if (!stats) return null;

  return (
    <div style={{ position: 'absolute', left: 0, bottom: 0 }}>
      <p>Avg: {stats.avg.toFixed(2)}</p>
      <p>Median: {stats.median}</p>
      <p>Variance: {stats.variance.toFixed(2)}</p>
    </div>
  );
}
