import React, { useState, useEffect, useCallback } from 'react';
import {
  getSession, api, fmt,
  Badge, Nav, Tabs, Table, Tr, Td, Card,
  Field, inputStyle, selectStyle, btnPrimary, btnSecondary,
  ErrorBox, Loading,
  PAGE, CONTENT, PAGE_TITLE, PAGE_SUB, GLOBAL_STYLE,
} from './shared';

// ── Clearances ────────────────────────────────────────────────────────────────

function UpdateClearanceModal({ clearance, onClose, onUpdated }) {
  const [form, setForm] = useState({
    reference_number: clearance.reference_number || '',
    status:           clearance.status || 'pending',
    cleared_at:       clearance.cleared_at || '',
    cleared_by_staff_id: clearance.cleared_by_staff_id || '',
    notes:            clearance.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async e => {
    e.preventDefault(); setError('');
    setSaving(true);
    try {
      await api(`/clearances/${clearance.clearance_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          reference_number:    form.reference_number || null,
          status:              form.status,
          cleared_at:          form.status === 'cleared' ? (form.cleared_at || new Date().toISOString()) : null,
          cleared_by_staff_id: form.cleared_by_staff_id ? Number(form.cleared_by_staff_id) : null,
          notes:               form.notes || null,
        }),
      });
      onUpdated(); onClose();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#0f1623', border: '1px solid #1a2540', borderRadius: 16, padding: '28px 28px 24px', width: 440, maxWidth: '95vw', boxShadow: '0 16px 64px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16 }}>Update Clearance #{clearance.clearance_id}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 20 }}>×</button>
        </div>
        <form onSubmit={submit}>
          <Field label="Status"><select required value={form.status} onChange={e => set('status', e.target.value)} style={selectStyle}>
            {['pending', 'cleared', 'rejected'].map(s => <option key={s} value={s}>{s}</option>)}
          </select></Field>
          <Field label="Reference Number">
            <input value={form.reference_number} onChange={e => set('reference_number', e.target.value)} style={inputStyle} placeholder="Customs reference…" />
          </Field>
          <Field label="Cleared At">
            <input type="datetime-local" value={form.cleared_at} onChange={e => set('cleared_at', e.target.value)} style={inputStyle} />
          </Field>
          <Field label="Cleared By Staff ID">
            <input type="number" min="1" value={form.cleared_by_staff_id} onChange={e => set('cleared_by_staff_id', e.target.value)} style={inputStyle} placeholder="Staff ID" />
          </Field>
          <Field label="Notes">
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
          </Field>
          <ErrorBox msg={error} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={onClose} style={{ ...btnSecondary, flex: 1 }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ ...btnPrimary, flex: 2 }}>{saving ? 'Updating…' : 'Update Clearance'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ClearancesTab() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    api('/clearances').then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <div style={{ marginBottom: 16, fontSize: 13, color: '#94a3b8' }}>Click a row to update status</div>
      <ErrorBox msg={error} />
      {loading ? <Loading /> : (
        <Table headers={['ID', 'Trip', 'Container', 'Border Site', 'Reference', 'Submitted', 'Status', '']} empty="No clearances.">
          {rows.map(c => (
            <Tr key={c.clearance_id} onClick={() => setEditing(c)}>
              <Td highlight bold>#{c.clearance_id}</Td>
              <Td>#{c.trip_id}</Td>
              <Td>{c.container_id}</Td>
              <Td>{c.border_site_id}</Td>
              <Td>{c.reference_number}</Td>
              <Td muted>{fmt(c.submitted_at)}</Td>
              <Td><Badge status={c.status} /></Td>
              <Td><span style={{ color: '#3b82f6', fontSize: 12 }}>Edit →</span></Td>
            </Tr>
          ))}
        </Table>
      )}
      {editing && <UpdateClearanceModal clearance={editing} onClose={() => setEditing(null)} onUpdated={load} />}
    </>
  );
}

function CreateClearanceTab() {
  const { user } = getSession();
  const [trips, setTrips]         = useState([]);
  const [containers, setContainers] = useState([]);
  const [sites, setSites]         = useState([]);
  const [form, setForm]           = useState({ trip_id: '', container_id: '', border_site_id: '', reference_number: '', submitted_at: '', notes: '' });
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  useEffect(() => {
    Promise.all([api('/trips'), api('/containers/all'), api('/sites')])
      .then(([t, c, s]) => {
        setTrips(t); setContainers(c);
        setSites(s.filter(x => x.site_type === 'border'));
      })
      .catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async e => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!form.trip_id || !form.container_id || !form.border_site_id)
      return setError('Trip, container and border site are required.');
    setSaving(true);
    try {
      await api('/clearances', {
        method: 'POST',
        body: JSON.stringify({
          trip_id:             Number(form.trip_id),
          container_id:        Number(form.container_id),
          border_site_id:      Number(form.border_site_id),
          reference_number:    form.reference_number || null,
          submitted_at:        form.submitted_at || new Date().toISOString(),
          cleared_by_staff_id: user?.staff_id || null,
          status:              'pending',
          notes:               form.notes || null,
        }),
      });
      setSuccess('Clearance submitted.');
      setForm({ trip_id: '', container_id: '', border_site_id: '', reference_number: '', submitted_at: '', notes: '' });
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
        {trips.map(t => <option key={t.trip_id} value={t.trip_id}>Trip #{t.trip_id} ({t.status})</option>)}
      </select></Field>

      <Field label="Container"><select required value={form.container_id} onChange={e => set('container_id', e.target.value)} style={selectStyle}>
        <option value="" disabled>Select container</option>
        {containers.map(c => <option key={c.container_id} value={c.container_id}>{c.iso_code} — {c.container_type}</option>)}
      </select></Field>

      <Field label="Border Site"><select required value={form.border_site_id} onChange={e => set('border_site_id', e.target.value)} style={selectStyle}>
        <option value="" disabled>Select border site</option>
        {sites.map(s => <option key={s.site_id} value={s.site_id}>{s.name}</option>)}
      </select></Field>

      <Field label="Customs Reference Number">
        <input value={form.reference_number} onChange={e => set('reference_number', e.target.value)} style={inputStyle} placeholder="e.g. SARS-2024-001234" />
      </Field>

      <Field label="Submitted At">
        <input type="datetime-local" value={form.submitted_at} onChange={e => set('submitted_at', e.target.value)} style={inputStyle} />
      </Field>

      <Field label="Notes">
        <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Inspection notes, officer details…" />
      </Field>

      <button type="submit" disabled={saving} style={{ ...btnPrimary, width: '100%' }}>{saving ? 'Submitting…' : 'Submit Clearance'}</button>
    </form>
  );
}

function HandoversTab() {
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [showForm, setShowForm] = useState(false);
  const [trips, setTrips]       = useState([]);
  const [containers, setContainers] = useState([]);
  const [sites, setSites]       = useState([]);
  const [form, setForm]         = useState({ trip_id: '', container_id: '', from_site_id: '', to_site_id: '', seal_status: 'intact', handover_time: '', notes: '' });
  const [saving, setSaving]     = useState(false);
  const [formErr, setFormErr]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    api('/handovers').then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    Promise.all([api('/trips'), api('/containers/all'), api('/sites')])
      .then(([t, c, s]) => { setTrips(t); setContainers(c); setSites(s); });
  }, [load]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async e => {
    e.preventDefault(); setFormErr('');
    if (!form.trip_id || !form.container_id || !form.from_site_id || !form.to_site_id)
      return setFormErr('Trip, container and both sites are required.');
    setSaving(true);
    try {
      await api('/handovers', {
        method: 'POST',
        body: JSON.stringify({
          trip_id:      Number(form.trip_id),
          container_id: Number(form.container_id),
          from_site_id: Number(form.from_site_id),
          to_site_id:   Number(form.to_site_id),
          seal_status:  form.seal_status,
          handover_time: form.handover_time || new Date().toISOString(),
          notes:        form.notes || null,
        }),
      });
      setShowForm(false);
      load();
    } catch (err) { setFormErr(err.message); }
    finally { setSaving(false); }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ color: '#94a3b8', fontSize: 13 }}>{rows.length} handover{rows.length !== 1 ? 's' : ''}</span>
        <button onClick={() => setShowForm(v => !v)} style={btnPrimary}>{showForm ? 'Hide Form' : '+ Log Handover'}</button>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 20, background: '#080d1a' }}>
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Trip"><select required value={form.trip_id} onChange={e => set('trip_id', e.target.value)} style={selectStyle}>
                <option value="" disabled>Select trip</option>
                {trips.map(t => <option key={t.trip_id} value={t.trip_id}>Trip #{t.trip_id}</option>)}
              </select></Field>
              <Field label="Container"><select required value={form.container_id} onChange={e => set('container_id', e.target.value)} style={selectStyle}>
                <option value="" disabled>Select container</option>
                {containers.map(c => <option key={c.container_id} value={c.container_id}>{c.iso_code}</option>)}
              </select></Field>
              <Field label="From Site"><select required value={form.from_site_id} onChange={e => set('from_site_id', e.target.value)} style={selectStyle}>
                <option value="" disabled>From</option>
                {sites.map(s => <option key={s.site_id} value={s.site_id}>{s.name}</option>)}
              </select></Field>
              <Field label="To Site"><select required value={form.to_site_id} onChange={e => set('to_site_id', e.target.value)} style={selectStyle}>
                <option value="" disabled>To</option>
                {sites.map(s => <option key={s.site_id} value={s.site_id}>{s.name}</option>)}
              </select></Field>
              <Field label="Seal Status"><select value={form.seal_status} onChange={e => set('seal_status', e.target.value)} style={selectStyle}>
                {['intact', 'broken', 'unknown'].map(s => <option key={s} value={s}>{s}</option>)}
              </select></Field>
              <Field label="Handover Time">
                <input type="datetime-local" value={form.handover_time} onChange={e => set('handover_time', e.target.value)} style={inputStyle} />
              </Field>
            </div>
            <Field label="Notes">
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Digital signature ref, officer name…" />
            </Field>
            <ErrorBox msg={formErr} />
            <button type="submit" disabled={saving} style={{ ...btnPrimary, width: '100%' }}>{saving ? 'Logging…' : 'Log Handover'}</button>
          </form>
        </Card>
      )}

      <ErrorBox msg={error} />
      {loading ? <Loading /> : (
        <Table headers={['ID', 'Trip', 'Container', 'From → To', 'Seal', 'Time', 'Notes']} empty="No handovers yet.">
          {rows.map(h => (
            <Tr key={h.handover_id}>
              <Td highlight bold>#{h.handover_id}</Td>
              <Td>#{h.trip_id}</Td>
              <Td>{h.container_id}</Td>
              <Td>Site {h.from_site_id} → {h.to_site_id}</Td>
              <Td><Badge status={h.seal_status} /></Td>
              <Td muted>{fmt(h.handover_time)}</Td>
              <Td muted>{h.notes}</Td>
            </Tr>
          ))}
        </Table>
      )}
    </>
  );
}

const TABS = [
  { id: 'clearances', label: '📄  Clearances' },
  { id: 'submit',     label: '➕  Submit Clearance' },
  { id: 'handovers',  label: '🔁  Handovers' },
];

export default function BorderAgentDashboard() {
  const { user, site, role } = getSession();
  const [tab, setTab] = useState('clearances');

  return (
    <>
      <style>{GLOBAL_STYLE}</style>
      <div style={PAGE}>
        <Nav role={role} site={site} user={user} />
        <div style={CONTENT}>
          <div style={PAGE_TITLE}>Border Agent Dashboard</div>
          <div style={PAGE_SUB}>Manage customs clearances, inspections and cross-border handovers</div>
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
          <Card>
            {tab === 'clearances' && <ClearancesTab />}
            {tab === 'submit'     && <CreateClearanceTab />}
            {tab === 'handovers'  && <HandoversTab />}
          </Card>
        </div>
      </div>
    </>
  );
}
