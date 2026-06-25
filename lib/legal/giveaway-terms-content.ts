export type GiveawayTermsSection = {
  id: string;
  title: string;
  paragraphs?: ReadonlyArray<string>;
  bullets?: ReadonlyArray<string>;
};

export const GIVEAWAY_TERMS_LAST_UPDATED = "June 25, 2026";

export const GIVEAWAY_TERMS = {
  metaTitle: "Giveaway Terms and Conditions",
  metaDescription:
    "Official terms and conditions for the monthly Free Basic Website + AI Chatbot giveaway on nachotsvetkov.com.",
  title: "Terms and Conditions – Monthly Free Basic Website + AI Chatbot Giveaway",
  organizer: {
    name: "Nacho Tsvetkov",
    role: "Full-Stack Software Engineer",
    location: "Sofia, Bulgaria",
    email: "nacho.tsvetkov@gmail.com",
    website: "https://nachotsvetkov.com",
  },
  giveawayPagePath: "/free-ai-audits/win-free-website",
  sections: [
    {
      id: "overview",
      title: "1. Overview",
      paragraphs: [
        "Nacho Tsvetkov is running a monthly giveaway (\"Giveaway\") where participants who complete the survey on the designated giveaway page are automatically entered for a chance to win a free basic website + AI chatbot.",
        "The goal of this Giveaway is to provide value to small business owners and showcase what is possible with modern websites and AI automation.",
      ],
    },
    {
      id: "eligibility",
      title: "2. Eligibility",
      paragraphs: ["To participate in the Giveaway, you must:"],
      bullets: [
        "Be at least 18 years old at the time of entry.",
        "Own or represent a legitimate small business (sole proprietorship, LLC, or similar).",
        "Complete the survey on the designated page in full and in good faith.",
        "Provide a valid email address for winner notification.",
      ],
    },
    {
      id: "ineligible",
      title: "The following are NOT eligible",
      bullets: [
        "Employees, contractors, or immediate family members of Nacho Tsvetkov.",
        "Residents of countries where giveaways of this type are prohibited by law.",
        "Anyone who submits duplicate, fake, or automated entries.",
      ],
      paragraphs: ["Participation is free and no purchase is necessary."],
    },
    {
      id: "how-to-enter",
      title: "3. How to Enter",
      bullets: [
        "Visit the giveaway page on nachotsvetkov.com.",
        "Complete the short survey honestly and submit it.",
        "You will receive an instant confirmation and be automatically entered into the monthly draw.",
      ],
      paragraphs: [
        "Limit: One entry per person / business per month. Multiple submissions from the same person or business will not increase chances of winning.",
      ],
    },
    {
      id: "winner-selection",
      title: "4. Winner Selection",
      bullets: [
        "Winners are selected randomly from all valid entries received during each calendar month.",
        "Number of winners: 1 to 3 winners per month (at the sole discretion of the Organizer).",
        "The draw takes place within the first 7 days of the following month.",
        "The Organizer's decision is final and binding.",
      ],
    },
    {
      id: "prize",
      title: "5. Prize",
      paragraphs: [
        "Prize: One (1) Basic Website + AI Chatbot package.",
        "What is included:",
      ],
      bullets: [
        "A simple, mobile-friendly, professional website (up to 5 pages).",
        "Basic AI chatbot that can answer common questions and help with lead capture / booking.",
        "Basic integration with a calendar or contact form.",
        "Hosting setup for the first year (or equivalent value).",
        "Delivery within approximately 5–7 business days after the winner provides all necessary content and information.",
      ],
    },
    {
      id: "prize-exclusions",
      title: "What is NOT included",
      bullets: [
        "Custom design beyond the basic professional template.",
        "E-commerce functionality (online store, payments, inventory).",
        "Advanced AI agents, voice agents, or complex automation.",
        "Ongoing maintenance, content updates, or marketing services after delivery.",
        "Domain name (winner is responsible for providing or purchasing one).",
      ],
      paragraphs: [
        "Approximate retail value: €250–€400 (depending on scope).",
        "The prize is non-transferable and cannot be exchanged for cash or other services.",
      ],
    },
    {
      id: "notification",
      title: "6. Winner Notification and Claiming the Prize",
      bullets: [
        "Winners will be notified via the email address provided in the survey within 7 days of the draw.",
        "The winner must reply within 14 days of notification to claim the prize and provide necessary business information and content.",
        "If a winner does not respond within 14 days, or provides incomplete information, the prize may be forfeited and awarded to an alternate winner.",
        "The Organizer reserves the right to verify the legitimacy of the winning entry.",
      ],
    },
    {
      id: "general",
      title: "7. General Conditions",
      bullets: [
        "By entering, you agree to these Terms and Conditions and to the decisions of the Organizer, which are final and binding.",
        "The Organizer reserves the right to cancel, suspend, or modify the Giveaway at any time for any reason, including but not limited to fraud, technical issues, or circumstances beyond reasonable control.",
        "Entries that are incomplete, illegible, fraudulent, or do not comply with these rules will be disqualified.",
        "The Giveaway is void where prohibited by law.",
      ],
    },
    {
      id: "ip",
      title: "8. Intellectual Property and Ownership",
      bullets: [
        "Upon successful delivery of the prize, the winner receives full ownership of the final website and chatbot files.",
        "Nacho Tsvetkov retains the right to use anonymized versions of the delivered work in his portfolio, case studies, and marketing materials unless the winner explicitly requests otherwise in writing.",
        "The winner is responsible for all ongoing costs related to domain, hosting (after the first year), and any third-party services.",
      ],
    },
    {
      id: "privacy",
      title: "9. Privacy",
      paragraphs: ["By entering the Giveaway, you agree that:"],
      bullets: [
        "Your name and email may be used to notify you if you win.",
        "Your survey responses may be used to improve our services (anonymized where possible).",
        "We will not sell or share your personal data with third parties for marketing purposes.",
      ],
    },
    {
      id: "liability",
      title: "10. Limitation of Liability",
      paragraphs: ["To the maximum extent permitted by law:"],
      bullets: [
        "The Organizer is not responsible for any lost, late, misdirected, or incomplete entries.",
        "The Organizer is not liable for any damages, losses, or injuries resulting from participation in the Giveaway or acceptance/use of the prize.",
        "The prize is provided \"as is\" without warranties of any kind.",
      ],
    },
    {
      id: "law",
      title: "11. Governing Law",
      paragraphs: [
        "These Terms and Conditions shall be governed by and construed in accordance with the laws of the Republic of Bulgaria. Any disputes arising from this Giveaway shall be resolved in the competent courts of Sofia, Bulgaria.",
      ],
    },
    {
      id: "contact",
      title: "12. Contact",
      paragraphs: [
        "For questions about these Terms and Conditions or the Giveaway, please contact Nacho Tsvetkov at nacho.tsvetkov@gmail.com.",
      ],
    },
  ] as ReadonlyArray<GiveawayTermsSection>,
  acknowledgment:
    "By submitting the giveaway survey, you acknowledge that you have read, understood, and agree to these Terms and Conditions.",
  footerNote:
    "This document may be updated from time to time. The version published on the website at the time of entry will apply.",
};
