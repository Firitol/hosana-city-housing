import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, fullName, role, assignedMender } = await request.json();

    if (!username || !email || !password || !fullName || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const allowedRoles = ['MENDER_STAFF', 'AUDITOR'];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ 
        error: 'Invalid role. Only MENDER_STAFF and AUDITOR can self-register.' 
      }, { status: 403 });
    }

    const existing = await sql`
      SELECT id FROM users WHERE username = ${username} OR email = ${email}
    `;

    if (existing.length > 0) {
      return NextResponse.json({ 
        error: 'Username or email already exists' 
      }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    export const dynamic = 'force-dynamic';
    export const revalidate = 0;
    const registrationIp = forwarded?.split(',')[0]?.trim() || ip || 'unknown';

    const result = await sql`
      INSERT INTO users (
        username, email, password_hash, full_name, role, 
        assigned_mender, approval_status, registration_ip, is_active
      ) VALUES (
        ${username}, ${email}, ${passwordHash}, ${fullName}, ${role},
        ${assignedMender || null}, 'pending', ${registrationIp}, FALSE
      )
      RETURNING id, username, email, full_name, role, assigned_mender, approval_status
    `;

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Your account is pending admin approval.',
      user: result[0]
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
