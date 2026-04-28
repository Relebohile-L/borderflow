// src/components/DispatcherDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, SITE_IDS } from '../services/api';

const DEFAULT_VEHICLES = [
  { id: 'VH001', plate: 'CA 123-456',  type: 'Truck' },
  { id: 'VH002', plate: 'GP 789-012',  type: 'Truck' },
  { id: 'VH003', plate: 'MOZ 456-789', type: 'Semi-trailer' },
  { id: 'VH004', plate: 'NP 321-654',  type: 'Truck' },
  { id: 'VH005', plate: 'EC 654-321',  type: 'Semi-trailer' },
];

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
  pageTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  createBtn: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    background: '#2563eb',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  // Stats row
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '28px',
  },
  statCard: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    padding: '16px 20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    lineHeight: 1.1,
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
  },
  // Alerts
  alertBanner: {
    background: '#fff7ed',
    border: '1px solid #fed7aa',
    borderRadius: '10px',
    padding: '14px 18px',
    marginBottom: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  alertRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  alertMsg: {
    flex: 1,
    fontSize: '13px',
    color: '#92400e',
  },
  dismissBtn: {
    padding: '5px 12px',
    border: '1px solid #fed7aa',
    borderRadius: '6px',
    background: 'white',
    color: '#92400e',
    fontSize: '12px',
    cursor: 'pointer',
    flexShrink: 0,
  },
  // Two-column layout
  cols: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: '24px',
    alignItems: 'start',
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 14px 0',
  },
  // Trip cards
  tripGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  tripCard: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    padding: '18px 22px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  tripTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  tripId: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#111827',
  },
  badge: (status) => {
    const st = STATUS_MAP[status] || STATUS_MAP.pending;
    return {
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '600',
      background: st.bg,
      color: st.color,
    };
  },
  tripMeta: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '6px 16px',
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '14px',
  },
  metaItem: {
    display: 'flex',
    gap: '4px',
  },
  metaKey: {
    color: '#9ca3af',
    flexShrink: 0,
  },
  metaVal: {
    color: '#374151',
    fontWeight: '500',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  rerouteBtn: {
    padding: '7px 14px',
    border: '1.5px solid #f59e0b',
    borderRadius: '7px',
    background: '#fffbeb',
    color: '#92400e',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  emptyTrips: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    padding: '40px',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: '14px',
  },
  // Resource panel
  resourcePanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  resourceCard: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    padding: '16px 18px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  resourceTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    margin: '0 0 10px 0',
  },
  resourceList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  resourceItem: {
    fontSize: '13px',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  dot: (color) => ({
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: color,
    flexShrink: 0,
  }),
  // Modals
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
    width: '520px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '22px',
  },
  modalTitle: { fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 },
  closeBtn: { background: 'none', border: 'none', fontSize: '18px', color: '#9ca3af', cursor: 'pointer' },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '500', color: '#374151', marginBottom: '6px' },
  input: {
    width: '100%', padding: '10px 14px', border: '1.5px solid #d1d5db',
    borderRadius: '8px', fontSize: '14px', color: '#111827',
    boxSizing: 'border-box', outline: 'none',
  },
  inputReadonly: {
    width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb',
    borderRadius: '8px', fontSize: '14px', color: '#6b7280',
    boxSizing: 'border-box', background: '#f9fafb', cursor: 'not-allowed',
  },
  select: {
    width: '100%', padding: '10px 14px', border: '1.5px solid #d1d5db',
    borderRadius: '8px', fontSize: '14px', color: '#111827',
    background: 'white', boxSizing: 'border-box', outline: 'none',
  },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' },
  btnBlue: { padding: '10px 24px', border: 'none', borderRadius: '8px', background: '#2563eb', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  btnAmber: { padding: '10px 24px', border: 'none', borderRadius: '8px', background: '#d97706', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  btnCancel: { padding: '10px 20px', border: '1.5px solid #e5e7eb', borderRadius: '8px', background: 'white', color: '#374151', fontSize: '14px', cursor: 'pointer' },
};

const DispatcherDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [trips, setTrips]           = useState([]);
  const [drivers, setDrivers]       = useState([]);
  const [containers, setContainers] = useState([]);
  const [vehicles, setVehicles]     = useState(DEFAULT_VEHICLES);
  const [alerts, setAlerts]         = useState([]);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedTrip, setSelectedTrip]     = useState(null);
  const [newDestination, setNewDestination] = useState('');
  const [newTrip, setNewTrip] = useState({
    origin: '', destination: '', containerId: '', sealNumber: '',
    driverId: '', vehicleId: '', scheduledPickup: '',
  });

  useEffect(() => {
    loadLocalData();
    loadFromBackend();
    checkForAlerts();
    const interval = setInterval(checkForAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const action = searchParams.get('action');
    if (!action) return;
    if (action === 'new-assignment') setShowAssignForm(true);
    if (action === 'scroll-trips')      document.getElementById('trips-section')?.scrollIntoView({ behavior: 'smooth' });
    if (action === 'scroll-drivers')    document.getElementById('resources-section')?.scrollIntoView({ behavior: 'smooth' });
    if (action === 'scroll-containers') document.getElementById('resources-section')?.scrollIntoView({ behavior: 'smooth' });
    setSearchParams({});
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadLocalData = () => {
    const savedTrips      = JSON.parse(localStorage.getItem('trips') || '[]');
    const savedDrivers    = JSON.parse(localStorage.getItem('drivers') || '[]');
    const savedContainers = JSON.parse(localStorage.getItem('containers') || '[]');

    // Always seed canonical drivers so IDs match login DRIVER_ID_MAP
    const canonicalDrivers = [
      { id: 'D001', name: 'John Mkhize',      license: 'SA123456',  status: 'available', phone: '+27 82 123 4567',  country: 'SA'  },
      { id: 'D002', name: 'Joaquim Chissano', license: 'MOZ789012', status: 'available', phone: '+258 84 123 4567', country: 'MOZ' },
      { id: 'D003', name: 'Raj Patel',        license: 'MRU456789', status: 'available', phone: '+230 57 123 4567', country: 'MRU' },
      { id: 'D004', name: 'Sarah Johnson',    license: 'SA999001',  status: 'available', phone: '+27 83 987 6543',  country: 'SA'  },
      { id: 'D005', name: 'Eduardo Mondlane', license: 'MOZ111222', status: 'available', phone: '+258 82 987 6543', country: 'MOZ' },
    ];
    const mergedDrivers = canonicalDrivers.map(cd => {
      const saved = savedDrivers.find(d => d.id === cd.id);
      return saved ? { ...cd, status: saved.status, currentTrip: saved.currentTrip } : cd;
    });
    localStorage.setItem('drivers', JSON.stringify(mergedDrivers));
    setDrivers(mergedDrivers);

    if (savedContainers.length === 0) {
      const mockContainers = [
        { id: 'CONT001', type: '20ft', status: 'available', location: 'Depot SA',  sealNumber: 'SL-2024-0011' },
        { id: 'CONT002', type: '40ft', status: 'in_transit', location: 'En Route', sealNumber: 'SL-2024-0022' },
        { id: 'CONT003', type: '20ft', status: 'available', location: 'Depot SA',  sealNumber: 'SL-2024-0033' },
        { id: 'CONT004', type: '40ft', status: 'available', location: 'Port MOZ',  sealNumber: 'SL-2024-0044' },
        { id: 'CONT005', type: '20ft', status: 'available', location: 'Depot MRU', sealNumber: 'SL-2024-0055' },
      ];
      localStorage.setItem('containers', JSON.stringify(mockContainers));
      setContainers(mockContainers);
    } else {
      setContainers(savedContainers);
    }

    const savedVehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
    const mergedVehicles = savedVehicles.length > 0 ? savedVehicles : DEFAULT_VEHICLES;
    localStorage.setItem('vehicles', JSON.stringify(mergedVehicles));
    setVehicles(mergedVehicles);

    setTrips(savedTrips.filter(t => t.status !== 'completed'));
  };

  const loadFromBackend = async () => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!user.country) return;
    try {
      const backendTrips = await api.getTrips(user.country);
      const mapped = backendTrips.map(t => ({
        id: `BE-${t.trip_id}`,
        backendId: t.trip_id,
        origin: `Site ${t.origin_site_id}`,
        destination: `Site ${t.destination_site_id}`,
        driverId: String(t.driver_id),
        vehicleId: String(t.vehicle_id),
        containerId: '',
        status: t.status === 'scheduled' ? 'pending' : t.status,
        createdAt: t.created_at || new Date().toISOString(),
        milestones: [],
        handovers: [],
        alerts: [],
        source: 'backend',
      }));
      setTrips(prev => {
        const localOnly = prev.filter(t => !t.source);
        const backendIds = new Set(mapped.map(t => t.backendId));
        const deduped = localOnly.filter(t => !backendIds.has(t.backendId));
        return [...mapped, ...deduped].filter(t => t.status !== 'completed');
      });
    } catch (_) {
      // backend unavailable — localStorage data remains in place
    }
  };

  const checkForAlerts = () => {
    const allTrips  = JSON.parse(localStorage.getItem('trips') || '[]');
    const incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
    const newAlerts = [];

    allTrips.forEach(trip => {
      if (trip.status === 'at_border' && trip.milestones) {
        const borderArrival = trip.milestones.find(m => m.type === 'arrived_at_border');
        if (borderArrival) {
          const hoursStuck = (new Date() - new Date(borderArrival.timestamp)) / 3600000;
          if (hoursStuck > 4) {
            newAlerts.push({
              id: `alert_${trip.id}`,
              tripId: trip.id,
              type: 'border_congestion',
              message: `Container ${trip.containerId} stuck at border for ${Math.floor(hoursStuck)}h`,
              timestamp: new Date().toISOString(),
            });
          }
        }
      }
    });

    const recentIncidents = incidents.filter(i => (new Date() - new Date(i.reportedAt)) / 3600000 < 24);
    recentIncidents.forEach(incident => {
      newAlerts.push({
        id: `alert_inc_${incident.id}`,
        incidentId: incident.id,
        tripId: incident.tripId,
        type: 'incident',
        message: incident.description,
        timestamp: incident.reportedAt,
      });
    });

    setAlerts(prev => {
      const existingIds = new Set(prev.map(a => a.id));
      const fresh = newAlerts.filter(a => !existingIds.has(a.id));
      return fresh.length > 0 ? [...fresh, ...prev] : prev;
    });
  };

  const createTrip = async (e) => {
    e.preventDefault();
    const trip = {
      id: `TRIP${Date.now()}`,
      ...newTrip,
      status: 'pending',
      createdAt: new Date().toISOString(),
      milestones: [],
      handovers: [],
      alerts: [],
    };

    const updatedDrivers = drivers.map(d =>
      d.id === newTrip.driverId ? { ...d, status: 'on_trip', currentTrip: trip.id } : d
    );
    localStorage.setItem('drivers', JSON.stringify(updatedDrivers));
    setDrivers(updatedDrivers);

    const updatedContainers = containers.map(c =>
      c.id === newTrip.containerId ? { ...c, status: 'assigned', currentTrip: trip.id } : c
    );
    localStorage.setItem('containers', JSON.stringify(updatedContainers));
    setContainers(updatedContainers);

    const allTrips = JSON.parse(localStorage.getItem('trips') || '[]');
    localStorage.setItem('trips', JSON.stringify([...allTrips, trip]));
    setTrips(prev => [...prev, trip]);

    // Mirror to backend (best-effort — UI is already updated via localStorage)
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (user.country) {
      try {
        const result = await api.createTrip(user.country, {
          vehicle_id: parseInt(newTrip.vehicleId) || null,
          driver_id: user.id || null,
          origin_site_id: SITE_IDS[user.country] || null,
          destination_site_id: null,
          containers: newTrip.containerId ? [newTrip.containerId] : [],
        });
        // store backend trip_id alongside local trip
        const saved = JSON.parse(localStorage.getItem('trips') || '[]');
        const patched = saved.map(t => t.id === trip.id ? { ...t, backendId: result.trip_id } : t);
        localStorage.setItem('trips', JSON.stringify(patched));
      } catch (_) {
        // proceed with local-only trip — will sync later via queueForSync
      }
    }

    queueForSync('trip_created', trip);
    setShowAssignForm(false);
    setNewTrip({ origin: '', destination: '', containerId: '', sealNumber: '', driverId: '', vehicleId: '', scheduledPickup: '' });
    alert(`Trip ${trip.id} created and assigned!`);
  };

  const rerouteTrip = () => {
    if (!newDestination.trim()) return;
    const allTrips = JSON.parse(localStorage.getItem('trips') || '[]');
    const updated = allTrips.map(t =>
      t.id === selectedTrip.id
        ? { ...t, destination: newDestination, rerouted: true, reroutedAt: new Date().toISOString() }
        : t
    );
    localStorage.setItem('trips', JSON.stringify(updated));
    queueForSync('trip_rerouted', { tripId: selectedTrip.id, newDestination });
    setTrips(updated.filter(t => t.status !== 'completed'));
    setSelectedTrip(null);
    setNewDestination('');
    alert(`Trip ${selectedTrip.id} rerouted to ${newDestination}`);
  };

  const acknowledgeAlert = (alertId) => setAlerts(prev => prev.filter(a => a.id !== alertId));

  const queueForSync = (operation, data) => {
    const entry = {
      id: `sync_${Date.now()}`,
      operation,
      data,
      local_time: new Date().toISOString(),
      sync_status: 'pending',
      role: 'dispatcher',
    };
    const syncLog = JSON.parse(localStorage.getItem('sync_log') || '[]');
    syncLog.push(entry);
    localStorage.setItem('sync_log', JSON.stringify(syncLog));

    // Also fire-and-forget to backend incidents/milestones endpoints
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!user.country) return;
    if (operation === 'incident_created' && data.tripId) {
      api.createIncident(user.country, {
        trip_id: data.backendTripId || data.tripId,
        reported_by_site_id: SITE_IDS[user.country],
        incident_type: data.type,
        description: data.description,
        severity: data.severity || 'medium',
        occurred_at: new Date().toISOString(),
      }).catch(() => {});
    }
  };

  const availableDrivers    = drivers.filter(d => d.status === 'available');
  const availableContainers = containers.filter(c => c.status === 'available');

  return (
    <div style={s.page}>
      {/* Top bar */}
      <div style={s.topBar}>
        <h1 style={s.pageTitle}>Active Shipments</h1>
        <button style={s.createBtn} onClick={() => setShowAssignForm(true)}>+ New Assignment</button>
      </div>

      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { label: 'Total Trips',         value: trips.length,                                     color: '#2563eb' },
          { label: 'In Transit',          value: trips.filter(t => t.status === 'in_progress').length, color: '#7c3aed' },
          { label: 'At Border',           value: trips.filter(t => t.status === 'at_border').length,   color: '#d97706' },
          { label: 'Available Drivers',   value: availableDrivers.length,                          color: '#16a34a' },
        ].map(st => (
          <div key={st.label} style={s.statCard}>
            <div style={{ ...s.statValue, color: st.color }}>{st.value}</div>
            <div style={s.statLabel}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={s.alertBanner}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>
            ⚠ {alerts.length} Active Alert{alerts.length > 1 ? 's' : ''}
          </div>
          {alerts.map(a => (
            <div key={a.id} style={s.alertRow}>
              <span style={s.alertMsg}>{a.message}</span>
              <button style={s.dismissBtn} onClick={() => acknowledgeAlert(a.id)}>Dismiss</button>
            </div>
          ))}
        </div>
      )}

      {/* Content columns */}
      <div style={s.cols}>
        {/* Trips list */}
        <div id="trips-section">
          <p style={s.sectionTitle}>Shipments ({trips.length})</p>
          <div style={s.tripGrid}>
            {trips.length === 0 && (
              <div style={s.emptyTrips}>No active shipments. Create one to get started.</div>
            )}
            {trips.map(trip => {
              const st = STATUS_MAP[trip.status] || STATUS_MAP.pending;
              const driverName = drivers.find(d => d.id === trip.driverId)?.name || trip.driverId;
              return (
                <div key={trip.id} style={s.tripCard}>
                  <div style={s.tripTop}>
                    <span style={s.tripId}>{trip.id}</span>
                    <span style={s.badge(trip.status)}>{st.label}</span>
                  </div>
                  <div style={s.tripMeta}>
                    <div style={s.metaItem}><span style={s.metaKey}>Container</span><span style={s.metaVal}>{trip.containerId}</span></div>
                    <div style={s.metaItem}><span style={s.metaKey}>Driver</span><span style={s.metaVal}>{driverName}</span></div>
                    <div style={s.metaItem}><span style={s.metaKey}>Route</span><span style={s.metaVal}>{trip.origin} → {trip.destination}</span></div>
                    <div style={s.metaItem}><span style={s.metaKey}>Vehicle</span><span style={s.metaVal}>{trip.vehicleId}</span></div>
                    {trip.sealNumber && <div style={s.metaItem}><span style={s.metaKey}>Seal</span><span style={s.metaVal}>{trip.sealNumber}</span></div>}
                    {trip.scheduledPickup && <div style={s.metaItem}><span style={s.metaKey}>Pickup</span><span style={s.metaVal}>{new Date(trip.scheduledPickup).toLocaleString()}</span></div>}
                  </div>
                  {trip.status === 'at_border' && (
                    <button style={s.rerouteBtn} onClick={() => { setSelectedTrip(trip); setNewDestination(''); }}>
                      ↪ Reroute Trip
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Resource panel */}
        <div id="resources-section" style={s.resourcePanel}>
          <div style={s.resourceCard}>
            <p style={s.resourceTitle}>Available Drivers ({availableDrivers.length})</p>
            <ul style={s.resourceList}>
              {availableDrivers.length === 0 && <li style={{ ...s.resourceItem, color: '#9ca3af' }}>All drivers on assignment</li>}
              {availableDrivers.map(d => (
                <li key={d.id} style={s.resourceItem}>
                  <span style={s.dot('#16a34a')} />
                  <span>{d.name}</span>
                  <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: '11px' }}>{d.country}</span>
                </li>
              ))}
            </ul>
          </div>
          <div style={s.resourceCard}>
            <p style={s.resourceTitle}>Available Containers ({availableContainers.length})</p>
            <ul style={s.resourceList}>
              {availableContainers.length === 0 && <li style={{ ...s.resourceItem, color: '#9ca3af' }}>No containers available</li>}
              {availableContainers.map(c => (
                <li key={c.id} style={s.resourceItem}>
                  <span style={s.dot('#2563eb')} />
                  <span>{c.id}</span>
                  <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: '11px' }}>{c.type}</span>
                </li>
              ))}
            </ul>
          </div>
          <div style={s.resourceCard}>
            <p style={s.resourceTitle}>Fleet ({vehicles.length} vehicles)</p>
            <ul style={s.resourceList}>
              {vehicles.map(v => (
                <li key={v.id} style={s.resourceItem}>
                  <span style={s.dot('#7c3aed')} />
                  <span>{v.plate}</span>
                  <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: '11px' }}>{v.type}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Create Trip Modal */}
      {showAssignForm && (
        <div style={s.overlay} onClick={() => setShowAssignForm(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>Create New Shipment</h3>
              <button style={s.closeBtn} onClick={() => setShowAssignForm(false)}>✕</button>
            </div>
            <form onSubmit={createTrip}>
              <div style={s.formGroup}>
                <label style={s.label}>Origin *</label>
                <input style={s.input} value={newTrip.origin} onChange={e => setNewTrip({ ...newTrip, origin: e.target.value })} placeholder="e.g. Depot SA" required />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Destination *</label>
                <input style={s.input} value={newTrip.destination} onChange={e => setNewTrip({ ...newTrip, destination: e.target.value })} placeholder="e.g. Port Maputo" required />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Container *</label>
                <input
                  style={s.input}
                  type="text"
                  list="container-list"
                  value={newTrip.containerId}
                  onChange={e => {
                    const selected = containers.find(c => c.id === e.target.value);
                    setNewTrip({ ...newTrip, containerId: e.target.value, sealNumber: selected?.sealNumber || '' });
                  }}
                  placeholder="Select or type container ID"
                  required
                />
                <datalist id="container-list">
                  {availableContainers.map(c => (
                    <option key={c.id} value={c.id}>{c.id} ({c.type}) — {c.location}</option>
                  ))}
                </datalist>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Seal Number</label>
                <input style={s.inputReadonly} value={newTrip.sealNumber} readOnly placeholder="Auto-filled when container is selected" />
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Driver *</label>
                <select style={s.select} value={newTrip.driverId} onChange={e => setNewTrip({ ...newTrip, driverId: e.target.value })} required>
                  <option value="">Select Driver</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.country}) — {d.status === 'available' ? 'Available' : 'On Trip'}
                    </option>
                  ))}
                </select>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Vehicle *</label>
                <select style={s.select} value={newTrip.vehicleId} onChange={e => setNewTrip({ ...newTrip, vehicleId: e.target.value })} required>
                  <option value="">Select Vehicle</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.id} — {v.plate} ({v.type})</option>
                  ))}
                </select>
              </div>
              <div style={s.formGroup}>
                <label style={s.label}>Scheduled Pickup</label>
                <input style={s.input} type="datetime-local" value={newTrip.scheduledPickup} onChange={e => setNewTrip({ ...newTrip, scheduledPickup: e.target.value })} />
              </div>
              <div style={s.modalFooter}>
                <button type="button" style={s.btnCancel} onClick={() => setShowAssignForm(false)}>Cancel</button>
                <button type="submit" style={s.btnBlue}>Create Shipment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reroute Modal */}
      {selectedTrip && (
        <div style={s.overlay} onClick={() => setSelectedTrip(null)}>
          <div style={{ ...s.modal, width: '420px' }} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h3 style={s.modalTitle}>Reroute Shipment</h3>
              <button style={s.closeBtn} onClick={() => setSelectedTrip(null)}>✕</button>
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 18px 0' }}>
              Current destination: <strong style={{ color: '#111827' }}>{selectedTrip.destination}</strong>
            </p>
            <div style={s.formGroup}>
              <label style={s.label}>New Destination</label>
              <input style={s.input} value={newDestination} onChange={e => setNewDestination(e.target.value)} placeholder="Enter new destination" autoFocus />
            </div>
            <div style={s.modalFooter}>
              <button style={s.btnCancel} onClick={() => setSelectedTrip(null)}>Cancel</button>
              <button style={s.btnAmber} onClick={rerouteTrip}>Confirm Reroute</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispatcherDashboard;
