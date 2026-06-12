import { ChaosSurveyForm } from '@/components/chaos/ChaosSurveyForm';

export const metadata = {
  title: 'Free AI Lead & Sales Machine Audit | Turn Your Website into a 24/7 Revenue Engine',
  description: 'See exactly how a custom AI chatbot + automation can qualify leads, book appointments, and recover sales 24/7 — even while you sleep. Get personalized recommendations free.',
};

export default function LeadMachineAudit() {
  return (
    <main className="bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Turn Your Website into a 24/7 Lead &amp; Sales Machine with Custom AI
          </h1>
          <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
            Discover how AI chatbots and automation can qualify leads, book appointments, and recover sales automatically — even while you sleep. Get personalized recommendations in 48 hours.
          </p>
        </div>

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
            <h2 className="text-2xl font-semibold">Get Your Free AI Lead &amp; Sales Machine Recommendations</h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Tell me about your current lead and sales process. I'll personally analyze it and send you a custom AI roadmap (including chatbot/automation ideas) within 48 hours — completely free.
            </p>
          </div>

          <ChaosSurveyForm 
            source="lead-machine" 
            title="AI Lead & Sales Machine"
            painLabel="What's your biggest leak in the lead-to-sale process right now?"
            useTestCollection={true}
          />
        </div>

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
