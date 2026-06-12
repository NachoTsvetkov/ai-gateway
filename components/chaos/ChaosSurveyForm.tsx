'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'next/navigation';
import { ChaosSurveySchema, type ChaosSurveyData, saveChaosSurveyResponse } from '@/lib/surveys';
import { track } from '@/lib/pixel/client';

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
  useTestCollection: propUseTest = false,
  onSuccess 
}: Props) {
  const searchParams = useSearchParams();
  const urlTest = searchParams?.get('test') === 'true' || searchParams?.get('test') === '1';
  const useTestCollection = propUseTest || urlTest;
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
          className="mt-4 inline-block rounded-xl bg-green-600 px-6 py-3 text-white hover:bg-green-700"
        >
          While you wait — book your free 15-min discovery call →
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="text-2xl font-semibold">{title}</h3>
      <p className="text-neutral-600 dark:text-neutral-400">
        I'll personally review every response and send you tailored ideas within 48 hours. 100% free.
      </p>

      {/* Example fields — customize per audit page */}
      <div>
        <label className="block text-sm font-medium">What type of small business do you run?</label>
        <input
          {...register('business_type')}
          className="mt-1 w-full rounded-xl border px-4 py-3"
          placeholder="Fitness studio, boutique, consulting..."
        />
        {errors.business_type && <p className="text-sm text-red-600">{errors.business_type.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">{painLabel}</label>
        <textarea
          {...register('pain')}
          rows={3}
          className="mt-1 w-full rounded-xl border px-4 py-3"
          placeholder="Missed leads, manual booking, slow follow-ups..."
        />
        {errors.pain && <p className="text-sm text-red-600">{errors.pain.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">What results would make the biggest difference in the next 3–6 months?</label>
        <textarea
          {...register('desired_results')}
          rows={3}
          className="mt-1 w-full rounded-xl border px-4 py-3"
          placeholder="More bookings/sales, higher conversions, time back..."
        />
        {errors.desired_results && <p className="text-sm text-red-600">{errors.desired_results.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Rough budget range you’d consider for a solution that delivers clear ROI?</label>
        <select {...register('budget')} className="mt-1 w-full rounded-xl border px-4 py-3">
          <option value="">Select...</option>
          <option value="Under $500">Under $500</option>
          <option value="$500–$2,000">$500–$2,000</option>
          <option value="$2,000–$5,000">$2,000–$5,000</option>
          <option value="$5,000+">$5,000+</option>
        </select>
        {errors.budget && <p className="text-sm text-red-600">{errors.budget.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">On a scale of 1–10, how interested are you in a custom AI solution?</label>
        <select {...register('interest', { valueAsNumber: true })} className="mt-1 w-full rounded-xl border px-4 py-3">
          <option value="">Select...</option>
          {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        {errors.interest && <p className="text-sm text-red-600">{errors.interest.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Any specific details about your current setup or biggest pain point right now?</label>
        <textarea
          {...register('additional_details')}
          rows={2}
          className="mt-1 w-full rounded-xl border px-4 py-3"
          placeholder="Optional details..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Best email to send your personalized audit + ideas</label>
        <input
          type="email"
          {...register('email')}
          className="mt-1 w-full rounded-xl border px-4 py-3"
          placeholder="you@business.com"
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
      </div>

      {/* Add the other fields similarly: desired_results, budget, interest (number 1-10), email, additional_details */}

      <div>
        <label className="block text-sm font-medium">Best email for your personalized audit</label>
        <input
          type="email"
          {...register('email')}
          className="mt-1 w-full rounded-xl border px-4 py-3"
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-2xl bg-blue-600 px-6 py-4 text-lg font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Get My Free Audit →'}
      </button>

      <p className="text-center text-xs text-neutral-500">
        Your data is stored securely in our system and reviewed personally by Nacho.
      </p>
    </form>
  );
}
