/* ────────────────────────────────────────────────────────────────────────────
   R-C-T-E-E PRO · src/chrome.tsx
   Estructura de la consola: Sidebar de navegación, TopBar con reloj en vivo
   y el drawer de Historial con exportación / importación.
   ──────────────────────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { NAV, VERSION, type SectionId } from "./data";
import { download, timeAgo, type Fuente, type HistoryItem, type Settings } from "./engine";
import { CopyBtn } from "./ui";

/* ── Iconografía propia (SVG inline) ───────────────────────────────────────── */

function I({ d, className = "h-[18px] w-[18px]" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ICONS: Record<string, string> = {
  dashboard: "M4 4h7v7H4zM13 4h7v4h-7zM13 11h7v9h-7zM4 14h7v6H4z",
  clasico: "M4 7h9M17 7h3M4 12h3M11 12h9M4 17h12M20 17h.01M15 5v4M7 10v4M18 15v4",
  enterprise: "M8 4c-2 0-2 2-2 3s.5 3-2 5c2.5 2 2 4 2 5s0 3 2 3M16 4c2 0 2 2 2 3s-.5 3 2 5c-2.5 2-2 4-2 5s0 3-2 3M12 10v4",
  plantillas: "M12 3 3 8l9 5 9-5-9-5zM3 13l9 5 9-5",
  rentables: "M12 2v20M17 6.5c0-1.9-2.2-3-5-3s-5 1.1-5 3 1.8 2.7 5 3.5 5 1.6 5 3.5-2.2 3-5 3-5-1.1-5-3",
  mercado: "M3 20h18M6 16v-5M10 16V8M14 16v-8M18 16V5",
  chatbot: "M21 12a8 8 0 0 1-11.6 7.2L4 21l1.8-5.4A8 8 0 1 1 21 12zM9 11h.01M12 11h.01M15 11h.01",
  ajustes: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9v0a1.7 1.7 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1z",
  history: "M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3.5 2",
  x: "M18 6 6 18M6 6l12 12",
  menu: "M4 6h16M4 12h16M4 18h16",
  upload: "M12 16V4M6 10l6-6 6 6M4 20h16",
  download: "M12 4v12M6 10l6 6 6-6M4 20h16",
  trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6",
  send: "M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z",
  cloud: "M17.5 19a4.5 4.5 0 1 0-.4-9A7 7 0 1 0 6 19h11.5z",
  server: "M4 5h16v6H4zM4 13h16v6H4zM8 8h.01M8 16h.01",
  key: "M21 2l-2 2m-5.6 5.6a5.5 5.5 0 1 1-7.8 7.8 5.5 5.5 0 0 1 7.8-7.8zm0 0L19 4m-3.5 3.5L18 10",
  spark: "M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1",
  arrow: "M5 12h14M13 6l6 6-6 6",
  check: "M20 6 9 17l-5-5",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  refresh: "M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.3L3 16M3 21v-5h5",
  wa: "M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 21l1.9-5.4A8.5 8.5 0 1 1 21 11.5zM9.5 9.8c.2 2.9 1.9 4.6 4.7 4.9l.9-1.4-1.9-1-.8.5c-.7-.5-1.3-1.1-1.7-1.8l.5-.8-1-1.9-1.6.5c-.1.3 0 .7.9 1z",
  shield: "M12 2l8 3.5v5.6c0 4.9-3.4 8.6-8 10.9-4.6-2.3-8-6-8-10.9V5.5L12 2zM8.5 12l2.4 2.4 4.6-4.8",
  gauge: "M4.5 19a9 9 0 1 1 15 0M12 13.5 16 9M12 15.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
};

export function Icon({ name, className }: { name: keyof typeof ICONS | string; className?: string }) {
  return <I d={ICONS[name] ?? ICONS.spark} className={className} />;
}

/* ── Logo ──────────────────────────────────────────────────────────────────── */

function Logo() {
  const cells: [number, number, string][] = [
    [0, 0, "#e4572e"],
    [12, 0, "#2e5eaa"],
    [24, 0, "#0f7a55"],
    [6, 12, "#d99125"],
    [18, 12, "#b23a6b"],
  ];
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0">
      {cells.map(([x, y, c], i) => (
        <rect key={i} x={x + 2} y={y + 2} width="8" height="8" rx="2" fill={c} />
      ))}
      <rect x="8" y="26" width="16" height="3" rx="1.5" fill="#f2f3ec" />
    </svg>
  );
}

/* ── Sidebar ───────────────────────────────────────────────────────────────── */

export function Sidebar({
  section,
  setSection,
  settings,
  historyCount,
  openHistory,
  mobileOpen,
  closeMobile,
  syncLabel,
  extCount,
}: {
  section: SectionId;
  setSection: (s: SectionId) => void;
  settings: Settings;
  historyCount: number;
  openHistory: () => void;
  mobileOpen: boolean;
  closeMobile: () => void;
  syncLabel?: string | null;
  extCount?: number;
}) {
  const cloud = settings.mode === "cloud";
  const motorLabel = cloud ? `Groq · ${settings.groqModel === "llama3-8b-8192" ? "llama3-8b" : "mixtral-8x7b"}` : `Ollama · ${settings.ollamaModel}`;
  const keyOk = cloud ? settings.groqKey.trim().length > 8 : true;

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-pine/50 backdrop-blur-[2px] lg:hidden" onClick={closeMobile} />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col bg-pine text-paper transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-5 pb-5 pt-6">
          <Logo />
          <div className="leading-tight">
            <p className="font-display text-[17px] font-extrabold tracking-tight">
              R-C-T-E-E <span className="text-jade" style={{ color: "#7ee2b4" }}>PRO</span>
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/45">Consola de prompts · v{VERSION}</p>
          </div>
        </div>

        <nav className="mt-1 flex-1 space-y-0.5 overflow-y-auto px-3">
          {NAV.map((item) => {
            const active = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setSection(item.id);
                  closeMobile();
                }}
                className={`press group relative flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${
                  active ? "bg-pine-2 text-paper" : "text-paper/65 hover:bg-pine-2/60 hover:text-paper"
                }`}
              >
                <span
                  className={`absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full transition-all duration-300 ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ backgroundColor: active ? "#7ee2b4" : "transparent" }}
                />
                <span className={`font-mono text-[10px] font-semibold tabular-nums ${active ? "text-[#7ee2b4]" : "text-paper/35"}`}>{item.n}</span>
                <Icon name={item.id} className={`h-[17px] w-[17px] ${active ? "text-[#7ee2b4]" : "text-paper/50 group-hover:text-paper/80"}`} />
                <span className="text-[13.5px] font-semibold">{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => {
              openHistory();
              closeMobile();
            }}
            className="press group flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-paper/65 transition-colors hover:bg-pine-2/60 hover:text-paper"
          >
            <span className="w-[22px] text-center font-mono text-[10px] font-semibold text-paper/35">▤</span>
            <Icon name="history" className="h-[17px] w-[17px] text-paper/50 group-hover:text-paper/80" />
            <span className="text-[13.5px] font-semibold">Historial</span>
            {historyCount > 0 && (
              <span className="ml-auto rounded-full bg-pine-3 px-2 py-0.5 font-mono text-[10px] font-bold text-[#7ee2b4]">{historyCount}</span>
            )}
          </button>
        </nav>

        <div className="border-t border-pine-3/60 p-4">
          <div className="flex items-center gap-2.5 rounded-md bg-pine-2 px-3 py-2.5">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${cloud ? "bg-[#7fa8e0] dot-warn" : keyOk ? "bg-[#7ee2b4] dot-live" : "bg-[#ecc06a] dot-warn"}`}
              style={{ backgroundColor: cloud ? "#7fa8e0" : undefined }}
            />
            <div className="min-w-0 leading-tight">
              <p className="truncate font-mono text-[11px] font-semibold text-paper">{cloud ? "MODO CLOUD" : "MODO LOCAL"}</p>
              <p className="truncate font-mono text-[10px] text-paper/45">{motorLabel}</p>
            </div>
          </div>
          <p className="mt-3 px-1 font-mono text-[10px] leading-relaxed text-paper/35">
            {cloud
              ? settings.groqKey.trim().length > 8
                ? "API key Groq presente en el navegador."
                : "Sin API key: usando motor de respaldo."
              : "Ejecutando contra Ollama local."}
          </p>
          {syncLabel && (
            <div className="mt-3 flex items-center gap-2 rounded-md border border-pine-3/70 px-3 py-2">
              <Icon name="cloud" className="h-3.5 w-3.5 shrink-0 text-[#7ee2b4]" />
              <p className="truncate font-mono text-[10px] font-semibold uppercase tracking-wide text-paper/70">{syncLabel}</p>
            </div>
          )}
          {(extCount ?? 0) > 0 && (
            <div className="mt-2 flex items-center gap-2 rounded-md border border-pine-3/70 px-3 py-2">
              <Icon name="gauge" className="h-3.5 w-3.5 shrink-0 text-[#ecc06a]" />
              <p className="truncate font-mono text-[10px] font-semibold uppercase tracking-wide text-paper/70">
                {extCount} extensión{extCount === 1 ? "" : "es"} activas
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

/* ── TopBar ────────────────────────────────────────────────────────────────── */

export function TopBar({
  section,
  settings,
  onToggleMode,
  onOpenHistory,
  historyCount,
  onMenu,
}: {
  section: SectionId;
  settings: Settings;
  onToggleMode: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  onMenu: () => void;
}) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const meta = NAV.find((n) => n.id === section);
  const cloud = settings.mode === "cloud";

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button onClick={onMenu} className="press rounded-md border border-line bg-surface p-2 text-ink lg:hidden" aria-label="Abrir menú">
          <Icon name="menu" />
        </button>
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-mist">
            Módulo {meta?.n} <span className="mx-1 text-line-2">/</span> R-C-T-E-E Pro
          </p>
          <h1 className="truncate font-display text-lg font-extrabold tracking-tight text-ink sm:text-xl">{meta?.label}</h1>
        </div>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <span className="hidden items-center gap-1.5 font-mono text-[10px] font-semibold text-mist/80 xl:flex">
            <kbd>1</kbd>–<kbd>8</kbd> módulos
          </span>
          <span className="hidden font-mono text-xs font-medium tabular-nums text-mist md:block">
            {now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
          <button
            onClick={onToggleMode}
            title="Alternar motor Cloud (Groq) / Local (Ollama)"
            className={`press flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] font-bold transition-colors ${
              cloud ? "border-cobalt/40 bg-cobalt/10 text-cobalt" : "border-jade/40 bg-jade/10 text-jade"
            }`}
          >
            <Icon name={cloud ? "cloud" : "server"} className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{cloud ? "CLOUD · GROQ" : "LOCAL · OLLAMA"}</span>
            <span className="sm:hidden">{cloud ? "CLOUD" : "LOCAL"}</span>
          </button>
          <button
            onClick={onOpenHistory}
            className="press relative rounded-md border border-line bg-surface p-2 text-ink hover:border-jade hover:text-jade"
            aria-label="Abrir historial"
          >
            <Icon name="history" />
            {historyCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ember px-1 font-mono text-[9px] font-bold text-surface">
                {historyCount > 99 ? "99+" : historyCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

/* ── Drawer de Historial ───────────────────────────────────────────────────── */

const FUENTE_META: Record<Fuente, { label: string; hex: string }> = {
  clasico: { label: "CLÁSICO", hex: "#0f7a55" },
  enterprise: { label: "ENTERPRISE", hex: "#2e5eaa" },
  plantilla: { label: "PLANTILLA", hex: "#b23a6b" },
};

export function HistoryDrawer({
  open,
  onClose,
  items,
  onDelete,
  onClearAll,
  onExportAll,
  onImport,
  notify,
}: {
  open: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onExportAll: () => void;
  onImport: (file: File) => void;
  onReload: (item: HistoryItem) => void;
  notify: (msg: string, kind?: "ok" | "warn" | "err") => void;
}) {
  const [filter, setFilter] = useState<"todos" | Fuente>("todos");
  const [confirmClear, setConfirmClear] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const filtered = filter === "todos" ? items : items.filter((i) => i.fuente === filter);

  useEffect(() => {
    if (!open) setConfirmClear(false);
  }, [open]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-pine/45 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 right-0 z-[70] flex w-full max-w-[440px] flex-col border-l border-line bg-paper shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-line bg-surface px-5 py-4">
          <Icon name="history" className="h-5 w-5 text-jade" />
          <div>
            <h2 className="font-display text-base font-extrabold text-ink">Historial de prompts</h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist">{items.length} registros · persistencia local</p>
          </div>
          <button onClick={onClose} className="press ml-auto rounded-md p-2 text-mist hover:bg-line/50 hover:text-ink" aria-label="Cerrar">
            <Icon name="x" />
          </button>
        </div>

        <div className="flex gap-1.5 border-b border-line bg-surface px-5 py-2.5">
          {(["todos", "clasico", "enterprise", "plantilla"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`press rounded-full px-3 py-1 font-mono text-[10.5px] font-bold uppercase tracking-wide transition-colors ${
                filter === f ? "bg-ink text-paper" : "bg-line/60 text-mist hover:bg-line"
              }`}
            >
              {f === "todos" ? "Todos" : FUENTE_META[f].label}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {filtered.length === 0 && (
            <div className="mt-10 rounded-lg border border-dashed border-line-2 bg-surface/60 px-6 py-10 text-center">
              <p className="font-display text-sm font-bold text-ink">Sin registros aquí</p>
              <p className="mt-1 text-xs leading-relaxed text-mist">Los prompts que generes aparecerán con exportación MD / JSON incluida.</p>
            </div>
          )}
          {filtered.map((item) => {
            const meta = FUENTE_META[item.fuente];
            return (
              <article key={item.id} className="panel panel-hover p-4">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 inline-flex rounded px-1.5 py-0.5 font-mono text-[9px] font-bold text-surface" style={{ backgroundColor: meta.hex }}>
                    {meta.label}
                  </span>
                  <h3 className="min-w-0 flex-1 truncate font-display text-[14px] font-bold text-ink">{item.titulo}</h3>
                  <span className="shrink-0 font-mono text-[10px] text-mist">{timeAgo(item.ts)}</span>
                </div>
                <p className="mt-2 line-clamp-2 font-mono text-[11px] leading-relaxed text-mist">{item.prompt.slice(0, 160)}…</p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <CopyBtn text={item.prompt} />
                  <button
                    onClick={() => {
                      download(`${item.titulo.slice(0, 40).replace(/\s+/g, "-").toLowerCase()}.md`, item.prompt, "text/markdown");
                      notify("Exportado como Markdown", "ok");
                    }}
                    className="press rounded-md border border-line-2 bg-surface px-3 py-1.5 font-mono text-xs font-semibold text-ink hover:border-jade hover:text-jade"
                  >
                    .md
                  </button>
                  <button
                    onClick={() => {
                      download(
                        `${item.titulo.slice(0, 40).replace(/\s+/g, "-").toLowerCase()}.json`,
                        JSON.stringify(item, null, 2),
                        "application/json"
                      );
                      notify("Exportado como JSON", "ok");
                    }}
                    className="press rounded-md border border-line-2 bg-surface px-3 py-1.5 font-mono text-xs font-semibold text-ink hover:border-jade hover:text-jade"
                  >
                    .json
                  </button>
                  {typeof item.score === "number" && (
                    <span className="ml-auto font-mono text-[10px] font-bold text-jade">score {item.score}</span>
                  )}
                  <button
                    onClick={() => {
                      onDelete(item.id);
                      notify("Registro eliminado", "warn");
                    }}
                    className="press rounded-md p-1.5 text-mist hover:bg-danger/10 hover:text-danger"
                    aria-label="Eliminar"
                  >
                    <Icon name="trash" className="h-4 w-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <div className="space-y-2 border-t border-line bg-surface px-5 py-4">
          <div className="flex gap-2">
            <button
              onClick={onExportAll}
              disabled={items.length === 0}
              className="press flex flex-1 items-center justify-center gap-2 rounded-md bg-ink px-3 py-2.5 font-mono text-xs font-bold text-paper hover:bg-pine-3 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon name="download" className="h-3.5 w-3.5" /> Exportar todo
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="press flex flex-1 items-center justify-center gap-2 rounded-md border border-line-2 bg-paper px-3 py-2.5 font-mono text-xs font-bold text-ink hover:border-jade hover:text-jade"
            >
              <Icon name="upload" className="h-3.5 w-3.5" /> Importar
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onImport(f);
                e.target.value = "";
              }}
            />
          </div>
          <button
            onClick={() => {
              if (!confirmClear) {
                setConfirmClear(true);
                setTimeout(() => setConfirmClear(false), 2600);
                return;
              }
              onClearAll();
              setConfirmClear(false);
              notify("Historial vaciado", "warn");
            }}
            disabled={items.length === 0}
            className={`press w-full rounded-md px-3 py-2 font-mono text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              confirmClear ? "bg-danger text-surface" : "text-danger hover:bg-danger/10"
            }`}
          >
            {confirmClear ? "¿Confirmar? Click de nuevo para vaciar" : "Vaciar historial"}
          </button>
        </div>
      </aside>
    </>
  );
}

/* ── Ticker de conceptos ───────────────────────────────────────────────────── */

export function Ticker({ items }: { items: readonly string[] }) {
  const row = (
    <>
      {items.map((t, i) => (
        <span key={i} className="flex items-center">
          <span className="whitespace-nowrap px-5 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-mist">{t}</span>
          <span className="h-1 w-1 rounded-full bg-ember" />
        </span>
      ))}
    </>
  );
  return (
    <div className="mq overflow-hidden border-y border-line bg-surface/70 py-2.5">
      <div className="mq-track">
        {row}
        {row}
      </div>
    </div>
  );
}

/* ── Título de vista ───────────────────────────────────────────────────────── */

export function ViewHeader({ eyebrow, title, desc, right }: { eyebrow: string; title: string; desc: string; right?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-jade">{eyebrow}</p>
        <h2 className="mt-1 font-display text-[26px] font-extrabold leading-tight tracking-tight text-ink sm:text-[32px]">{title}</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-mist">{desc}</p>
      </div>
      {right}
    </div>
  );
}
