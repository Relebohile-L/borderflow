import React, { useState, useEffect } from 'react';
import {
  getSession, api, fmt,
  Badge, Nav, Tabs, Table, Tr, Td, Card,
  Field, inputStyle, selectStyle, btnPrimary, btnSecondary,
  ErrorBox, Loading,
  PAGE, CONTENT, PAGE_TITLE, PAGE_SUB, GLOBAL_STYLE,
} from './shared';

const MILESTONE_TYPES = [
  'container_picked_up', 'departed_depot', 'arrived_at_checkpoint',
  'arrived_at_border', 'cleared_border', 'arrived_at_destination', 'handover_completed',
];

function ActiveTripsTab() {
  const [trips, setTrips]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api('/trips').then(rows => setTrips(rows.filter(t => ['scheduled', 'in_transit'].includes(t.status))))
      .catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <ErrorBox msg={error} />
      {loading ? <Loading /> : (
        <Table headers={['Trip ID', 'Vehicle', 'Route', 'Scheduled Departure', 'Actual Departure', 'Status']} empty="No active trips.">
          {trips.map(t => (
            <Tr key={t.trip_id}>
              <Td highlight bold>#{t.trip_id}</Td>
              <Td>Vehicle #{t.vehicle_id}</Td>
              <Td>Site {t.origin_site_id} → {t.destination_site_id}</Td>
              <Td muted>{fmt(t.scheduled_departure)}</Td>
              <Td muted>{fmt(t.actual_departure)}</Td>
              <Td><Badge status={t.status} /></Td>
            </Tr>
          ))}
        </Table>
      )}
    </>
  );
}

function LogMilestoneTab() {
  const { user } = getSession();
  const [trips, setTrips]         = useState([]);
  const [containers, setContainers] = useState([]);
  const [sites, setSites]         = useState([]);
  const [form, setForm]           = useState({ trip_id: '', container_id: '', site_id: '', milestone_type: '', occurred_at: '', notes: '' });
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  useEffect(() => {
    Promise.all([api('/trips'), api('/containers/all'), api('/sites')])
      .then(([t, c, s]) => {
        setTrips(t.filter(tr => ['scheduled', 'in_transit'].includes(tr.status)));
        setContainers(c); setSites(s);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async e => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!form.trip_id || !form.container_id || !form.site_id || !form.milestone_type)
      return setError('Trip, container, site and type are required.');
    setSaving(true);
    try {
      await api('/milestones', {
        method: 'POST',
        body: JSON.stringify({
          trip_id:              Number(form.trip_id),
          container_id:         Number(form.container_id),
          site_id:              Number(form.site_id),
          milestone_type:       form.milestone_type,
          occurred_at:          form.occurred_at || new Date().toISOString(),
          recorded_by_staff_id: user?.staff_id || null,
          notes:                form.notes || null,
        }),
      });
      setSuccess('Milestone logged successfully.');
      setForm({ trip_id: '', container_id: '', site_id: '', milestone_type: '', occurred_at: '', notes: '' });
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  if (loading) return <Loading />;

  return (
    <form onSubmit={submit} style={{ maxWidth: 480 }}>
      {success && <div style={{ background: '#14532d', border: '1px solid #16a34a', borderRadius: 8, padding: '10px 14px', color: '#86efac', fontSize: 13, marginBottom: 14 }}>{success}</div>}
      <ErrorBox msg={error} />

      <Field label="Trip">
        <select required value={form.trip_id} onChange={e => set('trip_id', e.target.value)} style={selectStyle}>
          <option value="" disabled>Select active trip</option>
          {trips.map(t => <option key={t.trip_id} value={t.trip_id}>Trip #{t.trip_id} — Site {t.origin_site_id}→{t.destination_site_id}</option>)}
        </select>
      </Field>

      <Field label="Container">
        <select required value={form.container_id} onChange={e => set('container_id', e.target.value)} style={selectStyle}>
          <option value="" disabled>Select container</option>
          {containers.map(c => <option key={c.container_id} value={c.container_id}>{c.iso_code} ({c.container_type})</option>)}
        </select>
      </Field>

      <Field label="Current Site">
        <select required value={form.site_id} onChange={e => set('site_id', e.target.value)} style={selectStyle}>
          <option value="" disabled>Select site</option>
          {sites.map(s => <option key={s.site_id} value={s.site_id}>{s.name} ({s.site_type})</option>)}
        </select>
      </Field>

      <Field label="Event Type">
        <select required value={form.milestone_type} onChange={e => set('milestone_type', e.target.value)} style={selectStyle}>
          <option value="" disabled>Select event</option>
          {MILESTONE_TYPES.map(m => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}
        </select>
      </Field>

      <Field label="Occurred At (leave blank for now)">
        <input type="datetime-local" value={form.occurred_at} onChange={e => set('occurred_at', e.target.value)} style={inputStyle} />
      </Field>

      <Field label="Notes">
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Any notes about this event…" />
      </Field>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="reset" onClick={() => setForm({ trip_id: '', container_id: '', site_id: '', milestone_type: '', occurred_at: '', notes: '' })} style={{ ...btnSecondary, flex: 1 }}>Clear</button>
        <button type="submit" disabled={saving} style={{ ...btnPrimary, flex: 2 }}>{saving ? 'Logging…' : 'Log Event'}</button>
      </div>
    </form>
  );
}

function ReportIncidentTab() {
  const [trips, setTrips]     = useState([]);
  const [sites, setSites]     = useState([]);
  const [form, setForm]       = useState({ trip_id: '', container_id: '', reported_by_site_id: '', incident_type: '', description: '', severity: '', occurred_at: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    Promise.all([api('/trips'), api('/sites')])
      .then(([t, s]) => { setTrips(t.filter(tr => ['scheduled', 'in_transit'].includes(tr.status))); setSites(s); })
      .catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async e => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!form.trip_id || !form.reported_by_site_id || !form.incident_type || !form.severity)
      return setError('Trip, site, type and severity are required.');
    setSaving(true);
    try {
      await api('/incidents', {
        method: 'POST',
        body: JSON.stringify({
          trip_id:              Number(form.trip_id),
          container_id:         form.container_id ? Number(form.container_id) : null,
          reported_by_site_id:  Number(form.reported_by_site_id),
          incident_type:        form.incident_type,
          description:          form.description || null,
          severity:             form.severity,
          occurred_at:          form.occurred_at || new Date().toISOString(),
        }),
      });
      setSuccess('Incident reported.');
      setForm({ trip_id: '', container_id: '', reported_by_site_id: '', incident_type: '', description: '', severity: '', occurred_at: '' });
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  if (loading) return <Loading />;

  return (
    <form onSubmit={submit} style={{ maxWidth: 480 }}>
      {success && <div style={{ background: '#14532d', border: '1px solid #16a34a', borderRadius: 8, padding: '10px 14px', color: '#86efac', fontSize: 13, marginBottom: 14 }}>{success}</div>}
      <ErrorBox msg={error} />

      <Field label="Trip">
        <select required value={form.trip_id} onChange={e => set('trip_id', e.target.value)} style={selectStyle}>
          <option value="" disabled>Select trip</option>
          {trips.map(t => <option key={t.trip_id} value={t.trip_id}>Trip #{t.trip_id}</option>)}
        </select>
      </Field>

      <Field label="Container ID (optional)">
        <input type="number" min="1" value={form.container_id} onChange={e => set('container_id', e.target.value)} style={inputStyle} placeholder="Container ID if applicable" />
      </Field>

      <Field label="Reporting Site">
        <select required value={form.reported_by_site_id} onChange={e => set('reported_by_site_id', e.target.value)} style={selectStyle}>
          <option value="" disabled>Select current site</option>
          {sites.map(s => <option key={s.site_id} value={s.site_id}>{s.name}</option>)}
        </select>
      </Field>

      <Field label="Incident Type">
        <select required value={form.incident_type} onChange={e => set('incident_type', e.target.value)} style={selectStyle}>
          <option value="" disabled>Select type</option>
          {['breakdown', 'accident', 'delay', 'seal_tampering', 'cargo_damage', 'theft', 'border_delay', 'other'].map(t => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </Field>

      <Field label="Severity">
        <select required value={form.severity} onChange={e => set('severity', e.target.value)} style={selectStyle}>
          <option value="" disabled>Select severity</option>
          {['low', 'medium', 'high', 'critical'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>

      <Field label="Description">
        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Describe what happened…" />
      </Field>

      <button type="submit" disabled={saving} style={{ ...btnPrimary, width: '100%' }}>{saving ? 'Reporting…' : 'Report Incident'}</button>
    </form>
  );
}

function HistoryTab() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api('/milestones').then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <ErrorBox msg={error} />
      {loading ? <Loading /> : (
        <Table headers={['ID', 'Trip', 'Container', 'Event', 'Site', 'Occurred']} empty="No history yet.">
          {rows.map(m => (
            <Tr key={m.milestone_id}>
              <Td highlight bold>#{m.milestone_id}</Td>
              <Td>#{m.trip_id}</Td>
              <Td>{m.container_id}</Td>
              <Td>{m.milestone_type?.replace(/_/g, ' ')}</Td>
              <Td>{m.site_id}</Td>
              <Td muted>{fmt(m.occurred_at)}</Td>
            </Tr>
          ))}
        </Table>
      )}
    </>
  );
}

const TABS = [
  { id: 'active',   label: '🚛  Active Trips' },
  { id: 'log',      label: '📝  Log Event' },
  { id: 'incident', label: '⚠️  Report Incident' },
  { id: 'history',  label: '🕓  History' },
];

export default function DriverDashboard() {
  const { user, site, role } = getSession();
  const [tab, setTab] = useState('active');

  return (
    <>
      <style>{GLOBAL_STYLE}</style>
      <div style={PAGE}>
        <Nav role={role} site={site} user={user} />
        <div style={CONTENT}>
          <div style={PAGE_TITLE}>Driver Dashboard</div>
          <div style={PAGE_SUB}>View your trips, log events and report incidents</div>
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
          <Card>
            {tab === 'active'   && <ActiveTripsTab />}
            {tab === 'log'      && <LogMilestoneTab />}
            {tab === 'incident' && <ReportIncidentTab />}
            {tab === 'history'  && <HistoryTab />}
          </Card>
        </div>
      </div>
    </>
  );
}
