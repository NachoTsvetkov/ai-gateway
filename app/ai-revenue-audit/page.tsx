import { ChaosSurveyForm } from 'components/chaos/ChaosSurveyForm';

export const metadata = {
  title: 'Free AI Revenue Leak Audit for Small Businesses | Get 3 Quick Wins in 48 Hours',
  description: 'Discover exactly where your small business is losing revenue from manual processes or missed leads. Get a personalized AI audit + 3 actionable quick wins — free.',
};

export default function RevenueLeakAudit() {
  return (
    <main className="bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Stop Losing Revenue While You Sleep — Get Your Free AI Revenue Leak Audit
          </h1>
          <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
            In 15 minutes or less, identify hidden leaks in bookings, leads, and follow-ups. I'll personally review your answers and send you 3 tailored AI fixes that have delivered +340% more bookings for other small businesses.
          </p>
          <div className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
            Used by fitness studios, boutiques &amp; service businesses • Results in under 2 weeks
          </div>
        </div>

        {/* Social proof */}
        <div className="mx-auto mt-12 max-w-2xl">
          <div className="text-center text-sm font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-4">
            Real Results from Small Businesses Like Yours
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <a href="/projects/local-fitness-studio" className="block rounded-2xl border p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900">
              <div className="font-semibold">Local Fitness Studio (KORE)</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">+340% bookings, 0 missed calls with AI booking flow + chatbot</div>
            </a>
            <a href="/projects/boutique-fashion-brand" className="block rounded-2xl border p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900">
              <div className="font-semibold">Boutique Fashion Brand (ROZÉ)</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">28% cart recovery +19% AOV with AI personalization + automation</div>
            </a>
          </div>
        </div>

        <div className="mt-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold">Get Your Free Personalized AI Revenue Leak Audit</h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Answer a few quick questions about your business. I'll review every response personally and email you 3 specific AI ideas or quick wins within 48 hours. This is 100% free — no obligation.
            </p>
          </div>

          <ChaosSurveyForm 
            source="revenue-audit" 
            title="Revenue Leak Audit"
            painLabel="What's your biggest current frustration or revenue leak?"
            useTestCollection={true}  // local test uses test bucket
          />
        </div>

        <div className="mt-12 text-center text-sm">
          <a href="https://calendly.com/nacho-tsvetkov/30min" className="text-blue-600 hover:underline dark:text-blue-400">
            While you wait — book your free 15-min discovery call →
          </a>
          <span className="mx-3 text-neutral-400">•</span>
          <a href="/bundles/enterprise" className="text-blue-600 hover:underline dark:text-blue-400">
            Or explore proven AI solutions that delivered results →
          </a>
        </div>
      </div>
    </main>
  );
}
