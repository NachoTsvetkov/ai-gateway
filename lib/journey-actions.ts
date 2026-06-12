import { doc, setDoc } from 'firebase/firestore';
import { db, ACTIONS_COLLECTION, TEST_ACTIONS_COLLECTION } from './firebase';

/** Action types aligned with Client_Journey_and_System_Flows.md */
export type JourneyActionType =
  | 'generate_report'
  | 'send_report'
  | 'book_meeting'
  | 'complete_meeting'
  | 'send_proposal'
  | 'follow_up_proposal'
  | 'collect_payment'
  | 'deliver_order'
  | 'project_check_in'
  | 'maintenance_check_in'
  | 'reengage_nurture'
  | 'rebook_meeting'
  | 'win_back'
  | 'nurture_lead';

export type JourneyActionStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export type CreateJourneyActionInput = {
  contactId: string;
  contactEmail: string;
  type: JourneyActionType;
  title: string;
  description: string;
  dueAt: string;
  relatedType?: string;
  relatedId?: string;
  funnelStage?: string;
};

function actionsCollection(useTest: boolean) {
  return useTest ? TEST_ACTIONS_COLLECTION : ACTIONS_COLLECTION;
}

function actionDocId(type: string, contactId: string, relatedId?: string) {
  const suffix = relatedId ? `_${relatedId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40)}` : '';
  return `act_${type}_${contactId}${suffix}`.slice(0, 150);
}

export function addHours(isoOrDate: Date | string, hours: number): string {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : new Date(isoOrDate);
  d.setHours(d.getHours() + hours);
  return d.toISOString();
}

export function addDays(isoOrDate: Date | string, days: number): string {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : new Date(isoOrDate);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/**
 * Upsert a pending journey action (idempotent per contact + type + relatedId).
 */
export async function createJourneyAction(
  input: CreateJourneyActionInput,
  useTestCollection = false,
): Promise<string> {
  const id = actionDocId(input.type, input.contactId, input.relatedId);
  const now = new Date().toISOString();
  const ref = doc(db, actionsCollection(useTestCollection), id);

  await setDoc(
    ref,
    {
      contactId: input.contactId,
      contactEmail: input.contactEmail.trim().toLowerCase(),
      type: input.type,
      title: input.title,
      description: input.description,
      status: 'pending' as JourneyActionStatus,
      dueAt: input.dueAt,
      created_at: now,
      relatedType: input.relatedType ?? null,
      relatedId: input.relatedId ?? null,
      funnelStage: input.funnelStage ?? null,
    },
    { merge: true },
  );

  return id;
}

/** Actions created on website intake events */
export async function createSurveySubmitActions(
  contactId: string,
  contactEmail: string,
  surveyId: string,
  source: string,
  submittedAt: string,
  useTest: boolean,
) {
  await createJourneyAction(
    {
      contactId,
      contactEmail,
      type: 'generate_report',
      title: 'Generate Personalized AI Opportunity Report',
      description: `Survey via ${source} — client promised report within 48 hours`,
      dueAt: addHours(submittedAt, 48),
      relatedType: 'survey',
      relatedId: surveyId,
      funnelStage: 'survey_submitted',
    },
    useTest,
  );
}

export async function createOrderSubmitActions(
  contactId: string,
  contactEmail: string,
  orderId: string,
  buyableName: string,
  totalEur: number,
  status: string,
  submittedAt: string,
  useTest: boolean,
) {
  if (status === 'paid') {
    await createJourneyAction(
      {
        contactId,
        contactEmail,
        type: 'deliver_order',
        title: 'Deliver order / start project',
        description: `${buyableName} — €${totalEur} paid`,
        dueAt: addDays(submittedAt, 7),
        relatedType: 'order',
        relatedId: orderId,
        funnelStage: 'order_paid',
      },
      useTest,
    );
  } else {
    await createJourneyAction(
      {
        contactId,
        contactEmail,
        type: 'collect_payment',
        title: 'Collect payment',
        description: `${buyableName} — €${totalEur} (${status})`,
        dueAt: addDays(submittedAt, 3),
        relatedType: 'order',
        relatedId: orderId,
        funnelStage: 'order_created',
      },
      useTest,
    );
  }
}

export async function createMarketingLeadAction(
  contactId: string,
  contactEmail: string,
  source: string,
  useTest: boolean,
) {
  const now = new Date().toISOString();
  await createJourneyAction(
    {
      contactId,
      contactEmail,
      type: 'nurture_lead',
      title: 'Nurture marketing lead',
      description: `Follow up on signup from ${source}`,
      dueAt: addDays(now, 7),
      funnelStage: 'marketing_lead',
    },
    useTest,
  );
}

/** Next action after completing one (desktop workflow). Returns null when journey stage is terminal. */
export function nextActionAfterComplete(
  completedType: JourneyActionType,
  contactId: string,
  contactEmail: string,
  now = new Date().toISOString(),
): CreateJourneyActionInput | null {
  switch (completedType) {
    case 'generate_report':
      return {
        contactId,
        contactEmail,
        type: 'send_report',
        title: 'Send report to client',
        description: 'Email the Personalized AI Opportunity Report',
        dueAt: addHours(now, 24),
        funnelStage: 'report_ready',
      };
    case 'send_report':
      return {
        contactId,
        contactEmail,
        type: 'book_meeting',
        title: 'Invite to discovery call',
        description: 'Send Calendly link or book meeting',
        dueAt: addDays(now, 7),
        funnelStage: 'report_sent',
      };
    case 'book_meeting':
      return null; // meeting doc drives complete_meeting
    case 'complete_meeting':
      return {
        contactId,
        contactEmail,
        type: 'send_proposal',
        title: 'Send proposal',
        description: 'Create and send proposal based on meeting outcome',
        dueAt: addDays(now, 3),
        funnelStage: 'meeting_completed',
      };
    case 'send_proposal':
      return {
        contactId,
        contactEmail,
        type: 'follow_up_proposal',
        title: 'Follow up on proposal',
        description: 'Check if client accepted, rejected, or needs more info',
        dueAt: addDays(now, 7),
        funnelStage: 'proposal_sent',
      };
    case 'follow_up_proposal':
      return null;
    case 'collect_payment':
      return null;
    case 'deliver_order':
      return {
        contactId,
        contactEmail,
        type: 'project_check_in',
        title: 'Project delivery check-in',
        description: 'Confirm deliverables and client satisfaction',
        dueAt: addDays(now, 14),
        funnelStage: 'project_active',
      };
    case 'project_check_in':
      return {
        contactId,
        contactEmail,
        type: 'maintenance_check_in',
        title: 'Re-engage for maintenance / subscription',
        description: 'Offer ongoing support or subscription',
        dueAt: addDays(now, 30),
        funnelStage: 'project_active',
      };
    case 'maintenance_check_in':
      return {
        contactId,
        contactEmail,
        type: 'maintenance_check_in',
        title: 'Monthly maintenance check-in',
        description: 'Recurring relationship touchpoint',
        dueAt: addDays(now, 30),
        funnelStage: 'subscription_active',
      };
    case 'rebook_meeting':
    case 'reengage_nurture':
    case 'win_back':
    case 'nurture_lead':
      return null;
    default:
      return null;
  }
}

/** Funnel stages where no automatic pending action is expected (until failure/re-engage). */
export const TERMINAL_FUNNEL_STAGES = new Set([
  'subscription_active',
  'subscription_cancelled',
  'proposal_rejected',
  'proposal_expired',
  'meeting_no_show',
  'payment_failed',
  'project_paused',
]);
