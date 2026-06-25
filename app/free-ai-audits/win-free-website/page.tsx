import Link from 'next/link';
import { ReportRequestForm } from 'components/reports/ReportRequestForm';
import { ViewContentTracker } from 'components/analytics/view-content-tracker';

const FREE_GUIDE_PATH = '/guides/stop-losing-leads-while-you-sleep.pdf';

export const metadata = {
  title: 'Win a Free Basic Website + AI Chatbot | Monthly Giveaway',
  description:
    'Enter to win a professional website + AI chatbot that books clients while you sleep. Fill a 2-minute survey — 1–3 winners every month. Plus get a free lead-capture guide instantly.',
};

export default function WinFreeWebsiteGiveaway() {
  return (
    <main className="flex min-h-[calc(100dvh-4rem)] flex-col bg-white dark:bg-neutral-950">
      <ViewContentTracker
        contentId="free-website-giveaway"
        contentName="Win Free Website + AI Chatbot Giveaway"
        contentType="audit"
      />

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-4 sm:px-6 sm:py-5">
        <Link
          href="/free-ai-audits"
          className="inline-flex items-center gap-1 text-xs text-neutral-500 transition-colors hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className="h-3.5 w-3.5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 0 1-.75.75H7.612l2.158 1.96a.75.75 0 1 1-1.04 1.08l-3.5-3.25a.75.75 0 0 1 0-1.08l3.5-3.25a.75.75 0 1 1 1.04 1.08L7.612 9.25h6.638A.75.75 0 0 1 15 10Z"
              clipRule="evenodd"
            />
          </svg>
          All free audits
        </Link>

        <header className="mt-3 text-center">
          <h1 className="text-xl font-bold leading-snug tracking-tight text-neutral-900 sm:text-2xl dark:text-white">
            Win a Free Basic Website + AI Chatbot That Books Clients While You Sleep
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            Fill this quick 2-minute survey and get entered to win a professional website + AI chatbot
            (1–3 winners picked every month). Plus get instant access to the free guide after you submit.
          </p>
        </header>

        <div className="mt-4 flex-1">
          <ReportRequestForm
            source="free-website-giveaway"
            showFormHeader={false}
            compact
            painLabel="What's the biggest lead or booking problem you're trying to fix?"
            submitLabel="Enter the giveaway →"
            successTitle="You're in the draw!"
            successMessage="Thanks — your entry is recorded. Winners are picked monthly (1–3 per month) and notified by email. Grab your free guide in step 2 below."
            emailLabel="Email to enter the giveaway and receive winner updates"
            freeGuide={{
              href: FREE_GUIDE_PATH,
              title: 'Stop Losing Leads While You Sleep',
              description:
                'A practical guide on capturing and following up with leads automatically — even when you are closed.',
            }}
            showCalendlyLink={false}
            useTestCollection={false}
          />
          <p className="mt-3 text-center text-xs text-neutral-500 dark:text-neutral-400">
            By entering, you agree to the{' '}
            <Link
              href="/giveaway-terms"
              className="font-medium text-neutral-700 underline underline-offset-2 hover:text-blue-600 dark:text-neutral-300 dark:hover:text-blue-400"
            >
              Giveaway Terms &amp; Conditions
            </Link>
            . No purchase necessary.
          </p>
        </div>
      </div>
    </main>
  );
}
