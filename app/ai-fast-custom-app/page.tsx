import { ChaosSurveyForm } from '@/components/chaos/ChaosSurveyForm';

export const metadata = {
  title: 'Free AI Lead & Sales Machine Audit | Turn Your Website into a 24/7 Revenue Engine',
  description: 'See exactly how a custom AI chatbot + automation can qualify leads, book appointments, and recover sales 24/7 — even while you sleep. Get personalized recommendations free.',
};

export default function FastCustomAppAudit() {
  return (
    <main className="bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Get a Custom AI App Built Specifically for Your Small Business in Under 2 Weeks
          </h1>
          <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
            See exactly what a fast, affordable, tailored AI solution could look like for your business. Answer a short survey and receive personalized recommendations + scope ideas in 48 hours.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-2xl">
          <div className="text-center text-sm font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-4">
            Real Results from Small Businesses Like Yours
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <a href="/projects/ai-shopify-store" className="block rounded-2xl border p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900">
              <div className="font-semibold">AI-Powered Shopify Store (Curated.)</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Full headless experience with autonomous agents, visual stylist, and real cart integration</div>
            </a>
            <a href="/projects/autonomous-agentic-commerce-bot" className="block rounded-2xl border p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900">
              <div className="font-semibold">Autonomous Agentic Commerce Bot</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Tool-calling AI that searches, compares, adds to cart, and checks out autonomously</div>
            </a>
          </div>
        </div>

        <div className="mt-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold">Get Your Free AI Fast Custom App Recommendations</h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Tell me about your current lead and sales process. I'll personally analyze it and send you a custom AI roadmap (including chatbot/automation ideas) within 48 hours — completely free.
            </p>
          </div>

          <ChaosSurveyForm 
            source="fast-custom-app" 
            title="Fast Custom AI App"
            painLabel="What's your single biggest frustration right now with development or tools?"
            useTestCollection={true}
          />
        </div>

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
