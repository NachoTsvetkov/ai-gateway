import { NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  LIBRARY_LOGIN_PATH,
  libraryAccessCookieOptions,
} from "lib/digital-product-access";

/** Clears library access cookie and sends the visitor back to login. */
export async function GET(request: Request) {
  const loginUrl = new URL(LIBRARY_LOGIN_PATH, request.url);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.set(ACCESS_COOKIE_NAME, "", {
    ...libraryAccessCookieOptions(),
    maxAge: 0,
  });
  return response;
}
