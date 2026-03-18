import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("axion_auth")?.value;
  const path = request.nextUrl.pathname;

  // Protect /dashboard routes
  if (path.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
    } catch {
      // Token is invalid or expired — clear cookie and redirect
      const response = NextResponse.redirect(new URL("/auth", request.url));
      response.cookies.set("axion_auth", "", {
        httpOnly: true,
        maxAge: 0,
        path: "/",
      });
      return response;
    }
  }

  // Redirect to dashboard if logged in and trying to access /auth
  if (path === "/auth") {
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        await jwtVerify(token, secret);
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } catch {
        // Token invalid, let them access /auth
        const response = NextResponse.next();
        response.cookies.set("axion_auth", "", {
          httpOnly: true,
          maxAge: 0,
          path: "/",
        });
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth"],
};
