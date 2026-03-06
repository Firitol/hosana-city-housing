import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyPassword, generateToken, checkLoginAttempts, recordLoginAttempt } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = request.ip;
  const clientIp = forwarded?.split(',')[0]?.trim() || ip || 'unknown';

  try {
    // Check environment variables
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    console.log('Login attempt:', { username, ip: clientIp });

    const loginCheck = await checkLoginAttempts(username);
    if (!loginCheck.allowed) {
      return NextResponse.json({ 
        error: 'Account temporarily locked', 
        lockedUntil: loginCheck.lockedUntil 
      }, { status: 423 });
    }
// To this (case-insensitive):
     const users = await sql`
     SELECT id, username, password_hash, role, assigned_mender, full_name, is_active, approval_status 
     FROM users 
      WHERE LOWER(username) = LOWER(${username})
     `;
    console.log('User query result:', users);

    if (users.length === 0) {
      await recordLoginAttempt(username, false);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = users[0];

    console.log('User found:', { 
      username: user.username, 
      isActive: user.is_active, 
      approvalStatus: user.approval_status 
    });

    if (!user.is_active) {
      return NextResponse.json({ error: 'Account deactivated' }, { status: 403 });
    }

    if (user.approval_status !== 'approved') {
      return NextResponse.json({ 
        error: 'Account pending approval. Please contact administrator.' 
      }, { status: 403 });
    }

    const isValid = await verifyPassword(password, user.password_hash);
    console.log('Password valid:', isValid);
    
    if (!isValid) {
      await recordLoginAttempt(username, false);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await recordLoginAttempt(username, true);
    
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
      assigned_mender: user.assigned_mender
    });

    console.log('Login successful:', { username, role: user.role });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.full_name,
        assignedMender: user.assigned_mender
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 });
  }
}
