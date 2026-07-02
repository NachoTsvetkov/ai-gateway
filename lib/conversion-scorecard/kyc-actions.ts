"use server";

import { cookies } from "next/headers";
import { readLibraryAccessToken } from "lib/digital-product-access";
import { verifyLibraryTokenEntitlement } from "lib/digital-product-auth.server";
import { ConversionKitKycSchema } from "lib/conversion-scorecard/kyc";
import {
  resolveLibrarySessionEmailServer,
  saveConversionKitKycServer,
  useConversionKitTestCollection,
} from "lib/conversion-scorecard/kyc.server";

export type SubmitConversionKitKycResult =
  | { ok: true }
  | {
      ok: false;
      error: "unauthorized" | "validation" | "email_mismatch" | "save_failed";
      message?: string;
      issues?: Record<string, string[]>;
    };

export async function submitConversionKitKyc(
  input: unknown,
): Promise<SubmitConversionKitKycResult> {
  const cookieStore = await cookies();
  const token = readLibraryAccessToken(cookieStore);

  if (!token || !(await verifyLibraryTokenEntitlement(token))) {
    return { ok: false, error: "unauthorized" };
  }

  const parsed = ConversionKitKycSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "validation",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const useTestCollection = useConversionKitTestCollection();
  const sessionEmail = await resolveLibrarySessionEmailServer(
    token,
    useTestCollection,
  );
  const email = sessionEmail ?? parsed.data.email;

  if (
    sessionEmail &&
    sessionEmail !== parsed.data.email.trim().toLowerCase()
  ) {
    return { ok: false, error: "email_mismatch" };
  }

  try {
    await saveConversionKitKycServer({ ...parsed.data, email }, useTestCollection);
    return { ok: true };
  } catch (error) {
    console.error("[conversion-kit-kyc] server action save failed", error);
    return { ok: false, error: "save_failed" };
  }
}
