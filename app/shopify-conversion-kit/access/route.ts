import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  LIBRARY_BASE_PATH,
  libraryAccessCookieOptions,
  verifyDigitalProductAccessToken,
} from "lib/digital-product-access";

/** Validates purchase token, sets access cookie, redirects to library hub. */
export async function GET(request: NextRequest) {
  const access = request.nextUrl.searchParams.get("access");
  const dest = request.nextUrl.searchParams.get("dest");

  if (!access || !verifyDigitalProductAccessToken(access)) {
    const locked = new URL("/shopify-conversion-kit", request.url);
    locked.searchParams.set("locked", "1");
    return NextResponse.redirect(locked);
  }

  const section =
    dest && /^[a-z-]+$/.test(dest) ? `/${dest}` : "";
  const target = new URL(`${LIBRARY_BASE_PATH}${section}`, request.url);

  const res = NextResponse.redirect(target);
  res.cookies.set(ACCESS_COOKIE_NAME, access, libraryAccessCookieOptions());
  return res;
}
