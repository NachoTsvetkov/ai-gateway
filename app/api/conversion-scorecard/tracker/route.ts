import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_COOKIE_NAME } from "lib/digital-product-access";
import { verifyLibraryTokenEntitlement } from "lib/digital-product-auth.server";
import { TRACKER_CSV } from "lib/conversion-scorecard/content";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const token =
    cookieStore.get(ACCESS_COOKIE_NAME)?.value ??
    request.nextUrl.searchParams.get("access");

  if (!token || !(await verifyLibraryTokenEntitlement(token))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return new NextResponse(TRACKER_CSV, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="weekly-conversion-tracker.csv"',
    },
  });
}
