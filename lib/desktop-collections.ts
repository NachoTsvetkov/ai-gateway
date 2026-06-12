import {
  ACTIONS_COLLECTION,
  CONTACTS_COLLECTION,
  REPORTS_COLLECTION,
  SENT_EMAILS_COLLECTION,
  SURVEYS_COLLECTION,
  TEST_ACTIONS_COLLECTION,
  TEST_CONTACTS_COLLECTION,
  TEST_REPORTS_COLLECTION,
  TEST_SENT_EMAILS_COLLECTION,
  TEST_SURVEYS_COLLECTION,
} from './firebase';

export function surveysCollection(useTest: boolean) {
  return useTest ? TEST_SURVEYS_COLLECTION : SURVEYS_COLLECTION;
}

export function reportsCollection(useTest: boolean) {
  return useTest ? TEST_REPORTS_COLLECTION : REPORTS_COLLECTION;
}

export function contactsCollection(useTest: boolean) {
  return useTest ? TEST_CONTACTS_COLLECTION : CONTACTS_COLLECTION;
}

export function sentEmailsCollection(useTest: boolean) {
  return useTest ? TEST_SENT_EMAILS_COLLECTION : SENT_EMAILS_COLLECTION;
}

export function actionsCollection(useTest: boolean) {
  return useTest ? TEST_ACTIONS_COLLECTION : ACTIONS_COLLECTION;
}
