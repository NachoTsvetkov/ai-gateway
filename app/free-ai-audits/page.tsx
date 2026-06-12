import Link from 'next/link';
import { ChaosSurveyForm } from 'components/chaos/ChaosSurveyForm';
import { ViewContentTracker } from 'components/analytics/view-content-tracker';

export const metadata = {
  title: 'Free AI Audits & Experiments for Small Businesses | Choose Your Focus',
  description: 'Pick the area where you lose the most time or revenue. Answer a short survey and get personalized AI recommendations from Nacho within 48 hours — completely free.',
};

export default function FreeAIAuditsHub() {
  const audits = [
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
      <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-100 px-4 py-1.5 text-sm text-green-800 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500 dark:bg-green-400" />
            Free • Personalized • 48 hours
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Choose the Free AI Audit That Solves Your Biggest Small Business Problem
          </h1>
          <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
            Pick the area where you lose the most time or revenue. Answer a short survey and get personalized AI recommendations from Nacho within 48 hours — completely free.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-2xl text-center">
          <h2 className="text-xl font-semibold">How it works</h2>
          <div className="mt-6 grid gap-8 sm:grid-cols-3 text-left">
            <div>
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400">1</div>
              <div className="mt-2 font-medium">Choose the audit that matches your biggest challenge</div>
            </div>
            <div>
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400">2</div>
              <div className="mt-2 font-medium">Answer a few quick questions</div>
            </div>
            <div>
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400">3</div>
              <div className="mt-2 font-medium">Get personalized AI ideas + next steps in 48 hours</div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {audits.map((audit) => (
            <Link
              key={audit.href}
              href={audit.href}
              className="group flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-600/5 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-blue-500/30"
            >
              <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                {audit.title}
              </h3>
              <p className="mt-3 flex-1 text-sm text-neutral-600 dark:text-neutral-300">
                {audit.description}
              </p>
              <div className="mt-4 text-sm font-semibold text-blue-600 dark:text-blue-400">
                Start this audit →
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-neutral-600 dark:text-neutral-400">
            Not sure which one is right for you?{' '}
            <a href="https://calendly.com/nacho-tsvetkov/30min" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
              Book a free 15-min discovery call and I’ll help you choose →
            </a>
          </p>
        </div>

        {/* Quick test form using test collection */}
        <div className="mx-auto mt-16 max-w-2xl">
          <div className="mb-4 text-center text-sm font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Quick test (writes to test collection)
          </div>
          <ChaosSurveyForm 
            source="hub-test" 
            title="Test the Chaos Survey Form"
            useTestCollection={true}  // true = local/custom test bucket; default=false=prod. ?test=false in URL forces local/custom on any page.
          />
        </div>
      </div>
    </main>
  );
}
