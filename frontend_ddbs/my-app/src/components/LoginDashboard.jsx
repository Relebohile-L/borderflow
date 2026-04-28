// src/components/LoginDashboard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const COUNTRIES = [
  { code: 'SA',  name: 'South Africa', flag: '🇿🇦' },
  { code: 'MOZ', name: 'Mozambique',   flag: '🇲🇿' },
  { code: 'MRU', name: 'Mauritius',    flag: '🇲🇺' },
];

const ROLES = [
  { id: 'dispatcher',   name: 'Dispatcher',    icon: '📋', desc: 'Depot Operations' },
  { id: 'driver',       name: 'Driver',         icon: '🚛', desc: 'Truck Driver' },
  { id: 'depot_clerk',  name: 'Depot Clerk',    icon: '🏭', desc: 'Yard / Depot Clerk' },
  { id: 'border_agent', name: 'Border Agent',   icon: '🛃', desc: 'Border Liaison' },
  { id: 'port_agent',   name: 'Port Agent',     icon: '⚓', desc: 'Port & Freight' },
  { id: 'management',   name: 'Management',     icon: '📊', desc: 'Management & Compliance' },
  { id: 'customer',     name: 'Customer',       icon: '📍', desc: 'Client Tracking' },
];

const ROLE_DASHBOARDS = {
  dispatcher: '/dispatcher', driver: '/driver', depot_clerk: '/depot-clerk',
  border_agent: '/border-agent', port_agent: '/port-agent',
  management: '/management', customer: '/tracking',
};

// Maps frontend role names to what the backend expects
const ROLE_TO_BACKEND = { management: 'manager', customer: 'client' };
// Maps backend role names back to frontend role keys
const ROLE_FROM_BACKEND = { manager: 'management', client: 'customer' };

// Maps selected country code to the required username prefix
const PREFIX_MAP = { SA: 'sa_', MOZ: 'moz_', MRU: 'mru_', CONTROL: 'control_' };

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [selectedRole,    setSelectedRole]    = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!selectedRole || !selectedCountry) { setError('Please select a country and role'); return; }
    setLoading(true);
    setError('');

    try {
      const backendRole = ROLE_TO_BACKEND[selectedRole] || selectedRole;

      // ── FIX: auto-prefix username based on selected country ──────────────
      // The api.js routes requests by reading the username prefix (sa_, moz_, mru_).
      // If the user just types "john" and selects Mauritius, we prepend "mru_"
      // so it becomes "mru_john" — matching what the backend expects.
      const prefix = PREFIX_MAP[selectedCountry];
      const rawUsername = credentials.username.trim();
      const username = rawUsername.toLowerCase().startsWith(prefix)
        ? rawUsername          // already has the correct prefix
        : prefix + rawUsername; // prepend it
      // ─────────────────────────────────────────────────────────────────────

      const result = await api.login(username, credentials.password, backendRole);

      const { site, role: apiRole, user } = result;
      const frontendRole = ROLE_FROM_BACKEND[apiRole] || apiRole;
      const name = user.first_name
        ? `${user.first_name} ${user.last_name}`
        : user.company_name || user.contact_name || username;

      const userData = {
        id: user.staff_id || user.client_id,
        username,
        name,
        role: frontendRole,
        roleName: ROLES.find(r => r.id === frontendRole)?.name,
        country: site,
        countryName: COUNTRIES.find(c => c.code === site)?.name,
        loginTime: new Date().toISOString(),
        ...(frontendRole === 'driver' && { driverId: user.staff_id }),
      };

      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('user_site', site);
      localStorage.setItem('user_role', frontendRole);
      localStorage.setItem('user_name', name);
      if (onLogin) onLogin(userData);
      navigate(ROLE_DASHBOARDS[frontendRole]);
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  // styles
  const lp = { // left panel
    width: '38%', minWidth: '320px',
    background: 'linear-gradient(150deg, #0f172a 0%, #1e3a8a 55%, #2563eb 100%)',
    display: 'flex', flexDirection: 'column', justifyContent: 'center',
    padding: '60px 52px', color: 'white', flexShrink: 0,
  };
  const countryBtn = (active) => ({
    flex: 1, padding: '12px 8px', borderRadius: '10px', cursor: 'pointer',
    border: active ? '2px solid #2563eb' : '2px solid #e5e7eb',
    background: active ? '#eff6ff' : 'white',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
    transition: 'all 0.15s',
  });
  const roleBtn = (active) => ({
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
    border: active ? '2px solid #2563eb' : '2px solid #e5e7eb',
    background: active ? '#eff6ff' : 'white',
    textAlign: 'left', transition: 'all 0.15s',
  });
  const inputStyle = {
    width: '100%', padding: '12px 16px', border: '1.5px solid #e5e7eb',
    borderRadius: '10px', fontSize: '15px', color: '#111827',
    boxSizing: 'border-box', outline: 'none', background: '#fafafa',
  };
  const labelStyle = {
    display: 'block', fontSize: '13px', fontWeight: '600',
    color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em',
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', overflow: 'hidden' }}>

      {/* ── Left branding panel ── */}
      <div style={lp}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '52px' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '14px', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0 }}>
            📦
          </div>
          <div>
            <div style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>BorderFlow</div>
            <div style={{ fontSize: '13px', opacity: 0.6 }}>Logistics Management</div>
          </div>
        </div>

        <h2 style={{ fontSize: '30px', fontWeight: '700', lineHeight: 1.25, marginBottom: '16px', letterSpacing: '-0.3px' }}>
          Cross-Border Container Logistics
        </h2>
        <p style={{ fontSize: '16px', opacity: 0.75, marginBottom: '44px', lineHeight: 1.65 }}>
          Real-time tracking, multi-country operations and complete audit trails — all in one platform.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {[
            { icon: '🗺️', text: 'SA · Mozambique · Mauritius' },
            { icon: '📍', text: 'Real-time container tracking' },
            { icon: '🛃', text: 'Border clearance management' },
            { icon: '📋', text: 'Immutable audit trail' },
          ].map(f => (
            <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '20px' }}>{f.icon}</span>
              <span style={{ fontSize: '15px', opacity: 0.85 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ flex: 1, background: '#f8fafc', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px' }}>
          <div style={{ width: '100%', maxWidth: '520px' }}>
            <h1 style={{ fontSize: '30px', fontWeight: '700', color: '#111827', margin: '0 0 6px 0' }}>Welcome back</h1>
            <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 36px 0' }}>Sign in to your BorderFlow account</p>

            <form onSubmit={handleLogin}>
              {/* Country */}
              <div style={{ marginBottom: '28px' }}>
                <label style={labelStyle}>1 · Select Country</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {COUNTRIES.map(c => (
                    <button key={c.code} type="button"
                      style={countryBtn(selectedCountry === c.code)}
                      onClick={() => { setSelectedCountry(c.code); setError(''); }}>
                      <span style={{ fontSize: '26px' }}>{c.flag}</span>
                      <span style={{ fontSize: '13px', fontWeight: selectedCountry === c.code ? '600' : '400', color: selectedCountry === c.code ? '#2563eb' : '#374151' }}>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Role */}
              <div style={{ marginBottom: '28px' }}>
                <label style={labelStyle}>2 · Select Role</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {ROLES.map(role => (
                    <button key={role.id} type="button"
                      style={roleBtn(selectedRole === role.id)}
                      onClick={() => { setSelectedRole(role.id); setError(''); }}>
                      <span style={{ fontSize: '20px' }}>{role.icon}</span>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: selectedRole === role.id ? '#2563eb' : '#111827' }}>{role.name}</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>{role.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Credentials — shown only when role + country selected */}
              {selectedRole && selectedCountry && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={labelStyle}>3 · Credentials</label>
                  {/* Helper text showing what prefix will be applied */}
                  <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 10px 0' }}>
                    Username will be prefixed with <code style={{ background: '#f3f4f6', padding: '1px 5px', borderRadius: '4px' }}>{PREFIX_MAP[selectedCountry]}</code> automatically if not already included.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input style={inputStyle} type="text" placeholder={`Username (e.g. ${PREFIX_MAP[selectedCountry]}john)`}
                      value={credentials.username}
                      onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                      required autoFocus />
                    <input style={inputStyle} type="password" placeholder="Password"
                      value={credentials.password}
                      onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                      required />
                  </div>
                </div>
              )}

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', fontSize: '14px', color: '#dc2626', marginBottom: '16px' }}>
                  {error}
                </div>
              )}

              <button type="submit"
                disabled={loading || !selectedRole || !selectedCountry}
                style={{
                  width: '100%', padding: '14px', border: 'none', borderRadius: '10px',
                  background: loading || !selectedRole || !selectedCountry ? '#d1d5db' : '#2563eb',
                  color: 'white', fontSize: '16px', fontWeight: '700', cursor: loading || !selectedRole || !selectedCountry ? 'not-allowed' : 'pointer',
                  marginBottom: '20px', transition: 'background 0.15s',
                }}>
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>
            </form>

            {/* Demo credentials toggle */}
            <button onClick={() => setShowDemo(v => !v)}
              style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '13px', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
              {showDemo ? 'Hide' : 'Show'} demo credentials
            </button>

            {showDemo && (
              <div style={{ marginTop: '14px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px 18px', fontSize: '13px', lineHeight: 1.7 }}>
                <strong style={{ display: 'block', marginBottom: '4px', color: '#111827' }}>Backend credentials (must match your DB seed)</strong>
                <div style={{ color: '#6b7280', marginBottom: '10px' }}>
                  Username prefix is added automatically based on selected country:
                  {' '}<code style={{ background: '#f3f4f6', padding: '1px 5px', borderRadius: '4px' }}>sa_</code>
                  {' '}<code style={{ background: '#f3f4f6', padding: '1px 5px', borderRadius: '4px' }}>moz_</code>
                  {' '}<code style={{ background: '#f3f4f6', padding: '1px 5px', borderRadius: '4px' }}>mru_</code>
                </div>
                {[
                  { country: 'South Africa (SA)', roles: ['dispatcher','driver','depot_clerk','border_agent','port_agent','manager'] },
                  { country: 'Mozambique (MOZ)', roles: ['dispatcher','driver','depot_clerk','border_agent','port_agent','manager'] },
                  { country: 'Mauritius (MRU)', roles: ['dispatcher','driver','depot_clerk','border_agent','port_agent','manager'] },
                ].map(({ country, roles }) => (
                  <div key={country} style={{ marginBottom: '10px' }}>
                    <div style={{ fontWeight: '600', color: '#374151' }}>{country}</div>
                    <div style={{ color: '#6b7280' }}>Roles (staff table): {roles.map(r => (
                      <code key={r} style={{ background: '#f3f4f6', padding: '1px 5px', borderRadius: '4px', marginRight: '4px', display: 'inline-block' }}>{r}</code>
                    ))}</div>
                    <div style={{ color: '#6b7280' }}>Client login: role = <code style={{ background: '#f3f4f6', padding: '1px 5px', borderRadius: '4px' }}>customer</code> (queries client table)</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
