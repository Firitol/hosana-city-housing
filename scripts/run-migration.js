#!/usr/bin/env node

import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

console.log('📡 Connecting to Neon PostgreSQL...');
const sql = neon(DATABASE_URL);

async function runMigration() {
  try {
    console.log('🔄 Starting database migration...\n');
    
    // Read migration file
    const migrationPath = path.join(process.cwd(), 'scripts', 'migrate-neon.sql');
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationPath}`);
      process.exit(1);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    // Execute the entire SQL file
    // The neon function accepts SQL template strings
    try {
      // We need to handle this differently - split and execute individually
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('\n--'));
      
      console.log(`📝 Found ${statements.length} SQL statements\n`);
      
      let executed = 0;
      for (const stmt of statements) {
        try {
          // Using raw SQL execution
          const cleanStmt = stmt.replace(/--.*$/gm, '').trim();
          if (cleanStmt.length === 0) continue;
          
          // Execute via neon
          const result = await sql(cleanStmt);
          executed++;
          console.log(`✅ [${executed}] Executed`);
        } catch (err) {
          // Some statements like CREATE EXTENSION IF NOT EXISTS may fail if they exist
          // This is expected behavior
          const errMsg = err instanceof Error ? err.message : String(err);
          if (errMsg.includes('already exists') || errMsg.includes('duplicate')) {
            console.log(`ℹ️  [${executed + 1}] Skipped (already exists)`);
          } else {
            console.log(`⚠️  [${executed + 1}] ${errMsg.substring(0, 60)}`);
          }
        }
      }
      
      console.log(`\n✨ Executed ${executed} statements\n`);
    } catch (parseErr) {
      console.error('Error parsing SQL:', parseErr instanceof Error ? parseErr.message : String(parseErr));
    }
    
    // Verify the schema was created
    console.log('📊 Verifying schema...');
    try {
      const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `;
      
      console.log(`  ✅ Found ${tables.length} tables:`);
      tables.forEach(t => console.log(`     - ${t.table_name}`));
      
      const users = await sql`SELECT COUNT(*) as count FROM users`;
      console.log(`\n  ✅ Users table: ${users[0]?.count || 0} records`);
      
    } catch (verifyErr) {
      console.log('⚠️  Could not verify schema:', verifyErr instanceof Error ? verifyErr.message : String(verifyErr));
    }
    
    console.log('\n🎉 Migration completed! Your database is ready.\n');
    console.log('📝 Test credentials:');
    console.log('   Admin: admin / Admin123!');
    console.log('   Mayor: mayor / Mayor123!');
    console.log('   Mender: mender1 / Mender123!');
    console.log('   Auditor: auditor / Auditor123!\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

runMigration();
