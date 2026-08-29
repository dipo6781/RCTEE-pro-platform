/* ────────────────────────────────────────────────────────────────────────────
   R-C-T-E-E PRO · Runbook
   Registro persistente de ejecutables manuales: testing, build, git,
   Supabase y Ollama. Copiar al portapapeles + marcado de "ejecutado".
   ──────────────────────────────────────────────────────────────────────────── */

import { useEffect, useMemo, useState } from "react";
import { RUNBOOK, type RunbookCmd } from "../data";
import { copyText, loadLS, saveLS } from "../engine";
import { Icon, ViewHeader } from "../chrome";
import { CopyBtn, CountUp, Meter, Reveal } from "../ui";

const LS_KEY = "rctee_runbook_v1";

/* Efecto de tipeo para la línea de estado del terminal */
function useTyping(text: string, speed = 26) {
  const [out, setOut] = useState("");
  useEffect(() => {
    let i = 0;
    setOut("");
    const t = setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [text, speed]);
  return out;
}

type Filtro = "todas" | "pendientes" | "completadas";

export default function Runbook({ notify }: { notify: (m: string, k?: "ok" | "warn" | "err") => void }) {
  const [executed, setExecuted] = useState<Record<string, boolean>>(() => loadLS(LS_KEY, {}));
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => saveLS(LS_KEY, executed), [executed]);

  const todos = useMemo(() => RUNBOOK.flatMap((c) => c.cmds), []);
  const total = todos.length;
  const done = todos.filter((c) => executed[c.id]).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  const linea = useTyping("$ rctee runbook --status");
  const celdas = 24;
  const llenas = Math.round((pct / 100) * celdas);

  const toggle = (id: string) => setExecuted((e) => ({ ...e, [id]: !e[id] }));

  const copiarCategoria = async (cmds: RunbookCmd[]) => {
    const ok = await copyText(cmds.map((c) => c.cmd).join("\n"));
    notify(ok ? `${cmds.length} comandos copiados al portapapeles` : "No se pudo copiar", ok ? "ok" : "err");
  };

  const reset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 2600);
      return;
    }
    setExecuted({});
    setConfirmReset(false);
    notify("Progreso del runbook reiniciado", "warn");
  };

  const coincide = (c: RunbookCmd) => {
    const q = busqueda.trim().toLowerCase();
    if (q === "") return true;
    return c.cmd.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q);
  };
  const pasaFiltro = (c: RunbookCmd) =>
    filtro === "todas" ? true : filtro === "pendientes" ? !executed[c.id] : !!executed[c.id];

  return (
    <div>
      <ViewHeader
        eyebrow="Módulo 09 · Operación manual"
        title="Runbook de ejecutables"
        desc="Todos los comandos que se ejecutan a mano, organizados por área. Cópialos al portapapeles con un click y márcalos como ejecutados; el progreso se guarda en tu navegador."
      />

      {/* ── Terminal de estado ── */}
      <Reveal>
        <div className="term mb-6 overflow-hidden rounded-lg">
          <div className="flex items-center gap-1.5 border-b border-pine-3/70 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-ember" />
            <span className="h-2.5 w-2.5 rounded-full bg-honey" />
            <span className="h-2.5 w-2.5 rounded-full bg-jade" />
            <span className="ml-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-paper/40">rctee · runbook</span>
          </div>
          <div className="px-5 py-4 font-mono text-[13px] leading-relaxed">
            <p className="text-paper/85">
              <span className="term-ok">➜</span> <span className="text-[#7fa8e0]">~</span> {linea}
              <span className="caret ml-0.5" />
            </p>
            <p className="mt-2 text-paper/70">
              <span className="term-ok">[</span>
              <span className="term-ok">{"█".repeat(llenas)}</span>
              <span className="text-paper/25">{"░".repeat(celdas - llenas)}</span>
              <span className="term-ok">]</span>{" "}
              <span className="font-bold text-paper">
                <CountUp to={pct} />%
              </span>
            </p>
            <p className="mt-1 text-paper/60">
              <span className="term-ok">✓</span> {done}/{total} ejecutables completados · {RUNBOOK.length} categorías
            </p>
            <div className="mt-3">
              <Meter value={pct} hex="#7ee2b4" />
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── Toolbar: búsqueda + filtro + reset ── */}
      <Reveal delay={80}>
        <div className="mb-6 flex flex-wrap items-center gap-2.5">
          <div className="focusable flex min-w-[220px] flex-1 items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 sm:max-w-xs">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-mist" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar comando…"
              className="w-full bg-transparent font-mono text-[12.5px] text-ink placeholder:text-mist/60"
            />
          </div>
          <div className="flex gap-1.5">
            {(["todas", "pendientes", "completadas"] as Filtro[]).map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`press rounded-full px-3.5 py-1.5 font-mono text-[11px] font-bold capitalize transition-colors ${
                  filtro === f ? "bg-ink text-paper" : "bg-line/60 text-mist hover:bg-line"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={reset}
            className={`press ml-auto rounded-md px-3.5 py-2 font-mono text-[11px] font-bold transition-colors ${
              confirmReset ? "bg-danger text-surface" : "border border-line-2 bg-surface text-mist hover:border-danger hover:text-danger"
            }`}
          >
            {confirmReset ? "¿Confirmar reinicio?" : "Reiniciar progreso"}
          </button>
        </div>
      </Reveal>

      {/* ── Categorías ── */}
      <div className="grid gap-5 lg:grid-cols-2">
        {RUNBOOK.map((cat, ci) => {
          const cmds = cat.cmds.filter((c) => coincide(c) && pasaFiltro(c));
          if (cmds.length === 0) return null;
          const catDone = cat.cmds.filter((c) => executed[c.id]).length;
          const catPct = Math.round((catDone / cat.cmds.length) * 100);
          return (
            <Reveal key={cat.id} delay={Math.min(ci * 70, 350)}>
              <section className="panel panel-hover flex h-full flex-col overflow-hidden">
                <header className="flex items-center gap-3 border-b border-line bg-paper/70 px-4 py-3.5">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-surface"
                    style={{ backgroundColor: cat.hex, boxShadow: `0 4px 12px -4px ${cat.hex}88` }}
                  >
                    <Icon name={cat.icon} className="h-[17px] w-[17px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[15px] font-extrabold leading-tight text-ink">
                      <span className="mr-1.5 font-mono text-[10px] font-bold text-mist">{cat.n}</span>
                      {cat.nombre}
                    </p>
                    <p className="truncate text-[11px] text-mist">{cat.desc}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-[11px] font-bold tabular-nums" style={{ color: cat.hex }}>
                      {catDone}/{cat.cmds.length}
                    </p>
                    <div className="mt-1 h-1 w-14 overflow-hidden rounded-full bg-line/70">
                      <div className="bar-fill h-full rounded-full" style={{ width: `${catPct}%`, backgroundColor: cat.hex }} />
                    </div>
                  </div>
                </header>

                <div className="flex-1 space-y-3 p-4">
                  {cmds.map((c) => {
                    const isDone = !!executed[c.id];
                    return (
                      <div
                        key={c.id}
                        className={`group rounded-md border-l-2 bg-paper/50 py-2.5 pl-3 pr-2 transition-all duration-200 hover:bg-paper ${
                          isDone ? "" : "border-transparent"
                        }`}
                        style={isDone ? { borderLeftColor: cat.hex } : undefined}
                      >
                        <div className="flex items-start gap-2.5">
                          <button
                            onClick={() => toggle(c.id)}
                            aria-label={isDone ? "Marcar como pendiente" : "Marcar como ejecutado"}
                            className={`press mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                              isDone ? "border-transparent text-surface" : "border-line-2 bg-surface text-transparent hover:border-mist"
                            }`}
                            style={isDone ? { backgroundColor: cat.hex } : undefined}
                          >
                            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 rounded-md bg-pine px-3 py-2">
                              <span className="shrink-0 font-mono text-[11px] font-bold text-[#7ee2b4]">{c.shell === "sql" ? "sql›" : "$"}</span>
                              <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-[12px] text-paper/90">{c.cmd}</code>
                              <CopyBtn text={c.cmd} dark />
                            </div>
                            <p className={`mt-1.5 text-[12px] leading-snug transition-colors ${isDone ? "text-mist/70" : "text-ink/85"}`}>{c.desc}</p>
                            {c.output && (
                              <p className="mt-1 font-mono text-[10.5px] text-mist">
                                <span className="term-ok font-bold">↳</span> {c.output}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <footer className="border-t border-line bg-paper/70 px-4 py-2.5">
                  <button
                    onClick={() => copiarCategoria(cmds)}
                    className="press inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-mist transition-colors hover:text-ink"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="12" height="12" rx="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copiar {cmds.length} comando{cmds.length === 1 ? "" : "s"} de {cat.nombre}
                  </button>
                </footer>
              </section>
            </Reveal>
          );
        })}
      </div>

      {RUNBOOK.every((cat) => cat.cmds.filter((c) => coincide(c) && pasaFiltro(c)).length === 0) && (
        <div className="mt-8 rounded-lg border border-dashed border-line-2 bg-surface/60 px-6 py-14 text-center">
          <p className="font-display text-[16px] font-bold text-ink">Sin resultados</p>
          <p className="mt-1 text-[13px] text-mist">Ajusta la búsqueda o el filtro para ver ejecutables.</p>
        </div>
      )}
    </div>
  );
}
