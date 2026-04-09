import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  getProfiles,
  createProfile,
  deleteProfile,
} from '@/services/profileService';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profiles = await getProfiles(userId);
    return NextResponse.json({ profiles });
  } catch (error) {
    console.error('Get profiles error:', error);
    return NextResponse.json(
      { error: 'Failed to get profiles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, relationship } = body;

    if (!name || typeof name !== 'string' || name.length > 100) {
      return NextResponse.json({ error: 'Valid name is required' }, { status: 400 });
    }

    const validRelationships = [
      'self', 'parent', 'spouse', 'child', 'sibling', 'grandparent', 'other',
    ];
    if (!relationship || !validRelationships.includes(relationship)) {
      return NextResponse.json(
        { error: 'Valid relationship is required' },
        { status: 400 }
      );
    }

    const profile = await createProfile(userId, name.trim(), relationship);
    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error('Create profile error:', error);
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('id');

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }

    await deleteProfile(profileId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete profile';
    console.error('Delete profile error:', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
