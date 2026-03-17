import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('axion_auth');
  const path = request.nextUrl.pathname;

  // Protect /dashboard routes
  if (path.startsWith('/dashboard')) {
    if (!authCookie) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  // Redirect to dashboard if logged in and trying to access /auth
  if (path === '/auth') {
    if (authCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth'],
};
