import Image from "next/image";
import { KoreReceptionist } from "components/ai/kore-receptionist";
import { ScheduleSlot } from "components/projects/kore/schedule-slot";

export const metadata = {
  title: "KORE — Functional fitness studio in Sofia",
  description:
    "Group classes, functional training, and 24/7 access. Book your first session through our front desk — replies in seconds, day or night.",
};

/**
 * KORE — fitness studio demo at /projects/local-fitness-studio.
 *
 * The whole page reads as an independent brand site (warm orange/cream
 * palette, no portfolio chrome — see KoreShell). The "live demo"
 * proof point is the AIReceptionist section: a real, streaming GPT-4o
 * chat grounded in the studio's published schedule + memberships,
 * which dramatises the homepage's "+340% bookings · 0 missed calls"
 * metric instead of just claiming it.
 */
export default function KoreStudioPage() {
  return (
    <>
      <Hero />
      <ClassTypes />
      <SchedulePreview />
      <AIReceptionist />
      <Memberships />
      <Coaches />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Warm-blob backdrop. Pure CSS — fitness studios don't need
          stock-photo cliches. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full bg-orange-300/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-lime-300/30 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:py-28 lg:grid-cols-[3fr_2fr] lg:items-end lg:px-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-600">
            Sofia · Open today till 23:00
          </p>
          <h1 className="mt-4 text-balance text-5xl font-black uppercase leading-[0.95] tracking-tight text-neutral-950 sm:text-6xl lg:text-7xl">
            Move better.
            <br />
            <span className="text-orange-600">Live louder.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-neutral-700 sm:text-lg">
            Functional training, group classes, and 24/7 open-gym access — all
            under one roof in Граф Игнатиев. First class is on us.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#book"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-orange-600"
            >
              Book your first class
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href="#schedule"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-950 bg-transparent px-7 py-3.5 text-sm font-bold uppercase tracking-wider text-neutral-950 transition-all hover:bg-neutral-950 hover:text-white"
            >
              View schedule
            </a>
          </div>

          <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-orange-200 pt-8">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Members
              </dt>
              <dd className="mt-1 text-3xl font-black text-neutral-950">820</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Classes / week
              </dt>
              <dd className="mt-1 text-3xl font-black text-neutral-950">62</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Coaches
              </dt>
              <dd className="mt-1 text-3xl font-black text-neutral-950">11</dd>
            </div>
          </dl>
        </div>

        {/* Hero panel — real gym photo behind the "this week's
            hours" typography overlay. The orange/lime gradient sits
            on top so the studio's brand colours still wash through
            the image, and the bottom darken-gradient keeps the
            tabular session lines crisp against any bright backplate
            in the photo. */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-neutral-950 p-8 text-white shadow-2xl">
          <Image
            src="/projects/kore/hero.jpg"
            alt="Dumbbell rack and a member training on the floor at KORE Sofia"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-neutral-950/45"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-orange-600/40 via-transparent to-lime-500/20 mix-blend-multiply"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/30 to-neutral-950/0"
          />
          <div className="relative flex h-full flex-col">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-300">
              Current intake
            </p>
            <p className="mt-3 text-7xl font-black leading-none tracking-tight sm:text-8xl">
              03
            </p>
            <p className="mt-2 text-sm font-medium text-neutral-300">
              spots left in this week&apos;s beginner block
            </p>
            <div className="mt-auto space-y-3 text-sm font-semibold">
              <div className="flex items-center justify-between border-t border-white/15 pt-3">
                <span>Next HIIT</span>
                <span className="font-mono text-orange-300">Today 18:30</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/15 pt-3">
                <span>Next Yoga Flow</span>
                <span className="font-mono text-orange-300">Tue 09:00</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/15 pt-3">
                <span>Next Strength</span>
                <span className="font-mono text-orange-300">Tomorrow 07:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const CLASSES = [
  {
    name: "HIIT",
    minutes: 45,
    intensity: "High",
    description:
      "Heart-rate spikes, full-body intervals, no time wasted. Walk in tired, walk out wrecked (in a good way).",
    accent: "bg-orange-500",
    image: "/projects/kore/hiit.jpg",
    alt: "Battle ropes drill outside the studio in golden hour light",
  },
  {
    name: "Strength",
    minutes: 60,
    intensity: "Mid–High",
    description:
      "Compound lifts (squat / hinge / push / pull) with progressive load. Coach scales every set to your level.",
    accent: "bg-neutral-950",
    image: "/projects/kore/strength.jpg",
    alt: "Lifter mid-rep with an EZ-curl bar in a studio setting",
  },
  {
    name: "Yoga Flow",
    minutes: 60,
    intensity: "Low–Mid",
    description:
      "Vinyasa-led mobility, breath, and recovery. The class people come back to after a long week at a desk.",
    accent: "bg-lime-500",
    image: "/projects/kore/yoga.jpg",
    alt: "Group yoga tree pose on a sunlit beach",
  },
  {
    name: "Conditioning",
    minutes: 45,
    intensity: "Mid–High",
    description:
      "Mixed-modal conditioning — barbell complexes, sled pushes, and ergometer finishers. Lung-burner with technical demands.",
    accent: "bg-rose-500",
    image: "/projects/kore/cycle.jpg",
    alt: "Loaded barbell mid-pull from overhead view with orange wrist wrap",
  },
] as const;

function ClassTypes() {
  return (
    <section
      id="classes"
      className="border-t border-orange-200/70 bg-white py-20"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-600">
            What we run
          </p>
          <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-neutral-950 sm:text-4xl">
            Four formats. Every level.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-neutral-600">
            Pick the format that fits today. Most members rotate between two —
            we&apos;ll help you build the right mix on day one.
          </p>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CLASSES.map((c) => (
            <li
              key={c.name}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-orange-50/40 transition-all hover:-translate-y-0.5 hover:border-neutral-950 hover:shadow-lg"
            >
              {/* Class hero image — sits at the top of the card,
                  zooms in on hover. The accent bar from the original
                  design now lives at the bottom of the photo as a
                  full-width colour stripe. */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-200">
                <Image
                  src={c.image}
                  alt={c.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span
                  className={`absolute inset-x-0 bottom-0 block h-1.5 ${c.accent}`}
                  aria-hidden="true"
                />
              </div>
              <div className="flex flex-col p-6">
                <h3 className="text-2xl font-black uppercase tracking-tight text-neutral-950">
                  {c.name}
                </h3>
                <div className="mt-2 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  <span>{c.minutes} min</span>
                  <span aria-hidden="true">·</span>
                  <span>{c.intensity}</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-neutral-700">
                  {c.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const SCHEDULE_DAYS = [
  {
    day: "Mon",
    date: "04",
    sessions: [
      { time: "07:00", name: "Strength A", coach: "Иван", spots: 2 },
      { time: "12:30", name: "HIIT Express", coach: "Мария", spots: 5 },
      { time: "18:30", name: "Yoga Flow", coach: "Радост", spots: 8 },
    ],
  },
  {
    day: "Tue",
    date: "05",
    sessions: [
      { time: "06:30", name: "Conditioning", coach: "Калоян", spots: 3 },
      { time: "09:00", name: "Yoga Flow", coach: "Радост", spots: 11 },
      { time: "19:00", name: "Strength B", coach: "Иван", spots: 0 },
    ],
  },
  {
    day: "Wed",
    date: "06",
    sessions: [
      { time: "07:30", name: "HIIT", coach: "Мария", spots: 4 },
      { time: "13:00", name: "Mobility", coach: "Радост", spots: 9 },
      { time: "18:00", name: "Strength A", coach: "Иван", spots: 1 },
    ],
  },
  {
    day: "Thu",
    date: "07",
    sessions: [
      { time: "06:30", name: "Conditioning", coach: "Калоян", spots: 6 },
      { time: "12:30", name: "HIIT Express", coach: "Мария", spots: 7 },
      { time: "19:30", name: "Yoga Flow", coach: "Радост", spots: 10 },
    ],
  },
] as const;

function SchedulePreview() {
  return (
    <section
      id="schedule"
      className="border-t border-orange-200/70 bg-orange-50/60 py-20"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-600">
              This week
            </p>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-neutral-950 sm:text-4xl">
              Schedule
            </h2>
            <p className="mt-4 text-base leading-relaxed text-neutral-700">
              First four days of the week — full schedule lives in the booking
              app. Tap a slot to ask the KORE Assistant to book it for you.
            </p>
          </div>
          <a
            href="#book"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-950 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-950 transition-all hover:bg-neutral-950 hover:text-white"
          >
            Open full schedule →
          </a>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SCHEDULE_DAYS.map((d) => (
            <div
              key={d.day}
              className="rounded-2xl border border-neutral-200 bg-white p-5"
            >
              <div className="flex items-baseline justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">
                  {d.day}
                </p>
                <p className="text-2xl font-black tabular-nums text-neutral-950">
                  {d.date}
                </p>
              </div>
              <ul className="mt-4 space-y-3">
                {d.sessions.map((s) => (
                  <li key={`${d.day}-${s.time}`}>
                    <ScheduleSlot
                      day={d.day}
                      date={d.date}
                      time={s.time}
                      name={s.name}
                      coach={s.coach}
                      spots={s.spots}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Live AI receptionist section. The right-hand column hosts a real
 * streaming GPT-4o chat (KoreReceptionist) wired to
 * `/api/fitness-studio/chat`; the model is grounded in this page's
 * published schedule + memberships so visitors can actually try the
 * booking flow that the homepage advertises ("+340% bookings ·
 * 0 missed calls"), not just read about it.
 */
function AIReceptionist() {
  return (
    <section
      id="book"
      className="border-t border-orange-200/70 bg-neutral-950 py-20 text-white"
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-2 lg:items-center lg:px-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-400">
            After-hours bookings · live demo
          </p>
          <h2 className="mt-3 text-3xl font-black uppercase tracking-tight sm:text-4xl">
            The front desk is{" "}
            <span className="text-orange-400">always open.</span>
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-neutral-300">
            Try it — the receptionist on the right is real, streaming, and
            grounded in the schedule and memberships above. Ask about a class,
            book a slot, or compare the membership tiers.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              "Replies in under 4 seconds, 24/7",
              "Reads the published schedule before quoting a slot",
              "Stripe checkout for drop-ins, no app install",
              "Forwards anything sensitive to a coach by SMS",
            ].map((line) => (
              <li key={line} className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="mt-0.5 h-4 w-4 flex-none text-orange-400"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-neutral-200">{line}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-xs uppercase tracking-[0.22em] text-orange-300">
            +340% bookings · 0 missed calls
          </p>
        </div>

        <KoreReceptionist />
      </div>
    </section>
  );
}

const TIERS = [
  {
    name: "Drop-in",
    price: "25 лв",
    cadence: "/ class",
    perks: [
      "Pay as you go — no commitment",
      "Any class on the schedule",
      "Locker + towel included",
    ],
    cta: "Book a class",
    featured: false,
  },
  {
    name: "Monthly",
    price: "149 лв",
    cadence: "/ month",
    perks: [
      "Unlimited group classes",
      "24/7 open-gym access",
      "Free intro session with a coach",
      "Friend-pass: 2 guests / month",
    ],
    cta: "Start monthly",
    featured: true,
  },
  {
    name: "Annual",
    price: "1 490 лв",
    cadence: "/ year",
    perks: [
      "Everything in Monthly",
      "Save 290 лв vs monthly",
      "Quarterly coach 1-on-1 (4 / year)",
      "Priority class booking",
    ],
    cta: "Go annual",
    featured: false,
  },
] as const;

function Memberships() {
  return (
    <section
      id="memberships"
      className="border-t border-orange-200/70 bg-white py-20"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-600">
            Memberships
          </p>
          <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-neutral-950 sm:text-4xl">
            Pick your pace.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-neutral-600">
            Cancel monthly, no hidden fees, no joining fee. First class is on
            the house — book it through the KORE Assistant above.
          </p>
        </div>
        <ul className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-3">
          {TIERS.map((t) => {
            const featured = t.featured;
            return (
              <li
                key={t.name}
                className={`relative flex flex-col rounded-2xl p-7 ${
                  featured
                    ? "bg-neutral-950 text-white shadow-2xl"
                    : "border border-neutral-200 bg-orange-50/30 text-neutral-950"
                }`}
              >
                {featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                    Most popular
                  </span>
                )}
                <h3 className="text-xs font-bold uppercase tracking-[0.22em]">
                  {t.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <p className="text-4xl font-black tracking-tight">
                    {t.price}
                  </p>
                  <p
                    className={`text-sm ${featured ? "text-neutral-400" : "text-neutral-500"}`}
                  >
                    {t.cadence}
                  </p>
                </div>
                <ul
                  className={`mt-6 flex-1 space-y-2.5 text-sm ${featured ? "text-neutral-200" : "text-neutral-700"}`}
                >
                  {t.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className={`mt-0.5 h-4 w-4 flex-none ${featured ? "text-orange-400" : "text-orange-600"}`}
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#book"
                  className={`mt-7 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                    featured
                      ? "bg-orange-500 text-white hover:bg-orange-400"
                      : "border border-neutral-950 text-neutral-950 hover:bg-neutral-950 hover:text-white"
                  }`}
                >
                  {t.cta}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Coaches() {
  const coaches = [
    { name: "Иван", role: "Head of Strength" },
    { name: "Мария", role: "HIIT lead" },
    { name: "Радост", role: "Yoga & Mobility" },
    { name: "Калоян", role: "Conditioning" },
  ] as const;

  return (
    <section
      id="coaches"
      className="border-t border-orange-200/70 bg-orange-100/40 py-20"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-600">
            The team
          </p>
          <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-neutral-950 sm:text-4xl">
            Coaches who actually coach.
          </h2>
        </div>
        <ul className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-5 sm:grid-cols-4">
          {coaches.map((c, idx) => (
            <li
              key={c.name}
              className="rounded-2xl border border-orange-200 bg-white p-5 text-center"
            >
              <div
                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-xl font-black uppercase tracking-tight text-white ${
                  ["bg-orange-500", "bg-neutral-950", "bg-lime-500", "bg-rose-500"][
                    idx % 4
                  ]
                }`}
                aria-hidden="true"
              >
                {c.name.slice(0, 1)}
              </div>
              <p className="mt-3 text-base font-black uppercase tracking-tight text-neutral-950">
                {c.name}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                {c.role}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
