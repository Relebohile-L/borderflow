import React, { useState, useEffect } from 'react';
import {
  getSession, api, fmt, fmtDate,
  Badge, Nav, Tabs, Table, Tr, Td, Card,
  ErrorBox, Loading, Empty,
  PAGE, CONTENT, PAGE_TITLE, PAGE_SUB, GLOBAL_STYLE,
} from './shared';

function ShipmentsTab({ clientId, onSelectConsignment }) {
  const [rows, setRows]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const url = clientId ? `/consignments?client_id=${clientId}` : '/consignments';
    api(url).then(setRows).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [clientId]);

  return (
    <>
      <ErrorBox msg={error} />
      {loading ? <Loading /> : rows.length === 0 ? <Empty msg="No shipments found for your account." /> : (
        <>
          <div style={{ marginBottom: 14, fontSize: 13, color: '#64748b' }}>Click a shipment to track its containers.</div>
          <Table headers={['Ref #', 'Description', 'Weight (kg)', 'Status', 'Created', '']} empty="">
            {rows.map(r => (
              <Tr key={r.consignment_id} onClick={() => onSelectConsignment(r)}>
                <Td highlight bold>{r.reference_number}</Td>
                <Td>{r.description}</Td>
                <Td>{r.total_weight_kg}</Td>
                <Td><Badge status={r.status} /></Td>
                <Td muted>{fmtDate(r.created_at)}</Td>
                <Td><span style={{ color: '#3b82f6', fontSize: 12 }}>Track →</span></Td>
              </Tr>
            ))}
          </Table>
        </>
      )}
    </>
  );
}

function TrackTab({ consignment }) {
  const [containers, setContainers] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [allMilestones, setAllMilestones] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    if (!consignment) return;
    Promise.all([
      api(`/consignment-containers?consignment_id=${consignment.consignment_id}`),
      api('/milestones'),
    ])
      .then(([c, m]) => {
        setContainers(c);
        setAllMilestones(m);
        const ids = new Set(c.map(x => x.container_id));
        setMilestones(m.filter(ms => ids.has(ms.container_id)));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [consignment]);

  if (!consignment) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
        <div style={{ color: '#64748b', fontSize: 14 }}>Select a shipment from the My Shipments tab to track its containers.</div>
      </div>
    );
  }

  if (loading) return <Loading />;

  return (
    <>
      <ErrorBox msg={error} />

      <div style={{ marginBottom: 24, padding: '16px 20px', background: '#080d1a', border: '1px solid #1a2540', borderRadius: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Tracking</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{consignment.reference_number}</div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>{consignment.description}</div>
        <Badge status={consignment.status} />
      </div>

      <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Containers</div>
      {containers.length === 0 ? <Empty msg="No containers linked to this shipment." /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 28 }}>
          {containers.map(c => (
            <div key={c.container_id} style={{ background: '#080d1a', border: '1px solid #1a2540', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{c.iso_code}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{c.container_type}</div>
              <Badge status={c.container_status} />
              {c.seal_number && <div style={{ fontSize: 11, color: '#475569', marginTop: 6 }}>Seal: {c.seal_number}</div>}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginBottom: 8, fontSize: 12, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Event Timeline</div>
      {milestones.length === 0 ? <Empty msg="No events recorded yet." /> : (
        <div style={{ position: 'relative', paddingLeft: 28 }}>
          <div style={{ position: 'absolute', left: 9, top: 0, bottom: 0, width: 2, background: '#1a2540' }} />
          {milestones
            .sort((a, b) => new Date(a.occurred_at) - new Date(b.occurred_at))
            .map((m, idx) => (
              <div key={m.milestone_id} style={{ position: 'relative', marginBottom: 20 }}>
                <div style={{
                  position: 'absolute', left: -28, top: 4,
                  width: 10, height: 10, borderRadius: '50%',
                  background: '#2563eb', border: '2px solid #172554',
                }} />
                <div style={{ fontSize: 12, fontWeight: 600, color: '#93c5fd', textTransform: 'capitalize', marginBottom: 2 }}>
                  {m.milestone_type?.replace(/_/g, ' ')}
                </div>
                <div style={{ fontSize: 11, color: '#475569' }}>{fmt(m.occurred_at)} — Container #{m.container_id}</div>
                {m.notes && <div style={{ fontSize: 11, color: '#334155', marginTop: 2 }}>{m.notes}</div>}
              </div>
            ))}
        </div>
      )}
    </>
  );
}

const TABS = [
  { id: 'shipments', label: '📋  My Shipments' },
  { id: 'track',     label: '📡  Track Container' },
];

export default function ClientDashboard() {
  const { user, site, role } = getSession();
  const [tab, setTab]                   = useState('shipments');
  const [selected, setSelected]         = useState(null);

  const handleSelect = (consignment) => {
    setSelected(consignment);
    setTab('track');
  };

  return (
    <>
      <style>{GLOBAL_STYLE}</style>
      <div style={PAGE}>
        <Nav role={role} site={site} user={user} />
        <div style={CONTENT}>
          <div style={PAGE_TITLE}>Shipment Tracking</div>
          <div style={PAGE_SUB}>Monitor your container status and delivery progress in real time</div>
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
          <Card>
            {tab === 'shipments' && <ShipmentsTab clientId={user?.client_id} onSelectConsignment={handleSelect} />}
            {tab === 'track'     && <TrackTab consignment={selected} />}
          </Card>
        </div>
      </div>
    </>
  );
}
