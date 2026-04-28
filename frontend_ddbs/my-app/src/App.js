// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Login from './components/LoginDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './components/Unauthorized';
import DriverDashboard from './components/DriverDashboard';
import DispatcherDashboard from './components/DispatcherDashboard';
import PortAgentDashboard from './components/PortAgentDashboard';
import ManagementDashboard from './components/ManagementDashboard';
import DepotClerkDashboard from './components/DepotClerkDashboard';
import BorderAgentDashboard from './components/BorderAgentDashboard';
import CustomerTracking from './components/CustomerDashboard';
import Navbar from './components/navbar';
import './App.css';

const SIDEBAR_ROLES = new Set(['dispatcher', 'border_agent', 'port_agent', 'management']);

// ── Wifi icon ─────────────────────────────────────────────────────────────────
const WifiIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0114.08 0"/>
    <path d="M1.42 9a16 16 0 0121.16 0"/>
    <path d="M8.53 16.11a6 6 0 016.95 0"/>
    <circle cx="12" cy="20" r="1" fill="currentColor"/>
  </svg>
);

// ── Page title map ────────────────────────────────────────────────────────────
const PAGE_TITLES = {
  '/dispatcher':   'Dispatch Control Center',
  '/driver':       'Driver Portal',
  '/depot-clerk':  'Depot Clerk',
  '/border-agent': 'Border Agent',
  '/port-agent':   'Port Agent',
  '/management':   'Management Dashboard',
  '/tracking':     'Shipment Tracking',
};

const ROLE_LABELS = {
  driver:      'Truck Driver',
  depot_clerk: 'Depot Clerk',
  customer:    'Customer',
};

const initials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

// ── Content header shown beside the dark sidebar ──────────────────────────────
const ContentHeader = () => {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || 'BorderFlow';
  return (
    <header style={{
      height: '52px',
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <h1 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', margin: 0 }}>
        {title}
      </h1>
      <div style={{ display: 'flex', gap: '6px' }}>
        {['Depot', 'Border', 'Port', 'Hub'].map(badge => (
          <span key={badge} style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '4px 11px', border: '1px solid #e5e7eb', borderRadius: '20px',
            fontSize: '11px', fontWeight: '500', color: '#16a34a', background: 'white',
          }}>
            <WifiIcon /> {badge}
          </span>
        ))}
      </div>
    </header>
  );
};

// ── Minimal top bar for roles without a sidebar ───────────────────────────────
const SimpleTopBar = ({ user, onLogout }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const title = PAGE_TITLES[pathname] || 'BorderFlow';
  const roleLabel = ROLE_LABELS[user?.role] || user?.role || '';

  const handleLogout = () => { onLogout(); navigate('/login'); };

  return (
    <header style={{
      height: '60px',
      background: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Left: logo + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '34px', height: '34px', borderRadius: '8px', background: '#2563eb',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '13px', fontWeight: '800', letterSpacing: '-0.5px',
          flexShrink: 0, boxShadow: '0 0 0 1px rgba(255,255,255,0.1)',
        }}>BF</div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#f1f5f9', letterSpacing: '-0.2px' }}>
            BorderFlow
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>{title}</div>
        </div>
      </div>

      {/* Right: user info + sign-out */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#f1f5f9', fontSize: '12px', fontWeight: '700',
          }}>{initials(user?.name)}</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>{user?.name}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{roleLabel}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          padding: '7px 14px',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '7px',
          background: 'rgba(255,255,255,0.07)',
          color: '#94a3b8',
          fontSize: '13px',
          fontWeight: '500',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </div>
    </header>
  );
};

// ── Inner app (needs to be inside Router to use useLocation) ──────────────────
function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser]         = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (user) { setIsAuthenticated(true); setCurrentUser(user); }
  }, []);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('user_site');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const hasSidebar = isAuthenticated && SIDEBAR_ROLES.has(currentUser?.role);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

      {/* Dark sidebar — only for 4 roles */}
      {hasSidebar && (
        <Navbar onLogout={handleLogout} user={currentUser} />
      )}

      {/* Main content column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f1f5f9' }}>
        {hasSidebar && <ContentHeader />}
        {isAuthenticated && !hasSidebar && (
          <SimpleTopBar user={currentUser} onLogout={handleLogout} />
        )}

        <main style={{ flex: 1, overflowY: 'auto' }}>
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route path="/" element={
              isAuthenticated
                ? <Navigate to={`/${currentUser?.role === 'customer' ? 'tracking' : currentUser?.role?.replace('_', '-')}`} replace />
                : <Navigate to="/login" replace />
            } />

            <Route path="/dispatcher" element={
              <ProtectedRoute allowedRoles={['dispatcher']} allowedCountries={['SA','MOZ','MRU']}>
                <DispatcherDashboard />
              </ProtectedRoute>
            } />
            <Route path="/driver" element={
              <ProtectedRoute allowedRoles={['driver']} allowedCountries={['SA','MOZ','MRU']}>
                <DriverDashboard />
              </ProtectedRoute>
            } />
            <Route path="/depot-clerk" element={
              <ProtectedRoute allowedRoles={['depot_clerk']} allowedCountries={['SA','MOZ','MRU']}>
                <DepotClerkDashboard />
              </ProtectedRoute>
            } />
            <Route path="/border-agent" element={
              <ProtectedRoute allowedRoles={['border_agent']} allowedCountries={['SA','MOZ','MRU']}>
                <BorderAgentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/port-agent" element={
              <ProtectedRoute allowedRoles={['port_agent']} allowedCountries={['SA','MOZ','MRU']}>
                <PortAgentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/management" element={
              <ProtectedRoute allowedRoles={['management']} allowedCountries={['SA','MOZ','MRU']}>
                <ManagementDashboard />
              </ProtectedRoute>
            } />
            <Route path="/tracking" element={
              <ProtectedRoute allowedRoles={['customer']} allowedCountries={['SA','MOZ','MRU']}>
                <CustomerTracking />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
