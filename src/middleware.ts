import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Edge-compatible auth instance — NO Prisma, NO DB calls
const { auth } = NextAuth(authConfig);

export default auth(async function middleware(request) {
  const session = (request as any).auth;
  const { pathname } = request.nextUrl;

  // Chronione ścieżki które wymagają autoryzacji
  const protectedPaths = ["/dashboard", "/orders"];

  // Publiczne ścieżki - nie wymagają autoryzacji
  const publicPaths = ["/order/", "/status-board/"]; // /order/[id] tracking page, /status-board/[locationId]

  // Sprawdź publiczne ścieżki
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Sprawdź czy ścieżka jest chroniona
  const isProtectedPath =
    !isPublicPath && protectedPaths.some((path) => pathname.startsWith(path));

  // Jeśli użytkownik nie jest zalogowany i próbuje dostać się do chronionej strony
  if (!session && isProtectedPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Jeśli użytkownik jest zalogowany i próbuje dostać się do stron logowania/rejestracji
  if (
    session &&
    (pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/register-owner")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Ochrona tras admina - /admin zawsze przekierowuje do /dashboard
  // Admin używa /dashboard jako swojego panelu
  if (pathname.startsWith("/admin")) {
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Admin też trafia na /dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Ochrona tras dashboardu - wszyscy zalogowani mają dostęp
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Sekcje admina w /dashboard - tylko dla ADMIN
    const adminOnlyPaths = [
      "/dashboard/subscriptions",
      "/dashboard/restaurants",
      "/dashboard/dictionaries",
      "/dashboard/moderation",
      "/dashboard/content-management",
    ];
    const isAdminOnlyPath = adminOnlyPaths.some((p) => pathname.startsWith(p));
    if (isAdminOnlyPath && session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // MANAGER i WORKER mają dostęp do określonych paneli (sprawdź PRZED blokowaniem /dashboard/owner)
    if (session.user.role === "MANAGER" || session.user.role === "WORKER") {
      const allowedForStaff = [
        "/dashboard",
        "/dashboard/orders",
        "/dashboard/statistics",
        "/dashboard/reports",
        "/dashboard/owner/menu",
        "/dashboard/owner/locations",
      ];
      const isAllowedForStaff = allowedForStaff.some(
        (p) => pathname === p || pathname.startsWith(p + "/"),
      );
      if (!isAllowedForStaff) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
    // Sekcje właściciela - tylko dla OWNER (i dozwolonych pracowników powyżej)
    else if (
      pathname.startsWith("/dashboard/owner") &&
      session.user.role !== "OWNER"
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Sprawdź czy OWNER jest zatwierdzony — pozwól na dostęp do /dashboard (widzi baner)
    // ale zablokuj podstrony /dashboard/owner/* dopóki nie jest zatwierdzony
    if (session.user.role === "OWNER" && !session.user.isApproved) {
      if (pathname !== "/dashboard" && pathname.startsWith("/dashboard/")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
