import { ChaosSurveyForm } from '@/components/chaos/ChaosSurveyForm';

export const metadata = {
  title: 'Free AI Time Back & Freedom Audit | Reclaim Your Evenings & Weekends',
  description: 'Find out how custom AI automation can handle repetitive work so you get time back to focus on growth (or actually rest). Get personalized automation ideas within 48 hours.',
};

export default function TimeBackAudit() {
  return (
    <main className="bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Reclaim Your Evenings &amp; Weekends with Custom AI Automation
          </h1>
          <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
            Find out how AI can handle the repetitive work so you get time back to focus on growth (or actually rest). Get personalized automation ideas within 48 hours.
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
            <a href="/projects/ai-shopify-store" className="block rounded-2xl border p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900">
              <div className="font-semibold">AI-Powered Shopify Store</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Automation that handles sales, recovery and support 24/7</div>
            </a>
          </div>
        </div>

        <div className="mt-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold">Get Your Free AI Time Back Recommendations</h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Find out how AI can handle repetitive tasks so you get time back to focus on growth (or actually rest). Get personalized automation ideas within 48 hours.
            </p>
          </div>

          <ChaosSurveyForm 
            source="time-back" 
            title="Time Back & Freedom Audit"
            painLabel="What’s your single biggest frustration or challenge right now with time or repetitive work?"
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
