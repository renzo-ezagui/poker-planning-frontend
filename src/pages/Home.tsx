import { useState } from 'react';
import { Link, useNavigate, useSearchParams, Navigate } from 'react-router-dom';

export function Home() {
  const [params] = useSearchParams();
  const legacyRoom = params.get('room');
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  if (legacyRoom) return <Navigate to={`/r/${legacyRoom}`} replace />;

  const clean = code.replace(/[^a-z0-9]/gi, '').toUpperCase();

  return (
    <div className="page">
      <header className="page-head">
        <span className="brand">
          <span className="brand-mark">P</span> Planning Poker
        </span>
        <nav style={{ display: 'flex', gap: 8 }}>
          <Link to="/help" className="btn btn-ghost btn-sm">
            How it works
          </Link>
          <Link to="/admin" className="btn btn-sm">
            Host a table
          </Link>
        </nav>
      </header>
      <div className="hero">
        <div className="fan" aria-hidden>
          <span>3</span>
          <span>5</span>
          <span>8</span>
          <span />
        </div>
        <h1>Estimate together, reveal at once.</h1>
        <p>Everyone picks a card in secret. The host flips them all at the same moment.</p>
      </div>
      <form
        className="sheet panel"
        onSubmit={(e) => {
          e.preventDefault();
          if (clean.length >= 8) navigate(`/r/${clean}`);
        }}
      >
        <label className="label" htmlFor="code-input">
          Table code
        </label>
        <input
          id="code-input"
          className="input input-code"
          value={clean}
          onChange={(e) => setCode(e.target.value)}
          maxLength={12}
          placeholder="XXXXXXXX"
          autoComplete="off"
          spellCheck={false}
        />
        <button className="btn btn-primary" type="submit" disabled={clean.length < 8} style={{ width: '100%', height: 46, marginTop: 16 }}>
          Find the table
        </button>
      </form>
    </div>
  );
}
