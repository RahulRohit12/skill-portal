-- SKILL PORTAL Database Migration V12
-- Update primary demo student email so live QR scans deliver to active email inbox

UPDATE users SET email = 'diggaviprajwal55@gmail.com' WHERE email = 'student@skillportal.com';
