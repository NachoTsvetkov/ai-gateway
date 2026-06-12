import 'dotenv/config';
import { saveChaosSurveyResponse } from '../lib/surveys';

// Run with: npx tsx scripts/test-chaos-firebase.ts

async function test() {
  console.log('Submitting test data to TEST collection (chaos_survey_responses_test)...');

  const testData = {
    source: 'test-local',
    business_type: 'Test Fitness Studio',
    pain: 'Missed leads after hours and manual follow up taking too much time',
    desired_results: 'More bookings without hiring staff, time back for coaching',
    budget: '$2,000–$5,000',
    interest: 9,
    email: 'test@example.com',
    additional_details: 'This is a test submission from the Grok implementation task. Please ignore/delete.',
    page_url: 'http://localhost:3000/test',
  };

  const timeoutMs = 15000; // fail fast after 15s

  try {
    const result = await Promise.race([
      saveChaosSurveyResponse(testData, true), // true = use test collection
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout after ' + timeoutMs + 'ms - likely Firestore rules or DB not set up')), timeoutMs))
    ]);
    console.log('✅ Success! Document ID in test collection:', result);
    console.log('Check Firebase Console > Firestore > chaos_survey_responses_test');
  } catch (e) {
    console.error('❌ Error submitting test data:', e);
    console.log('Possible causes: Firestore database not created in project, security rules blocking writes, or invalid data.');
    process.exit(1);
  }
}

test();