import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Ensures /api/* reaches route handlers (not the marketing [page] catch-all)
 * and passes pathname to server layouts for consistent navbar decisions.
 */
export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
