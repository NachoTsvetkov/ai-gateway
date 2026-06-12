'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { ChaosSurveySchema, type ChaosSurveyData, saveChaosSurveyResponse } from 'lib/surveys';
import { track } from 'lib/pixel/client';

interface Props {
  source: string; // e.g. 'revenue-audit'
  title?: string;
  intro?: string;
  painLabel?: string;
  useTestCollection?: boolean;
  onSuccess?: () => void;
}

export function ChaosSurveyForm({ 
  source, 
  title = 'Get Your Free Personalized Audit', 
  intro = "I'll personally review every response and send you tailored ideas within 48 hours. 100% free.",
  painLabel = "What's your biggest current frustration or revenue leak?",
  useTestCollection: propUseTest = false, // false (default) = prod collection; true = local/custom test bucket
  onSuccess 
}: Props) {
  const searchParams = useSearchParams();
  const urlTestParam = searchParams?.get('test');
  // Prod is default (useTestCollection=false -> main collection).
  // ?test=false (or 0) forces the local/custom test collection (per request).
  // ?test=true (or 1) forces prod. Absent falls to prop (defaults to prod).
  const urlUseTest = (urlTestParam === 'false' || urlTestParam === '0') ? true :
                     (urlTestParam === 'true' || urlTestParam === '1') ? false : undefined;
  const useTestCollection = urlUseTest !== undefined ? urlUseTest : propUseTest;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChaosSurveyData>({
    resolver: zodResolver(ChaosSurveySchema),
    defaultValues: {
      source,
      page_url: typeof window !== 'undefined' ? window.location.href : undefined,
    },
  });

  const onSubmit = async (data: ChaosSurveyData) => {
    setIsSubmitting(true);

    try {
      // Fire existing Meta Pixel Lead event (critical for tracking)
      track('Lead', {
        content_name: title,
        content_category: source,
      });

      // Save to Firebase (your provided config)
      await saveChaosSurveyResponse(data, useTestCollection);

      setSubmitted(true);
      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Survey submission failed:', error);
      alert('Something went wrong. Please try again or use the Calendly link below.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center dark:border-green-800 dark:bg-green-950">
        <h3 className="text-xl font-semibold text-green-800 dark:text-green-200">Thank you!</h3>
        <p className="mt-2 text-green-700 dark:text-green-300">
          I'll personally review your answers and email you tailored AI recommendations within 48 hours.
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-900">
      <div>
        <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          {intro}
        </p>
      </div>

      {/* Example fields — customize per audit page */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">What type of small business do you run?</label>
        <input
          {...register('business_type')}
          className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          placeholder="Fitness studio, boutique, consulting..."
        />
        {errors.business_type && <p className="text-sm text-red-600 dark:text-red-400">{errors.business_type.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">{painLabel}</label>
        <textarea
          {...register('pain')}
          rows={3}
          className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          placeholder="Missed leads, manual booking, slow follow-ups..."
        />
        {errors.pain && <p className="text-sm text-red-600 dark:text-red-400">{errors.pain.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">What results would make the biggest difference in the next 3–6 months?</label>
        <textarea
          {...register('desired_results')}
          rows={3}
          className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          placeholder="More bookings/sales, higher conversions, time back..."
        />
        {errors.desired_results && <p className="text-sm text-red-600 dark:text-red-400">{errors.desired_results.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Rough budget range you’d consider for a solution that delivers clear ROI?</label>
        <select
          {...register('budget')}
          className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
        >
          <option value="">Select...</option>
          <option value="Under $500">Under $500</option>
          <option value="$500–$2,000">$500–$2,000</option>
          <option value="$2,000–$5,000">$2,000–$5,000</option>
          <option value="$5,000+">$5,000+</option>
        </select>
        {errors.budget && <p className="text-sm text-red-600 dark:text-red-400">{errors.budget.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">On a scale of 1–10, how interested are you in a custom AI solution?</label>
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
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Any specific details about your current setup or biggest pain point right now?</label>
        <textarea
          {...register('additional_details')}
          rows={2}
          className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          placeholder="Optional details..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Best email to send your personalized audit + ideas</label>
        <input
          type="email"
          {...register('email')}
          className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          placeholder="you@business.com"
        />
        {errors.email && <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-blue-600 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 hover:-translate-y-0.5 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Get My Free Audit →'}
      </button>

      <p className="text-center text-xs text-neutral-500">
        Your data is stored securely in our system and reviewed personally by Nacho.
      </p>
    </form>
  );
}
