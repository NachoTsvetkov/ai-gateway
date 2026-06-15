import type { LocalizedString } from "lib/i18n/locale";

const s = (en: string, bg: string): LocalizedString => ({ en, bg });

export type PrivacySection = {
  id: string;
  title: LocalizedString;
  paragraphs?: ReadonlyArray<LocalizedString>;
  bullets?: ReadonlyArray<LocalizedString>;
};

/** Last substantive update — shown at the bottom of the page. */
export const PRIVACY_POLICY_LAST_UPDATED = "15 June 2026";

export const PRIVACY_POLICY = {
  metaTitle: s("Privacy Policy", "Политика за поверителност"),
  metaDescription: s(
    "How Nacho Tsvetkov collects, uses, and protects your personal data on nachotsvetkov.com — forms, cookies, Meta Pixel, payments, and your GDPR rights.",
    "Как Nacho Tsvetkov събира, използва и защитава личните ви данни на nachotsvetkov.com — формуляри, бисквитки, Meta Pixel, плащания и вашите права по GDPR.",
  ),
  title: s("Privacy Policy", "Политика за поверителност"),
  intro: s(
    "This policy explains what personal data I collect when you use nachotsvetkov.com (and related pages on this domain), why I collect it, and what choices you have. I am the data controller for this site.",
    "Тази политика обяснява какви лични данни събирам, когато използвате nachotsvetkov.com (и свързаните страници на този домейн), защо ги събирам и какви избори имате. Аз съм администратор на данни за този сайт.",
  ),
  sections: [
    {
      id: "controller",
      title: s("Who is responsible", "Кой отговаря за данните"),
      paragraphs: [
        s(
          "Nacho Tsvetkov — independent software engineer and consultant, based in Sofia, Bulgaria.",
          "Nacho Tsvetkov — независим софтуерен инженер и консултант, базиран в София, България.",
        ),
        s(
          "Contact for privacy questions or requests: nacho.tsvetkov@gmail.com",
          "Контакт за въпроси и заявки относно поверителност: nacho.tsvetkov@gmail.com",
        ),
      ],
    },
    {
      id: "collect",
      title: s("What data I collect", "Какви данни събирам"),
      paragraphs: [
        s(
          "The amount of data depends on how you interact with the site:",
          "Обемът на данните зависи от това как взаимодействате със сайта:",
        ),
      ],
      bullets: [
        s(
          "Contact & lead forms — email, business type, free-text answers about your situation, goals, budget, and interest level when you request a free AI opportunity report or similar intake form.",
          "Контактни и lead формуляри — имейл, тип бизнес, свободен текст за ситуацията, цели, бюджет и ниво на интерес, когато заявявате безплатен AI доклад или подобна форма.",
        ),
        s(
          "Checkout — name, email, business name, phone (optional), and order notes when you pay for a service or bundle via PayPal or email invoice.",
          "Плащане — име, имейл, име на бизнес, телефон (по избор) и бележки към поръчката, когато плащате за услуга или пакет чрез PayPal или фактура по имейл.",
        ),
        s(
          "Marketing analytics (only if you click Accept on the cookie banner) — page views, button clicks, checkout steps, and hashed identifiers (email/phone when you enter them on forms) sent to Meta (Facebook) Pixel and Conversions API for ad measurement.",
          "Маркетингова аналитика (само ако натиснете „Приемам“ на банера за бисквитки) — прегледи на страници, кликвания, стъпки при плащане и хеширани идентификатори (имейл/телефон, ако ги въведете във формуляри), изпратени към Meta (Facebook) Pixel и Conversions API за измерване на реклами.",
        ),
        s(
          "Cookies & local storage — your language preference (locale), theme (light/dark), shopping cart contents (via Shopify), marketing consent choice (accepted/rejected, 365 days), and session-scoped form identifiers for analytics matching when consent is granted.",
          "Бисквитки и local storage — езикови предпочитания (locale), тема (светла/тъмна), съдържание на количката (Shopify), избор за маркетингово съгласие (приемам/отказвам, 365 дни) и идентификатори в сесията за analytics съвпадение, когато има съгласие.",
        ),
        s(
          "Server logs — standard hosting data (IP address, browser type, timestamps) retained briefly by Vercel as part of normal web hosting.",
          "Сървърни логове — стандартни хостинг данни (IP адрес, тип браузър, времеви печати), съхранявани кратко от Vercel като част от нормалния уеб хостинг.",
        ),
      ],
    },
    {
      id: "use",
      title: s("Why I use your data", "За какво използвам данните"),
      bullets: [
        s(
          "Respond to your enquiries and deliver free personalised reports you request.",
          "Да отговоря на запитванията ви и да доставя безплатните персонализирани доклади, които заявявате.",
        ),
        s(
          "Process orders, schedule discovery calls, and provide the services you purchase.",
          "Да обработвам поръчки, да насрочвам discovery разговори и да предоставям закупените услуги.",
        ),
        s(
          "Improve the website and measure marketing performance (Meta Pixel / CAPI) — only after you accept cookies.",
          "Да подобрявам сайта и да измервам маркетинговата ефективност (Meta Pixel / CAPI) — само след като приемете бисквитките.",
        ),
        s(
          "Maintain internal CRM records (Firebase / Firestore) so I can follow up consistently and not lose context between touchpoints.",
          "Да поддържам вътрешни CRM записи (Firebase / Firestore), за да мог да следя последователно и да не губя контекст между контактите.",
        ),
      ],
    },
    {
      id: "legal-basis",
      title: s("Legal basis (GDPR)", "Правно основание (GDPR)"),
      bullets: [
        s(
          "Consent — marketing cookies and Meta Pixel tracking (you can reject or withdraw consent anytime by clearing site cookies).",
          "Съгласие — маркетингови бисквитки и Meta Pixel проследяване (можете да откажете или да оттеглите съгласието, като изчистите бисквитките на сайта).",
        ),
        s(
          "Contract / pre-contract steps — processing checkout details and form submissions needed to deliver a service you asked for.",
          "Договор / преддоговорни стъпки — обработка на данни при плащане и формуляри, необходими за услуга, която сте поискали.",
        ),
        s(
          "Legitimate interest — basic site operation, fraud prevention, and replying to business enquiries at a proportionate level.",
          "Законен интерес — основна работа на сайта, предотвратяване на измами и отговор на бизнес запитвания на пропорционално ниво.",
        ),
      ],
    },
    {
      id: "sharing",
      title: s("Third parties", "Трети страни"),
      paragraphs: [
        s(
          "I do not sell your personal data. I share data only with processors that help run this site:",
          "Не продавам личните ви данни. Споделям данни само с обработващи, които помагат за работата на сайта:",
        ),
      ],
      bullets: [
        s(
          "Meta (Facebook) — ad analytics when you accept marketing cookies.",
          "Meta (Facebook) — рекламна аналитика, когато приемете маркетингови бисквитки.",
        ),
        s(
          "PayPal — payment processing when you pay online.",
          "PayPal — обработка на плащания, когато плащате онлайн.",
        ),
        s(
          "Google Firebase / Firestore — secure storage of leads, orders, and journey records.",
          "Google Firebase / Firestore — сигурно съхранение на leads, поръчки и записи по клиентското пътуване.",
        ),
        s(
          "Shopify — product catalog and cart session for the demo store areas of the site.",
          "Shopify — продуктов каталог и сесия на количката за демо магазин зоните на сайта.",
        ),
        s(
          "Vercel — website hosting and edge delivery.",
          "Vercel — хостинг на сайта и edge доставка.",
        ),
        s(
          "Calendly — when you book a call via an external scheduling link (their privacy policy applies on their domain).",
          "Calendly — когато резервирате разговор чрез външен линк (техната политика за поверителност важи на техния домейн).",
        ),
      ],
    },
    {
      id: "retention",
      title: s("How long I keep data", "Колко дълго пазя данните"),
      paragraphs: [
        s(
          "Lead and order records are kept for as long as needed to deliver services, maintain business records, and follow up on enquiries — typically up to 3 years unless a longer period is required by law or you ask for deletion sooner.",
          "Lead и поръчкови записи се пазят толкова дълго, колкото е нужно за доставка на услуги, водене на бизнес записи и последващ контакт — обикновено до 3 години, освен ако законът не изисква по-дълъг срок или не поискате по-ранно изтриване.",
        ),
        s(
          "Marketing consent cookie — 365 days. Session analytics identifiers — cleared when you close the browser tab.",
          "Бисквитка за маркетингово съгласие — 365 дни. Analytics идентификатори в сесията — изчистват се при затваряне на таба в браузъра.",
        ),
      ],
    },
    {
      id: "rights",
      title: s("Your rights", "Вашите права"),
      paragraphs: [
        s(
          "If you are in the EU/EEA (including Bulgaria), you have the right to access, rectify, erase, restrict, or export your personal data, and to object to certain processing. You may also lodge a complaint with the Bulgarian Commission for Personal Data Protection (CPDP).",
          "Ако сте в ЕС/ЕИЗ (включително България), имате право на достъп, коригиране, изтриване, ограничаване или преносимост на личните си данни, както и право на възражение срещу определена обработка. Можете също да подадете жалба до Комисията за защита на личните данни (КЗЛД).",
        ),
        s(
          "Email nacho.tsvetkov@gmail.com with the subject “Privacy request” and I will respond within 30 days.",
          "Пишете на nacho.tsvetkov@gmail.com с тема „Privacy request“ и ще отговоря в рамките на 30 дни.",
        ),
      ],
    },
    {
      id: "security",
      title: s("Security", "Сигурност"),
      paragraphs: [
        s(
          "Data is transmitted over HTTPS. Firestore access is protected by security rules. Payment card data is handled entirely by PayPal — I never store card numbers on this site.",
          "Данните се предават по HTTPS. Достъпът до Firestore е защитен с security rules. Данни за платежни карти се обработват изцяло от PayPal — не съхранявам номера на карти на този сайт.",
        ),
      ],
    },
    {
      id: "changes",
      title: s("Changes to this policy", "Промени в политиката"),
      paragraphs: [
        s(
          "I may update this page when the site’s features or legal requirements change. The “last updated” date at the bottom reflects the most recent revision.",
          "Мога да актуализирам тази страница, когато функциите на сайта или правните изисквания се променят. Датата „последна актуализация“ в долната част отразява най-скорошната ревизия.",
        ),
      ],
    },
  ] satisfies ReadonlyArray<PrivacySection>,
} as const;
