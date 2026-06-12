import type { ReportRequestData } from './surveys';

/** Values that are not real business context — surveys with these fail report generation. */
const PLACEHOLDER_EXACT = new Set([
  'test',
  'testing',
  'asdf',
  'asdfasdf',
  'foo',
  'bar',
  'baz',
  'xxx',
  'x',
  'na',
  'n/a',
  'n-a',
  'none',
  'null',
  'nil',
  'sample',
  'example',
  'placeholder',
  'tbd',
  'todo',
  'lorem',
  'ipsum',
  'abc',
  '123',
  'aaa',
  'bbb',
  'ccc',
  'qwerty',
  'dummy',
  'fake',
  'temp',
  'string',
  'help',
  'please help',
  'need help',
]);

/** Legitimate short survey answers — allowed even below field min length. */
const VALID_SHORT_PHRASES = new Set([
  'more sales',
  'more leads',
  'more clients',
  'more revenue',
  'more traffic',
  'more bookings',
  'more customers',
  'more orders',
  'more profit',
  'grow sales',
  'grow revenue',
  'save time',
  'less admin',
  'automate tasks',
  'get leads',
  'find clients',
  'increase sales',
  'increase revenue',
  'reduce costs',
  'save money',
  'software',
  'ecommerce',
  'e-commerce',
  'consulting',
  'coaching',
  'agency',
  'saas',
]);

/** Minimum length when not a known short phrase (kept low — form already requires non-empty). */
const MIN = {
  business_type: 3,
  pain: 10,
  desired_results: 6,
  budget: 2,
} as const;

export class SurveyQualityError extends Error {
  readonly code = 'INSUFFICIENT_SURVEY_DATA' as const;
  readonly reasons: string[];

  constructor(reasons: string[]) {
    const unique = [...new Set(reasons)];
    super(
      unique.length === 1
        ? unique[0]
        : `Survey answers are too vague to generate a personalized report:\n• ${unique.join('\n• ')}`,
    );
    this.name = 'SurveyQualityError';
    this.reasons = unique;
  }
}

export type SurveyQualityAssessment = {
  valid: boolean;
  reasons: string[];
  businessName?: string;
  firstName?: string;
  personalizedNote?: string;
};

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Trim and normalize whitespace / invisible characters from survey text fields. */
export function sanitizeSurveyAnswer(value: string | undefined): string {
  if (value == null) return '';
  return value
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\u00a0/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function alphaRatio(value: string): number {
  const letters = (value.match(/[a-zA-Z]/g) ?? []).length;
  return letters / Math.max(value.length, 1);
}

function isKnownShortPhrase(norm: string): boolean {
  return VALID_SHORT_PHRASES.has(norm);
}

/** True when the string looks like a real answer, not a placeholder or stub. */
export function isMeaningfulAnswer(
  value: string | undefined,
  field: keyof typeof MIN,
): boolean {
  const raw = sanitizeSurveyAnswer(value);
  if (!raw) return false;

  const norm = normalize(raw);
  if (PLACEHOLDER_EXACT.has(norm)) return false;
  if (isKnownShortPhrase(norm)) return true;

  if (raw.length < MIN[field]) return false;

  if (!/\s/.test(norm) && norm.length < 8 && alphaRatio(raw) < 0.5) return false;

  if (/^(.)\1{3,}$/.test(norm.replace(/\s/g, ''))) return false;

  const words = norm.split(/\s+/).filter(Boolean);
  const firstWord = words[0];
  if (words.length >= 3 && new Set(words).size === 1 && firstWord !== undefined && firstWord.length < 8) {
    return false;
  }

  return true;
}

function buildPersonalizedNote(pain: string, goal: string): string | undefined {
  const p = sanitizeSurveyAnswer(pain);
  const g = sanitizeSurveyAnswer(goal);
  if (!isMeaningfulAnswer(p, 'pain') || !isMeaningfulAnswer(g, 'desired_results')) {
    return undefined;
  }
  if (normalize(p) === normalize(g)) return undefined;

  const painSnippet = p.length > 80 ? `${p.slice(0, 77)}…` : p;
  const goalSnippet = g.length > 80 ? `${g.slice(0, 77)}…` : g;
  return `I noticed you're focused on ${goalSnippet.charAt(0).toLowerCase()}${goalSnippet.slice(1)} while working through ${painSnippet.charAt(0).toLowerCase()}${painSnippet.slice(1)} — I've kept that front and centre in the report.`;
}

export function firstNameFromValidSurvey(email: string, businessType?: string): string {
  const local = email.split('@')[0]?.trim() ?? '';
  const localNorm = local.toLowerCase();

  if (
    local.length >= 2 &&
    !local.includes('.') &&
    !/^e2e|^test|^sim_/i.test(localNorm) &&
    localNorm !== 'test'
  ) {
    return local.charAt(0).toUpperCase() + local.slice(1).toLowerCase();
  }

  if (businessType && isMeaningfulAnswer(businessType, 'business_type')) {
    const firstWord = businessType.trim().split(/\s+/)[0] ?? '';
    if (firstWord.length >= 3) {
      return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
    }
  }

  return 'there';
}

function isPlaceholderDuplicate(a: string, b: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  if (na !== nb) return false;
  return PLACEHOLDER_EXACT.has(na) || na.length < 15;
}

/**
 * Validates whether a survey has enough real content to generate a personalized PDF report.
 * Sanitizes input and blocks obvious placeholders (e.g. "Test") but allows short real answers
 * like "more sales" or "Software".
 */
export function assessSurveyForReport(survey: ReportRequestData): SurveyQualityAssessment {
  const reasons: string[] = [];

  const business = sanitizeSurveyAnswer(survey.business_type);
  const pain = sanitizeSurveyAnswer(survey.pain);
  const goal = sanitizeSurveyAnswer(survey.desired_results);
  const budget = sanitizeSurveyAnswer(survey.budget);

  if (!isMeaningfulAnswer(business, 'business_type')) {
    reasons.push(
      'Business type looks like a placeholder (e.g. "Test") — need a real description of what the business does.',
    );
  }
  if (!isMeaningfulAnswer(pain, 'pain')) {
    reasons.push(
      'Current situation / pain point is too short or generic — need a specific frustration or challenge.',
    );
  }
  if (!isMeaningfulAnswer(goal, 'desired_results')) {
    reasons.push(
      'Desired results are too short or generic — need concrete outcomes they want from AI/automation.',
    );
  }
  if (!budget || budget.length < MIN.budget) {
    reasons.push('Budget field is empty.');
  }

  const normBusiness = normalize(business);
  const normPain = normalize(pain);
  const normGoal = normalize(goal);

  const distinct = new Set([normBusiness, normPain, normGoal]);
  if (distinct.size === 1 && (PLACEHOLDER_EXACT.has(normBusiness) || normBusiness.length < 12)) {
    reasons.push('Business type, pain, and goals are identical — answers look like test data.');
  } else {
    if (isPlaceholderDuplicate(business, pain)) {
      reasons.push('Business type and pain point are the same — need distinct, specific answers.');
    }
    if (isPlaceholderDuplicate(pain, goal)) {
      reasons.push('Pain point and desired results are the same — need distinct, specific answers.');
    }
  }

  if (reasons.length > 0) {
    return { valid: false, reasons };
  }

  return {
    valid: true,
    reasons: [],
    businessName: business,
    firstName: firstNameFromValidSurvey(survey.email, business),
    personalizedNote: buildPersonalizedNote(pain, goal),
  };
}

export function assertSurveyQualityForReport(survey: ReportRequestData): SurveyQualityAssessment {
  const assessment = assessSurveyForReport(survey);
  if (!assessment.valid) {
    throw new SurveyQualityError(assessment.reasons);
  }
  return assessment;
}
