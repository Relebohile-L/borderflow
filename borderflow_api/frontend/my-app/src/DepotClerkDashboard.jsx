import React, { useState, useEffect } from 'react';
import {
  getSession, api, fmt,
  Badge, Nav, Tabs, Table, Tr, Td, Card,
  Field, inputStyle, selectStyle, btnPrimary, btnSecondary,
  ErrorBox, Loading,
  PAGE, CONTENT, PAGE_TITLE, PAGE_SUB, GLOBAL_STYLE,
} from './shared';

const GATE_EVENTS = [
  'gate_in', 'gate_out', 'seal_verified', 'seal_broken',
  'inspection_passed', 'inspection_failed', 'storage_assigned',
];

function ContainersTab() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api('/containers/all').then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <ErrorBox msg={error} />
      {loading ? <Loading /> : (
        <Table headers={['ID', 'ISO Code', 'Type', 'Tare (kg)', 'Seal Number', 'Status']} empty="No containers found.">
          {rows.map(c => (
            <Tr key={c.container_id}>
              <Td highlight bold>#{c.container_id}</Td>
              <Td bold>{c.iso_code}</Td>
              <Td>{c.container_type}</Td>
              <Td>{c.tare_weight_kg}</Td>
              <Td>{c.seal_number}</Td>
              <Td><Badge status={c.status} /></Td>
            </Tr>
          ))}
        </Table>
      )}
    </>
  );
}

function LogGateEventTab() {
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
        setTrips(t); setContainers(c);
        setSites(s.filter(x => x.site_type === 'depot'));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async e => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!form.trip_id || !form.container_id || !form.site_id || !form.milestone_type)
      return setError('Trip, container, depot and event type are required.');
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
      setSuccess(`Gate event "${form.milestone_type.replace(/_/g, ' ')}" recorded successfully.`);
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
          <option value="" disabled>Select trip</option>
          {trips.map(t => <option key={t.trip_id} value={t.trip_id}>Trip #{t.trip_id} — {t.status}</option>)}
        </select>
      </Field>

      <Field label="Container">
        <select required value={form.container_id} onChange={e => set('container_id', e.target.value)} style={selectStyle}>
          <option value="" disabled>Select container</option>
          {containers.map(c => <option key={c.container_id} value={c.container_id}>{c.iso_code} — {c.container_type} — Seal: {c.seal_number || 'N/A'}</option>)}
        </select>
      </Field>

      <Field label="Depot Site">
        <select required value={form.site_id} onChange={e => set('site_id', e.target.value)} style={selectStyle}>
          <option value="" disabled>Select depot</option>
          {sites.map(s => <option key={s.site_id} value={s.site_id}>{s.name}</option>)}
        </select>
      </Field>

      <Field label="Gate Event">
        <select required value={form.milestone_type} onChange={e => set('milestone_type', e.target.value)} style={selectStyle}>
          <option value="" disabled>Select event</option>
          {GATE_EVENTS.map(g => <option key={g} value={g}>{g.replace(/_/g, ' ')}</option>)}
        </select>
      </Field>

      <Field label="Event Time">
        <input type="datetime-local" value={form.occurred_at} onChange={e => set('occurred_at', e.target.value)} style={inputStyle} />
      </Field>

      <Field label="Notes (seal number, condition, storage location…)">
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="e.g. Seal #MRU-4421, condition OK, assigned bay B3…" />
      </Field>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="reset" style={{ ...btnSecondary, flex: 1 }}>Clear</button>
        <button type="submit" disabled={saving} style={{ ...btnPrimary, flex: 2 }}>{saving ? 'Recording…' : 'Record Event'}</button>
      </div>
    </form>
  );
}

function GateHistoryTab() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api('/milestones').then(rows => setRows(rows.filter(m => GATE_EVENTS.includes(m.milestone_type))))
      .catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <ErrorBox msg={error} />
      {loading ? <Loading /> : (
        <Table headers={['ID', 'Trip', 'Container', 'Site', 'Event', 'Recorded', 'Notes']} empty="No gate events recorded.">
          {rows.map(m => (
            <Tr key={m.milestone_id}>
              <Td highlight bold>#{m.milestone_id}</Td>
              <Td>#{m.trip_id}</Td>
              <Td>{m.container_id}</Td>
              <Td>{m.site_id}</Td>
              <Td>{m.milestone_type?.replace(/_/g, ' ')}</Td>
              <Td muted>{fmt(m.occurred_at)}</Td>
              <Td muted>{m.notes}</Td>
            </Tr>
          ))}
        </Table>
      )}
    </>
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
      .then(([t, s]) => { setTrips(t); setSites(s); })
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
          trip_id:             Number(form.trip_id),
          container_id:        form.container_id ? Number(form.container_id) : null,
          reported_by_site_id: Number(form.reported_by_site_id),
          incident_type:       form.incident_type,
          description:         form.description || null,
          severity:            form.severity,
          occurred_at:         form.occurred_at || new Date().toISOString(),
        }),
      });
      setSuccess('Incident reported and alert sent.');
      setForm({ trip_id: '', container_id: '', reported_by_site_id: '', incident_type: '', description: '', severity: '', occurred_at: '' });
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  if (loading) return <Loading />;

  return (
    <form onSubmit={submit} style={{ maxWidth: 480 }}>
      {success && <div style={{ background: '#14532d', border: '1px solid #16a34a', borderRadius: 8, padding: '10px 14px', color: '#86efac', fontSize: 13, marginBottom: 14 }}>{success}</div>}
      <ErrorBox msg={error} />

      <Field label="Trip"><select required value={form.trip_id} onChange={e => set('trip_id', e.target.value)} style={selectStyle}>
        <option value="" disabled>Select trip</option>
        {trips.map(t => <option key={t.trip_id} value={t.trip_id}>Trip #{t.trip_id}</option>)}
      </select></Field>

      <Field label="Container ID (if applicable)">
        <input type="number" min="1" value={form.container_id} onChange={e => set('container_id', e.target.value)} style={inputStyle} placeholder="Container ID" />
      </Field>

      <Field label="Reporting Depot"><select required value={form.reported_by_site_id} onChange={e => set('reported_by_site_id', e.target.value)} style={selectStyle}>
        <option value="" disabled>Select depot</option>
        {sites.map(s => <option key={s.site_id} value={s.site_id}>{s.name}</option>)}
      </select></Field>

      <Field label="Incident Type"><select required value={form.incident_type} onChange={e => set('incident_type', e.target.value)} style={selectStyle}>
        <option value="" disabled>Select type</option>
        {['damaged_seal', 'damaged_container', 'missing_cargo', 'wrong_container', 'access_breach', 'other'].map(t => (
          <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
        ))}
      </select></Field>

      <Field label="Severity"><select required value={form.severity} onChange={e => set('severity', e.target.value)} style={selectStyle}>
        <option value="" disabled>Select severity</option>
        {['low', 'medium', 'high', 'critical'].map(s => <option key={s} value={s}>{s}</option>)}
      </select></Field>

      <Field label="Description">
        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Describe the issue…" />
      </Field>

      <button type="submit" disabled={saving} style={{ ...btnPrimary, width: '100%' }}>{saving ? 'Reporting…' : 'Report Incident'}</button>
    </form>
  );
}

const TABS = [
  { id: 'containers', label: '📦  Containers' },
  { id: 'gate',       label: '🚪  Log Gate Event' },
  { id: 'history',    label: '🕓  Gate History' },
  { id: 'incident',   label: '⚠️  Report Incident' },
];

export default function DepotClerkDashboard() {
  const { user, site, role } = getSession();
  const [tab, setTab] = useState('containers');

  return (
    <>
      <style>{GLOBAL_STYLE}</style>
      <div style={PAGE}>
        <Nav role={role} site={site} user={user} />
        <div style={CONTENT}>
          <div style={PAGE_TITLE}>Depot Clerk Dashboard</div>
          <div style={PAGE_SUB}>Record gate-in/out events, verify seals and manage container yard</div>
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
          <Card>
            {tab === 'containers' && <ContainersTab />}
            {tab === 'gate'       && <LogGateEventTab />}
            {tab === 'history'    && <GateHistoryTab />}
            {tab === 'incident'   && <ReportIncidentTab />}
          </Card>
        </div>
      </div>
    </>
  );
}
