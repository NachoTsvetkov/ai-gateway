import {
  hasPaidDigitalProductAccess,
  isDigitalProductLibraryPreviewEnabled,
} from "lib/digital-product-auth.server";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ACCESS_COOKIE_NAME,
  createLibraryEmailAccessToken,
  libraryAccessCookieOptions,
  normalizeLibraryEmail,
} from "lib/digital-product-access";

const bodySchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }

  const email = normalizeLibraryEmail(parsed.data.email);

  let hasAccess = await hasPaidDigitalProductAccess(
    email,
    "shopify-conversion-kit",
  );

  if (!hasAccess && isDigitalProductLibraryPreviewEnabled()) {
    hasAccess = true;
  }

  if (!hasAccess) {
    return NextResponse.json({ error: "not_found" }, { status: 401 });
  }

  try {
    const token = createLibraryEmailAccessToken("shopify-conversion-kit", email);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ACCESS_COOKIE_NAME, token, libraryAccessCookieOptions());
    return response;
  } catch (error) {
    console.error("[library-login] token issue failed", error);
    return NextResponse.json({ error: "misconfigured" }, { status: 503 });
  }
}
