import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  });

  const pathname = request.nextUrl.pathname;

  // Bảo vệ các route cần đăng nhập (user thường)
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/wallet")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Bảo vệ route dành riêng cho admin
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Redirect đã đăng nhập đi từ login page
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/wallet/:path*", "/admin/:path*", "/login"],
};
