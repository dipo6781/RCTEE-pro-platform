/* ────────────────────────────────────────────────────────────────────────────
   R-C-T-E-E PRO · Inteligencia comercial
   Nichos Rentables (ledger de servicios) y Mercado (demanda, precios, señales).
   ──────────────────────────────────────────────────────────────────────────── */

import { useEffect, useState } from "react";
import { MERCADO_DEMANDA, MERCADO_SENALES, MERCADO_TIERS, RENTABLES, type Nicho } from "../data";
import { Icon, ViewHeader } from "../chrome";
import { Reveal } from "../ui";

/* ── Nichos Rentables ──────────────────────────────────────────────────────── */

function Dots({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`h-1.5 w-1.5 rounded-full ${i <= n ? "bg-jade" : "bg-line-2"}`} />
      ))}
    </span>
  );
}

const DIF_COLOR: Record<Nicho["dificultad"], string> = {
  Baja: "bg-jade/10 text-jade",
  Media: "bg-honey/15 text-honey",
  Alta: "bg-ember/10 text-ember",
};

export function Rentables({ onUse }: { onUse: (n: Nicho) => void }) {
  const avg = (RENTABLES.reduce((a, r) => a + r.demanda, 0) / RENTABLES.length).toFixed(1);
  return (
    <div>
      <ViewHeader
        eyebrow="Módulo 05 · Monetización"
        title="Nichos rentables de prompt engineering"
        desc="8 servicios empaquetables con precio de mercado, demanda estimada y dificultad de ejecución. Cada nicho carga su prompt base directamente en el Generador Clásico."
        right={
          <div className="rounded-md border border-line bg-surface px-4 py-2.5 text-center">
            <p className="num-display text-2xl font-extrabold leading-none text-jade">{avg}/5</p>
            <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-mist">demanda media</p>
          </div>
        }
      />

      <div className="space-y-3">
        {RENTABLES.map((r, i) => (
          <Reveal key={r.id} delay={Math.min(i * 60, 300)}>
            <article className="panel panel-hover group relative flex flex-col gap-4 overflow-hidden p-5 sm:flex-row sm:items-center sm:gap-6">
              <span className="absolute inset-y-0 left-0 w-1 bg-line transition-colors duration-300 group-hover:bg-jade" />
              <span className="num-display w-12 shrink-0 text-[34px] font-extrabold leading-none text-line-2 transition-colors group-hover:text-jade">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-[16.5px] font-extrabold text-ink">{r.titulo}</h3>
                  <span className="rounded-full bg-cobalt/10 px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wide text-cobalt">{r.nicho}</span>
                </div>
                <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-mist">{r.desc}</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11.5px] font-bold text-honey">
                    <Icon name="rentables" className="h-3.5 w-3.5" /> {r.ticket}
                  </span>
                  <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-semibold text-mist">
                    demanda <Dots n={r.demanda} />
                  </span>
                  <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide ${DIF_COLOR[r.dificultad]}`}>
                    dificultad {r.dificultad.toLowerCase()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onUse(r)}
                className="press inline-flex shrink-0 items-center gap-2 self-start rounded-md bg-ink px-4 py-2.5 font-mono text-xs font-bold text-paper hover:bg-jade sm:self-center"
              >
                Cargar en Generador <Icon name="arrow" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* ── Inteligencia de Mercado ───────────────────────────────────────────────── */

function Barras() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOn(true), 150);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="space-y-3.5">
      {MERCADO_DEMANDA.map((d) => (
        <div key={d.sector} className="grid grid-cols-[110px_1fr_auto] items-center gap-3 sm:grid-cols-[150px_1fr_auto]">
          <p className="truncate font-display text-[13px] font-bold text-ink">{d.sector}</p>
          <div className="relative h-6 overflow-hidden rounded-md bg-line/50">
            <div
              className="bar-fill absolute inset-y-0 left-0 flex items-center justify-end rounded-md pr-2"
              style={{ width: on ? `${d.indice}%` : "0%", backgroundColor: d.indice >= 85 ? "#0f7a55" : d.indice >= 75 ? "#2e5eaa" : "#5f6d63" }}
            >
              <span className="font-mono text-[10px] font-bold text-surface">{d.indice}</span>
            </div>
          </div>
          <span className="w-14 text-right font-mono text-[11px] font-bold text-jade">{d.crecimiento}</span>
        </div>
      ))}
      <p className="pt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-mist">Índice de demanda 0–100 · crecimiento interanual del servicio</p>
    </div>
  );
}

export function Mercado() {
  const badgeHex: Record<string, string> = { cobalt: "#2e5eaa", jade: "#0f7a55", ember: "#e4572e" };
  return (
    <div>
      <ViewHeader
        eyebrow="Módulo 06 · Inteligencia de mercado"
        title="Demanda, precios y señales"
        desc="Lectura ejecutiva del mercado de prompt engineering empresarial: demanda por sector, estructura de precios por nivel de servicio y señales de tendencia."
      />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Reveal>
          <div className="panel h-full p-6">
            <h3 className="mb-5 font-display text-lg font-extrabold text-ink">Demanda por sector</h3>
            <Barras />
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="panel h-full p-6">
            <h3 className="mb-5 font-display text-lg font-extrabold text-ink">Estructura de precios</h3>
            <div className="space-y-3">
              {MERCADO_TIERS.map((t, i) => (
                <div key={t.nombre} className={`rounded-lg border p-4 transition-transform hover:-translate-y-0.5 ${i === 1 ? "border-jade bg-jade/5" : "border-line bg-surface"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-[15px] font-extrabold text-ink">{t.nombre}</p>
                    <span className="rounded-full px-2.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wide text-surface" style={{ backgroundColor: badgeHex[t.badgeColor] }}>
                      {t.badge}
                    </span>
                  </div>
                  <p className="num-display mt-1 text-[22px] font-extrabold text-jade">{t.rango}</p>
                  <ul className="mt-2.5 space-y-1.5">
                    {t.incluye.map((x) => (
                      <li key={x} className="flex items-start gap-2 text-[12.5px] text-mist">
                        <svg viewBox="0 0 24 24" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-jade" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-6">
        <div className="panel p-6">
          <h3 className="mb-4 font-display text-lg font-extrabold text-ink">Señales de tendencia</h3>
          <div className="grid gap-2.5 md:grid-cols-2">
            {MERCADO_SENALES.map((s) => (
              <div key={s.texto} className="flex items-center gap-3.5 rounded-md border border-line bg-paper/60 px-4 py-3.5 transition-colors hover:border-line-2">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-bold ${
                    s.dir === "up" ? "bg-jade/10 text-jade" : "bg-ember/10 text-ember"
                  }`}
                >
                  {s.delta}
                </span>
                <p className="text-[13px] font-medium leading-snug text-ink">{s.texto}</p>
              </div>
            ))}
            <div className="flex items-center gap-3.5 rounded-md bg-pine px-4 py-3.5 text-paper">
              <Icon name="spark" className="h-5 w-5 shrink-0 text-[#ecc06a]" />
              <p className="text-[13px] font-medium leading-snug text-paper/90">
                Tesis: el valor migra del prompt suelto al <span className="font-bold text-[#7ee2b4]">sistema versionado</span> — plantillas con variables, validación y trazabilidad.
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
