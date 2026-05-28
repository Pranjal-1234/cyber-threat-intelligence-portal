-- Create the database
CREATE DATABASE IF NOT EXISTS cyber_threat_db;
USE cyber_threat_db;

-- Administrators (separate table — not created via public register)
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analysts / employees (public registration)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Threat intelligence
CREATE TABLE IF NOT EXISTS threats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    indicator VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    source VARCHAR(100) NOT NULL,
    category VARCHAR(80) NOT NULL DEFAULT 'Malicious IP / URL',
    risk_score INT NOT NULL,
    confidence_score INT DEFAULT 0,
    risk_level ENUM('Critical', 'High', 'Medium', 'Low') NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    created_by_user INT NULL,
    created_by_admin INT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_user) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by_admin) REFERENCES admins(id) ON DELETE SET NULL
);


-- Default admin is created when the backend starts:
-- Email: admin@cti.local  |  Password: admin123
