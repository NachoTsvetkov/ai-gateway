// Bulgarian translations for the service catalogue + pain categories.
// Kept separate from the canonical English data in `services-data.ts`
// so:
//   - The English source stays the single source-of-truth for prices,
//     ids, structure, and order. A new service is added in EXACTLY one
//     place; this file just adds its translation overlay.
//   - Untranslated entries are not blockers — the locale resolver
//     falls back to English so a half-translated catalogue still
//     renders.
//   - One file to spot-check the BG copy quality without scrolling
//     past TypeScript types and pricing helpers.

import type { PainCategoryId, ServiceId } from "./services-data";

// What fields can be translated per service. We deliberately don't
// include `price` here — prices are numeric EUR amounts that get
// formatted at render time (and converted to USD for non-EU
// visitors); they aren't language-specific. Tier *labels* ("1-page"
// vs "3-page") get a separate translator in `lib/i18n/dict.ts` under
// `pricing.tier1Page` etc., because they're shared across the whole
// pricing renderer rather than tied to a single service.
type ServiceCopyOverride = {
  name?: string;
  pain?: string;
  solution?: string;
};

type PainCategoryCopyOverride = {
  hook?: string;
  title?: string;
  description?: string;
};

export const PAIN_CATEGORIES_BG: Record<
  PainCategoryId,
  PainCategoryCopyOverride
> = {
  "more-customers": {
    hook: "Не получавам достатъчно клиенти",
    title: "Привличане на повече клиенти",
    description:
      "Бъди намираем в Google, използвай автоматизирано контактиране и превръщай хладни контакти в качествени клиенти — дори докато спиш.",
  },
  "convert-visitors": {
    hook: "Посетителите си тръгват без да купят",
    title: "Превръщане на посетители в купувачи",
    description:
      "Хващай, квалифицирай и проследявай всеки контакт за секунди — и персонализирай преживяването, така че реално да купят.",
  },
  "save-time": {
    hook: "Давя се в повтаряща се работа",
    title: "Спри ръчната работа",
    description:
      "Автоматизирай скучните части от бизнеса си, за да върнеш часовете в работата, която реално носи приходи.",
  },
  "look-professional": {
    hook: "Онлайн присъствието ми изглежда остаряло",
    title: "Изграждане на професионално онлайн присъствие",
    description:
      "Бърз и красив сайт + плащания + поддръжка, за да ти вярват клиентите още в момента, в който те видят.",
  },
};

export const SERVICES_BG: Record<ServiceId, ServiceCopyOverride> = {
  website: {
    name: "Изработка/редизайн на адаптивен уебсайт",
    pain: "Сайтът ти изглежда остарял, зарежда се бавно на мобилен, не се класира в Google и не събира контакти.",
    solution:
      "Светкавично бързи, оптимизирани за SEO, mobile-first сайтове с форми, аналитика и резервации.",
  },
  ecommerce: {
    name: "Изграждане и персонализация на онлайн магазин",
    pain: "Хаос с наличностите, изоставени колички и ръчно обработване на поръчки, които ти изяждат маржа.",
    solution:
      "Shopify, WooCommerce или headless магазини с плащания, синхронизация на наличности и поредици за връщане на колички.",
  },
  maintenance: {
    name: "Месечна поддръжка и сигурност",
    pain: "Един ден сайтът ти пада, бива хакнат или се чупи след ъпдейт на плъгин — и няма на кого да се обадиш.",
    solution:
      "Месечен абонамент с мониторинг, бекъпи, обновления за сигурност, промени в съдържанието и приоритетна поддръжка. Спи спокойно отново.",
  },
  chatbot: {
    name: "AI чатбот и виртуален асистент за сайт",
    pain: "Клиентите ти пишат вечер и не получават отговор → губиш продажби.",
    solution:
      "24/7 интелигентен чатбот, който отговаря на въпроси, квалифицира контакти, записва срещи и дори завършва продажби директно на сайта ти.",
  },
  "marketing-automation": {
    name: "Маркетинг автоматизация",
    pain: "Изпращаш едни и същи имейли, напомняния и follow-up-и ръчно — а 70% от контактите изстиват преди да си стигнал до тях.",
    solution:
      "Имейл/SMS поредици, връщане на изоставени колички и кампании, задействани от поведение, които работят с потенциалните клиенти на автопилот.",
  },
  personalization: {
    name: "Персонализация с AI",
    pain: "Всеки посетител вижда една и съща обща начална страница — и конверсията остава на 1–2%.",
    solution:
      "AI персонализира текстовете, продуктовите препоръки и офертите в реално време според поведението на посетителя. Ръст в конверсията от 30–80% е нормален резултат.",
  },
  crm: {
    name: "Custom CRM",
    pain: "Информацията за клиентите ти живее в Excel-и, бележки и три различни inbox-а — а контактите се губят между тях.",
    solution:
      "Прост, custom CRM, направен за твоя процес — pipeline-и, напомняния и follow-up с един клик, които екипът ти реално ще ползва.",
  },
  booking: {
    name: "Онлайн резервации",
    pain: "Губиш часове всяка седмица в имейл преписки, за да насрочиш 15-минутна среща.",
    solution:
      "Брандирана страница за резервации със синхронизация с календара, депозити, автоматични напомняния и Zoom/Meet линкове — изцяло интегрирана в сайта ти.",
  },
  integrations: {
    name: "API интеграции",
    pain: "Всеки ден копираш данни между Shopify, счетоводство, доставка и CRM-а си.",
    solution:
      "Custom интеграции, които синхронизират всичко в реално време — Stripe, QuickBooks, Mailchimp, HubSpot, Twilio, каквото и да е.",
  },
  "ai-agents": {
    name: "AI агенти (автономни виртуални служители)",
    pain: "Не можеш да си позволиш асистент или продавач на пълен ден — но работата се трупа.",
    solution:
      "Custom AI агенти, които действат, не само разговарят — правят проучвания, изпращат имейли, обновяват CRM-а ти, квалифицират контакти и изпълняват задачи автономно. Един агент може да замени 20+ часа седмична работа.",
  },
  seo: {
    name: "SEO и оптимизация на конверсии",
    pain: "В Google си невидим, а малкото посетители, които идват, си тръгват за 3 секунди.",
    solution:
      "Технически SEO, корекции на Core Web Vitals, ориентирани към конверсия текстове и A/B тествани CTA-та, които превръщат трафика в клиенти.",
  },
  "voice-agents": {
    name: "AI lead generation и гласови агенти",
    pain: "Студените обаждания са мъртви, екипът ти мрази телефона, а входящите контакти изчезват, ако не им се обадиш в първите 5 минути.",
    solution:
      "AI гласови агенти, които се обаждат, квалифицират, записват срещи и поемат входящи обаждания 24/7 — със звучащи естествено гласове.",
  },
};
