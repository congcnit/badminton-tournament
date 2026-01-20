import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export function requireAdmin() {
  const cookieStore = cookies();
  const authCookie = cookieStore.get('admin-auth');

  if (!authCookie || authCookie.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}
