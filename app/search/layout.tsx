import Collections from "components/layout/search/collections";
import FilterList from "components/layout/search/filter";
import { ShopShell } from "components/layout/shop-shell";
import { sorting } from "lib/constants";
import { Suspense } from "react";
import ChildrenWrapper from "./children-wrapper";

/**
 * Wraps the search/collection results in the standalone shop chrome
 * (StoreNav + ShopFooter + Chatbot). The Collections and FilterList
 * sidebars sit in the page body between header and footer, exactly
 * like a typical e-commerce listing layout.
 */
export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ShopShell>
      <div className="mx-auto flex max-w-(--breakpoint-2xl) flex-col gap-8 px-4 pt-8 pb-12 text-black md:flex-row dark:text-white">
        <div className="order-first w-full flex-none md:max-w-[125px]">
          <Collections />
        </div>
        <div className="order-last min-h-screen w-full md:order-none">
          <Suspense fallback={null}>
            <ChildrenWrapper>{children}</ChildrenWrapper>
          </Suspense>
        </div>
        <div className="order-none flex-none md:order-last md:w-[125px]">
          <FilterList list={sorting} title="Sort by" />
        </div>
      </div>
    </ShopShell>
  );
}
