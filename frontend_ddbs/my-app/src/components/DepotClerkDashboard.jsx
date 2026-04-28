// src/components/DepotClerkDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const s = {
  container: {
    padding: '28px 36px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: '#f3f4f6',
    minHeight: '100vh',
  },
  tabBar: {
    display: 'flex',
    gap: '2px',
    marginBottom: '24px',
    borderBottom: '1px solid #e5e7eb',
  },
  tab: (active) => ({
    padding: '9px 18px',
    border: 'none',
    borderBottom: active ? '2.5px solid #2563eb' : '2.5px solid transparent',
    background: 'transparent',
    color: active ? '#2563eb' : '#6b7280',
    fontWeight: active ? '600' : '400',
    cursor: 'pointer',
    fontSize: '14px',
    marginBottom: '-1px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'color 0.15s',
  }),
  card: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    padding: '32px',
    maxWidth: '680px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  cardTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 6px 0',
  },
  cardSubtitle: {
    fontSize: '13px',
    color: '#6b7280',
    margin: '0 0 28px 0',
    lineHeight: '1.5',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px',
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#111827',
    background: 'white',
    cursor: 'pointer',
    outline: 'none',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#111827',
    background: 'white',
    boxSizing: 'border-box',
    outline: 'none',
  },
  formGroup: {
    marginBottom: '20px',
  },
  expectedBox: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '0',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px 20px',
    marginBottom: '24px',
  },
  expectedCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  expectedLabel: {
    fontSize: '11px',
    color: '#9ca3af',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  expectedValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
  },
  threeCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '14px',
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },
  buttonRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginTop: '28px',
  },
  btnOutline: {
    padding: '11px 20px',
    border: '1.5px solid #d1d5db',
    borderRadius: '8px',
    background: 'white',
    color: '#374151',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  btnBlue: {
    padding: '11px 20px',
    border: 'none',
    borderRadius: '8px',
    background: '#2563eb',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  btnBlueFull: {
    width: '100%',
    padding: '13px',
    border: 'none',
    borderRadius: '8px',
    background: '#2563eb',
    color: 'white',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px',
  },
};

const DepotClerkDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('gate-in');
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'gate-in')  { setActiveTab('gate-in');  setSearchParams({}); }
    if (action === 'gate-out') { setActiveTab('gate-out'); setSearchParams({}); }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps
  const [containers, setContainers] = useState([]);

  const [selectedTripId, setSelectedTripId] = useState('');
  const [gateInForm, setGateInForm] = useState({
    actualTruck: '',
    actualDriver: '',
    actualSeal: '',
    sealCondition: 'Intact',
    containerCondition: 'Good',
  });

  const [gateOutContainerId, setGateOutContainerId] = useState('');
  const [gateOutSeal, setGateOutSeal] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTrips(JSON.parse(localStorage.getItem('trips') || '[]'));
    setDrivers(JSON.parse(localStorage.getItem('drivers') || '[]'));
    setContainers(JSON.parse(localStorage.getItem('containers') || '[]'));
  };

  const pendingGateIn = trips.filter(t => t.status === 'pending' && !t.gatedIn);
  const pendingGateOut = containers.filter(c => c.gatedIn && !c.gatedOut);

  const selectedTrip = trips.find(t => t.id === selectedTripId) || null;
  const selectedDriver = selectedTrip ? drivers.find(d => d.id === selectedTrip.driverId) : null;
  const selectedContainerObj = selectedTrip ? containers.find(c => c.id === selectedTrip.containerId) : null;

  const handleTripSelect = (tripId) => {
    setSelectedTripId(tripId);
    setGateInForm({ actualTruck: '', actualDriver: '', actualSeal: '', sealCondition: 'Intact', containerCondition: 'Good', yardLocation: '' });
  };

  const handleConfirmGateIn = () => {
    if (!selectedTrip) return alert('Please select an expected container first.');

    const updatedContainers = containers.map(c =>
      c.id === selectedTrip.containerId
        ? { ...c, status: 'in_depot', gatedIn: true, gatedInAt: new Date().toISOString(), actualSeal: gateInForm.actualSeal, sealCondition: gateInForm.sealCondition, condition: gateInForm.containerCondition }
        : c
    );
    localStorage.setItem('containers', JSON.stringify(updatedContainers));

    const updatedTrips = trips.map(t =>
      t.id === selectedTripId ? { ...t, gatedIn: true, gatedInAt: new Date().toISOString() } : t
    );
    localStorage.setItem('trips', JSON.stringify(updatedTrips));

    const inspections = JSON.parse(localStorage.getItem('inspections') || '[]');
    inspections.push({
      id: `INSP${Date.now()}`,
      containerId: selectedTrip.containerId,
      tripId: selectedTripId,
      type: 'gate_in',
      ...gateInForm,
      inspector: 'Depot Clerk',
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('inspections', JSON.stringify(inspections));

    queueForSync('gate_in', { tripId: selectedTripId, containerId: selectedTrip.containerId });

    setSelectedTripId('');
    setGateInForm({ actualTruck: '', actualDriver: '', actualSeal: '', sealCondition: 'Intact', containerCondition: 'Good', yardLocation: '' });
    loadData();
    alert(`Gate-In confirmed for container ${selectedTrip.containerId}`);
  };

  const handleRecordGateOut = () => {
    if (!gateOutContainerId) return alert('Please select a container.');
    const container = containers.find(c => c.id === gateOutContainerId);
    if (!container) return;

    const expectedSeal = container.sealNumber || container.actualSeal || '';
    if (gateOutSeal !== expectedSeal) {
      const incidents = JSON.parse(localStorage.getItem('incidents') || '[]');
      incidents.push({
        id: `INC${Date.now()}`,
        type: 'seal_tampering',
        description: `Seal mismatch for container ${container.id}. Expected: ${expectedSeal}, Found: ${gateOutSeal}`,
        containerId: container.id,
        timestamp: new Date().toISOString(),
        status: 'reported',
      });
      localStorage.setItem('incidents', JSON.stringify(incidents));
      return alert('Seal mismatch! Incident logged. Please investigate.');
    }

    const updatedContainers = containers.map(c =>
      c.id === gateOutContainerId ? { ...c, status: 'in_transit', gatedOut: true, gateOutTime: new Date().toISOString() } : c
    );
    localStorage.setItem('containers', JSON.stringify(updatedContainers));

    const allTrips = JSON.parse(localStorage.getItem('trips') || '[]');
    localStorage.setItem('trips', JSON.stringify(
      allTrips.map(t => t.containerId === gateOutContainerId && !t.gatedOut ? { ...t, gatedOut: true, gatedOutAt: new Date().toISOString(), status: 'in_progress' } : t)
    ));

    const driverTrips = JSON.parse(localStorage.getItem('driverTrips') || '[]');
    localStorage.setItem('driverTrips', JSON.stringify(
      driverTrips.map(t => t.containerId === gateOutContainerId ? { ...t, status: 'in_progress', gatedOut: true } : t)
    ));

    queueForSync('gate_out', { containerId: gateOutContainerId });
    setGateOutContainerId('');
    setGateOutSeal('');
    loadData();
    alert(`Container ${gateOutContainerId} released for transit`);
  };

  const queueForSync = (operation, data) => {
    const syncLog = JSON.parse(localStorage.getItem('sync_log') || '[]');
    syncLog.push({ id: `sync_${Date.now()}`, operation, data, local_time: new Date().toISOString(), sync_status: 'pending', role: 'depot_clerk' });
    localStorage.setItem('sync_log', JSON.stringify(syncLog));
  };

  return (
    <div style={s.container}>
      {/* Tabs */}
      <div style={s.tabBar}>
        <button style={s.tab(activeTab === 'gate-in')} onClick={() => setActiveTab('gate-in')}>
          <span>→</span> Gate-In
        </button>
        <button style={s.tab(activeTab === 'gate-out')} onClick={() => setActiveTab('gate-out')}>
          <span>↗</span> Gate-Out
        </button>
      </div>

      {/* Gate-In */}
      {activeTab === 'gate-in' && (
        <div style={s.card}>
          <h2 style={s.cardTitle}>Verify Inbound Container</h2>
          <p style={s.cardSubtitle}>
            Confirm the arriving truck, driver and seal match the dispatcher's consignment record.
          </p>

          <div style={s.formGroup}>
            <label style={s.label}>Expected Container (scheduled by dispatcher)</label>
            <select style={s.select} value={selectedTripId} onChange={e => handleTripSelect(e.target.value)}>
              <option value="">Select container…</option>
              {pendingGateIn.map(trip => (
                <option key={trip.id} value={trip.id}>
                  {trip.containerId}
                </option>
              ))}
            </select>
          </div>

          {selectedTrip && (
            <div style={s.expectedBox}>
              <div style={s.expectedCol}>
                <span style={s.expectedLabel}>Expected truck</span>
                <span style={s.expectedValue}>{selectedTrip.vehicleId || '—'}</span>
              </div>
              <div style={s.expectedCol}>
                <span style={s.expectedLabel}>Expected driver</span>
                <span style={s.expectedValue}>{selectedDriver?.name || selectedTrip.driverId || '—'}</span>
              </div>
              <div style={s.expectedCol}>
                <span style={s.expectedLabel}>Recorded seal</span>
                <span style={s.expectedValue}>{selectedContainerObj?.sealNumber || selectedTrip.sealNumber || '—'}</span>
              </div>
            </div>
          )}

          <div style={{ ...s.threeCol, marginBottom: '20px' }}>
            <div>
              <label style={s.label}>Actual truck plate</label>
              <input
                style={s.input}
                value={gateInForm.actualTruck}
                onChange={e => setGateInForm({ ...gateInForm, actualTruck: e.target.value })}
                placeholder={selectedTrip?.vehicleId || ''}
              />
            </div>
            <div>
              <label style={s.label}>Actual driver name</label>
              <input
                style={s.input}
                value={gateInForm.actualDriver}
                onChange={e => setGateInForm({ ...gateInForm, actualDriver: e.target.value })}
                placeholder={selectedDriver?.name || ''}
              />
            </div>
            <div>
              <label style={s.label}>Actual seal on container</label>
              <input
                style={s.input}
                value={gateInForm.actualSeal}
                onChange={e => setGateInForm({ ...gateInForm, actualSeal: e.target.value })}
                placeholder={selectedContainerObj?.sealNumber || ''}
              />
            </div>
          </div>

          <div style={{ ...s.twoCol, marginBottom: '20px' }}>
            <div>
              <label style={s.label}>Seal condition</label>
              <select style={s.select} value={gateInForm.sealCondition} onChange={e => setGateInForm({ ...gateInForm, sealCondition: e.target.value })}>
                <option>Intact</option>
                <option>Damaged</option>
                <option>Broken</option>
                <option>Replaced</option>
              </select>
            </div>
            <div>
              <label style={s.label}>Container condition</label>
              <select style={s.select} value={gateInForm.containerCondition} onChange={e => setGateInForm({ ...gateInForm, containerCondition: e.target.value })}>
                <option>Good</option>
                <option>Minor Damage</option>
                <option>Major Damage</option>
                <option>Tampered</option>
              </select>
            </div>
          </div>

          <div style={s.buttonRow}>
            <button style={s.btnOutline} type="button">
              <span>📷</span> Take photo (optional)
            </button>
            <button style={s.btnBlue} type="button" onClick={handleConfirmGateIn}>
              <span>🛡</span> Confirm Gate-In
            </button>
          </div>
        </div>
      )}

      {/* Gate-Out */}
      {activeTab === 'gate-out' && (
        <div style={s.card}>
          <h2 style={s.cardTitle}>Container Gate-Out</h2>
          <p style={s.cardSubtitle}>Verifies truck/driver match dispatcher's assignment</p>

          <div style={s.formGroup}>
            <label style={s.label}>Container</label>
            <select style={s.select} value={gateOutContainerId} onChange={e => setGateOutContainerId(e.target.value)}>
              <option value="">Select</option>
              {pendingGateOut.map(c => (
                <option key={c.id} value={c.id}>{c.id}</option>
              ))}
            </select>
          </div>

          <div style={s.formGroup}>
            <label style={s.label}>Verify Seal Number</label>
            <input
              style={s.input}
              value={gateOutSeal}
              onChange={e => setGateOutSeal(e.target.value)}
              placeholder=""
            />
          </div>

          <button style={s.btnBlueFull} type="button" onClick={handleRecordGateOut}>
            Record Gate-Out
          </button>
        </div>
      )}
    </div>
  );
};

export default DepotClerkDashboard;
