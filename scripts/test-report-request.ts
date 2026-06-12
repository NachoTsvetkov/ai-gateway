import 'dotenv/config';
import { saveReportRequestResponse, getRecentReportRequests } from '../lib/surveys';

// Also exercises the HTTP API route for full API testing (submit + retrieve via fetch).
const API_BASE = process.env.API_BASE || 'http://localhost:3000';

// Run with: npx tsx scripts/test-report-request.ts
// This script now includes full instructions for using Firebase CLI to create the DB and deploy rules (as requested).

async function test() {
  console.log('Submitting test data to TEST collection (chaos_survey_responses_test)...');

  const testData = {
    source: 'test-local',
    business_type: 'Test Fitness Studio',
    pain: 'Missed leads after hours and manual follow up taking too much time',
    desired_results: 'More bookings without hiring staff, time back for coaching',
    tried_so_far: 'Tried basic booking software and manual follow-ups',
    budget: '$2,000–$5,000',
    interest: 9,
    email: 'test@example.com',
    additional_details: 'This is a test submission from the Grok implementation task. Please ignore/delete.',
    page_url: 'http://localhost:3000/test',
  };

  const timeoutMs = 15000; // fail fast after 15s

  try {
    const savePromise = (async () => {
      const id = await saveReportRequestResponse(testData, true);
      console.log('✅ Write success! Document ID in test collection:', id);

      // CRITICAL: immediately read it back to verify persistence + retrieval works
      const recent = await getRecentReportRequests(true, 3);
      console.log('✅ Read-back success! Recent docs from the test collection (chaos_survey_responses_test internal name):');
      console.dir(recent, { depth: 2 });
      console.log('If you see your test doc above (with matching email or source), end-to-end save+retrieve is working.');
      return id;
    })();

    const result = await Promise.race([
      savePromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout after ' + timeoutMs + 'ms - likely Firestore rules or DB not set up')), timeoutMs))
    ]);

    console.log('\n🎉 Full submit + retrieve test PASSED for test collection (direct lib).');
    console.log('Check Firebase Console > Firestore > chaos_survey_responses_test (test bucket) and chaos_survey_responses (prod bucket for live forms).');

    // Extra: test the public API surface (POST create + GET list) - this is the contract forms will use.
    console.log('\nTesting HTTP API /api/report-request ...');
    const postRes = await fetch(`${API_BASE}/api/report-request?test=false`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    });
    if (!postRes.ok) {
      const e = await postRes.text();
      throw new Error(`API POST failed: ${postRes.status} ${e}`);
    }
    const postJson = await postRes.json();
    console.log('✅ API POST success:', postJson);

    const getRes = await fetch(`${API_BASE}/api/report-request?test=false`);
    const getJson = await getRes.json();
    console.log('✅ API GET recent:', getJson);
    console.log('🎉 API roundtrip (submit via route + retrieve) also verified.');
  } catch (e) {
    console.error('❌ Error during submit or retrieve test:', e);
    console.log('\nPossible causes and fixes (PREFERRED: use Firebase CLI):');
    console.log('1. Firestore database NOT CREATED or rules not deployed.');
    console.log('');
    console.log('   === COPY-PASTE THESE COMMANDS IN YOUR TERMINAL (pwsh) ===');
    console.log('   cd "C:\\Users\\nacho\\source\\portfolio\\shopify-store-integration\\my-shopify-ai"');
    console.log('   npx firebase login   # (one time - opens browser if needed)');
    console.log('   npm run firestore:setup');
    console.log('   === END COPY-PASTE ===');
    console.log('');
    console.log('   This does exactly:');
    console.log('     npx firebase firestore:databases:create "(default)" --location nam5 --project nachotsvetkov-cbaa7');
    console.log('     npx firebase deploy --only firestore:rules --project nachotsvetkov-cbaa7');
    console.log('   (We have firebase.json, .firebaserc, and firestore.rules already set up for you.)');
    console.log('');
    console.log('   Alternative location? Run: npx firebase firestore:locations');
    console.log('   Console fallback: https://console.firebase.google.com/project/nachotsvetkov-cbaa7/firestore');
    console.log('');
    console.log('2. After the above succeeds, re-run this script: npx tsx scripts/test-report-request.ts');
    console.log('3. Test live forms at http://localhost:3000 (dev server is running). Use ?test=false for test bucket.');
    console.log('4. Other issues: API not enabled, billing, or data validation.');
    process.exit(1);
  }
}

test();