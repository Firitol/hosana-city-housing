import { NextRequest, NextResponse } from 'next/server';
import * as geolocation from '@/app/lib/geolocation';
import { verifyToken } from '@/app/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const landmark = await geolocation.getLandmarkById(params.id);

    if (!landmark) {
      return NextResponse.json(
        { success: false, error: 'Landmark not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: landmark });
  } catch (error) {
    console.error('Error fetching landmark:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch landmark' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const success = await geolocation.deleteLandmark(params.id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete landmark' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Landmark deleted successfully' });
  } catch (error) {
    console.error('Error deleting landmark:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete landmark' },
      { status: 500 }
    );
  }
}
