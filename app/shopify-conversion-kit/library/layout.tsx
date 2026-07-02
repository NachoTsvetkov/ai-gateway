import type { ReactNode } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  LibraryKycGate,
  type LibraryKycStatus,
} from "components/conversion-scorecard/library-kyc-gate";
import {
  hasConversionKitKycServer,
  resolveLibrarySessionEmailServer,
  useConversionKitTestCollection,
} from "lib/conversion-scorecard/kyc.server";
import { verifyLibraryTokenEntitlement } from "lib/digital-product-auth.server";
import {
  LIBRARY_BASE_PATH,
  LIBRARY_LOGIN_PATH,
  readLibraryAccessToken,
} from "lib/digital-product-access";

export const metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function getInitialKycStatus(token: string): Promise<LibraryKycStatus> {
  const useTestCollection = useConversionKitTestCollection();

  try {
    const email = await resolveLibrarySessionEmailServer(token, useTestCollection);

    if (!email) {
      return { complete: false, email: null, emailRequired: true };
    }

    const complete = await hasConversionKitKycServer(email, useTestCollection);

    return { complete, email, emailRequired: false };
  } catch (error) {
    console.error("[library-kyc] initial status check failed", error);
    const email = await resolveLibrarySessionEmailServer(
      token,
      useTestCollection,
    ).catch(() => null);
    return { complete: false, email, emailRequired: !email };
  }
}

export default async function ScorecardLibraryLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const token = readLibraryAccessToken(cookieStore);
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
