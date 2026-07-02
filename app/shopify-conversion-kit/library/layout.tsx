import type { ReactNode } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  LibraryKycGate,
  type LibraryKycStatus,
} from "components/conversion-scorecard/library-kyc-gate";
import {
  hasConversionKitKyc,
  resolveLibrarySessionEmail,
} from "lib/conversion-scorecard/kyc";
import { verifyLibraryTokenEntitlement } from "lib/digital-product-auth.server";
import {
  ACCESS_COOKIE_NAME,
  LIBRARY_BASE_PATH,
  LIBRARY_LOGIN_PATH,
} from "lib/digital-product-access";

export const metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function getInitialKycStatus(token: string): Promise<LibraryKycStatus> {
  const useTestCollection = process.env.NODE_ENV !== "production";

  try {
    const email = await resolveLibrarySessionEmail(token, useTestCollection);

    if (!email) {
      return { complete: false, email: null, emailRequired: true };
    }

    let complete = await hasConversionKitKyc(email, useTestCollection);
    if (!complete && useTestCollection) {
      complete = await hasConversionKitKyc(email, false);
    }

    return { complete, email, emailRequired: false };
  } catch (error) {
    console.error("[library-kyc] initial status check failed", error);
    const email = await resolveLibrarySessionEmail(token, useTestCollection).catch(
      () => null,
    );
    return { complete: false, email, emailRequired: !email };
  }
}

export default async function ScorecardLibraryLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  const hasAccess = Boolean(
    token && (await verifyLibraryTokenEntitlement(token)),
  );

  if (!hasAccess) {
    const headersList = await headers();
    const pathname = headersList.get("x-pathname") ?? "";
    if (pathname.startsWith(LIBRARY_BASE_PATH)) {
      redirect(
        `${LIBRARY_LOGIN_PATH}?next=${encodeURIComponent(pathname)}`,
      );
    }
    redirect(LIBRARY_LOGIN_PATH);
  }

  const initialKycStatus = await getInitialKycStatus(token!);

  return (
    <>
      {children}
      <LibraryKycGate initialStatus={initialKycStatus} />
    </>
  );
}
