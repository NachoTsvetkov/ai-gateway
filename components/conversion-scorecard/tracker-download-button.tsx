"use client";

import type { ReactNode } from "react";
import { downloadPersonalizedTrackerFromStorage } from "lib/conversion-scorecard/tracker-download";

export function TrackerDownloadButton({
  className,
  onDownload,
  children = "Download tracker CSV ↓",
}: {
  className?: string;
  onDownload?: () => void;
  children?: ReactNode;
}) {
  function handleClick() {
    downloadPersonalizedTrackerFromStorage();
    onDownload?.();
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
