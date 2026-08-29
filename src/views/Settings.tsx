/* ────────────────────────────────────────────────────────────────────────────
   R-C-T-E-E PRO · Ajustes
   Motor de IA (Groq cloud / Ollama local), preferencias y gestión de datos.
   ──────────────────────────────────────────────────────────────────────────── */

import { useState } from "react";
import { EXTENSIONES, FORMATOS, TEMAS, type FormatoId } from "../data";
import { copyText, pingOllama, timeAgo, type HistoryItem, type Settings as TSettings } from "../engine";
import { SQL_SCHEMA, sbTest } from "../supabase";
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
  onPushNow,
  onPullNow,
  unsyncedCount,
}: {
  settings: TSettings;
  update: (patch: Partial<TSettings>) => void;
  historyCount: number;
  onExportAll: () => void;
  onImportFile: (f: File) => void;
  onClearHistory: () => void;
  notify: (m: string, k?: "ok" | "warn" | "err") => void;
  onPushNow: () => void;
  onPullNow: () => void;
  unsyncedCount: number;
}) {
  const [showKey, setShowKey] = useState(false);
  const [showSbKey, setShowSbKey] = useState(false);
  const [ping, setPing] = useState<"idle" | "checking" | "ok" | "fail">("idle");
  const [sbPing, setSbPing] = useState<"idle" | "checking" | "ok" | "fail">("idle");
  const [sbCount, setSbCount] = useState<number | null>(null);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [savedFlash, setSavedFlash] = useState(0);
  const cloud = settings.mode === "cloud";
  const sbReady = settings.syncEnabled && settings.supabaseUrl.trim().length > 8 && settings.supabaseKey.trim().length > 8;

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

  const probarSupabase = async () => {
    setSbPing("checking");
    setSbCount(null);
    const res = await sbTest({ url: settings.supabaseUrl, key: settings.supabaseKey });
    if (res.ok) {
      setSbPing("ok");
      setSbCount(res.data ?? 0);
      notify(`Supabase responde · ${res.data ?? 0} registros en la tabla`, "ok");
    } else {
      setSbPing("fail");
      notify(`Supabase: ${res.error ?? "sin respuesta"}`, "err");
    }
  };

  const copiarSql = async () => {
    const ok = await copyText(SQL_SCHEMA);
    setSqlCopied(ok);
    notify(ok ? "SQL del esquema copiado al portapapeles" : "No se pudo copiar", ok ? "ok" : "err");
    setTimeout(() => setSqlCopied(false), 1800);
  };

  const activadas = settings.extensions ?? [];
  const toggleExt = (id: string) => {
    const ext = EXTENSIONES.find((e) => e.id === id);
    const on = activadas.includes(id);
    update({ extensions: on ? activadas.filter((x) => x !== id) : [...activadas, id] });
    if (ext) {
      notify(
        on
          ? `Extensión «${ext.nombre}» desactivada`
          : `«${ext.nombre}» activada · ${ext.subtema.plantillas.length} plantillas nuevas en el módulo Plantillas`,
        on ? "warn" : "ok"
      );
    }
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
                <span className="font-bold text-ink">{historyCount} prompts</span> en localStorage
                {sbReady
                  ? ` · sincronización Supabase activa${settings.lastSync ? ` (última: ${timeAgo(settings.lastSync)})` : ""}.`
                  : " · activa la sincronización Supabase en el panel inferior para replicarlos en la nube."}
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

      {/* ── Sistema de Extensiones ── */}
      <Reveal className="mt-6">
        <section className="panel overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-line bg-pine px-6 py-4 text-paper">
            <Icon name="spark" className="h-5 w-5 text-[#ecc06a]" />
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-[17px] font-extrabold">Sistema de Extensiones</h3>
              <p className="font-mono text-[10.5px] text-paper/55">Módulos opcionales de plantillas · activación instantánea · persisten en tu navegador</p>
            </div>
            <span className="rounded-full bg-pine-3 px-3 py-1.5 font-mono text-[10.5px] font-bold uppercase tracking-wide text-[#ecc06a]">
              {activadas.length}/{EXTENSIONES.length} activas
            </span>
          </div>
          <div className="grid gap-4 p-6 md:grid-cols-3">
            {EXTENSIONES.map((e) => {
              const on = activadas.includes(e.id);
              const tema = TEMAS.find((t) => t.id === e.temaDestino);
              return (
                <div
                  key={e.id}
                  className={`group relative flex flex-col rounded-lg border p-5 transition-all duration-300 ${on ? "" : "border-line bg-paper/60 hover:border-line-2"}`}
                  style={on ? { borderColor: e.hex, backgroundColor: `${e.hex}0d`, boxShadow: `0 16px 36px -20px ${e.hex}88` } : undefined}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-surface transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105" style={{ backgroundColor: e.hex }}>
                      <Icon name={e.icono} className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-display text-[15.5px] font-extrabold text-ink">
                        {e.nombre}
                        <span className="rounded bg-line/70 px-1.5 py-0.5 font-mono text-[9px] font-bold text-mist">v{e.version}</span>
                      </p>
                      <p className="mt-0.5 text-[12px] leading-snug text-mist">{e.desc}</p>
                    </div>
                  </div>
                  <p className="mt-3 font-mono text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: e.hex }}>
                    +{e.subtema.plantillas.length} plantillas → {tema?.nombre ?? e.temaDestino}
                  </p>
                  <button
                    onClick={() => toggleExt(e.id)}
                    className={`press mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 font-mono text-xs font-bold transition-colors ${
                      on ? "bg-ink text-paper hover:bg-danger" : "text-surface"
                    }`}
                    style={on ? undefined : { backgroundColor: e.hex }}
                    title={on ? "Desactivar extensión" : "Activar extensión"}
                  >
                    {on ? (
                      <>
                        <Icon name="check" className="h-3.5 w-3.5" /> Activada · click para quitar
                      </>
                    ) : (
                      "Activar extensión"
                    )}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="border-t border-line bg-paper/60 px-6 py-3 font-mono text-[10.5px] leading-relaxed text-mist">
            Las extensiones inyectan sus subtemas en el catálogo de Plantillas con la insignia <span className="font-bold text-ink">EXT</span>. Puedes componer prompts híbridos: plantilla base + calibración de nicho en el Generador Clásico.
          </p>
        </section>
      </Reveal>

      {/* ── Sincronización Supabase ── */}
      <Reveal className="mt-6">
        <section className={`panel overflow-hidden transition-shadow ${sbReady ? "shadow-[0_14px_36px_-18px_rgba(15,122,85,0.55)]" : ""}`}>
          <div className="flex flex-wrap items-center gap-3 border-b border-line bg-pine px-6 py-4 text-paper">
            <Icon name="cloud" className="h-5 w-5 text-[#7ee2b4]" />
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-[17px] font-extrabold">Sincronización Supabase</h3>
              <p className="font-mono text-[10.5px] text-paper/55">PostgreSQL · tabla rctee_history · push automático con debounce de 2.5 s</p>
            </div>
            <span
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[10.5px] font-bold uppercase tracking-wide ${
                sbReady ? "bg-[#7ee2b4]/15 text-[#7ee2b4]" : "bg-pine-3 text-paper/60"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${sbReady ? "bg-[#7ee2b4] dot-live" : "bg-paper/30"}`} />
              {sbReady ? (unsyncedCount > 0 ? `${unsyncedCount} pendientes` : "sincronizado") : "inactivo"}
            </span>
          </div>

          <div className="grid gap-8 p-6 lg:grid-cols-[1fr_1fr]">
            {/* Configuración y acciones */}
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block font-display text-[14px] font-bold text-ink">URL del proyecto</label>
                <input
                  value={settings.supabaseUrl}
                  onChange={(e) => setAndFlash({ supabaseUrl: e.target.value })}
                  placeholder="https://tu-proyecto.supabase.co"
                  className={`${inputCls} font-mono text-[12.5px]`}
                />
              </div>
              <div>
                <label className="mb-1.5 block font-display text-[14px] font-bold text-ink">Clave anónima (anon key)</label>
                <div className="flex gap-2">
                  <input
                    type={showSbKey ? "text" : "password"}
                    value={settings.supabaseKey}
                    onChange={(e) => setAndFlash({ supabaseKey: e.target.value })}
                    placeholder="eyJhbGciOi…"
                    className={`${inputCls} font-mono text-[12.5px]`}
                  />
                  <button
                    onClick={() => setShowSbKey((s) => !s)}
                    className="press shrink-0 rounded-lg border border-line-2 bg-paper px-3 text-mist hover:border-jade hover:text-jade"
                    aria-label="Mostrar u ocultar clave de Supabase"
                  >
                    <Icon name="eye" className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-mist">
                  Se guarda solo en este navegador. También puedes definirla vía <span className="font-mono font-bold text-ink">VITE_SUPABASE_ANON_KEY</span> en <span className="font-mono">.env</span>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={probarSupabase}
                  disabled={sbPing === "checking"}
                  className="press inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 font-mono text-xs font-bold text-paper hover:bg-pine-3 disabled:cursor-wait disabled:opacity-60"
                >
                  {sbPing === "checking" ? (
                    <>
                      <Spinner /> Probando…
                    </>
                  ) : (
                    "Probar conexión"
                  )}
                </button>
                {sbPing === "ok" && (
                  <span className="anim-pop inline-flex items-center gap-1.5 rounded-full bg-jade/10 px-3 py-1.5 font-mono text-[11px] font-bold text-jade">
                    <Icon name="check" className="h-3.5 w-3.5" /> En línea · {sbCount} registros
                  </span>
                )}
                {sbPing === "fail" && (
                  <span className="anim-pop rounded-full bg-danger/10 px-3 py-1.5 font-mono text-[11px] font-bold text-danger">Sin respuesta</span>
                )}
              </div>

              <div className="border-t border-line pt-4">
                <Toggle
                  checked={settings.syncEnabled}
                  onChange={(v) => {
                    setAndFlash({ syncEnabled: v });
                    notify(v ? "Sincronización activada: el próximo cambio subirá en ~2.5 s" : "Sincronización pausada", v ? "ok" : "warn");
                  }}
                  label="Sincronizar historial automáticamente"
                  desc="Push con debounce tras cada generación · pull y fusión al arrancar la consola."
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={onPushNow}
                    className="press inline-flex items-center gap-2 rounded-md border border-line-2 bg-paper px-4 py-2.5 font-mono text-xs font-bold text-ink hover:border-jade hover:text-jade"
                  >
                    <Icon name="upload" className="h-3.5 w-3.5" /> Subir ahora
                    {unsyncedCount > 0 && <span className="rounded-full bg-ember px-1.5 py-0.5 text-[9.5px] text-surface">{unsyncedCount}</span>}
                  </button>
                  <button
                    onClick={onPullNow}
                    className="press inline-flex items-center gap-2 rounded-md border border-line-2 bg-paper px-4 py-2.5 font-mono text-xs font-bold text-ink hover:border-cobalt hover:text-cobalt"
                  >
                    <Icon name="download" className="h-3.5 w-3.5" /> Bajar ahora
                  </button>
                  {settings.lastSync && (
                    <span className="ml-auto self-center font-mono text-[10.5px] text-mist">última sync {timeAgo(settings.lastSync)}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Esquema SQL */}
            <div className="min-w-0">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-display text-[14px] font-bold text-ink">Esquema de la tabla</p>
                <button
                  onClick={copiarSql}
                  className={`press rounded-md px-3 py-1.5 font-mono text-[11px] font-bold transition-colors ${sqlCopied ? "bg-jade text-surface" : "border border-line-2 bg-paper text-ink hover:border-jade hover:text-jade"}`}
                >
                  {sqlCopied ? "¡Copiado!" : "Copiar SQL"}
                </button>
              </div>
              <pre className="max-h-[300px] overflow-auto rounded-lg border border-pine-3 bg-pine p-4 font-mono text-[11px] leading-relaxed text-[#d7e5da]">
                {SQL_SCHEMA}
              </pre>
              <div className="mt-3 rounded-md border-l-2 border-honey bg-honey/10 px-4 py-3">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-honey">Nota de seguridad</p>
                <p className="mt-1 text-[12px] leading-relaxed text-ink/80">
                  La política incluida es de demostración (acceso anónimo). En producción, activa RLS con políticas por <span className="font-mono font-bold">auth.uid()</span> y usa la anon key solo para lectura acotada.
                </p>
              </div>
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
