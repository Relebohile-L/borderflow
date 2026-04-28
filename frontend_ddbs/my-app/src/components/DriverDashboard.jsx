// src/components/DriverDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, SITE_IDS } from '../services/api';

const MILESTONES = [
  { key: 'picked_up',          label: 'Picked Up',              nextStatus: 'in_progress' },
  { key: 'departed_depot',     label: 'Departed Depot',         nextStatus: 'in_progress' },
  { key: 'arrived_at_border',  label: 'Arrived at Border',      nextStatus: 'at_border'   },
  { key: 'crossed_border',     label: 'Crossed Border',         nextStatus: 'cleared'     },
  { key: 'arrived_at_dest',    label: 'Arrived at Destination', nextStatus: 'cleared'     },
  { key: 'handover_completed', label: 'Handover Completed',     nextStatus: 'completed'   },
];

const INCIDENT_TYPES = [
  'Vehicle Breakdown', 'Document Issue', 'Container Damage',
  'Security Incident', 'Accident', 'Other',
];

const s = {
  page: {
    padding: '28px 36px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: '#f3f4f6',
    minHeight: '100vh',
  },
  center: {
    maxWidth: '600px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  profileCard: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    padding: '20px 24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '18px',
    fontWeight: '700',
    flexShrink: 0,
  },
  profileName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 2px 0',
  },
  profileMeta: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: 0,
  },
  sectionHeading: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    margin: '0 0 4px 0',
  },
  emptyCard: {
    textAlign: 'center',
    color: '#9ca3af',
    padding: '40px 32px',
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    fontSize: '14px',
  },
  tripCard: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    padding: '20px 24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  tripTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2px',
  },
  tripCode: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#111827',
  },
  statusBadge: (status) => {
    const map = {
      completed:   { bg: '#ccfbf1', color: '#0f766e' },
      in_progress: { bg: '#dbeafe', color: '#1d4ed8' },
      at_border:   { bg: '#fef9c3', color: '#854d0e' },
      cleared:     { bg: '#dcfce7', color: '#166534' },
      pending:     { bg: '#f3f4f6', color: '#4b5563' },
    };
    const st = map[status] || map.pending;
    return {
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      background: st.bg,
      color: st.color,
    };
  },
  tripMeta: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '18px',
  },
  milestoneList: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 12px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  milestoneItem: (done) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    color: done ? '#16a34a' : '#9ca3af',
    textDecoration: done ? 'line-through' : 'none',
  }),
  milestoneIcon: (done) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: `2px solid ${done ? '#16a34a' : '#d1d5db'}`,
    fontSize: '10px',
    flexShrink: 0,
    color: done ? '#16a34a' : '#d1d5db',
  }),
  tripComplete: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#16a34a',
    fontWeight: '500',
    marginBottom: '16px',
  },
  advanceBtn: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    background: '#2563eb',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '16px',
    display: 'block',
    width: '100%',
  },
  actionRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    borderTop: '1px solid #f3f4f6',
    paddingTop: '16px',
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '8px',
    background: 'white',
    color: '#374151',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
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
    borderRadius: '12px',
    padding: '28px',
    width: '440px',
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
  label: { display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' },
  mSelect: {
    width: '100%', padding: '10px 14px', border: '1.5px solid #d1d5db',
    borderRadius: '8px', fontSize: '14px', marginBottom: '16px', outline: 'none', boxSizing: 'border-box',
  },
  mTextarea: {
    width: '100%', padding: '10px 14px', border: '1.5px solid #d1d5db',
    borderRadius: '8px', fontSize: '14px', marginBottom: '16px', minHeight: '80px',
    fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box',
  },
  mInput: {
    width: '100%', padding: '10px 14px', border: '1.5px solid #d1d5db',
    borderRadius: '8px', fontSize: '14px', marginBottom: '16px', outline: 'none', boxSizing: 'border-box',
  },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  btnRed: { padding: '10px 24px', border: 'none', borderRadius: '8px', background: '#dc2626', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  btnCancel: { padding: '10px 20px', border: '1.5px solid #e5e7eb', borderRadius: '8px', background: 'white', color: '#374151', fontSize: '14px', cursor: 'pointer' },
};

const initials = (name = '') => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

const labelFor = (status) => {
  const map = { completed: 'Completed', in_progress: 'In Transit', at_border: 'At Border', cleared: 'Cleared', pending: 'Pending' };
  return map[status] || status;
};

const DriverDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [trips, setTrips]             = useState([]);
  const [showIncident, setShowIncident]     = useState(false);
  const [incidentTarget, setIncidentTarget] = useState(null);
  const [incidentData, setIncidentData]     = useState({ type: '', description: '', location: '' });

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'report-incident') {
      setShowIncident(true);
      setSearchParams({});
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    setCurrentUser(user);
    loadTrips(user.driverId);
  }, []);

  const loadTrips = async (driverId) => {
    if (!driverId) { setTrips([]); return; }

    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (user.country) {
      try {
        const backendTrips = await api.getTrips(user.country, { driver_id: driverId });
        if (backendTrips.length > 0) {
          setTrips(backendTrips.map(t => ({
            id: `BE-${t.trip_id}`,
            backendId: t.trip_id,
            driverId: String(t.driver_id),
            containerCode: `TRIP-${t.trip_id}`,
            route: `Site ${t.origin_site_id} → Site ${t.destination_site_id}`,
            status: t.status === 'scheduled' ? 'pending' : t.status,
            completedMilestones: [],
            source: 'backend',
          })));
          return;
        }
      } catch (_) {
        // fall through to localStorage
      }
    }

    // localStorage fallback
    const allTrips = JSON.parse(localStorage.getItem('trips') || '[]');
    const myTrips = allTrips
      .filter(t => t.driverId === String(driverId))
      .map(t => ({
        ...t,
        containerCode: t.containerId || t.id,
        route: `${t.origin || '—'} → ${t.destination || '—'}`,
        completedMilestones: t.driverMilestones || [],
      }));
    setTrips(myTrips);
  };

  const advanceMilestone = async (trip) => {
    const next = MILESTONES.find(m => !trip.completedMilestones.includes(m.key));
    if (!next) return;

    // Update localStorage (for non-backend trips) and optimistic UI
    const allTrips = JSON.parse(localStorage.getItem('trips') || '[]');
    const updated = allTrips.map(t => {
      if (t.id !== trip.id) return t;
      const driverMilestones = [...(t.driverMilestones || []), next.key];
      return {
        ...t,
        driverMilestones,
        status: next.nextStatus,
        milestones: [...(t.milestones || []), { type: next.key, timestamp: new Date().toISOString() }],
      };
    });
    localStorage.setItem('trips', JSON.stringify(updated));

    // Optimistic UI update (works for both backend and local trips)
    setTrips(prev => prev.map(t => t.id !== trip.id ? t : {
      ...t,
      completedMilestones: [...t.completedMilestones, next.key],
      status: next.nextStatus,
    }));

    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    queueForSync('milestone_advance', { tripId: trip.id, milestone: next.key });

    // Post to backend when trip originated from backend
    if (trip.backendId && user.country) {
      try {
        await api.createMilestone(user.country, {
          trip_id: trip.backendId,
          container_id: null,
          site_id: SITE_IDS[user.country] || null,
          milestone_type: next.key,
          occurred_at: new Date().toISOString(),
          recorded_by_staff_id: user.id || null,
        });
      } catch (_) {}
    }
  };

  const submitIncident = async (e) => {
    e.preventDefault();
    const incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
    incidents.push({
      id: `INC${Date.now()}`,
      tripId: incidentTarget?.id,
      ...incidentData,
      reportedAt: new Date().toISOString(),
      status: 'reported',
    });
    localStorage.setItem('incidents', JSON.stringify(incidents));
    queueForSync('incident_report', { tripId: incidentTarget?.id, ...incidentData });

    // Post to backend when trip originated from backend
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (incidentTarget?.backendId && user.country) {
      try {
        await api.createIncident(user.country, {
          trip_id: incidentTarget.backendId,
          reported_by_site_id: SITE_IDS[user.country] || null,
          incident_type: incidentData.type,
          description: incidentData.description,
          severity: 'medium',
          occurred_at: new Date().toISOString(),
        });
      } catch (_) {}
    }

    setShowIncident(false);
    setIncidentData({ type: '', description: '', location: '' });
    alert('Incident reported successfully');
  };

  const handlePhoto = (e, trip) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const photos = JSON.parse(localStorage.getItem('tripPhotos') || '[]');
      photos.push({ id: `PHO${Date.now()}`, tripId: trip.id, fileName: file.name, data: ev.target.result, capturedAt: new Date().toISOString() });
      localStorage.setItem('tripPhotos', JSON.stringify(photos));
      queueForSync('photo_captured', { tripId: trip.id, fileName: file.name });
      alert('Photo saved');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const queueForSync = (operation, data) => {
    const syncLog = JSON.parse(localStorage.getItem('sync_log') || '[]');
    syncLog.push({
      id: `sync_${Date.now()}`,
      operation,
      data,
      local_time: new Date().toISOString(),
      sync_status: 'pending',
      role: 'driver',
    });
    localStorage.setItem('sync_log', JSON.stringify(syncLog));
  };

  return (
    <div style={s.page}>
      <div style={s.center}>
        {/* Driver profile card */}
        <div style={s.profileCard}>
          <div style={s.avatar}>{initials(currentUser?.name)}</div>
          <div>
            <p style={s.profileName}>{currentUser?.name || 'Driver'}</p>
            <p style={s.profileMeta}>{currentUser?.roleName} · {currentUser?.countryName} · ID: {currentUser?.driverId || '—'}</p>
          </div>
        </div>

        <p style={s.sectionHeading}>Assigned Trips ({trips.length})</p>

        {trips.length === 0 && (
          <div style={s.emptyCard}>
            No trips assigned yet. Your dispatcher will assign trips here.
          </div>
        )}

        {trips.map(trip => {
          const allDone = MILESTONES.every(m => trip.completedMilestones.includes(m.key));
          const next    = MILESTONES.find(m => !trip.completedMilestones.includes(m.key));
          return (
            <div key={trip.id} style={s.tripCard}>
              <div style={s.tripTop}>
                <span style={s.tripCode}>{trip.containerCode}</span>
                <span style={s.statusBadge(trip.status)}>{labelFor(trip.status)}</span>
              </div>
              <div style={s.tripMeta}>{trip.route}</div>

              <ul style={s.milestoneList}>
                {MILESTONES.map(m => {
                  const done = trip.completedMilestones.includes(m.key);
                  return (
                    <li key={m.key} style={s.milestoneItem(done)}>
                      <span style={s.milestoneIcon(done)}>{done ? '✓' : ''}</span>
                      {m.label}
                    </li>
                  );
                })}
              </ul>

              {allDone
                ? <div style={s.tripComplete}><span>✅</span> Trip complete</div>
                : next && (
                  <button style={s.advanceBtn} onClick={() => advanceMilestone(trip)}>
                    Mark: {next.label}
                  </button>
                )
              }

              <div style={s.actionRow}>
                <label style={s.actionBtn}>
                  📷 Photo
                  <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => handlePhoto(e, trip)} />
                </label>
                <button style={s.actionBtn} onClick={() => { setIncidentTarget(trip); setShowIncident(true); }}>
                  ⚠ Incident
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Incident Modal */}
      {showIncident && (
        <div style={s.overlay} onClick={() => setShowIncident(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>Report Incident</h3>
              <button style={s.closeBtn} onClick={() => setShowIncident(false)}>✕</button>
            </div>
            <form onSubmit={submitIncident}>
              <label style={s.label}>Incident type</label>
              <select style={s.mSelect} value={incidentData.type} onChange={e => setIncidentData({ ...incidentData, type: e.target.value })} required>
                <option value="">Select type…</option>
                {INCIDENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              <label style={s.label}>Description</label>
              <textarea style={s.mTextarea} value={incidentData.description} onChange={e => setIncidentData({ ...incidentData, description: e.target.value })} required />
              <label style={s.label}>Location</label>
              <input style={s.mInput} value={incidentData.location} onChange={e => setIncidentData({ ...incidentData, location: e.target.value })} placeholder="Current location" />
              <div style={s.modalFooter}>
                <button type="button" style={s.btnCancel} onClick={() => setShowIncident(false)}>Cancel</button>
                <button type="submit" style={s.btnRed}>Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
