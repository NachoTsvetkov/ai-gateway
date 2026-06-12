import { ChaosSurveyForm } from '@/components/chaos/ChaosSurveyForm';

export const metadata = {
  title: 'Free AI Virtual Team Member Audit | Get an AI Team That Works Every Month',
  description: 'Explore ongoing AI agents + support that continuously improves your results. See what a monthly AI team member could handle for your business and receive ideas in 48 hours.',
};

export default function VirtualTeamRetainerAudit() {
  return (
    <main className="bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-3xl px-6 py-16 lg:py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Get a Custom AI Virtual Team Member That Works for You Every Month
          </h1>
          <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
            Explore ongoing AI agents + support that continuously improves your results. See what a monthly AI team member could handle for your business and receive ideas in 48 hours.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-2xl">
          <div className="text-center text-sm font-medium uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-4">
            Real Results from Small Businesses Like Yours
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <a href="/projects/ai-shopify-store" className="block rounded-2xl border p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900">
              <div className="font-semibold">AI-Powered Shopify Store</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Autonomous agents + voice + recovery running 24/7 with monthly optimization</div>
            </a>
            <a href="/projects/autonomous-agentic-commerce-bot" className="block rounded-2xl border p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900">
              <div className="font-semibold">Autonomous Agentic Commerce Bot</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-400">Tool-calling AI that acts on your behalf — continuously improving</div>
            </a>
          </div>
        </div>

        <div className="mt-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold">Get Your Free AI Virtual Team Member Recommendations</h2>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Explore ongoing AI agents + support that continuously improves your results. See what a monthly AI team member could handle for your business and receive ideas in 48 hours.
            </p>
          </div>

          <ChaosSurveyForm 
            source="virtual-team-retainer" 
            title="AI Virtual Team Retainer"
            painLabel="What interest do you have in recurring support or ongoing optimization?"
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
