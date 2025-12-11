import { NextResponse } from 'next/server';
import { ADMIN_AUTH_COOKIE, getAdminAuthToken, isValidAdminPassword } from '@/lib/admin-auth';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const password = formData.get('password');
    const loginUrl = new URL('/admin/login', request.url);

    if (!process.env.ADMIN_PASSWORD) {
      console.error('ADMIN_PASSWORD environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error: ADMIN_PASSWORD not configured' },
        { status: 500 }
      );
    }

    if (typeof password !== 'string' || !isValidAdminPassword(password)) {
      loginUrl.searchParams.set('error', '1');
      return NextResponse.redirect(loginUrl);
    }

    const response = NextResponse.redirect(new URL('/admin', request.url));
    response.cookies.set({
      name: ADMIN_AUTH_COOKIE.name,
      value: getAdminAuthToken(),
      path: ADMIN_AUTH_COOKIE.path,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error during login' },
      { status: 500 }
    );
  }
}

