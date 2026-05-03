"use client";

// Generic checkout form. Works for both bundles and single services
// because everything it needs is on the `Buyable` shape: a name, a
// "due today" amount, an optional recurring retainer, and a stable
// payment-provider reference string.
//
// Two payment paths:
//
//   1. If the buyable carries a `paymentLink` (set on bundles via
//      `bundle.stripePaymentLink`, currently undefined for services
//      until Nacho wires one up per service tier), redirect the
//      visitor straight there with `prefilled_email` and
//      `client_reference_id` populated. The reference string is
//      shaped like `bundle:startup` or
//      `service:website:tier1:upsells=express-delivery,white-glove-onboarding`
//      so the eventual webhook can reconstruct the order.
//
//   2. Otherwise (the current default), open the visitor's email
//      client with the full order details so Nacho receives a request
//      and can send back a real Stripe invoice within the hour. The
//      mailto path is intentional, not a placeholder — at this price
//      band buyers expect a human in the loop.

import { useMemo, useState, type FormEvent } from "react";
import { type Currency, formatPrice } from "lib/currency";
import type { Buyable } from "lib/buyable";
import type { Upsell } from "lib/bundles-data";

const NACHO_EMAIL = "nacho.tsvetkov@gmail.com";
const CALENDLY_URL = "https://calendly.com/nacho-tsvetkov/30min";

type Props = {
  buyable: Buyable;
  upsells: ReadonlyArray<Upsell>;
  oneTimeTotalEur: number;
  currency: Currency;
  /** Optional hosted-payment URL. Threaded through the buyable so the
   *  same form serves bundle / service alike. */
  paymentLink?: string;
};

export function CheckoutForm({
  buyable,
  upsells,
  oneTimeTotalEur,
  currency,
  paymentLink,
}: Props) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const total = formatPrice(oneTimeTotalEur, currency);
  const retainer = buyable.retainerEur
    ? formatPrice(buyable.retainerEur, currency)
    : null;

  const isPureMonthly =
    buyable.retainerEur !== undefined &&
    buyable.retainerEur === buyable.oneTimeEur;

  // Pre-build the mailto so the form can fall back gracefully if the
  // visitor's mail client takes an extra second to open.
  const mailtoHref = useMemo(() => {
    const lines: string[] = [];
    lines.push(`Order: ${buyable.name}`);
    if (isPureMonthly) {
      lines.push(`First month: ${formatPrice(buyable.oneTimeEur, currency)}`);
      lines.push(`Then: ${retainer}/mo recurring`);
    } else {
      lines.push(`Base price: ${formatPrice(buyable.oneTimeEur, currency)}`);
    }
    if (upsells.length > 0) {
      lines.push("");
      lines.push("Upgrades:");
      for (const u of upsells) {
        lines.push(`  - ${u.label} (+${formatPrice(u.eur, currency)})`);
      }
    }
    lines.push("");
    lines.push(`Total due today: ${total}`);
    if (retainer && !isPureMonthly) {
      lines.push(`Then ${retainer}/month retainer`);
    }
    lines.push("");
    lines.push(`Reference: ${buyable.reference}`);
    lines.push("");
    lines.push("Buyer:");
    if (name) lines.push(`  Name: ${name}`);
    if (business) lines.push(`  Business: ${business}`);
    if (email) lines.push(`  Email: ${email}`);
    if (phone) lines.push(`  Phone: ${phone}`);
    if (notes) {
      lines.push("");
      lines.push("Notes:");
      lines.push(notes);
    }
    const body = encodeURIComponent(lines.join("\n"));
    const subject = encodeURIComponent(
      `Buying ${buyable.name} — ${total}${retainer && !isPureMonthly ? ` + ${retainer}/mo` : ""}`,
    );
    return `mailto:${NACHO_EMAIL}?subject=${subject}&body=${body}`;
  }, [
    business,
    buyable.name,
    buyable.oneTimeEur,
    buyable.reference,
    currency,
    email,
    isPureMonthly,
    name,
    notes,
    phone,
    retainer,
    total,
    upsells,
  ]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (paymentLink) {
      const url = new URL(paymentLink);
      if (email) url.searchParams.set("prefilled_email", email);
      const upsellRef = upsells.map((u) => u.id).join(",") || "no-upsells";
      url.searchParams.set(
        "client_reference_id",
        `${buyable.reference}|upsells=${upsellRef}`,
      );
      window.location.href = url.toString();
      return;
    }
    window.location.href = mailtoHref;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-6 text-emerald-900 sm:p-8 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-200">
        <p className="text-lg font-bold">Order details on the way.</p>
        <p className="mt-2 text-sm leading-relaxed">
          Your email client should have opened with everything pre-filled.
          Once you hit send, I'll reply within an hour with a secure
          payment link and the kickoff calendar invite.
        </p>
        <p className="mt-4 text-sm">
          Mail client didn't open?{" "}
          <a
            href={mailtoHref}
            className="font-semibold underline underline-offset-2"
          >
            Click here to send manually
          </a>{" "}
          — or{" "}
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline underline-offset-2"
          >
            book a 15-min call instead
          </a>{" "}
          and I'll handle it on the call.
        </p>
      </div>
    );
  }

  const fieldClass =
    "mt-1.5 block w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm transition-colors placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white";
  const labelClass =
    "block text-sm font-semibold text-neutral-800 dark:text-neutral-200";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 dark:border-neutral-800 dark:bg-neutral-900"
      aria-label="Checkout details"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Your name</span>
          <input
            type="text"
            name="name"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass}
            placeholder="Maria Petrova"
          />
        </label>
        <label className="block">
          <span className={labelClass}>Business name</span>
          <input
            type="text"
            name="business"
            required
            autoComplete="organization"
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            className={fieldClass}
            placeholder="Petrova Studio Ltd."
          />
        </label>
      </div>

      <label className="block">
        <span className={labelClass}>Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={fieldClass}
          placeholder="you@business.com"
        />
        <span className="mt-1.5 block text-xs text-neutral-500 dark:text-neutral-500">
          Where I'll send the invoice + kickoff details.
        </span>
      </label>

      <label className="block">
        <span className={labelClass}>
          Phone{" "}
          <span className="font-normal text-neutral-500">(optional)</span>
        </span>
        <input
          type="tel"
          name="phone"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={fieldClass}
          placeholder="+359 882 700 002"
        />
      </label>

      <label className="block">
        <span className={labelClass}>
          Anything I should know before kickoff?{" "}
          <span className="font-normal text-neutral-500">(optional)</span>
        </span>
        <textarea
          name="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={fieldClass}
          placeholder="Existing site URL, brand assets, deadlines, anything specific..."
        />
      </label>

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-600/40 sm:text-lg"
      >
        Pay {total}
        {retainer && !isPureMonthly && (
          <span className="text-sm font-medium opacity-90">
            + {retainer}/mo
          </span>
        )}
        {isPureMonthly && (
          <span className="text-sm font-medium opacity-90">first month</span>
        )}
      </button>

      <p className="text-center text-xs text-neutral-500 dark:text-neutral-500">
        {paymentLink
          ? "Submitting takes you to a secure hosted checkout — no card info enters this page."
          : "Submitting forwards your details so I can send a secure Stripe invoice — no card info enters this page. Most invoices arrive within an hour."}
      </p>

      <p className="text-center text-xs text-neutral-500 dark:text-neutral-500">
        Or{" "}
        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-500 dark:text-blue-400"
        >
          book a free 15-min call
        </a>{" "}
        first if you'd rather scope before paying.
      </p>
    </form>
  );
}
