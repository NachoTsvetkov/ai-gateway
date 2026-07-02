"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  SCORECARD_SECTIONS,
  SCORE_LEGEND,
  TRACKING_DIAGNOSIS_QUESTIONS,
  TRACKING_START,
  getScorecardNextSteps,
  maxScorecardPoints,
  resolveTrackingDiagnosis,
  scoreBand,
  scoreOptionLabel,
  type ScoreOption,
} from "lib/conversion-scorecard/content";
import { LIBRARY_BASE_PATH } from "lib/digital-product-access";
import {
  SCORECARD_STORAGE_KEY,
  TRACKING_STORAGE_KEY,
  clearScorecardProgress,
} from "lib/conversion-scorecard/tracker-download";
import { track } from "lib/pixel/client";
import { TrackerDownloadButton } from "components/conversion-scorecard/tracker-download-button";
import { ScorecardNextStepLink } from "components/conversion-scorecard/scorecard-next-step-link";

const STORAGE_KEY = SCORECARD_STORAGE_KEY;
const SECTION_COUNT = SCORECARD_SECTIONS.length;
const TRACKING_STEP = SECTION_COUNT + 1;
const RESULTS_STEP = SECTION_COUNT + 2;
const TRACKER_STEP = SECTION_COUNT + 3;
const TOTAL_STEPS = TRACKER_STEP;

type Scores = Record<string, ScoreOption | undefined>;
type TrackingAnswers = { signal?: boolean; checkout?: boolean; match?: boolean };

function loadScores(): Scores {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Scores) : {};
  } catch {
    return {};
  }
}

function loadTrackingAnswers(): TrackingAnswers {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(TRACKING_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TrackingAnswers) : {};
  } catch {
    return {};
  }
}

const TRACKING_KEYS: ReadonlyArray<keyof TrackingAnswers> = [
  "signal",
  "checkout",
  "match",
];

function trackingIsComplete(answers: TrackingAnswers): boolean {
  return TRACKING_KEYS.every((key) => answers[key] !== undefined);
}

function firstIncompleteStep(
  scores: Scores,
  trackingAnswers: TrackingAnswers,
): number {
  const sectionIndex = SCORECARD_SECTIONS.findIndex((section) =>
    section.items.some((item) => scores[item.id] === undefined),
  );
  if (sectionIndex >= 0) return sectionIndex + 1;
  const hasAny = SCORECARD_SECTIONS.some((section) =>
    section.items.some((item) => scores[item.id] !== undefined),
  );
  if (!hasAny) return 1;
  if (!trackingIsComplete(trackingAnswers)) return TRACKING_STEP;
  return RESULTS_STEP;
}

function firstMissingItemId(
  section: (typeof SCORECARD_SECTIONS)[number],
  scores: Scores,
): string | null {
  for (const item of section.items) {
    if (scores[item.id] === undefined) return item.id;
  }
  return null;
}

function sectionIsComplete(
  section: (typeof SCORECARD_SECTIONS)[number],
  scores: Scores,
): boolean {
  return section.items.every((item) => scores[item.id] !== undefined);
}

function scoreBadgeClass(value: ScoreOption): string {
  if (value === 0) {
    return "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300";
  }
  if (value === 1) {
    return "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300";
  }
  return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300";
}

function ScoreChoiceButton({
  legend,
  selected,
  onSelect,
  checkLabel,
}: {
  legend: (typeof SCORE_LEGEND)[number];
  selected: boolean;
  onSelect: () => void;
  checkLabel: string;
}) {
  const palette: Record<ScoreOption, { idle: string; active: string }> = {
    0: {
      idle:
        "border-rose-200 bg-white text-rose-800 hover:border-rose-300 hover:bg-rose-50 dark:border-rose-900 dark:bg-neutral-900 dark:text-rose-300 dark:hover:bg-rose-950/30",
      active:
        "border-rose-600 bg-rose-600 text-white ring-2 ring-rose-600/30 dark:border-rose-500 dark:bg-rose-600",
    },
    1: {
      idle:
        "border-amber-200 bg-white text-amber-900 hover:border-amber-300 hover:bg-amber-50 dark:border-amber-900 dark:bg-neutral-900 dark:text-amber-300 dark:hover:bg-amber-950/30",
      active:
        "border-amber-500 bg-amber-500 text-white ring-2 ring-amber-500/30 dark:border-amber-400 dark:bg-amber-500",
    },
    2: {
      idle:
        "border-emerald-200 bg-white text-emerald-800 hover:border-emerald-300 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-neutral-900 dark:text-emerald-300 dark:hover:bg-emerald-950/30",
      active:
        "border-emerald-600 bg-emerald-600 text-white ring-2 ring-emerald-600/30 dark:border-emerald-500 dark:bg-emerald-600",
    },
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${checkLabel}: ${legend.label}`}
      className={`flex min-h-11 min-w-0 flex-1 items-center justify-center rounded-lg border px-2 py-2 text-xs font-bold transition-colors sm:px-3 sm:text-sm ${
        selected ? palette[legend.value].active : palette[legend.value].idle
      }`}
    >
      {legend.label}
    </button>
  );
}

export function InteractiveScorecard() {
  const [scores, setScores] = useState<Scores>({});
  const [trackingAnswers, setTrackingAnswers] = useState<TrackingAnswers>({});
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepError, setStepError] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const itemRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const surveyStartFiredRef = useRef(false);
  const trackedSurveyStepsRef = useRef<Set<number>>(new Set());
  const resultsTrackedRef = useRef(false);
  const trackerTrackedRef = useRef(false);

  const buildPixelCustom = useCallback((step?: number) => {
    return {
      content_ids: ["shopify-conversion-kit-scorecard"],
      content_name: "Leak scorecard",
      content_type: "digital_product" as const,
      content_category: "scorecard",
      ...(step !== undefined ? { step } : {}),
    };
  }, []);

  const trackSurveyAdvance = useCallback(
    (completedStep: number) => {
      if (completedStep === 1) {
        if (surveyStartFiredRef.current) return;
        surveyStartFiredRef.current = true;
        track("SurveyStart", buildPixelCustom());
        return;
      }
      if (trackedSurveyStepsRef.current.has(completedStep)) return;
      trackedSurveyStepsRef.current.add(completedStep);
      track("SurveyStep", buildPixelCustom(completedStep));
    },
    [buildPixelCustom],
  );

  useEffect(() => {
    const saved = loadScores();
    const savedTracking = loadTrackingAnswers();
    setScores(saved);
    setTrackingAnswers(savedTracking);
    setCurrentStep(firstIncompleteStep(saved, savedTracking));
    setMounted(true);
  }, []);

  const setScore = useCallback((id: string, value: ScoreOption) => {
    setStepError(null);
    setHighlightId((current) => (current === id ? null : current));
    setScores((prev) => {
      const next = { ...prev, [id]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setTrackingAnswer = useCallback(
    (key: keyof TrackingAnswers, value: boolean) => {
      setStepError(null);
      setTrackingAnswers((prev) => {
        const next = { ...prev, [key]: value };
        localStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const allItems = useMemo(
    () => SCORECARD_SECTIONS.flatMap((section) => section.items),
    [],
  );

  const { total, answered, lowItems } = useMemo(() => {
    let total = 0;
    let answered = 0;
    const low: { check: string; score: ScoreOption }[] = [];

    for (const item of allItems) {
      const score = scores[item.id];
      if (score !== undefined) {
        answered += 1;
        total += score;
        if (score <= 1) low.push({ check: item.check, score });
      }
    }

    low.sort((a, b) => a.score - b.score);
    return { total, answered, lowItems: low.slice(0, 5) };
  }, [allItems, scores]);

  const max = maxScorecardPoints();
  const band = scoreBand(total);
  const nextSteps = useMemo(
    () => getScorecardNextSteps(total, scores, LIBRARY_BASE_PATH),
    [scores, total],
  );
  const diagnosis = useMemo(
    () => resolveTrackingDiagnosis(trackingAnswers),
    [trackingAnswers],
  );

  const isTrackingStep = currentStep === TRACKING_STEP;
  const isResultsStep = currentStep === RESULTS_STEP;
  const isTrackerStep = currentStep === TRACKER_STEP;
  const currentSection =
    currentStep <= SECTION_COUNT ? SCORECARD_SECTIONS[currentStep - 1] : null;

  const progressPercent = Math.round(
    ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100,
  );

  const sectionProgress = currentSection
    ? currentSection.items.filter((item) => scores[item.id] !== undefined).length
    : 0;

  const stepLabel = useMemo(() => {
    if (isTrackerStep) return "Track your fixes";
    if (isResultsStep) return showSummary ? "All answers" : "Your results";
    if (isTrackingStep) return "Tracking or checkout?";
    return `Section ${currentStep} of ${SECTION_COUNT}`;
  }, [currentStep, isResultsStep, isTrackerStep, isTrackingStep, showSummary]);

  function scrollToMissing(missingId: string) {
    setHighlightId(missingId);
    requestAnimationFrame(() => {
      const el = itemRefs.current.get(missingId);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    window.setTimeout(() => setHighlightId(null), 1800);
  }

  function goToStep(step: number) {
    setStepError(null);
    setShowSummary(false);
    setCurrentStep(Math.min(Math.max(step, 1), TOTAL_STEPS));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleNext() {
    if (isTrackerStep) return;

    if (currentSection) {
      const missingId = firstMissingItemId(currentSection, scores);
      if (missingId) {
        setStepError("Rate every check on this page before continuing.");
        scrollToMissing(missingId);
        return;
      }
      trackSurveyAdvance(currentStep);
    }

    if (currentStep === SECTION_COUNT) {
      trackSurveyAdvance(currentStep);
      goToStep(TRACKING_STEP);
      return;
    }

    if (isTrackingStep) {
      if (!trackingIsComplete(trackingAnswers)) {
        setStepError("Answer all three questions to see your diagnosis.");
        return;
      }
      trackSurveyAdvance(TRACKING_STEP);
      if (!resultsTrackedRef.current && answered === allItems.length) {
        resultsTrackedRef.current = true;
        track("SurveyStep", buildPixelCustom(RESULTS_STEP));
      }
      goToStep(RESULTS_STEP);
      return;
    }

    if (isResultsStep) {
      goToStep(TRACKER_STEP);
      return;
    }

    goToStep(currentStep + 1);
  }

  function handleTrackerDownload() {
    if (!trackerTrackedRef.current) {
      trackerTrackedRef.current = true;
      track("Lead", {
        ...buildPixelCustom(),
        content_category: "scorecard_tracker",
      });
    }
  }

  function handleReset() {
    clearScorecardProgress();
    setScores({});
    setTrackingAnswers({});
    surveyStartFiredRef.current = false;
    trackedSurveyStepsRef.current = new Set();
    resultsTrackedRef.current = false;
    trackerTrackedRef.current = false;
    setShowSummary(false);
    setStepError(null);
    setHighlightId(null);
    goToStep(1);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 sm:p-6 dark:border-emerald-900/50 dark:from-emerald-950/40 dark:to-neutral-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Your score{" "}
              {mounted && answered > 0
                ? `(${answered}/${allItems.length} rated)`
                : ""}
            </p>
            <p
              className="mt-1 font-mono text-3xl font-extrabold text-neutral-900 sm:text-4xl dark:text-white"
              suppressHydrationWarning
            >
              {mounted && answered > 0 ? total : "—"}
              <span className="text-base font-semibold text-neutral-500 sm:text-lg">
                {" "}
                / {max}
              </span>
            </p>
          </div>
          {mounted && answered > 0 && !isTrackerStep && (
            <div className="rounded-xl bg-white/80 px-4 py-3 dark:bg-neutral-950/50">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                {band.label}
              </p>
              <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
                {band.action}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs font-medium text-neutral-500 dark:text-neutral-400">
            <span>{stepLabel}</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
            <div
              className="h-1.5 rounded-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {currentSection && (
          <>
            <header className="mt-6 border-b border-neutral-100 pb-4 dark:border-neutral-800">
              <h2 className="text-lg font-bold text-neutral-900 sm:text-xl dark:text-white">
                {currentSection.title}
              </h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {currentSection.subtitle}
              </p>
              {mounted && (
                <p className="mt-2 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  {sectionProgress}/{currentSection.items.length} rated on this
                  page
                </p>
              )}
            </header>

            <ul className="mt-5 space-y-4">
              {currentSection.items.map((item, index) => (
                <li
                  key={item.id}
                  ref={(node) => {
                    if (node) itemRefs.current.set(item.id, node);
                    else itemRefs.current.delete(item.id);
                  }}
                  className={`rounded-xl border bg-neutral-50/80 p-3 transition-all duration-300 sm:p-4 dark:bg-neutral-950/40 ${
                    highlightId === item.id
                      ? "border-rose-500 bg-rose-50 ring-2 ring-rose-500/60 dark:border-rose-500 dark:bg-rose-950/30"
                      : "border-neutral-100 dark:border-neutral-800"
                  }`}
                >
                  <p className="text-sm font-medium leading-relaxed text-neutral-900 dark:text-neutral-100">
                    <span className="mr-2 font-mono text-xs text-neutral-400">
                      {index + 1}.
                    </span>
                    {item.check}
                  </p>
                  <div
                    className="mt-3 flex gap-2"
                    role="group"
                    aria-label={item.check}
                  >
                    {SCORE_LEGEND.map((legend) => (
                      <ScoreChoiceButton
                        key={legend.value}
                        legend={legend}
                        selected={scores[item.id] === legend.value}
                        onSelect={() => setScore(item.id, legend.value)}
                        checkLabel={item.check}
                      />
                    ))}
                  </div>
                </li>
              ))}
            </ul>

            {stepError && (
              <p
                role="alert"
                className="mt-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"
              >
                {stepError}
              </p>
            )}
          </>
        )}

        {isTrackingStep && mounted && (
          <div className="mt-6 space-y-6">
            <header className="border-b border-neutral-100 pb-4 dark:border-neutral-800">
              <h2 className="text-lg font-bold text-neutral-900 sm:text-xl dark:text-white">
                Tracking or checkout?
              </h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {TRACKING_START.intro}
              </p>
            </header>

            <ul className="space-y-4">
              {TRACKING_DIAGNOSIS_QUESTIONS.map((q, index) => {
                const key = q.id as keyof TrackingAnswers;
                const value = trackingAnswers[key];
                return (
                  <li
                    key={q.id}
                    className="rounded-xl border border-neutral-100 bg-neutral-50/80 p-3 sm:p-4 dark:border-neutral-800 dark:bg-neutral-950/40"
                  >
                    <p className="text-sm font-medium leading-relaxed text-neutral-900 dark:text-neutral-100">
                      <span className="mr-2 font-mono text-xs text-neutral-400">
                        {index + 1}.
                      </span>
                      {q.question}
                    </p>
                    <div
                      className="mt-3 flex flex-col gap-2 sm:flex-row"
                      role="group"
                      aria-label={q.question}
                    >
                      <button
                        type="button"
                        aria-pressed={value === true}
                        onClick={() => setTrackingAnswer(key, true)}
                        className={`min-h-11 flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                          value === true
                            ? "border-emerald-600 bg-emerald-600 text-white ring-2 ring-emerald-600/30 dark:border-emerald-500 dark:bg-emerald-600"
                            : "border-neutral-200 bg-white text-neutral-800 hover:border-emerald-300 hover:bg-emerald-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-emerald-700"
                        }`}
                      >
                        {q.yes}
                      </button>
                      <button
                        type="button"
                        aria-pressed={value === false}
                        onClick={() => setTrackingAnswer(key, false)}
                        className={`min-h-11 flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                          value === false
                            ? "border-emerald-600 bg-emerald-600 text-white ring-2 ring-emerald-600/30 dark:border-emerald-500 dark:bg-emerald-600"
                            : "border-neutral-200 bg-white text-neutral-800 hover:border-emerald-300 hover:bg-emerald-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-emerald-700"
                        }`}
                      >
                        {q.no}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            {trackingIsComplete(trackingAnswers) && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  Diagnosis · {diagnosis.label}
                </p>
                <p className="mt-2 text-sm font-medium leading-relaxed text-neutral-900 dark:text-white">
                  {diagnosis.outcome}
                </p>
                {diagnosis.showTrackingFix && (
                  <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">
                      Tracking fix checklist
                    </p>
                    <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-neutral-700 dark:text-neutral-300">
                      {TRACKING_START.trackingFixSteps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}

            {stepError && (
              <p
                role="alert"
                className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"
              >
                {stepError}
              </p>
            )}
          </div>
        )}

        {isResultsStep && mounted && !showSummary && (
          <div className="mt-6 space-y-6">
            <header>
              <h2 className="text-lg font-bold text-neutral-900 sm:text-xl dark:text-white">
                Scorecard complete
              </h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                {answered === allItems.length
                  ? "You rated every check. Fix the lowest scores first, then download the tracker."
                  : "Finish skipped sections for a full picture — or continue with what you have."}
              </p>
            </header>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Total score
              </p>
              <p className="mt-1 font-mono text-3xl font-extrabold text-neutral-900 dark:text-white">
                {total}
                <span className="text-base font-semibold text-neutral-500">
                  {" "}
                  / {max}
                </span>
              </p>
              <p className="mt-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                {band.label} — {band.action}
              </p>
            </div>

            {trackingIsComplete(trackingAnswers) && (
              <section className="rounded-xl border border-sky-200 bg-sky-50 p-4 sm:p-5 dark:border-sky-900/40 dark:bg-sky-950/20">
                <p className="text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-400">
                  Tracking vs checkout · {diagnosis.label}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
                  {diagnosis.outcome}
                </p>
              </section>
            )}

            {lowItems.length > 0 && (
              <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
                <h3 className="text-base font-bold text-neutral-900 sm:text-lg dark:text-white">
                  Fix these first
                </h3>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-neutral-800 dark:text-neutral-200">
                  {lowItems.map((item) => (
                    <li key={item.check}>
                      {item.check}{" "}
                      <span className="font-semibold text-amber-800 dark:text-amber-300">
                        ({scoreOptionLabel(item.score)})
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-950/40">
              <h3 className="text-base font-bold text-neutral-900 sm:text-lg dark:text-white">
                Your next steps
              </h3>
              <ol className="mt-3 space-y-3">
                {nextSteps.map((step, index) => (
                  <li key={step.href + step.label}>
                    <ScorecardNextStepLink step={step} index={index} />
                  </li>
                ))}
              </ol>
            </section>
          </div>
        )}

        {isResultsStep && mounted && showSummary && (
          <div className="mt-6 space-y-5">
            <header>
              <h2 className="text-lg font-bold text-neutral-900 sm:text-xl dark:text-white">
                All your answers
              </h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                Tap Back to edit a section, or continue to download the tracker.
              </p>
            </header>

            {SCORECARD_SECTIONS.map((section) => (
              <section
                key={section.id}
                className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800"
              >
                <div className="border-b border-neutral-100 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950/50">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    {section.title}
                  </h3>
                </div>
                <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {section.items.map((item) => {
                    const score = scores[item.id];
                    return (
                      <li
                        key={item.id}
                        className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <p className="text-sm text-neutral-800 dark:text-neutral-200">
                          {item.check}
                        </p>
                        {score !== undefined ? (
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${scoreBadgeClass(score)}`}
                          >
                            {scoreOptionLabel(score)}
                          </span>
                        ) : (
                          <span className="shrink-0 text-xs font-medium text-neutral-400">
                            Not rated
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}

        {isTrackerStep && mounted && (
          <div className="mt-6 space-y-6">
            <header>
              <h2 className="text-lg font-bold text-neutral-900 sm:text-xl dark:text-white">
                Download your tracker
              </h2>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                Log this week&apos;s baseline before you fix anything. Re-run
                the scorecard after each fix and update the CSV weekly.
              </p>
            </header>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                In Shopify Analytics → Online store conversion, note last 7
                days: sessions, add-to-cart rate, checkout reached, purchase
                rate. Paste into the tracker.
              </p>
              <TrackerDownloadButton
                onDownload={handleTrackerDownload}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-colors hover:bg-emerald-500 sm:w-auto"
              />
            </div>

            <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5 dark:border-neutral-800 dark:bg-neutral-950/40">
              <h3 className="text-base font-bold text-neutral-900 sm:text-lg dark:text-white">
                Then do this — in order
              </h3>
              <ol className="mt-3 space-y-3">
                {nextSteps.map((step, index) => (
                  <li key={step.href + step.label}>
                    <ScorecardNextStepLink step={step} index={index} />
                  </li>
                ))}
              </ol>
            </section>

            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Score: {total}/{max} ({band.label}). Re-run this scorecard after
              each fix to see if you hit 18+.
            </p>

            <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-4 sm:p-5 dark:border-neutral-700 dark:bg-neutral-900">
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                Run it again later?
              </p>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                Clear your answers and start from section 1. Your tracker CSV
                download stays available until you reset.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-4 min-h-11 rounded-xl border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800 dark:border-neutral-600 dark:text-neutral-300 dark:hover:border-rose-800 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
              >
                Reset scorecard
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-neutral-100 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800">
          <button
            type="button"
            onClick={() => {
              if (isResultsStep && showSummary) {
                setShowSummary(false);
                return;
              }
              goToStep(currentStep - 1);
            }}
            disabled={currentStep === 1}
            className="min-h-11 rounded-xl border border-neutral-300 px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            ← Back
          </button>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            {isResultsStep && !showSummary && (
              <button
                type="button"
                onClick={() => setShowSummary(true)}
                className="min-h-11 rounded-xl border border-emerald-300 px-5 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
              >
                Review answers
              </button>
            )}

            {!isTrackerStep && (
              <button
                type="button"
                onClick={handleNext}
                className="min-h-11 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-500"
              >
                {currentStep === SECTION_COUNT
                  ? "Tracking check →"
                  : isTrackingStep
                    ? "See results →"
                    : isResultsStep
                      ? "Continue to tracker →"
                      : "Next section →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
