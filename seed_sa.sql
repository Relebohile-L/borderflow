-- BorderFlow SA Database Seed
-- Database: borderflow_sa
-- All staff/client passwords = "password" (bcrypt)

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- country
INSERT INTO country (country_id, name, iso_code) VALUES
(1, 'South Africa', 'ZA');

-- site
INSERT INTO site (site_id, country_id, name, site_type, address, latitude, longitude) VALUES
(1,  1, 'Joburg Distribution Centre',        'depot',  '14 Logistics Rd, Benrose, Johannesburg, 2001',          '-26.201389', '28.042222'),
(2,  1, 'Durban Port Terminal',              'port',   'Maydon Wharf, Durban, 4001',                             '-29.867916', '31.027096'),
(3,  1, 'Cape Town Container Terminal',      'port',   'Table Bay Harbour, Cape Town, 8001',                     '-33.906872', '18.434498'),
(4,  1, 'Maseru Bridge Border Post (SA)',    'border', 'N8 Highway, Caledon River, 9992',                        '-29.452000', '27.508000'),
(5,  1, 'Lebombo Border Post (SA)',          'border', 'N4 Toll Route, Komatipoort, 1340',                       '-25.427500', '31.935833'),
(6,  1, 'Beitbridge Border Post (SA)',       'border', 'N1 Highway, Beitbridge, 0190',                           '-22.207500', '29.993000'),
(7,  1, 'Ramatlabama Border Post (SA)',      'border', 'R503, Ramatlabama, 2861',                                '-25.736944', '25.629722'),
(8,  1, 'Golela Border Post (SA)',           'border', 'R69, Golela, 3990',                                      '-27.433333', '31.950000'),
(9,  1, 'Pretoria Inland Clearance Depot',  'depot',  '45 Waltloo Rd, Silverton, Pretoria, 0184',               '-25.741944', '28.322222'),
(10, 1, 'Johannesburg Airport Cargo Hub',   'depot',  'O.R. Tambo International Airport, Kempton Park, 1627',   '-26.133333', '28.242222');

-- staff
INSERT INTO staff (staff_id, site_id, first_name, last_name, role, email, username, password) VALUES
(1, 1, 'Sipho',  'Dlamini', 'depot_manager', 'sdlamini@borderflow.sa', 'sa_sdlamini', '$2b$12$8Vkszyl9WlzXWGk5Q4k5ZuLMpITloksQiUmrRjslQjO4qnBuaNXBe'),
(2, 1, 'Zanele', 'Mokoena', 'dispatcher',    'zmokoena@borderflow.sa', 'sa_zmokoena', '$2b$12$8Vkszyl9WlzXWGk5Q4k5ZuLMpITloksQiUmrRjslQjO4qnBuaNXBe'),
(3, 1, 'Thabo',  'Nkosi',   'driver',        'tnkosi@borderflow.sa',   'sa_tnkosi',   '$2b$12$8Vkszyl9WlzXWGk5Q4k5ZuLMpITloksQiUmrRjslQjO4qnBuaNXBe'),
(4, 1, 'Lerato', 'Sithole', 'yard_clerk',    'lsithole@borderflow.sa', 'sa_lsithole', '$2b$12$8Vkszyl9WlzXWGk5Q4k5ZuLMpITloksQiUmrRjslQjO4qnBuaNXBe');

-- driver
INSERT INTO driver (driver_id, first_name, last_name, license_number, phone, status) VALUES
(1,  'John',       'Doe',        'LIC-123',          '123456789',     'active'),
(2,  'Nkosi',      'Zwane',      'SA-DRV-002-2020',  '+27 72 111 0002','active'),
(3,  'Ruan',       'Pretorius',  'SA-DRV-003-2019',  '+27 83 111 0003','active'),
(4,  'Thandi',     'Khoza',      'SA-DRV-004-2022',  '+27 72 111 0004','active'),
(5,  'Fanie',      'Du Toit',    'SA-DRV-005-2018',  '+27 83 111 0005','active'),
(6,  'Blessing',   'Mahlangu',   'SA-DRV-006-2023',  '+27 72 111 0006','active'),
(7,  'Kagiso',     'Sithole',    'SA-DRV-007-2021',  '+27 82 111 0007','active'),
(8,  'Ntombi',     'Mthembu',    'SA-DRV-008-2020',  '+27 72 111 0008','inactive'),
(9,  'Johan',      'Steenkamp',  'SA-DRV-009-2017',  '+27 83 111 0009','active'),
(10, 'Lungelo',    'Buthelezi',  'SA-DRV-010-2022',  '+27 72 111 0010','active'),
(36, 'Sipho',      'Dlamini',    'SA-DL-1011',       '+27831001011',   'active'),
(37, 'Thabo',      'Nkosi',      'SA-DL-1012',       '+27831001012',   'active'),
(38, 'Bongani',    'Zulu',       'SA-DL-1013',       '+27831001013',   'active'),
(39, 'Lungelo',    'Mthembu',    'SA-DL-1014',       '+27831001014',   'active'),
(40, 'Siyanda',    'Khumalo',    'SA-DL-1015',       '+27831001015',   'active'),
(41, 'Mandla',     'Shabalala',  'SA-DL-1016',       '+27831001016',   'active'),
(42, 'Nhlanhla',   'Buthelezi',  'SA-DL-1017',       '+27831001017',   'active'),
(43, 'Sibusiso',   'Ntuli',      'SA-DL-1018',       '+27831001018',   'active'),
(44, 'Mthokozisi', 'Ndlovu',     'SA-DL-1019',       '+27831001019',   'active'),
(45, 'Lwazi',      'Cele',       'SA-DL-1020',       '+27831001020',   'active');

-- vehicle
INSERT INTO vehicle (vehicle_id, registration, make, model, max_payload_kg, status) VALUES
(1,  'GP 12 AB TS', 'Volvo',    'FH16 750',     2800.00,  'available'),
(2,  'GP 34 CD TS', 'MAN',      'TGX 26.500',  26000.00,  'in_use'),
(3,  'GP 56 EF TS', 'Scania',   'R580',        27500.00,  'available'),
(4,  'NP 78 GH TS', 'DAF',      'XF 480',      25000.00,  'in_use'),
(5,  'WP 90 IJ TS', 'Mercedes', 'Actros 2658', 29000.00,  'available'),
(6,  'GP 11 KL TS', 'Volvo',    'FH500',       27000.00,  'in_use'),
(7,  'GP 22 MN TS', 'MAN',      'TGS 26.440',  26500.00,  'maintenance'),
(8,  'EC 33 OP TS', 'Scania',   'G460',        25500.00,  'available'),
(9,  'KZN 44 QR TS','Hino',     '500 Series',  18000.00,  'available'),
(10, 'GP 55 ST TS', 'Mercedes', 'Actros 2645', 28500.00,  'in_use'),
(36, 'SA-011-GP',   'Mercedes', 'Actros 2645', 32000.00,  'available'),
(37, 'SA-012-GP',   'Volvo',    'FH16',        28000.00,  'available'),
(38, 'SA-013-GP',   'Scania',   'R500',        30000.00,  'available'),
(39, 'SA-014-GP',   'MAN',      'TGX',         25000.00,  'available'),
(40, 'SA-015-GP',   'DAF',      'XF105',       27000.00,  'available'),
(41, 'SA-016-GP',   'Mercedes', 'Actros 1844', 31000.00,  'available'),
(42, 'SA-017-GP',   'Volvo',    'FM400',       27000.00,  'available'),
(43, 'SA-018-GP',   'Scania',   'G450',        29000.00,  'available'),
(44, 'SA-019-GP',   'MAN',      'TGS26',       26000.00,  'available'),
(45, 'SA-020-GP',   'DAF',      'CF85',        28000.00,  'available');

-- client
INSERT INTO client (client_id, company_name, contact_name, email, phone, password, username) VALUES
(11, 'TransSA Logistics', 'John Smith', 'john@transsa.com', '+27-111-1111',
 '$2b$12$8Vkszyl9WlzXWGk5Q4k5ZuLMpITloksQiUmrRjslQjO4qnBuaNXBe', 'sa_transsa');

-- container
INSERT INTO container (container_id, iso_code, container_type, tare_weight_kg, status, seal_number) VALUES
(1,  'BFSA0000011', '20GP', 2200.00, 'loaded',     NULL),
(2,  'BFSA0000022', '40HC', 3900.00, 'in_transit', NULL),
(3,  'BFSA0000033', '20RF', 2450.00, 'loaded',     NULL),
(4,  'BFSA0000044', '40GP', 3800.00, 'empty',      NULL),
(5,  'BFSA0000055', '20GP', 2200.00, 'in_transit', NULL),
(6,  'BFSA0000066', '40HC', 4000.00, 'loaded',     NULL),
(7,  'BFSA0000077', '20GP', 2200.00, 'in_transit', NULL),
(8,  'BFSA0000088', '40GP', 3800.00, 'loaded',     NULL),
(9,  'BFSA0000099', '20RF', 2450.00, 'empty',      NULL),
(10, 'BFSA0000100', '40HC', 3900.00, 'in_transit', NULL),
(11, 'BFSA0000111', '20GP', 2200.00, 'loaded',     NULL),
(12, 'BFSA0000122', '40GP', 3800.00, 'damaged',    NULL),
(36, 'SA-CON-013',  '20GP', 2200.00, 'empty',      NULL),
(37, 'SA-CON-014',  '40GP', 3800.00, 'empty',      NULL),
(38, 'SA-CON-015',  '20GP', 2100.00, 'empty',      NULL),
(39, 'SA-CON-016',  '40HC', 4000.00, 'empty',      NULL),
(40, 'SA-CON-017',  '20GP', 2300.00, 'empty',      NULL),
(41, 'SA-CON-018',  '40GP', 3900.00, 'empty',      NULL),
(42, 'SA-CON-019',  '20GP', 2150.00, 'empty',      NULL),
(43, 'SA-CON-020',  '40HC', 4100.00, 'empty',      NULL),
(44, 'SA-CON-021',  '20GP', 2250.00, 'empty',      NULL),
(45, 'SA-CON-022',  '40GP', 3950.00, 'empty',      NULL);

-- trip
INSERT INTO trip (trip_id, vehicle_id, driver_id, origin_site_id, destination_site_id, scheduled_departure, actual_departure, actual_arrival, status) VALUES
(4,  1,  1,  1,  1,  NULL, NULL, NULL, 'scheduled'),
(5,  2,  3,  1,  1,  NULL, NULL, NULL, 'scheduled'),
(6,  3,  4,  1,  1,  NULL, NULL, NULL, 'scheduled'),
(7,  4,  5,  1,  1,  NULL, NULL, NULL, 'scheduled'),
(9,  10, 10, 10, 2,  NULL, NULL, NULL, 'scheduled'),
(11, 5,  8,  1,  2,  NULL, NULL, NULL, 'scheduled'),
(26, 36, 36, 1,  1,  NULL, NULL, NULL, 'scheduled'),
(27, 37, 37, 1,  1,  NULL, NULL, NULL, 'scheduled'),
(29, 38, 38, 1,  1,  NULL, NULL, NULL, 'scheduled'),
(31, 40, 40, 1,  1,  NULL, NULL, NULL, 'scheduled');

-- trip_container
INSERT INTO trip_container (trip_id, container_id, assigned_at) VALUES
(5,  3,  '2026-04-23 19:18:05'),
(5,  4,  '2026-04-23 19:18:05'),
(6,  5,  '2026-04-23 19:29:04'),
(7,  6,  '2026-04-23 19:36:40'),
(9,  7,  '2026-04-25 14:57:12'),
(9,  9,  '2026-04-25 14:57:12'),
(9,  10, '2026-04-25 14:57:12'),
(11, 8,  '2026-04-25 18:55:41'),
(26, 36, '2026-04-26 15:58:16'),
(27, 37, '2026-04-26 15:59:29'),
(29, 38, '2026-04-26 16:39:13'),
(31, 40, '2026-04-26 20:05:22');

-- milestone
INSERT INTO milestone (milestone_id, trip_id, container_id, site_id, milestone_type, occurred_at, recorded_by_staff_id, notes) VALUES
(3, 5, 1, 1, 'departure', '2026-04-24 10:00:00', NULL, 'Container departed SA site'),
(4, 4, 1, 1, 'departure', '2026-04-26 18:00:00', NULL, 'Test milestone SA');

-- clearance
INSERT INTO clearance (clearance_id, trip_id, container_id, border_site_id, reference_number, submitted_at, cleared_at, cleared_by_staff_id, status, notes) VALUES
(1,  31, 40, 1, 'CLR-001', NULL, NULL, NULL, 'pending', NULL),
(7,  27, 37, 2, 'CLR-002', NULL, NULL, NULL, 'pending', NULL),
(10, 29, 37, 2, 'CLR-003', NULL, NULL, NULL, 'pending', NULL);

-- handover
INSERT INTO handover (handover_id, trip_id, container_id, from_site_id, to_site_id, released_by_staff_id, received_by_staff_id, seal_status, handover_time, latitude, longitude, notes) VALUES
(4, 4, 1, 1, 2, NULL, NULL, 'intact', '2026-04-24 10:00:00', '-25.746000', '28.188000', 'Test handover'),
(5, 4, 1, 1, 2, NULL, NULL, 'intact', '2026-04-26 17:00:00', '-26.204103', '28.047305', 'Test handover SA');

-- incident
INSERT INTO incident (incident_id, trip_id, container_id, reported_by_site_id, incident_type, description, severity, occurred_at, resolved_at, status) VALUES
(2, 4, 1, 1, 'damage', 'Container damaged during transit',         'medium', '2026-04-24 10:00:00', NULL, 'open'),
(4, 4, 1, 1, 'theft',  'Cargo theft reported at border post',     'high',   '2026-04-26 18:00:00', NULL, 'open');

SET FOREIGN_KEY_CHECKS = 1;
