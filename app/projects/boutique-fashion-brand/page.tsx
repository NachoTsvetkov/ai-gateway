import Image from "next/image";
import { ProductGrid } from "components/projects/roze/product-grid";
import { PersonalStylistChat } from "components/projects/roze/personal-stylist";

export const metadata = {
  title: "ROZÉ — Българско ателие за ръчно изработено облекло",
  description:
    "Лимитирани серии плетива, рокли и аксесоари от ателие в София. Личен AI стилист, който помни какво обичате.",
};

/**
 * ROZÉ — Bulgarian boutique fashion brand demo.
 *
 * Living entirely in Bulgarian Cyrillic (with the Latin "ROZÉ" wordmark
 * for brand-mark purposes — common pattern for Sofia luxury brands).
 *
 * The "live demo" hook on the homepage talks about AI personalization
 * and abandoned-cart recovery; on the page itself those are dramatised
 * by:
 *   - PersonalStylist: a static AI conversation in Bulgarian where the
 *     stylist proposes a wedding-guest outfit from the catalogue.
 *   - CartRecovery: a pretend Klaviyo email mock that shows how a
 *     forgotten cart gets re-opened with a personalised note.
 *
 * No stock photography — every "image" is rendered as a colour swatch
 * or gradient panel so the page ships fast and looks deliberate
 * instead of obviously placeholder-y.
 */
export default function RozePage() {
  return (
    <>
      <Hero />
      <Collection />
      <BrandStory />
      <PersonalStylist />
      <CartRecovery />
      <Editorial />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-0 h-[24rem] w-[24rem] rounded-full bg-rose-200/50 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pt-16 pb-20 sm:pt-24 sm:pb-28 lg:grid-cols-12 lg:gap-16 lg:px-6">
        <div className="lg:col-span-6 lg:pt-12">
          <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-stone-500">
            Пролет / Лято · 2026
          </p>
          <h1 className="mt-6 font-serif text-5xl leading-[1.04] tracking-tight text-stone-950 sm:text-6xl lg:text-[5rem]">
            Тиха революция
            <br />
            <em className="font-serif italic text-rose-700">
              в българската мода.
            </em>
          </h1>
          <p className="mt-7 max-w-md text-base leading-relaxed text-stone-600">
            Лимитирани серии. Натурални материали. Никакви компромиси. Всяка
            дреха минава през ръцете на четирима майстори в нашето ателие на
            ул. Цар Освободител в София.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#collection"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-950 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.22em] text-white transition-all hover:bg-rose-700"
            >
              Разгледай колекцията
            </a>
            <a
              href="#atelier"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-950 px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.22em] text-stone-950 transition-all hover:bg-stone-950 hover:text-white"
            >
              Запази час в ателието
            </a>
          </div>

          <div className="mt-14 flex items-center gap-8 border-t border-stone-200 pt-6 text-[11px] uppercase tracking-[0.22em] text-stone-500">
            <span>Made in Bulgaria</span>
            <span aria-hidden="true">·</span>
            <span>Limited 50 pcs</span>
            <span aria-hidden="true">·</span>
            <span>Slow fashion</span>
          </div>
        </div>

        {/* Hero panel — boutique rack photo layered under the
            season's flagship serif wordmark. Reads as a print-ad
            spread, but with real material rather than a colour field
            alone. The blush gradient stays as the fallback bg so the
            panel never collapses to white if the photo is slow. */}
        <div className="lg:col-span-6">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-gradient-to-br from-rose-200 via-[#F4DDD1] to-stone-200">
            <Image
              src="/projects/roze/hero-coat.jpg"
              alt="Курирана закачалка с дрехи в ателието на ROZÉ"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {/* Warm peach wash folds the photo into the ROZÉ palette. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-br from-rose-100/40 via-[#F4DDD1]/30 to-stone-100/30 mix-blend-multiply"
            />
            {/* Soft bottom cream lift so the serif wordmark reads
                cleanly against any hangers in the lower third. */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-stone-50/85 via-stone-50/45 to-transparent"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.55),_transparent_55%)]"
            />
            <div className="absolute inset-0 flex flex-col justify-between p-8 sm:p-10">
              <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.32em] text-stone-700">
                <span>Колекция · 12 части</span>
                <span>№ 01 / 26</span>
              </div>
              <div>
                <p className="font-serif text-5xl leading-none tracking-tight text-stone-950 sm:text-6xl">
                  Палто
                  <br />
                  <em className="italic text-rose-800">«София»</em>
                </p>
                <p className="mt-4 text-sm leading-relaxed text-stone-700">
                  Мериносова вълна, ръчна изработка, едносезонна серия.
                </p>
                <p className="mt-2 font-mono text-xs uppercase tracking-[0.22em] text-stone-600">
                  980 лв · в наличност
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Collection() {
  return (
    <section
      id="collection"
      className="border-t border-stone-200 bg-[#FBF6F1] py-20"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-stone-500">
              Колекция · Пролет 2026
            </p>
            <h2 className="mt-3 font-serif text-3xl tracking-tight text-stone-950 sm:text-4xl">
              Избрани части
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-600">
              Шест от дванадесетте части в новата серия. Всяка е в наличност в
              лимитирани бройки — щом свърши, не се прави отново.
            </p>
          </div>
          <a
            id="shop"
            href="#stylist"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-stone-950 transition-colors hover:text-rose-700"
          >
            Виж цялата колекция →
          </a>
        </div>

        {/* Client-component grid wired to the cart context — every
            card is a real button that adds to the drawer. */}
        <ProductGrid />
      </div>
    </section>
  );
}

function BrandStory() {
  return (
    <section
      id="atelier"
      className="border-t border-stone-200 bg-stone-950 py-24 text-stone-100"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-2 lg:items-center lg:px-6">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-rose-300">
            Ателието
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-[1.05] tracking-tight text-white sm:text-5xl">
            От ръка до гардероб —{" "}
            <em className="italic text-rose-300">бавна мода с име.</em>
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-stone-300">
            ROZÉ започна като малък ъгъл в апартамент в центъра на София.
            Днес всяка дреха минава през четирима майстори: модельер, плетач,
            шивач и финален контрол. Никаква конвейерна линия, никакви
            анонимни фабрики.
          </p>

          <ul className="mt-10 grid gap-5 sm:grid-cols-3">
            {[
              {
                title: "Ръчна изработка",
                body: "Между 12 и 40 часа труд за всяка дреха.",
              },
              {
                title: "Български материали",
                body: "Вълна от Родопите, лен от Тракия, кожа от Шумен.",
              },
              {
                title: "Лимитирани серии",
                body: "До 50 бройки от модел, после се пенсионира.",
              },
            ].map((p) => (
              <li
                key={p.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-300">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-300">
                  {p.body}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative aspect-[5/6] overflow-hidden rounded-[28px] bg-gradient-to-br from-rose-300/40 via-stone-800 to-stone-950">
          <Image
            src="/projects/roze/atelier.jpg"
            alt="Закачалка с плетива и палта в ателието на ROZÉ в София"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          {/* Heavy bottom-to-top dark gradient so the founder-quote
              serif at the bottom prints crisp white over the photo. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-stone-950/15"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(244,221,209,0.18),_transparent_60%)]"
          />
          <div className="absolute inset-0 flex flex-col justify-between p-8 sm:p-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-rose-200">
              Ателие · ул. Цар Освободител 14, София
            </p>
            <div>
              <p className="font-serif text-3xl leading-tight text-white sm:text-4xl">
                «Никой никога не е сгрешил{" "}
                <em className="italic text-rose-200">
                  с по-малко, по-добре.»
                </em>
              </p>
              <p className="mt-4 text-sm uppercase tracking-[0.22em] text-stone-400">
                — Розе Стоянова, основател
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Live Personal Stylist section — the right-hand column hosts a real
 * streaming GPT-4o chat (`PersonalStylistChat`) wired to
 * `/api/boutique-stylist/chat`; the model is grounded in the same
 * `ROZE_PRODUCTS` catalogue that drives the product grid + cart
 * drawer, and any product it recommends becomes a one-tap add-to-cart
 * button via the shell's RozeCart context.
 */
function PersonalStylist() {
  return (
    <section
      id="stylist"
      className="border-t border-stone-200 bg-[#F4ECE3] py-20"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-2 lg:items-center lg:px-6">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-rose-700">
            Личен AI стилист · работещо демо
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-stone-950 sm:text-4xl">
            Един въпрос. Готов гардероб.
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-stone-700">
            Опитайте го отдясно — стилистът отговаря в реално време, познава
            точно нашите 6 части и може да ги добави директно в кошницата ви.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-stone-700">
            {[
              "Препоръчва само налични в момента бройки",
              "Сглобява цели гардероби, не само отделни части",
              "Един клик добавя препоръката в кошницата",
              "Поверителен — данните не напускат сайта",
            ].map((line) => (
              <li key={line} className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="mt-0.5 h-4 w-4 flex-none text-rose-700"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                    clipRule="evenodd"
                  />
                </svg>
                {line}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[11px] uppercase tracking-[0.32em] text-rose-700">
            +19% средна стойност на поръчка
          </p>
        </div>

        <PersonalStylistChat />
      </div>
    </section>
  );
}

function CartRecovery() {
  return (
    <section className="border-t border-stone-200 bg-[#FBF6F1] py-20">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-[3fr_4fr] lg:items-center lg:px-6">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-rose-700">
            Възстановяване на кошницата
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-stone-950 sm:text-4xl">
            Учтиво напомняне.{" "}
            <em className="italic text-rose-700">Никога досадно.</em>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-stone-700">
            Когато клиент остави нещо в кошницата, AI-ът сглобява личен имейл
            на български със стилистична препоръка — не &laquo;последна
            бройка!!&raquo;. Резултатът: 28% от изоставените кошници се
            завършват, а никой не се чувства преследван.
          </p>
          <p className="mt-6 text-[11px] uppercase tracking-[0.32em] text-rose-700">
            28% възстановени кошници · 0 спам оплаквания
          </p>
        </div>

        {/* Email mockup */}
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-5 py-3 text-[11px] uppercase tracking-[0.22em] text-stone-500">
            <span>От: atelier@roze.bg</span>
            <span>преди 2 часа</span>
          </div>
          <div className="px-7 py-7 sm:px-10 sm:py-9">
            <p className="font-serif text-2xl leading-tight text-stone-950 sm:text-3xl">
              Мария, &laquo;Орхидея&raquo; ви чака.
            </p>
            <p className="mt-5 text-sm leading-relaxed text-stone-700">
              Видях, че разглеждате копринената рокля &laquo;Орхидея&raquo;
              миналата седмица. От серията остават 4 бройки в S — и тъй като
              споменахте сватба, ще ви предложа и шала &laquo;Розова
              долина&raquo;, който върви добре с нея.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-stone-200 bg-rose-50 p-3">
                <div className="aspect-[4/5] rounded-lg bg-gradient-to-br from-rose-300 via-rose-200 to-[#F4DDD1]" />
                <p className="mt-2 font-serif text-sm text-stone-950">
                  Орхидея
                </p>
                <p className="font-mono text-xs text-stone-600">720 лв</p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-rose-50 p-3">
                <div className="aspect-[4/5] rounded-lg bg-gradient-to-br from-rose-200 via-[#F4DDD1] to-stone-100" />
                <p className="mt-2 font-serif text-sm text-stone-950">
                  Розова долина
                </p>
                <p className="font-mono text-xs text-stone-600">290 лв</p>
              </div>
            </div>
            <a
              href="#collection"
              className="mt-7 inline-flex items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-rose-700"
            >
              Завърши поръчката
            </a>
            <p className="mt-5 text-[11px] uppercase tracking-[0.22em] text-stone-400">
              Ако не желаете повече такива писма, отписване с един клик.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Editorial() {
  const cards = [
    {
      title: "Какво да облечеш на сватба през пролетта",
      tag: "Гардероб",
      gradient: "from-rose-200 via-[#F4DDD1] to-stone-200",
    },
    {
      title: "Грижа за кашмирен пуловер: 4 правила",
      tag: "Грижа",
      gradient: "from-stone-200 via-stone-100 to-stone-300",
    },
    {
      title: "Зад кулисите на ателието в София",
      tag: "Ателие",
      gradient: "from-amber-200 via-rose-100 to-stone-200",
    },
  ] as const;
  return (
    <section className="border-t border-stone-200 bg-[#F4ECE3] py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-stone-500">
              Списание ROZÉ
            </p>
            <h2 className="mt-3 font-serif text-3xl tracking-tight text-stone-950 sm:text-4xl">
              За четене с чай
            </h2>
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-stone-950 transition-colors hover:text-rose-700"
          >
            Всички статии →
          </a>
        </div>
        <ul className="mt-10 grid gap-7 sm:grid-cols-3">
          {cards.map((c) => (
            <li
              key={c.title}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-stone-200 bg-white"
            >
              <div
                className={`aspect-[4/3] bg-gradient-to-br ${c.gradient} transition-transform duration-500 group-hover:scale-105`}
              />
              <div className="px-5 py-5">
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-rose-700">
                  {c.tag}
                </p>
                <p className="mt-2 font-serif text-lg leading-snug text-stone-950">
                  {c.title}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
