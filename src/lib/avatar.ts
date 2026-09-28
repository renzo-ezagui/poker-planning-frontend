const PALETTE = ['#d6a24a', '#c9674f', '#6fa8a0', '#a58ac2', '#8fb36b', '#d98b5f', '#7c9fd6', '#c97a9a'];

export function colorFor(seed: string, palette: string[] = PALETTE): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
