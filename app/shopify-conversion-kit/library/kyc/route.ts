import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
} from "lib/digital-product-access";
import { verifyLibraryTokenEntitlement } from "lib/digital-product-auth.server";
import {
  ConversionKitKycSchema,
  hasConversionKitKyc,
  resolveLibrarySessionEmail,
  saveConversionKitKyc,
} from "lib/conversion-scorecard/kyc";

async function getAuthorizedSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

  if (!token || !(await verifyLibraryTokenEntitlement(token))) {
    return null;
  }

  const useTestCollection = process.env.NODE_ENV !== "production";
  const email = await resolveLibrarySessionEmail(token, useTestCollection);

  return { token, email, useTestCollection };
}

export async function GET() {
  const session = await getAuthorizedSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { email, useTestCollection } = session;

  if (!email) {
    return NextResponse.json({
      complete: false,
      email: null,
      emailRequired: true,
    });
  }

  try {
    let complete = await hasConversionKitKyc(email, useTestCollection);

    if (!complete && useTestCollection) {
      complete = await hasConversionKitKyc(email, false);
    }

    return NextResponse.json({
      complete,
      email,
      emailRequired: false,
    });
  } catch (error) {
    console.error("[conversion-kit-kyc] GET failed", error);
    return NextResponse.json({
      complete: false,
      email,
      emailRequired: false,
    });
  }
}

export async function POST(request: Request) {
  const session = await getAuthorizedSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = ConversionKitKycSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { email: sessionEmail, useTestCollection } = session;
  const email = sessionEmail ?? parsed.data.email;

  if (
    sessionEmail &&
    sessionEmail !== parsed.data.email.trim().toLowerCase()
  ) {
    return NextResponse.json({ error: "email_mismatch" }, { status: 400 });
  }

  try {
    await saveConversionKitKyc(
      { ...parsed.data, email },
      useTestCollection,
    );
  } catch (error) {
    console.error("[conversion-kit-kyc] save failed", error);
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
