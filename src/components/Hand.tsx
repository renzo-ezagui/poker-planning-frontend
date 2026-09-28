import { DECK_VALUES } from '../lib/decks';

export function Hand({
  deckType,
  selected,
  disabled,
  hint,
  onPick,
}: {
  deckType: string;
  selected: string | null;
  disabled: boolean;
  hint: string | null;
  onPick: (value: string) => void;
}) {
  const values = DECK_VALUES[deckType] ?? [];
  const mid = (values.length - 1) / 2;
  return (
    <div className="hand" role="group" aria-label="Your cards">
      {hint && <div className="hand-hint">{hint}</div>}
      <div className="hand-cards">
        {values.map((value, i) => {
          const offset = i - mid;
          return (
            <button
              key={value}
              className="hand-card"
              data-value={value}
              data-len={value.length}
              aria-pressed={selected === value}
              aria-label={`Vote ${value}`}
              disabled={disabled}
              style={
                {
                  '--tilt': `${offset * 2.2}deg`,
                  '--base-lift': `${18 + offset * offset * 0.9}px`,
                } as React.CSSProperties
              }
              onClick={() => onPick(value)}
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}
