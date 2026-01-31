-- ============================================
-- TASKEER - Datos Iniciales
-- 24 zonas horarias principales
-- ============================================

USE taskeer2;

INSERT INTO zonasHorarias (idZonaHoraria, nombreZona, offsetUTC, nombreMostrar) VALUES
-- UTC y zonas negativas (oeste)
(1, 'Etc/GMT+12', -12.0, 'UTC-12:00 (Baker Island)'),
(2, 'Pacific/Midway', -11.0, 'UTC-11:00 (Samoa)'),
(3, 'Pacific/Honolulu', -10.0, 'UTC-10:00 (Hawaii)'),
(4, 'America/Anchorage', -9.0, 'UTC-09:00 (Alaska)'),
(5, 'America/Los_Angeles', -8.0, 'UTC-08:00 (PST - Pacífico)'),
(6, 'America/Denver', -7.0, 'UTC-07:00 (MST - Montaña)'),
(7, 'America/Chicago', -6.0, 'UTC-06:00 (CST - Central)'),
(8, 'America/New_York', -5.0, 'UTC-05:00 (EST - Este)'),
(9, 'America/Caracas', -4.0, 'UTC-04:00 (AST - Atlántico)'),
(10, 'America/Sao_Paulo', -3.0, 'UTC-03:00 (BRT - Brasil)'),
(11, 'Atlantic/South_Georgia', -2.0, 'UTC-02:00 (Georgia del Sur)'),
(12, 'Atlantic/Azores', -1.0, 'UTC-01:00 (Azores)'),
-- UTC
(13, 'UTC', 0.0, 'UTC±00:00 (Greenwich)'),
-- Zonas positivas (este)
(14, 'Europe/Paris', 1.0, 'UTC+01:00 (CET - Europa Central)'),
(15, 'Europe/Athens', 2.0, 'UTC+02:00 (EET - Europa Este)'),
(16, 'Europe/Moscow', 3.0, 'UTC+03:00 (MSK - Moscú)'),
(17, 'Asia/Dubai', 4.0, 'UTC+04:00 (GST - Golfo)'),
(18, 'Asia/Karachi', 5.0, 'UTC+05:00 (PKT - Pakistán)'),
(19, 'Asia/Dhaka', 6.0, 'UTC+06:00 (BST - Bangladesh)'),
(20, 'Asia/Bangkok', 7.0, 'UTC+07:00 (ICT - Indochina)'),
(21, 'Asia/Shanghai', 8.0, 'UTC+08:00 (CST - China)'),
(22, 'Asia/Tokyo', 9.0, 'UTC+09:00 (JST - Japón)'),
(23, 'Australia/Sydney', 10.0, 'UTC+10:00 (AEST - Australia Este)'),
(24, 'Pacific/Auckland', 12.0, 'UTC+12:00 (NZST - Nueva Zelanda)');