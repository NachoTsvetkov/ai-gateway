"use client";

import { type Theme, THEME_COOKIE } from "lib/theme/theme";

/**
 * Theme toggle pill rendered inside the marketing navbar.
 *
 * Visibility model: unlike the language toggle (BG-only), the theme
 * toggle is shown to every visitor. Light is the public default; dark
 * is opt-in for visitors who want the original navy + blue identity.
 *
 * Behaviour:
 *   - Click writes a 1-year cookie (`theme=light` or `theme=dark`)
 *     and reloads the page. The server reads the cookie via
 *     `detectTheme()` in the root layout and applies/removes the
 *     `dark` class on `<html>`, so the next paint is correct from the
 *     server with no flash.
 *   - We don't toggle `document.documentElement.classList` on the
 *     client first (then reload) because the reload would clobber it
 *     anyway, and the simpler "set cookie + reload" flow matches the
 *     language toggle pattern and keeps every server component in
 *     lockstep with the new theme on first paint.
 *
 * Aria + keyboard:
 *   - The two pills are buttons inside `role="group"` so screen
 *     readers announce them as a related pair.
 *   - `aria-pressed` reflects which side is active.
 *   - Each button carries a localised-friendly visual label (sun /
 *     moon SVG) plus an explicit `aria-label`.
 */
export function ThemeToggle({ currentTheme }: { currentTheme: Theme }) {
  function pickTheme(theme: Theme) {
    if (theme === currentTheme) return;
    setThemeCookie(theme);
    window.location.reload();
  }

  return (
    <div
      role="group"
      aria-label="Theme"
      className="hidden flex-shrink-0 items-center rounded-full border border-neutral-300 bg-white p-0.5 text-xs font-semibold sm:inline-flex dark:border-neutral-700 dark:bg-neutral-900"
    >
      <ThemePill
        active={currentTheme === "light"}
        onClick={() => pickTheme("light")}
        ariaLabel="Switch to light theme"
        icon="sun"
      />
      <ThemePill
        active={currentTheme === "dark"}
        onClick={() => pickTheme("dark")}
        ariaLabel="Switch to dark theme"
        icon="moon"
      />
    </div>
  );
}

/**
 * Mobile-sheet variant. Same cookie semantics, but rendered full-width
 * inside the slide-down menu so phone visitors can find the switcher
 * without hunting for the floating desktop pill.
 */
export function ThemeToggleMobile({
  currentTheme,
  onSwitched,
}: {
  currentTheme: Theme;
  onSwitched?: () => void;
}) {
  function pickTheme(theme: Theme) {
    if (theme === currentTheme) return;
    setThemeCookie(theme);
    onSwitched?.();
    window.location.reload();
  }
  return (
    <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-1 dark:border-neutral-800 dark:bg-neutral-950">
      <ThemePill
        active={currentTheme === "light"}
        onClick={() => pickTheme("light")}
        ariaLabel="Switch to light theme"
        icon="sun"
        full
        label="Light"
      />
      <ThemePill
        active={currentTheme === "dark"}
        onClick={() => pickTheme("dark")}
        ariaLabel="Switch to dark theme"
        icon="moon"
        full
        label="Dark"
      />
    </div>
  );
}

function ThemePill({
  active,
  onClick,
  ariaLabel,
  icon,
  full,
  label,
}: {
  active: boolean;
  onClick: () => void;
  ariaLabel: string;
  icon: "sun" | "moon";
  /** Full-width form for the mobile sheet (matches the language
   *  toggle's `full` variant). Adds a text label next to the icon so
   *  the option is unambiguous on a phone where the desktop tooltip
   *  isn't available. */
  full?: boolean;
  /** Visible label, only shown in `full` mode. */
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1 transition-colors ${
        full ? "flex-1 py-2 text-sm" : ""
      } ${
        active
          ? "bg-blue-600 text-white"
          : "text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
      }`}
    >
      {icon === "sun" ? <SunIcon /> : <MoonIcon />}
      {full && label ? <span>{label}</span> : null}
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.404a.75.75 0 0 1 0 1.06l-1.06 1.061a.75.75 0 1 1-1.061-1.06l1.06-1.061a.75.75 0 0 1 1.061 0ZM6.464 13.475a.75.75 0 0 1 0 1.06l-1.06 1.061a.75.75 0 0 1-1.061-1.06l1.06-1.061a.75.75 0 0 1 1.061 0ZM18 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM5 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 5 10ZM14.596 13.475a.75.75 0 0 1 1.061 0l1.06 1.061a.75.75 0 1 1-1.06 1.06l-1.061-1.06a.75.75 0 0 1 0-1.061ZM5.404 5.404a.75.75 0 0 1 1.06 0l1.061 1.061a.75.75 0 0 1-1.06 1.06L5.403 6.465a.75.75 0 0 1 0-1.061Z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path
        fillRule="evenodd"
        d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * Write the theme cookie. Path `/` so it applies to every route, and
 * 1 year so the visitor's choice survives across visits. Same-site=Lax
 * keeps it stripped from cross-site embeds without breaking normal
 * top-level navigation. Mirrors the locale-toggle cookie semantics.
 */
function setThemeCookie(theme: Theme) {
  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${THEME_COOKIE}=${theme}; Path=/; Max-Age=${oneYear}; SameSite=Lax`;
}
