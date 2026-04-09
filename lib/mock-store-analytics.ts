function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const PRODUCT_NAMES = [
  "Classic Leather Backpack",
  "Minimalist Watch - Midnight",
  "Wireless Noise-Cancelling Headphones",
  "Organic Cotton Crew Neck Tee",
  "Ceramic Pour-Over Coffee Set",
  "Ultralight Running Shoes",
  "Bamboo Sunglasses - Coastal",
  "Smart Water Bottle - 750ml",
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateDailyRevenue() {
  const rand = seededRandom(42);
  return Array.from({ length: 30 }, (_, i) => {
    const base = 1200 + rand() * 2800;
    const weekday = new Date(daysAgo(29 - i)).getDay();
    const weekendBoost = weekday === 0 || weekday === 6 ? 1.3 : 1;
    return {
      date: daysAgo(29 - i),
      revenue: Math.round(base * weekendBoost * 100) / 100,
      orders: Math.round(8 + rand() * 22),
    };
  });
}

function generateTopProducts() {
  const rand = seededRandom(99);
  return PRODUCT_NAMES.map((name) => {
    const unitsSold = Math.round(15 + rand() * 120);
    const price = Math.round(25 + rand() * 275);
    return {
      name,
      unitsSold,
      revenue: unitsSold * price,
      conversionRate: Math.round((2.5 + rand() * 6) * 10) / 10,
    };
  }).sort((a, b) => b.revenue - a.revenue);
}

function generateCustomerSegments() {
  return [
    { segment: "New visitors", sessions: 4820, conversionRate: 2.1, avgOrderValue: 68 },
    { segment: "Returning customers", sessions: 1930, conversionRate: 5.8, avgOrderValue: 112 },
    { segment: "Email subscribers", sessions: 860, conversionRate: 7.2, avgOrderValue: 134 },
    { segment: "Social referrals", sessions: 2140, conversionRate: 1.9, avgOrderValue: 54 },
    { segment: "Organic search", sessions: 3600, conversionRate: 3.4, avgOrderValue: 87 },
  ];
}

export const MOCK_ANALYTICS = {
  storeName: "AI Shopify Demo Store",
  period: `${daysAgo(29)} to ${daysAgo(0)}`,
  summary: {
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    conversionRate: 3.6,
    returningCustomerRate: 28.4,
  },
  dailyRevenue: generateDailyRevenue(),
  topProducts: generateTopProducts(),
  customerSegments: generateCustomerSegments(),
  recentTrends: [
    "Watch category conversions dropped 18% week-over-week — possible pricing issue or seasonal slowdown.",
    "Email subscriber segment has the highest AOV ($134) — consider a VIP loyalty campaign.",
    "Weekend revenue averages 30% higher than weekdays — optimize ad spend for Fri-Sun.",
    "Organic Cotton Tee has the best conversion rate (7.8%) despite lower traffic — consider promoting.",
    "Headphones are top revenue driver but conversion rate is below average — funnel may need optimization.",
  ],
};

const daily = MOCK_ANALYTICS.dailyRevenue;
MOCK_ANALYTICS.summary.totalRevenue =
  Math.round(daily.reduce((s, d) => s + d.revenue, 0) * 100) / 100;
MOCK_ANALYTICS.summary.totalOrders = daily.reduce((s, d) => s + d.orders, 0);
MOCK_ANALYTICS.summary.avgOrderValue =
  Math.round(
    (MOCK_ANALYTICS.summary.totalRevenue / MOCK_ANALYTICS.summary.totalOrders) *
      100,
  ) / 100;

export function formatAnalyticsForPrompt(): string {
  const a = MOCK_ANALYTICS;
  const last7 = a.dailyRevenue.slice(-7);
  const prev7 = a.dailyRevenue.slice(-14, -7);
  const last7Rev = last7.reduce((s, d) => s + d.revenue, 0);
  const prev7Rev = prev7.reduce((s, d) => s + d.revenue, 0);
  const weekOverWeek =
    prev7Rev > 0
      ? ((last7Rev - prev7Rev) / prev7Rev * 100).toFixed(1)
      : "N/A";

  return `STORE ANALYTICS — ${a.storeName}
Period: ${a.period}

SUMMARY:
- Total revenue: $${a.summary.totalRevenue.toLocaleString()}
- Total orders: ${a.summary.totalOrders}
- Avg order value: $${a.summary.avgOrderValue}
- Store conversion rate: ${a.summary.conversionRate}%
- Returning customer rate: ${a.summary.returningCustomerRate}%
- Revenue trend (last 7d vs prev 7d): ${weekOverWeek}%

DAILY REVENUE (last 30 days):
${a.dailyRevenue.map((d) => `${d.date}: $${d.revenue.toFixed(2)} (${d.orders} orders)`).join("\n")}

TOP PRODUCTS:
${a.topProducts.map((p, i) => `${i + 1}. ${p.name} — ${p.unitsSold} units, $${p.revenue.toLocaleString()} revenue, ${p.conversionRate}% CVR`).join("\n")}

CUSTOMER SEGMENTS:
${a.customerSegments.map((s) => `- ${s.segment}: ${s.sessions} sessions, ${s.conversionRate}% CVR, $${s.avgOrderValue} AOV`).join("\n")}

RECENT TRENDS & INSIGHTS:
${a.recentTrends.map((t) => `• ${t}`).join("\n")}`;
}
