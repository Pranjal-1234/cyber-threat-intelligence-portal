-- Run this once if you already created the database and see
-- "Data truncated for column 'status'" when submitting threats.
USE cyber_threat_db;

ALTER TABLE threats
MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'Active';
