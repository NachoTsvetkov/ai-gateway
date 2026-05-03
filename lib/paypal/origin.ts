// Resolve the *public-facing* origin for a request. Used to build the
// `return_url` / `cancel_url` we hand to PayPal when creating an order
// or subscription.
//
// Why this exists:
//   - In dev, `new URL(req.url).origin` returns `http://localhost:3000`.
//     PayPal's hosted-approval flow opens a popup that redirects to the
//     return_url. With a localhost return_url and live credentials,
//     PayPal can't postMessage the popup back to the parent (different
//     scheme / unregistered domain) and the popup ends up orphaned.
//   - When running behind an HTTPS tunnel (ngrok, Cloudflare Tunnel,
//     a load balancer, Vercel preview, etc.), the browser visits
//     e.g. `https://abc123.ngrok-free.app` but the Next.js server
//     still sees the upstream `localhost:3000` URL. The tunnel sets
//     `X-Forwarded-Host` + `X-Forwarded-Proto` so we can recover the
//     real public origin.
//
// Production deployments behind real HTTPS see the same forwarded
// headers from the platform's load balancer (Vercel, Fly, Railway,
// etc.) so this helper is correct in both dev-tunnel and prod
// without per-environment branching.

import "server-only";

export function getPublicOrigin(req: Request): string {
  // Forwarded headers take precedence — they reflect the URL the
  // browser actually used to reach us.
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto");
  if (forwardedHost) {
    // X-Forwarded-Host can be a comma-separated list when chained
    // through multiple proxies. The first entry is the original.
    const host = forwardedHost.split(",")[0]?.trim() ?? "";
    const proto = (forwardedProto?.split(",")[0]?.trim() ?? "https").replace(
      /:$/,
      "",
    );
    if (host) return `${proto}://${host}`;
  }
  // Fallback to whatever the runtime URL says (works for direct hits
  // to the dev server and for prod platforms that don't proxy).
  return new URL(req.url).origin;
}
