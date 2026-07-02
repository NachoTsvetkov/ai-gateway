import Link from "next/link";

export const metadata = {
  title: "Scorecard Terms & Refund Policy",
  description:
    "Terms of purchase, instant library access, and refund policy for the Shopify Paid-Traffic Leak Scorecard.",
};

export default function ConversionKitTermsPage() {
  return (
    <div className="bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
        <Link
          href="/shopify-conversion-kit"
          className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to scorecard
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Shopify Paid-Traffic Leak Scorecard — Terms
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Last updated: July 2026
        </p>

        <div className="prose prose-neutral mt-10 max-w-none dark:prose-invert prose-headings:font-bold prose-p:text-neutral-700 dark:prose-p:text-neutral-300">
          <h2>What you are buying</h2>
          <p>
            Access to a private web library: interactive leak scorecard, fix
            playbooks, copy-paste blocks, a weekly metrics tracker (CSV), and a
            Meta ads smoke-test plan. This is an informational product — not a
            done-for-you service or guaranteed revenue outcome.
          </p>

          <h2>Delivery</h2>
          <p>
            Your library link is on the checkout success page immediately after
            payment. Bookmark it on your phone — access is tied to your
            purchase. A receipt is recorded via PayPal. If access fails, email{" "}
            <a href="mailto:nacho.tsvetkov@gmail.com">nacho.tsvetkov@gmail.com</a>{" "}
            with your PayPal receipt within 48 hours.
          </p>

          <h2>License</h2>
          <p>
            Personal use for one business. Do not resell, redistribute, or
            republish the scorecard contents.
          </p>

          <h2>Refund policy</h2>
          <p>
            Request a full refund within <strong>7 days</strong> of purchase if
            the leak scorecard does not surface at least{" "}
            <strong>3 actionable leaks</strong> on your store. Email{" "}
            <a href="mailto:nacho.tsvetkov@gmail.com">nacho.tsvetkov@gmail.com</a>{" "}
            with your store URL and order reference. Refunds are processed via
            PayPal within 5 business days.
          </p>

          <h2>No guarantees</h2>
          <p>
            Conversion improvements depend on your implementation, traffic,
            offer, and market. Past results described in marketing materials are
            illustrative, not promises.
          </p>

          <h2>Privacy</h2>
          <p>
            Checkout collects your email and store URL to deliver access and
            provide support. See our{" "}
            <Link href="/privacy-policy">privacy policy</Link>.
          </p>

          <h2>Contact</h2>
          <p>
            Nacho Tsvetkov —{" "}
            <a href="mailto:nacho.tsvetkov@gmail.com">nacho.tsvetkov@gmail.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}
