// src/components/CustomerDashboard.jsx
import React, { useState, useEffect } from 'react';

const STATUS_BADGE = {
  delivered:         { bg: '#fce7f3', color: '#9d174d', dot: '#f43f5e',  label: 'Delivered' },
  booking_confirmed: { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b',  label: 'Booking confirmed' },
  in_transit:        { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6',  label: 'In Transit' },
  at_border:         { bg: '#fef9c3', color: '#854d0e', dot: '#eab308',  label: 'At Border' },
  cleared:           { bg: '#dcfce7', color: '#166534', dot: '#22c55e',  label: 'Customs Cleared' },
};

const MOCK_SHIPMENTS = [
  {
    id: 'SHP001',
    containerCode: 'MSKU-7821934',
    cargo: 'Textiles',
    destination: 'Hamburg',
    status: 'delivered',
    currentLocation: 'Destination Hub',
    eta: '5/1/2026',
    hasDelay: true,
    milestones: [
      { icon: '📦', label: 'Handover Completed',          ts: '4/26/2026, 2:53:37 PM' },
      { icon: '📍', label: 'Arrived at Destination',      ts: '4/26/2026, 2:53:36 PM' },
      { icon: '🌍', label: 'Crossed border',              ts: '4/26/2026, 2:53:32 PM' },
      { icon: '📋', label: 'Queued',                      ts: '4/24/2026, 9:39:58 PM' },
      { icon: '📄', label: 'Documents submitted',         ts: '4/25/2026, 12:39:58 AM' },
      { icon: '🛃', label: 'Arrived at border',           ts: '4/24/2026, 10:39:58 PM' },
      { icon: '✅', label: 'Departed depot',              ts: '4/24/2026, 4:39:58 PM' },
      { icon: '🚛', label: 'Picked up by carrier',        ts: '4/24/2026, 2:39:58 PM' },
      { icon: '🏭', label: 'Container received at depot', ts: '4/24/2026, 2:39:58 AM' },
      { icon: '🔖', label: 'Booking created',             ts: '4/23/2026, 2:39:58 PM' },
    ],
  },
  {
    id: 'SHP002',
    containerCode: 'HLXU-3344219',
    cargo: 'Apparel',
    destination: 'Felixstowe',
    status: 'booking_confirmed',
    currentLocation: 'Maseru Depot',
    eta: '5/9/2026',
    hasDelay: false,
    milestones: [],
  },
];

const s = {
  page: {
    padding: '28px 36px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: '#f3f4f6',
    minHeight: '100vh',
  },
  list: {
    maxWidth: '620px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    padding: '20px 24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2px',
  },
  containerCode: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#111827',
  },
  badge: (status) => {
    const st = STATUS_BADGE[status] || STATUS_BADGE.in_transit;
    return {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      background: st.bg,
      color: st.color,
    };
  },
  badgeDot: (status) => ({
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: (STATUS_BADGE[status] || STATUS_BADGE.in_transit).dot,
    flexShrink: 0,
  }),
  cardSub: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '14px',
  },
  infoRow: {
    display: 'flex',
    gap: '28px',
    marginBottom: '16px',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '13px',
    color: '#6b7280',
  },
  delayBanner: {
    background: '#fefce8',
    border: '1px solid #fde68a',
    borderRadius: '8px',
    padding: '10px 14px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  },
  delayText: {
    fontSize: '13px',
    color: '#854d0e',
  },
  milestonesLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '12px',
  },
  timelineList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  timelineItem: {
    display: 'flex',
    gap: '12px',
    paddingBottom: '14px',
    position: 'relative',
  },
  timelineDotWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexShrink: 0,
    width: '18px',
  },
  timelineDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#3b82f6',
    flexShrink: 0,
    marginTop: '3px',
  },
  timelineLine: {
    width: '2px',
    flex: 1,
    background: '#e5e7eb',
    marginTop: '4px',
  },
  timelineIcon: {
    fontSize: '16px',
    flexShrink: 0,
    marginTop: '1px',
  },
  timelineContent: {
    flex: 1,
  },
  timelineName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
    marginBottom: '2px',
  },
  timelineTs: {
    fontSize: '12px',
    color: '#9ca3af',
  },
};

const ClientPortal = () => {
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('clientShipments') || 'null');
    if (!saved) {
      localStorage.setItem('clientShipments', JSON.stringify(MOCK_SHIPMENTS));
      setShipments(MOCK_SHIPMENTS);
    } else {
      setShipments(saved);
    }
  }, []);

  return (
    <div style={s.page}>
      <div style={s.list}>
        {shipments.map((sh) => {
          const badge = STATUS_BADGE[sh.status] || STATUS_BADGE.in_transit;
          return (
            <div key={sh.id} style={s.card}>
              {/* Top row */}
              <div style={s.cardTop}>
                <span style={s.containerCode}>{sh.containerCode}</span>
                <span style={s.badge(sh.status)}>
                  <span style={s.badgeDot(sh.status)} />
                  {badge.label}
                </span>
              </div>

              {/* Route */}
              <div style={s.cardSub}>{sh.cargo} → {sh.destination}</div>

              {/* Location + ETA */}
              <div style={s.infoRow}>
                <span style={s.infoItem}>📍 {sh.currentLocation}</span>
                <span style={s.infoItem}>📅 ETA: {sh.eta}</span>
              </div>

              {/* Delay banner */}
              {sh.hasDelay && (
                <div style={s.delayBanner}>
                  <span>🔔</span>
                  <div>
                    <div style={{ ...s.delayText, fontWeight: '600', marginBottom: '2px' }}>Delay notice</div>
                    <div style={s.delayText}>Your shipment is experiencing a delay. We'll keep you posted.</div>
                  </div>
                </div>
              )}

              {/* Milestones */}
              {sh.milestones.length > 0 && (
                <>
                  <div style={s.milestonesLabel}>Milestones</div>
                  <ul style={s.timelineList}>
                    {sh.milestones.map((m, i) => (
                      <li key={i} style={s.timelineItem}>
                        <div style={s.timelineDotWrap}>
                          <span style={s.timelineDot} />
                          {i < sh.milestones.length - 1 && <span style={s.timelineLine} />}
                        </div>
                        <span style={s.timelineIcon}>{m.icon}</span>
                        <div style={s.timelineContent}>
                          <div style={s.timelineName}>{m.label}</div>
                          <div style={s.timelineTs}>{m.ts}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {sh.milestones.length === 0 && (
                <div style={s.milestonesLabel}>Milestones</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClientPortal;
