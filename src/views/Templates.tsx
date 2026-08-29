/* ────────────────────────────────────────────────────────────────────────────
   R-C-T-E-E PRO · Plantillas
   Sistema universal: Temas → Subtemas → Plantillas con {variables} dinámicas.
   ──────────────────────────────────────────────────────────────────────────── */

import { useMemo, useState } from "react";
import { TEMAS, type Plantilla } from "../data";
import { buildPrompt, celebrate, delay, download, extractVariables, interpolateCampos, uid, varLabel, type HistoryItem } from "../engine";
import { Icon, ViewHeader } from "../chrome";
import { CopyBtn, Meter, Reveal, Spinner } from "../ui";

export default function Templates({ onSave, notify }: { onSave: (i: HistoryItem) => void; notify: (m: string, k?: "ok" | "warn" | "err") => void }) {
  const [temaId, setTemaId] = useState(TEMAS[0].id);
  const [subId, setSubId] = useState(TEMAS[0].subtemas[0].id);
  const [tpl, setTpl] = useState<Plantilla | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState<{ texto: string; score: number } | null>(null);

  const tema = TEMAS.find((t) => t.id === temaId) ?? TEMAS[0];
  const subtema = tema.subtemas.find((s) => s.id === subId) ?? tema.subtemas[0];

  const elegirTema = (id: string) => {
    const t = TEMAS.find((x) => x.id === id) ?? TEMAS[0];
    setTemaId(id);
    setSubId(t.subtemas[0].id);
    setTpl(null);
    setValues({});
    setOutput(null);
  };
  const elegirSub = (id: string) => {
    setSubId(id);
    setTpl(null);
    setValues({});
    setOutput(null);
  };
  const elegirTpl = (p: Plantilla) => {
    setTpl(p);
    setValues({});
    setOutput(null);
  };

  const vars = useMemo(() => (tpl ? extractVariables(tpl.campos) : []), [tpl]);
  const filled = vars.filter((v) => (values[v] ?? "").trim().length > 0).length;
  const completo = tpl !== null && vars.length > 0 && filled === vars.length;

  const preview = useMemo(() => {
    if (!tpl) return "";
    const c = interpolateCampos(tpl.campos, values);
    return buildPrompt(c, "markdown", { cot: true, autoverif: true, neg: false }, tpl.nombre);
  }, [tpl, values]);

  const generar = async () => {
    if (!tpl || !completo) return;
    setGenerating(true);
    setOutput(null);
    await delay(800 + Math.random() * 400);
    const texto = buildPrompt(interpolateCampos(tpl.campos, values), "markdown", { cot: true, autoverif: true, neg: false }, tpl.nombre);
    const score = Math.min(100, 78 + Math.round((filled / Math.max(1, vars.length)) * 14) + (tpl.campos.ejemplos.length > 60 ? 6 : 0));
    setOutput({ texto, score });
    onSave({
      id: uid(),
      ts: Date.now(),
      fuente: "plantilla",
      titulo: tpl.nombre,
      prompt: texto,
      formato: "markdown",
      score,
      meta: `${tema.nombre} → ${subtema.nombre}`,
    });
    setGenerating(false);
    if (score >= 85) celebrate();
    notify(`Plantilla «${tpl.nombre}» generada · score ${score}/100`, "ok");
  };

  return (
    <div>
      <ViewHeader
        eyebrow="Módulo 04 · Biblioteca universal"
        title="Temas → Subtemas → Plantillas"
        desc="Elige un tema, drill-down al subtema y selecciona una plantilla. Las {variables} se convierten en un formulario dinámico; el prompt se previsualiza en vivo."
      />

      {/* ── Drill-down de 3 niveles ── */}
      <Reveal>
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Temas */}
          <div className="panel overflow-hidden">
            <p className="border-b border-line bg-paper/70 px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-mist">1 · Temas</p>
            <div className="max-h-[340px] overflow-y-auto p-2">
              {TEMAS.map((t) => {
                const count = t.subtemas.reduce((a, s) => a + s.plantillas.length, 0);
                const active = t.id === temaId;
                return (
                  <button
                    key={t.id}
                    onClick={() => elegirTema(t.id)}
                    className={`press group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${active ? "bg-ink text-paper" : "hover:bg-line/50"}`}
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md font-display text-[13px] font-extrabold"
                      style={{ backgroundColor: active ? "#0f7a55" : "#e6e9dc", color: active ? "#fbfcf7" : "#182420" }}
                    >
                      {t.nombre.slice(0, 2)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block font-display text-[14px] font-bold ${active ? "text-paper" : "text-ink"}`}>{t.nombre}</span>
                      <span className={`block truncate text-[11px] ${active ? "text-paper/60" : "text-mist"}`}>{t.desc}</span>
                    </span>
                    <span className={`font-mono text-[10px] font-bold ${active ? "text-[#7ee2b4]" : "text-mist"}`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subtemas */}
          <div className="panel overflow-hidden">
            <p className="border-b border-line bg-paper/70 px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-mist">2 · Subtemas · {tema.nombre}</p>
            <div className="max-h-[340px] overflow-y-auto p-2">
              {tema.subtemas.map((s) => {
                const active = s.id === subtema.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => elegirSub(s.id)}
                    className={`press flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${active ? "bg-jade/10" : "hover:bg-line/50"}`}
                  >
                    <span className={`h-2 w-2 shrink-0 rounded-full ${active ? "bg-jade" : "bg-line-2"}`} />
                    <span className="min-w-0 flex-1">
                      <span className={`block font-display text-[14px] font-bold ${active ? "text-jade" : "text-ink"}`}>{s.nombre}</span>
                      <span className="block text-[11px] text-mist">{s.plantillas.length} plantillas disponibles</span>
                    </span>
                    <Icon name="arrow" className={`h-4 w-4 ${active ? "text-jade" : "text-line-2"}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Plantillas */}
          <div className="panel overflow-hidden">
            <p className="border-b border-line bg-paper/70 px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-mist">3 · Plantillas · {subtema.nombre}</p>
            <div className="max-h-[340px] overflow-y-auto p-2">
              {subtema.plantillas.map((p) => {
                const active = tpl?.id === p.id;
                const pvars = extractVariables(p.campos);
                return (
                  <button
                    key={p.id}
                    onClick={() => elegirTpl(p)}
                    className={`press mb-1.5 block w-full rounded-md border px-3.5 py-3 text-left transition-all ${active ? "border-jade bg-jade/5 shadow-[0_6px_18px_-10px_rgba(15,122,85,0.6)]" : "border-line hover:border-line-2 hover:bg-line/30"}`}
                  >
                    <span className={`block font-display text-[13.5px] font-bold ${active ? "text-jade" : "text-ink"}`}>{p.nombre}</span>
                    <span className="mt-0.5 block text-[11.5px] leading-snug text-mist">{p.desc}</span>
                    <span className="mt-2 flex flex-wrap gap-1">
                      {pvars.map((v) => (
                        <span key={v} className="rounded bg-honey/15 px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-honey">{`{${v}}`}</span>
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── Espacio de trabajo ── */}
      {tpl && (
        <Reveal className="mt-8">
          <div className="panel overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 border-b border-line bg-pine px-5 py-4 text-paper">
              <span className="rounded bg-[#7ee2b4] px-2 py-0.5 font-mono text-[10px] font-bold text-pine">SELECCIONADA</span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-display text-[17px] font-extrabold">{tpl.nombre}</h3>
                <p className="font-mono text-[10.5px] text-paper/55">
                  {tema.nombre} → {subtema.nombre} · {vars.length} variables dinámicas
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-28">
                  <div className="mb-1 flex justify-between font-mono text-[9.5px] font-bold text-paper/60">
                    <span>completitud</span>
                    <span className="text-[#7ee2b4]">{filled}/{vars.length}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-pine-3">
                    <div className="bar-fill h-full rounded-full bg-[#7ee2b4]" style={{ width: `${vars.length ? (filled / vars.length) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[380px_1fr]">
              {/* Formulario dinámico de variables */}
              <div>
                <p className="mb-3 font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-mist">Variables dinámicas</p>
                <div className="space-y-3">
                  {vars.map((v) => (
                    <div key={v}>
                      <label className="mb-1 flex items-center justify-between font-display text-[13px] font-bold capitalize text-ink">
                        {varLabel(v)}
                        <span className={`h-1.5 w-1.5 rounded-full ${(values[v] ?? "").trim() ? "bg-jade" : "bg-honey dot-warn"}`} />
                      </label>
                      <input
                        value={values[v] ?? ""}
                        onChange={(e) => setValues((s) => ({ ...s, [v]: e.target.value }))}
                        placeholder={`Valor para {${v}}…`}
                        className="focusable w-full rounded-md border border-line bg-surface px-3 py-2.5 text-[13.5px] text-ink placeholder:text-mist/60 hover:border-line-2"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={generar}
                  disabled={!completo || generating}
                  className="press mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-jade px-5 py-3 font-display text-[14.5px] font-bold text-surface shadow-[0_10px_22px_-10px_rgba(15,122,85,0.8)] hover:bg-jade-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <Spinner /> Generando…
                    </>
                  ) : completo ? (
                    <>
                      Generar prompt <Icon name="arrow" className="h-4 w-4" />
                    </>
                  ) : (
                    `Faltan ${vars.length - filled} variable${vars.length - filled === 1 ? "" : "s"}`
                  )}
                </button>
              </div>

              {/* Previsualización en vivo */}
              <div className="min-w-0">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.18em] text-mist">Previsualización en vivo</p>
                  {output && <span className="rounded-full bg-jade/10 px-2.5 py-1 font-mono text-[10px] font-bold text-jade">score {output.score}/100</span>}
                </div>
                {generating ? (
                  <div className="space-y-3 py-2">
                    <div className="flex items-center gap-2.5 text-jade">
                      <Spinner />
                      <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em]">Interpolando variables…</p>
                    </div>
                    {[90, 100, 70, 95, 58].map((w, i) => (
                      <div key={i} className="skl h-3.5 rounded" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                ) : (
                  <textarea
                    readOnly
                    value={output ? output.texto : preview}
                    className="focusable h-[380px] w-full resize-y rounded-lg border border-line bg-pine px-4 py-3.5 font-mono text-[12px] leading-relaxed text-[#d7e5da]"
                  />
                )}
                {output && (
                  <div className="anim-pop mt-3 flex flex-wrap items-center gap-2">
                    <CopyBtn text={output.texto} />
                    <button
                      onClick={() => {
                        download(`${tpl.nombre.replace(/\s+/g, "-").toLowerCase()}.md`, output.texto, "text/markdown");
                        notify("Plantilla exportada como .md", "ok");
                      }}
                      className="press rounded-md border border-line-2 bg-surface px-3 py-1.5 font-mono text-xs font-semibold text-ink hover:border-jade hover:text-jade"
                    >
                      Descargar .md
                    </button>
                    <span className="ml-auto hidden items-center gap-2 sm:flex">
                      <span className="font-mono text-[10px] font-bold uppercase text-mist">calidad</span>
                      <div className="w-24">
                        <Meter value={output.score} />
                      </div>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}
