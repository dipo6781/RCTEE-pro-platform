/* ────────────────────────────────────────────────────────────────────────────
   R-C-T-E-E PRO · Generador Enterprise
   Esquema estructurado sincronizado con editor JSON y validación en vivo.
   ──────────────────────────────────────────────────────────────────────────── */

import { useMemo, useState } from "react";
import { VERSION } from "../data";
import { delay, download, type HistoryItem, uid } from "../engine";
import { Icon, ViewHeader } from "../chrome";
import { CopyBtn, Meter, Reveal, Spinner } from "../ui";

interface Esquema {
  rol: string;
  objetivo: string;
  contexto: string;
  audiencia: string;
  kpis: string;
  restricciones: string;
  formato_salida: string;
  ejemplos: string;
}

const VACIO: Esquema = {
  rol: "",
  objetivo: "",
  contexto: "",
  audiencia: "",
  kpis: "",
  restricciones: "",
  formato_salida: "Informe ejecutivo",
  ejemplos: "",
};

const FORMATOS_ENTREGA = ["Informe ejecutivo", "Memorando", "Tabla estructurada", "JSON operativo", "Deck de slides"];

function aJson(e: Esquema): string {
  return JSON.stringify(
    {
      metodologia: "R-C-T-E-E",
      esquema: `enterprise/${VERSION}`,
      rol: e.rol,
      objetivo: e.objetivo,
      contexto: e.contexto,
      audiencia: e.audiencia,
      kpis: e.kpis.split(",").map((s) => s.trim()).filter(Boolean),
      restricciones: e.restricciones.split("\n").map((s) => s.trim()).filter(Boolean),
      formato_salida: e.formato_salida,
      ejemplos: e.ejemplos,
    },
    null,
    2
  );
}

function deJson(txt: string): Esquema | null {
  try {
    const o = JSON.parse(txt) as Partial<Esquema> & { kpis?: unknown; restricciones?: unknown };
    return {
      rol: typeof o.rol === "string" ? o.rol : "",
      objetivo: typeof o.objetivo === "string" ? o.objetivo : "",
      contexto: typeof o.contexto === "string" ? o.contexto : "",
      audiencia: typeof o.audiencia === "string" ? o.audiencia : "",
      kpis: Array.isArray(o.kpis) ? (o.kpis as string[]).join(", ") : typeof o.kpis === "string" ? o.kpis : "",
      restricciones: Array.isArray(o.restricciones) ? (o.restricciones as string[]).join("\n") : typeof o.restricciones === "string" ? o.restricciones : "",
      formato_salida: typeof o.formato_salida === "string" ? o.formato_salida : "Informe ejecutivo",
      ejemplos: typeof o.ejemplos === "string" ? o.ejemplos : "",
    };
  } catch {
    return null;
  }
}

function construirPrompt(e: Esquema): string {
  const kpis = e.kpis.split(",").map((s) => s.trim()).filter(Boolean);
  const restricciones = e.restricciones.split("\n").map((s) => s.trim()).filter(Boolean);
  const fecha = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
  const md: string[] = [
    "# PROMPT ENTERPRISE — ARQUITECTURA R-C-T-E-E",
    "",
    `> Esquema **enterprise/${VERSION}** · Emitido el ${fecha} · Clasificación: interno`,
    "",
    "## 1. ROL ASIGNADO",
    e.rol.trim(),
    "",
    "## 2. OBJETIVO EJECUTIVO [T]",
    e.objetivo.trim(),
    "",
    "## 3. CONTEXTO ORGANIZACIONAL [C]",
    e.contexto.trim(),
    "",
    "## 4. AUDIENCIA DEL ENTREGABLE",
    e.audiencia.trim() || "Comité de dirección y responsables de área.",
    "",
    "## 5. KPIS DE ÉXITO",
    ...(kpis.length > 0 ? kpis.map((k, i) => `${i + 1}. ${k}`) : ["1. Definir el KPI primario antes de la entrega."]),
    "",
    "## 6. RESTRICCIONES OPERATIVAS",
    ...(restricciones.length > 0 ? restricciones.map((r) => `- ${r}`) : ["- Sin restricciones declaradas; aplicar marco estándar de cumplimiento."]),
    "",
    "## 7. FORMATO DE ENTREGA [E]",
    `- Tipo: **${e.formato_salida}**`,
    "- Extensión máxima: 2 páginas o su equivalente estructurado.",
    "- Tono: ejecutivo, verificable, sin calificativos sin sustento.",
    "",
    "## 8. EJEMPLO CALIBRADO [E²]",
    e.ejemplos.trim() || "No provisto: el modelo debe solicitar un ancla de calidad antes de producir la versión final.",
    "",
    "## 9. BLOQUE DE CUMPLIMIENTO",
    "- Verifica cada sección contra este esquema antes de entregar (auto-verificación).",
    "- No inventes datos: marca como `[PENDIENTE DE DATO]` cualquier cifra no provista.",
    "- Razona paso a paso y expón supuestos explícitamente al final del entregable.",
    "",
    "---",
    `_Trail de auditoría: generado por R-C-T-E-E Pro v${VERSION} · esquema enterprise · ${new Date().toISOString()}_`,
  ];
  return md.join("\n");
}

export default function Enterprise({ onSave, notify }: { onSave: (i: HistoryItem) => void; notify: (m: string, k?: "ok" | "warn" | "err") => void }) {
  const [modo, setModo] = useState<"asistente" | "json">("asistente");
  const [esq, setEsq] = useState<Esquema>(VACIO);
  const [jsonTxt, setJsonTxt] = useState(() => aJson(VACIO));
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  const jsonState = useMemo(() => {
    try {
      JSON.parse(jsonTxt);
      return { ok: true, msg: "JSON válido · listo para generar" };
    } catch (e) {
      return { ok: false, msg: e instanceof Error ? e.message : "JSON inválido" };
    }
  }, [jsonTxt]);

  const cambiarModo = (m: "asistente" | "json") => {
    if (m === modo) return;
    if (m === "json") {
      setJsonTxt(aJson(esq));
      setModo("json");
    } else {
      const parsed = deJson(jsonTxt);
      if (!parsed) {
        notify("Corrige el JSON antes de volver al asistente", "err");
        return;
      }
      setEsq(parsed);
      setModo("asistente");
    }
  };

  const setCampo = (k: keyof Esquema) => (v: string) => {
    setEsq((e) => ({ ...e, [k]: v }));
  };

  const validar = (e: Esquema): string[] => {
    const errs: string[] = [];
    if (e.rol.trim().length < 20) errs.push("rol: mínimo 20 caracteres (cargo + trayectoria).");
    if (e.objetivo.trim().length < 40) errs.push("objetivo: mínimo 40 caracteres (verbo + entregable medible).");
    if (e.contexto.trim().length < 80) errs.push("contexto: mínimo 80 caracteres con datos del escenario.");
    return errs;
  };

  const generar = async () => {
    setErrors([]);
    let base: Esquema = esq;
    if (modo === "json") {
      const parsed = deJson(jsonTxt);
      if (!parsed) {
        setErrors(["El JSON no es válido: " + jsonState.msg]);
        notify("JSON inválido: corrige la sintaxis", "err");
        return;
      }
      base = parsed;
    }
    const errs = validar(base);
    if (errs.length > 0) {
      setErrors(errs);
      notify("El esquema enterprise requiere campos completos", "err");
      return;
    }
    setGenerating(true);
    setOutput(null);
    await delay(1000 + Math.random() * 500);
    const prompt = construirPrompt(base);
    const s = Math.min(
      100,
      30 +
        Math.min(25, (base.contexto.trim().length / 120) * 25) +
        (base.kpis.trim() ? 15 : 0) +
        (base.restricciones.trim() ? 15 : 0) +
        (base.ejemplos.trim() ? 15 : 0)
    );
    setOutput(prompt);
    setScore(s);
    onSave({
      id: uid(),
      ts: Date.now(),
      fuente: "enterprise",
      titulo: base.objetivo.trim().split(/[.\n]/)[0].slice(0, 64),
      prompt,
      formato: "markdown",
      score: s,
      meta: `esquema enterprise/${VERSION}`,
    });
    setGenerating(false);
    notify(`Prompt enterprise emitido · score ${s}/100`, "ok");
  };

  const inputCls =
    "focusable w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[14px] leading-relaxed text-ink placeholder:text-mist/60 transition-colors hover:border-line-2";

  return (
    <div>
      <ViewHeader
        eyebrow="Módulo 03 · Grado corporativo"
        title="Generador Enterprise"
        desc="Esquema estructurado de 9 secciones con KPIs, restricciones y bloque de cumplimiento. Edita en el asistente o directamente en JSON con validación en tiempo real."
        right={
          <div className="flex rounded-md border border-line-2 bg-surface p-1">
            {(["asistente", "json"] as const).map((m) => (
              <button
                key={m}
                onClick={() => cambiarModo(m)}
                className={`press rounded px-4 py-2 font-mono text-xs font-bold uppercase tracking-wide transition-colors ${
                  modo === m ? "bg-ink text-paper" : "text-mist hover:text-ink"
                }`}
              >
                {m === "asistente" ? "Asistente" : "JSON directo"}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_430px]">
        <Reveal>
          <div className="panel p-5 sm:p-6">
            {modo === "asistente" ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block font-display text-[14px] font-bold text-ink">Rol asignado</label>
                  <input value={esq.rol} onChange={(e) => setCampo("rol")(e.target.value)} placeholder="Directora de Operaciones con 15 años en logística de última milla…" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block font-display text-[14px] font-bold text-ink">Objetivo ejecutivo (Tarea)</label>
                  <textarea value={esq.objetivo} onChange={(e) => setCampo("objetivo")(e.target.value)} rows={2} placeholder="Diseñar el plan de reducción del costo por entrega en 18 % durante el próximo trimestre…" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 flex items-baseline justify-between font-display text-[14px] font-bold text-ink">
                    Contexto organizacional
                    <span className={`font-mono text-[11px] font-medium tabular-nums ${esq.contexto.trim().length >= 80 ? "text-jade" : "text-mist"}`}>{esq.contexto.trim().length}/80</span>
                  </label>
                  <textarea value={esq.contexto} onChange={(e) => setCampo("contexto")(e.target.value)} rows={4} placeholder="La operación procesa 4.800 entregas/día con un costo unitario de $3.10; el combustible subió 22 % interanual…" className={inputCls} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block font-display text-[14px] font-bold text-ink">Audiencia</label>
                    <input value={esq.audiencia} onChange={(e) => setCampo("audiencia")(e.target.value)} placeholder="Comité de dirección + gerentes de ruta" className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1.5 block font-display text-[14px] font-bold text-ink">Formato de entrega</label>
                    <select value={esq.formato_salida} onChange={(e) => setCampo("formato_salida")(e.target.value)} className={inputCls}>
                      {FORMATOS_ENTREGA.map((f) => (
                        <option key={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block font-display text-[14px] font-bold text-ink">KPIs de éxito <span className="font-mono text-[10px] font-normal text-mist">(separados por coma)</span></label>
                  <input value={esq.kpis} onChange={(e) => setCampo("kpis")(e.target.value)} placeholder="Costo/entrega ≤ $2.54, OTIF ≥ 96 %, NPS operativo ≥ 40" className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block font-display text-[14px] font-bold text-ink">Restricciones <span className="font-mono text-[10px] font-normal text-mist">(una por línea)</span></label>
                  <textarea value={esq.restricciones} onChange={(e) => setCampo("restricciones")(e.target.value)} rows={3} placeholder={"Sin despidos en la operación\nPresupuesto máximo de intervención: $80K\nCumplir norma de tiempos de conducción"} className={inputCls} />
                </div>
                <div>
                  <label className="mb-1.5 block font-display text-[14px] font-bold text-ink">Ejemplo calibrado (opcional pero recomendado)</label>
                  <textarea value={esq.ejemplos} onChange={(e) => setCampo("ejemplos")(e.target.value)} rows={3} placeholder="Entrada: ruta norte con 14 % de reprocesos → Salida: rediseño con micro-hubs que redujo el costo 19 % en 8 semanas…" className={inputCls} />
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-2.5 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] font-bold ${jsonState.ok ? "bg-jade/10 text-jade" : "bg-danger/10 text-danger"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${jsonState.ok ? "bg-jade dot-live" : "bg-danger"}`} />
                    {jsonState.msg}
                  </span>
                </div>
                <textarea
                  value={jsonTxt}
                  onChange={(e) => setJsonTxt(e.target.value)}
                  rows={22}
                  spellCheck={false}
                  className={`focusable w-full resize-y rounded-lg border bg-pine px-4 py-3.5 font-mono text-[12.5px] leading-relaxed text-[#d7e5da] ${jsonState.ok ? "border-pine-3" : "border-danger"}`}
                />
                <p className="mt-2 font-mono text-[10.5px] text-mist">
                  La validación corre en cada pulsación. Claves requeridas: <span className="font-bold text-ink">rol · objetivo · contexto</span>.
                </p>
              </div>
            )}

            {errors.length > 0 && (
              <div className="anim-pop mt-4 rounded-md border border-danger/40 bg-danger/5 px-4 py-3">
                <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-danger">El esquema no pasó la validación</p>
                <ul className="mt-1.5 space-y-1">
                  {errors.map((e, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12.5px] text-ink">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-danger" /> {e}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={generar}
              disabled={generating || (modo === "json" && !jsonState.ok)}
              className="press mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-cobalt px-6 py-3.5 font-display text-[15px] font-bold text-surface shadow-[0_10px_24px_-10px_rgba(46,94,170,0.8)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {generating ? (
                <>
                  <Spinner /> Validando esquema…
                </>
              ) : (
                <>
                  Emitir prompt enterprise
                  <Icon name="arrow" className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="panel sticky top-[84px] flex min-h-[420px] flex-col p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-base font-extrabold text-ink">Documento emitido</h3>
              {output && <span className="rounded-full bg-cobalt/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-cobalt">9 secciones</span>}
            </div>
            {generating ? (
              <div className="flex-1 space-y-3 py-2">
                <div className="flex items-center gap-2.5 text-cobalt">
                  <Spinner />
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em]">Emitiendo documento enterprise…</p>
                </div>
                {[88, 100, 72, 96, 60, 84].map((w, i) => (
                  <div key={i} className="skl h-3.5 rounded" style={{ width: `${w}%` }} />
                ))}
                <div className="skl mt-4 h-24 rounded" />
              </div>
            ) : output ? (
              <div className="anim-pop flex flex-1 flex-col">
                <div className="mb-3">
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-mist">Integridad del esquema</p>
                    <p className="font-display text-sm font-extrabold text-cobalt">{score}/100</p>
                  </div>
                  <Meter value={score} hex="#2e5eaa" />
                </div>
                <textarea readOnly value={output} className="focusable min-h-[280px] flex-1 resize-y rounded-lg border border-line bg-pine px-4 py-3.5 font-mono text-[12px] leading-relaxed text-[#d7e5da]" />
                <div className="mt-4 flex flex-wrap gap-2">
                  <CopyBtn text={output} />
                  <button
                    onClick={() => {
                      download("prompt-enterprise.md", output, "text/markdown");
                      notify("Documento .md descargado", "ok");
                    }}
                    className="press rounded-md border border-line-2 bg-surface px-3 py-1.5 font-mono text-xs font-semibold text-ink hover:border-cobalt hover:text-cobalt"
                  >
                    Descargar .md
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-line-2 px-6 py-10 text-center">
                <Icon name="enterprise" className="mb-3 h-8 w-8 text-cobalt/60" />
                <p className="font-display text-[15px] font-bold text-ink">Documento pendiente de emisión</p>
                <p className="mt-1 max-w-[270px] text-xs leading-relaxed text-mist">
                  Completa el esquema (o valida el JSON) y emite un prompt de 9 secciones con bloque de cumplimiento y trail de auditoría.
                </p>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
