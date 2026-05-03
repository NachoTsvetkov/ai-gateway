// POST /api/paypal/capture-order
//
// Called from the Smart Buttons `onApprove` callback after the buyer
// authorizes the payment in the PayPal popup. Captures the funds and
// returns a sanitized success payload to the client. The client then
// redirects to /checkout/success?type=order&id=<orderId>.
//
// We intentionally do NOT echo the full PayPal response back to the
// client (it contains payer email + name + capture id, which the
// client doesn't need). Instead we log the capture id server-side so
// it lives in our request logs.

import { NextResponse } from "next/server";
import { captureOrder } from "lib/paypal/orders";
import { PayPalApiError } from "lib/paypal/client";

type CaptureOrderBody = { orderId: string };

function isValidBody(x: unknown): x is CaptureOrderBody {
  return (
    !!x &&
    typeof x === "object" &&
    typeof (x as Partial<CaptureOrderBody>).orderId === "string" &&
    (x as CaptureOrderBody).orderId.length > 0
  );
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (!isValidBody(body)) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  try {
    const captured = await captureOrder(body.orderId);
    const captureId = captured.purchase_units?.[0]?.payments?.captures?.[0]?.id;
    const amount = captured.purchase_units?.[0]?.amount;
    console.log(
      `[paypal] captured order ${captured.id} (capture=${captureId}, ` +
        `amount=${amount?.value} ${amount?.currency_code}, ` +
        `payer=${captured.payer?.email_address ?? "?"})`,
    );
    return NextResponse.json({
      ok: true,
      orderId: captured.id,
      status: captured.status,
    });
  } catch (err) {
    if (err instanceof PayPalApiError) {
      console.error(
        `[paypal] capture ${body.orderId} → ${err.status}`,
        err.body,
      );
      return NextResponse.json(
        { error: "capture_failed", status: err.status },
        { status: 502 },
      );
    }
    console.error("[paypal] unexpected capture error:", err);
    return NextResponse.json({ error: "capture_failed" }, { status: 500 });
  }
}
