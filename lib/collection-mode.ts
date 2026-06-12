/**
 * Firestore collection routing: test vs prod.
 *
 * Website / API convention (intuitive):
 *   ?test=true  or ?test=1  → *_test collections (scripts, local dev, ?test=true on forms)
 *   ?test=false or ?test=0  → prod collections (explicit prod)
 *   (no param)              → caller chooses default (POST from site = prod; GET verify scripts = test)
 */

export function parseUseTestCollection(
  testParam: string | undefined,
  defaultUseTest = false,
): boolean {
  if (testParam === 'true' || testParam === '1') return true;
  if (testParam === 'false' || testParam === '0') return false;
  return defaultUseTest;
}

/** Build the query string for API calls (?test=true for test, empty for prod default). */
export function collectionQueryString(useTest: boolean): string {
  return useTest ? '?test=true' : '';
}
