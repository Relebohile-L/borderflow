import React from 'react';

export function getSession() {
  try {
    return {
      user: JSON.parse(localStorage.getItem('currentUser') || 'null'),
      site: localStorage.getItem('user_site') || '',
      role: localStorage.getItem('user_role') || '',
    };
  } catch {
    return { user: null, site: '', role: '' };
  }
}

export function logout() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('user_site');
  localStorage.removeItem('user_role');
  window.location.href = '/';
}

export async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { error: text }; }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export function fmt(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString();
}

export function fmtDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString();
}

const STATUS_COLORS = {
  scheduled:    { bg: '#172554', text: '#93c5fd', border: '#1d4ed8' },
  in_transit:   { bg: '#14532d', text: '#86efac', border: '#16a34a' },
  in_use:       { bg: '#14532d', text: '#86efac', border: '#16a34a' },
  completed:    { bg: '#1c1917', text: '#a8a29e', border: '#44403c' },
  delivered:    { bg: '#1c1917', text: '#86efac', border: '#16a34a' },
  cancelled:    { bg: '#1c0a0a', text: '#fca5a5', border: '#7f1d1d' },
  open:         { bg: '#1c0a0a', text: '#fca5a5', border: '#7f1d1d' },
  resolved:     { bg: '#14532d', text: '#86efac', border: '#16a34a' },
  closed:       { bg: '#1c1917', text: '#a8a29e', border: '#44403c' },
  investigating:{ bg: '#1c1a0a', text: '#fde68a', border: '#92400e' },
  pending:      { bg: '#1c1a0a', text: '#fde68a', border: '#92400e' },
  cleared:      { bg: '#14532d', text: '#86efac', border: '#16a34a' },
  rejected:     { bg: '#1c0a0a', text: '#fca5a5', border: '#7f1d1d' },
  available:    { bg: '#14532d', text: '#86efac', border: '#16a34a' },
  empty:        { bg: '#172554', text: '#93c5fd', border: '#1d4ed8' },
  loaded:       { bg: '#1c1a0a', text: '#fde68a', border: '#92400e' },
  damaged:      { bg: '#1c0a0a', text: '#fca5a5', border: '#7f1d1d' },
  intact:       { bg: '#14532d', text: '#86efac', border: '#16a34a' },
  broken:       { bg: '#1c0a0a', text: '#fca5a5', border: '#7f1d1d' },
  active:       { bg: '#14532d', text: '#86efac', border: '#16a34a' },
  inactive:     { bg: '#1c1917', text: '#a8a29e', border: '#44403c' },
  maintenance:  { bg: '#1c1a0a', text: '#fde68a', border: '#92400e' },
};

export function Badge({ status }) {
  const s = STATUS_COLORS[status] || { bg: '#1a2540', text: '#94a3b8', border: '#334155' };
  return (
    <span style={{
      background: s.bg, color: s.text, border: `1px solid ${s.border}`,
      borderRadius: 5, padding: '2px 8px', fontSize: 11, fontWeight: 600,
      textTransform: 'capitalize', whiteSpace: 'nowrap',
      display: 'inline-block',
    }}>
      {String(status ?? '—').replace(/_/g, ' ')}
    </span>
  );
}

const ROLE_LABELS = {
  dispatcher:   'Dispatcher',
  driver:       'Driver',
  port_agent:   'Port Agent',
  manager:      'Management',
  depot_clerk:  'Depot Clerk',
  border_agent: 'Border Agent',
  client:       'Customer',
};

export function Nav({ role, site, user }) {
  return (
    <nav style={{
      background: '#0a1020', borderBottom: '1px solid #1a2540',
      padding: '0 24px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', height: 56,
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, background: '#1d4ed8', borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
        }}>📦</div>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: '#f1f5f9' }}>BorderFlow</span>
        <span style={{ color: '#1a2540' }}>|</span>
        <span style={{ fontSize: 13, color: '#64748b' }}>{ROLE_LABELS[role] || role}</span>
        {site && (
          <span style={{
            background: '#172554', color: '#93c5fd', border: '1px solid #1d4ed8',
            borderRadius: 5, padding: '2px 8px', fontSize: 11, fontWeight: 600,
          }}>{site}</span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {user && (
          <span style={{ fontSize: 13, color: '#64748b' }}>
            {user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.username}
          </span>
        )}
        <button
          onClick={logout}
          style={{
            background: 'none', border: '1px solid #1a2540', borderRadius: 7,
            color: '#64748b', fontSize: 12, padding: '5px 12px',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >Sign out</button>
      </div>
    </nav>
  );
}

export const inputStyle = {
  display: 'block', width: '100%', padding: '10px 12px',
  background: '#0a1020', border: '1.5px solid #1a2540', borderRadius: 9,
  color: '#e2e8f0', fontSize: 14, fontFamily: 'inherit', outline: 'none',
  boxSizing: 'border-box',
};

export const selectStyle = {
  ...inputStyle,
  cursor: 'pointer', appearance: 'none',
};

export const btnPrimary = {
  padding: '11px 20px', background: '#2563eb', border: 'none',
  borderRadius: 9, color: '#fff', fontSize: 14, fontWeight: 600,
  fontFamily: 'inherit', cursor: 'pointer',
};

export const btnSecondary = {
  padding: '11px 20px', background: '#0a1020', border: '1.5px solid #1a2540',
  borderRadius: 9, color: '#64748b', fontSize: 14, fontWeight: 600,
  fontFamily: 'inherit', cursor: 'pointer',
};

export const thStyle = {
  padding: '10px 14px', textAlign: 'left', fontSize: 10.5,
  fontWeight: 600, color: '#475569', textTransform: 'uppercase',
  letterSpacing: '0.08em', borderBottom: '1px solid #1a2540', whiteSpace: 'nowrap',
};

export const tdStyle = {
  padding: '11px 14px', fontSize: 13, color: '#cbd5e1',
  borderBottom: '1px solid #111827', verticalAlign: 'middle',
};

export function ErrorBox({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      background: '#1c0a0a', border: '1px solid #7f1d1d', borderRadius: 8,
      padding: '10px 14px', color: '#fca5a5', fontSize: 13, marginBottom: 14,
    }}>{msg}</div>
  );
}

export function Loading() {
  return <div style={{ color: '#475569', textAlign: 'center', padding: 48 }}>Loading…</div>;
}

export function Empty({ msg = 'No records found.' }) {
  return <div style={{ color: '#475569', textAlign: 'center', padding: 48 }}>{msg}</div>;
}

export function Label({ children }) {
  return (
    <label style={{
      display: 'block', fontSize: 10.5, fontWeight: 600, color: '#475569',
      textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6,
    }}>{children}</label>
  );
}

export function Field({ label, children, mb = 14 }) {
  return (
    <div style={{ marginBottom: mb }}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function Card({ children, style }) {
  return (
    <div style={{
      background: '#0f1623', border: '1px solid #1a2540', borderRadius: 14,
      padding: 24, ...style,
    }}>{children}</div>
  );
}

export function KpiCard({ label, value, sub, color = '#93c5fd' }) {
  return (
    <div style={{
      background: '#0f1623', border: '1px solid #1a2540', borderRadius: 12,
      padding: '20px 24px',
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color, fontFamily: 'Syne, sans-serif' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #1a2540', marginBottom: 24 }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            background: 'none', border: 'none',
            borderBottom: active === t.id ? '2px solid #2563eb' : '2px solid transparent',
            color: active === t.id ? '#93c5fd' : '#475569',
            padding: '10px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            fontFamily: 'inherit', marginBottom: -1, transition: 'color 0.1s',
          }}
        >{t.label}</button>
      ))}
    </div>
  );
}

export function Table({ headers, children, empty }) {
  return children && React.Children.count(children) > 0 ? (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>{headers.map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  ) : <Empty msg={empty} />;
}

export function Tr({ children, onClick }) {
  return (
    <tr
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onMouseEnter={e => e.currentTarget.style.background = '#111827'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >{children}</tr>
  );
}

export function Td({ children, highlight, muted, bold }) {
  return (
    <td style={{
      ...tdStyle,
      color: highlight ? '#60a5fa' : muted ? '#475569' : '#cbd5e1',
      fontWeight: bold ? 700 : 400,
    }}>{children ?? '—'}</td>
  );
}

export const PAGE = {
  minHeight: '100vh',
  background: '#080d1a',
  fontFamily: "'DM Sans', sans-serif",
  color: '#e2e8f0',
};

export const CONTENT = {
  padding: '24px 24px 48px',
  maxWidth: 1200,
  margin: '0 auto',
};

export const PAGE_TITLE = {
  fontFamily: 'Syne, sans-serif',
  fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 4,
};

export const PAGE_SUB = {
  fontSize: 13, color: '#64748b', marginBottom: 28,
};

export const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080d1a; font-family: 'DM Sans', sans-serif; color: #e2e8f0; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #0a1020; }
  ::-webkit-scrollbar-thumb { background: #1a2540; border-radius: 3px; }
  select option { background: #0f1623; color: #e2e8f0; }
`;
