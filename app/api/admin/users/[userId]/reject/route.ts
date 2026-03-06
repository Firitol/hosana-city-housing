import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await verifyToken(token);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await sql`
      UPDATE users 
      SET approval_status = 'rejected', is_active = FALSE 
      WHERE id = ${params.userId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reject error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
