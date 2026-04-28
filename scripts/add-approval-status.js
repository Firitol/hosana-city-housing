import { neon } from '@neondatabase/serverless';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = neon(dbUrl);

async function migrate() {
  try {
    console.log('🔄 Starting migration...');
    
    // Check if approval_status column already exists
    const checkColumn = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'approval_status'
    `;
    
    if (checkColumn.length > 0) {
      console.log('✅ Column approval_status already exists');
      return;
    }
    
    // Add the approval_status column
    console.log('📝 Adding approval_status column...');
    await sql`
      ALTER TABLE users 
      ADD COLUMN approval_status VARCHAR(20) DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected'))
    `;
    
    console.log('✅ Successfully added approval_status column');
    
    // Update existing admin and mayor users to be approved
    console.log('🔑 Updating existing users...');
    await sql`
      UPDATE users 
      SET approval_status = 'approved' 
      WHERE role IN ('SUPER_ADMIN', 'MAYOR')
    `;
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
