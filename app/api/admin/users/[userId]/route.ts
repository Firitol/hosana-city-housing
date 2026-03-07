// ✅ Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function DELETE(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await verifyToken(token);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Prevent deleting SUPER_ADMIN accounts
    const targetUser = await sql`SELECT role FROM users WHERE id = ${params.userId}`;
    if (targetUser[0]?.role === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Cannot delete SUPER_ADMIN accounts' }, { status: 403 });
    }

    await sql`DELETE FROM users WHERE id = ${params.userId}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
