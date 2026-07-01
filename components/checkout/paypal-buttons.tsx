"use client";

// PayPal Smart Buttons — the only client-side payment surface. The
// server creates the order/subscription, the SDK drives the popup,
// the server captures on approve. We never expose the PayPal secret
// here, only the public client id.
//
// Two modes:
//   - kind="order"        → calls /api/paypal/create-order  + /capture-order
//   - kind="subscription" → calls /api/paypal/create-subscription (PayPal
//                           captures the first month immediately, no
//                           explicit /capture step from us).
//
// The component validates the form fields (name/email/business required)
// before allowing the buttons to act, mirroring the form's `required`
// HTML attributes. PayPal also blocks if `createOrder` throws, so a
// missing field surfaces as a UX message in the form, not a popup.

import { useEffect, useMemo, useState } from "react";
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
  type ReactPayPalScriptOptions,
  type PayPalButtonsComponentProps,
} from "@paypal/react-paypal-js";
import type { Currency } from "lib/currency";
import { type Locale, createT, DEFAULT_LOCALE } from "lib/i18n/locale";
import { DICT } from "lib/i18n/dict";

export type PayPalButtonsKind = "order" | "subscription";

export type CheckoutCustomerInput = {
  name: string;
  business: string;
  email: string;
  phone?: string;
  notes?: string;
};

type Props = {
  clientId: string;
  /** Sandbox vs live drives the SDK's environment + currency-supported
   *  list. We pass it explicitly rather than reading from the bundled
   *  client to keep this component reusable in unit tests. */
  env: "sandbox" | "live";
  currency: Currency;
  locale?: Locale;
  kind: PayPalButtonsKind;
  /** Search params encoding the buyable (bundle/service/tier/upsells)
   *  — the API rebuilds the buyable from this and never trusts client
   *  totals. */
  searchParams: {
    bundle?: string;
    service?: string;
    tier?: string;
    product?: string;
    upsells?: string;
  };
  /** Live values from the form. Wrapped in a getter so each PayPal
   *  callback sees the current state without re-rendering the SDK. */
  getCustomer: () => CheckoutCustomerInput;
  /** Re-checked on each click. Returning false blocks the popup with
   *  no error toast so the form's own validation message shows. */
  isFormValid: () => boolean;
  /** Called after a successful capture / approval. Hands back PayPal's
   *  id so the caller can redirect to /checkout/success?id=…. */
  onSuccess: (args: {
    kind: PayPalButtonsKind;
    id: string;
  }) => void;
  /** Surfaced inline so the form can render a localized error message. */
  onError?: (message: string) => void;
};

export function PayPalCheckoutButtons(props: Props) {
  const { clientId, env, currency, kind, locale = DEFAULT_LOCALE } = props;

  // SDK options. `intent=capture` for orders, `intent=subscription` for
  // subscriptions — passing the wrong one leads to a runtime warning
  // from the SDK so we keep them in lockstep with `kind`.
  const scriptOptions: ReactPayPalScriptOptions = useMemo(
    () => ({
      clientId,
      currency,
      // `disable-funding=credit,card` would hide the card surcharge
      // line; we leave defaults so card payments work without a PayPal
      // account.
      intent: kind === "order" ? "capture" : "subscription",
      // Subscriptions REQUIRE the `vault=true` + `intent=subscription`
      // combo per PayPal docs; orders don't need vault.
      vault: kind === "subscription",
      components: "buttons",
      // PayPal infers locale from currency by default, but we force it
      // so a Bulgarian visitor on USD pricing still sees Bulgarian
      // labels in the popup chrome.
      locale: locale === "bg" ? "bg_BG" : "en_US",
      // Sandbox vs live is implicit in the client-id, but the SDK
      // exposes a debug flag that's only useful on sandbox.
      debug: env === "sandbox",
    }),
    [clientId, currency, kind, locale, env],
  );

  return (
    <PayPalScriptProvider options={scriptOptions}>
      <ButtonsInner {...props} />
    </PayPalScriptProvider>
  );
}

function ButtonsInner({
  currency,
  kind,
  searchParams,
  getCustomer,
  isFormValid,
  onSuccess,
  onError,
  locale = DEFAULT_LOCALE,
}: Omit<Props, "clientId" | "env">) {
  const t = createT(locale);
  const [{ isPending, isRejected }] = usePayPalScriptReducer();

  // Re-mount the buttons when the buyable's search params or currency
  // changes, so the SDK reissues a fresh order/subscription call. The
  // SDK itself caches the createOrder return; cycling the key forces it
  // to forget the previous id.
  const buttonsKey = useMemo(
    () =>
      `${kind}|${currency}|${JSON.stringify(searchParams)}`,
    [kind, currency, searchParams],
  );

  // Pre-flight gate. PayPal's SDK opens the popup BEFORE calling
  // createOrder/createSubscription. If we throw inside those callbacks,
  // the SDK closes the popup immediately — which presents to the user
  // as a flash of an empty window.
  //
  // `onClick` runs synchronously before the popup is spawned. Returning
  // `actions.reject()` here cancels the click without ever opening a
  // popup, so a buyer who clicks before filling the form just sees the
  // form's own validation messages light up — no popup flash.
  const handleClick: NonNullable<PayPalButtonsComponentProps["onClick"]> = (
    _data,
    actions,
  ) => {
    if (!isFormValid()) {
      return actions.reject();
    }
    return actions.resolve();
  };

  const handleCreateOrder: NonNullable<PayPalButtonsComponentProps["createOrder"]> = async () => {
    return await callPayPalApi(
      "/api/paypal/create-order",
      { searchParams, customer: getCustomer() },
      "create_order_failed",
    );
  };

  const handleCreateSubscription: NonNullable<
    PayPalButtonsComponentProps["createSubscription"]
  > = async () => {
    return await callPayPalApi(
      "/api/paypal/create-subscription",
      { searchParams, customer: getCustomer() },
      "create_subscription_failed",
    );
  };

  const handleApprove: NonNullable<PayPalButtonsComponentProps["onApprove"]> = async (data) => {
    if (kind === "order") {
      // Capture is the high-stakes call: the buyer has already
      // approved in PayPal, the money is authorised, and we MUST
      // capture or lose the funds. So we surface the dedicated
      // "approved-but-capture-failed" copy regardless of the
      // underlying error code, and re-throw so the SDK keeps the
      // error state visible.
      let captureRes: Response;
      try {
        captureRes = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data.orderID }),
        });
      } catch (err) {
        console.error("[paypal] network error capturing order:", err);
        onError?.(t(DICT.checkout.paypalErrorCapture));
        throw new Error("network_error");
      }
      if (!captureRes.ok) {
        const text = await captureRes.text();
        console.error(
          `[paypal] capture-order → HTTP ${captureRes.status}. Body:\n${text.slice(0, 500)}`,
        );
        onError?.(t(DICT.checkout.paypalErrorCapture));
        throw new Error(`capture_failed_${captureRes.status}`);
      }
      onSuccess({ kind: "order", id: data.orderID });
    } else {
      // Subscriptions are auto-activated by PayPal once the buyer
      // approves — no /capture call needed. The subscriptionID is
      // already live + scheduled.
      const subId = data.subscriptionID ?? "";
      onSuccess({ kind: "subscription", id: subId });
    }
  };

  if (isRejected) {
    return (
      <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
        {t(DICT.checkout.paypalErrorScript)}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {isPending && (
        <p className="text-center text-sm text-neutral-500">
          {t(DICT.checkout.paypalLoading)}
        </p>
      )}
      {/* Visual frame around the PayPal SDK iframe.
       *
       * The SDK renders its buttons into an iframe whose internal
       * surface is hard-coded white — we can't theme it. Without a
       * frame, that white block looks like a render glitch when the
       * surrounding form is dark (neutral-900). Wrapping it in a
       * white rounded card with padding and a subtle ring turns the
       * clash into an intentional "payment widget" card that reads
       * the same in light and dark mode.
       *
       * Padding sized so the SDK's own internal margins don't bunch
       * against the card edge; the SDK draws "Powered by PayPal"
       * underneath and we want it to breathe. */}
      <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-neutral-200 sm:p-4 dark:ring-neutral-700">
        <PayPalButtons
          key={buttonsKey}
          style={{
            // Pill-shaped, dark gold — matches the rest of the site's
            // rounded-full CTA buttons. Layout `vertical` so PayPal +
            // Pay-Later + Card stack on small screens.
            shape: "pill",
            color: "gold",
            layout: "vertical",
            label: kind === "subscription" ? "subscribe" : "paypal",
          }}
          onClick={handleClick}
          createOrder={kind === "order" ? handleCreateOrder : undefined}
          createSubscription={
            kind === "subscription" ? handleCreateSubscription : undefined
          }
          onApprove={handleApprove}
          onError={(err) => {
            // The SDK calls onError with whatever our createOrder /
            // createSubscription / onApprove handler threw. We
            // normalise to a stable code in callPayPalApi (above) so
            // here we can pick a useful localized message instead of
            // a single "something went wrong" for everything.
            console.error("[paypal] buttons onError:", err);
            const code =
              err instanceof Error && typeof err.message === "string"
                ? err.message
                : "";
            onError?.(messageForErrorCode(code, t));
          }}
          onCancel={() => {
            // No-op — buyer closed the popup. The form stays as-is.
          }}
        />
      </div>
    </div>
  );
}

// Shared POST helper for /api/paypal/* endpoints. Centralises:
//
//   - Network-error vs HTTP-error vs JSON-parse-error distinction
//     (was previously collapsed into one opaque throw).
//   - Console diagnostics — we log the path, status, full response
//     text, and request payload context. When a buyer reports an
//     error, this is the only artefact we have to debug from.
//   - Single body read. Calling `.json()` after `.text()` (or vice
//     versa) on the same Response throws "body stream already read",
//     which can produce confusing JSON.parse frames in the stack.
//
// Returns the `id` from a `{ id: string }` JSON body. Anything else
// — non-2xx, network failure, malformed JSON — surfaces as an Error
// whose `.message` is a stable machine code (e.g. "network_error",
// "create_subscription_failed"). The user-facing copy is mapped from
// that code in the parent form, so both the SDK's iframe and our
// inline error region stay consistent.
async function callPayPalApi(
  path: string,
  body: Record<string, unknown>,
  fallbackErrorCode: string,
): Promise<string> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error(`[paypal] network error → ${path}:`, err);
    throw new Error("network_error");
  }

  // Read once, parse once.
  const text = await res.text();

  if (!res.ok) {
    console.error(
      `[paypal] ${path} → HTTP ${res.status}. Body:\n${text.slice(0, 500)}`,
    );
    let serverErrorCode: string | undefined;
    try {
      const parsed = JSON.parse(text) as { error?: unknown };
      if (typeof parsed.error === "string") serverErrorCode = parsed.error;
    } catch {
      // Body wasn't JSON (HTML error page from a transient dev-server
      // recompile, an upstream edge proxy 5xx, etc.). Keep going with
      // the fallback code so the buyer sees a friendly message.
    }
    throw new Error(serverErrorCode ?? fallbackErrorCode);
  }

  try {
    const data = JSON.parse(text) as { id?: unknown };
    if (typeof data.id !== "string" || data.id.length === 0) {
      console.error(`[paypal] ${path} → 200 but missing id. Body:`, text);
      throw new Error("invalid_response");
    }
    return data.id;
  } catch (err) {
    if (err instanceof Error && err.message === "invalid_response") throw err;
    console.error(
      `[paypal] ${path} → 200 but body was not JSON:\n${text.slice(0, 500)}`,
    );
    throw new Error("invalid_response");
  }
}

// Map the stable machine codes thrown from `callPayPalApi` (or by our
// API routes themselves — they share the same vocabulary) to a
// localized user-facing message. Anything we don't recognise falls
// back to the generic "something went wrong" copy so the buyer never
// sees a raw code like `create_subscription_failed` in the UI.
function messageForErrorCode(
  code: string,
  t: ReturnType<typeof createT>,
): string {
  switch (code) {
    case "network_error":
      return t(DICT.checkout.paypalErrorNetwork);
    case "plan_not_configured":
      return t(DICT.checkout.paypalErrorPlanMissing);
    case "unknown_buyable":
    case "buyable_is_one_time":
    case "buyable_requires_subscription":
    case "invalid_body":
    case "invalid_json":
      return t(DICT.checkout.paypalErrorBadRequest);
    case "invalid_response":
      return t(DICT.checkout.paypalErrorBadResponse);
    default:
      return t(DICT.checkout.paypalErrorGeneric);
  }
}

// ----------------------------------------------------------------------
// Standalone pre-flight check
// ----------------------------------------------------------------------
// 
// Hook that returns whether the PayPal buttons can render at all.
// Used by the checkout form to decide between PayPal vs the mailto
// fallback in a single place. We depend on the buttons themselves to
// surface SDK errors (above) so this stays a cheap config check.

export function usePayPalReady(clientId: string | undefined): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(typeof clientId === "string" && clientId.length > 0);
  }, [clientId]);
  return ready;
}
