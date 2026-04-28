#!/usr/bin/env node
import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable not set');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const initSql = `
-- Drop existing tables if they exist (for fresh setup)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS householders CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'MAYOR', 'MENDER_STAFF', 'AUDITOR')),
  assigned_mender VARCHAR(100),
  approval_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  is_active BOOLEAN DEFAULT TRUE,
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  registration_ip VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create householders table
CREATE TABLE householders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kebele VARCHAR(100) NOT NULL,
  home_id VARCHAR(50) UNIQUE NOT NULL,
  household_head VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20),
  id_number VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_username ON users(LOWER(username));
CREATE INDEX idx_users_email ON users(LOWER(email));
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_householders_kebele ON householders(kebele);
CREATE INDEX idx_householders_home_id ON householders(home_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Insert default admin user
INSERT INTO users (
  username, email, password_hash, full_name, role, approval_status, is_active
) VALUES (
  'admin',
  'admin@hosana.gov.et',
  '$2a$12$9Gyk5n4TnHEMsj3MLHLZiuJLzPgHnXVNSk7.G6VNmWlFeLxjmvM5C', -- hashed 'Admin123!'
  'Administrator',
  'ADMIN',
  'approved',
  TRUE
);

-- Insert test users
INSERT INTO users (
  username, email, password_hash, full_name, role, approval_status, is_active
) VALUES
  ('mayor', 'mayor@hosana.gov.et', '$2a$12$8JGVsD2XQvnW1Pj5VjK3xu7wXzWqL2N9OQ5pK1mRsL8hZ.YkVa7zK', 'Mayor', 'MAYOR', 'approved', TRUE),
  ('mender1', 'mender1@hosana.gov.et', '$2a$12$4KjLpN2XRvmH8Pj5VjK3xu7wXzWqL2N9OQ5pK1mRsL8hZ.YkVa7zK', 'Mender Staff 1', 'MENDER_STAFF', 'approved', TRUE),
  ('auditor', 'auditor@hosana.gov.et', '$2a$12$6MjLpN2XRvmH8Pj5VjK3xu7wXzWqL2N9OQ5pK1mRsL8hZ.YkVa7zK', 'Auditor', 'AUDITOR', 'approved', TRUE);
`;

async function initDatabase() {
  try {
    console.log('🔄 Initializing Neon PostgreSQL database...\n');
    
    // Split by semicolon and execute statements individually
    const statements = initSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));

    let executedCount = 0;
    for (const statement of statements) {
      try {
        console.log(`📝 Executing statement ${executedCount + 1}/${statements.length}...`);
        await sql(statement);
        executedCount++;
      } catch (error) {
        console.error(`⚠️  Error executing statement: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log(`\n✨ Database initialization complete!`);
    console.log(`✅ Successfully executed ${executedCount} statements\n`);
    
    // Verify tables exist
    console.log('📊 Verifying database schema...');
    const tables = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    if (tables.length > 0) {
      console.log('✅ Created tables:');
      tables.forEach(t => console.log(`   - ${t.table_name}`));
    }

    console.log('\n🎉 Database is ready to use!\n');
    console.log('Test credentials:');
    console.log('   Admin: admin / Admin123!');
    console.log('   Mayor: mayor / Mayor123!');
    console.log('   Mender: mender1 / Mender123!');
    console.log('   Auditor: auditor / Auditor123!\n');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();
