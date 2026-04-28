-- BorderFlow MOZ Database Seed
-- Database: borderflow_moz
-- All staff/client passwords = "password" (bcrypt)

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- country
INSERT INTO country (country_id, name, iso_code) VALUES
(1,  'Mozambique',   'MZ'),
(2,  'South Africa', 'ZA'),
(3,  'Zimbabwe',     'ZW'),
(4,  'Zambia',       'ZM'),
(5,  'Malawi',       'MW'),
(6,  'Tanzania',     'TZ'),
(7,  'Eswatini',     'SZ'),
(8,  'Botswana',     'BW'),
(9,  'Namibia',      'NA'),
(10, 'Lesotho',      'LS');

-- site
INSERT INTO site (site_id, country_id, name, site_type, address, latitude, longitude) VALUES
(2,  1, 'Mer Rouge Warehouse Depot',    'depot',       'Mer Rouge, Port Louis, Mauritius',              '-20.155800', '57.501900'),
(4,  1, 'MFA Freeport Border Zone',     'border_post', 'Freeport Zone, Mer Rouge, Port Louis',          '-20.152100', '57.503400'),
(5,  1, 'SSR Airport Border Control',   'border_post', 'Plaine Magnien, Mahebourg, Mauritius',          '-20.430200', '57.683600'),
(6,  1, 'Terre Rouge Transport Depot',  'depot',       'Terre Rouge, Port Louis, Mauritius',            '-20.110000', '57.530000'),
(7,  1, 'Riche Terre Container Depot',  'depot',       'Riche Terre, Port Louis, Mauritius',            '-20.105000', '57.515000'),
(8,  1, 'Les Salines Cold Chain Depot', 'depot',       'Les Salines, Port Louis, Mauritius',            '-20.148000', '57.498000'),
(9,  1, 'Mer Rouge Staging Depot',      'depot',       'Mer Rouge North, Port Louis, Mauritius',        '-20.153500', '57.500800'),
(10, 1, 'Trou Fanfaron Port Terminal',  'port',        'Trou Fanfaron, Port Louis, Mauritius',          '-20.145500', '57.494500'),
(11, 2, 'Maputo Container Terminal',    'port',        'Porto de Maputo, Maputo, Mozambique',           '-25.965300', '32.589200'),
(12, 2, 'Maputo Central Depot',         'depot',       'Av. de Mocambique, Maputo, Mozambique',         '-25.969200', '32.573200'),
(13, 2, 'Ressano Garcia Border Post',   'border_post', 'Ressano Garcia, Gaza, Mozambique',              '-25.433300', '32.033300'),
(14, 2, 'Beira Destination Hub',        'destination', 'Porto da Beira, Sofala, Mozambique',            '-19.843600', '34.838900');

-- staff
INSERT INTO staff (staff_id, site_id, first_name, last_name, role, email, username, password) VALUES
(16, 2,  'Joao',   'Mucavele', 'manager',    'jmucavele@borderflow.mz', 'moz_jmucavele', '$2b$12$F1nmrXqrA51bPtCUWMhAkOqgrhPv.Chp6PDBdnxYnQGR6eVcmOma6'),
(17, 10, 'Fatima', 'Chissano', 'port_agent', 'fchissano@borderflow.mz', 'moz_fchissano', '$2b$12$F1nmrXqrA51bPtCUWMhAkOqgrhPv.Chp6PDBdnxYnQGR6eVcmOma6'),
(18, 11, 'Carlos', 'Mabunda',  'dispatcher', 'cmabunda@borderflow.mz',  'moz_cmabunda',  '$2b$12$F1nmrXqrA51bPtCUWMhAkOqgrhPv.Chp6PDBdnxYnQGR6eVcmOma6');

-- driver
INSERT INTO driver (driver_id, first_name, last_name, license_number, phone, status) VALUES
(1,  'Celestino', 'Sitoe',      'MZ-DRV-001-2021', '+258 84 111 0001', 'active'),
(2,  'Fatima',    'Muianga',    'MZ-DRV-002-2020', '+258 84 111 0002', 'active'),
(3,  'Domingos',  'Cossa',      'MZ-DRV-003-2019', '+258 84 111 0003', 'active'),
(4,  'Lurdes',    'Nhantumbo',  'MZ-DRV-004-2022', '+258 84 111 0004', 'active'),
(5,  'Arlindo',   'Machava',    'MZ-DRV-005-2018', '+258 84 111 0005', 'active'),
(6,  'Salome',    'Balate',     'MZ-DRV-006-2023', '+258 84 111 0006', 'active'),
(7,  'Helder',    'Mondlane',   'MZ-DRV-007-2021', '+258 84 111 0007', 'active'),
(8,  'Rosa',      'Tembe',      'MZ-DRV-008-2020', '+258 84 111 0008', 'inactive'),
(9,  'Augusto',   'Chauke',     'MZ-DRV-009-2017', '+258 84 111 0009', 'active'),
(10, 'Conceicao', 'Mabunda',    'MZ-DRV-010-2022', '+258 84 111 0010', 'active'),
(11, 'Joao',      'Machava',    'MOZ-DL-1001',     '+258841001001',    'active'),
(12, 'Carlos',    'Sitoe',      'MOZ-DL-1002',     '+258841001002',    'active'),
(13, 'Manuel',    'Cossa',      'MOZ-DL-1003',     '+258841001003',    'active'),
(14, 'Antonio',   'Bila',       'MOZ-DL-1004',     '+258841001004',    'active'),
(15, 'Pedro',     'Nhantumbo',  'MOZ-DL-1005',     '+258841001005',    'active'),
(26, 'Ravi',      'Gounden',    'MRU-DL-1001',     '+2305801001',      'active'),
(27, 'Vikash',    'Ramdhany',   'MRU-DL-1002',     '+2305801002',      'active'),
(28, 'Pradeep',   'Lutchman',   'MRU-DL-1003',     '+2305801003',      'active'),
(29, 'Anoop',     'Seebun',     'MRU-DL-1004',     '+2305801004',      'active'),
(30, 'Dinesh',    'Ramnarain',  'MRU-DL-1005',     '+2305801005',      'active'),
(31, 'Suresh',    'Foolchand',  'MRU-DL-1006',     '+2305801006',      'active'),
(32, 'Navin',     'Bissessur',  'MRU-DL-1007',     '+2305801007',      'active'),
(33, 'Yogesh',    'Paupiah',    'MRU-DL-1008',     '+2305801008',      'active'),
(34, 'Kiran',     'Mohit',      'MRU-DL-1009',     '+2305801009',      'active'),
(35, 'Amit',      'Daby',       'MRU-DL-1010',     '+2305801010',      'active');

-- vehicle
INSERT INTO vehicle (vehicle_id, registration, make, model, max_payload_kg, status) VALUES
(1,  'MZ-MP-1001', 'Volvo',    'FH16 750',    28000.00, 'available'),
(2,  'MZ-MP-1002', 'Scania',   'R580',        27500.00, 'in_use'),
(3,  'MZ-MP-1003', 'MAN',      'TGX 26.500',  26000.00, 'available'),
(4,  'MZ-BE-2001', 'DAF',      'XF 480',      25000.00, 'in_use'),
(5,  'MZ-BE-2002', 'Mercedes', 'Actros 2658', 29000.00, 'available'),
(6,  'MZ-MP-1004', 'Volvo',    'FH500',       27000.00, 'in_use'),
(7,  'MZ-NA-3001', 'MAN',      'TGS 26.440',  26500.00, 'maintenance'),
(8,  'MZ-NA-3002', 'Scania',   'G460',        25500.00, 'available'),
(9,  'MZ-TE-4001', 'Hino',     '500 Series',  18000.00, 'available'),
(10, 'MZ-MP-1005', 'Mercedes', 'Actros 2645', 28500.00, 'in_use'),
(11, 'MOZ-001-AA', 'Mercedes', 'Actros',      30000.00, 'available'),
(12, 'MOZ-002-AB', 'Volvo',    'FH16',        28000.00, 'available'),
(13, 'MOZ-003-AC', 'MAN',      'TGX',         25000.00, 'available'),
(14, 'MOZ-004-AD', 'DAF',      'XF105',       27000.00, 'available'),
(15, 'MOZ-005-AE', 'Scania',   'R500',        32000.00, 'available'),
(26, 'MRU-001-AA', 'Mercedes', 'Actros 2645', 30000.00, 'available'),
(27, 'MRU-002-AB', 'Volvo',    'FH16',        28000.00, 'available'),
(28, 'MRU-003-AC', 'MAN',      'TGX',         25000.00, 'available'),
(29, 'MRU-004-AD', 'DAF',      'XF105',       27000.00, 'available'),
(30, 'MRU-005-AE', 'Scania',   'R500',        32000.00, 'available'),
(31, 'MRU-006-AF', 'Mercedes', 'Actros 1844', 31000.00, 'available'),
(32, 'MRU-007-AG', 'Volvo',    'FM400',       27000.00, 'available'),
(33, 'MRU-008-AH', 'Scania',   'G450',        29000.00, 'available'),
(34, 'MRU-009-AI', 'MAN',      'TGS26',       26000.00, 'available'),
(35, 'MRU-010-AJ', 'DAF',      'CF85',        28000.00, 'available');

-- client
INSERT INTO client (client_id, company_name, contact_name, email, phone, password, username) VALUES
(12, 'Maputo Freight Co', 'Ana Luis', 'ana@maputofreight.mz', '+258-222-2222',
 '$2b$12$F1nmrXqrA51bPtCUWMhAkOqgrhPv.Chp6PDBdnxYnQGR6eVcmOma6', 'moz_maputo');

-- container
INSERT INTO container (container_id, iso_code, container_type, tare_weight_kg, status, seal_number) VALUES
(1,  'BFMZ0000011', '20GP', 2200.00, 'loaded',     NULL),
(2,  'BFMZ0000022', '40HC', 3900.00, 'in_transit', NULL),
(3,  'BFMZ0000033', '20RF', 2450.00, 'loaded',     NULL),
(4,  'BFMZ0000044', '40GP', 3800.00, 'empty',      NULL),
(5,  'BFMZ0000055', '20GP', 2200.00, 'in_transit', NULL),
(6,  'BFMZ0000066', '40HC', 4000.00, 'loaded',     NULL),
(7,  'BFMZ0000077', '20GP', 2200.00, 'in_transit', NULL),
(8,  'BFMZ0000088', '40GP', 3800.00, 'loaded',     NULL),
(9,  'BFMZ0000099', '20RF', 2450.00, 'empty',      NULL),
(10, 'BFMZ0000100', '40HC', 3900.00, 'in_transit', NULL),
(11, 'MOZ-CON-001', '20GP', 2200.00, 'empty',      NULL),
(12, 'MOZ-CON-002', '40GP', 3800.00, 'empty',      NULL),
(13, 'MOZ-CON-003', '20GP', 2100.00, 'empty',      NULL),
(14, 'MOZ-CON-004', '40HC', 4000.00, 'empty',      NULL),
(15, 'MOZ-CON-005', '20GP', 2300.00, 'empty',      NULL),
(26, 'MRU-CON-001', '20GP', 2200.00, 'empty',      NULL),
(27, 'MRU-CON-002', '40GP', 3800.00, 'empty',      NULL),
(28, 'MRU-CON-003', '20GP', 2100.00, 'empty',      NULL),
(29, 'MRU-CON-004', '40HC', 4000.00, 'empty',      NULL),
(30, 'MRU-CON-005', '20GP', 2300.00, 'empty',      NULL),
(31, 'MRU-CON-006', '40GP', 3900.00, 'empty',      NULL),
(32, 'MRU-CON-007', '20GP', 2150.00, 'empty',      NULL),
(33, 'MRU-CON-008', '40HC', 4100.00, 'empty',      NULL),
(34, 'MRU-CON-009', '20GP', 2250.00, 'empty',      NULL),
(35, 'MRU-CON-010', '40GP', 3950.00, 'empty',      NULL);

-- trip
INSERT INTO trip (trip_id, vehicle_id, driver_id, origin_site_id, destination_site_id, scheduled_departure, actual_departure, actual_arrival, status) VALUES
(1,  1,  1,  1,  2,  '2026-04-14 06:00:00', '2026-04-14 06:20:00', '2026-04-14 10:45:00', 'completed'),
(2,  2,  2,  2,  1,  '2026-04-14 08:00:00', '2026-04-14 08:25:00', NULL,                  'in_transit'),
(3,  3,  3,  9,  2,  '2026-04-14 10:00:00', '2026-04-14 10:10:00', '2026-04-14 14:30:00', 'completed'),
(4,  4,  4,  3,  4,  '2026-04-15 05:30:00', '2026-04-15 05:50:00', NULL,                  'in_transit'),
(5,  5,  5,  1,  2,  '2026-04-15 07:00:00', '2026-04-15 07:15:00', NULL,                  'in_transit'),
(6,  6,  6,  7,  5,  '2026-04-15 09:00:00', '2026-04-15 09:05:00', '2026-04-15 14:30:00', 'completed'),
(7,  8,  7,  8,  6,  '2026-04-16 06:00:00', '2026-04-16 06:35:00', NULL,                  'in_transit'),
(8,  10, 9,  9,  2,  '2026-04-16 08:00:00', '2026-04-16 08:10:00', '2026-04-16 12:00:00', 'completed'),
(9,  1,  1,  1,  2,  '2026-04-17 06:00:00', NULL,                  NULL,                  'scheduled'),
(10, 3,  10, 3,  4,  '2026-04-17 07:30:00', NULL,                  NULL,                  'scheduled'),
(11, 9,  9,  1,  2,  NULL,                  NULL,                  NULL,                  'scheduled'),
(12, 10, 8,  1,  2,  NULL,                  NULL,                  NULL,                  'scheduled'),
(13, 11, 11, 1,  2,  NULL,                  NULL,                  NULL,                  'scheduled'),
(14, 12, 12, 1,  2,  NULL,                  NULL,                  NULL,                  'scheduled'),
(15, 13, 13, 1,  2,  NULL,                  NULL,                  NULL,                  'scheduled'),
(16, 14, 14, 1,  2,  NULL,                  NULL,                  NULL,                  'scheduled'),
(17, 15, 15, 1,  2,  NULL,                  NULL,                  NULL,                  'scheduled'),
(18, 26, 26, 1,  2,  NULL,                  NULL,                  NULL,                  'scheduled'),
(19, 27, 27, 1,  2,  NULL,                  NULL,                  NULL,                  'scheduled'),
(21, 30, 30, 1,  1,  NULL,                  NULL,                  NULL,                  'scheduled');

-- trip_container
INSERT INTO trip_container (trip_id, container_id, assigned_at) VALUES
(1,  1,  '2026-04-13 17:00:00'),
(1,  3,  '2026-04-13 17:00:00'),
(2,  2,  '2026-04-13 19:00:00'),
(3,  6,  '2026-04-14 08:00:00'),
(4,  5,  '2026-04-14 20:00:00'),
(4,  7,  '2026-04-14 20:00:00'),
(5,  10, '2026-04-14 22:00:00'),
(6,  8,  '2026-04-15 07:00:00'),
(7,  4,  '2026-04-15 18:00:00'),
(8,  9,  '2026-04-15 20:00:00'),
(11, 9,  '2026-04-25 23:37:12'),
(12, 8,  '2026-04-25 18:49:29'),
(13, 11, '2026-04-25 19:14:55'),
(14, 12, '2026-04-25 19:17:48'),
(15, 13, '2026-04-25 19:20:40'),
(16, 14, '2026-04-25 19:32:33'),
(17, 15, '2026-04-26 13:44:10'),
(18, 26, '2026-04-26 14:17:45'),
(19, 27, '2026-04-26 14:19:14'),
(21, 30, '2026-04-26 16:04:10');

-- milestone
INSERT INTO milestone (milestone_id, trip_id, container_id, site_id, milestone_type, occurred_at, recorded_by_staff_id, notes) VALUES
(1,  1, 1, 1, 'departed_origin', '2026-04-14 06:20:00', NULL, 'Left Maputo Port Terminal. Vehicle MZ-MP-1001.'),
(2,  1, 1, 2, 'arrived_border',  '2026-04-14 07:00:00', NULL, 'Arrived MOZ side Ressano Garcia.'),
(3,  1, 1, 2, 'cleared_border',  '2026-04-14 08:30:00', NULL, 'MOZ customs cleared.'),
(4,  1, 3, 2, 'arrived_border',  '2026-04-14 07:05:00', NULL, 'Reefer container arrived Ressano Garcia.'),
(5,  1, 3, 2, 'cleared_border',  '2026-04-14 08:40:00', NULL, 'Reefer cleared. Cold chain verified.'),
(6,  3, 6, 9, 'departed_origin', '2026-04-14 10:10:00', NULL, 'Departed Maputo Logistics Warehouse.'),
(7,  3, 6, 2, 'arrived_border',  '2026-04-14 10:30:00', NULL, 'Hazmat container arrived Ressano Garcia.'),
(8,  3, 6, 2, 'cleared_border',  '2026-04-14 12:00:00', NULL, 'Hazmat cleared. Extended inspection completed.'),
(9,  4, 5, 3, 'departed_origin', '2026-04-15 05:50:00', NULL, 'Departed Beira Port Terminal.'),
(10, 4, 5, 4, 'arrived_border',  '2026-04-15 06:30:00', NULL, 'Arrived Machipanda MOZ side. Coal export.'),
(11, 1, 1, 1, 'departure',       '2026-04-26 18:00:00', NULL, 'Test milestone MOZ');

-- clearance
INSERT INTO clearance (clearance_id, trip_id, container_id, border_site_id, reference_number, submitted_at, cleared_at, cleared_by_staff_id, status, notes) VALUES
(1, 1,  1,  2, 'CLR-MZ-20260414-0001', '2026-04-14 07:00:00', '2026-04-14 08:30:00', NULL, 'cleared', 'Import docs verified. AT release granted.'),
(2, 11, 27, 2, 'CLR-003',              NULL,                  NULL,                  NULL, 'pending', NULL);

-- handover
INSERT INTO handover (handover_id, trip_id, container_id, from_site_id, to_site_id, released_by_staff_id, received_by_staff_id, seal_status, handover_time, latitude, longitude, notes) VALUES
(1,  1, 1, 2, 2, NULL, NULL, 'intact',  '2026-04-14 08:45:00', '-25.424722', '32.156944', 'Received from SA side at Ressano Garcia. Seals intact. Ref: CLR-MZ-20260414-0001.'),
(2,  1, 3, 2, 2, NULL, NULL, 'intact',  '2026-04-14 08:50:00', '-25.424722', '32.156944', 'Reefer unit temp confirmed at -2C at handover. Cold chain maintained.'),
(3,  3, 6, 2, 2, NULL, NULL, 'intact',  '2026-04-14 12:05:00', '-25.424722', '32.156944', 'Hazmat container received. Seals verified by both officers.'),
(4,  4, 5, 4, 4, NULL, NULL, 'intact',  '2026-04-15 08:10:00', '-18.963333', '32.861111', 'Coal export - Zimbabwe side notified. Seals intact.'),
(5,  5, 10,2, 2, NULL, NULL, 'intact',  '2026-04-15 09:20:00', '-25.424722', '32.156944', 'Perishables received SA side. Fast-track lane used.'),
(6,  4, 7, 4, 4, NULL, NULL, 'intact',  '2026-04-15 08:15:00', '-18.963333', '32.861111', 'Container held pending Zimbabwe phytosanitary permit.'),
(7,  6, 8, 5, 5, NULL, NULL, 'intact',  '2026-04-15 11:40:00', '-15.981944', '32.739722', 'Handed to Malawi side at Nyamapanda. Seals intact.'),
(8,  7, 4, 6, 6, NULL, NULL, 'broken',  '2026-04-16 08:45:00', '-15.594722', '33.990278', 'Seal broken on arrival at Zobue. Inspection conducted - heat attributed as cause.'),
(9,  8, 9, 2, 2, NULL, NULL, 'intact',  '2026-04-16 10:45:00', '-25.424722', '32.156944', 'Fertiliser bags received SA side. Seals intact.'),
(10, 2, 2, 2, 2, NULL, NULL, 'intact',  '2026-04-14 09:30:00', '-25.424722', '32.156944', 'Container received. Customs query raised, cargo held pending review.'),
(11, 1, 1, 1, 2, NULL, NULL, 'intact',  '2026-04-26 17:00:00', '-25.964917', '32.577500', 'Test handover MOZ');

-- incident
INSERT INTO incident (incident_id, trip_id, container_id, reported_by_site_id, incident_type, description, severity, occurred_at, resolved_at, status) VALUES
(1, 4, 1, 1, 'damage', 'Container damaged during loading', 'medium', '2026-04-26 17:00:00', NULL, 'open');

SET FOREIGN_KEY_CHECKS = 1;
