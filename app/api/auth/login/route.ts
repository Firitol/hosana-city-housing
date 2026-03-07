// ✅ Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyPassword, generateToken, checkLoginAttempts, recordLoginAttempt } from '@/lib/auth';

export async function POST(request: NextRequest) {
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

    // Parse request body
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    // Get client IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = request.ip;
    const clientIp = forwarded?.split(',')[0]?.trim() || ip || 'unknown';

    console.log('Login attempt:', { username, ip: clientIp });

    // Check login attempts (account lockout)
    const loginCheck = await checkLoginAttempts(username);
    if (!loginCheck.allowed) {
      return NextResponse.json({ 
        error: 'Account temporarily locked. Try again in 30 minutes.', 
        lockedUntil: loginCheck.lockedUntil 
      }, { status: 423 });
    }

    // Find user (case-insensitive)
    const users = await sql`
      SELECT id, username, password_hash, role, assigned_mender, full_name, is_active, approval_status 
      FROM users 
      WHERE LOWER(username) = LOWER(${username})
    `;

    console.log('User query result:', users);

    // User not found
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

    // Check if account is active
    if (!user.is_active) {
      return NextResponse.json({ error: 'Account deactivated. Contact administrator.' }, { status: 403 });
    }

    // Check if account is approved
    if (user.approval_status !== 'approved') {
      return NextResponse.json({ 
        error: 'Account pending approval. Contact administrator.' 
      }, { status: 403 });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    console.log('Password valid:', isValid);
    
    if (!isValid) {
      await recordLoginAttempt(username, false);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Record successful login
    await recordLoginAttempt(username, true);
    
    // Generate JWT token
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
      assigned_mender: user.assigned_mender
    });

    console.log('Login successful:', { username, role: user.role });

    // Return success response
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
      error: 'Server error. Please try again later.',
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 });
  }
}
