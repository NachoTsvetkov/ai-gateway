"use client";

// Generic checkout form. Works for both bundles and single services
// because everything it needs is on the `Buyable` shape: a name, a
// "due today" amount, an optional recurring retainer, and a stable
// payment-provider reference string.
//
// Three payment paths, in order of preference:
//
//   1. PayPal Smart Buttons (the primary path now). Requires
//      `NEXT_PUBLIC_PAYPAL_CLIENT_ID` to be set. The form fields
//      (name/email/business/phone/notes) are still required because
//      they end up on the PayPal record + the kickoff handoff. Two
//      button modes:
//        - One-time payment for buyables with no retainer.
//        - Subscription (with setup_fee = upfront amount) for
//          buyables with a monthly retainer.
//
//   2. Stripe Payment Link (legacy). If the buyable carries a
//      `paymentLink` we redirect there with prefilled email +
//      client_reference_id. Kept as a fallback while Nacho rolls
//      PayPal out gradually.
//
//   3. Mailto fallback. Always available below the buttons in case
//      both PayPal and the payment link are unavailable, or the
//      visitor explicitly prefers an emailed invoice.

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { type Currency, formatPrice } from "lib/currency";
import type { Buyable } from "lib/buyable";
import type { Upsell } from "lib/bundles-data";
import { type Locale, createT, DEFAULT_LOCALE } from "lib/i18n/locale";
import { DICT } from "lib/i18n/dict";
import {
  PayPalCheckoutButtons,
  type CheckoutCustomerInput,
  type PayPalButtonsKind,
} from "./paypal-buttons";

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
  /** Active locale. Server component passes it down so the entire form
   *  (labels, placeholders, helper text, submit button, success state)
   *  renders in the visitor's language. Defaults to English. */
  locale?: Locale;
  /** Public PayPal client id, forwarded from the server component
   *  reading process.env. Empty / undefined → PayPal buttons hidden,
   *  Stripe link / mailto fallback used. */
  paypalClientId?: string;
  /** Sandbox vs live — keeps the SDK on the matching environment. */
  paypalEnv?: "sandbox" | "live";
};

export function CheckoutForm({
  buyable,
  upsells,
  oneTimeTotalEur,
  currency,
  paymentLink,
  locale = DEFAULT_LOCALE,
  paypalClientId,
  paypalEnv = "sandbox",
}: Props) {
  const t = createT(locale);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [business, setBusiness] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const [showFormInvalid, setShowFormInvalid] = useState(false);

  const total = formatPrice(oneTimeTotalEur, currency);
  const retainer = buyable.retainerEur
    ? formatPrice(buyable.retainerEur, currency)
    : null;

  const isPureMonthly =
    buyable.retainerEur !== undefined &&
    buyable.retainerEur === buyable.oneTimeEur;

  const hasRetainer =
    buyable.retainerEur !== undefined && buyable.retainerEur > 0;
  const paypalKind: PayPalButtonsKind = hasRetainer ? "subscription" : "order";
  const paypalEnabled = !!paypalClientId;

  // PayPal buttons read fresh form values on every click via a ref so
  // we don't have to bounce them through a remount loop on each
  // keystroke.
  const formRef = useRef<{
    name: string;
    business: string;
    email: string;
    phone: string;
    notes: string;
  }>({ name: "", business: "", email: "", phone: "", notes: "" });
  formRef.current = { name, business, email, phone, notes };

  const getCustomer = useCallback((): CheckoutCustomerInput => {
    const c = formRef.current;
    return {
      name: c.name.trim(),
      business: c.business.trim(),
      email: c.email.trim(),
      phone: c.phone.trim() || undefined,
      notes: c.notes.trim() || undefined,
    };
  }, []);

  const isFormValid = useCallback(() => {
    const c = formRef.current;
    const ok =
      c.name.trim().length > 0 &&
      c.business.trim().length > 0 &&
      isLikelyEmail(c.email);
    if (!ok) setShowFormInvalid(true);
    else setShowFormInvalid(false);
    return ok;
  }, []);

  // Build the buyable's URL search params object once — the API uses
  // these to rebuild the buyable server-side without trusting client
  // totals. We drop the keys' types here because URLSearchParams
  // entries are strings.
  const searchParams = useMemo(() => {
    const out: { bundle?: string; service?: string; tier?: string; upsells?: string } = {};
    for (const [k, v] of buyable.searchParams) {
      if (k === "bundle") out.bundle = v;
      else if (k === "service") out.service = v;
      else if (k === "tier") out.tier = v;
    }
    if (upsells.length > 0) out.upsells = upsells.map((u) => u.id).join(",");
    return out;
  }, [buyable.searchParams, upsells]);

  // ----------------------------------------------------------------
  // Mailto fallback
  // ----------------------------------------------------------------

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

  function handleMailtoSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isFormValid()) return;
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

  function handlePayPalSuccess(args: { kind: PayPalButtonsKind; id: string }) {
    const url = new URL(window.location.href);
    url.pathname = "/checkout/success";
    url.searchParams.set("type", args.kind);
    url.searchParams.set("id", args.id);
    url.searchParams.set("ref", buyable.reference);
    window.location.href = url.toString();
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-6 text-emerald-900 sm:p-8 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-200">
        <p className="text-lg font-bold">
          {t(DICT.checkout.submittedHeadline)}
        </p>
        <p className="mt-2 text-sm leading-relaxed">
          {t(DICT.checkout.submittedBody)}
        </p>
        <p className="mt-4 text-sm">
          {t(DICT.checkout.submittedFallback1)}{" "}
          <a
            href={mailtoHref}
            className="font-semibold underline underline-offset-2"
          >
            {t(DICT.checkout.submittedFallback2)}
          </a>
          {t(DICT.checkout.submittedOr)}
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline underline-offset-2"
          >
            {t(DICT.checkout.submittedBookInstead)}
          </a>
          {t(DICT.checkout.submittedAfterBook)}
        </p>
      </div>
    );
  }

  const fieldClass =
    "mt-1.5 block w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm transition-colors placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-950 dark:text-white";
  const labelClass =
    "block text-sm font-semibold text-neutral-800 dark:text-neutral-200";

  const ariaFormLabel =
    locale === "bg" ? "Детайли за плащане" : "Checkout details";

  // Buyer-detail fields shared by both paths.
  const buyerFields = (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>{t(DICT.checkout.formName)}</span>
          <input
            type="text"
            name="name"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (showFormInvalid) setShowFormInvalid(false);
            }}
            className={fieldClass}
            placeholder={t(DICT.checkout.formNamePh)}
          />
        </label>
        <label className="block">
          <span className={labelClass}>{t(DICT.checkout.formBusiness)}</span>
          <input
            type="text"
            name="business"
            required
            autoComplete="organization"
            value={business}
            onChange={(e) => {
              setBusiness(e.target.value);
              if (showFormInvalid) setShowFormInvalid(false);
            }}
            className={fieldClass}
            placeholder={t(DICT.checkout.formBusinessPh)}
          />
        </label>
      </div>

      <label className="block">
        <span className={labelClass}>{t(DICT.checkout.formEmail)}</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (showFormInvalid) setShowFormInvalid(false);
          }}
          className={fieldClass}
          placeholder={t(DICT.checkout.formEmailPh)}
        />
        <span className="mt-1.5 block text-xs text-neutral-500 dark:text-neutral-500">
          {t(DICT.checkout.formEmailHelper)}
        </span>
      </label>

      <label className="block">
        <span className={labelClass}>
          {t(DICT.checkout.formPhone)}{" "}
          <span className="font-normal text-neutral-500">
            {t(DICT.checkout.formPhoneOptional)}
          </span>
        </span>
        <input
          type="tel"
          name="phone"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={fieldClass}
          placeholder={t(DICT.checkout.formPhonePh)}
        />
      </label>

      <label className="block">
        <span className={labelClass}>
          {t(DICT.checkout.formNotes)}{" "}
          <span className="font-normal text-neutral-500">
            {t(DICT.checkout.formNotesOptional)}
          </span>
        </span>
        <textarea
          name="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={fieldClass}
          placeholder={t(DICT.checkout.formNotesPh)}
        />
      </label>
    </>
  );

  const formInvalidNotice = showFormInvalid && (
    <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
      {t(DICT.checkout.paypalErrorFormInvalid)}
    </p>
  );

  // ----------------------------------------------------------------
  // PayPal-primary layout
  // ----------------------------------------------------------------

  if (paypalEnabled) {
    return (
      <div
        className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 dark:border-neutral-800 dark:bg-neutral-900"
        aria-label={ariaFormLabel}
      >
        {buyerFields}

        <div className="space-y-2 border-t border-neutral-200 pt-5 dark:border-neutral-800">
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            {t(DICT.checkout.paypalHeading)}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-500">
            {paypalKind === "subscription"
              ? t(DICT.checkout.paypalSubSubscription)
              : t(DICT.checkout.paypalSub)}
          </p>
        </div>

        {formInvalidNotice}

        <PayPalCheckoutButtons
          clientId={paypalClientId!}
          env={paypalEnv}
          currency={currency}
          locale={locale}
          kind={paypalKind}
          searchParams={searchParams}
          getCustomer={getCustomer}
          isFormValid={isFormValid}
          onSuccess={handlePayPalSuccess}
          onError={(msg) => setPaypalError(msg)}
        />

        {paypalError && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
            {paypalError}
          </p>
        )}

        <div className="border-t border-neutral-200 pt-4 text-center dark:border-neutral-800">
          <p className="text-xs text-neutral-500 dark:text-neutral-500">
            {t(DICT.checkout.paypalOrFallback)}{" "}
            <a
              href={mailtoHref}
              className="font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-500 dark:text-blue-400"
            >
              {t(DICT.checkout.paypalOrFallbackLink)}
            </a>
          </p>
        </div>

        <p className="text-center text-xs text-neutral-500 dark:text-neutral-500">
          {t(DICT.checkout.formBookFirstPrefix)}
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-500 dark:text-blue-400"
          >
            {t(DICT.checkout.formBookFirstLink)}
          </a>
          {t(DICT.checkout.formBookFirstSuffix)}
        </p>
      </div>
    );
  }

  // ----------------------------------------------------------------
  // Legacy: Stripe payment-link OR mailto-only layout
  // ----------------------------------------------------------------

  return (
    <form
      onSubmit={handleMailtoSubmit}
      className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 dark:border-neutral-800 dark:bg-neutral-900"
      aria-label={ariaFormLabel}
    >
      {buyerFields}

      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-600/40 sm:text-lg"
      >
        {t(DICT.checkout.formPay)}
        {total}
        {retainer && !isPureMonthly && (
          <span className="text-sm font-medium opacity-90">
            {t(DICT.checkout.formPayPlusMo)}
            {retainer}
            {t(DICT.checkout.formPayPerMo)}
          </span>
        )}
        {isPureMonthly && (
          <span className="text-sm font-medium opacity-90">
            {t(DICT.checkout.formPayFirstMo)}
          </span>
        )}
      </button>

      <p className="text-center text-xs text-neutral-500 dark:text-neutral-500">
        {paymentLink
          ? t(DICT.checkout.formStripeNote)
          : t(DICT.checkout.formMailtoNote)}
      </p>

      <p className="text-center text-xs text-neutral-500 dark:text-neutral-500">
        {t(DICT.checkout.formBookFirstPrefix)}
        <a
          href={CALENDLY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-500 dark:text-blue-400"
        >
          {t(DICT.checkout.formBookFirstLink)}
        </a>
        {t(DICT.checkout.formBookFirstSuffix)}
      </p>
    </form>
  );
}

function isLikelyEmail(s: string): boolean {
  const trimmed = s.trim();
  if (trimmed.length < 5) return false;
  // Permissive — block obvious typos but don't try to be a full
  // RFC-5322 validator.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}
