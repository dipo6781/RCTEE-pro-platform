/* ────────────────────────────────────────────────────────────────────────────
   R-C-T-E-E PRO · Ajustes
   Motor de IA (Groq cloud / Ollama local), preferencias y gestión de datos.
   ──────────────────────────────────────────────────────────────────────────── */

import { useState } from "react";
import { FORMATOS, type FormatoId } from "../data";
import { pingOllama, type HistoryItem, type Settings as TSettings } from "../engine";
import { Icon, ViewHeader } from "../chrome";
import { Reveal, Spinner, Toggle } from "../ui";

export default function SettingsView({
  settings,
  update,
  historyCount,
  onExportAll,
  onImportFile,
  onClearHistory,
  notify,
}: {
  settings: TSettings;
  update: (patch: Partial<TSettings>) => void;
  historyCount: number;
  onExportAll: () => void;
  onImportFile: (f: File) => void;
  onClearHistory: () => void;
  notify: (m: string, k?: "ok" | "warn" | "err") => void;
}) {
  const [showKey, setShowKey] = useState(false);
  const [ping, setPing] = useState<"idle" | "checking" | "ok" | "fail">("idle");
  const [confirmClear, setConfirmClear] = useState(false);
  const [savedFlash, setSavedFlash] = useState(0);
  const cloud = settings.mode === "cloud";

  const setAndFlash = (patch: Partial<TSettings>) => {
    update(patch);
    setSavedFlash((n) => n + 1);
  };

  const probarOllama = async () => {
    setPing("checking");
    const ok = await pingOllama(settings.ollamaUrl);
    setPing(ok ? "ok" : "fail");
    notify(ok ? "Ollama responde correctamente" : "Sin respuesta de Ollama en ese puerto", ok ? "ok" : "err");
  };

  const inputCls =
    "focusable w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink placeholder:text-mist/60 transition-colors hover:border-line-2";

  return (
    <div>
      <ViewHeader
        eyebrow="Módulo 08 · Configuración"
        title="Ajustes de la consola"
        desc="Motor de IA, preferencias de generación y gestión de datos. Los cambios se guardan al instante en tu navegador."
        right={
          savedFlash > 0 ? (
            <span key={savedFlash} className="anim-pop inline-flex items-center gap-1.5 rounded-full bg-jade/10 px-3 py-1.5 font-mono text-[11px] font-bold text-jade">
              <Icon name="check" className="h-3.5 w-3.5" /> Guardado
            </span>
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Motor de IA ── */}
        <Reveal>
          <section className="panel p-6">
            <div className="mb-5 flex items-center gap-2.5">
              <Icon name="server" className="h-5 w-5 text-jade" />
              <h3 className="font-display text-lg font-extrabold text-ink">Motor de IA</h3>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-lg border border-line-2 bg-paper p-1">
              <button
                onClick={() => setAndFlash({ mode: "cloud" })}
                className={`press flex flex-col items-start gap-1 rounded-md px-4 py-3 text-left transition-colors ${cloud ? "bg-ink text-paper shadow" : "text-mist hover:text-ink"}`}
              >
                <span className="flex items-center gap-2 font-display text-[14px] font-extrabold">
                  <Icon name="cloud" className="h-4 w-4" /> Cloud · Groq
                </span>
                <span className={`text-[11px] leading-snug ${cloud ? "text-paper/60" : "text-mist/80"}`}>Latencia mínima vía API</span>
              </button>
              <button
                onClick={() => setAndFlash({ mode: "local" })}
                className={`press flex flex-col items-start gap-1 rounded-md px-4 py-3 text-left transition-colors ${!cloud ? "bg-ink text-paper shadow" : "text-mist hover:text-ink"}`}
              >
                <span className="flex items-center gap-2 font-display text-[14px] font-extrabold">
                  <Icon name="server" className="h-4 w-4" /> Local · Ollama
                </span>
                <span className={`text-[11px] leading-snug ${!cloud ? "text-paper/60" : "text-mist/80"}`}>Privacidad total, sin nube</span>
              </button>
            </div>

            {cloud ? (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 font-display text-[14px] font-bold text-ink">
                    <Icon name="key" className="h-4 w-4 text-honey" /> API Key de Groq
                  </label>
                  <div className="flex gap-2">
                    <input
                      type={showKey ? "text" : "password"}
                      value={settings.groqKey}
                      onChange={(e) => setAndFlash({ groqKey: e.target.value })}
                      placeholder="gsk_…"
                      className={`${inputCls} font-mono text-[13px]`}
                    />
                    <button
                      onClick={() => setShowKey((s) => !s)}
                      className="press shrink-0 rounded-lg border border-line-2 bg-paper px-3 text-mist hover:border-jade hover:text-jade"
                      aria-label="Mostrar u ocultar clave"
                    >
                      <Icon name="eye" className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-mist">
                    Se guarda <span className="font-bold text-ink">solo en localStorage</span> de este navegador. Nunca se imprime en el código ni viaja a terceros.
                  </p>
                </div>
                <div>
                  <label className="mb-1.5 block font-display text-[14px] font-bold text-ink">Modelo autorizado</label>
                  <div className="grid gap-2">
                    {(
                      [
                        { id: "llama3-8b-8192", t: "llama3-8b-8192", d: "Velocidad — respuestas operativas" },
                        { id: "mixtral-8x7b-32768", t: "mixtral-8x7b-32768", d: "Razonamiento complejo — análisis profundo" },
                      ] as const
                    ).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setAndFlash({ groqModel: m.id })}
                        className={`press flex items-center justify-between rounded-md border px-4 py-2.5 text-left transition-colors ${
                          settings.groqModel === m.id ? "border-jade bg-jade/5" : "border-line bg-surface hover:border-line-2"
                        }`}
                      >
                        <span>
                          <span className={`block font-mono text-[12.5px] font-bold ${settings.groqModel === m.id ? "text-jade" : "text-ink"}`}>{m.t}</span>
                          <span className="block text-[11px] text-mist">{m.d}</span>
                        </span>
                        <span className={`h-4 w-4 rounded-full border-2 ${settings.groqModel === m.id ? "border-jade bg-jade" : "border-line-2"}`} />
                      </button>
                    ))}
                  </div>
                </div>
                {settings.groqKey.trim().length > 0 && settings.groqKey.trim().length <= 8 && (
                  <p className="rounded-md bg-honey/10 px-3.5 py-2.5 text-[12px] font-medium text-honey">La clave parece incompleta; verifica que empiece por «gsk_».</p>
                )}
                <button
                  onClick={() => {
                    setAndFlash({ groqKey: "" });
                    notify("API key eliminada del navegador", "warn");
                  }}
                  disabled={settings.groqKey.length === 0}
                  className="press rounded-md px-3 py-2 font-mono text-xs font-bold text-danger hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Borrar clave almacenada
                </button>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-1.5 block font-display text-[14px] font-bold text-ink">URL del servidor Ollama</label>
                  <input
                    value={settings.ollamaUrl}
                    onChange={(e) => setAndFlash({ ollamaUrl: e.target.value })}
                    placeholder="http://localhost:11434"
                    className={`${inputCls} font-mono text-[13px]`}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-display text-[14px] font-bold text-ink">Modelo local</label>
                  <input value={settings.ollamaModel} onChange={(e) => setAndFlash({ ollamaModel: e.target.value })} placeholder="llama3.2" className={`${inputCls} font-mono text-[13px]`} />
                  <p className="mt-1.5 font-mono text-[10.5px] text-mist">Modelo autorizado por el stack: <span className="font-bold text-ink">llama3.2</span> · instálalo con «ollama pull llama3.2».</p>
                </div>
                <button
                  onClick={probarOllama}
                  disabled={ping === "checking"}
                  className="press inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 font-mono text-xs font-bold text-paper hover:bg-pine-3 disabled:opacity-60"
                >
                  {ping === "checking" ? (
                    <>
                      <Spinner className="h-3.5 w-3.5" /> Comprobando…
                    </>
                  ) : (
                    <>Probar conexión</>
                  )}
                </button>
                {ping === "ok" && <p className="anim-pop rounded-md bg-jade/10 px-3.5 py-2.5 text-[12.5px] font-semibold text-jade">Ollama en línea: el chatbot usará {settings.ollamaModel}.</p>}
                {ping === "fail" && (
                  <p className="anim-pop rounded-md bg-danger/10 px-3.5 py-2.5 text-[12.5px] font-semibold leading-relaxed text-danger">
                    Sin respuesta. Verifica que Ollama esté corriendo («ollama serve») y que la URL sea correcta. Mientras tanto, el chatbot usa el motor local de respaldo.
                  </p>
                )}
              </div>
            )}
          </section>
        </Reveal>

        <div className="space-y-6">
          {/* ── Preferencias ── */}
          <Reveal delay={100}>
            <section className="panel p-6">
              <div className="mb-4 flex items-center gap-2.5">
                <Icon name="clasico" className="h-5 w-5 text-cobalt" />
                <h3 className="font-display text-lg font-extrabold text-ink">Preferencias de generación</h3>
              </div>
              <label className="mb-1.5 block font-display text-[14px] font-bold text-ink">Formato de salida por defecto</label>
              <div className="flex gap-2">
                {FORMATOS.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setAndFlash({ defaultFormat: f.id as FormatoId })}
                    className={`press rounded-md px-4 py-2 font-mono text-xs font-bold transition-colors ${
                      settings.defaultFormat === f.id ? "bg-ink text-paper" : "border border-line-2 bg-paper text-mist hover:border-ink hover:text-ink"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                <Toggle checked={settings.cot} onChange={(v) => setAndFlash({ cot: v })} label="Chain of Thought por defecto" desc="Se activa en cada prompt del Generador Clásico." />
                <Toggle checked={settings.autoverif} onChange={(v) => setAndFlash({ autoverif: v })} label="Auto-verificación por defecto" desc="Auditoría de la salida contra especificaciones." />
              </div>
            </section>
          </Reveal>

          {/* ── Datos ── */}
          <Reveal delay={180}>
            <section className="panel p-6">
              <div className="mb-4 flex items-center gap-2.5">
                <Icon name="history" className="h-5 w-5 text-berry" />
                <h3 className="font-display text-lg font-extrabold text-ink">Datos y persistencia</h3>
              </div>
              <p className="mb-4 text-[13px] leading-relaxed text-mist">
                <span className="font-bold text-ink">{historyCount} prompts</span> almacenados en localStorage. La sincronización con Supabase (PostgreSQL) está programada en el roadmap.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={onExportAll}
                  disabled={historyCount === 0}
                  className="press inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 font-mono text-xs font-bold text-paper hover:bg-pine-3 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Icon name="download" className="h-3.5 w-3.5" /> Exportar historial
                </button>
                <label className="press inline-flex cursor-pointer items-center gap-2 rounded-md border border-line-2 bg-paper px-4 py-2.5 font-mono text-xs font-bold text-ink hover:border-jade hover:text-jade">
                  <Icon name="upload" className="h-3.5 w-3.5" /> Importar JSON
                  <input
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) onImportFile(f);
                      e.target.value = "";
                    }}
                  />
                </label>
                <button
                  onClick={() => {
                    if (!confirmClear) {
                      setConfirmClear(true);
                      setTimeout(() => setConfirmClear(false), 2600);
                      return;
                    }
                    onClearHistory();
                    setConfirmClear(false);
                  }}
                  disabled={historyCount === 0}
                  className={`press rounded-md px-4 py-2.5 font-mono text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                    confirmClear ? "bg-danger text-surface" : "text-danger hover:bg-danger/10"
                  }`}
                >
                  {confirmClear ? "¿Confirmar borrado total?" : "Vaciar historial"}
                </button>
              </div>
            </section>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
