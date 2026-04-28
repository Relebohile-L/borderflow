import React, { useState, useEffect } from 'react';
import './DriverDashboard.css';

const ControlTower = () => {
  const [allTrips, setAllTrips] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [kpis, setKpis] = useState({
    totalTrips: 0,
    activeTrips: 0,
    completedTrips: 0,
    pendingClearances: 0,
    incidentsToday: 0
  });

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadAllData = () => {
    const trips = JSON.parse(localStorage.getItem('trips') || '[]');
    const driverTrips = JSON.parse(localStorage.getItem('driverTrips') || '[]');
    const allTripsData = [...trips, ...driverTrips];
    const uniqueTrips = Array.from(new Map(allTripsData.map(t => [t.id, t])).values());
    
    const incidentsList = JSON.parse(localStorage.getItem('incidents') || '[]');
    
    setAllTrips(uniqueTrips);
    setIncidents(incidentsList);
    
    setKpis({
      totalTrips: uniqueTrips.length,
      activeTrips: uniqueTrips.filter(t => t.status !== 'completed').length,
      completedTrips: uniqueTrips.filter(t => t.status === 'completed').length,
      pendingClearances: uniqueTrips.filter(t => t.status === 'at_border').length,
      incidentsToday: incidentsList.filter(i => new Date(i.timestamp).toDateString() === new Date().toDateString()).length
    });
  };

  const getAverageDwellTime = () => {
    const completed = allTrips.filter(t => t.status === 'completed' && t.createdAt);
    if (completed.length === 0) return 0;
    
    const times = completed.map(trip => {
      const start = new Date(trip.createdAt);
      const delivery = trip.milestones?.find(m => m.type === 'delivery');
      const end = delivery ? new Date(delivery.timestamp) : new Date();
      return (end - start) / (1000 * 60 * 60);
    });
    
    return (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1);
  };

  return (
    <div className="control-tower">
      <header className="tower-header">
        <h1>Control Tower</h1>
        <p>Global Container Monitoring Dashboard</p>
      </header>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-value">{kpis.totalTrips}</div>
          <div className="kpi-label">Total Trips</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{kpis.activeTrips}</div>
          <div className="kpi-label">Active Trips</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{kpis.completedTrips}</div>
          <div className="kpi-label">Completed</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{kpis.pendingClearances}</div>
          <div className="kpi-label">Pending Clearance</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{getAverageDwellTime()}h</div>
          <div className="kpi-label">Avg Dwell Time</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-value">{kpis.incidentsToday}</div>
          <div className="kpi-label">Incidents Today</div>
        </div>
      </div>

      <section className="timeline-section">
        <h2>Recent Container Journeys</h2>
        <div className="timeline">
          {allTrips.filter(t => t.status === 'completed').slice(-5).reverse().map(trip => (
            <div key={trip.id} className="timeline-item">
              <div className="timeline-marker completed"></div>
              <div className="timeline-content">
                <h4>Container {trip.containerId} - Trip {trip.id}</h4>
                <div className="timeline-stops">
                  {trip.milestones?.map((m, idx) => (
                    <span key={idx} className="stop">{m.type.replace('_', ' ')}</span>
                  ))}
                </div>
                <small>{new Date(trip.createdAt).toLocaleDateString()}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="incidents-section">
        <h2>Recent Incidents</h2>
        <div className="incidents-list">
          {incidents.slice(-5).reverse().map(incident => (
            <div key={incident.id} className="incident-card">
              <div className={`incident-type ${incident.type}`}>
                {incident.type.toUpperCase()}
              </div>
              <div className="incident-details">
                <p><strong>Trip:</strong> {incident.tripId}</p>
                <p>{incident.description}</p>
                <small>{new Date(incident.timestamp).toLocaleString()}</small>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ControlTower;