// src/components/LoginDashboard.jsx
// Minimal, self-contained login — no external dependencies except React.
// Calls your Flask /login endpoint directly. No api.js needed.

import React, { useState } from 'react';

// ── Config ────────────────────────────────────────────────────────────────────

const PREFIX_MAP = {
  SA:      'sa_',
  MOZ:     'moz_',
  MRU:     'mru_',
  CONTROL: 'control_',
};

const COUNTRIES = [
  { code: 'SA',  name: 'South Africa', flag: '🇿🇦' },
  { code: 'MOZ', name: 'Mozambique',   flag: '🇲🇿' },
  { code: 'MRU', name: 'Mauritius',    flag: '🇲🇺' },
];

const ROLES = [
  { id: 'driver',       label: 'Driver' },
  { id: 'dispatcher',   label: 'Dispatcher' },
  { id: 'depot_clerk',  label: 'Depot Clerk' },
  { id: 'border_agent', label: 'Border Agent' },
  { id: 'port_agent',   label: 'Port Agent' },
  { id: 'manager',      label: 'Manager' },
  { id: 'client',       label: 'Customer' },
];

const ROLE_DASHBOARDS = {
  driver:       '/driver',
  dispatcher:   '/dispatcher',
  depot_clerk:  '/depot-clerk',
  border_agent: '/border-agent',
  port_agent:   '/port-agent',
  manager:      '/management',
  client:       '/tracking',
};

// ── API ───────────────────────────────────────────────────────────────────────

async function loginRequest(country, username, password, role) {
  if (!country) throw new Error('Unknown country selected.');

  let res;
  try {
    res = await fetch('/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ username, password, role }),
    });
  } catch (err) {
    throw new Error(
      `Cannot reach the API server. Is the port-forward running on localhost:5003?\n(${err.message})`
    );
  }

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error(`Server returned non-JSON (HTTP ${res.status}). Check Flask logs.`); }

  if (!res.ok) throw new Error(data.error || `Login failed (${res.status})`);
  return data;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LoginDashboard({ onLogin }) {
  const [country,  setCountry]  = useState('');
  const [role,     setRole]     = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!country)         { setError('Please select a country.'); return; }
    if (!role)            { setError('Please select a role.');    return; }
    if (!username.trim()) { setError('Username is required.');    return; }
    if (!password)        { setError('Password is required.');    return; }

    // Auto-prefix: if user types "john" and picks MRU → becomes "mru_john"
    const prefix       = PREFIX_MAP[country];
    const finalUsername = username.trim().toLowerCase().startsWith(prefix)
      ? username.trim()
      : prefix + username.trim();

    setLoading(true);
    try {
      const result = await loginRequest(country, finalUsername, password, role);

      // Save session
      localStorage.setItem('currentUser', JSON.stringify(result.user));
      localStorage.setItem('user_site',   result.site);
      localStorage.setItem('user_role',   result.role);

      if (onLogin) onLogin(result);

      // Redirect to role dashboard
      window.location.href = ROLE_DASHBOARDS[result.role] || '/';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const prefix = PREFIX_MAP[country] || '';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .bf-wrap {
          min-height: 100vh;
          background: #080d1a;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          font-family: 'DM Sans', sans-serif;
        }

        .bf-card {
          width: 100%;
          max-width: 440px;
          background: #0f1623;
          border: 1px solid #1a2540;
          border-radius: 18px;
          padding: 36px 32px;
          box-shadow: 0 8px 48px rgba(0,0,0,0.5);
        }

        .bf-brand {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 28px;
        }
        .bf-brand-box {
          width: 38px; height: 38px;
          background: #1d4ed8;
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }
        .bf-brand-name {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 800;
          color: #f1f5f9;
        }
        .bf-brand-sub { font-size: 11px; color: #475569; }

        .bf-heading {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #f1f5f9;
          margin-bottom: 4px;
        }
        .bf-sub {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 26px;
        }

        .bf-label {
          display: block;
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: #475569;
          margin-bottom: 9px;
        }
        .bf-section { margin-bottom: 20px; }

        /* Countries */
        .bf-countries { display: flex; gap: 7px; }
        .bf-country-btn {
          flex: 1;
          padding: 9px 4px;
          background: #0a1020;
          border: 1.5px solid #1a2540;
          border-radius: 9px;
          color: #64748b;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          font-size: 11.5px;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.12s;
        }
        .bf-country-btn:hover { border-color: #3b82f6; color: #cbd5e1; }
        .bf-country-btn.sel {
          border-color: #2563eb;
          background: #172554;
          color: #93c5fd;
          font-weight: 600;
        }
        .bf-flag { font-size: 20px; }

        /* Roles */
        .bf-roles { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
        .bf-role-btn {
          padding: 9px 12px;
          background: #0a1020;
          border: 1.5px solid #1a2540;
          border-radius: 8px;
          color: #64748b;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          text-align: left;
          cursor: pointer;
          transition: all 0.12s;
        }
        .bf-role-btn:hover { border-color: #3b82f6; color: #cbd5e1; }
        .bf-role-btn.sel {
          border-color: #2563eb;
          background: #172554;
          color: #93c5fd;
          font-weight: 600;
        }

        /* Inputs */
        .bf-input {
          display: block;
          width: 100%;
          padding: 11px 13px;
          background: #0a1020;
          border: 1.5px solid #1a2540;
          border-radius: 9px;
          color: #e2e8f0;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.12s;
          margin-bottom: 9px;
        }
        .bf-input::placeholder { color: #334155; }
        .bf-input:focus { border-color: #2563eb; }

        .bf-hint {
          font-size: 11px;
          color: #334155;
          margin-bottom: 8px;
        }
        .bf-hint code {
          background: #1a2540;
          color: #60a5fa;
          padding: 1px 5px;
          border-radius: 4px;
        }

        /* Error */
        .bf-error {
          background: #1c0a0a;
          border: 1px solid #7f1d1d;
          border-radius: 8px;
          padding: 10px 13px;
          font-size: 13px;
          color: #fca5a5;
          margin-bottom: 14px;
          white-space: pre-wrap;
        }

        /* Button */
        .bf-btn {
          width: 100%;
          padding: 13px;
          background: #2563eb;
          border: none;
          border-radius: 10px;
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.12s;
        }
        .bf-btn:hover:not(:disabled) { background: #1d4ed8; }
        .bf-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      <div className="bf-wrap">
        <div className="bf-card">

          <div className="bf-brand">
            <div className="bf-brand-box">📦</div>
            <div>
              <div className="bf-brand-name">BorderFlow</div>
              <div className="bf-brand-sub">Logistics Management</div>
            </div>
          </div>

          <div className="bf-heading">Welcome back</div>
          <div className="bf-sub">Sign in to your BorderFlow account</div>

          <form onSubmit={handleSubmit}>

            {/* 1 — Country */}
            <div className="bf-section">
              <label className="bf-label">1 · Country</label>
              <div className="bf-countries">
                {COUNTRIES.map(c => (
                  <button
                    key={c.code} type="button"
                    className={`bf-country-btn${country === c.code ? ' sel' : ''}`}
                    onClick={() => { setCountry(c.code); setError(''); }}
                  >
                    <span className="bf-flag">{c.flag}</span>
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2 — Role */}
            <div className="bf-section">
              <label className="bf-label">2 · Role</label>
              <div className="bf-roles">
                {ROLES.map(r => (
                  <button
                    key={r.id} type="button"
                    className={`bf-role-btn${role === r.id ? ' sel' : ''}`}
                    onClick={() => { setRole(r.id); setError(''); }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3 — Credentials */}
            {country && role && (
              <div className="bf-section">
                <label className="bf-label">3 · Credentials</label>
                <p className="bf-hint">
                  Prefix <code>{prefix}</code> is added automatically — just type your username.
                </p>
                <input
                  className="bf-input"
                  type="text"
                  placeholder={`e.g. ${prefix}john`}
                  value={username}
                  autoFocus
                  onChange={e => setUsername(e.target.value)}
                />
                <input
                  className="bf-input"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            )}

            {error && <div className="bf-error">{error}</div>}

            <button
              type="submit"
              className="bf-btn"
              disabled={loading || !country || !role}
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>

          </form>
        </div>
      </div>
    </>
  );
}