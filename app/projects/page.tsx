import Link from "next/link";

export const metadata = {
  title: "Projects",
  description: "Portfolio projects by Nacho Tsvetkov – Full-Stack AI Engineer.",
};

const projects = [
  {
    title: "AI-Powered Shopify Store",
    description:
      "Headless Next.js storefront with real-time AI product recommendations, intelligent chatbot with Add to Cart, and seamless Shopify integration. Fullscreen chat mode, streaming responses, product cards inside chat.",
    tech: ["Next.js 16", "Shopify", "OpenAI", "Vercel AI SDK", "Tailwind 4"],
    href: "/projects/ai-shopify-store",
    status: "Live",
  },
];

export default function ProjectsPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1 text-sm text-neutral-400 transition-colors hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">Projects</h1>
          <p className="mt-4 max-w-xl text-lg text-neutral-400">
            Live demos and production work. Click any project to explore it
            interactively.
          </p>
        </div>
      </section>

      <section className="bg-neutral-50 py-16 dark:bg-neutral-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.title}
              href={project.href}
              className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all duration-300 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-600/10 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-blue-500/30"
            >
              <div className="p-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    {project.status}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5 text-neutral-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-500"
                  >
                    <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {project.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {project.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}

          {/* Placeholder for future projects */}
          <div className="flex items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 p-6 dark:border-neutral-700">
            <p className="text-center text-sm text-neutral-400">
              More projects coming soon...
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
