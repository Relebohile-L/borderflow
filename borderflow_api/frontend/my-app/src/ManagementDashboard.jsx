import React, { useState, useEffect } from 'react';
import {
  getSession, api, fmt, fmtDate,
  Badge, Nav, Tabs, Table, Tr, Td, Card, KpiCard,
  ErrorBox, Loading,
  PAGE, CONTENT, PAGE_TITLE, PAGE_SUB, GLOBAL_STYLE,
} from './shared';

function OverviewTab() {
  const [trips, setTrips]         = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [clearances, setClearances] = useState([]);
  const [audit, setAudit]         = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([api('/trips'), api('/incidents'), api('/clearances'), api('/audit')])
      .then(([t, i, c, a]) => { setTrips(t); setIncidents(i); setClearances(c); setAudit(a); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const active       = trips.filter(t => ['scheduled', 'in_transit'].includes(t.status)).length;
  const openIncidents = incidents.filter(i => i.status === 'open').length;
  const criticalInc  = incidents.filter(i => ['critical', 'high'].includes(i.severity)).length;
  const pendingClear = clearances.filter(c => c.status === 'pending').length;
  const pendingSync  = audit.filter(a => a.sync_status === 'pending').length;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <KpiCard label="Total Trips"        value={trips.length}      sub={`${active} active`} />
        <KpiCard label="Open Incidents"     value={openIncidents}     sub={`${criticalInc} critical/high`} color={openIncidents > 0 ? '#f87171' : '#93c5fd'} />
        <KpiCard label="Pending Clearances" value={pendingClear}      sub="awaiting approval"  color={pendingClear > 0 ? '#fbbf24' : '#93c5fd'} />
        <KpiCard label="Pending Syncs"      value={pendingSync}       sub="in sync queue"      color={pendingSync > 0 ? '#fbbf24' : '#93c5fd'} />
        <KpiCard label="Total Incidents"    value={incidents.length}  sub="all time" />
        <KpiCard label="Clearances"         value={clearances.length} sub={`${clearances.filter(c => c.status === 'cleared').length} cleared`} />
      </div>

      <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recent Incidents</div>
      <Table headers={['ID', 'Trip', 'Type', 'Severity', 'Status', 'Occurred']} empty="No incidents.">
        {incidents.slice(0, 10).map(i => (
          <Tr key={i.incident_id}>
            <Td highlight bold>#{i.incident_id}</Td>
            <Td>#{i.trip_id}</Td>
            <Td>{i.incident_type}</Td>
            <Td><span style={{ color: i.severity === 'critical' || i.severity === 'high' ? '#f87171' : i.severity === 'medium' ? '#fbbf24' : '#94a3b8', fontWeight: 600 }}>{i.severity}</span></Td>
            <Td><Badge status={i.status} /></Td>
            <Td muted>{fmt(i.occurred_at)}</Td>
          </Tr>
        ))}
      </Table>
    </div>
  );
}

function TripsTab() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api('/trips').then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <ErrorBox msg={error} />
      {loading ? <Loading /> : (
        <Table headers={['ID', 'Driver', 'Vehicle', 'Route', 'Scheduled', 'Departed', 'Arrived', 'Status']} empty="No trips.">
          {rows.map(t => (
            <Tr key={t.trip_id}>
              <Td highlight bold>#{t.trip_id}</Td>
              <Td>#{t.driver_id}</Td>
              <Td>#{t.vehicle_id}</Td>
              <Td>Site {t.origin_site_id} → {t.destination_site_id}</Td>
              <Td muted>{fmt(t.scheduled_departure)}</Td>
              <Td muted>{fmt(t.actual_departure)}</Td>
              <Td muted>{fmt(t.actual_arrival)}</Td>
              <Td><Badge status={t.status} /></Td>
            </Tr>
          ))}
        </Table>
      )}
    </>
  );
}

function IncidentsTab() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api('/incidents').then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <ErrorBox msg={error} />
      {loading ? <Loading /> : (
        <Table headers={['ID', 'Trip', 'Container', 'Type', 'Severity', 'Description', 'Status', 'Occurred', 'Resolved']} empty="No incidents.">
          {rows.map(i => (
            <Tr key={i.incident_id}>
              <Td highlight bold>#{i.incident_id}</Td>
              <Td>#{i.trip_id}</Td>
              <Td>{i.container_id}</Td>
              <Td>{i.incident_type}</Td>
              <Td><span style={{ color: i.severity === 'critical' || i.severity === 'high' ? '#f87171' : i.severity === 'medium' ? '#fbbf24' : '#94a3b8', fontWeight: 600 }}>{i.severity}</span></Td>
              <Td muted>{i.description}</Td>
              <Td><Badge status={i.status} /></Td>
              <Td muted>{fmtDate(i.occurred_at)}</Td>
              <Td muted>{fmtDate(i.resolved_at)}</Td>
            </Tr>
          ))}
        </Table>
      )}
    </>
  );
}

function ClearancesTab() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api('/clearances').then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <ErrorBox msg={error} />
      {loading ? <Loading /> : (
        <Table headers={['ID', 'Trip', 'Container', 'Border Site', 'Reference', 'Submitted', 'Cleared', 'Status']} empty="No clearances.">
          {rows.map(c => (
            <Tr key={c.clearance_id}>
              <Td highlight bold>#{c.clearance_id}</Td>
              <Td>#{c.trip_id}</Td>
              <Td>{c.container_id}</Td>
              <Td>{c.border_site_id}</Td>
              <Td>{c.reference_number}</Td>
              <Td muted>{fmt(c.submitted_at)}</Td>
              <Td muted>{fmt(c.cleared_at)}</Td>
              <Td><Badge status={c.status} /></Td>
            </Tr>
          ))}
        </Table>
      )}
    </>
  );
}

function AuditTab() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api('/audit').then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div style={{ marginBottom: 12, fontSize: 13, color: '#64748b' }}>Immutable sync log — last 500 entries, newest first.</div>
      <ErrorBox msg={error} />
      {loading ? <Loading /> : (
        <Table headers={['Log ID', 'Site', 'Entity', 'ID', 'Operation', 'Local Time', 'Synced At', 'Status']} empty="No audit records.">
          {rows.map(r => (
            <Tr key={r.log_id}>
              <Td muted>{r.log_id?.slice(0, 8)}…</Td>
              <Td>{r.site_id}</Td>
              <Td>{r.entity_type}</Td>
              <Td>#{r.entity_id}</Td>
              <Td><span style={{ color: r.operation === 'INSERT' ? '#86efac' : r.operation === 'UPDATE' ? '#fbbf24' : '#f87171', fontWeight: 600 }}>{r.operation}</span></Td>
              <Td muted>{fmt(r.local_time)}</Td>
              <Td muted>{fmt(r.synced_at)}</Td>
              <Td><Badge status={r.sync_status} /></Td>
            </Tr>
          ))}
        </Table>
      )}
    </>
  );
}

const TABS = [
  { id: 'overview',    label: '📊  Overview' },
  { id: 'trips',       label: '🚛  Trips' },
  { id: 'incidents',   label: '⚠️  Incidents' },
  { id: 'clearances',  label: '📄  Clearances' },
  { id: 'audit',       label: '🔒  Audit Log' },
];

export default function ManagementDashboard() {
  const { user, site, role } = getSession();
  const [tab, setTab] = useState('overview');

  return (
    <>
      <style>{GLOBAL_STYLE}</style>
      <div style={PAGE}>
        <Nav role={role} site={site} user={user} />
        <div style={CONTENT}>
          <div style={PAGE_TITLE}>Management Dashboard</div>
          <div style={PAGE_SUB}>Compliance oversight, KPI monitoring and immutable audit trail</div>
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
          <Card>
            {tab === 'overview'   && <OverviewTab />}
            {tab === 'trips'      && <TripsTab />}
            {tab === 'incidents'  && <IncidentsTab />}
            {tab === 'clearances' && <ClearancesTab />}
            {tab === 'audit'      && <AuditTab />}
          </Card>
        </div>
      </div>
    </>
  );
}
