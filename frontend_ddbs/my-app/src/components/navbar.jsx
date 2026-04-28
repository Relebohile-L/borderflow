// src/components/navbar.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// ── SVG outline icons (18 × 18, stroke-only) ─────────────────────────────────
const Ico = ({ children }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const GridIcon     = () => <Ico><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></Ico>;
const PlusIcon     = () => <Ico><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Ico>;
const TruckIcon    = () => <Ico><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16,8 20,8 23,11 23,16 16,16 16,8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></Ico>;
const UsersIcon    = () => <Ico><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Ico>;
const BoxIcon      = () => <Ico><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></Ico>;
const ListIcon     = () => <Ico><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></Ico>;
const UploadIcon   = () => <Ico><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></Ico>;
const ArrowsIcon   = () => <Ico><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></Ico>;
const ClockIcon    = () => <Ico><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Ico>;
const AnchorIcon   = () => <Ico><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></Ico>;
const ChartIcon    = () => <Ico><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></Ico>;
const AlertIcon    = () => <Ico><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></Ico>;
const DownloadIcon = () => <Ico><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></Ico>;
const LogoutIcon   = () => <Ico><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Ico>;
const WifiIcon     = () => <Ico><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/></Ico>;

// ── Role-specific nav items ───────────────────────────────────────────────────
const ROLE_PATHS = {
  dispatcher:   '/dispatcher',
  border_agent: '/border-agent',
  port_agent:   '/port-agent',
  management:   '/management',
};

const ROLE_NAV = {
  dispatcher: [
    { label: 'Dashboard',          Icon: GridIcon,     action: null },
    { label: 'New Assignment',     Icon: PlusIcon,     action: 'new-assignment', primary: true },
    { label: 'Active Shipments',   Icon: TruckIcon,    action: 'scroll-trips' },
    { label: 'Drivers',            Icon: UsersIcon,    action: 'scroll-drivers' },
    { label: 'Containers & Fleet', Icon: BoxIcon,      action: 'scroll-containers' },
  ],
  border_agent: [
    { label: 'Consignments',       Icon: ListIcon,     action: null },
    { label: 'Upload Documents',   Icon: UploadIcon,   action: 'upload-docs' },
    { label: 'Record Handover',    Icon: ArrowsIcon,   action: 'handover' },
    { label: 'Log Delay',          Icon: ClockIcon,    action: 'log-delay' },
  ],
  port_agent: [
    { label: 'Consignments',       Icon: AnchorIcon,   action: null },
    { label: 'Upload Documents',   Icon: UploadIcon,   action: 'upload-docs' },
  ],
  management: [
    { label: 'Overview',           Icon: ChartIcon,    action: null },
    { label: 'Shipments',          Icon: TruckIcon,    action: 'scroll-shipments' },
    { label: 'Incidents',          Icon: AlertIcon,    action: 'scroll-incidents' },
    { label: 'Audit Trail',        Icon: ListIcon,     action: 'scroll-audit' },
    { label: 'Export Report',      Icon: DownloadIcon, action: 'export', primary: true },
  ],
};

const ROLE_LABELS = {
  dispatcher:   'Dispatcher',
  border_agent: 'Border Agent',
  port_agent:   'Port Agent',
  management:   'Management',
};

// ── Dark sidebar styles ───────────────────────────────────────────────────────
const BG        = '#0f172a';
const BG_ACTIVE = 'rgba(59,130,246,0.18)';
const DIVIDER   = 'rgba(255,255,255,0.08)';
const TEXT_DIM  = '#64748b';
const TEXT_MID  = '#94a3b8';
const TEXT_BRIGHT = '#f1f5f9';

const s = {
  sidebar: {
    width: '252px',
    minWidth: '252px',
    height: '100vh',
    background: BG,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflow: 'hidden',
    flexShrink: 0,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '22px 20px 18px',
    borderBottom: `1px solid ${DIVIDER}`,
  },
  logo: {
    width: '36px',
    height: '36px',
    borderRadius: '9px',
    background: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '14px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    flexShrink: 0,
    boxShadow: '0 0 0 1px rgba(255,255,255,0.1)',
  },
  brandName: { fontSize: '17px', fontWeight: '700', color: TEXT_BRIGHT, letterSpacing: '-0.2px' },
  brandSub:  { fontSize: '11px', color: TEXT_DIM, marginTop: '1px' },

  userSection: {
    padding: '16px 20px',
    borderBottom: `1px solid ${DIVIDER}`,
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: TEXT_BRIGHT,
    fontSize: '14px',
    fontWeight: '700',
    flexShrink: 0,
  },
  userName:   { fontSize: '14px', fontWeight: '600', color: TEXT_BRIGHT, lineHeight: 1.3 },
  userNode:   { fontSize: '11px', color: TEXT_DIM, marginTop: '1px' },
  signOutBtn: {
    width: '100%',
    padding: '9px 14px',
    border: `1px solid rgba(255,255,255,0.1)`,
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.06)',
    color: TEXT_MID,
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '10px',
    transition: 'background 0.15s',
  },
  connectionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: TEXT_DIM,
  },
  onlineBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '3px 10px',
    borderRadius: '20px',
    background: 'rgba(34,197,94,0.15)',
    border: '1px solid rgba(34,197,94,0.3)',
    color: '#4ade80',
    fontSize: '12px',
    fontWeight: '500',
  },
  onlineDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#4ade80',
    boxShadow: '0 0 6px #4ade80',
  },

  nav: {
    flex: 1,
    overflowY: 'auto',
    padding: '14px 12px',
  },
  sectionLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: TEXT_DIM,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    padding: '0 10px',
    marginBottom: '8px',
    marginTop: '4px',
  },
  navBtn: (active, primary) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: active ? '600' : '400',
    color: primary ? '#fff' : active ? TEXT_BRIGHT : TEXT_MID,
    background: primary ? '#2563eb' : active ? BG_ACTIVE : 'transparent',
    marginBottom: '2px',
    border: active && !primary ? `1px solid rgba(59,130,246,0.25)` : '1px solid transparent',
    borderLeft: active && !primary ? '3px solid #3b82f6' : primary ? 'none' : '3px solid transparent',
    width: '100%',
    textAlign: 'left',
    transition: 'background 0.12s, color 0.12s',
    boxSizing: 'border-box',
  }),
  navIconWrap: {
    flexShrink: 0,
    width: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.85,
  },
};

const initials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

const Navbar = ({ onLogout, user }) => {
  const location = useLocation();
  const navigate  = useNavigate();

  const role     = user?.role;
  const rolePath = ROLE_PATHS[role] || '/';
  const navItems = ROLE_NAV[role] || [];

  const countryNodeLabel = {
    SA: 'South Africa Node', MOZ: 'Mozambique Node', MRU: 'Mauritius Node',
  }[user?.country] || user?.countryName || '';

  const isActive = (item) => {
    if (item.action === null) {
      return location.pathname === rolePath && !location.search.includes('action=');
    }
    return location.search.includes(`action=${item.action}`);
  };

  const handleClick = (item) => {
    if (item.action) navigate(`${rolePath}?action=${item.action}`);
    else navigate(rolePath);
  };

  const handleLogout = () => { onLogout(); navigate('/login'); };

  return (
    <aside style={s.sidebar}>
      {/* Brand */}
      <div style={s.brand}>
        <div style={s.logo}>BF</div>
        <div>
          <div style={s.brandName}>BorderFlow</div>
          <div style={s.brandSub}>Cross-Border Logistics</div>
        </div>
      </div>

      {/* User section */}
      <div style={s.userSection}>
        <div style={s.userRow}>
          <div style={s.avatar}>{initials(user?.name)}</div>
          <div>
            <div style={s.userName}>{ROLE_LABELS[role] || user?.roleName}</div>
            <div style={s.userNode}>{countryNodeLabel}</div>
          </div>
        </div>
        <button style={s.signOutBtn} onClick={handleLogout}>
          <LogoutIcon /> Sign Out
        </button>
        <div style={s.connectionRow}>
          Connection:
          <span style={s.onlineBadge}>
            <WifiIcon />
            Online
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={s.nav}>
        <div style={s.sectionLabel}>Navigation</div>
        {navItems.map((item, idx) => {
          const active = isActive(item);
          return (
            <button
              key={idx}
              style={s.navBtn(active, !!item.primary)}
              onClick={() => handleClick(item)}
            >
              <span style={{ ...s.navIconWrap, opacity: active || item.primary ? 1 : 0.6 }}>
                <item.Icon />
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Navbar;
