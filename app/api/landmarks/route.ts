import { NextRequest, NextResponse } from 'next/server';
import * as geolocation from '@/app/lib/geolocation';
import { verifyToken } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const landmarks = await geolocation.getAllLandmarks();
    return NextResponse.json({ success: true, data: landmarks });
  } catch (error) {
    console.error('Error fetching landmarks:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch landmarks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, landmark_type, latitude, longitude, address, phone, rating, description } = body;

    if (!name || !landmark_type || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const landmark = await geolocation.createLandmark(
      name,
      landmark_type,
      latitude,
      longitude,
      address,
      phone,
      rating,
      description
    );

    if (!landmark) {
      return NextResponse.json(
        { success: false, error: 'Failed to create landmark' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: landmark }, { status: 201 });
  } catch (error) {
    console.error('Error creating landmark:', error);
    return NextResponse.json({ success: false, error: 'Failed to create landmark' }, { status: 500 });
  }
}
