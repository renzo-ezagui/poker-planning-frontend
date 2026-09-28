import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../lib/api';

interface AuthConfig {
  registration: boolean;
  googleClientId: string | null;
}

declare global {
  interface Window {
    google?: any;
  }
}

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('google script failed'));
    document.head.appendChild(s);
  });
}

function messageFor(err: unknown, mode: 'signin' | 'signup') {
  if (!(err instanceof ApiError)) return 'Couldn’t reach the server.';
  if (err.status === 429) return 'Too many attempts. Wait a minute and try again.';
  if (mode === 'signin' && err.status === 401) return 'That username and password don’t match.';
  if (err.status === 409) return 'That username is taken. Try another one.';
  if (err.status === 403) return 'New accounts are disabled on this server. Ask its owner for one.';
  return err.message;
}

export function AdminLogin() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const googleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api<AuthConfig>('/auth/config')
      .then(setConfig)
      .catch(() => setConfig({ registration: false, googleClientId: null }));
    api('/auth/me')
      .then(() => navigate('/admin', { replace: true }))
      .catch(() => undefined);
  }, [navigate]);

  useEffect(() => {
    const clientId = config?.googleClientId;
    if (!clientId || !googleRef.current) return;
    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !googleRef.current) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (resp: { credential: string }) => {
            try {
              await api('/auth/google', { method: 'POST', body: JSON.stringify({ credential: resp.credential }) });
              navigate('/admin');
            } catch (err) {
              setError(
                err instanceof ApiError && err.status === 401
                  ? 'Google sign-in didn’t work for this account.'
                  : messageFor(err, 'signin'),
              );
            }
          },
        });
        window.google.accounts.id.renderButton(googleRef.current, {
          theme: 'filled_black',
          size: 'large',
          shape: 'pill',
          text: mode === 'signup' ? 'signup_with' : 'signin_with',
          width: 320,
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [config, mode, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api(mode === 'signin' ? '/auth/login' : '/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password }),
      });
      navigate('/admin');
    } catch (err) {
      setError(messageFor(err, mode));
    } finally {
      setBusy(false);
    }
  }

  const signup = mode === 'signup';
  const passwordTooShort = signup && password.length > 0 && password.length < 12;

  return (
    <div className="page">
      <header className="page-head">
        <Link to="/" className="brand">
          <span className="brand-mark">P</span> Planning Poker
        </Link>
        <Link to="/help" className="btn btn-ghost btn-sm">
          How it works
        </Link>
      </header>
      <div className="hero">
        <h1>{signup ? 'Become a host' : 'Host sign in'}</h1>
        <p>Hosts open tables and run the rounds. Players only need the invite link, no account.</p>
      </div>
      <form className="sheet panel" onSubmit={handleSubmit}>
        {config?.registration && (
          <div className="seg" role="group" aria-label="Account" style={{ marginBottom: 22 }}>
            <button type="button" aria-pressed={!signup} onClick={() => { setMode('signin'); setError(null); }}>
              Sign in
            </button>
            <button type="button" aria-pressed={signup} onClick={() => { setMode('signup'); setError(null); }}>
              Create account
            </button>
          </div>
        )}

        {config?.googleClientId && (
          <>
            <div ref={googleRef} style={{ display: 'flex', justifyContent: 'center', minHeight: 44 }} />
            <div className="divider">
              <span>or with a username</span>
            </div>
          </>
        )}

        <div className="field">
          <label className="label" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            maxLength={40}
            autoFocus
          />
        </div>
        <div className="field">
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={signup ? 'new-password' : 'current-password'}
          />
          {signup && (
            <div className={passwordTooShort ? 'error-text' : 'hint'}>At least 12 characters. A short sentence works well.</div>
          )}
        </div>
        {error && <div className="error-text">{error}</div>}
        <button
          className="btn btn-primary"
          type="submit"
          disabled={busy || username.trim().length < 3 || !password || passwordTooShort}
          style={{ width: '100%', height: 46, marginTop: 24 }}
        >
          {busy ? 'One moment…' : signup ? 'Create account' : 'Sign in'}
        </button>
        {config && !config.registration && (
          <p className="hint" style={{ textAlign: 'center', marginTop: 16 }}>
            Accounts on this server are created by its owner.
          </p>
        )}
      </form>
    </div>
  );
}
