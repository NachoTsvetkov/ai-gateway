// Bulgarian translations for the bundle catalogue + upsells. Same
// pattern as `services-data.bg.ts`: the canonical English content is
// the source of truth in `bundles-data.ts`, and this file overlays
// translated copy on top of it. New bundles or upsells are still added
// in EXACTLY one place (the English file) and a translation here is
// optional — missing keys fall back to English at render time.

import type { BundleId } from "./bundles-data";

export type BundleCopyOverride = {
  name?: string;
  tagline?: string;
  pain?: string;
  /** Per-line `note` overrides keyed by `serviceId` (or `inherit:from`
   *  for inherited rows). The catalogue line stays in English shape; we
   *  only swap the human-readable note. */
  contentNotes?: Record<string, string>;
  freebies?: ReadonlyArray<string>;
  roiHook?: string;
  nudge?: string;
  cta?: { primary?: string; helper?: string; checkout?: string };
};

export const BUNDLES_BG: Record<BundleId, BundleCopyOverride> = {
  startup: {
    name: "Startup пакет",
    tagline: "Стартирай бързо и евтино",
    pain: "Нямаш нищо онлайн — или сайтът ти е толкова остарял, че всяка седмица ти струва клиенти.",
    roiHook: "Първата резервация го изплаща",
    cta: {
      primary: "Вземи Startup пакета",
      helper: "Продължи към плащане — сигурно онлайн",
      checkout: "Вземи Startup пакета",
    },
  },
  scaleup: {
    name: "Scale-Up пакет",
    tagline: "Надстрой и автоматизирай това, което вече имаш",
    pain: "Бизнесът ти работи, но се дави в ръчна работа — имейли, follow-up-и, графици, въвеждане на данни.",
    contentNotes: {
      website: "Пълен редизайн — до 5 страници",
      ecommerce: "Готов за e-commerce / плащания",
      "marketing-automation":
        "Маркетинг автоматизация (имейл + SMS поредици)",
      crm: "Custom лек CRM",
      maintenance:
        "Месечен абонамент: поддръжка + промени в съдържанието + 2 часа поддръжка",
    },
    freebies: ["Домейн + хостинг — включени в абонамента"],
    roiHook: "Замества 1–2 души на половин ден",
    cta: {
      primary: "Започни Scale-Up процеса",
      helper: "Продължи към плащане — сигурно онлайн",
      checkout: "Започни Scale-Up процеса",
    },
  },
  enterprise: {
    name: "Enterprise пакет",
    tagline: "Пълна AI трансформация",
    pain: "Искаш да увеличиш приходите без да увеличиш екипа — и нямаш време за чакане.",
    contentNotes: {
      "ai-agents": "Custom AI агент (автономен виртуален служител)",
      "voice-agents": "AI гласов агент за продажби и поддръжка",
      personalization: "Персонализация с AI",
      integrations:
        "Сложни API интеграции (CRM, ERP, доставчици)",
    },
    freebies: ["Домейн + хостинг — включени в абонамента"],
    roiHook: "Замества екип от 3–5 души",
    nudge:
      "Повечето клиенти избират Enterprise — допълнителните AI агенти се изплащат за седмици.",
    cta: {
      primary: "Купи Enterprise пакета",
      helper: "Продължи към плащане — сигурно онлайн",
      checkout: "Купи Enterprise пакета",
    },
  },
};

/**
 * Bonus-line label translations. The `bonus` lines in the bundle
 * `contents[]` use plain English strings ("Hosted & deployed for you")
 * rather than referencing a service id, so we look them up here by the
 * exact English label. Returns the English label unchanged if no BG
 * translation is registered.
 */
export const BUNDLE_BONUS_BG: Record<string, string> = {
  "Contact form + email capture": "Форма за контакт + събиране на имейли",
  "Google Analytics + Search Console setup":
    "Настройка на Google Analytics + Search Console",
  "Hosted & deployed for you": "Хоствано и пуснато на живо за теб",
  "Priority support + monthly strategy call":
    "Приоритетна поддръжка + месечен стратегически разговор",
};

// ----------------------------------------------------------------------
// Upsell translations
// ----------------------------------------------------------------------

export type UpsellCopyOverride = {
  label?: string;
  description?: string;
};

export const UPSELLS_BG: Record<string, UpsellCopyOverride> = {
  "express-delivery": {
    label: "Експресна доставка",
    description:
      "Намалявам времето за доставка горе-долу наполовина — пред опашката, работа и през уикенда. Типично: 14 дни → 7 дни, 7 дни → 3 дни.",
  },
  "white-glove-onboarding": {
    label: "Пълно въвеждане в системата",
    description:
      "1 час 1:1 разговор, в който показвам екипа ти през всяка система със споделен екран. Уверени са от ден 1, а не седмица 2.",
  },
  "extra-revisions": {
    label: "+5 кръга дизайн корекции",
    description:
      "Повечето клиенти са доволни със стандартните 2 кръга. Избери това, ако държиш на детайли до пиксел или имаш няколко души, които трябва да одобрят.",
  },
  "priority-support-90d": {
    label: "Приоритетна поддръжка — 90 дни",
    description:
      "Прескачаш опашката за 3 месеца след пускане. Отговор до 4 часа в делнични дни, същия ден при сериозни проблеми. Обикновено само за абонамент.",
  },
  "seo-content-sprint": {
    label: "SEO content спринт (3 статии)",
    description:
      "3 статии в блог, насочени към ключови думи, написани и публикувани в първия ти месец. Привличат органичен трафик още преди пускането да се е изплатило.",
  },
  "analytics-dashboard": {
    label: "Custom analytics dashboard",
    description:
      "Live dashboard, който свързва GA4 + Stripe + CRM-а ти в общ изглед на приходи и фуния. Обновяваш с поглед, скрийншот за инвеститори.",
  },
};

// ----------------------------------------------------------------------
// Per-bundle FAQ (rendered on /bundles/[slug])
// ----------------------------------------------------------------------
//
// The English source for these is INLINED in `app/bundles/[slug]/page.tsx`.
// Centralising the translations here lets the page handler look them up
// by bundle id + question key without duplicating the English text. The
// English text remains in the page (it's intentionally hand-tuned per
// bundle) and we look up the BG override here when locale === "bg".

export const BUNDLE_FAQ_BG: Record<
  BundleId,
  ReadonlyArray<{ q: string; a: string }>
> = {
  startup: [
    {
      q: "Колко време отнема да пуснем сайта?",
      a: "Стандартно 5–7 работни дни от старта. С Експресна доставка — 3 дни.",
    },
    {
      q: "Какво ако нямам домейн?",
      a: "Регистрирам го за теб (на цена, без надценка). Ако вече имаш домейн, го свързвам.",
    },
    {
      q: "Има ли скрити месечни такси?",
      a: "Не. Хостингът на безплатния план на Vercel покрива повечето малки бизнеси. Ако някой ден прерастеш това, ще ти кажа предварително (обикновено около $20/месец).",
    },
  ],
  scaleup: [
    {
      q: "Мога ли да започна без месечния абонамент?",
      a: "Не — Scale-Up е проектиран около абонамента. Ако предпочиташ еднократна работа, разгледай Startup пакета.",
    },
    {
      q: "Покрива ли абонаментът сериозни нови функции?",
      a: "Покрива до 2 часа работа и поддръжка месечно. По-големи неща ги работим извън абонамента с фиксирана цена.",
    },
    {
      q: "Мога ли да отменя абонамента?",
      a: "По всяко време. След отмяна получаваш всичко — код, данни, акаунти. Без контрол на достъпа от моя страна.",
    },
  ],
  enterprise: [
    {
      q: "Колко продължава цялата инсталация?",
      a: "Обикновено 3–4 седмици от старта до пълно пускане на всички AI агенти и интеграции.",
    },
    {
      q: "Какво се случва, ако AI агент сбърка?",
      a: "Всеки агент работи в режим „предлага, ти потвърждаваш“ за първите 30 дни. След това може да е напълно автономен или да остане на одобрение — ти решаваш.",
    },
    {
      q: "Колко струва моделът, на който работят AI агентите?",
      a: "Първите $50/месец използване са включени. Над това — на цена, без надценка. Повечето клиенти стоят между $30 и $80 месечно.",
    },
  ],
};
