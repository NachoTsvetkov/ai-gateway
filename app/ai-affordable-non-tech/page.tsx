import { ChaosSurveyForm } from 'components/chaos/ChaosSurveyForm';

export const metadata = {
  title: 'Free AI for Non-Tech Owners Audit | Powerful Custom AI Without the Tech Headache',
  description: 'See simple, affordable AI solutions designed specifically for non-technical business owners. Get personalized recommendations that actually make sense for your business in 48 hours.',
};

export default function AffordableNonTechAudit() {
  return (
    <main className="bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Powerful Custom AI Built for Small Business Owners — No Tech Expertise Required
          </h1>
          <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
            See simple, affordable AI solutions designed specifically for non-technical business owners. Get clear, personalized recommendations that actually make sense for your business in 48 hours.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-2xl">
          <div className="text-center text-sm font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-4">
            Real Results from Small Businesses Like Yours
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <a href="/projects/boutique-fashion-brand" className="block rounded-2xl border p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900">
              <div className="font-semibold">Boutique Fashion Brand (ROZÉ)</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">28% cart recovery with AI personalization — no tech team required</div>
            </a>
            <a href="/projects/local-fitness-studio" className="block rounded-2xl border p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900">
              <div className="font-semibold">Local Fitness Studio (KORE)</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">AI receptionist handling bookings 24/7 — owner focuses on coaching</div>
            </a>
          </div>
        </div>

        <div className="mt-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold">Get Your Free AI for Non-Tech Owners Recommendations</h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              See affordable AI solutions designed specifically for non-technical business owners. Get personalized recommendations that actually make sense in 48 hours.
            </p>
          </div>

          <ChaosSurveyForm 
            source="affordable-non-tech" 
            title="Affordable AI for Non-Tech Owners"
            painLabel="What’s causing the tech overwhelm or bad past experiences with tools?"
            useTestCollection={true}
          />
        </div>

        <div className="mt-12 text-center text-sm">
          <a href="https://calendly.com/nacho-tsvetkov/30min" className="text-blue-600 hover:underline dark:text-blue-400">
            While you wait — book your free 15-min discovery call →
          </a>
          <span className="mx-3 text-neutral-400">•</span>
          <a href="/bundles/startup" className="text-blue-600 hover:underline dark:text-blue-400">
            Or explore proven AI solutions →
          </a>
        </div>
      </div>
    </main>
  );
}
