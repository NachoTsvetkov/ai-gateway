import Link from 'next/link';
import { ViewContentTracker } from 'components/analytics/view-content-tracker';

export const metadata = {
  title: 'Free Personalized AI Opportunity Reports for Small Businesses',
  description: 'Choose your focus area. Answer a short guided survey and receive a free personalized AI Opportunity Report with tailored ideas within 48 hours — reviewed personally by Nacho.',
};

export default function FreeAIAuditsHub() {
  const audits = [
    {
      href: '/free-ai-audits/win-free-website',
      title: 'Win a Free Website + AI Chatbot',
      description:
        'Enter the monthly giveaway — professional website + AI chatbot that books clients 24/7. Instant free guide included.',
      source: 'free-website-giveaway',
      featured: true,
    },
    {
      href: '/ai-revenue-audit',
      title: 'Find Hidden Revenue Leaks',
      description: 'Identify exactly where manual processes and missed leads are costing you money.',
      source: 'revenue-audit',
    },
    {
      href: '/ai-fast-custom-app',
      title: 'Get a Custom AI App Built Fast',
      description: 'See how a tailored AI solution can be built for your business in under 2 weeks.',
      source: 'fast-custom-app',
    },
    {
      href: '/ai-lead-machine',
      title: 'Turn Your Website into a 24/7 Sales Machine',
      description: 'Discover AI chatbots and automation that qualify leads and book appointments while you sleep.',
      source: 'lead-machine',
    },
    {
      href: '/ai-time-back',
      title: 'Reclaim Your Evenings & Weekends',
      description: 'Find out how custom AI automation can handle repetitive work so you get time back.',
      source: 'time-back',
    },
    {
      href: '/ai-affordable-non-tech',
      title: 'Simple, Powerful AI Without the Tech Headache',
      description: 'See affordable AI solutions designed specifically for small business owners who aren’t technical.',
      source: 'affordable-non-tech',
    },
    {
      href: '/ai-virtual-team-retainer',
      title: 'Get an AI Team Member That Works Every Month',
      description: 'Explore custom AI agents + ongoing support that continuously improves your results.',
      source: 'virtual-team-retainer',
    },
  ];

  return (
    <main className="bg-white dark:bg-neutral-950">
      <ViewContentTracker
        contentId="free-ai-audits"
        contentName="Free AI Audits Hub"
        contentType="page"
      />

      {/* Hero section with gradient background consistent with the main landing page */}
      <section
        aria-labelledby="hub-hero-heading"
        className="relative isolate overflow-hidden bg-blue-500"
      >
        {/* Mask: knocks the saturated bg back to a usable surface on light/dark */}
        <div className="absolute inset-0 -z-10 bg-white/85 dark:bg-neutral-950/80" />
        {/* Bottom fade — softens the seam into content below */}
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-b from-transparent to-white dark:to-neutral-950" />
        {/* Top-right blue glow */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/15 via-transparent to-transparent dark:from-blue-600/25" />
        {/* Bottom-left violet glow */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-transparent dark:from-violet-600/15" />

        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-100 px-4 py-1.5 text-sm text-green-800 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500 dark:bg-green-400" />
              Free • Personalized • 48 hours
            </div>

            <h1 id="hub-hero-heading" className="text-4xl font-bold tracking-tight sm:text-6xl">
              Get a Free Personalized AI Opportunity Report for Your Biggest Challenge
            </h1>
            <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
              Choose the focus area that matters most right now. Answer a short guided survey and I’ll personally review your answers and send you a tailored AI Opportunity Report with specific ideas within 48 hours — completely free.
            </p>
          </div>
        </div>
      </section>

        <div className="mx-auto mt-12 max-w-2xl text-center">
          <h2 className="text-xl font-semibold">How it works</h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-3 text-left">
            <div>
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400">1</div>
              <div className="mt-2 font-medium">Choose the focus area that matches your biggest challenge</div>
            </div>
            <div>
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400">2</div>
              <div className="mt-2 font-medium">Answer a few quick questions</div>
            </div>
            <div>
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400">3</div>
              <div className="mt-2 font-medium">Receive your free personalized AI Opportunity Report in 48 hours</div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {audits.map((audit) => (
            <Link
              key={audit.href}
              href={audit.href}
              className={`group flex h-full flex-col rounded-2xl border p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                audit.featured
                  ? 'border-green-300 bg-green-50/50 hover:border-green-400 hover:shadow-green-600/10 dark:border-green-500/40 dark:bg-green-500/5 dark:hover:border-green-400/50'
                  : 'border-neutral-200 bg-white hover:border-blue-300 hover:shadow-blue-600/5 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-blue-500/30'
              }`}
            >
              {audit.featured && (
                <span className="mb-3 inline-flex self-start rounded-full bg-green-600 px-2.5 py-0.5 text-xs font-semibold text-white dark:bg-green-500">
                  Monthly giveaway
                </span>
              )}
              <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                {audit.title}
              </h3>
              <p className="mt-3 flex-1 text-sm text-neutral-600 dark:text-neutral-300">
                {audit.description}
              </p>
              <div className="mt-4 text-sm font-semibold text-blue-600 dark:text-blue-400">
                {audit.featured ? 'Enter the giveaway →' : 'Get my free report →'}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 mb-12 text-center">
          <p className="text-neutral-600 dark:text-neutral-400">
            Not sure which one is right for you?{' '}
            <a href="https://calendly.com/nacho-tsvetkov/30min" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
              Book a free 15-min discovery call and I’ll help you choose →
            </a>
          </p>
        </div>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-neutral-50 py-8 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
          <p>
            &copy; {new Date().getFullYear()} Nacho Tsvetkov. All rights reserved.
          </p>
          <p className="mt-1 text-xs">
            <a href="mailto:nacho.tsvetkov@gmail.com" className="hover:underline">nacho.tsvetkov@gmail.com</a>
            {" · "}
            <a href="https://calendly.com/nacho-tsvetkov/30min" className="hover:underline">Book a call</a>
            {" · "}
            <a href="/" className="hover:underline">Back to home</a>
          </p>
        </div>
      </footer>
    </main>
  );
}
