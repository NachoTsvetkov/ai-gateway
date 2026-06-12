/**
 * Quick check: placeholder survey (business_type "Test") must fail validation.
 * Run: npx tsx scripts/test-survey-quality.ts
 */
import { assessSurveyForReport } from '../lib/survey-quality';
import type { ReportRequestData } from '../lib/surveys';

const placeholderSurvey: ReportRequestData = {
  source: 'revenue-audit',
  business_type: 'Test',
  pain: 'Test',
  desired_results: 'Test',
  budget: '1000',
  interest: 8,
  email: 'nacho.tsvetkov@gmail.com',
};

const validSurvey: ReportRequestData = {
  source: 'revenue-audit',
  business_type: 'Independent Shopify store selling handmade candles',
  pain: 'Spending 15+ hours a week manually updating inventory and answering the same customer emails about shipping times.',
  desired_results:
    'Automate repetitive customer support and inventory alerts so I can focus on product development and marketing.',
  budget: '2000-5000',
  interest: 8,
  email: 'client@example.com',
  tried_so_far: 'Basic email templates in Gmail',
};

function print(label: string, survey: ReportRequestData) {
  const result = assessSurveyForReport(survey);
  console.log(`\n${label}: valid=${result.valid}`);
  if (!result.valid) {
    console.log('Reasons:');
    result.reasons.forEach((r) => console.log(`  • ${r}`));
  } else {
    console.log(`  businessName: ${result.businessName}`);
    console.log(`  firstName: ${result.firstName}`);
    console.log(`  personalizedNote: ${result.personalizedNote ?? '(none)'}`);
  }
}

print('Placeholder survey (should FAIL)', placeholderSurvey);
print('Valid survey (should PASS)', validSurvey);

const invalid = assessSurveyForReport(placeholderSurvey);
if (invalid.valid) {
  console.error('\nFAIL: placeholder survey should not pass validation');
  process.exit(1);
}

const valid = assessSurveyForReport(validSurvey);
if (!valid.valid) {
  console.error('\nFAIL: valid survey should pass validation');
  process.exit(1);
}

console.log('\nOK — survey quality checks passed');
