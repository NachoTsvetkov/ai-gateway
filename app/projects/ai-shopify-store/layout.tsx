import { ShopShell } from "components/layout/shop-shell";
import { ReactNode } from "react";

export default function StoreProjectLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ShopShell>{children}</ShopShell>;
}
