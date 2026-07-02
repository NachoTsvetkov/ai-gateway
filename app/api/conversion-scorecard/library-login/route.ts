import { NextResponse } from "next/server";
import { z } from "zod";
import { isDigitalProductLibraryPreviewEnabled } from "lib/digital-product-dev.server";
import {
  ACCESS_COOKIE_NAME,
  createLibraryEmailAccessToken,
  libraryAccessCookieOptions,
  normalizeLibraryEmail,
} from "lib/digital-product-access";
import { hasPaidDigitalProductOrder } from "lib/orders";

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
  const useTestCollection = process.env.NODE_ENV !== "production";

  let hasAccess = await hasPaidDigitalProductOrder(
    email,
    "shopify-conversion-kit",
    useTestCollection,
  );

  if (!hasAccess && useTestCollection) {
    hasAccess = await hasPaidDigitalProductOrder(
      email,
      "shopify-conversion-kit",
      false,
    );
  }

  if (!hasAccess && isDigitalProductLibraryPreviewEnabled()) {
    hasAccess = true;
  }

  if (!hasAccess) {
    return NextResponse.json({ error: "not_found" }, { status: 401 });
  }

  const token = createLibraryEmailAccessToken("shopify-conversion-kit", email);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_COOKIE_NAME, token, libraryAccessCookieOptions());
  return response;
}
