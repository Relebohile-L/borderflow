import React, { useState, useEffect, useCallback } from 'react';
import {
  getSession, api, fmt, fmtDate,
  Badge, Nav, Tabs, Table, Tr, Td, Card,
  Field, inputStyle, selectStyle, btnPrimary, btnSecondary,
  ErrorBox, Loading, Empty,
  PAGE, CONTENT, PAGE_TITLE, PAGE_SUB, GLOBAL_STYLE,
} from './shared';

// ── Create Trip Modal ─────────────────────────────────────────────────────────

function CreateTripModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ vehicle_id: '', driver_id: '', origin_site_id: '', destination_site_id: '' });
  const [selected, setSelected] = useState([]);
  const [drivers, setDrivers]     = useState([]);
  const [vehicles, setVehicles]   = useState([]);
  const [containers, setContainers] = useState([]);
  const [sites, setSites]         = useState([]);
  const [fetching, setFetching]   = useState(true);
  const [fetchErr, setFetchErr]   = useState('');
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    Promise.all([api('/drivers'), api('/vehicles'), api('/containers'), api('/sites')])
      .then(([d, v, c, s]) => { setDrivers(d); setVehicles(v); setContainers(c); setSites(s); })
      .catch(e => setFetchErr(e.message))
      .finally(() => setFetching(false));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleContainer = id => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const submit = async e => {
    e.preventDefault(); setError('');
    if (!form.vehicle_id || !form.driver_id || !form.origin_site_id || !form.destination_site_id)
      return setError('All fields are required.');
    if (!selected.length) return setError('Select at least one container.');
    if (form.origin_site_id === form.destination_site_id) return setError('Origin and destination must differ.');
    setSaving(true);
    try {
      await api('/trip', {
        method: 'POST',
        body: JSON.stringify({
          vehicle_id:          Number(form.vehicle_id),
          driver_id:           Number(form.driver_id),
          origin_site_id:      Number(form.origin_site_id),
          destination_site_id: Number(form.destination_site_id),
          containers:          selected,
        }),
      });
      onCreated(); onClose();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const siteLabel = s => `${s.name} (${s.site_type})`;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ background: '#0f1623', border: '1px solid #1a2540', borderRadius: 16, padding: '28px 28px 24px', width: 500, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 16px 64px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16 }}>New Trip</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 20 }}>×</button>
        </div>

        {fetching ? <Loading /> : fetchErr ? <ErrorBox msg={`Failed to load: ${fetchErr}`} /> : (
          <form onSubmit={submit}>
            <Field label="Driver">
              <select required value={form.driver_id} onChange={e => set('driver_id', e.target.value)} style={selectStyle}>
                <option value="" disabled>{drivers.length ? 'Select a driver' : 'No active drivers'}</option>
                {drivers.map(d => <option key={d.driver_id} value={d.driver_id}>{d.first_name} {d.last_name} — {d.license_number}</option>)}
              </select>
            </Field>

            <Field label="Vehicle">
              <select required value={form.vehicle_id} onChange={e => set('vehicle_id', e.target.value)} style={selectStyle}>
                <option value="" disabled>{vehicles.length ? 'Select a vehicle' : 'No available vehicles'}</option>
                {vehicles.map(v => <option key={v.vehicle_id} value={v.vehicle_id}>{v.registration} — {v.make} {v.model}</option>)}
              </select>
            </Field>

            <Field label="Origin Site">
              <select required value={form.origin_site_id} onChange={e => set('origin_site_id', e.target.value)} style={selectStyle}>
                <option value="" disabled>Select origin</option>
                {sites.map(s => <option key={s.site_id} value={s.site_id}>{siteLabel(s)}</option>)}
              </select>
            </Field>

            <Field label="Destination Site">
              <select required value={form.destination_site_id} onChange={e => set('destination_site_id', e.target.value)} style={selectStyle}>
                <option value="" disabled>Select destination</option>
                {sites.map(s => <option key={s.site_id} value={s.site_id}>{siteLabel(s)}</option>)}
              </select>
            </Field>

            <Field label={`Containers (${selected.length} selected)`}>
              {containers.length === 0 ? <Empty msg="No available containers" /> : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                  {containers.map(c => {
                    const sel = selected.includes(c.container_id);
                    return (
                      <button key={c.container_id} type="button" onClick={() => toggleContainer(c.container_id)} style={{
                        padding: '8px 10px', textAlign: 'left', borderRadius: 8, cursor: 'pointer',
                        background: sel ? '#172554' : '#0a1020',
                        border: `1.5px solid ${sel ? '#2563eb' : '#1a2540'}`,
                        color: sel ? '#93c5fd' : '#64748b',
                        fontSize: 12, fontFamily: 'inherit', fontWeight: sel ? 600 : 400,
                      }}>
                        <div style={{ fontWeight: 600 }}>{c.iso_code}</div>
                        <div style={{ fontSize: 10.5, opacity: 0.7 }}>{c.container_type}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </Field>

            <ErrorBox msg={error} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={onClose} style={{ ...btnSecondary, flex: 1 }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ ...btnPrimary, flex: 2 }}>{saving ? 'Creating…' : 'Create Trip'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Trips Tab ─────────────────────────────────────────────────────────────────

function TripsTab() {
  const [trips, setTrips]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setTrips(await api('/trips')); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ color: '#94a3b8', fontSize: 13 }}>{trips.length} trip{trips.length !== 1 ? 's' : ''}</span>
        <button onClick={() => setShowCreate(true)} style={btnPrimary}>+ New Trip</button>
      </div>
      <ErrorBox msg={error} />
      {loading ? <Loading /> : (
        <Table headers={['ID', 'Driver', 'Vehicle', 'Route', 'Departure', 'Status']} empty="No trips found.">
          {trips.map(t => (
            <Tr key={t.trip_id}>
              <Td highlight bold>#{t.trip_id}</Td>
              <Td>Driver #{t.driver_id}</Td>
              <Td>Vehicle #{t.vehicle_id}</Td>
              <Td>Site {t.origin_site_id} → {t.destination_site_id}</Td>
              <Td muted>{fmt(t.scheduled_departure)}</Td>
              <Td><Badge status={t.status} /></Td>
            </Tr>
          ))}
        </Table>
      )}
      {showCreate && <CreateTripModal onClose={() => setShowCreate(false)} onCreated={load} />}
    </>
  );
}

// ── Consignments Tab ──────────────────────────────────────────────────────────

function ConsignmentsTab() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api('/consignments')
      .then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <ErrorBox msg={error} />
      {loading ? <Loading /> : (
        <Table headers={['ID', 'Client', 'Reference', 'Description', 'Weight (kg)', 'Status', 'Created']} empty="No consignments.">
          {rows.map(r => (
            <Tr key={r.consignment_id}>
              <Td highlight bold>#{r.consignment_id}</Td>
              <Td>{r.company_name}</Td>
              <Td>{r.reference_number}</Td>
              <Td muted>{r.description}</Td>
              <Td>{r.total_weight_kg}</Td>
              <Td><Badge status={r.status} /></Td>
              <Td muted>{fmtDate(r.created_at)}</Td>
            </Tr>
          ))}
        </Table>
      )}
    </>
  );
}

// ── Incidents Tab ─────────────────────────────────────────────────────────────

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
        <Table headers={['ID', 'Trip', 'Container', 'Type', 'Severity', 'Status', 'Occurred']} empty="No incidents.">
          {rows.map(i => (
            <Tr key={i.incident_id}>
              <Td highlight bold>#{i.incident_id}</Td>
              <Td>#{i.trip_id}</Td>
              <Td>{i.container_id}</Td>
              <Td>{i.incident_type}</Td>
              <Td><span style={{ color: i.severity === 'critical' || i.severity === 'high' ? '#f87171' : i.severity === 'medium' ? '#fbbf24' : '#94a3b8', fontWeight: 600 }}>{i.severity}</span></Td>
              <Td><Badge status={i.status} /></Td>
              <Td muted>{fmtDate(i.occurred_at)}</Td>
            </Tr>
          ))}
        </Table>
      )}
    </>
  );
}

// ── Milestones Tab ────────────────────────────────────────────────────────────

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
        <Table headers={['ID', 'Trip', 'Container', 'Site', 'Type', 'Occurred', 'Notes']} empty="No milestones.">
          {rows.map(m => (
            <Tr key={m.milestone_id}>
              <Td highlight bold>#{m.milestone_id}</Td>
              <Td>#{m.trip_id}</Td>
              <Td>{m.container_id}</Td>
              <Td>{m.site_id}</Td>
              <Td>{m.milestone_type}</Td>
              <Td muted>{fmt(m.occurred_at)}</Td>
              <Td muted>{m.notes}</Td>
            </Tr>
          ))}
        </Table>
      )}
    </>
  );
}

// ── Handovers Tab ─────────────────────────────────────────────────────────────

function HandoversTab() {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api('/handovers').then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <ErrorBox msg={error} />
      {loading ? <Loading /> : (
        <Table headers={['ID', 'Trip', 'Container', 'From → To', 'Seal', 'Time', 'Notes']} empty="No handovers.">
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

// ── Dashboard ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'trips',        label: '🚛  Trips' },
  { id: 'consignments', label: '📋  Consignments' },
  { id: 'incidents',    label: '⚠️  Incidents' },
  { id: 'milestones',   label: '📍  Milestones' },
  { id: 'handovers',    label: '🔁  Handovers' },
];

export default function DispatcherDashboard() {
  const { user, site, role } = getSession();
  const [tab, setTab] = useState('trips');

  return (
    <>
      <style>{GLOBAL_STYLE}</style>
      <div style={PAGE}>
        <Nav role={role} site={site} user={user} />
        <div style={CONTENT}>
          <div style={PAGE_TITLE}>Dispatcher Dashboard</div>
          <div style={PAGE_SUB}>Assign trips, monitor container flow and handle disruptions</div>
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
          <Card>
            {tab === 'trips'        && <TripsTab />}
            {tab === 'consignments' && <ConsignmentsTab />}
            {tab === 'incidents'    && <IncidentsTab />}
            {tab === 'milestones'   && <MilestonesTab />}
            {tab === 'handovers'    && <HandoversTab />}
          </Card>
        </div>
      </div>
    </>
  );
}
