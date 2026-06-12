/**
 * Verifies PROD Firestore rules allow desktop monitor writes (public REST + API key).
 * Run: node scripts/test-prod-firestore-rules.mjs
 * Exit 0 = all checks pass; 1 = rules block writes (deploy firestore.rules).
 */
import fs from 'fs';
import path from 'path';

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) throw new Error('Missing .env.local');
  const env = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)="?([^"]*)"?\s*$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

const env = loadEnv();
const projectId = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const apiKey = env.NEXT_PUBLIC_FIREBASE_API_KEY;
if (!projectId || !apiKey) throw new Error('Missing NEXT_PUBLIC_FIREBASE_* in .env.local');

const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

async function rest(method, urlPath, body) {
  const sep = urlPath.includes('?') ? '&' : '?';
  const url = `${base}${urlPath}${sep}key=${apiKey}`;
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { ok: res.ok, status: res.status, json };
}

async function listCollection(name) {
  return rest('GET', `/${name}?pageSize=1&orderBy=created_at%20desc`);
}

async function patchSurveyMonitorStatus(surveyId, status) {
  const mask = 'updateMask.fieldPaths=monitor_status';
  const url = `${base}/survey_responses/${surveyId}?${mask}&key=${apiKey}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: { monitor_status: { stringValue: status } },
    }),
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, body: text.slice(0, 300) };
}

async function patchAction(docId) {
  const url = `${base}/actions/${docId}?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        contactId: { stringValue: 'c_rules_test@example.com' },
        contactEmail: { stringValue: 'rules_test@example.com' },
        type: { stringValue: 'generate_report' },
        title: { stringValue: 'Rules test action' },
        description: { stringValue: 'Created by test-prod-firestore-rules.mjs' },
        status: { stringValue: 'pending' },
        dueAt: { stringValue: new Date().toISOString() },
        created_at: { stringValue: new Date().toISOString() },
      },
    }),
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, body: text.slice(0, 300) };
}

console.log(`Project: ${projectId}`);
console.log('--- Collection READ checks (public REST) ---');

const collections = [
  'survey_responses', 'contacts', 'actions', 'activities',
  'reports', 'meetings', 'proposals', 'projects', 'sent_emails', 'orders',
];

let fail = 0;
for (const c of collections) {
  const r = await listCollection(c);
  const status = r.ok ? 'OK' : `FAIL ${r.status}`;
  console.log(`  ${c}: ${status}`);
  if (!r.ok && c === 'actions') fail++;
}

console.log('--- WRITE checks ---');

const surveys = await listCollection('survey_responses');
let surveyId = null;
if (surveys.ok && surveys.json.documents?.[0]) {
  surveyId = surveys.json.documents[0].name.split('/').pop();
}

if (surveyId) {
  const orig = surveys.json.documents[0].fields?.monitor_status?.stringValue ?? '(unset)';
  const testStatus = orig === 'RulesTest' ? 'New' : 'RulesTest';
  const w = await patchSurveyMonitorStatus(surveyId, testStatus);
  console.log(`  survey_responses/${surveyId} monitor_status PATCH: ${w.ok ? 'OK' : `FAIL ${w.status}`}`);
  if (!w.ok) {
    console.log(`    ${w.body}`);
    fail++;
  } else if (testStatus !== orig) {
    await patchSurveyMonitorStatus(surveyId, orig === '(unset)' ? 'New' : orig);
  }
} else {
  console.log('  survey monitor_status PATCH: SKIP (no surveys)');
}

const actionId = `itest-rules-${Date.now()}`;
const a = await patchAction(actionId);
console.log(`  actions/${actionId} create PATCH: ${a.ok ? 'OK' : `FAIL ${a.status}`}`);
if (!a.ok) {
  console.log(`    ${a.body}`);
  fail++;
}

console.log('---');
if (fail > 0) {
  console.log('FAILED: Deploy rules from my-shopify-ai:');
  console.log('  firebase login');
  console.log('  npm run firestore:deploy-rules');
  console.log('Or paste firestore.rules into Firebase Console → Firestore → Rules → Publish.');
  process.exit(1);
}
console.log('PASSED: PROD Firestore rules allow desktop monitor writes.');
