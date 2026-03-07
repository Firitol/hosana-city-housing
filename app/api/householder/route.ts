import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { encrypt, decrypt } from '@/lib/utils';

// GET: Fetch householders with filters
export async function GET(request: NextRequest) {
   export const dynamic = 'force-dynamic';
   export const revalidate = 0;
  const clientIp = forwarded?.split(',')[0]?.trim() || ip || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    // Verify authentication
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

    // Build query with conditional filters using Neon-compatible syntax
    let result;
    
    if (query) {
      // Search by name or house number
      result = await sql`
        SELECT id, name, father_name, house_number, mender, kebele, 
               phone_encrypted, email, latitude, longitude, file_path, 
               file_name, notes, created_at, updated_at
        FROM householders
        WHERE is_deleted = FALSE 
          AND (name ILIKE ${'%' + query + '%'} OR house_number ILIKE ${'%' + query + '%'})
          ${mender ? sql`AND mender = ${mender}` : sql``}
          ${kebele ? sql`AND kebele = ${kebele}` : sql``}
          ${user.role === 'MENDER_STAFF' && user.assigned_mender ? sql`AND mender = ${user.assigned_mender}` : sql``}
        ORDER BY created_at DESC
      `;
    } else {
      // No search query - just filters
      result = await sql`
        SELECT id, name, father_name, house_number, mender, kebele, 
               phone_encrypted, email, latitude, longitude, file_path, 
               file_name, notes, created_at, updated_at
        FROM householders
        WHERE is_deleted = FALSE 
          ${mender ? sql`AND mender = ${mender}` : sql``}
          ${kebele ? sql`AND kebele = ${kebele}` : sql``}
          ${user.role === 'MENDER_STAFF' && user.assigned_mender ? sql`AND mender = ${user.assigned_mender}` : sql``}
        ORDER BY created_at DESC
      `;
    }

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

// POST: Create new householder
export async function POST(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = request.ip;
  const clientIp = forwarded?.split(',')[0]?.trim() || ip || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    // Verify authentication
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check permissions
    if (user.role === 'AUDITOR') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse form data
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

    // Encrypt sensitive data
    const phoneEncrypted = phone ? encrypt(phone) : null;

    // Handle file upload metadata
    let filePath = '';
    let fileName = '';
    let fileSize = 0;
    if (file && file.size > 0) {
      fileName = file.name;
      fileSize = file.size;
      filePath = `/uploads/${Date.now()}-${file.name}`;
    }

    // Insert new record with parameterized query
    const result = await sql`
      INSERT INTO householders (
        name, father_name, house_number, mender, kebele, 
        phone_encrypted, email, latitude, longitude, notes,
        file_path, file_name, file_size, created_by
      ) VALUES (
        ${name}, 
        ${fatherName || null}, 
        ${houseNumber}, 
        ${mender}, 
        ${kebele},
        ${phoneEncrypted}, 
        ${email || null}, 
        ${parseFloat(latitude) || null}, 
        ${parseFloat(longitude) || null}, 
        ${notes || null},
        ${filePath}, 
        ${fileName}, 
        ${fileSize}, 
        ${user.id}
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
      newValues: { 
        name, 
        house_number: houseNumber, 
        mender, 
        kebele 
      },
      ipAddress: clientIp,
      userAgent
    });

    // ✅ CORRECT SYNTAX: key: value pair in object literal
    return NextResponse.json({ 
      success: true, 
      data: result[0] 
    });
    
  } catch (error) {
    console.error('Error creating householder:', error);
    return NextResponse.json({ 
      error: 'Failed to create record' 
    }, { status: 500 });
  }
}
