import React, { useState, useEffect } from 'react';
import {
  getSession, api, fmt,
  Badge, Nav, Tabs, Table, Tr, Td, Card,
  Field, inputStyle, selectStyle, btnPrimary, btnSecondary,
  ErrorBox, Loading,
  PAGE, CONTENT, PAGE_TITLE, PAGE_SUB, GLOBAL_STYLE,
} from './shared';

const PORT_MILESTONE_TYPES = [
  'gate_in_port', 'customs_inspection', 'documentation_submitted',
  'loaded_on_vessel', 'vessel_departed', 'vessel_arrived', 'released_to_consignee',
];

function MilestonesTab() {
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
        <Table headers={['ID', 'Trip', 'Container', 'Site', 'Type', 'Occurred', 'Notes']} empty="No milestones yet.">
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
        setTrips(t); setContainers(c);
        setSites(s.filter(x => x.site_type === 'port'));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async e => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!form.trip_id || !form.container_id || !form.site_id || !form.milestone_type)
      return setError('All required fields must be filled.');
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
      setSuccess('Port milestone logged.');
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
          {trips.map(t => <option key={t.trip_id} value={t.trip_id}>Trip #{t.trip_id} ({t.status})</option>)}
        </select>
      </Field>

      <Field label="Container">
        <select required value={form.container_id} onChange={e => set('container_id', e.target.value)} style={selectStyle}>
          <option value="" disabled>Select container</option>
          {containers.map(c => <option key={c.container_id} value={c.container_id}>{c.iso_code} — {c.container_type}</option>)}
        </select>
      </Field>

      <Field label="Port Site">
        <select required value={form.site_id} onChange={e => set('site_id', e.target.value)} style={selectStyle}>
          <option value="" disabled>Select port</option>
          {sites.map(s => <option key={s.site_id} value={s.site_id}>{s.name}</option>)}
        </select>
      </Field>

      <Field label="Milestone Type">
        <select required value={form.milestone_type} onChange={e => set('milestone_type', e.target.value)} style={selectStyle}>
          <option value="" disabled>Select milestone</option>
          {PORT_MILESTONE_TYPES.map(m => <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>)}
        </select>
      </Field>

      <Field label="Occurred At">
        <input type="datetime-local" value={form.occurred_at} onChange={e => set('occurred_at', e.target.value)} style={inputStyle} />
      </Field>

      <Field label="Notes / Documentation Reference">
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Bill of lading number, customs ref…" />
      </Field>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="reset" style={{ ...btnSecondary, flex: 1 }}>Clear</button>
        <button type="submit" disabled={saving} style={{ ...btnPrimary, flex: 2 }}>{saving ? 'Logging…' : 'Log Milestone'}</button>
      </div>
    </form>
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
        <Table headers={['ID', 'Trip', 'Container', 'Reference', 'Submitted', 'Cleared', 'Status']} empty="No clearances.">
          {rows.map(c => (
            <Tr key={c.clearance_id}>
              <Td highlight bold>#{c.clearance_id}</Td>
              <Td>#{c.trip_id}</Td>
              <Td>{c.container_id}</Td>
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
        <Table headers={['ID', 'ISO Code', 'Type', 'Tare (kg)', 'Seal #', 'Status']} empty="No containers.">
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

const TABS = [
  { id: 'milestones',  label: '📍  Milestones' },
  { id: 'log',         label: '✅  Log Milestone' },
  { id: 'clearances',  label: '📄  Clearances' },
  { id: 'containers',  label: '📦  Containers' },
];

export default function PortAgentDashboard() {
  const { user, site, role } = getSession();
  const [tab, setTab] = useState('milestones');

  return (
    <>
      <style>{GLOBAL_STYLE}</style>
      <div style={PAGE}>
        <Nav role={role} site={site} user={user} />
        <div style={CONTENT}>
          <div style={PAGE_TITLE}>Port Agent Dashboard</div>
          <div style={PAGE_SUB}>Manage port milestones, documentation and customs clearances</div>
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
          <Card>
            {tab === 'milestones' && <MilestonesTab />}
            {tab === 'log'        && <LogMilestoneTab />}
            {tab === 'clearances' && <ClearancesTab />}
            {tab === 'containers' && <ContainersTab />}
          </Card>
        </div>
      </div>
    </>
  );
}
