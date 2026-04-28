import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = neon(dbUrl);

async function executeSchema() {
  try {
    console.log('🔄 Starting database initialization...');
    
    // Read the init.sql file
    const schemaPath = join(__dirname, '../database/init.sql');
    const schemaSQL = readFileSync(schemaPath, 'utf-8');
    
    // Split by semicolon and execute each statement
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        console.log(`[${i + 1}/${statements.length}] Executing statement...`);
        await sql.query(stmt);
      } catch (err) {
        // Skip if table/extension already exists
        if (err.message.includes('already exists') || err.message.includes('already exists')) {
          console.log(`  ⊘ Already exists, skipping...`);
        } else {
          throw err;
        }
      }
    }
    
    // Now add the approval_status column if it doesn't exist
    console.log('🔍 Checking for approval_status column...');
    const checkColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'approval_status'
    `;
    
    if (checkColumn.length === 0) {
      console.log('📝 Adding approval_status column...');
      await sql`
        ALTER TABLE users 
        ADD COLUMN approval_status VARCHAR(20) DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected'))
      `;
    } else {
      console.log('✅ approval_status column already exists');
    }
    
    console.log('✅ Database initialization completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Initialization failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

executeSchema();
