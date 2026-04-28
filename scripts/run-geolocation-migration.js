import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  try {
    const sql = neon(databaseUrl);
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'add-geolocation.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    console.log('Starting geolocation migration...');
    console.log('Reading migration file:', migrationPath);
    
    // Split the SQL file by semicolons and filter empty statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    let completedCount = 0;
    
    for (const statement of statements) {
      try {
        console.log(`\nExecuting statement ${completedCount + 1}/${statements.length}...`);
        
        // Use raw query for complex statements
        const result = await sql.query(statement);
        
        completedCount++;
        console.log(`✓ Statement ${completedCount} completed`);
      } catch (error) {
        console.error(`\nError executing statement ${completedCount + 1}:`);
        console.error('Statement:', statement.substring(0, 100) + '...');
        console.error('Error:', error.message);
        
        // Continue with next statement instead of failing completely
        if (!statement.includes('CREATE TABLE') && !statement.includes('CREATE EXTENSION')) {
          console.log('Continuing with next statement...');
          continue;
        }
      }
    }
    
    console.log('\n✅ Migration completed!');
    console.log(`Executed ${completedCount}/${statements.length} statements`);
    
    // Verify tables were created
    const tables = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('landmarks', 'landmark_audit_logs')
    `;
    
    if (tables.length === 2) {
      console.log('\n✓ All tables created successfully');
    } else {
      console.log('\n⚠ Warning: Some tables may not have been created');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

runMigration();
