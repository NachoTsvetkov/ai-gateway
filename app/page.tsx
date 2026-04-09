import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Nacho Tsvetkov – Full-Stack AI Engineer",
  description:
    "Full-Stack AI Engineer specializing in Next.js, React, C#, and AI-powered applications. 10+ years of experience building production systems.",
  openGraph: {
    type: "website",
  },
};

const skills = [
  { category: "Frontend", items: "React, Next.js, React Native, Tailwind CSS, HTML5, CSS3" },
  { category: "Backend", items: "C#, .NET Core, ASP.NET, Node.js, PHP" },
  { category: "AI / ML", items: "OpenAI, Vercel AI SDK, Google Cloud AI" },
  { category: "Databases", items: "MS SQL, PostgreSQL, MySQL" },
  { category: "DevOps", items: "Docker, Jenkins, Git, Bamboo, Kafka, RabbitMQ" },
  { category: "Monitoring", items: "Grafana, Graphite" },
];

const experience = [
  {
    role: "Team Lead",
    company: "E-Commerce NT",
    period: "April 2021 – Present",
    tech: "JavaScript, React Native, Google Cloud AI, C#, WPF, ReactJS, PHP",
  },
  {
    role: "Senior Developer",
    company: "HedgeServ",
    period: "October 2019 – April 2021",
    tech: "C#, .NET Core 3.1, ASP.NET, Docker, RabbitMQ, MS SQL",
  },
  {
    role: "Senior Developer",
    company: "Team.Blue Nordic",
    period: "May 2019 – October 2019",
    tech: "C#, .NET Core 2.1, ASP.NET MVC, MS SQL",
  },
  {
    role: "Intern → Senior Developer",
    company: "Prevalent, ComStream, Sb Tech, Smart It, Sofia Marine, Dais Software",
    period: "2013 – 2019",
    tech: "C#, ASP.NET MVC, WCF, PostgreSQL, RabbitMQ, Docker",
  },
];

export default function PortfolioHome() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-violet-600/10 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:py-32">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:gap-16">
            {/* Photo */}
            <div className="shrink-0">
              <div className="relative h-48 w-48 overflow-hidden rounded-full border-4 border-blue-500/30 shadow-2xl shadow-blue-500/20 sm:h-56 sm:w-56">
                <Image
                  src="/profile.png"
                  alt="Nacho Tsvetkov"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
            </div>

            {/* Info */}
            <div className="text-center lg:text-left">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm text-green-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                Available for hire
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Nacho Tsvetkov
              </h1>
              <p className="mt-3 text-xl font-medium text-blue-400 sm:text-2xl">
                Full-Stack AI Engineer
              </p>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-neutral-300">
                10+ years building production systems with C#, React, Next.js,
                and AI. Team lead experienced in e-commerce, fintech, and cloud
                platforms. Based in Sofia, Bulgaria.
              </p>

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500"
                >
                  View Projects
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                  </svg>
                </Link>
                <a
                  href="mailto:Nacho.Tsvetkov@gmail.com"
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-600 px-8 py-3.5 text-sm font-semibold text-neutral-200 transition-all hover:border-neutral-500 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
                    <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
                  </svg>
                  Contact Me
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-neutral-400 lg:justify-start">
                <span className="inline-flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="m9.69 18.933.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
                  </svg>
                  Sofia, Bulgaria
                </span>
                <span>·</span>
                <span>English (Excellent)</span>
                <span>·</span>
                <span>Bulgarian (Native)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="border-t border-neutral-200 bg-white py-20 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Technical Skills
          </h2>
          <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((s) => (
              <div
                key={s.category}
                className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-800/50"
              >
                <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-900 dark:text-white">
                  {s.category}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {s.items}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience */}
      <section className="border-t border-neutral-200 bg-neutral-50 py-20 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Experience
          </h2>
          <div className="mx-auto mt-10 max-w-3xl space-y-6">
            {experience.map((exp) => (
              <div
                key={exp.role + exp.company}
                className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
              >
                <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                  <h3 className="font-semibold text-neutral-900 dark:text-white">
                    {exp.role}
                  </h3>
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    {exp.period}
                  </span>
                </div>
                <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                  {exp.company}
                </p>
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  {exp.tech}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Project CTA */}
      <section className="border-t border-neutral-800 bg-neutral-900 py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            Featured Project
          </h2>
          <h3 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
            AI-Powered Shopify Store
          </h3>
          <p className="mx-auto mt-4 max-w-xl text-neutral-400">
            Headless Next.js storefront with real-time AI product
            recommendations, intelligent chatbot, and seamless Shopify
            integration. Try it live.
          </p>
          <Link
            href="/projects/ai-shopify-store"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500"
          >
            Explore Live Demo
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950 py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-neutral-500">
          <p>
            &copy; {new Date().getFullYear()} Nacho Tsvetkov. All rights
            reserved.
          </p>
          <p className="mt-2 text-xs text-neutral-600">
            Nacho.Tsvetkov@gmail.com &middot; +359 882 700 002 &middot; Sofia,
            Bulgaria
          </p>
        </div>
      </footer>
    </>
  );
}
