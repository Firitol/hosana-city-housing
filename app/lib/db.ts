import { neon } from '@neondatabase/serverless';

// ✅ Safe: Return mock function if env var missing (prevents build crash)
export const sql = process.env.DATABASE_URL 
  ? neon(process.env.DATABASE_URL)
  : (() => {
      console.warn('DATABASE_URL not set - using mock database');
      return async () => [];
    })();

export async function testConnection() {
  if (!process.env.DATABASE_URL) return false;
  try {
    const result = await sql`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
