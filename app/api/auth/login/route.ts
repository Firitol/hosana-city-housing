import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyPassword, generateToken, checkLoginAttempts, recordLoginAttempt } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // ✅ FIX: Handle potentially undefined ip() return value
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = typeof request.ip === 'function' ? request.ip() : undefined;
  const clientIp = forwarded?.split(',')[0]?.trim() || ip || 'unknown';

  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const loginCheck = await checkLoginAttempts(username);
    if (!loginCheck.allowed) {
      return NextResponse.json({ 
        error: 'Account temporarily locked', 
        lockedUntil: loginCheck.lockedUntil 
      }, { status: 423 });
    }

    const users = await sql`
      SELECT id, username, password_hash, role, assigned_mender, full_name, is_active 
      FROM users 
      WHERE username = ${username}
    `;

    if (users.length === 0) {
      await recordLoginAttempt(username, false);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = users[0];

    if (!user.is_active) {
      return NextResponse.json({ error: 'Account deactivated' }, { status: 403 });
    }

    const isValid = await verifyPassword(password, user.password_hash);
    
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
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
