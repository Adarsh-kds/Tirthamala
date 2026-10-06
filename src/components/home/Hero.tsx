import Link from "next/link";
import { t } from "@/lib/i18n";
import { Mandala } from "../motifs/Mandala";
import { Mountains, Stars, Temples } from "../motifs/Skyline";
import { Lotus } from "../motifs/Ornament";
import { HeroParallax, HeroSearch } from "./HeroClient";

type Chip = { slug: string; name: string };
type Stat = { value: number; label: string };

const EMBERS = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 61) % 100}%`,
  delay: `${(i * 1.7) % 11}s`,
  dur: `${11 + ((i * 3) % 9)}s`,
  size: `${2 + (i % 3)}px`,
}));

export function Hero({ chips, stats }: { chips: Chip[]; stats: Stat[] }) {
  return (
    <HeroParallax className="hero">
      <div className="hero-sky" aria-hidden="true" />
      <div className="hero-layer hero-stars" aria-hidden="true">
        <Stars />
      </div>
      <div className="hero-halo" aria-hidden="true" />
      <div className="hero-layer hero-mandala" aria-hidden="true">
        <Mandala className="mandala-spin h-full w-full" />
      </div>
      <div className="hero-layer hero-mountains" aria-hidden="true">
        <Mountains />
      </div>
      <div className="hero-river" aria-hidden="true">
        <div className="hero-reflection">
          <Temples id="reflect" lamps={false} />
        </div>
        <span className="float-diya" style={{ left: "18%", animationDelay: "0s" }} />
        <span className="float-diya" style={{ left: "41%", animationDelay: "-6s" }} />
        <span className="float-diya" style={{ left: "63%", animationDelay: "-12s" }} />
        <span className="float-diya" style={{ left: "82%", animationDelay: "-3s" }} />
      </div>
      <div className="hero-layer hero-temples" aria-hidden="true">
        <Temples id="main" />
      </div>
      <div className="hero-smoke" aria-hidden="true">
        <span style={{ left: "13%" }} />
        <span style={{ left: "52%", animationDelay: "-4s" }} />
        <span style={{ left: "78%", animationDelay: "-8s" }} />
      </div>
      <div className="hero-embers" aria-hidden="true">
        {EMBERS.map((e, i) => (
          <span
            key={i}
            style={{
              left: e.left,
              animationDelay: e.delay,
              animationDuration: e.dur,
              width: e.size,
              height: e.size,
            }}
          />
        ))}
      </div>
      <div className="hero-cursor" aria-hidden="true" />

      <div className="hero-content">
        <div className="hero-om" aria-hidden="true">
          <span lang="sa" className="font-sanskrit">
            ॐ
          </span>
        </div>
        <p className="eyebrow hero-in" style={{ animationDelay: "0.15s" }}>
          {t("hero.eyebrow")}
        </p>
        <h1 id="hero-title" className="hero-title hero-in" style={{ animationDelay: "0.3s" }}>
          <span className="sr-only">{t("site.title")}</span>
          <span lang="sa" aria-hidden="true" className="font-sanskrit gold-text">
            {t("hero.titleSa")}
          </span>
        </h1>
        <p className="hero-tagline hero-in" style={{ animationDelay: "0.45s" }}>
          {t("hero.titleEn")}
        </p>
        <p className="hero-lede hero-in" style={{ animationDelay: "0.6s" }}>
          {t("hero.lede")}
        </p>
        <div className="hero-in mt-7 w-full max-w-xl" style={{ animationDelay: "0.75s" }}>
          <HeroSearch />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[0.8rem]">
            <span style={{ color: "var(--text-soft)" }}>{t("hero.popular")}</span>
            {chips.map((c) => (
              <Link key={c.slug} href={`/circuit/${c.slug}/`} className="chip">
                {c.name}
              </Link>
            ))}
          </div>
        </div>
        <dl className="hero-stats hero-in" style={{ animationDelay: "0.9s" }}>
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="font-display gold-text text-3xl font-semibold">{s.value}</span>
                <span aria-hidden="true">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <a href="#journeys" className="scroll-cue">
        <Lotus className="h-5 w-7" />
        <span>{t("hero.scroll")}</span>
      </a>
    </HeroParallax>
  );
}
