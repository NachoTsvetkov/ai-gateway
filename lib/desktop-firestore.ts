import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  actionsCollection,
  contactsCollection,
  reportsCollection,
  sentEmailsCollection,
  surveysCollection,
} from './desktop-collections';
import { ACTIVITIES_COLLECTION, TEST_ACTIVITIES_COLLECTION } from './firebase';
import type { ReportRecord } from './report-records';
import { reportDocIdFromSurvey } from './report-records';

/** Firestore via public client SDK — matches desktop-data and works without Admin credentials. */
export async function getSurveyDoc(surveyId: string, useTest: boolean) {
  const ref = doc(db, surveysCollection(useTest), surveyId);
  const snap = await getDoc(ref);
  return snap.exists() ? { ref, data: snap.data() as Record<string, unknown> } : null;
}

export async function setSurveyMonitorStatus(surveyId: string, status: string, useTest: boolean) {
  const ref = doc(db, surveysCollection(useTest), surveyId);
  await updateDoc(ref, { monitor_status: status });
}

export async function createReportDoc(
  useTest: boolean,
  data: Record<string, unknown>,
): Promise<string> {
  const ref = await addDoc(collection(db, reportsCollection(useTest)), data);
  return ref.id;
}

/** Upsert canonical report for a survey (deterministic doc id). */
export async function saveReportRecord(
  surveyId: string,
  useTest: boolean,
  record: ReportRecord,
): Promise<string> {
  const id = reportDocIdFromSurvey(surveyId);
  const ref = doc(db, reportsCollection(useTest), id);
  const existing = await getDoc(ref);
  const payload: ReportRecord = existing.exists()
    ? { ...record, created_at: (existing.data().created_at as string) || record.created_at }
    : record;
  await setDoc(ref, payload, { merge: true });
  return id;
}

export async function findReportBySurveyId(surveyId: string, useTest: boolean) {
  const id = reportDocIdFromSurvey(surveyId);
  return getReportDoc(id, useTest);
}

export async function getReportDoc(reportId: string, useTest: boolean) {
  const ref = doc(db, reportsCollection(useTest), reportId);
  const snap = await getDoc(ref);
  return snap.exists() ? { ref, data: snap.data() as Record<string, unknown> } : null;
}

export async function markReportSent(reportId: string, useTest: boolean, sentAt: string) {
  const ref = doc(db, reportsCollection(useTest), reportId);
  await updateDoc(ref, { status: 'sent', sentAt, updated_at: sentAt });
}

export async function getContactDoc(contactId: string, useTest: boolean) {
  const ref = doc(db, contactsCollection(useTest), contactId);
  const snap = await getDoc(ref);
  return snap.exists() ? { ref, data: snap.data() as Record<string, unknown> } : null;
}

export async function upsertContactReportSent(
  contactId: string,
  email: string,
  funnelStage: string,
  useTest: boolean,
  now: string,
) {
  const ref = doc(db, contactsCollection(useTest), contactId);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    await updateDoc(ref, {
      email,
      funnelStage,
      updated_at: now,
      lastActivityAt: now,
    });
  } else {
    await setDoc(ref, {
      email,
      funnelStage,
      owner: 'nacho',
      archived: false,
      created_at: now,
      updated_at: now,
      lastActivityAt: now,
    });
  }
}

export async function logSentEmailDoc(
  id: string,
  data: Record<string, unknown>,
  useTest: boolean,
) {
  await setDoc(doc(db, sentEmailsCollection(useTest), id), data, { merge: true });
}

export async function logReportSentActivity(
  contactId: string,
  description: string,
  metadata: Record<string, unknown>,
  useTest: boolean,
  now: string,
) {
  await addDoc(collection(db, useTest ? TEST_ACTIVITIES_COLLECTION : ACTIVITIES_COLLECTION), {
    contactId,
    type: 'report_sent',
    description,
    metadata,
    created_at: now,
  });
}

export async function logReportGeneratedActivity(
  contactId: string,
  surveyId: string,
  reportId: string,
  useTest: boolean,
  now: string,
) {
  await addDoc(collection(db, useTest ? TEST_ACTIVITIES_COLLECTION : ACTIVITIES_COLLECTION), {
    contactId,
    type: 'report_generated',
    description: `HTML report generated for survey ${surveyId}`,
    metadata: { reportId, surveyId },
    created_at: now,
  });
}

export async function completePendingSendReportActions(
  surveyId: string,
  contactId: string,
  useTest: boolean,
  now: string,
) {
  const col = actionsCollection(useTest);
  const completed = new Set<string>();

  const completeDocs = async (docs: { id: string; ref: (typeof surveySnap.docs)[number]['ref'] }[]) => {
    await Promise.all(
      docs
        .filter((d) => !completed.has(d.id))
        .map(async (d) => {
          completed.add(d.id);
          await updateDoc(d.ref, { status: 'completed', completedAt: now, resolution: 'sent' });
        }),
    );
  };

  const bySurvey = query(
    collection(db, col),
    where('type', '==', 'send_report'),
    where('relatedId', '==', surveyId),
    where('status', '==', 'pending'),
    limit(5),
  );
  const surveySnap = await getDocs(bySurvey);
  await completeDocs(surveySnap.docs.map((d) => ({ id: d.id, ref: d.ref })));

  const byContact = query(
    collection(db, col),
    where('type', '==', 'send_report'),
    where('contactId', '==', contactId),
    where('status', '==', 'pending'),
    limit(5),
  );
  const contactSnap = await getDocs(byContact);
  await completeDocs(contactSnap.docs.map((d) => ({ id: d.id, ref: d.ref })));
}
