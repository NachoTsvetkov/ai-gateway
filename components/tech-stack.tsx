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
    <section className="border-t border-neutral-200 bg-neutral-50 py-16 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          Tech Stack
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {stack.map((tech) => (
            <div key={tech.name} className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-neutral-900 dark:text-white">
                {tech.name}
              </span>
              <span className="text-neutral-400">·</span>
              <span className="text-neutral-500 dark:text-neutral-400">
                {tech.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
