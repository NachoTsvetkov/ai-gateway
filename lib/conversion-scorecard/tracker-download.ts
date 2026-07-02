import {
  buildPersonalizedTrackerCsv,
  type ScoreOption,
} from "lib/conversion-scorecard/content";

export const SCORECARD_STORAGE_KEY = "conversion-scorecard-scores-v1";
export const TRACKING_STORAGE_KEY = "conversion-scorecard-tracking-v1";

type Scores = Record<string, ScoreOption | undefined>;
type TrackingAnswers = {
  signal?: boolean;
  checkout?: boolean;
  match?: boolean;
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function loadScorecardScoresFromStorage(): Scores {
  return readJson<Scores>(SCORECARD_STORAGE_KEY, {});
}

export function loadTrackingAnswersFromStorage(): TrackingAnswers {
  return readJson<TrackingAnswers>(TRACKING_STORAGE_KEY, {});
}

export function buildTrackerCsvFromStorage(): string {
  return buildPersonalizedTrackerCsv({
    scores: loadScorecardScoresFromStorage(),
    trackingAnswers: loadTrackingAnswersFromStorage(),
  });
}

export function downloadTrackerCsv(
  csv: string,
  filename = "weekly-conversion-tracker.csv",
): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadPersonalizedTrackerFromStorage(): void {
  downloadTrackerCsv(buildTrackerCsvFromStorage());
}

export function clearScorecardProgress(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SCORECARD_STORAGE_KEY);
  localStorage.removeItem(TRACKING_STORAGE_KEY);
}
