import { NextResponse } from "next/server";
import {
  clearAllLibraryAccessCookies,
  LIBRARY_LOGIN_PATH,
} from "lib/digital-product-access";

function logoutResponse(request: Request) {
  const loginUrl = new URL(LIBRARY_LOGIN_PATH, request.url);
  const response = NextResponse.redirect(loginUrl, 303);
  clearAllLibraryAccessCookies(response);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

/** Clears library access cookie and sends the visitor back to login. */
export async function GET(request: Request) {
  return logoutResponse(request);
}

export async function POST(request: Request) {
  return logoutResponse(request);
}
