import { CartProvider } from "components/cart/cart-context";
import { Navbar, type NavbarLabels } from "components/layout/navbar";
import { NavbarGate } from "components/layout/navbar/navbar-gate";
import { GeistSans } from "geist/font/sans";
import { getCart } from "lib/shopify";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import "./globals.css";
import { baseUrl } from "lib/utils";
import { detectLocaleAndCountry } from "lib/i18n/locale.server";
import { BG_COUNTRY } from "lib/i18n/locale";
import { DICT } from "lib/i18n/dict";
import { detectTheme } from "lib/theme/theme.server";

// Routes where the global marketing navbar should NOT render. Each of
// these is a standalone "live demo" with its own brand chrome (its
// own nav + footer), and the marketing navbar would shatter the
// subdomain-style illusion the moment a visitor lands on one.
//
// - /projects/ai-shopify-store + /product + /search → "Curated." shop
//   (ShopShell). /product and /search live at the root of the app, so
//   they need their own entries even though the brand sells them as
//   a single store.
// - /projects/local-fitness-studio → KORE fitness studio (KoreShell).
// - /projects/boutique-fashion-brand → ROZÉ Bulgarian boutique
//   (RozeShell).
const HIDE_NAVBAR_ON: ReadonlyArray<string> = [
  "/projects/ai-shopify-store",
  "/projects/local-fitness-studio",
  "/projects/boutique-fashion-brand",
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

  // Resolve the visitor's locale (cookie wins, geo fallback), country,
  // and theme in parallel so we can:
  //   - set the html `lang` attribute correctly for screen readers + SEO
  //   - thread translated chrome strings into the navbar
  //   - decide whether to mount the language toggle (BG traffic only)
  //   - apply the `dark` class on `<html>` from the server so the first
  //     paint is correct (no flash of wrong theme)
  //   - thread the active theme into the navbar so the pill renders
  //     with the correct active side highlighted on first paint
  const [{ locale, country }, theme] = await Promise.all([
    detectLocaleAndCountry(),
    detectTheme(),
  ]);
  const showLanguageToggle = country === BG_COUNTRY;

  // Pull every navbar string from the central dictionary in the
  // resolved locale. Keeps the navbar component itself fully
  // locale-agnostic — it just renders whatever copy it's handed.
  const labels: NavbarLabels = {
    wordmark: "Nacho Tsvetkov",
    taglineLead: DICT.nav.moneyGenerator[locale],
    taglineHighlight: DICT.nav.forSmallBusinesses[locale],
    projects: DICT.nav.projects[locale],
    services: DICT.nav.services[locale],
    bookFull: DICT.nav.bookCall[locale],
    bookMid: DICT.nav.bookCallShort[locale],
    bookShort: DICT.nav.bookCallTiny[locale],
    homeLabel: DICT.nav.home[locale],
    ariaSiteNav: DICT.nav.siteNavigation[locale],
    ariaOpenMenu: DICT.nav.openMenu[locale],
    ariaCloseMenu: DICT.nav.closeMenu[locale],
  };

  // The `dark` class is what makes every Tailwind `dark:` utility fire
  // (see the @custom-variant declaration in globals.css). When the
  // visitor is in light mode the class is omitted entirely, which is
  // also our default for first-time visitors who haven't picked a
  // theme yet.
  const htmlClassName = `${GeistSans.variable} scroll-smooth${theme === "dark" ? " dark" : ""}`;

  return (
    <html lang={locale} className={htmlClassName}>
      <body suppressHydrationWarning className="bg-neutral-50 text-black selection:bg-teal-300 dark:bg-neutral-900 dark:text-white dark:selection:bg-pink-500 dark:selection:text-white">
        <CartProvider cartPromise={cart}>
          <NavbarGate hideOnPrefix={HIDE_NAVBAR_ON}>
            <Navbar
              labels={labels}
              locale={locale}
              theme={theme}
              showLanguageToggle={showLanguageToggle}
            />
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
