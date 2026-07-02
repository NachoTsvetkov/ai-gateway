"use client";

import { useEffect, useState } from "react";
import { SurveyComboField } from "components/reports/survey-combo-field";
import {
  CONVERSION_KIT_KYC_STEPS,
  type ConversionKitKycData,
  type ConversionKitKycFieldId,
} from "lib/conversion-scorecard/kyc";
import {
  CONVERSION_KIT_BUDGET_SUGGESTIONS,
  CONVERSION_KIT_BUSINESS_TYPE_SUGGESTIONS,
  CONVERSION_KIT_DESIRED_RESULTS_SUGGESTIONS,
  CONVERSION_KIT_KYC_PAIN_LABEL,
  CONVERSION_KIT_PAIN_SUGGESTIONS,
  CONVERSION_KIT_TRIED_SO_FAR_SUGGESTIONS,
} from "lib/conversion-scorecard/kyc-field-options";
import { LIBRARY_KYC_PATH } from "lib/digital-product-access";

export type LibraryKycStatus = {
  complete: boolean;
  email: string | null;
  emailRequired: boolean;
};

const EMPTY_FORM: Omit<ConversionKitKycData, "email"> = {
  business_type: "",
  desired_results: "",
  pain: "",
  tried_so_far: "",
  budget: "",
};

const TOTAL_STEPS = CONVERSION_KIT_KYC_STEPS.length;

const SUGGESTIONS_BY_FIELD: Record<
  ConversionKitKycFieldId,
  readonly string[]
> = {
  business_type: CONVERSION_KIT_BUSINESS_TYPE_SUGGESTIONS,
  desired_results: CONVERSION_KIT_DESIRED_RESULTS_SUGGESTIONS,
  pain: CONVERSION_KIT_PAIN_SUGGESTIONS,
  tried_so_far: CONVERSION_KIT_TRIED_SO_FAR_SUGGESTIONS,
  budget: CONVERSION_KIT_BUDGET_SUGGESTIONS,
};

function stepLabel(step: (typeof CONVERSION_KIT_KYC_STEPS)[number]): string {
  if ("labelKey" in step && step.labelKey === "pain") {
    return CONVERSION_KIT_KYC_PAIN_LABEL;
  }
  return "label" in step ? step.label : "";
}

function validateStep(
  step: number,
  form: Omit<ConversionKitKycData, "email">,
): string | null {
  const config = CONVERSION_KIT_KYC_STEPS[step - 1];
  if (!config) return null;
  const value = form[config.id]?.trim();
  if (!value) {
    switch (config.id) {
      case "business_type":
        return "Please tell us what type of business you run.";
      case "desired_results":
        return "Please share the results you'd like to see.";
      case "pain":
        return "Please describe your current situation or biggest frustration.";
      case "tried_so_far":
        return "Please tell us what you've already tried.";
      case "budget":
        return "Pick a budget range.";
      default:
        return "Please complete this step.";
    }
  }
  return null;
}

export function LibraryKycGate({
  initialStatus,
}: {
  initialStatus: LibraryKycStatus;
}) {
  const [status, setStatus] = useState<LibraryKycStatus>(initialStatus);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState(initialStatus.email ?? "");
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (initialStatus.complete) return;

    let cancelled = false;

    async function loadStatus() {
      try {
        const response = await fetch(LIBRARY_KYC_PATH);
        if (response.status === 401) {
          if (!cancelled) {
            setError("Your session expired. Refresh the page or sign in again.");
          }
          return;
        }

        if (!response.ok) {
          if (!cancelled) {
            setError("Could not load your profile check. Refresh and try again.");
          }
          return;
        }

        const data = (await response.json()) as LibraryKycStatus;
        if (!cancelled) {
          setStatus(data);
          if (data.email) setEmail(data.email);
        }
      } catch {
        if (!cancelled) {
          setError("Network error while loading the form. Refresh and try again.");
        }
      }
    }

    void loadStatus();
    return () => {
      cancelled = true;
    };
  }, [initialStatus.complete]);

  if (status.complete) {
    return null;
  }

  const stepConfig = CONVERSION_KIT_KYC_STEPS[currentStep - 1];
  const progressPercent = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;

  function updateField(field: ConversionKitKycFieldId, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    if (error) setError(null);
  }

  function goToStep(next: number) {
    setError(null);
    setCurrentStep(Math.max(1, Math.min(TOTAL_STEPS, next)));
  }

  function handleNext() {
    const validationError = validateStep(currentStep, form);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (currentStep < TOTAL_STEPS) {
      goToStep(currentStep + 1);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateStep(currentStep, form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch(LIBRARY_KYC_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          ...form,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
          issues?: Record<string, string[]>;
        } | null;

        if (payload?.issues) {
          const firstIssue = Object.values(payload.issues).flat()[0];
          setError(firstIssue ?? "Please complete every field.");
          return;
        }

        setError("Could not save your answers. Try again in a moment.");
        return;
      }

      setStatus({ complete: true, email: email.trim(), emailRequired: false });
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="library-kyc-title"
    >
      <div className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-neutral-200 bg-white shadow-xl sm:max-h-[90dvh] sm:rounded-2xl dark:border-neutral-800 dark:bg-neutral-900">
        <div className="shrink-0 border-b border-neutral-100 px-4 pb-4 pt-5 sm:px-6 dark:border-neutral-800">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
            Quick intro
          </p>
          <h2
            id="library-kyc-title"
            className="mt-2 text-lg font-bold text-neutral-900 sm:text-xl dark:text-white"
          >
            Before you dive in
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            Same five questions as our intake survey — tap a quick answer or
            type your own. About 2 minutes.
          </p>

          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs font-medium text-neutral-500 dark:text-neutral-400">
              <span>
                Step {currentStep} of {TOTAL_STEPS}
              </span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
              <div
                className="h-1.5 rounded-full bg-emerald-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              (event.target as HTMLElement)?.tagName !== "BUTTON" &&
              currentStep < TOTAL_STEPS
            ) {
              event.preventDefault();
              handleNext();
            }
          }}
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
            {status.emailRequired ? (
              <div className="mb-4">
                <label
                  htmlFor="kyc-email"
                  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Best email to reach you
                </label>
                <input
                  id="kyc-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@store.com"
                  className="mt-2 min-h-11 w-full rounded-xl border border-neutral-200 bg-white px-4 text-base text-neutral-900 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring-2 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white sm:text-sm"
                />
              </div>
            ) : null}

            {stepConfig ? (
              <div>
                <label
                  htmlFor={`kyc-${stepConfig.id}`}
                  className="block text-sm font-medium leading-snug text-neutral-700 dark:text-neutral-300"
                >
                  {stepLabel(stepConfig)}
                </label>
                <SurveyComboField
                  name={stepConfig.id}
                  value={form[stepConfig.id]}
                  onChange={(value) => updateField(stepConfig.id, value)}
                  suggestions={SUGGESTIONS_BY_FIELD[stepConfig.id]}
                  placeholder={stepConfig.placeholder}
                  helperText={
                    stepConfig.id === "budget"
                      ? ""
                      : "helperText" in stepConfig
                        ? stepConfig.helperText
                        : undefined
                  }
                  multiline={stepConfig.multiline}
                  rows={2}
                  chipCount={stepConfig.chipCount}
                  variant="emerald"
                />
              </div>
            ) : null}

            {error ? (
              <p
                role="alert"
                className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"
              >
                {error}
              </p>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-neutral-100 bg-white px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => goToStep(currentStep - 1)}
                disabled={currentStep === 1 || submitting}
                className="min-h-11 rounded-xl border border-neutral-300 px-4 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                ← Back
              </button>

              {currentStep < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="min-h-11 flex-1 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-colors hover:bg-emerald-500 sm:flex-none"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="min-h-11 flex-1 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-colors hover:bg-emerald-500 disabled:opacity-60 sm:flex-none"
                >
                  {submitting ? "Saving…" : "Continue to library →"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
