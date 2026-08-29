/* ────────────────────────────────────────────────────────────────────────────
   R-C-T-E-E PRO · Dashboard — consola central
   ──────────────────────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState } from "react";
import { EXTENSIONES, METODOLOGIA, TEMAS, TICKER, VERSION, type SectionId } from "../data";
import { pingOllama, timeAgo, type HistoryItem, type Settings } from "../engine";
import { Icon, Ticker } from "../chrome";
import { CountUp, Eyebrow, LetterChip, Meter, Reveal } from "../ui";

/* ── Terminal con typewriter ───────────────────────────────────────────────── */

const SAMPLE: { tag: string; cls: string; text: string }[] = [
  { tag: "[R]", cls: "term-tag-r", text: " Actúa como CFO interino de una fintech B2B…" },
  { tag: "[C]", cls: "term-tag-c", text: " La pasarela procesa $1.2M/mes; el churn subió 4.1 pp…" },
  { tag: "[T]", cls: "term-tag-t", text: " Diseña un plan de retención a 90 días con owner por iniciativa…" },
  { tag: "[E]", cls: "term-tag-e", text: " Formato: memo ejecutivo ≤ 400 palabras, tabla de impacto…" },
  { tag: "[E²]", cls: "term-tag-e2", text: " Ejemplo calibrado: entrada de churn → memo aceptado por comité…" },
  { tag: "✓", cls: "term-ok", text: " Prompt ensamblado · score 96/100 · export MD listo" },
];

function Terminal() {
  const [line, setLine] = useState(0);
  const [chars, setChars] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const current = SAMPLE[line];
    if (!current) return;
    if (chars < current.text.length) {
      timer.current = setTimeout(() => setChars((c) => c + 2), 26);
    } else {
      timer.current = setTimeout(
        () => {
          if (line < SAMPLE.length - 1) {
            setLine((l) => l + 1);
            setChars(0);
          } else {
            setLine(0);
            setChars(0);
          }
        },
        line === SAMPLE.length - 1 ? 3400 : 420
      );
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [line, chars]);

  return (
    <div className="term overflow-hidden rounded-lg">
      <div className="flex items-center gap-1.5 border-b border-pine-3/70 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-ember/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-honey/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-jade" />
        <span className="ml-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-paper/40">ensamblador · rctee --modo enterprise</span>
      </div>
      <div className="min-h-[196px] space-y-2 px-4 py-4 font-mono text-[12.5px] leading-relaxed">
        {SAMPLE.slice(0, line + 1).map((l, i) => {
          const isLast = i === line;
          const shown = isLast ? l.text.slice(0, chars) : l.text;
          return (
            <p key={i} className="flex">
              <span className={`w-9 shrink-0 font-bold ${l.cls}`}>{l.tag}</span>
              <span className="text-paper/85">
                {shown}
                {isLast && <span className="caret ml-0.5" />}
              </span>
            </p>
          );
        })}
      </div>
    </div>
  );
}

/* ── Anatomía interactiva del método ───────────────────────────────────────── */

function Anatomy() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-2">
      {METODOLOGIA.map((m, i) => {
        const active = open === i;
        return (
          <button
            key={m.key}
            onClick={() => setOpen(active ? null : i)}
            className={`panel panel-hover block w-full px-4 py-3.5 text-left transition-all ${active ? "border-line-2" : ""}`}
            style={active ? { borderColor: m.hex } : undefined}
          >
            <div className="flex items-center gap-3">
              <LetterChip letter={m.key} hex={m.hex} />
              <div className="min-w-0 flex-1">
                <p className="font-display text-[15px] font-bold text-ink">{m.nombre}</p>
                <p className={`text-xs leading-relaxed text-mist transition-all ${active ? "mt-0" : "truncate"}`}>{m.desc}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[11px] font-bold tabular-nums" style={{ color: m.hex }}>
                  {m.peso}%
                </p>
                <p className="font-mono text-[9px] uppercase tracking-wider text-mist">peso</p>
              </div>
            </div>
            <div
              className={`grid transition-all duration-300 ${active ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="overflow-hidden">
                <div className="rounded-md border-l-2 bg-paper px-3.5 py-2.5 text-[12.5px] leading-relaxed text-ink" style={{ borderColor: m.hex }}>
                  {m.guia}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ── Estado del sistema ────────────────────────────────────────────────────── */

export interface SyncState {
  enabled: boolean;
  configured: boolean;
  lastSync: number | null;
  unsynced: number;
}

function SystemStatus({ settings, history, sync }: { settings: Settings; history: HistoryItem[]; sync: SyncState }) {
  const [ollama, setOllama] = useState<"checking" | "ok" | "off">("checking");

  useEffect(() => {
    let alive = true;
    setOllama("checking");
    pingOllama(settings.ollamaUrl).then((ok) => {
      if (alive) setOllama(ok ? "ok" : "off");
    });
    return () => {
      alive = false;
    };
  }, [settings.ollamaUrl]);

  const kb = Math.max(1, Math.round(JSON.stringify(history).length / 102.4) / 10);
  const groqOk = settings.groqKey.trim().length > 8;

  const rows = [
    {
      label: "Groq Cloud",
      value: groqOk ? `API key presente · ${settings.groqModel}` : "Sin API key (respaldo local)",
      state: groqOk ? "ok" : "warn",
    },
    {
      label: "Ollama Local",
      value: ollama === "checking" ? "Comprobando conexión…" : ollama === "ok" ? `En línea · ${settings.ollamaModel}` : "Sin respuesta en el puerto",
      state: ollama === "checking" ? "warn" : ollama === "ok" ? "ok" : "off",
    },
    { label: "Persistencia", value: `localStorage · ${kb} KB usados`, state: "ok" },
    {
      label: "Sincronización Supabase",
      value:
        sync.enabled && sync.configured
          ? sync.unsynced > 0
            ? `${sync.unsynced} registro${sync.unsynced === 1 ? "" : "s"} pendiente${sync.unsynced === 1 ? "" : "s"} de subida`
            : sync.lastSync
              ? `Al día · última sync ${timeAgo(sync.lastSync)}`
              : "Activa · sin registros remotos aún"
          : sync.configured
            ? "Desactivada · actívala en Ajustes"
            : "Sin configurar · Ajustes → Supabase",
      state: sync.enabled && sync.configured ? (sync.unsynced > 0 ? "warn" : "ok") : "warn",
    },
    (() => {
      const activas = (settings.extensions ?? []).filter((id) => EXTENSIONES.some((e) => e.id === id));
      const extras = EXTENSIONES.filter((e) => activas.includes(e.id)).reduce((a, e) => a + e.subtema.plantillas.length, 0);
      return {
        label: "Extensiones",
        value: activas.length > 0 ? `${activas.length} activas · +${extras} plantillas en catálogo` : "Ninguna activa · instálalas en Ajustes",
        state: (activas.length > 0 ? "ok" : "warn") as "ok" | "warn",
      };
    })(),
  ] as const;

  return (
    <div className="space-y-2.5">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3 rounded-md border border-line bg-surface px-3.5 py-2.5">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              r.state === "ok" ? "bg-jade dot-live" : r.state === "warn" ? "bg-honey dot-warn" : "bg-danger"
            }`}
          />
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-mist">{r.label}</p>
            <p className="truncate text-[12.5px] font-medium text-ink">{r.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Dashboard ─────────────────────────────────────────────────────────────── */

export default function Dashboard({
  history,
  settings,
  goto,
  sync,
}: {
  history: HistoryItem[];
  settings: Settings;
  goto: (s: SectionId) => void;
  sync: SyncState;
}) {
  const extActivas = EXTENSIONES.filter((e) => (settings.extensions ?? []).includes(e.id));
  const totalPlantillas =
    TEMAS.reduce((a, t) => a + t.subtemas.reduce((b, s) => b + s.plantillas.length, 0), 0) +
    extActivas.reduce((a, e) => a + e.subtema.plantillas.length, 0);
  const totalSubtemas = TEMAS.reduce((a, t) => a + t.subtemas.length, 0) + extActivas.length;
  const recientes = history.slice(0, 3);

  /* tendencia de scores (cronológica, últimos 12 con score) */
  const scores = history
    .filter((h) => typeof h.score === "number")
    .map((h) => Math.min(100, Math.max(40, h.score as number)))
    .slice(0, 12)
    .reverse();
  const sparkPts =
    scores.length >= 2
      ? scores.map((s, i) => `${((i / (scores.length - 1)) * 112 + 4).toFixed(1)},${(29 - ((s - 40) / 60) * 24).toFixed(1)}`).join(" ")
      : "";

  return (
    <div className="space-y-10">
      {/* ── Cubierta de mando ── */}
      <section className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:gap-10">
        <div>
          <Eyebrow>Consola de arquitectura de prompts · v{VERSION}</Eyebrow>
          <h2 className="mt-3 font-display text-[clamp(2.1rem,4.6vw,3.6rem)] font-extrabold leading-[1.02] tracking-tight text-ink">
            Prompts de nivel
            <br />
            enterprise,
            <span className="text-jade"> ensamblados</span>
            <br />
            con método.
          </h2>
          <div className="mt-4 flex items-center gap-1.5">
            {METODOLOGIA.map((m) => (
              <span
                key={m.key}
                className="inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 font-display text-lg font-extrabold text-surface transition-transform hover:-translate-y-1"
                style={{ backgroundColor: m.hex, boxShadow: `0 4px 12px -4px ${m.hex}88` }}
                title={m.nombre}
              >
                {m.key}
              </span>
            ))}
            <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.2em] text-mist">Rol · Contexto · Tarea · Esp. · Ejemplos</span>
          </div>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-mist">
            Genera, valida y exporta prompts empresariales con validación de contexto (≥ 80 caracteres), Chain of Thought, auto-verificación y
            plantillas con variables dinámicas por sector.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => goto("clasico")}
              className="press inline-flex items-center gap-2 rounded-md bg-jade px-5 py-3 font-display text-[14.5px] font-bold text-surface shadow-[0_8px_20px_-8px_rgba(15,122,85,0.7)] hover:bg-jade-2"
            >
              Abrir Generador Clásico
              <Icon name="arrow" className="h-4 w-4" />
            </button>
            <button
              onClick={() => goto("plantillas")}
              className="press inline-flex items-center gap-2 rounded-md border border-line-2 bg-surface px-5 py-3 font-display text-[14.5px] font-bold text-ink hover:border-jade hover:text-jade"
            >
              Explorar {totalPlantillas} plantillas
            </button>
          </div>
          <div className="mt-7">
            <Terminal />
          </div>
        </div>

        <Reveal delay={120}>
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-display text-lg font-extrabold text-ink">Anatomía del método</h3>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist">click para expandir</span>
          </div>
          <Anatomy />
        </Reveal>
      </section>

      <Ticker items={TICKER} />

      {/* ── Métricas ── */}
      <Reveal>
        <section className="panel grid grid-cols-2 divide-line max-lg:[&>*:nth-child(-n+2)]:border-b lg:grid-cols-4 lg:divide-x">
          {[
            { v: history.length, label: "Prompts en historial", sub: "persistencia local activa" },
            { v: totalPlantillas, label: "Plantillas por sector", sub: `${TEMAS.length} temas · ${totalSubtemas} subtemas${extActivas.length > 0 ? ` · ${extActivas.length} ext.` : ""}` },
            { v: 8, label: "Personalidades IA", sub: "chatbot especializado" },
            { v: settings.mode === "cloud" ? 12 : 20, label: settings.mode === "cloud" ? "s · latencia Groq" : "s timeout Ollama", sub: settings.mode === "cloud" ? "modo cloud activo" : "modo local activo" },
          ].map((s, i) => (
            <div key={i} className="px-6 py-5">
              <p className="num-display text-[34px] font-extrabold leading-none text-ink">
                <CountUp to={s.v} />
              </p>
              <p className="mt-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink">{s.label}</p>
              <p className="mt-0.5 text-xs text-mist">{s.sub}</p>
            </div>
          ))}
        </section>
      </Reveal>

      {/* ── Trabajo reciente + accesos + sistema ── */}
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Reveal>
          <div className="panel h-full p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="font-display text-lg font-extrabold text-ink">Reanudar trabajo</h3>
              {scores.length >= 2 ? (
                <span className="flex items-center gap-2.5" title="Tendencia de los últimos scores">
                  <svg viewBox="0 0 120 32" className="h-8 w-[110px]">
                    <polyline points={sparkPts} fill="none" stroke="#0f7a55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    {(() => {
                      const last = sparkPts.split(" ").pop()?.split(",");
                      return last ? <circle cx={last[0]} cy={last[1]} r="3" fill="#e4572e" /> : null;
                    })()}
                  </svg>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist">tendencia</span>
                </span>
              ) : (
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist">{history.length} totales</span>
              )}
            </div>
            {recientes.length === 0 ? (
              <div className="rounded-lg border border-dashed border-line-2 px-6 py-10 text-center">
                <p className="font-display text-[15px] font-bold text-ink">Aún no hay prompts generados</p>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-mist">
                  Abre el Generador Clásico, completa los 5 bloques y tu primer prompt aparecerá aquí con su score de calidad.
                </p>
                <button
                  onClick={() => goto("clasico")}
                  className="press mt-4 inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 font-mono text-xs font-bold text-paper hover:bg-pine-3"
                >
                  Generar el primero <Icon name="arrow" className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recientes.map((h) => (
                  <div key={h.id} className="panel-hover flex items-center gap-3 rounded-md border border-line bg-paper/60 px-4 py-3">
                    <span
                      className="h-8 w-1 shrink-0 rounded-full"
                      style={{ backgroundColor: h.fuente === "clasico" ? "#0f7a55" : h.fuente === "enterprise" ? "#2e5eaa" : "#b23a6b" }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-[14px] font-bold text-ink">{h.titulo}</p>
                      <p className="font-mono text-[10.5px] uppercase tracking-wide text-mist">
                        {h.fuente} · {h.formato} · {timeAgo(h.ts)}
                      </p>
                    </div>
                    {typeof h.score === "number" && (
                      <div className="w-20">
                        <p className="mb-1 text-right font-mono text-[10px] font-bold text-jade">{h.score}/100</p>
                        <Meter value={h.score} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 border-t border-line pt-5">
              <h4 className="mb-3 font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-mist">Accesos rápidos</h4>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { id: "enterprise" as SectionId, t: "Enterprise JSON", d: "Esquema validado en tiempo real" },
                  { id: "rentables" as SectionId, t: "Nichos rentables", d: "8 servicios listos para vender" },
                  { id: "chatbot" as SectionId, t: "Chatbot IA", d: "8 personalidades especializadas" },
                  { id: "mercado" as SectionId, t: "Mercado", d: "Demanda, precios y señales" },
                ].map((q) => (
                  <button
                    key={q.id}
                    onClick={() => goto(q.id)}
                    className="press group flex items-center gap-3 rounded-md border border-line bg-surface px-4 py-3 text-left hover:border-jade"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-[13.5px] font-bold text-ink group-hover:text-jade">{q.t}</p>
                      <p className="truncate text-[11.5px] text-mist">{q.d}</p>
                    </div>
                    <Icon name="arrow" className="h-4 w-4 shrink-0 text-line-2 transition-all group-hover:translate-x-1 group-hover:text-jade" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <div className="panel h-full p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-extrabold text-ink">Estado del sistema</h3>
              <Icon name="spark" className="h-4 w-4 text-honey" />
            </div>
            <SystemStatus settings={settings} history={history} sync={sync} />
            <div className="mt-5 rounded-md bg-pine px-4 py-3.5 text-paper">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-paper/50">Directriz de seguridad</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-paper/85">
                La clave de Groq vive únicamente en tu navegador (localStorage). Ninguna clave viaja a repositorios ni a servidores de terceros.
              </p>
              <button onClick={() => goto("ajustes")} className="press mt-2.5 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#7ee2b4] hover:underline">
                Configurar motor <Icon name="arrow" className="h-3 w-3" />
              </button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
