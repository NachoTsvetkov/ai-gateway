import Link from 'next/link';
import { ChaosSurveyForm } from 'components/chaos/ChaosSurveyForm';
import { ViewContentTracker } from 'components/analytics/view-content-tracker';

export const metadata = {
  title: 'Free AI Virtual Team Member Audit | Get an AI Team That Works Every Month',
  description: 'Explore ongoing AI agents + support that continuously improves your results. See what a monthly AI team member could handle for your business and receive ideas in 48 hours.',
};

export default function VirtualTeamRetainerAudit() {
  return (
    <main className="bg-white dark:bg-neutral-950">
      <ViewContentTracker
        contentId="virtual-team-retainer"
        contentName="AI Virtual Team Member Audit"
        contentType="audit"
      />

      <section
        aria-labelledby="audit-hero-heading"
        className="relative isolate overflow-hidden border-b border-neutral-200 bg-white py-16 sm:py-20 dark:border-neutral-800 dark:bg-neutral-950"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/15 via-transparent to-transparent dark:from-blue-600/20" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-transparent dark:from-violet-600/15" />

        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-4">
            <Link
              href="/free-ai-audits"
              className="inline-flex items-center gap-1.5 text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M15 10a.75.75 0 0 1-.75.75H7.612l2.158 1.96a.75.75 0 1 1-1.04 1.08l-3.5-3.25a.75.75 0 0 1 0-1.08l3.5-3.25a.75.75 0 1 1 1.04 1.08L7.612 9.25h6.638A.75.75 0 0 1 15 10Z"
                  clipRule="evenodd"
                />
              </svg>
              All free audits
            </Link>
          </div>

          <p className="text-sm font-semibold uppercase tracking-widest text-blue-700 dark:text-blue-400">
            Ongoing AI Virtual Team Member
          </p>
          <h1
            id="audit-hero-heading"
            className="mt-3 text-3xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white"
          >
            Get a Custom AI Virtual Team Member That Works for You Every Month
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-neutral-700 sm:text-lg dark:text-neutral-300">
            Explore ongoing AI agents + support that continuously improves your results. See what a monthly AI team member could handle for your business and receive ideas in 48 hours.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-300">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
            AI that keeps working and improving • Monthly strategy &amp; optimization • Predictable results
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 pt-12">
        <div className="text-center text-sm font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-4">
          Real Results from Small Businesses Like Yours
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href="/projects/ai-shopify-store"
            className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-600/5 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-blue-500/30"
          >
            <div className="font-semibold text-neutral-900 dark:text-white">AI-Powered Shopify Store</div>
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
              Autonomous agents + voice + recovery running 24/7 with monthly optimization
            </p>
          </a>
          <a
            href="/projects/autonomous-agentic-commerce-bot"
            className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-600/5 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-blue-500/30"
          >
            <div className="font-semibold text-neutral-900 dark:text-white">Autonomous Agentic Commerce Bot</div>
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
              Tool-calling AI that acts on your behalf — continuously improving
            </p>
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12 lg:py-16">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">Get Your Free AI Virtual Team Member Recommendations</h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Explore ongoing AI agents + support that continuously improves your results. See what a monthly AI team member could handle for your business and receive ideas in 48 hours.
          </p>
        </div>

        <ChaosSurveyForm
          source="virtual-team-retainer"
          title="AI Virtual Team Retainer"
          painLabel="What interest do you have in recurring support or ongoing optimization?"
          useTestCollection={false}
        />

        <div className="mt-12 text-center text-sm">
          <a href="https://calendly.com/nacho-tsvetkov/30min" className="text-blue-600 hover:underline dark:text-blue-400">
            While you wait — book your free 15-min discovery call →
          </a>
          <span className="mx-3 text-neutral-400">•</span>
          <a href="/bundles/enterprise" className="text-blue-600 hover:underline dark:text-blue-400">
            Or explore proven AI solutions →
          </a>
        </div>
      </div>
    </main>
  );
}
