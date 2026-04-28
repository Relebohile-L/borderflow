import React from 'react';
import LoginDashboard     from './Logindashboard';
import DispatcherDashboard from './DispatcherDashboard';
import DriverDashboard    from './DriverDashboard';
import PortAgentDashboard from './PortAgentDashboard';
import ManagementDashboard from './ManagementDashboard';
import DepotClerkDashboard from './DepotClerkDashboard';
import BorderAgentDashboard from './BorderAgentDashboard';
import ClientDashboard    from './ClientDashboard';

const ROUTES = {
  '/dispatcher':   <DispatcherDashboard />,
  '/driver':       <DriverDashboard />,
  '/port-agent':   <PortAgentDashboard />,
  '/management':   <ManagementDashboard />,
  '/depot-clerk':  <DepotClerkDashboard />,
  '/border-agent': <BorderAgentDashboard />,
  '/tracking':     <ClientDashboard />,
};

export default function App() {
  const path = window.location.pathname;
  return ROUTES[path] ?? <LoginDashboard />;
}
