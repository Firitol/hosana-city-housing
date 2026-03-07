export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { encrypt } from '@/lib/utils';
import { logAudit } from '@/lib/audit';

interface CsvRow {
  name: string;
  father_name?: string;
  house_number: string;
  mender: string;
  kebele: string;
  phone?: string;
  email?: string;
  latitude?: string;
  longitude?: string;
  notes?: string;
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, '_');
}

function toNullableNumber(value?: string | null): number | null {
  if (!value) return null;
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function POST(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = request.ip;
  const clientIp = forwarded?.split(',')[0]?.trim() || ip || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (user.role === 'AUDITOR') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'CSV file is required' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json({ error: 'Only .csv files are allowed' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);

    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV must include header and at least one data row' }, { status: 400 });
    }

    const headers = parseCsvLine(lines[0]).map(normalizeHeader);
    const requiredHeaders = ['name', 'house_number', 'mender', 'kebele'];

    const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));
    if (missingHeaders.length > 0) {
      return NextResponse.json(
        { error: `Missing required headers: ${missingHeaders.join(', ')}` },
        { status: 400 }
      );
    }

    let inserted = 0;
    const errors: string[] = [];

    for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
      const rawValues = parseCsvLine(lines[lineIndex]);
      const row: Record<string, string> = {};

      headers.forEach((header, index) => {
        row[header] = (rawValues[index] || '').trim();
      });

      const payload: CsvRow = {
        name: row.name,
        father_name: row.father_name,
        house_number: row.house_number,
        mender: row.mender,
        kebele: row.kebele,
        phone: row.phone,
        email: row.email,
        latitude: row.latitude,
        longitude: row.longitude,
        notes: row.notes,
      };

      if (!payload.name || !payload.house_number || !payload.mender || !payload.kebele) {
        errors.push(`Line ${lineIndex + 1}: required fields missing`);
        continue;
      }

      if (user.role === 'MENDER_STAFF' && user.assigned_mender && payload.mender !== user.assigned_mender) {
        errors.push(`Line ${lineIndex + 1}: mender must be ${user.assigned_mender}`);
        continue;
      }

      try {
        await sql`
          INSERT INTO householders (
            name, father_name, house_number, mender, kebele,
            phone_encrypted, email, latitude, longitude, notes, created_by
          ) VALUES (
            ${payload.name},
            ${payload.father_name || null},
            ${payload.house_number},
            ${payload.mender},
            ${payload.kebele},
            ${payload.phone ? encrypt(payload.phone) : null},
            ${payload.email || null},
            ${toNullableNumber(payload.latitude)},
            ${toNullableNumber(payload.longitude)},
            ${payload.notes || null},
            ${user.id}
          )
        `;

        inserted += 1;
      } catch (error) {
        errors.push(`Line ${lineIndex + 1}: failed to insert`);
      }
    }

    await logAudit({
      userId: user.id,
      username: user.username,
      action: 'BULK_UPLOAD_HOUSEHOLDERS',
      resourceType: 'HOUSEHOLDER',
      newValues: { inserted, failed: errors.length },
      ipAddress: clientIp,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      inserted,
      failed: errors.length,
      errors: errors.slice(0, 20),
    });
  } catch (error) {
    console.error('CSV upload error:', error);
    return NextResponse.json({ error: 'Failed to upload CSV' }, { status: 500 });
  }
}
