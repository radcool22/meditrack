import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getReports } from '@/services/reportService';
import { verifyProfileOwnership } from '@/services/profileService';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json(
        { error: 'profileId query parameter is required' },
        { status: 400 }
      );
    }

    // Verify the profile belongs to this user
    const isOwner = await verifyProfileOwnership(profileId, userId);
    if (!isOwner) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const reports = await getReports(profileId);
    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { error: 'Failed to get reports' },
      { status: 500 }
    );
  }
}
