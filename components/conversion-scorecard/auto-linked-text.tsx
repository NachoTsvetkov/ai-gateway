import type { ReactNode } from "react";

const TERM_LINKS: Record<string, string> = {
  "Apple Pay": "https://www.apple.com/apple-pay/",
  "Shop Pay": "https://www.shopify.com/shop-pay",
};

const TERM_PATTERN = /(Shop Pay|Apple Pay)/g;

export function AutoLinkedText({ text }: { text: string }) {
  const parts = text.split(TERM_PATTERN);

  return (
    <>
      {parts.map((part, index): ReactNode => {
        const href = TERM_LINKS[part];

        if (!href) return part;

        return (
          <a
            key={`${part}-${index}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline underline-offset-2 hover:text-emerald-700 dark:hover:text-emerald-300"
          >
            {part}
          </a>
        );
      })}
    </>
  );
}
