import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check env vars
    const hasDbUrl = !!process.env.DATABASE_URL;
    const hasJwtSecret = !!process.env.JWT_SECRET;
    const hasEncryptionKey = !!process.env.ENCRYPTION_KEY;

    return NextResponse.json({
      status: 'healthy',
      environment: {
        DATABASE_URL: hasDbUrl ? '✅ Set' : '❌ Missing',
        JWT_SECRET: hasJwtSecret ? '✅ Set' : '❌ Missing',
        ENCRYPTION_KEY: hasEncryptionKey ? '✅ Set' : '❌ Missing',
      },
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
