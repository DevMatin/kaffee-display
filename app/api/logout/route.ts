import { NextResponse } from 'next/server';
import { ADMIN_AUTH_COOKIE } from '@/lib/admin-auth';

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/admin/login', request.url));
  response.cookies.set({
    name: ADMIN_AUTH_COOKIE.name,
    value: '',
    path: ADMIN_AUTH_COOKIE.path,
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  return response;
}

