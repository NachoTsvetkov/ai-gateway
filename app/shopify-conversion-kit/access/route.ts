import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  LIBRARY_BASE_PATH,
  setLibraryAccessCookie,
  verifyDigitalProductAccessToken,
} from "lib/digital-product-access";
import { verifyLibraryTokenEntitlement } from "lib/digital-product-auth.server";

/** Validates purchase token, sets access cookie, redirects to library hub. */
export async function GET(request: NextRequest) {
  const access = request.nextUrl.searchParams.get("access");
  const dest = request.nextUrl.searchParams.get("dest");

  if (
    !access ||
    !verifyDigitalProductAccessToken(access) ||
    !(await verifyLibraryTokenEntitlement(access, { requireLivePaidCheck: true }))
  ) {
    const locked = new URL("/shopify-conversion-kit", request.url);
    locked.searchParams.set("locked", "1");
    return NextResponse.redirect(locked);
  }

  const section =
    dest && /^[a-z-]+$/.test(dest) ? `/${dest}` : "";
  const target = new URL(`${LIBRARY_BASE_PATH}${section}`, request.url);

  const res = NextResponse.redirect(target);
  setLibraryAccessCookie(res, access);
  return res;
}
