// Bulgarian translations for the /projects portfolio listing. Same
// pattern as `bundles-data.bg.ts` and `services-data.bg.ts`: the
// canonical English content lives in `projects-data.ts`, this file
// overlays translated copy keyed by `ProjectId`. Untranslated fields
// fall back to English at render time.
//
// Brand names (KORE, ROZÉ) and tech stack chips (Next.js, GPT-4o,
// Shopify, etc.) intentionally stay in their original form in the
// translated titles — they read identically in any language and
// translating them ("Шопифай"?) just adds visual noise.

import type { ProjectId } from "./projects-data";

export type ProjectCopyOverride = {
  title?: string;
  description?: string;
};

export const PROJECTS_BG: Record<ProjectId, ProjectCopyOverride> = {
  "ai-shopify-store": {
    title: "AI магазин в Shopify",
    description:
      "Headless Next.js магазин с AI препоръки в реално време, умен чатбот с „Добави в количката“ и плавна Shopify интеграция. Чат на цял екран, streaming отговори, продуктови карти директно в разговора.",
  },
  "local-fitness-studio": {
    title: "Локално фитнес студио · KORE",
    description:
      "Самостоятелен сайт на студио (топла оранжева + кремава палитра) с AI рецепционист за след работно време — резервира часове, отговаря на въпроси за графика и подава нататък към треньор, когато е нужно.",
  },
  "boutique-fashion-brand": {
    title: "Бутик за луксозна мода · ROZÉ",
    description:
      "Луксозен бутик на български (крем + руж + serif) с AI личен стилист и имейли за възстановяване на изоставена количка, които звучат като писани от човек — никакъв спам.",
  },
  "multi-modal-visual-stylist": {
    title: "Мулти-модален визуален стилист",
    description:
      "Качваш снимка — GPT-4o vision анализира сцената, RAG издърпва подобни и допълващи продукти от Shopify каталог, с продуктова мрежа в чата и добавяне в количката с едно докосване.",
  },
  "autonomous-agentic-commerce-bot": {
    title: "Автономен agentic commerce бот",
    description:
      "Чатбот, който не само говори — действа. AI с tool-calling, който търси, сравнява, добавя в количката и завършва поръчката автономно през OpenAI function calling.",
  },
  "ai-store-analytics-insights": {
    title: "AI анализи и insight-и за магазина",
    description:
      "BI копилот за търговеца — задаваш въпроси на нормален език за продажби, поръчки и клиенти. RAG върху 30 дни данни от магазина с графики директно в чата.",
  },
  "smart-cart-recovery-agent": {
    title: "Smart агент за изоставени колички",
    description:
      "Проактивен AI, който автоматично възстановява изоставени колички с персонализирани оферти, спешност и стил-ориентирани стимули — не чака потребителят да направи нещо.",
  },
  "personalized-style-concierge": {
    title: "Персонален стилист консиерж",
    description:
      "AI личен стилист, който профилира вкуса ти през няколко въпроса, после изгражда цели визии с продуктови карти, „запази този лук“ и добавяне в количката с едно докосване.",
  },
  "voice-enabled-shopping-assistant": {
    title: "Гласов асистент за пазаруване",
    description:
      "Пазаруване без ръце — изговаряш заявката, чуваш отговора. Web Speech API за STT, browser SpeechSynthesis за TTS, с пълни продуктови карти и количка.",
  },
};
