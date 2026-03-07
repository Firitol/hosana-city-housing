// ✅ Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Check env vars
    const hasDbUrl = !!process.env.DATABASE_URL;
    const hasJwtSecret = !!process.env.JWT_SECRET;
    const hasEncryptionKey = !!process.env.ENCRYPTION_KEY;

    // Test database connection
    let dbStatus = '❌ Not tested';
    try {
      await sql`SELECT 1`;
      dbStatus = '✅ Connected';
    } catch (dbError) {
      dbStatus = '❌ Failed: ' + (dbError instanceof Error ? dbError.message : 'Unknown');
    }

    return NextResponse.json({
      status: 'healthy',
      environment: {
        DATABASE_URL: hasDbUrl ? '✅ Set' : '❌ Missing',
        JWT_SECRET: hasJwtSecret ? '✅ Set' : '❌ Missing',
        ENCRYPTION_KEY: hasEncryptionKey ? '✅ Set' : '❌ Missing',
      },
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
