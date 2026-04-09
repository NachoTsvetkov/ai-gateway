import CartModal from "components/cart/modal";
import { getMenu } from "lib/shopify";
import { Menu } from "lib/shopify/types";
import Link from "next/link";
import { Suspense } from "react";
import MobileMenu from "./mobile-menu";
import Search, { SearchSkeleton } from "./search";

const portfolioLinks = [
  { title: "Home", path: "/" },
  { title: "Projects", path: "/projects" },
];

export async function Navbar() {
  const menu = await getMenu("next-js-frontend-header-menu");

  const allLinks = [
    ...portfolioLinks,
    ...menu.map((item: Menu) => ({ title: item.title, path: item.path })),
  ];

  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-neutral-200/60 bg-white/80 p-4 backdrop-blur-lg lg:px-6 dark:border-neutral-800/60 dark:bg-neutral-900/80">
      <div className="block flex-none md:hidden">
        <Suspense fallback={null}>
          <MobileMenu menu={allLinks} />
        </Suspense>
      </div>
      <div className="flex w-full items-center">
        <div className="flex w-full md:w-1/3">
          <Link
            href="/"
            prefetch={true}
            className="mr-2 flex w-full items-center justify-center md:w-auto lg:mr-6"
          >
            <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
              NT
            </span>
            <span className="ml-2 hidden rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white lg:inline-block">
              Portfolio
            </span>
          </Link>
          <ul className="hidden gap-6 text-sm md:flex md:items-center">
            {portfolioLinks.map((item) => (
              <li key={item.title}>
                <Link
                  href={item.path}
                  prefetch={true}
                  className="font-medium text-neutral-700 underline-offset-4 hover:text-black hover:underline dark:text-neutral-300 dark:hover:text-white"
                >
                  {item.title}
                </Link>
              </li>
            ))}
            <li className="h-4 w-px bg-neutral-300 dark:bg-neutral-700" />
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
    </nav>
  );
}
