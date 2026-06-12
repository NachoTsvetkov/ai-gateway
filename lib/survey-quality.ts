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
  'business',
  'company',
  'my business',
  'my company',
  'not sure',
  'idk',
  "i don't know",
  'dont know',
  'unknown',
  'no idea',
  'anything',
  'something',
  'whatever',
  'help',
  'please help',
  'need help',
]);

const MIN = {
  business_type: 5,
  pain: 25,
  desired_results: 25,
  budget: 3,
} as const;

export class SurveyQualityError extends Error {
  readonly code = 'INSUFFICIENT_SURVEY_DATA' as const;
  readonly reasons: string[];

  constructor(reasons: string[]) {
    super(
      reasons.length === 1
        ? reasons[0]
        : `Survey answers are too vague to generate a personalized report:\n• ${reasons.join('\n• ')}`,
    );
    this.name = 'SurveyQualityError';
    this.reasons = reasons;
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

function alphaRatio(value: string): number {
  const letters = (value.match(/[a-zA-Z]/g) ?? []).length;
  return letters / Math.max(value.length, 1);
}

/** True when the string looks like a real answer, not a placeholder or stub. */
export function isMeaningfulAnswer(
  value: string | undefined,
  field: keyof typeof MIN,
): boolean {
  const raw = value?.trim() ?? '';
  if (raw.length < MIN[field]) return false;

  const norm = normalize(raw);
  if (PLACEHOLDER_EXACT.has(norm)) return false;

  if (!/\s/.test(norm) && norm.length < 12 && alphaRatio(raw) < 0.5) return false;

  if (/^(.)\1{3,}$/.test(norm.replace(/\s/g, ''))) return false;

  const words = norm.split(/\s+/).filter(Boolean);
  const firstWord = words[0];
  if (words.length >= 2 && new Set(words).size === 1 && firstWord !== undefined && firstWord.length < 8) {
    return false;
  }

  return true;
}

function buildPersonalizedNote(pain: string, goal: string): string | undefined {
  const p = pain.trim();
  const g = goal.trim();
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

/**
 * Validates whether a survey has enough real content to generate a personalized PDF report.
 * Placeholder / test answers (e.g. business_type "Test", pain "test") fail validation.
 */
export function assessSurveyForReport(survey: ReportRequestData): SurveyQualityAssessment {
  const reasons: string[] = [];

  const business = survey.business_type?.trim() ?? '';
  const pain = survey.pain?.trim() ?? '';
  const goal = survey.desired_results?.trim() ?? '';
  const budget = survey.budget?.trim() ?? '';

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
  if (distinct.size === 1 && normBusiness.length < 40) {
    reasons.push('Business type, pain, and goals are identical — answers look like test data.');
  } else {
    if (normBusiness === normPain && normBusiness.length < 30) {
      reasons.push('Business type and pain point are the same — need distinct, specific answers.');
    }
    if (normPain === normGoal && normPain.length < 30) {
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
