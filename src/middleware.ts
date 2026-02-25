import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Publiczne ścieżki które nie wymagają autoryzacji
  const publicPaths = ["/login", "/register", "/register-owner", "/"];

  // Sprawdź czy ścieżka jest publiczna
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Jeśli użytkownik nie jest zalogowany i próbuje dostać się do chronionej strony
  if (!session && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Jeśli użytkownik jest zalogowany i próbuje dostać się do stron logowania/rejestracji
  if (session && isPublicPath && pathname !== "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Ochrona tras admina
  if (pathname.startsWith("/admin")) {
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Ochrona tras dashboardu (dla owner, manager, worker)
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const allowedRoles = ["OWNER", "MANAGER", "WORKER"];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Sprawdź czy OWNER jest zatwierdzony
    if (session.user.role === "OWNER" && !session.user.isApproved) {
      return NextResponse.redirect(new URL("/pending-approval", request.url));
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
