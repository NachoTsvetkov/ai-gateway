import { wrapReportHtml } from "../lib/report-email-template";
import { buildDeliveryEmailText } from "../lib/report-delivery-email";
import { renderReportPdf } from "../lib/report-pdf";

async function main() {
  const html = wrapReportHtml({
    subject: "Test",
    kicker: "Personalized AI Opportunity Report",
    headline: "Exploring AI for Test Business",
    businessName: "Test Business",
    sections: [
      { title: "Introduction", bodyHtml: "<p>Thank you for your survey.</p>", bullets: [] },
      { title: "Your Current Situation", bodyHtml: "<p>Current state.</p>", bullets: [] },
      { title: "Key Opportunities I See", bodyHtml: "<p>Opportunities.</p>", bullets: ["Opportunity one"] },
      {
        title: 'Recommended AI Solutions',
        bodyHtml: '<p>Solutions.</p>',
        bullets: [
          '<li><strong>Custom AI Chatbots</strong>: Engage visitors and guide them toward conversion.</li>',
          'Marketing automation: Optimize campaigns with moderate setup effort.',
        ],
      },
      { title: "Quick Wins You Could Implement", bodyHtml: "<p>Quick wins.</p>", bullets: ["Template emails"] },
      { title: "Potential Business Impact", bodyHtml: "<p>Impact.</p>", bullets: [] },
      { title: "Recommended Next Steps", bodyHtml: "<p>Book a call.</p>", bullets: [] },
    ],
  });

  const emailText = buildDeliveryEmailText({
    firstName: 'Nacho',
    businessLabel: 'your business',
    attachmentFileName: 'AI-Opportunity-Report.pdf',
  });

  console.log("Email preview (first 200 chars):", emailText.slice(0, 200) + "…");
  console.log("Generating PDF…");
  const buf = await renderReportPdf(html);
  console.log("PDF OK —", buf.length, "bytes");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
