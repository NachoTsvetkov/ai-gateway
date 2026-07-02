import { ScorecardLibraryShell } from "components/conversion-scorecard/scorecard-library-shell";
import { InteractiveScorecard } from "components/conversion-scorecard/interactive-scorecard";
import { LIBRARY_BASE_PATH } from "lib/digital-product-access";

export const metadata = {
  title: "Leak Scorecard",
  robots: { index: false, follow: false },
};

export default function ScorecardPage() {
  return (
    <ScorecardLibraryShell
      currentPath={`${LIBRARY_BASE_PATH}/scorecard`}
      title="Leak Scorecard"
      subtitle="27-point survey to find where sales leak. About 15 minutes."
      showTrackerDownload={false}
    >
      <InteractiveScorecard />
    </ScorecardLibraryShell>
  );
}
