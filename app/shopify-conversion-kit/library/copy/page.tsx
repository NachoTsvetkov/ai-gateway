import { ScorecardLibraryShell } from "components/conversion-scorecard/scorecard-library-shell";
import { CopyBlockCard } from "components/conversion-scorecard/copy-block-card";
import { COPY_BLOCKS } from "lib/conversion-scorecard/content";
import { LIBRARY_BASE_PATH } from "lib/digital-product-access";

export const metadata = {
  title: "Copy-Paste Blocks",
  robots: { index: false, follow: false },
};

export default function CopyBlocksPage() {
  return (
    <ScorecardLibraryShell
      currentPath={`${LIBRARY_BASE_PATH}/copy`}
      title="Copy-Paste Blocks"
      subtitle="Replace [BRACKETS]. Tap Copy — paste into theme sections or cart liquid."
    >
      <div className="space-y-6">
        {COPY_BLOCKS.map((block) => (
          <CopyBlockCard key={block.id} block={block} />
        ))}
      </div>
    </ScorecardLibraryShell>
  );
}
