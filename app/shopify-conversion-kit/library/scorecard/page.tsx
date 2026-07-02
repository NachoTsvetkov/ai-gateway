import { ScorecardLibraryShell } from "components/conversion-scorecard/scorecard-library-shell";
import { InteractiveScorecard } from "components/conversion-scorecard/interactive-scorecard";
import { LIBRARY_BASE_PATH } from "lib/digital-product-access";

export const metadata = {
  title: "Leak scorecard",
  robots: { index: false, follow: false },
};

export default function ScorecardPage() {
  return (
    <ScorecardLibraryShell
      currentPath={`${LIBRARY_BASE_PATH}/scorecard`}
      title="15-minute leak scorecard"
      subtitle="Rate Broken, Partial, or Working on your phone. Fix what is not Working first."
      showTrackerDownload={false}
    >
      <InteractiveScorecard />
    </ScorecardLibraryShell>
  );
}
