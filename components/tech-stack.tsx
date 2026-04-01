export function TechStack() {
  const stack = [
    { name: "Next.js 16", role: "App Router + RSC" },
    { name: "Shopify", role: "Storefront API" },
    { name: "OpenAI", role: "GPT-4o-mini" },
    { name: "Vercel AI SDK", role: "Streaming Chat" },
    { name: "Tailwind CSS 4", role: "Styling" },
    { name: "Vercel", role: "Edge Deployment" },
  ];

  return (
    <section className="border-t border-neutral-800 bg-neutral-900 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-neutral-500">
          Tech Stack
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {stack.map((tech) => (
            <div key={tech.name} className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-white">{tech.name}</span>
              <span className="text-neutral-600">·</span>
              <span className="text-neutral-400">{tech.role}</span>
            </div>
          ))}
        </div>
        <hr className="mx-auto mt-10 max-w-md border-neutral-800" />
        <p className="mt-6 text-center text-xs text-neutral-500">
          Fiverr Portfolio Demo &ndash; April 2026 | Built by Full-Stack AI
          Engineer | Live at{" "}
          <a
            href="https://ai-gateway-nine-nu.vercel.app"
            className="text-neutral-400 underline decoration-neutral-700 underline-offset-2 transition-colors hover:text-blue-400"
          >
            ai-gateway-nine-nu.vercel.app
          </a>
        </p>
      </div>
    </section>
  );
}
