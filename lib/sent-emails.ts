import { doc, setDoc } from 'firebase/firestore';
import { db, SENT_EMAILS_COLLECTION, TEST_SENT_EMAILS_COLLECTION } from './firebase';

export type SentEmailCategory = 'marketing' | 'correspondence' | 'transactional';
export type SentEmailStatus = 'queued' | 'sent' | 'failed';

export type LogSentEmailInput = {
  contactId: string;
  toEmail: string;
  subject: string;
  template: string;
  category: SentEmailCategory;
  bodyPreview: string;
  status?: SentEmailStatus;
  sentAt?: string;
  relatedType?: string;
  relatedId?: string;
};

function sentEmailsCollection(useTest: boolean) {
  return useTest ? TEST_SENT_EMAILS_COLLECTION : SENT_EMAILS_COLLECTION;
}

function sentEmailDocId(template: string, contactId: string, relatedId?: string) {
  const suffix = relatedId ? `_${relatedId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40)}` : '';
  return `sem_${template}_${contactId}${suffix}`.slice(0, 150);
}

/**
 * Record an outbound email (marketing, report delivery, proposal, etc.).
 * Desktop app and website automations both write here.
 */
export async function logSentEmail(input: LogSentEmailInput, useTestCollection = false): Promise<string> {
  const id = sentEmailDocId(input.template, input.contactId, input.relatedId);
  const now = new Date().toISOString();
  const ref = doc(db, sentEmailsCollection(useTestCollection), id);

  await setDoc(
    ref,
    {
      contactId: input.contactId,
      toEmail: input.toEmail.trim().toLowerCase(),
      subject: input.subject,
      template: input.template,
      category: input.category,
      bodyPreview: input.bodyPreview.slice(0, 2000),
      status: input.status ?? 'sent',
      sentAt: input.sentAt ?? now,
      created_at: now,
      relatedType: input.relatedType ?? null,
      relatedId: input.relatedId ?? null,
    },
    { merge: true },
  );

  return id;
}
