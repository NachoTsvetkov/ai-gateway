import Link from "next/link";

export const metadata = {
  title: "Conversion Kit Terms & Refund Policy",
  description:
    "Terms of purchase, instant download delivery, and refund policy for the Shopify Conversion Leak Fix Kit.",
};

export default function ConversionKitTermsPage() {
  return (
    <main className="bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
        <Link
          href="/shopify-conversion-kit"
          className="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to the kit
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Shopify Conversion Leak Fix Kit — Terms
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Last updated: July 2026
        </p>

        <div className="prose prose-neutral mt-10 max-w-none dark:prose-invert prose-headings:font-bold prose-p:text-neutral-700 dark:prose-p:text-neutral-300">
          <h2>What you are buying</h2>
          <p>
            A digital download bundle (checklists, playbooks, copy blocks, and a
            CSV tracker) for auditing and improving Shopify store conversion.
            This is an informational product — not a done-for-you service or
            guaranteed revenue outcome.
          </p>

          <h2>Delivery</h2>
          <p>
            Files are available for immediate download on the checkout success
            page after payment. Save or bookmark that page. A copy of your
            receipt is recorded via PayPal. If downloads fail, email{" "}
            <a href="mailto:nacho.tsvetkov@gmail.com">nacho.tsvetkov@gmail.com</a>{" "}
            with your PayPal receipt within 48 hours.
          </p>

          <h2>License</h2>
          <p>
            Personal use for one business. Do not resell, redistribute, or
            republish the kit contents.
          </p>

          <h2>Refund policy</h2>
          <p>
            Request a full refund within <strong>7 days</strong> of purchase if
            the 15-minute audit checklist does not surface at least{" "}
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
            Checkout collects your email and store URL to deliver the product
            and provide support. See our{" "}
            <Link href="/privacy-policy">privacy policy</Link>.
          </p>

          <h2>Contact</h2>
          <p>
            Nacho Tsvetkov —{" "}
            <a href="mailto:nacho.tsvetkov@gmail.com">nacho.tsvetkov@gmail.com</a>
          </p>
        </div>
      </div>
    </main>
  );
}
