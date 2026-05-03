import { CartProvider } from "components/cart/cart-context";
import { Navbar } from "components/layout/navbar";
import { NavbarGate } from "components/layout/navbar/navbar-gate";
import { GeistSans } from "geist/font/sans";
import { getCart } from "lib/shopify";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import "./globals.css";
import { baseUrl } from "lib/utils";

// Routes where the global marketing navbar should NOT render — the
// standalone shop experience on the AI Shopify Store demo. These
// routes use ShopShell (StoreNav + ShopFooter) instead and are framed
// as a standalone storefront. /product and /search are listed here
// even though they aren't nested under /projects/ai-shopify-store
// because the StoreNav category links go to /search/<collection>
// and product cards link to /product/<handle> — without these the
// global navbar would reappear the moment the visitor clicks a
// product or category and the "subdomain" illusion would collapse.
const HIDE_NAVBAR_ON: ReadonlyArray<string> = [
  "/projects/ai-shopify-store",
  "/product",
  "/search",
];

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Nacho Tsvetkov – Money Generator for Small Businesses",
    template: "%s | Nacho Tsvetkov",
  },
  description:
    "Professional website + smart automation that turns small businesses into 24/7 money generators. No more missed leads, no more manual work. Starting at 59 €.",
  robots: {
    follow: true,
    index: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Don't await the fetch, pass the Promise to the context provider
  const cart = getCart();

  return (
    <html lang="en" className={`${GeistSans.variable} scroll-smooth`}>
      <body suppressHydrationWarning className="bg-neutral-50 text-black selection:bg-teal-300 dark:bg-neutral-900 dark:text-white dark:selection:bg-pink-500 dark:selection:text-white">
        <CartProvider cartPromise={cart}>
          <NavbarGate hideOnPrefix={HIDE_NAVBAR_ON}>
            <Navbar />
          </NavbarGate>
          <main>
            {children}
            <Toaster closeButton />
          </main>
        </CartProvider>
      </body>
    </html>
  );
}
