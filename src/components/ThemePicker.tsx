import { THEMES, THEME_IDS, type ThemeId } from '../themes';

export function ThemePicker({ value, onChange }: { value: string; onChange: (id: ThemeId) => void }) {
  return (
    <div className="theme-pick" role="group" aria-label="Table theme">
      {THEME_IDS.map((id) => (
        <button type="button" key={id} className="theme-option" aria-pressed={value === id} onClick={() => onChange(id)}>
          <div className={`swatch ${id}`} aria-hidden>
            <i />
            <i />
            <i />
          </div>
          <span>
            <strong className={id === 'dungeon' ? 'dungeon-font' : id === 'terminal' ? 'terminal-font' : undefined}>{THEMES[id].name}</strong>
            <small>{THEMES[id].tagline}</small>
          </span>
        </button>
      ))}
    </div>
  );
}
