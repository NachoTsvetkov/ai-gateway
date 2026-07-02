import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { LibraryLoginForm } from "components/conversion-scorecard/library-login-form";
import { verifyLibraryTokenEntitlement } from "lib/digital-product-auth.server";
import {
  ACCESS_COOKIE_NAME,
  LIBRARY_BASE_PATH,
} from "lib/digital-product-access";

export const metadata = {
  title: "Log in — scorecard library",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function safeLibraryNext(next: string | undefined): string {
  if (next && next.startsWith(LIBRARY_BASE_PATH)) {
    return next;
  }
  return LIBRARY_BASE_PATH;
}

export default async function LibraryLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const redirectTo = safeLibraryNext(sp.next);

  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;
  if (token && (await verifyLibraryTokenEntitlement(token))) {
    redirect(redirectTo);
  }

  return <LibraryLoginForm redirectTo={redirectTo} />;
}
