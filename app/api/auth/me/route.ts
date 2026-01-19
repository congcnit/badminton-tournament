import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get('admin-auth');

  if (authCookie && authCookie.value === 'authenticated') {
    return NextResponse.json({
      isAuthenticated: true,
      role: 'admin',
    });
  }

  return NextResponse.json({
    isAuthenticated: false,
    role: 'guest',
  });
}
