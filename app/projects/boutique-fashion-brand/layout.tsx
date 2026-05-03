import { RozeShell } from "components/layout/roze-shell";
import { ReactNode } from "react";

export default function RozeLayout({ children }: { children: ReactNode }) {
  return <RozeShell>{children}</RozeShell>;
}
