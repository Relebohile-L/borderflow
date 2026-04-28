// src/components/ManagementDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const STATUS_MAP = {
  pending:     { bg: '#fef9c3', color: '#854d0e', label: 'Pending' },
  in_progress: { bg: '#dbeafe', color: '#1d4ed8', label: 'In Transit' },
  at_border:   { bg: '#fef3c7', color: '#92400e', label: 'At Border' },
  cleared:     { bg: '#dcfce7', color: '#166534', label: 'Cleared' },
  completed:   { bg: '#f3f4f6', color: '#4b5563', label: 'Completed' },
};

const s = {
  page: {
    padding: '28px 36px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: '#f3f4f6',
    minHeight: '100vh',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
  },
  pageTitle: { fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 },
  exportBtn: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    background: '#2563eb',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  // KPI grid
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '28px',
  },
  kpiCard: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    padding: '20px 22px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  kpiValue: {
    fontSize: '30px',
    fontWeight: '700',
    color: '#111827',
    lineHeight: 1.1,
    marginBottom: '4px',
  },
  kpiLabel: { fontSize: '12px', color: '#6b7280' },
  // Three-column layout
  cols: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
    alignItems: 'start',
  },
  section: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    padding: '20px 22px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 16px 0',
  },
  // Table
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  th: {
    padding: '8px 10px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #f3f4f6',
  },
  td: {
    padding: '10px 10px',
    color: '#374151',
    borderBottom: '1px solid #f9fafb',
    verticalAlign: 'middle',
  },
  badge: (status) => {
    const st = STATUS_MAP[status] || STATUS_MAP.pending;
    return {
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '600',
      background: st.bg,
      color: st.color,
    };
  },
  auditBtn: {
    padding: '4px 10px',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    background: 'white',
    color: '#6b7280',
    fontSize: '12px',
    cursor: 'pointer',
  },
  // Incident item
  incidentItem: {
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6',
  },
  incidentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  incidentType: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  incidentTime: { fontSize: '11px', color: '#9ca3af' },
  incidentDesc: { fontSize: '13px', color: '#6b7280', margin: 0 },
  // Audit log
  auditItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 0',
    borderBottom: '1px solid #f9fafb',
    fontSize: '13px',
  },
  auditTime: { color: '#9ca3af', fontSize: '11px', flexShrink: 0, width: '130px' },
  auditOp: { color: '#374151', flex: 1 },
  auditRole: {
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '20px',
    background: '#f3f4f6',
    color: '#6b7280',
    flexShrink: 0,
  },
  emptyText: { fontSize: '13px', color: '#9ca3af', padding: '16px 0' },
  // Modal
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '14px',
    padding: '28px',
    width: '560px',
    maxHeight: '85vh',
    overflowY: 'auto',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  modalTitle: { fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 },
  closeBtn: { background: 'none', border: 'none', fontSize: '18px', color: '#9ca3af', cursor: 'pointer' },
  modalSection: { marginBottom: '20px' },
  modalSectionTitle: { fontSize: '13px', fontWeight: '600', color: '#374151', margin: '0 0 10px 0' },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    fontSize: '13px',
    color: '#6b7280',
  },
  infoItem: { display: 'flex', gap: '6px' },
  infoKey: { color: '#9ca3af', flexShrink: 0 },
  infoVal: { color: '#374151', fontWeight: '500' },
  // Timeline
  timelineList: { listStyle: 'none', padding: 0, margin: 0 },
  timelineItem: {
    display: 'flex',
    gap: '12px',
    paddingBottom: '12px',
    position: 'relative',
  },
  tlDot: {
    width: '10px', height: '10px', borderRadius: '50%',
    background: '#2563eb', flexShrink: 0, marginTop: '3px',
  },
  tlLabel: { fontSize: '13px', fontWeight: '500', color: '#111827', marginBottom: '2px' },
  tlTime:  { fontSize: '11px', color: '#9ca3af' },
  incBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '10px 14px',
    marginBottom: '8px',
  },
  incBoxTitle: { fontSize: '13px', fontWeight: '600', color: '#991b1b', marginBottom: '4px' },
  incBoxDesc:  { fontSize: '13px', color: '#6b7280', margin: 0 },
  closeFooter: { display: 'flex', justifyContent: 'flex-end', marginTop: '8px' },
  btnCancel: { padding: '10px 20px', border: '1.5px solid #e5e7eb', borderRadius: '8px', background: 'white', color: '#374151', fontSize: '14px', cursor: 'pointer' },
};

const ManagementDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [trips, setTrips]         = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    const action = searchParams.get('action');
    if (!action) return;
    if (action === 'scroll-shipments') document.getElementById('mgmt-shipments')?.scrollIntoView({ behavior: 'smooth' });
    if (action === 'scroll-incidents') document.getElementById('mgmt-incidents')?.scrollIntoView({ behavior: 'smooth' });
    if (action === 'scroll-audit')     document.getElementById('mgmt-audit')?.scrollIntoView({ behavior: 'smooth' });
    if (action === 'export')           exportReport();
    setSearchParams({});
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps
  const [kpis, setKpis]           = useState({ total: 0, inTransit: 0, completed: 0, atBorder: 0, incidentCount: 0, compliance: 98 });
  const [selectedTrip, setSelectedTrip] = useState(null);

  useEffect(() => { loadAll(); }, []);

  const loadAll = () => {
    const allTrips    = JSON.parse(localStorage.getItem('trips') || '[]');
    const allIncidents = JSON.parse(localStorage.getItem('incidents') || '[]');
    const syncLogs    = JSON.parse(localStorage.getItem('sync_log') || '[]');

    setTrips(allTrips);
    setIncidents(allIncidents);
    setAuditLogs(syncLogs.slice(-20).reverse());

    setKpis({
      total:          allTrips.length,
      inTransit:      allTrips.filter(t => t.status === 'in_progress').length,
      completed:      allTrips.filter(t => t.status === 'completed').length,
      atBorder:       allTrips.filter(t => t.status === 'at_border').length,
      incidentCount:  allIncidents.length,
      compliance:     Math.max(0, 100 - allIncidents.length * 2),
    });
  };

  const exportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      kpis,
      shipments: trips.map(t => ({
        id: t.id, container: t.containerId, status: t.status,
        createdAt: t.createdAt, milestones: t.milestones,
        incidents: incidents.filter(i => i.tripId === t.id),
      })),
      incidents,
    };
    const uri  = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const link = document.createElement('a');
    link.href = uri;
    link.download = `borderflow_report_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <h1 style={s.pageTitle}>Management Overview</h1>
        <button style={s.exportBtn} onClick={exportReport}>↓ Export Report</button>
      </div>

      {/* KPI grid */}
      <div style={s.kpiGrid}>
        {[
          { label: 'Total Shipments',    value: kpis.total,          color: '#2563eb' },
          { label: 'In Transit',         value: kpis.inTransit,      color: '#7c3aed' },
          { label: 'Completed',          value: kpis.completed,      color: '#16a34a' },
          { label: 'At Border',          value: kpis.atBorder,       color: '#d97706' },
          { label: 'Incidents Reported', value: kpis.incidentCount,  color: '#dc2626' },
          { label: 'Compliance Score',   value: `${kpis.compliance}%`, color: '#0891b2' },
        ].map(k => (
          <div key={k.label} style={s.kpiCard}>
            <div style={{ ...s.kpiValue, color: k.color }}>{k.value}</div>
            <div style={s.kpiLabel}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={s.cols}>
        {/* Shipments table */}
        <div id="mgmt-shipments" style={s.section}>
          <p style={s.sectionTitle}>Recent Shipments</p>
          {trips.length === 0
            ? <p style={s.emptyText}>No shipments recorded yet.</p>
            : (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>ID</th>
                    <th style={s.th}>Container</th>
                    <th style={s.th}>Status</th>
                    <th style={s.th}>Created</th>
                    <th style={s.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {trips.slice(-15).reverse().map(trip => (
                    <tr key={trip.id}>
                      <td style={{ ...s.td, fontWeight: '600', color: '#111827' }}>{trip.id}</td>
                      <td style={s.td}>{trip.containerId || '—'}</td>
                      <td style={s.td}>
                        <span style={s.badge(trip.status)}>
                          {(STATUS_MAP[trip.status] || STATUS_MAP.pending).label}
                        </span>
                      </td>
                      <td style={{ ...s.td, color: '#9ca3af' }}>
                        {trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td style={s.td}>
                        <button style={s.auditBtn} onClick={() => setSelectedTrip(trip)}>Audit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Incident register */}
          <div id="mgmt-incidents" style={s.section}>
            <p style={s.sectionTitle}>Incident Register ({incidents.length})</p>
            {incidents.length === 0
              ? <p style={s.emptyText}>No incidents reported.</p>
              : incidents.slice(-8).reverse().map(inc => (
                <div key={inc.id} style={s.incidentItem}>
                  <div style={s.incidentHeader}>
                    <span style={s.incidentType}>{inc.type || 'Incident'}</span>
                    <span style={s.incidentTime}>{new Date(inc.reportedAt || inc.timestamp || 0).toLocaleString()}</span>
                  </div>
                  <p style={s.incidentDesc}>{inc.description}</p>
                  {inc.tripId && <span style={{ fontSize: '11px', color: '#9ca3af' }}>Trip: {inc.tripId}</span>}
                </div>
              ))
            }
          </div>

          {/* Audit trail */}
          <div id="mgmt-audit" style={s.section}>
            <p style={s.sectionTitle}>Sync Activity Log</p>
            {auditLogs.length === 0
              ? <p style={s.emptyText}>No activity logged yet.</p>
              : auditLogs.map(log => (
                <div key={log.id} style={s.auditItem}>
                  <span style={s.auditTime}>{new Date(log.local_time).toLocaleString()}</span>
                  <span style={s.auditOp}>{log.operation.replace(/_/g, ' ')}</span>
                  <span style={s.auditRole}>{log.role || 'system'}</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Audit Trail Modal */}
      {selectedTrip && (
        <div style={s.overlay} onClick={() => setSelectedTrip(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>Audit Trail — {selectedTrip.id}</h3>
              <button style={s.closeBtn} onClick={() => setSelectedTrip(null)}>✕</button>
            </div>

            <div style={s.modalSection}>
              <p style={s.modalSectionTitle}>Trip Details</p>
              <div style={s.infoGrid}>
                <div style={s.infoItem}><span style={s.infoKey}>Container</span><span style={s.infoVal}>{selectedTrip.containerId || '—'}</span></div>
                <div style={s.infoItem}><span style={s.infoKey}>Driver ID</span><span style={s.infoVal}>{selectedTrip.driverId || '—'}</span></div>
                <div style={s.infoItem}><span style={s.infoKey}>Route</span><span style={s.infoVal}>{selectedTrip.origin} → {selectedTrip.destination}</span></div>
                <div style={s.infoItem}><span style={s.infoKey}>Created</span><span style={s.infoVal}>{selectedTrip.createdAt ? new Date(selectedTrip.createdAt).toLocaleString() : '—'}</span></div>
              </div>
            </div>

            {selectedTrip.milestones?.length > 0 && (
              <div style={s.modalSection}>
                <p style={s.modalSectionTitle}>Milestone Timeline</p>
                <ul style={s.timelineList}>
                  {selectedTrip.milestones.map((m, i) => (
                    <li key={i} style={s.timelineItem}>
                      <span style={s.tlDot} />
                      <div>
                        <div style={s.tlLabel}>{m.type.replace(/_/g, ' ')}</div>
                        <div style={s.tlTime}>{new Date(m.timestamp).toLocaleString()}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {incidents.filter(i => i.tripId === selectedTrip.id).length > 0 && (
              <div style={s.modalSection}>
                <p style={s.modalSectionTitle}>Related Incidents</p>
                {incidents.filter(i => i.tripId === selectedTrip.id).map(inc => (
                  <div key={inc.id} style={s.incBox}>
                    <div style={s.incBoxTitle}>{inc.type}</div>
                    <p style={s.incBoxDesc}>{inc.description}</p>
                  </div>
                ))}
              </div>
            )}

            <div style={s.closeFooter}>
              <button style={s.btnCancel} onClick={() => setSelectedTrip(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagementDashboard;
