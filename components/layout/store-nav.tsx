import CartModal from "components/cart/modal";
import { getMenu } from "lib/shopify";
import { Menu } from "lib/shopify/types";
import Link from "next/link";
import { Suspense } from "react";
import { SearchSkeleton } from "./navbar/search";
import Search from "./navbar/search";

export async function StoreNav() {
  const menu = await getMenu("next-js-frontend-header-menu");

  return (
    <div className="sticky top-[57px] z-30 flex items-center justify-between border-b border-neutral-200/60 bg-neutral-50/90 px-4 py-2 backdrop-blur-md lg:px-6 dark:border-neutral-800/60 dark:bg-neutral-950/90">
      <div className="flex w-full items-center">
        <div className="flex w-full items-center gap-1 md:w-1/3">
          {menu.length ? (
            <ul className="flex items-center gap-4 text-xs font-medium">
              {menu.map((item: Menu) => (
                <li key={item.title}>
                  <Link
                    href={item.path}
                    prefetch={true}
                    className="text-neutral-500 underline-offset-4 hover:text-black hover:underline dark:text-neutral-400 dark:hover:text-neutral-300"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="hidden justify-center md:flex md:w-1/3">
          <Suspense fallback={<SearchSkeleton />}>
            <Search />
          </Suspense>
        </div>
        <div className="flex justify-end md:w-1/3">
          <CartModal />
        </div>
      </div>
    </div>
  );
}
