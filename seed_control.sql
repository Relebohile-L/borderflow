-- BorderFlow Control Database Seed
-- Database: borderflow_control
-- The control DB receives synced records from site DBs (SA, MOZ, MRU).
-- Main entity tables (country, site, staff, driver, vehicle, client,
-- container, trip, trip_container) are empty by design — data lives in
-- the site databases and is aggregated here for reporting.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- milestone (synced from all sites)
INSERT INTO milestone (milestone_id, trip_id, container_id, site_id, milestone_type, occurred_at, recorded_by_staff_id, notes) VALUES
(1,  1, 1, 1, 'departure', '2026-04-26 18:00:00', NULL, 'Test milestone MRU'),
(4,  4, 1, 1, 'departure', '2026-04-26 18:00:00', NULL, 'Test milestone SA'),
(11, 1, 1, 1, 'departure', '2026-04-26 18:00:00', NULL, 'Test milestone MOZ');

-- clearance (synced from all sites)
INSERT INTO clearance (clearance_id, trip_id, container_id, border_site_id, reference_number, submitted_at, cleared_at, cleared_by_staff_id, status, notes) VALUES
(2, 11, 27, 2, 'CLR-003', NULL, NULL, NULL, 'pending', NULL);

-- handover (synced from all sites)
INSERT INTO handover (handover_id, trip_id, container_id, from_site_id, to_site_id, released_by_staff_id, received_by_staff_id, seal_status, handover_time, latitude, longitude, notes) VALUES
(2,  1, 1, 1, 1, NULL, NULL, 'intact', '2026-04-26 17:00:00', '-20.161197', '57.498480', 'Test handover MRU'),
(5,  4, 1, 1, 2, NULL, NULL, 'intact', '2026-04-26 17:00:00', '-26.204103', '28.047305', 'Test handover SA'),
(11, 1, 1, 1, 2, NULL, NULL, 'intact', '2026-04-26 17:00:00', '-25.964917', '32.577500', 'Test handover MOZ');

-- incident (synced from all sites)
INSERT INTO incident (incident_id, trip_id, container_id, reported_by_site_id, incident_type, description, severity, occurred_at, resolved_at, status) VALUES
(1, 4, 1, 1, 'damage', 'Container damaged during loading',    'medium', '2026-04-26 17:00:00', NULL, 'open'),
(4, 4, 1, 1, 'theft',  'Cargo theft reported at border post', 'high',   '2026-04-26 18:00:00', NULL, 'open');

SET FOREIGN_KEY_CHECKS = 1;
