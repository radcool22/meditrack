import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyOTP } from '@/services/authService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code } = body;

    if (!phone || !code) {
      return NextResponse.json(
        { error: 'Phone number and OTP code are required' },
        { status: 400 }
      );
    }

    if (typeof code !== 'string' || !/^\d{4,8}$/.test(code)) {
      return NextResponse.json(
        { error: 'OTP must be 4-8 digits' },
        { status: 400 }
      );
    }

    const result = await verifyOTP(phone, code);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Invalid OTP' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: result.user,
    });

    // Set httpOnly cookie with JWT
    response.cookies.set('meditrack-token', result.token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
