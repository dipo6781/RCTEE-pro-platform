/* ────────────────────────────────────────────────────────────────────────────
   R-C-T-E-E PRO · Generador Clásico
   Formulario R-C-T-E-E con validación, controles de precisión, scoring
   y exportación MD / JSON.
   ──────────────────────────────────────────────────────────────────────────── */

import { useEffect, useState } from "react";
import { FORMATOS, METODOLOGIA, type CamposRCTEE, type FormatoId } from "../data";
import {
  buildPrompt,
  celebrate,
  delay,
  download,
  qualityScore,
  scoreLabel,
  uid,
  validateClassic,
  type HistoryItem,
  type Toggles,
} from "../engine";
import { ViewHeader } from "../chrome";
import { CopyBtn, Field, LetterChip, Meter, Reveal, Spinner, Toggle } from "../ui";

const EMPTY: CamposRCTEE = { rol: "", contexto: "", tarea: "", especificaciones: "", ejemplos: "" };

interface Prefill {
  titulo?: string;
  campos: CamposRCTEE;
}

export default function Classic({
  onSave,
  notify,
  prefill,
  defaultFormat,
  defaultToggles,
}: {
  onSave: (item: HistoryItem) => void;
  notify: (msg: string, kind?: "ok" | "warn" | "err") => void;
  prefill: Prefill | null;
  defaultFormat: FormatoId;
  defaultToggles: Toggles;
}) {
  const [campos, setCampos] = useState<CamposRCTEE>(prefill?.campos ?? EMPTY);
  const [formato, setFormato] = useState<FormatoId>(defaultFormat);
  const [toggles, setToggles] = useState<Toggles>(defaultToggles);
  const [errors, setErrors] = useState<Partial<Record<keyof CamposRCTEE, string>>>({});
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState<{ texto: string; titulo: string; score: number; formato: FormatoId } | null>(null);

  useEffect(() => {
    if (prefill) {
      setCampos(prefill.campos);
      setOutput(null);
      setErrors({});
    }
  }, [prefill]);

  const set = (k: keyof CamposRCTEE) => (v: string) => {
    setCampos((c) => ({ ...c, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const liveScore = qualityScore(campos);

  const generar = async () => {
    const v = validateClassic(campos);
    setErrors(v.errors);
    if (!v.ok) {
      notify("Revisa los bloques marcados en rojo", "err");
      return;
    }
    setGenerating(true);
    setOutput(null);
    await delay(950 + Math.random() * 450);
    const titulo = prefill?.titulo;
    const texto = buildPrompt(campos, formato, toggles, titulo);
    const score = Math.min(100, v.score + (toggles.cot ? 2 : 0) + (toggles.autoverif ? 2 : 0) + (toggles.neg ? 1 : 0));
    setOutput({ texto, titulo: titulo ?? texto.split("\n")[0].replace(/^#+\s*/, "").replace(/^PROMPT EMPRESARIAL — /, ""), score, formato });
    onSave({
      id: uid(),
      ts: Date.now(),
      fuente: "clasico",
      titulo: titulo ?? campos.tarea.trim().split(/[.\n]/)[0].slice(0, 64),
      prompt: texto,
      formato,
      score,
      bloques: campos,
      meta: [toggles.cot && "CoT", toggles.autoverif && "auto-verif", toggles.neg && "neg"].filter(Boolean).join(" · ") || undefined,
    });
    setGenerating(false);
    if (score >= 85) celebrate();
    notify(
      score >= 85
        ? `Nivel Enterprise alcanzado · score ${score}/100`
        : `Prompt ensamblado · score ${score}/100 · guardado en historial`,
      "ok"
    );
  };

  const limpiar = () => {
    setCampos(EMPTY);
    setErrors({});
    setOutput(null);
    notify("Formulario reiniciado", "warn");
  };

  return (
    <div>
      <ViewHeader
        eyebrow="Módulo 02 · Generación asistida"
        title="Generador Clásico"
        desc="Completa los 5 bloques del método. El motor valida longitudes mínimas, calcula el score de calidad y ensambla el prompt en el formato que elijas."
        right={
          <div className="rounded-md border border-line bg-surface px-4 py-2.5 text-center">
            <p className="num-display text-2xl font-extrabold leading-none" style={{ color: liveScore >= 65 ? "#0f7a55" : liveScore >= 40 ? "#d99125" : "#5f6d63" }}>
              {liveScore}
            </p>
            <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.16em] text-mist">score en vivo</p>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_430px]">
        {/* ── Formulario ── */}
        <Reveal>
          <div className="panel space-y-5 p-5 sm:p-6">
            <Field
              letter={METODOLOGIA[0].key}
              hex={METODOLOGIA[0].hex}
              label="Rol"
              value={campos.rol}
              onChange={set("rol")}
              min={20}
              rows={2}
              placeholder="Ej. Analista de riesgos senior con 12 años en banca comercial, especializado en crédito PyME…"
              error={errors.rol}
            />
            <Field
              letter={METODOLOGIA[1].key}
              hex={METODOLOGIA[1].hex}
              label="Contexto"
              value={campos.contexto}
              onChange={set("contexto")}
              min={80}
              rows={4}
              placeholder="Situación de negocio con datos duros: cifras, plazos, restricciones. Ej. La cartera vencida alcanza $1.4M con 74 días de mora promedio…"
              error={errors.contexto}
              hint="Mínimo 80 caracteres: sin contexto, el modelo inventa el suyo."
            />
            <Field
              letter={METODOLOGIA[2].key}
              hex={METODOLOGIA[2].hex}
              label="Tarea"
              value={campos.tarea}
              onChange={set("tarea")}
              min={40}
              rows={3}
              placeholder="Un verbo fuerte + entregable medible. Ej. Diseñar un plan de cobranza segmentado por tramos de mora con metas semanales…"
              error={errors.tarea}
            />
            <Field
              letter={METODOLOGIA[3].key}
              hex={METODOLOGIA[3].hex}
              label="Especificaciones"
              value={campos.especificaciones}
              onChange={set("especificaciones")}
              min={30}
              rows={3}
              placeholder="Formato, estructura, extensión, tono y reglas. Ej. Tabla de segmentación, 2 guiones de llamada, KPIs; máximo 900 palabras…"
              error={errors.especificaciones}
            />
            <Field
              letter={METODOLOGIA[4].key}
              hex={METODOLOGIA[4].hex}
              label="Ejemplos"
              value={campos.ejemplos}
              onChange={set("ejemplos")}
              min={1}
              rows={3}
              placeholder="Entrada → salida calibrada. Ej. Mora 31–60 días → plan de pagos en 3 cuotas con condonación parcial del 15 %…"
              error={errors.ejemplos}
            />

            <div className="border-t border-line pt-5">
              <p className="mb-2.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-mist">Formato de salida</p>
              <div className="flex gap-2">
                {FORMATOS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormato(f.id)}
                    className={`press rounded-md px-4 py-2 font-mono text-xs font-bold transition-colors ${
                      formato === f.id ? "bg-ink text-paper" : "border border-line-2 bg-paper text-mist hover:border-ink hover:text-ink"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-mist">Controles de precisión</p>
              <div className="grid gap-2 sm:grid-cols-1">
                <Toggle checked={toggles.cot} onChange={(v) => setToggles((t) => ({ ...t, cot: v }))} label="Chain of Thought" desc="Obliga al modelo a razonar paso a paso antes de responder." />
                <Toggle checked={toggles.autoverif} onChange={(v) => setToggles((t) => ({ ...t, autoverif: v }))} label="Auto-verificación" desc="Audita la salida contra las especificaciones antes de entregar." />
                <Toggle checked={toggles.neg} onChange={(v) => setToggles((t) => ({ ...t, neg: v }))} label="Restricciones negativas" desc="Bloque explícito de lo que el modelo NO debe hacer." />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-line pt-5">
              <button
                onClick={generar}
                disabled={generating}
                className="press inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-jade px-6 py-3.5 font-display text-[15px] font-bold text-surface shadow-[0_10px_24px_-10px_rgba(15,122,85,0.8)] hover:bg-jade-2 disabled:cursor-wait disabled:opacity-70 sm:flex-none"
              >
                {generating ? (
                  <>
                    <Spinner /> Generando…
                  </>
                ) : (
                  <>
                    Ensamblar prompt
                    <LetterChip letter="→" hex="#0b6244" size="sm" />
                  </>
                )}
              </button>
              <button
                onClick={limpiar}
                disabled={generating}
                className="press rounded-md border border-line-2 bg-paper px-5 py-3.5 font-display text-[14px] font-bold text-mist hover:border-danger hover:text-danger disabled:opacity-50"
              >
                Limpiar
              </button>
            </div>
          </div>
        </Reveal>

        {/* ── Panel de salida ── */}
        <Reveal delay={120}>
          <div className="panel sticky top-[84px] flex min-h-[420px] flex-col p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-base font-extrabold text-ink">Salida ensamblada</h3>
              {output && (
                <span className="rounded-full bg-jade/10 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-jade">
                  {output.formato}
                </span>
              )}
            </div>

            {generating ? (
              <div className="flex-1 space-y-3 py-2">
                <div className="flex items-center gap-2.5 text-jade">
                  <Spinner />
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em]">Ensamblando bloques R-C-T-E-E…</p>
                </div>
                {[92, 100, 78, 100, 64, 88].map((w, i) => (
                  <div key={i} className="skl h-3.5 rounded" style={{ width: `${w}%` }} />
                ))}
                <div className="skl mt-4 h-24 rounded" />
              </div>
            ) : output ? (
              <div className="anim-pop flex flex-1 flex-col">
                <div className="mb-3">
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-mist">Calidad del prompt</p>
                    <p className="font-display text-sm font-extrabold text-jade">
                      {output.score}/100 · {scoreLabel(output.score)}
                    </p>
                  </div>
                  <Meter value={output.score} hex={output.score >= 65 ? "#0f7a55" : "#d99125"} />
                </div>
                <textarea
                  readOnly
                  value={output.texto}
                  className="focusable min-h-[260px] flex-1 resize-y rounded-lg border border-line bg-pine px-4 py-3.5 font-mono text-[12px] leading-relaxed text-[#d7e5da]"
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  <CopyBtn text={output.texto} />
                  <button
                    onClick={() => {
                      download("prompt-rctee.md", output.texto, "text/markdown");
                      notify("Markdown descargado", "ok");
                    }}
                    className="press rounded-md border border-line-2 bg-surface px-3 py-1.5 font-mono text-xs font-semibold text-ink hover:border-jade hover:text-jade"
                  >
                    Descargar .md
                  </button>
                  <button
                    onClick={() => {
                      const json =
                        output.formato === "json"
                          ? output.texto
                          : JSON.stringify({ titulo: output.titulo, score: output.score, prompt: output.texto, generado: new Date().toISOString() }, null, 2);
                      download("prompt-rctee.json", json, "application/json");
                      notify("JSON descargado", "ok");
                    }}
                    className="press rounded-md border border-line-2 bg-surface px-3 py-1.5 font-mono text-xs font-semibold text-ink hover:border-jade hover:text-jade"
                  >
                    Descargar .json
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-line-2 px-6 py-10 text-center">
                <div className="mb-4 flex gap-1.5">
                  {METODOLOGIA.map((m) => (
                    <span key={m.key} className="h-7 w-7 rounded-md opacity-25" style={{ backgroundColor: m.hex }} />
                  ))}
                </div>
                <p className="font-display text-[15px] font-bold text-ink">La salida aparecerá aquí</p>
                <p className="mt-1 max-w-[260px] text-xs leading-relaxed text-mist">
                  Completa los 5 bloques y pulsa «Ensamblar prompt». Se guardará automáticamente en tu historial.
                </p>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
