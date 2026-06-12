import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This proxy ensures that /api/* requests are always passed through to the API route handlers
// and are not accidentally caught by the top-level dynamic [page] marketing page route.
// Without this, in some dev setups or with experimental features, /api/orders etc. could 404 as "page not found".
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }
}

export const config = {
  matcher: "/:path*",
};
