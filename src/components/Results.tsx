import type { Stats, Vote } from '../socket/useRoom';
import { DECK_VALUES } from '../lib/decks';
import { useTheme } from '../themes';

function fmt(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export function Results({ votes, stats, deckType }: { votes: Vote[]; stats: Stats | null; deckType: string }) {
  const theme = useTheme();
  if (votes.length === 0) {
    return (
      <div className="results panel">
        <div className="results-main">
          <div className="eyebrow">Result</div>
          <div className="value">–</div>
        </div>
        <div className="consensus muted">Nobody voted this round.</div>
      </div>
    );
  }

  const order = DECK_VALUES[deckType] ?? [];
  const counts = new Map<string, number>();
  votes.forEach((v) => counts.set(v.value, (counts.get(v.value) ?? 0) + 1));
  const entries = [...counts.entries()].sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]));
  const max = Math.max(...counts.values());
  const top = entries.filter(([, c]) => c === max).map(([v]) => v);
  const consensus = counts.size === 1;

  return (
    <div className="results panel" aria-live="polite">
      <div className="results-main">
        <div className="eyebrow">{stats ? theme.copy.average : theme.copy.mostVoted}</div>
        <div className="value">{stats ? fmt(stats.avg) : top.join(' / ')}</div>
        {stats && (
          <div className="results-sub">
            <span>
              median <b>{fmt(stats.median)}</b>
            </span>
            <span>
              spread <b>{fmt(Math.sqrt(stats.variance))}</b>
            </span>
          </div>
        )}
      </div>
      {consensus ? (
        <div className="consensus">{theme.copy.consensus}</div>
      ) : (
        <div className="dist" aria-label="Vote distribution">
          {entries.map(([value, count]) => (
            <div className="dist-bar" key={value} title={`${count} vote${count === 1 ? '' : 's'}`}>
              <span className="muted">{count}</span>
              <i style={{ height: `${10 + (count / max) * 40}px` }} />
              <em>{value}</em>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
