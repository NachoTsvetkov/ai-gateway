import { KoreShell } from "components/layout/kore-shell";
import { ReactNode } from "react";

export default function KoreStudioLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <KoreShell>{children}</KoreShell>;
}
