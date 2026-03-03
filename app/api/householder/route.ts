import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { encrypt, decrypt } from '@/lib/utils';

export async function GET(request: NextRequest) {
  // ✅ FIX: request.ip is a property, NOT a function - no parentheses!
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = request.ip;  // ← Property access, no ()
  const clientIp = forwarded?.split(',')[0]?.trim() || ip || 'unknown';
  
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    // Security: Verify authentication
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const mender = searchParams.get('mender');
    const kebele = searchParams.get('kebele');

    // Build query with permissions
    let conditions: string[] = ['is_deleted = FALSE'];
    let params: any[] = [];

    // Mender staff can only see their assigned mender
    if (user.role === 'MENDER_STAFF' && user.assigned_mender) {
      conditions.push(`mender = $${conditions.length + 1}`);
      params.push(user.assigned_mender);
    }

    // Search filters
    if (query) {
      conditions.push(`(name ILIKE $${conditions.length + 1} OR house_number ILIKE $${conditions.length + 2})`);
      params.push(`%${query}%`, `%${query}%`);
    }

    if (mender) {
      conditions.push(`mender = $${conditions.length + 1}`);
      params.push(mender);
    }

    if (kebele) {
      conditions.push(`kebele = $${conditions.length + 1}`);
      params.push(kebele);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await sql`
      SELECT id, name, father_name, house_number, mender, kebele, 
             phone_encrypted, email, latitude, longitude, file_path, 
             file_name, notes, created_at, updated_at
      FROM householders
      ${sql.raw(whereClause)}
      ORDER BY created_at DESC
    `;

    // Decrypt phone numbers for authorized users
    const householders = result.map((h: any) => ({
      ...h,
      phone: h.phone_encrypted ? decrypt(h.phone_encrypted) : null,
      phone_encrypted: undefined
    }));

    // Audit log
    await logAudit({
      userId: user.id,
      username: user.username,
      action: 'SEARCH_HOUSEHOLDERS',
      resourceType: 'HOUSEHOLDER',
      ipAddress: clientIp,
      userAgent
    });

    return NextResponse.json(householders);
  } catch (error) {
    console.error('Error fetching householders:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = request.ip;
  const clientIp = forwarded?.split(',')[0]?.trim() || ip || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    // Security: Verify authentication
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Only staff and admin can create
    if (user.role === 'AUDITOR') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const fatherName = formData.get('father_name') as string;
    const houseNumber = formData.get('house_number') as string;
    const mender = formData.get('mender') as string;
    const kebele = formData.get('kebele') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const latitude = formData.get('latitude') as string;
    const longitude = formData.get('longitude') as string;
    const notes = formData.get('notes') as string;
    const file = formData.get('document') as File;

    // Validate mender permission for staff
    if (user.role === 'MENDER_STAFF' && user.assigned_mender !== mender) {
      return NextResponse.json({ 
        error: 'You can only create records for your assigned mender' 
      }, { status: 403 });
    }

    // Encrypt phone number
    const phoneEncrypted = phone ? encrypt(phone) : null;

    // Handle file upload (Vercel Blob integration would go here)
    let filePath = '';
    let fileName = '';
    let fileSize = 0;

    if (file && file.size > 0) {
      fileName = file.name;
      fileSize = file.size;
      filePath = `/uploads/${Date.now()}-${file.name}`;
    }

    const result = await sql`
      INSERT INTO householders (
        name, father_name, house_number, mender, kebele, 
        phone_encrypted, email, latitude, longitude, notes,
        file_path, file_name, file_size, created_by
      ) VALUES (
        ${name}, ${fatherName || null}, ${houseNumber}, ${mender}, ${kebele},
        ${phoneEncrypted}, ${email || null}, ${parseFloat(latitude) || null}, 
        ${parseFloat(longitude) || null}, ${notes || null},
        ${filePath}, ${fileName}, ${fileSize}, ${user.id}
      )
      RETURNING *
    `;

    // Audit log
    await logAudit({
      userId: user.id,
      username: user.username,
      action: 'CREATE_HOUSEHOLDER',
      resourceType: 'HOUSEHOLDER',
      resourceId: result[0].id,
      newValues: { name, house_number: houseNumber, mender, kebele },
      ipAddress: clientIp,
      userAgent
    });

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error creating householder:', error);
    return NextResponse.json({ error: 'Failed to create record' }, { status: 500 });
  }
}
