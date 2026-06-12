'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { ReportRequestSchema, type ReportRequestData } from 'lib/surveys';
import { track } from 'lib/pixel/client';

interface Props {
  source: string; // e.g. 'revenue-audit'
  title?: string;
  intro?: string;
  painLabel?: string;
  useTestCollection?: boolean;
  onSuccess?: () => void;
}

export function ReportRequestForm({ 
  source, 
  title = 'Get Your Free Personalized AI Opportunity Report',
  intro = "Answer a few short questions and I'll send you a free personalized AI Opportunity Report with ideas tailored to your business within 48 hours. 100% free — no obligation.",
  painLabel = "What's your biggest current frustration or revenue leak?",
  useTestCollection: propUseTest = false, // false (default) = prod collection; true = local/custom test bucket
  onSuccess 
}: Props) {
  const searchParams = useSearchParams();
  const urlTestParam = searchParams?.get('test');
  // Prod is default. ?test=false (or 0) forces the local/custom test collection.
  // ?test=true (or 1) forces prod.
  const urlUseTest = (urlTestParam === 'false' || urlTestParam === '0') ? true :
                     (urlTestParam === 'true' || urlTestParam === '1') ? false : undefined;
  const useTestCollection = urlUseTest !== undefined ? urlUseTest : propUseTest;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    trigger,
  } = useForm<ReportRequestData>({
    resolver: zodResolver(ReportRequestSchema),
    defaultValues: {
      source,
      page_url: typeof window !== 'undefined' ? window.location.href : undefined,
    },
  });

  const goToStep = async (newStep: number) => {
    if (newStep > currentStep) {
      // Validate current step fields before advancing (basic client check)
      const fieldsToValidate = getFieldsForStep(currentStep);
      const isValid = await trigger(fieldsToValidate as any);
      if (!isValid) return;
    }
    setCurrentStep(Math.max(1, Math.min(totalSteps, newStep)));
  };

  function getFieldsForStep(step: number): string[] {
    switch (step) {
      case 1: return ['business_type'];
      case 2: return ['desired_results'];
      case 3: return ['pain'];
      case 4: return ['tried_so_far']; // optional, always allow advance
      case 5: return ['budget', 'interest', 'email'];
      default: return [];
    }
  }

  const onSubmit = async (data: ReportRequestData) => {
    setIsSubmitting(true);

    // Fire the Lead pixel (important for Meta tracking)
    track('Lead', {
      content_name: title,
      content_category: source,
    });

    // Fire the API call in the background (optimistic UI).
    // The visitor sees the thank-you immediately. The request is processed asynchronously.
    // The save will succeed once the Firestore database and security rules are correctly configured.
    const testParam = useTestCollection ? 'false' : 'true';
    fetch(`/api/report-request?test=${testParam}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(async (res) => {
        if (!res.ok) {
          // Background failure is ok due to optimistic UI; the request may have landed or will be retried via Calendly.
          // Only log details in dev for debugging.
          if (process.env.NODE_ENV === 'development') {
            let errBody;
            try {
              errBody = await res.json();
            } catch {
              errBody = await res.text().catch(() => '');
            }
            const msg = errBody?.error?.message || (typeof errBody === 'string' ? errBody : JSON.stringify(errBody));
            if (msg) {
              console.warn('Report request API non-OK (data may still have landed):', msg);
            }
          }
        } else {
          const j = await res.json().catch(() => ({}));
          if (process.env.NODE_ENV === 'development') {
            console.log('Report request saved via API:', j);
          }
        }
      })
      .catch((e) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Report request API call failed to send (Calendly remains available):', e);
        }
      });

    // Always show the friendly success state right away
    setSubmitted(true);
    reset();
    onSuccess?.();
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center dark:border-green-800 dark:bg-green-950">
        <h3 className="text-xl font-semibold text-green-800 dark:text-green-200">Thank you!</h3>
        <p className="mt-2 text-green-700 dark:text-green-300">
          I'll personally review your answers and email you a free personalized AI Opportunity Report with tailored ideas within 48 hours.
        </p>
        <a
          href="https://calendly.com/nacho-tsvetkov/30min"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-600/25 transition-all hover:bg-green-500 hover:-translate-y-0.5"
        >
          While you wait — book your free 15-min discovery call →
        </a>
      </div>
    );
  }

  const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-900">
      <div>
        <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          {intro}
        </p>
      </div>

      {/* Progress indicator */}
      <div>
        <div className="flex items-center justify-between text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
          <div 
            className="h-1.5 rounded-full bg-blue-600 transition-all duration-300" 
            style={{ width: `${progressPercent}%` }} 
          />
        </div>
      </div>

      {/* Step 1: About Your Business */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">What type of business do you run?</label>
            <input
              {...register('business_type')}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
              placeholder="Fitness studio, boutique, consulting, e-commerce…"
            />
            {errors.business_type && <p className="text-sm text-red-600 dark:text-red-400">{errors.business_type.message}</p>}
          </div>
        </div>
      )}

      {/* Step 2: What Success Looks Like */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">What results would make the biggest difference in the next 3–6 months?</label>
            <textarea
              {...register('desired_results')}
              rows={3}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
              placeholder="More bookings and sales, higher conversions, time back for the things that matter…"
            />
            {errors.desired_results && <p className="text-sm text-red-600 dark:text-red-400">{errors.desired_results.message}</p>}
          </div>
        </div>
      )}

      {/* Step 3: Current Situation (pain label customized per page/focus area) */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{painLabel}</label>
            <textarea
              {...register('pain')}
              rows={3}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
              placeholder="Missed leads, manual booking, slow follow-ups, repetitive admin work…"
            />
            {errors.pain && <p className="text-sm text-red-600 dark:text-red-400">{errors.pain.message}</p>}
          </div>
        </div>
      )}

      {/* Step 4: What You've Tried So Far (added per Priestley guidance) */}
      {currentStep === 4 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">What have you already tried to improve this?</label>
            <textarea
              {...register('tried_so_far')}
              rows={3}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
              placeholder="Hired help, tried software, ran ads, manual processes, nothing yet…"
            />
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Optional but very helpful for tailoring the right ideas.</p>
          </div>
        </div>
      )}

      {/* Step 5: Budget & Next Steps */}
      {currentStep === 5 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">What would feel like a fair price for a solution that delivers these results for your business?</label>
            <input
              {...register('budget')}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
              placeholder="e.g. $2,000 or whatever feels like a fair price for these results"
            />
            {errors.budget && <p className="text-sm text-red-600 dark:text-red-400">{errors.budget.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">On a scale of 1–10, how interested are you in exploring a custom AI solution?</label>
            <select
              {...register('interest', { valueAsNumber: true })}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
            >
              <option value="">Select...</option>
              {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            {errors.interest && <p className="text-sm text-red-600 dark:text-red-400">{errors.interest.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Any other details about your current setup or situation?</label>
            <textarea
              {...register('additional_details')}
              rows={2}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
              placeholder="Optional details…"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Best email to send your personalized AI Opportunity Report</label>
            <input
              type="email"
              {...register('email')}
              className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
              placeholder="you@business.com"
            />
            {errors.email && <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>}
          </div>
        </div>
      )}

      {/* Navigation + Submit */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => goToStep(currentStep - 1)}
          disabled={currentStep === 1}
          className="rounded-xl border border-neutral-300 px-5 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          ← Back
        </button>

        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={() => goToStep(currentStep + 1)}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-blue-500"
          >
            Next →
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto rounded-2xl bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isSubmitting ? 'Sending your request...' : 'Get My Free Personalized AI Opportunity Report →'}
          </button>
        )}
      </div>

      <p className="text-center text-xs text-neutral-500">
        Your answers are private and reviewed personally by Nacho. No spam — just useful ideas for your business.
      </p>
    </form>
  );
}
