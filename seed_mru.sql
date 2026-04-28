-- BorderFlow MRU Database Seed
-- Database: borderflow_mru
-- All staff/client passwords = "password" (bcrypt)

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- country
INSERT INTO country (country_id, name, iso_code) VALUES
(1,  'Mauritius',   'MRU'),
(2,  'South Africa','ZA'),
(3,  'India',       'IN'),
(4,  'China',       'CN'),
(5,  'France',      'FR'),
(6,  'UAE',         'AE'),
(7,  'Madagascar',  'MG'),
(8,  'Seychelles',  'SC'),
(9,  'Reunion',     'RE'),
(10, 'Maldives',    'MV');

-- site
INSERT INTO site (site_id, country_id, name, site_type, address, latitude, longitude) VALUES
(1,  1, 'port louis con terminal',      'port',   'port louis harbour',                            NULL,          NULL),
(2,  1, 'Mer Rouge Warehouse Depot',    'depot',  'Mer Rouge, Port Louis, Mauritius',              '-20.155800',  '57.501900'),
(3,  1, 'MRU HQ',                       'depot',  'Port Louis, Mauritius',                         NULL,          NULL),
(4,  1, 'MFA Freeport Border Zone',     'border', 'Freeport Zone, Mer Rouge, Port Louis',          '-20.152100',  '57.503400'),
(5,  1, 'SSR Airport Border Control',   'border', 'Plaine Magnien, Mahebourg, Mauritius',          '-20.430200',  '57.683600'),
(6,  1, 'Terre Rouge Transport Depot',  'depot',  'Terre Rouge, Port Louis, Mauritius',            '-20.110000',  '57.530000'),
(7,  1, 'Riche Terre Container Depot',  'depot',  'Riche Terre, Port Louis, Mauritius',            '-20.105000',  '57.515000'),
(8,  1, 'Les Salines Cold Chain Depot', 'depot',  'Les Salines, Port Louis, Mauritius',            '-20.148000',  '57.498000'),
(9,  1, 'Mer Rouge Staging Depot',      'depot',  'Mer Rouge North, Port Louis, Mauritius',        '-20.153500',  '57.500800'),
(10, 1, 'Trou Fanfaron Port Terminal',  'port',   'Trou Fanfaron, Port Louis, Mauritius',          '-20.145500',  '57.494500');

-- staff
INSERT INTO staff (staff_id, site_id, first_name, last_name, role, email, username, password) VALUES
(14, 2, 'Joao',   'Mucavele', 'manager',    'jmucavele@borderflow.mz', 'mru_jmucavele', '$2b$12$1aExSMH1dMaFd1MvvWHDyOiQkzpwPtjRl1oz1rmAT0HfyfASJ9eNe'),
(15, 4, 'Fatima', 'Chissano', 'port_agent', 'fchissano@borderflow.mz', 'mru_fchissano', '$2b$12$1aExSMH1dMaFd1MvvWHDyOiQkzpwPtjRl1oz1rmAT0HfyfASJ9eNe'),
(16, 7, 'Carlos', 'Mabunda',  'dispatcher', 'cmabunda@borderflow.mz',  'mru_cmabunda',  '$2b$12$1aExSMH1dMaFd1MvvWHDyOiQkzpwPtjRl1oz1rmAT0HfyfASJ9eNe');

-- driver
INSERT INTO driver (driver_id, first_name, last_name, license_number, phone, status) VALUES
(1,  'Anand',     'Ramkhelawon', 'MU-DRV-001-2022', '+230 5 711 0001', 'active'),
(16, 'Armindo',   'Macuacua',    'MOZ-DL-1006',     '+258841001006',   'active'),
(17, 'Feliciano', 'Mondlane',    'MOZ-DL-1007',     '+258841001007',   'active'),
(18, 'Helder',    'Matsimbe',    'MOZ-DL-1008',     '+258841001008',   'active'),
(19, 'Gilberto',  'Tembe',       'MOZ-DL-1009',     '+258841001009',   'active'),
(20, 'Narciso',   'Zunguze',     'MOZ-DL-1010',     '+258841001010',   'active'),
(21, 'Domingos',  'Chauque',     'MOZ-DL-1011',     '+258841001011',   'active'),
(22, 'Americo',   'Nhaca',       'MOZ-DL-1012',     '+258841001012',   'active'),
(23, 'Celestino', 'Macie',       'MOZ-DL-1013',     '+258841001013',   'active'),
(24, 'Ernesto',   'Cumbe',       'MOZ-DL-1014',     '+258841001014',   'active'),
(25, 'Rodrigo',   'Magaia',      'MOZ-DL-1015',     '+258841001015',   'active');

-- vehicle
INSERT INTO vehicle (vehicle_id, registration, make, model, max_payload_kg, status) VALUES
(1,  'MU-PL-2001', 'hino',     '500 series',   18000.00, 'available'),
(16, 'MOZ-006-AF', 'Mercedes', 'Actros 2645',  32000.00, 'available'),
(17, 'MOZ-007-AG', 'Volvo',    'FM400',        27000.00, 'available'),
(18, 'MOZ-008-AH', 'Scania',   'G450',         29000.00, 'available'),
(19, 'MOZ-009-AI', 'MAN',      'TGS26',        26000.00, 'available'),
(20, 'MOZ-010-AJ', 'DAF',      'CF85',         28000.00, 'available'),
(21, 'MOZ-011-AK', 'Mercedes', 'Actros 1844',  30000.00, 'available'),
(22, 'MOZ-012-AL', 'Volvo',    'FH500',        31000.00, 'available'),
(23, 'MOZ-013-AM', 'Scania',   'R580',         33000.00, 'available'),
(24, 'MOZ-014-AN', 'MAN',      'TGX33',        25000.00, 'available'),
(25, 'MOZ-015-AO', 'DAF',      'XF480',        27500.00, 'available');

-- client
INSERT INTO client (client_id, company_name, contact_name, email, phone, username, password) VALUES
(2, 'Maputo Freight Co', 'Ana Luis', 'ana@maputofreight.mz', '+258-222-2222', 'mru_maputo',
 '$2b$12$nBdN0Cfs4Hm79DLipEuodOvaTp6ybC5TTqhTx91ueJi3oHGER0f3y');

-- container
INSERT INTO container (container_id, iso_code, container_type, tare_weight_kg, status, seal_number) VALUES
(1,  'BFMU0000011', '20GP', 2200.00, 'loaded', NULL),
(16, 'MOZ-CON-006', '40GP', 3900.00, 'empty',  NULL),
(17, 'MOZ-CON-007', '20GP', 2200.00, 'empty',  NULL),
(18, 'MOZ-CON-008', '40HC', 4100.00, 'empty',  NULL),
(19, 'MOZ-CON-009', '20GP', 2150.00, 'empty',  NULL),
(20, 'MOZ-CON-010', '40GP', 3850.00, 'empty',  NULL),
(21, 'MOZ-CON-011', '20GP', 2250.00, 'empty',  NULL),
(22, 'MOZ-CON-012', '40HC', 4050.00, 'empty',  NULL),
(23, 'MOZ-CON-013', '20GP', 2100.00, 'empty',  NULL),
(24, 'MOZ-CON-014', '40GP', 3950.00, 'empty',  NULL),
(25, 'MOZ-CON-015', '40HC', 4200.00, 'empty',  NULL);

-- trip
INSERT INTO trip (trip_id, vehicle_id, driver_id, origin_site_id, destination_site_id, scheduled_departure, actual_departure, actual_arrival, status) VALUES
(1,  1,  1,  1, 1, NULL, NULL, NULL, 'scheduled'),
(4,  17, 17, 1, 1, NULL, NULL, NULL, 'scheduled'),
(11, 23, 23, 1, 1, NULL, NULL, NULL, 'scheduled'),
(17, 25, 25, 1, 1, NULL, NULL, NULL, 'scheduled'),
(18, 16, 18, 2, 7, NULL, NULL, NULL, 'scheduled'),
(19, 18, 16, 4, 6, NULL, NULL, NULL, 'scheduled'),
(20, 19, 24, 2, 8, NULL, NULL, NULL, 'scheduled');

-- trip_container
INSERT INTO trip_container (trip_id, container_id, assigned_at) VALUES
(1,  1,  '2026-04-23 18:40:36'),
(4,  17, '2026-04-26 14:07:10'),
(11, 23, '2026-04-26 16:19:04'),
(17, 25, '2026-04-26 16:46:04'),
(18, 16, '2026-04-28 02:20:18'),
(19, 18, '2026-04-28 02:20:46'),
(20, 19, '2026-04-27 21:27:47'),
(20, 21, '2026-04-27 21:27:47');

-- milestone
INSERT INTO milestone (milestone_id, trip_id, container_id, site_id, milestone_type, occurred_at, recorded_by_staff_id, notes) VALUES
(1, 1, 1,  1, 'departure', '2026-04-26 18:00:00', NULL, 'Test milestone MRU'),
(2, 4, 16, 1, 'arrival',   '2026-04-26 19:00:00', NULL, 'Test auto sync MRU');

-- clearance
INSERT INTO clearance (clearance_id, trip_id, container_id, border_site_id, reference_number, submitted_at, cleared_at, cleared_by_staff_id, status, notes) VALUES
(3, 11, 24, 1, 'CLR-003', NULL, NULL, NULL, 'pending', NULL);

-- handover
INSERT INTO handover (handover_id, trip_id, container_id, from_site_id, to_site_id, released_by_staff_id, received_by_staff_id, seal_status, handover_time, latitude, longitude, notes) VALUES
(2, 1, 1, 1, 1, NULL, NULL, 'intact', '2026-04-26 17:00:00', '-20.161197', '57.498480', 'Test handover MRU');

-- incident
INSERT INTO incident (incident_id, trip_id, container_id, reported_by_site_id, incident_type, description, severity, occurred_at, resolved_at, status) VALUES
(1, 1, 1, 1, 'damage', 'Container damaged during loading', 'medium', '2026-04-26 17:00:00', NULL, 'open');

SET FOREIGN_KEY_CHECKS = 1;
