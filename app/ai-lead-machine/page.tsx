import Link from 'next/link';
import { ReportRequestForm } from 'components/reports/ReportRequestForm';
import { ViewContentTracker } from 'components/analytics/view-content-tracker';

export const metadata = {
  title: 'Free Personalized AI Opportunity Report | Lead & Sales Machine for Small Business',
  description: 'Get a free personalized AI Opportunity Report with specific chatbot and automation ideas to turn your website into a 24/7 lead and sales machine. Delivered in 48 hours.',
};

export default function LeadMachineAudit() {
  return (
    <main className="bg-white dark:bg-neutral-950">
      <ViewContentTracker
        contentId="lead-machine"
        contentName="AI Lead & Sales Machine"
        contentType="audit"
      />

      {/* Hero / Header - gradient background consistent with the main landing page hero */}
      <section
        aria-labelledby="audit-hero-heading"
        className="relative isolate overflow-hidden bg-blue-500 border-b border-blue-600/30 dark:border-blue-400/20"
      >
        {/* Mask: knocks the saturated bg back to a usable surface on light/dark */}
        <div className="absolute inset-0 -z-10 bg-white/85 dark:bg-neutral-950/80" />
        {/* Bottom fade — softens the seam into content below */}
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-b from-transparent to-white dark:to-neutral-950" />
        {/* Top-right blue glow - matching landing page */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/15 via-transparent to-transparent dark:from-blue-600/25" />
        {/* Bottom-left violet glow - matching landing page */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-transparent dark:from-violet-600/15" />

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
            AI Lead & Sales Machine
          </p>
          <h1
            id="audit-hero-heading"
            className="mt-3 text-3xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white"
          >
            Turn Your Website into a 24/7 Lead &amp; Sales Machine with Custom AI
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-relaxed text-neutral-700 sm:text-lg dark:text-neutral-300">
            Discover how AI chatbots and automation can qualify leads, book appointments, and recover sales automatically — even while you sleep. Get personalized recommendations in 48 hours.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-300">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
            Never miss another lead • 24/7 qualification &amp; booking • Proven (+340% bookings)
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-6 pt-12">
        <div className="text-center text-sm font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-4">
          Real Results from Small Businesses Like Yours
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href="/projects/local-fitness-studio"
            className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-600/5 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-blue-500/30"
          >
            <div className="font-semibold text-neutral-900 dark:text-white">Local Fitness Studio (KORE)</div>
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
              +340% bookings, 0 missed calls with AI booking flow + chatbot
            </p>
          </a>
          <a
            href="/projects/boutique-fashion-brand"
            className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-600/5 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-blue-500/30"
          >
            <div className="font-semibold text-neutral-900 dark:text-white">Boutique Fashion Brand (ROZÉ)</div>
            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
              28% cart recovery +19% AOV with AI personalization + automation
            </p>
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-12 lg:py-16">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">Get Your Free Personalized AI Opportunity Report</h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Answer a few short questions and I'll personally review them and send you a tailored AI Opportunity Report with specific ideas for turning your site into a 24/7 lead and sales machine — within 48 hours. 100% free, no obligation.
          </p>
        </div>

        <ReportRequestForm
          source="lead-machine"
          title="Lead & Sales Machine Report"
          painLabel="What's your biggest leak in the lead-to-sale process right now?"
          useTestCollection={false}
        />

        <div className="mt-12 text-center text-sm">
          <a href="https://calendly.com/nacho-tsvetkov/30min" className="text-blue-600 hover:underline dark:text-blue-400">
            While you wait — book your free 15-min discovery call →
          </a>
          <span className="mx-3 text-neutral-400">•</span>
          <a href="/bundles/scaleup" className="text-blue-600 hover:underline dark:text-blue-400">
            Or explore proven AI solutions →
          </a>
        </div>
      </div>
    </main>
  );
}
