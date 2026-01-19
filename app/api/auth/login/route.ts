import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin123';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token || token !== ADMIN_TOKEN) {
      return NextResponse.json(
        { error: 'Invalid admin token' },
        { status: 401 }
      );
    }

    // Set a secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('admin-auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
