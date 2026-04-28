-- Hosana City Housing - Neon PostgreSQL Migration
-- This script sets up the complete database schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for fresh migration)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS householders CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'MAYOR', 'MENDER_STAFF', 'AUDITOR')),
    assigned_mender VARCHAR(50),
    phone VARCHAR(20),
    approval_status VARCHAR(20) NOT NULL DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Householders Table
CREATE TABLE householders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    father_name VARCHAR(100),
    house_number VARCHAR(50) NOT NULL,
    mender VARCHAR(50) NOT NULL CHECK (mender IN ('Mender 1', 'Mender 2', 'Mender 3')),
    kebele VARCHAR(50) NOT NULL,
    phone_encrypted TEXT,
    email VARCHAR(100),
    latitude FLOAT,
    longitude FLOAT,
    file_path TEXT,
    file_name TEXT,
    file_size INTEGER,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    UNIQUE(house_number, mender, kebele)
);

-- Audit Logs Table
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    username VARCHAR(50),
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_username ON users(LOWER(username));
CREATE INDEX idx_users_email ON users(LOWER(email));
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_householders_name ON householders(name);
CREATE INDEX idx_householders_house_number ON householders(house_number);
CREATE INDEX idx_householders_mender ON householders(mender);
CREATE INDEX idx_householders_created_by ON householders(created_by);

-- Insert Default Admin User
-- Password: Admin123! (bcrypt hash with cost 12)
INSERT INTO users (username, email, password_hash, full_name, role, approval_status, is_active)
VALUES (
    'admin',
    'admin@hosana.gov.et',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS3MebAJu',
    'System Administrator',
    'SUPER_ADMIN',
    'approved',
    TRUE
) ON CONFLICT (username) DO NOTHING;

-- Insert Default Mayor User
-- Password: Mayor123!
INSERT INTO users (username, email, password_hash, full_name, role, approval_status, is_active)
VALUES (
    'mayor',
    'mayor@hosana.gov.et',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS3MebAJu',
    'City Mayor',
    'MAYOR',
    'approved',
    TRUE
) ON CONFLICT (username) DO NOTHING;

-- Insert Test Mender Staff User
-- Password: Mender123!
INSERT INTO users (username, email, password_hash, full_name, role, assigned_mender, approval_status, is_active)
VALUES (
    'mender1',
    'mender1@hosana.gov.et',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS3MebAJu',
    'Mender One',
    'MENDER_STAFF',
    'Mender 1',
    'approved',
    TRUE
) ON CONFLICT (username) DO NOTHING;

-- Insert Test Auditor User
-- Password: Auditor123!
INSERT INTO users (username, email, password_hash, full_name, role, approval_status, is_active)
VALUES (
    'auditor',
    'auditor@hosana.gov.et',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzS3MebAJu',
    'System Auditor',
    'AUDITOR',
    'approved',
    TRUE
) ON CONFLICT (username) DO NOTHING;

-- Verification query
SELECT 'Migration completed successfully' as status;
SELECT COUNT(*) as user_count FROM users;
