// Centralised UI dictionary. Every short, decoration-only string that
// appears in the marketing site lives here so:
//
//   - One place to add a new locale (Bulgarian today; possibly more
//     later) without grep-and-replacing across 1500-line page files.
//   - One place to spot-check the BG copy quality.
//   - Pages stay focused on layout/composition; the strings sit in
//     this file as data.
//
// Long-form, content-heavy strings (service descriptions, FAQ
// answers, bundle taglines, pain-point lists) live next to their
// data: `lib/services-data.bg.ts`, `lib/service-details.bg.ts`,
// `lib/bundles-data.bg.ts`. That keeps each translation co-located
// with the structural shape it overlays.

import type { LocalizedString } from "./locale";

// Short helper to keep the dictionary readable. Forces every entry to
// have BOTH locales — TypeScript would otherwise let us forget the
// `bg` key on a fresh entry.
const s = (en: string, bg: string): LocalizedString => ({ en, bg });

export const DICT = {
  // -------------------------------------------------------------------
  // Navbar — sticky at top of every marketing page
  // -------------------------------------------------------------------
  nav: {
    moneyGenerator: s(
      "Get More Clients",
      "Повече клиенти",
    ),
    forSmallBusinesses: s("for Small Businesses", "за малък бизнес"),
    services: s("Services", "Услуги"),
    projects: s("Projects", "Проекти"),
    home: s("Home", "Начало"),
    bookCall: s("Book Discovery Call", "Запази безплатен разговор"),
    bookCallShort: s("Book Call", "Запази"),
    bookCallTiny: s("Book", "Запази"),
    siteNavigation: s("Site navigation", "Навигация"),
    openMenu: s("Open navigation menu", "Отвори меню"),
    closeMenu: s("Close navigation menu", "Затвори меню"),
  },

  // -------------------------------------------------------------------
  // Language toggle — only rendered for BG visitors
  // -------------------------------------------------------------------
  langToggle: {
    label: s("Language", "Език"),
    switchToEn: s("Switch to English", "Превключи на английски"),
    switchToBg: s("Switch to Bulgarian", "Превключи на български"),
  },

  // -------------------------------------------------------------------
  // Common CTAs that appear in many places
  // -------------------------------------------------------------------
  cta: {
    bookDiscoveryCall: s(
      "Book Discovery Call",
      "Запази безплатен разговор",
    ),
    bookFree15Min: s(
      "Book a free 15-min call",
      "Запази безплатен 15-минутен разговор",
    ),
    book15MinTalk: s(
      "Book 15-min Discovery Call",
      "Запази 15-минутен разговор",
    ),
    seeBundles: s("See bundles", "Виж пакетите"),
    seeBundleSavings: s(
      "See bundles (save 60%+)",
      "Виж пакетите (-60%+)",
    ),
    seeMoneyBundles: s(
      "See the Startup Bundle",
      "Виж Startup пакета",
    ),
    enterGiveaway: s(
      "Enter the Monthly Giveaway",
      "Влез в месечната томбола",
    ),
    talkFirst: s(
      "Or talk first — book a 15-min call",
      "Или първо да поговорим — запази 15-минутен разговор",
    ),
    backToServices: s("← Back to all services", "← Към всички услуги"),
    backToBundle: s("Back to the bundle", "Към пакета"),
    backLabel: s("Back", "Назад"),
    seeDetails: s("See details", "Виж детайли"),
    viewBundleIncludes: s(
      "View what's included →",
      "Виж какво включва →",
    ),
    viewServiceDetails: s(
      "View service details →",
      "Виж детайли за услугата →",
    ),
    emailMe: s("Or email me directly", "Или ми пиши директно"),
  },

  // -------------------------------------------------------------------
  // Shared "Available" status pill
  // -------------------------------------------------------------------
  status: {
    availableForProjects: s(
      "Available for new projects",
      "Свободен за нови проекти",
    ),
  },

  // -------------------------------------------------------------------
  // Homepage — hero through final CTA
  // -------------------------------------------------------------------
  home: {
    heroLine1: s(
      "Get More Clients While You Sleep",
      "Повече клиенти, докато спиш",
    ),
    heroSubheadlineBefore: s(
      "Professional website + AI chatbot that qualifies leads and books appointments 24/7. Starting at",
      "Професионален сайт + AI чатбот, който квалифицира клиенти и резервира срещи 24/7. От",
    ),
    heroSubheadlineAfter: s(
      ". Delivered in 5–7 days. No tech skills required.",
      ". Доставка за 5–7 дни. Без технически умения.",
    ),
    heroFooter: s(
      "Sofia, Bulgaria · remote worldwide · delivered in 5–7 business days",
      "София, България · работа от разстояние · доставка за 5–7 работни дни",
    ),
    whatHappensNextKicker: s("What happens next", "Какво следва"),
    whatHappensNextHeadline: s(
      "Simple process — no tech skills required",
      "Прост процес — без технически умения",
    ),

    beforeAfterKicker: s("The shift", "Промяната"),
    beforeAfterHeadline: s(
      "Most Small Businesses Are Stuck Here…",
      "Повечето малки бизнеси са заседнали тук…",
    ),
    beforeAfterRealityTitle: s(
      "The reality most website builders won't tell you",
      "Реалността, която повечето уеб студиа не казват",
    ),
    beforeAfterReality1: s(
      "Slow, outdated websites lose leads every day",
      "Бавните, остарели сайтове губят клиенти всеки ден",
    ),
    beforeAfterReality2: s(
      "Manual follow-ups waste hours every week",
      "Ръчните последващи стъпки губят часове всяка седмица",
    ),
    beforeAfterReality3: s(
      "Competitors with AI book clients while you sleep",
      "Конкурентите с AI резервират клиенти, докато спиш",
    ),
    beforeAfterSmartTitle: s(
      "What smart businesses are moving to",
      "Към какво преминават умните бизнеси",
    ),
    beforeAfterSmart: s(
      "Modern fast websites + AI that works 24/7",
      "Бързи модерни сайтове + AI, който работи 24/7",
    ),

    benefitsKicker: s("What you get", "Какво получаваш"),
    benefitsHeadline: s(
      "Everything You Need to Capture Leads Around the Clock",
      "Всичко, за да уловиш клиенти денонощно",
    ),

    trustResultsKicker: s("Real results", "Реални резултати"),
    trustResultsHeadline: s(
      "Business Owners Who Stopped Losing Leads",
      "Собственици, които спряха да губят клиенти",
    ),
    trustResult1: s(
      "+340% bookings for a local fitness studio",
      "+340% резервации за фитнес студио",
    ),
    trustResult2: s(
      "2× conversion rate for an e-commerce store",
      "2× конверсия за e-commerce магазин",
    ),
    trustResult3: s(
      "28% cart recovery for a fashion brand",
      "28% възстановени колички за моден бранд",
    ),

    aboutKicker: s("About", "За мен"),
    aboutHeadline: s(
      "I’m Nacho Tsvetkov, Full-Stack Software Engineer with 20+ years building production systems for e-commerce, fintech, and startups.",
      "Аз съм Начо Цветков, Full-Stack софтуерен инженер с 20+ години опит в изграждане на продукционни системи за e-commerce, финтех и стартъпи.",
    ),
    aboutP1: s(
      "I used to build complex enterprise tools. Now I focus exclusively on small business owners and early-stage startups who are tired of wasting time on manual tasks, losing sales to slow websites, and watching competitors automate while they stay stuck.",
      "Преди работих по сложни корпоративни системи. Днес работя само с малки бизнеси и стартъпи, които са се изморили да губят време в ръчна работа, да губят клиенти заради бавен сайт и да гледат как конкурентите им автоматизират, а те стоят на едно място.",
    ),
    aboutSpecialtyLabel: s("My specialty:", "Моята специалност:"),
    aboutSpecialty: s(
      "fast, affordable solutions that combine modern web tech with smart automation — so you get 24/7 revenue systems, higher conversions, and real time back in your day.",
      "бързи и достъпни решения, които съчетават модерни уеб технологии с интелигентна автоматизация — за да получиш 24/7 машина за приходи, по-висока конверсия и реално време обратно в деня си.",
    ),
    statExperience: s("Experience", "Опит"),
    statExperienceValue: s("20+ yrs", "20+ г."),
    statProjects: s("Projects", "Проекти"),
    statAvgDelivery: s("Avg. delivery", "Доставка"),
    statAvgDeliveryValue: s("< 2 wks", "< 2 седм."),

    bundlesKicker: s("Bundles", "Пакети"),
    bundlesHeadline: s(
      "Choose the System That Matches Where Your Business Is",
      "Избери системата, която пасва на етапа на бизнеса",
    ),
    bundlesRecommendation: s(
      "Most small businesses starting out choose the Startup Bundle. Growing businesses usually go with Scale-Up.",
      "Повечето малки бизнеси започват със Startup пакета. Растящите бизнеси обикновено избират Scale-Up.",
    ),
    bundlesIntro1: s("Each bundle costs roughly", "Всеки пакет струва около"),
    bundlesIntroMid: s(
      "1/3 of buying everything separately",
      "1/3 от цената, ако купуваш всичко поотделно",
    ),
    bundlesIntroEnd: s(
      ". The retainer keeps everything alive, secure, and improving every month.",
      ". Месечният абонамент поддържа всичко живо, защитено и подобряващо се всеки месец.",
    ),
    bundlesMostPopular: s("Most popular", "Най-избиран"),
    bundlesOneTime: s("one-time", "еднократно"),
    bundlesOneTimePlus: s(
      "one-time + ",
      "еднократно + ",
    ),
    bundlesPerMonthRetainer: s("/month retainer", "/месец абонамент"),
    bundlesRoiLabel: s("ROI:", "Възвръщаемост:"),
    bundlesRoiSuffix: s("Buying separately:", "Поотделно:"),
    bundlesFreeBadge: s("Free", "Безплатно"),
    bundlesCustomNeed: s(
      "Need something custom?",
      "Имаш нужда от нещо по-различно?",
    ),
    bundlesCustomCta: s(
      "Tell me on a 15-min call →",
      "Кажи ми на 15-минутен разговор →",
    ),
    bundlesGuaranteeHeadline: s(
      "Delivered in 5–7 business days — or your one-time fee back",
      "Доставка за 5–7 работни дни — или възстановяване на еднократната сума",
    ),
    bundlesGuaranteeBody: s(
      "Clear scope before we start. If we miss the agreed deadline without a mutually agreed extension, you get a full refund of the one-time fee.",
      "Ясен обхват преди старт. Ако пропуснем срока без споразумено удължение, получаваш пълно възстановяване на еднократната сума.",
    ),

    servicesKicker: s("À la carte", "По избор"),
    servicesHeadline: s(
      "Don't want a bundle? Start with one of these.",
      "Не искаш пакет? Започни с някоя от тези услуги.",
    ),
    servicesIntro: s(
      "The three single services most small businesses pick first. Every line item is fixed-price, fixed-scope, and ships in days.",
      "Трите услуги, с които повечето малки бизнеси започват. Всяка е с фиксирана цена, фиксиран обхват и се доставя за дни.",
    ),
    servicesPainLabel: s("Pain:", "Проблем:"),
    servicesBrowseAll: s(
      "Browse all 12 services",
      "Разгледай всички 12 услуги",
    ),
    servicesGroupedBy: s(
      "Grouped by the pain they solve — find yours in seconds.",
      "Групирани по проблема, който решават — намери твоя за секунди.",
    ),

    resultsKicker: s("Proven Results", "Реални резултати"),
    resultsHeadline: s(
      "Real Projects, Real Numbers",
      "Реални проекти, реални числа",
    ),
    resultsSeeAll: s("See all projects", "Виж всички проекти"),
    resultsSeeAllNote: s(
      "Includes a production RAG demo (hybrid retrieval + evaluation) plus storefront and agent demos.",
      "Включва production RAG демо (хибридно търсене + evaluation) плюс демота за магазини и агенти.",
    ),
    resultsRagLink: s(
      "Technical demo: Production RAG over an SRE / DevOps knowledge base",
      "Техническо демо: Production RAG върху SRE / DevOps база знания",
    ),

    processKicker: s("Process", "Процес"),
    processHeadline: s("How It Works", "Как работи"),

    testimonialsKicker: s("Clients", "Клиенти"),
    testimonialsHeadline: s("What People Say", "Какво казват клиентите"),

    faqKicker: s("FAQ", "Често задавани въпроси"),
    faqHeadline: s("Quick Answers", "Бързи отговори"),

    finalHeadline: s(
      "Stop losing money to slow tech and manual work.",
      "Спри да губиш пари заради бавен сайт и ръчна работа.",
    ),
    finalSub: s(
      "Book a free 15-minute discovery call — or enter the monthly giveaway for a free website + AI chatbot.",
      "Запази безплатен 15-минутен разговор — или влез в месечната томбола за безплатен сайт + AI чатбот.",
    ),
    finalNote: s(
      "Most calls booked today get a proposal back tomorrow.",
      "Повечето разговори днес получават оферта на следващия ден.",
    ),
    footerRights: s("All rights reserved.", "Всички права запазени."),
    footerLocation: s("Sofia, Bulgaria", "София, България"),
  },

  // -------------------------------------------------------------------
  // Homepage — featured project cards (3-up case studies)
  // -------------------------------------------------------------------
  caseStudies: {
    badgeLive: s("Live demo", "Демо на живо"),
    fitnessTitle: s("Local Fitness Studio", "Локално фитнес студио"),
    fitnessSummary: s(
      "AI booking flow + chatbot replaced the front desk after hours. Members self-serve from any device.",
      "AI резервации и чатбот заместиха рецепцията извън работно време. Членовете се записват сами от всякакво устройство.",
    ),
    fitnessMetric: s(
      "+340% bookings · 0 missed calls",
      "+340% резервации · 0 пропуснати обаждания",
    ),
    fitnessCta: s("See live demo", "Виж демо"),
    shopTitle: s(
      "AI-Powered Shopify Store",
      "Shopify магазин с AI",
    ),
    shopSummary: s(
      "Headless Next.js storefront with real-time AI recommendations, intelligent chatbot with Add to Cart, and seamless Shopify integration.",
      "Headless Next.js магазин с AI препоръки в реално време, интелигентен чатбот с „Add to Cart“ и пълна интеграция с Shopify.",
    ),
    shopMetric: s(
      "2× conversion rate · 4× faster page load",
      "2× по-висока конверсия · 4× по-бързо зареждане",
    ),
    shopCta: s("Open the live shop", "Отвори магазина"),
    boutiqueTitle: s("Boutique Fashion Brand", "Бутикова модна марка"),
    boutiqueSummary: s(
      "AI personalization on product pages + abandoned-cart recovery sequences across email and SMS. Bulgarian-language demo.",
      "AI персонализация на продуктовите страници + поредици за изоставена количка през имейл и SMS. Демо на български.",
    ),
    boutiqueMetric: s(
      "28% cart recovery · +19% AOV",
      "28% върнати колички · +19% средна поръчка",
    ),
    boutiqueCta: s("See live demo", "Виж демо"),
  },

  // -------------------------------------------------------------------
  // Homepage — "How It Works" 4-step list
  // -------------------------------------------------------------------
  steps: {
    s1Title: s(
      "Free 15-min discovery call",
      "Безплатен 15-минутен разговор",
    ),
    s1Body: s(
      "We map your goals, biggest leaks, and quickest wins. No pressure, no jargon.",
      "Намираме целите ти, най-големите дупки и най-бързите печалби. Без натиск, без жаргон.",
    ),
    s2Title: s(
      "Custom proposal in 24h",
      "Персонална оферта до 24 часа",
    ),
    s2Body: s(
      "Fixed scope, fixed price, fixed timeline. You know exactly what you're paying for.",
      "Фиксиран обхват, фиксирана цена, фиксиран срок. Знаеш точно за какво плащаш.",
    ),
    s3Title: s(
      "Build & launch in days",
      "Изграждане и пускане за дни",
    ),
    s3Body: s(
      "Most projects ship in under 2 weeks. You see daily progress in a shared workspace.",
      "Повечето проекти приключват за по-малко от 2 седмици. Виждаш ежедневния напредък в споделено пространство.",
    ),
    s4Title: s(
      "Optional ongoing support",
      "Опционална месечна поддръжка",
    ),
    s4Body: s(
      "Stay on the retainer for maintenance, new features, or AI tuning. Cancel anytime.",
      "Остани на абонамент за поддръжка, нови функции или AI настройка. Отказваш по всяко време.",
    ),
  },

  // -------------------------------------------------------------------
  // Homepage — testimonial copies
  // -------------------------------------------------------------------
  testimonials: {
    t1Quote: s(
      "Nacho rebuilt our site in 4 days. Lighthouse went from 32 to 98. Conversions doubled in the first week.",
      "Начо ни преправи сайта за 4 дни. Lighthouse скочи от 32 на 98. Конверсиите се удвоиха още в първата седмица.",
    ),
    t1Name: s("Maria K.", "Мария К."),
    t1Role: s("Owner, Local Bakery", "Собственик, локална пекарна"),
    t2Quote: s(
      "The AI chatbot books client consultations while I sleep. It paid for itself in 2 weeks.",
      "AI чатботът записва клиентски срещи, докато спя. Изплати се за 2 седмици.",
    ),
    t2Name: s("David T.", "Давид Т."),
    t2Role: s(
      "Founder, Coaching Studio",
      "Основател, коучинг студио",
    ),
    t3QuotePrefix: s(
      "We stopped paying our agency ",
      "Спряхме да плащаме на агенцията си ",
    ),
    t3QuoteSuffix: s(
      "/month. Nacho's bundle does more for less than rent.",
      "/месец. Пакетът на Начо прави повече, отколкото сме плащали за наем.",
    ),
    t3Name: s("Sofia M.", "София М."),
    t3Role: s(
      "Fashion Boutique Owner",
      "Собственик на моден бутик",
    ),
  },

  // -------------------------------------------------------------------
  // Homepage — top-level FAQ
  // -------------------------------------------------------------------
  faq: {
    q1: s("How fast can you start?", "Колко бързо можеш да започнеш?"),
    a1: s(
      "Most projects begin within 48 hours of the discovery call. Simple sites are live in 3–7 days.",
      "Повечето проекти стартират до 48 часа след разговора. Прости сайтове излизат на живо за 3–7 дни.",
    ),
    q2: s(
      "Do you work with my existing website?",
      "Работиш ли със съществуващ сайт?",
    ),
    a2: s(
      "Absolutely. I can refactor, redesign, or layer AI features onto whatever stack you're on — WordPress, Shopify, custom code, anything.",
      "Разбира се. Мога да рефакторирам, редизайна или добавя AI функции върху каквото имаш — WordPress, Shopify, custom код, каквото и да е.",
    ),
    q3: s("What if I'm not happy?", "Ами ако не съм доволен?"),
    a3: s(
      "You get unlimited revisions during the build. If you're still not happy after launch, I refund the difference. No drama.",
      "Получаваш неограничени корекции по време на работата. Ако след пускането все още не си доволен, връщам разликата. Без драма.",
    ),
    q4: s("Where is my site hosted?", "Къде се хоства сайтът?"),
    a4: s(
      "Default is Vercel (free tier covers most small businesses). You own everything — code, domain, data.",
      "По подразбиране на Vercel (безплатният план покрива повечето малки бизнеси). Всичко е твое — кодът, домейнът, данните.",
    ),
    q5: s(
      "How does the monthly retainer work?",
      "Как работи месечният абонамент?",
    ),
    a5Prefix: s(
      "",
      "",
    ),
    a5Body: s(
      "/month covers maintenance, security updates, content changes (up to 2 hours), priority support — and your domain name + hosting are on me for as long as you stay on the retainer. Cancel anytime; you keep ownership of everything.",
      "/месец покрива поддръжка, обновления за сигурност, промени в съдържанието (до 2 часа), приоритетна поддръжка — и докато си на абонамента, домейнът и хостингът са от мен. Отказваш по всяко време; всичко остава твое.",
    ),
    q6: s("Do you sign NDAs?", "Подписваш ли NDA?"),
    a6: s(
      "Yes — standard mutual NDA before any code or data is exchanged.",
      "Да — стандартно взаимно NDA преди обмен на код или данни.",
    ),
  },

  // -------------------------------------------------------------------
  // /services — index page
  // -------------------------------------------------------------------
  servicesPage: {
    eyebrow: s("Services", "Услуги"),
    headline: s(
      "Pick the pain you want to solve.",
      "Избери проблема, който искаш да решиш.",
    ),
    sub: s(
      "12 fixed-price services grouped by what's actually breaking your business — so you don't have to guess what to buy.",
      "12 услуги с фиксирани цени, групирани по проблема, който решават — за да не гадаеш какво да купиш.",
    ),
    gettingStartedKicker: s(
      "Getting Started",
      "Старт от нулата",
    ),
    gettingStartedHeadline: s(
      "Brand new? Start here.",
      "Тепърва започваш? Тук е мястото.",
    ),
    gettingStartedSub: s(
      "The natural launch sequence — the order most new businesses go through to get a presence online and ready to take money.",
      "Естественият ред — стъпките, през които минават повечето нови бизнеси, за да се появят онлайн и да започнат да приемат пари.",
    ),
    contactCardLabel: s("Investment", "Инвестиция"),
    bestForCardLabel: s("Best for", "Подходящо за"),
    bookCallNote: s(
      "Free 15-minute call. We map your specific situation, confirm fixed scope + price, and you decide.",
      "Безплатен 15-минутен разговор. Намираме точно твоята ситуация, потвърждаваме обхвата и цената, и ти решаваш.",
    ),
  },

  // -------------------------------------------------------------------
  // /services/[serviceId] — detail page chrome
  // -------------------------------------------------------------------
  serviceDetail: {
    breadcrumbServices: s("Services", "Услуги"),
    pricedFixedShipsInDays: s(
      "· fixed-price · ships in days",
      "· фиксирана цена · доставка за дни",
    ),
    painSectionHeadline: s(
      "If this is you, you're losing money right now",
      "Ако това си ти, в момента губиш пари",
    ),
    painSectionSub: s(
      "Every one of these is a measurable cost. Most clients recognise at least three before booking.",
      "Всяка точка е измерима загуба. Повечето клиенти се разпознават в поне 3, преди да резервират.",
    ),
    solutionKicker: s("The fix", "Решението"),
    solutionHeadline: s("Here's what you get", "Ето какво получаваш"),
    implKicker: s("How it ships", "Как се доставя"),
    implHeadline: s("Implementation in", "Изпълнение за"),
    implSub: s(
      "No surprises. You see daily progress in a shared workspace and can call \"done\" whenever you're happy.",
      "Без изненади. Виждаш ежедневния напредък в споделено пространство и казваш „готово“, когато си доволен.",
    ),
    deliverablesKicker: s(
      "What you walk away with",
      "С какво си тръгваш",
    ),
    deliverablesHeadline: s("Deliverables", "Какво получаваш"),
    bestForLabel: s("Best for", "Подходящо за"),
    investmentLabel: s("Investment", "Инвестиция"),
    investmentSavePrefix: s(
      "Or save 60%+ by grabbing it inside a ",
      "Или спести 60%+, като го вземеш в ",
    ),
    investmentSaveBundleLink: s("bundle", "пакет"),
    investmentSaveSuffix: s(".", "."),
    faqHeadline: s("Quick questions", "Бързи въпроси"),
    buyKicker: s("Ready when you are", "Когато си готов"),
    buyHeadlinePrefix: s("Buy ", "Купи "),
    buySub: s(
      "Fixed scope. Fixed price. Ships in days. Cancel for a full refund any time before kickoff.",
      "Фиксиран обхват. Фиксирана цена. Доставка за дни. Отказваш с пълно възстановяване по всяко време преди старта.",
    ),

    // End-of-section CTAs (5 distinct framings, all leading to #buy)
    painCtaTitle: s(
      "Recognise three of these?",
      "Разпознаваш ли се в поне три?",
    ),
    painCtaSub: s(
      "Stop the bleeding — every week you wait is money lost.",
      "Спри кървенето — всяка седмица чакане е загубени пари.",
    ),
    solutionCtaTitle: s(
      "Every box above — ticked. Yours in days.",
      "Всичко по-горе — отметнато. За дни.",
    ),
    solutionCtaSub: s(
      "No back-and-forth. Fixed scope, fixed price, no surprises.",
      "Без излишни обяснения. Фиксиран обхват, фиксирана цена, без изненади.",
    ),
    implCtaTitle: s(
      "Kickoff within 48h of payment.",
      "Стартираме до 48 часа след плащане.",
    ),
    implCtaSub: s(
      "Lock in your slot — the queue moves fast.",
      "Запази си мястото — опашката се движи бързо.",
    ),
    deliverablesCtaTitle: s(
      "Skip the back-and-forth.",
      "Прескочи дългите разговори.",
    ),
    deliverablesCtaPrefix: s(
      "Get all of this for ",
      "Получи всичко това за ",
    ),
    deliverablesCtaSuffix: s(
      " — fixed scope, fixed price, no surprises.",
      " — фиксиран обхват, фиксирана цена, без изненади.",
    ),
    faqCtaTitle: s("Out of questions?", "Свършиха ли въпросите?"),
    faqCtaUnsure: s(
      "Still unsure? Book a 15-min call instead",
      "Все още не си сигурен? Запази 15-минутен разговор",
    ),
    closingPrefix: s("Prefer email or phone?", "Предпочиташ имейл или телефон?"),
  },

  // -------------------------------------------------------------------
  // /bundles/[slug] — detail page chrome
  // -------------------------------------------------------------------
  bundleDetail: {
    breadcrumbBundles: s("Bundles", "Пакети"),
    aboveFromPrice: s("From ", "От "),
    aboveSavingsPrefix: s("You save ", "Спестяваш "),
    aboveSavingsSuffix: s(" vs separately", " спрямо отделно"),
    monthlyRetainerLabel: s("/month retainer", "/месец абонамент"),
    inclusionsKicker: s("What's included", "Какво включва"),
    inclusionsHeadline: s(
      "Everything in the box",
      "Всичко в пакета",
    ),
    inclusionsSub: s(
      "Each line item below is a separately-priced service. The bundle bakes them together at one combined price.",
      "Всеки ред по-долу е отделно платена услуга. Пакетът ги обединява в една обща цена.",
    ),
    inheritFromPrefix: s(
      "Everything in the ",
      "Всичко от ",
    ),
    inheritFromSuffix: s(" Bundle", " пакета"),
    bonusBadge: s("Bonus", "Бонус"),
    freebieBadge: s("Free", "Безплатно"),
    valueKicker: s("Value comparison", "Сравнение на стойността"),
    valueHeadline: s(
      "Here's what you'd pay separately",
      "Ето колко би платил отделно",
    ),
    valueSeparate: s("Separately", "Отделно"),
    valueBundle: s("This bundle", "Този пакет"),
    valueSavings: s("You save", "Спестяваш"),
    bundleFaqHeadline: s(
      "Common questions about this bundle",
      "Често задавани въпроси за този пакет",
    ),
    footerCtaHeadline: s(
      "Ready to make it official?",
      "Готов ли си да започнем?",
    ),
    footerCtaSub: s(
      "Pick your upgrades, fill in your details, pay securely. Kickoff usually happens within 48 hours.",
      "Избери надстройките, попълни данните си и плати сигурно. Старт обикновено до 48 часа.",
    ),
    nudgeAlt: s(
      "Most clients choose a bundle because it pays for itself before separately would even ship.",
      "Повечето клиенти избират пакет, защото той се изплаща, преди отделните услуги изобщо да са готови.",
    ),
  },

  // -------------------------------------------------------------------
  // Checkout island (sidebar) + form
  // -------------------------------------------------------------------
  checkoutIsland: {
    optionalUpgradesKicker: s(
      "Optional upgrades",
      "По избор",
    ),
    addToOrderKicker: s("Add to your order", "Добави към поръчката"),
    pickTierHeading: s(
      "Pick a tier, then add anything you'd like",
      "Избери ниво и добави каквото искаш",
    ),
    addAnythingHeading: s(
      "Add anything you'd like — or just skip them all",
      "Добави каквото искаш — или просто пропусни",
    ),
    upgradesSub: s(
      "Recommended upgrades are pre-selected. Untick anything you don't want and the price updates live.",
      "Препоръчаните надстройки са избрани. Махни тези, които не искаш — цената се обновява моментално.",
    ),
    tierLabel: s("Tier", "Ниво"),
    recommendedBadge: s("Recommended", "Препоръчано"),
    upgradesSingular: s("upgrade", "надстройка"),
    upgradesPlural: s("upgrades", "надстройки"),
    totalDueToday: s("Total due today", "За плащане днес"),
    firstMonth: s("First month", "Първи месец"),
    pureMonthlyHelper: s(
      "Cancel anytime — you keep ownership of everything.",
      "Отказваш по всяко време — всичко остава твое.",
    ),
    pureMonthlyThen: s("Then ", "След това "),
    retainerLine: s(
      "/month retainer. Cancel anytime.",
      "/месец абонамент. Отказваш по всяко време.",
    ),
    retainerLeading: s("+ ", "+ "),
  },

  // -------------------------------------------------------------------
  // /projects — portfolio listing chrome (the project cards themselves
  // come from `lib/projects-data.ts` + `projects-data.bg.ts`)
  // -------------------------------------------------------------------
  projects: {
    metaTitle: s("Projects", "Проекти"),
    metaDescription: s(
      "Portfolio projects by Nacho Tsvetkov – Full-Stack Software Engineer.",
      "Портфолио проекти от Начо Цветков – Full-Stack софтуерен инженер.",
    ),
    pageTitle: s("Projects", "Проекти"),
    intro: s(
      "Live demos and production work — each one with its own visual identity. Click any project to open it in a new tab. The top card is a technical RAG system demo (hybrid retrieval + evaluation), not a brand storefront.",
      "Демо проекти и работа в production — всеки със своя визуална идентичност. Кликни на който и да е проект, за да го отвориш в нов таб. Първата карта е техническо RAG демо (хибридно търсене + evaluation), не бранд сайт.",
    ),
    backToHome: s("Back to Home", "Обратно към началото"),
    statusLive: s("Live", "На живо"),
    statusTechDemo: s("Technical demo", "Техническо демо"),
    cardOpensInNewTab: s("(opens in a new tab)", "(отваря се в нов таб)"),
  },

  // -------------------------------------------------------------------
  // /checkout — page chrome + order summary
  // -------------------------------------------------------------------
  checkout: {
    pageTitle: s("Review your order", "Прегледай поръчката си"),
    kicker: s("Checkout", "Плащане"),
    intro: s(
      "Confirm the line items below, fill in your details, and pay securely with PayPal. Kickoff usually happens within 48 hours of payment.",
      "Потвърди редовете по-долу, попълни данните си и плати сигурно с PayPal. Старт обикновено до 48 часа след плащане.",
    ),
    summaryHeading: s("Order summary", "Резюме на поръчката"),
    summaryFirstMo: s("(1st mo)", "(1-ви м.)"),
    summaryTotalDueToday: s("Total due today", "За плащане днес"),
    summaryFirstMonth: s("First month", "Първи месец"),
    summaryThenMonthly: s(
      "Then monthly retainer",
      "След това месечен абонамент",
    ),
    summaryRecurringMonthly: s("Recurring monthly", "Повтарящо се месечно"),
    summaryTaxesNote: s(
      "Local taxes (if applicable) will be added on the invoice based on your billing country.",
      "Местни данъци (ако се прилагат) се добавят към фактурата според страната ти на фактуриране.",
    ),
    summaryCurrencyPrefix: s("Prices in ", "Цени в "),
    fallbackHeadline: s(
      "Pick something to check out",
      "Избери нещо за плащане",
    ),
    fallbackSub: s(
      "Looks like the link didn't carry an order through. Pick a bundle below to get back on track, or browse single services.",
      "Изглежда линкът не е донесъл поръчка. Избери пакет, за да продължиш, или разгледай отделните услуги.",
    ),
    fallbackBrowse: s(
      "Or browse single services →",
      "Или разгледай отделните услуги →",
    ),
    fallbackSeeBundle: s("See bundle →", "Виж пакета →"),

    // Form labels (CheckoutForm)
    formName: s("Your name", "Твоето име"),
    formNamePh: s("Maria Petrova", "Мария Петрова"),
    formBusiness: s("Business name", "Име на бизнеса"),
    formBusinessPh: s("Petrova Studio Ltd.", "Петрова Студио ЕООД"),
    formEmail: s("Email", "Имейл"),
    formEmailPh: s("you@business.com", "ti@business.com"),
    formEmailHelper: s(
      "Where I'll send the invoice + kickoff details.",
      "Където ще пратя фактурата и детайлите за старт.",
    ),
    formPhone: s("Phone", "Телефон"),
    formPhoneOptional: s("(optional)", "(по избор)"),
    formPhonePh: s("+359 882 700 002", "+359 882 700 002"),
    formNotes: s(
      "Anything I should know before kickoff?",
      "Нещо, което да знам преди старта?",
    ),
    formNotesOptional: s("(optional)", "(по избор)"),
    formNotesPh: s(
      "Existing site URL, brand assets, deadlines, anything specific...",
      "URL на текущ сайт, материали, срокове, нещо конкретно...",
    ),
    formPay: s("Pay ", "Плати "),
    formPayPlusMo: s(" + ", " + "),
    formPayPerMo: s("/mo", "/м."),
    formPayFirstMo: s("first month", "първи месец"),
    formStripeNote: s(
      "Submitting takes you to a secure hosted checkout — no card info enters this page.",
      "При изпращане отиваш на сигурна страница за плащане — данните на картата не минават през този сайт.",
    ),
    formMailtoNote: s(
      "Submitting forwards your details so I can send a secure PayPal invoice — no card info enters this page. Most invoices arrive within an hour.",
      "При изпращане получавам данните и ти пращам сигурна PayPal фактура — данните на картата не минават през този сайт. Повечето фактури пристигат до един час.",
    ),
    formBookFirstPrefix: s("Or ", "Или "),
    formBookFirstLink: s(
      "book a free 15-min call",
      "запази безплатен 15-минутен разговор",
    ),
    formBookFirstSuffix: s(
      " first if you'd rather scope before paying.",
      " ако предпочиташ първо да изясним обхвата.",
    ),

    // Submitted state
    submittedHeadline: s(
      "Order details on the way.",
      "Детайлите за поръчката са на път.",
    ),
    submittedBody: s(
      "Your email client should have opened with everything pre-filled. Once you hit send, I'll reply within an hour with a secure payment link and the kickoff calendar invite.",
      "Имейл клиентът ти трябва вече да е отворен с всичко попълнено. След като пратиш, до един час ти отговарям с линк за сигурно плащане и покана за старт.",
    ),
    submittedFallback1: s(
      "Mail client didn't open?",
      "Имейл клиентът не се отвори?",
    ),
    submittedFallback2: s(
      "Click here to send manually",
      "Натисни тук, за да изпратиш ръчно",
    ),
    submittedOr: s(" — or ", " — или "),
    submittedBookInstead: s(
      "book a 15-min call instead",
      "запази 15-минутен разговор",
    ),
    submittedAfterBook: s(
      " and I'll handle it on the call.",
      " и ще се погрижа на разговора.",
    ),

    // PayPal Smart Buttons
    paypalHeading: s("Pay securely with PayPal", "Сигурно плащане с PayPal"),
    paypalSub: s(
      "PayPal handles the card details. Your money is protected by PayPal Buyer Protection.",
      "PayPal обработва данните на картата. Парите ти са защитени от PayPal Buyer Protection.",
    ),
    paypalSubSubscription: s(
      "PayPal charges the upfront amount today and the monthly retainer automatically every month after. Cancel any time from your PayPal account.",
      "PayPal таксува сумата днес и месечния абонамент автоматично всеки следващ месец. Можеш да откажеш по всяко време от PayPal профила си.",
    ),
    paypalLoading: s("Loading PayPal…", "Зареждане на PayPal…"),
    paypalErrorScript: s(
      "Couldn't load PayPal. Refresh the page or use the email path below.",
      "PayPal не успя да се зареди. Опресни страницата или използвай имейл варианта по-долу.",
    ),
    paypalErrorGeneric: s(
      "Something went wrong with PayPal. Try again or use the email path below.",
      "Нещо се обърка с PayPal. Опитай пак или използвай имейл варианта по-долу.",
    ),
    paypalErrorNetwork: s(
      "We couldn't reach our servers. Check your internet connection and try again.",
      "Не успяхме да се свържем със сървърите ни. Провери интернет връзката си и опитай пак.",
    ),
    paypalErrorPlanMissing: s(
      "PayPal subscription plans aren't configured yet. Use the email path below and I'll send you an invoice manually.",
      "Абонаментните планове на PayPal все още не са настроени. Използвай имейл варианта по-долу и ще ти пратя фактура ръчно.",
    ),
    paypalErrorBadRequest: s(
      "Looks like the order details didn't come through correctly. Refresh the page and try once more.",
      "Изглежда детайлите на поръчката не пристигнаха правилно. Презареди страницата и опитай пак.",
    ),
    paypalErrorBadResponse: s(
      "PayPal returned an unexpected response. Try again, or use the email path below if it persists.",
      "PayPal върна неочакван отговор. Опитай пак или използвай имейл варианта по-долу, ако продължава.",
    ),
    paypalErrorCapture: s(
      "Payment was approved but capture failed. I'll reach out within the hour to finish it manually.",
      "Плащането е одобрено, но не успяхме да го завършим автоматично. Ще се свържа с теб в рамките на час, за да го финализираме ръчно.",
    ),
    paypalErrorFormInvalid: s(
      "Please fill in your name, business and email before paying.",
      "Моля, попълни име, бизнес и имейл преди плащане.",
    ),
    paypalOrFallback: s(
      "Or — prefer an emailed invoice?",
      "Или — предпочиташ фактура по имейл?",
    ),
    paypalOrFallbackLink: s(
      "Send the order details by email instead",
      "Прати детайлите по имейл вместо това",
    ),

    // Success page
    successOrderTitle: s("Payment received — thank you!", "Плащането е получено — благодаря!"),
    successSubscriptionTitle: s(
      "Subscription active — thank you!",
      "Абонаментът е активен — благодаря!",
    ),
    successBody: s(
      "Your payment came through. I'll send a kickoff email with calendar invite + onboarding questionnaire within the next hour.",
      "Плащането мина. До един час ще получиш имейл с покана за календар и въпросник за старта.",
    ),
    successOrderRef: s("Order reference", "Реф. на поръчка"),
    successSubRef: s("Subscription id", "ID на абонамент"),
    successHomeLink: s("← Back to home", "← Към началото"),
    successBookCallLink: s(
      "Book the kickoff call now →",
      "Запази стартиращ разговор сега →",
    ),
  },

  // -------------------------------------------------------------------
  // Service-pricing renderer keywords
  // -------------------------------------------------------------------
  pricing: {
    startingAt: s("Starting at", "От"),
    addonPrefix: s("Add-on +", "Добавка +"),
    addonFullSitePrefix: s(
      "Full site with chatbot: ",
      "Пълен сайт с чатбот: ",
    ),
    monthlyRetainer: s("Monthly retainer", "Месечен абонамент"),
    perMonth: s("/month", "/месец"),
    tier1Page: s("1-page", "1 страница"),
    tier3Page: s("3-page", "3 страници"),
    addonOnly: s("Add-on only", "Само като добавка"),
    fullSiteWithChatbot: s(
      "Full site with chatbot",
      "Пълен сайт с чатбот",
    ),
    fullPaymentsReady: s(
      "(full payments-ready site)",
      "(пълен сайт, готов за плащания)",
    ),
  },

  giveaway: {
    winnersKicker: s("Fair selection", "Честен избор"),
    winnersHeadline: s("How Winners Are Chosen", "Как се избират победителите"),
    winnersBody: s(
      "Every month I personally review all entries and select 1–3 winners based on the quality of their answers and how well their business fits the prize. This helps ensure I can deliver great results for the businesses I build.",
      "Всеки месец лично преглеждам всички заявки и избирам 1–3 победители според качеството на отговорите и дали бизнесът пасва на наградата. Така мога да доставя силни резултати за бизнесите, които изграждам.",
    ),
    freeGuideKicker: s("Instant bonus", "Моментален бонус"),
    freeGuideHeadline: s(
      "Free guide included with every entry",
      "Безплатен наръчник с всяка заявка",
    ),
    freeGuideBody: s(
      "Complete the survey and unlock Stop Losing Leads While You Sleep — practical steps to capture and follow up on leads automatically.",
      "Попълни анкетата и получи „Stop Losing Leads While You Sleep“ — практични стъпки за улавяне и последващи стъпки с клиенти автоматично.",
    ),
    scarcityBadge: s(
      "Only 1–3 winners every month",
      "Само 1–3 победители всеки месец",
    ),
    whatYouWinKicker: s("The prize", "Наградата"),
    whatYouWinHeadline: s("What Winners Receive", "Какво получават победителите"),
    whatYouWin1: s(
      "Custom professional website — up to 5 pages, mobile-first",
      "Персонален професионален сайт — до 5 страници, mobile-first",
    ),
    whatYouWin2: s(
      "AI chatbot trained on your business — answers & books 24/7",
      "AI чатбот, обучен на бизнеса — отговаря и резервира 24/7",
    ),
    whatYouWin3: s(
      "Online booking integration + contact form",
      "Онлайн резервации + форма за контакт",
    ),
    whatYouWin4: s(
      "Hosted, deployed, and Google Analytics setup",
      "Хостинг, пускане на живо и настройка на Google Analytics",
    ),
    timelineKicker: s("Timeline", "График"),
    timelineHeadline: s("How the Giveaway Works", "Как работи томболата"),
    timelineStep1: s(
      "Enter anytime — complete the 2-minute survey",
      "Влез по всяко време — попълни 2-минутната анкета",
    ),
    timelineStep2: s(
      "Winners announced by email within the first week of each month",
      "Победителите се обявят по имейл в първата седмица на месеца",
    ),
    timelineStep3: s(
      "Winners receive their site in 5–7 business days after providing content",
      "Победителите получават сайта за 5–7 работни дни след като предоставят съдържание",
    ),
    exitOfferTitle: s(
      "Before you go — grab the free lead guide",
      "Преди да излезеш — вземи безплатния наръчник",
    ),
    exitOfferBody: s(
      "Stop Losing Leads While You Sleep — practical steps to capture leads automatically.",
      "„Stop Losing Leads While You Sleep“ — практични стъпки за автоматично улавяне на клиенти.",
    ),
    exitOfferCta: s("Get the free guide →", "Вземи наръчника →"),
    exitOfferGiveaway: s("Or enter the monthly giveaway", "Или влез в месечната томбола"),
  },

  bundleLanding: {
    startupHero: s(
      "Professional Website + AI Chatbot in 7 Days",
      "Професионален сайт + AI чатбот за 7 дни",
    ),
    startupSubheadline: s(
      "Get online fast with a modern site and AI that qualifies leads and books appointments while you sleep. No tech skills required.",
      "Онлайн бързо с модерен сайт и AI, който квалифицира клиенти и резервира срещи докато спиш. Без технически умения.",
    ),
    scaleupHero: s(
      "The Complete Growth System for Serious Small Businesses",
      "Пълната система за растеж на сериозни малки бизнеси",
    ),
    scaleupSubheadline: s(
      "Everything in Startup plus marketing automation, CRM, and monthly support — replaces hours of manual work every week.",
      "Всичко от Startup плюс маркетинг автоматизация, CRM и месечна поддръжка — замества часове ръчна работа всяка седмица.",
    ),
    whyWorksKicker: s("Why this works", "Защо работи"),
    whyWorksHeadline: s("Why This Bundle Works", "Защо този пакет работи"),
    whyWorksStartup1: s(
      "First booking often pays for the entire bundle",
      "Първата резервация често покрива целия пакет",
    ),
    whyWorksStartup2: s(
      "Books clients while you sleep — 24/7 lead capture",
      "Резервира клиенти докато спиш — улавяне на клиенти 24/7",
    ),
    whyWorksScaleup1: s(
      "Replaces 1–2 part-time team members worth of manual work",
      "Замества ръчната работа на 1–2 наполовина служители",
    ),
    whyWorksScaleup2: s(
      "Automated follow-ups, CRM, and maintenance — pays for itself monthly",
      "Автоматизирани последващи стъпки, CRM и поддръжка — се изплаща месечно",
    ),
    howItWorksKicker: s("How it works", "Как работи"),
    howItWorksHeadline: s("Four Simple Steps", "Четири прости стъпки"),
    step1: s("Discovery call — tell me about your business", "Разговор — сподели бизнеса"),
    step2: s("We build your site + train the AI chatbot", "Изграждаме сайта + обучаваме AI чатбота"),
    step3: s("You review — we tweak until it's right", "Преглеждаш — донастройваме до перфектно"),
    step4: s("We launch — start capturing leads 24/7", "Пускаме на живо — клиенти 24/7"),
    guaranteeKicker: s("Guarantee", "Гаранция"),
    guaranteeHeadline: s("Delivered in 5–7 Business Days", "Доставка за 5–7 работни дни"),
    guaranteeBody: s(
      "Delivered in 5–7 business days after you provide content. If we miss the agreed deadline without a mutually agreed extension, you get a full refund of the one-time fee. No surprises — we align on scope before work begins.",
      "Доставка за 5–7 работни дни след като предоставиш съдържание. Ако пропуснем срока без споразумено удължение, получаваш пълно възстановяване на еднократната сума. Без изненади — уточняваме обхвата преди работа.",
    ),
  },

  // -------------------------------------------------------------------
  // Cookie / marketing-consent banner (default-deny, GDPR-aligned).
  // Renders on the first visit and disappears once the visitor picks
  // a side. The choice is persisted client-side for 365 days.
  // -------------------------------------------------------------------
  consent: {
    message: s(
      "We use cookies to measure marketing performance (Meta Pixel) and improve the site. None of this is required to browse — pick the option that works for you.",
      "Използваме бисквитки, за да измерваме рекламни кампании (Meta Pixel) и да подобряваме сайта. Не са задължителни, за да разглеждаш — избери това, което ти подхожда.",
    ),
    accept: s("Accept", "Приемам"),
    reject: s("Reject", "Отказвам"),
    ariaLabel: s("Cookie consent", "Съгласие за бисквитки"),
    privacyPolicy: s("Privacy Policy", "Политика за поверителност"),
  },

  legal: {
    privacyPolicy: s("Privacy Policy", "Политика за поверителност"),
  },
} as const;
