import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Publiczne ścieżki które nie wymagają autoryzacji
  const publicPaths = [
    "/login",
    "/register",
    "/register-owner",
    "/",
    "/pending-approval",
  ];

  // Sprawdź czy ścieżka jest publiczna
  const isPublicPath = publicPaths.some((path) => pathname === path);

  // Jeśli użytkownik nie jest zalogowany i próbuje dostać się do chronionej strony
  if (!session && !isPublicPath) {
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

    // Sprawdź czy OWNER jest zatwierdzony
    if (session.user.role === "OWNER" && !session.user.isApproved) {
      if (pathname !== "/pending-approval") {
        return NextResponse.redirect(new URL("/pending-approval", request.url));
      }
    }
  }

  return NextResponse.next();
}

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
