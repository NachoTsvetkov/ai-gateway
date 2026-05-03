export default {
  experimental: {
    ppr: true,
    inlineCss: true,
    useCache: true,
  },
  // Whitelist hostnames the dev server is willing to serve assets to.
  // Without this, Next 15 emits a "Cross origin request detected" error
  // (or silently strips RSC payloads) when the browser hits us via a
  // tunnel hostname like `https://abc123.ngrok-free.app`. Wildcards are
  // matched against the request's `Host` header.
  //
  // This list is dev-only — production builds ignore it. Add your own
  // tunnel host here if you use Cloudflare Tunnel, localtunnel, etc.
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok.app", "*.ngrok.io"],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/s/files/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};
