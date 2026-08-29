/* ────────────────────────────────────────────────────────────────────────────
   R-C-T-E-E PRO · App — orquestador de la consola
   Navegación por módulos, estado global, persistencia y notificaciones.
   ──────────────────────────────────────────────────────────────────────────── */

import { useCallback, useEffect, useState } from "react";
import { NAV, type SectionId } from "./data";
import {
  DEFAULT_SETTINGS,
  download,
  loadLS,
  LS,
  saveLS,
  uid,
  type ChatMsg,
  type HistoryItem,
  type Settings,
} from "./engine";
import { HistoryDrawer, Icon, Sidebar, TopBar } from "./chrome";
import Dashboard from "./views/Dashboard";
import Classic from "./views/Classic";
import Enterprise from "./views/Enterprise";
import Templates from "./views/Templates";
import { Mercado, Rentables } from "./views/Intel";
import Chatbot from "./views/Chatbot";
import SettingsView from "./views/Settings";
import type { CamposRCTEE, Nicho } from "./data";

interface Toast {
  id: string;
  msg: string;
  kind: "ok" | "warn" | "err";
}

const TOAST_STYLE: Record<Toast["kind"], { border: string; bg: string; text: string }> = {
  ok: { border: "border-l-jade", bg: "bg-surface", text: "text-ink" },
  warn: { border: "border-l-honey", bg: "bg-surface", text: "text-ink" },
  err: { border: "border-l-danger", bg: "bg-surface", text: "text-ink" },
};

export default function App() {
  const [section, setSection] = useState<SectionId>("dashboard");
  const [settings, setSettings] = useState<Settings>(() => ({ ...DEFAULT_SETTINGS, ...loadLS<Partial<Settings>>(LS.settings, {}) }));
  const [history, setHistory] = useState<HistoryItem[]>(() => loadLS<HistoryItem[]>(LS.history, []));
  const [chat, setChat] = useState<ChatMsg[]>(() => loadLS<ChatMsg[]>(LS.chat, []));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [prefill, setPrefill] = useState<{ titulo?: string; campos: CamposRCTEE } | null>(null);

  /* ── Persistencia ── */
  useEffect(() => saveLS(LS.settings, settings), [settings]);
  useEffect(() => saveLS(LS.history, history), [history]);
  useEffect(() => saveLS(LS.chat, chat.slice(-60)), [chat]);

  /* ── Atajos de teclado: 1–8 navegan entre módulos ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const idx = ["1", "2", "3", "4", "5", "6", "7", "8"].indexOf(e.key);
      if (idx >= 0 && NAV[idx]) {
        setSection(NAV[idx].id);
        if (NAV[idx].id !== "clasico") setPrefill(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ── Notificaciones ── */
  const notify = useCallback((msg: string, kind: Toast["kind"] = "ok") => {
    const id = uid();
    setToasts((t) => [...t.slice(-3), { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  /* ── Historial ── */
  const savePrompt = useCallback((item: HistoryItem) => {
    setHistory((h) => [item, ...h].slice(0, 100));
  }, []);

  const deleteItem = (id: string) => setHistory((h) => h.filter((i) => i.id !== id));

  const exportAll = () => {
    if (history.length === 0) {
      notify("No hay registros para exportar", "warn");
      return;
    }
    download("rctee-historial.json", JSON.stringify(history, null, 2), "application/json");
    notify(`Historial exportado (${history.length} registros)`, "ok");
  };

  const importFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const arr: unknown[] = Array.isArray(parsed) ? parsed : [parsed];
        const valid = arr.filter(
          (x): x is HistoryItem =>
            typeof x === "object" && x !== null && typeof (x as HistoryItem).prompt === "string" && typeof (x as HistoryItem).titulo === "string"
        );
        if (valid.length === 0) {
          notify("El archivo no contiene prompts válidos", "err");
          return;
        }
        const norm = valid.map((i) => ({
          id: typeof i.id === "string" ? i.id : uid(),
          ts: typeof i.ts === "number" ? i.ts : Date.now(),
          fuente: (["clasico", "enterprise", "plantilla"] as const).includes(i.fuente) ? i.fuente : ("clasico" as const),
          titulo: i.titulo,
          prompt: i.prompt,
          formato: (["markdown", "json", "texto"] as const).includes(i.formato) ? i.formato : ("markdown" as const),
          score: typeof i.score === "number" ? i.score : undefined,
          meta: typeof i.meta === "string" ? i.meta : undefined,
        }));
        setHistory((h) => {
          const ids = new Set(h.map((x) => x.id));
          const nuevos = norm.filter((n) => !ids.has(n.id));
          return [...nuevos, ...h].slice(0, 100);
        });
        notify(`${valid.length} prompts importados correctamente`, "ok");
      } catch {
        notify("JSON inválido: no se pudo importar", "err");
      }
    };
    reader.onerror = () => notify("No se pudo leer el archivo", "err");
    reader.readAsText(file);
  };

  /* ── Flujo desde Nichos Rentables ── */
  const applyNicho = (n: Nicho) => {
    setPrefill({ titulo: n.titulo, campos: n.campos });
    setSection("clasico");
    notify(`Nicho «${n.titulo}» cargado en el Generador Clásico`, "ok");
  };

  const toggleMode = () => {
    const next = settings.mode === "cloud" ? "local" : "cloud";
    setSettings((s) => ({ ...s, mode: next }));
    notify(`Motor cambiado a ${next === "cloud" ? "Cloud · Groq" : "Local · Ollama"}`, "ok");
  };

  /* ── Vista activa ── */
  const view = () => {
    switch (section) {
      case "dashboard":
        return <Dashboard history={history} settings={settings} goto={setSection} />;
      case "clasico":
        return (
          <Classic
            onSave={savePrompt}
            notify={notify}
            prefill={prefill}
            defaultFormat={settings.defaultFormat}
            defaultToggles={{ cot: settings.cot, autoverif: settings.autoverif, neg: settings.neg }}
          />
        );
      case "enterprise":
        return <Enterprise onSave={savePrompt} notify={notify} />;
      case "plantillas":
        return <Templates onSave={savePrompt} notify={notify} />;
      case "rentables":
        return <Rentables onUse={applyNicho} />;
      case "mercado":
        return <Mercado />;
      case "chatbot":
        return <Chatbot settings={settings} messages={chat} setMessages={setChat} notify={notify} />;
      case "ajustes":
        return (
          <SettingsView
            settings={settings}
            update={(patch) => setSettings((s) => ({ ...s, ...patch }))}
            historyCount={history.length}
            onExportAll={exportAll}
            onImportFile={importFile}
            onClearHistory={() => {
              setHistory([]);
              notify("Historial vaciado", "warn");
            }}
            notify={notify}
          />
        );
    }
  };

  return (
    <div className="min-h-screen">
      {/* grano de película · capa ambiental superior */}
      <div aria-hidden className="grain pointer-events-none fixed inset-0 z-[85] opacity-[0.05] mix-blend-multiply" />
      <Sidebar
        section={section}
        setSection={(s) => {
          setSection(s);
          if (s !== "clasico") setPrefill(null);
        }}
        settings={settings}
        historyCount={history.length}
        openHistory={() => setHistoryOpen(true)}
        mobileOpen={mobileNav}
        closeMobile={() => setMobileNav(false)}
      />

      <div className="lg:pl-[248px]">
        <TopBar
          section={section}
          settings={settings}
          onToggleMode={toggleMode}
          onOpenHistory={() => setHistoryOpen(true)}
          historyCount={history.length}
          onMenu={() => setMobileNav(true)}
        />
        <main key={section} className="anim-section mx-auto max-w-[1240px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
          {view()}
        </main>
        <footer className="border-t border-line py-5 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist">
            R-C-T-E-E Pro · Metodología Rol–Contexto–Tarea–Especificaciones–Ejemplos · build 2.1.0
          </p>
        </footer>
      </div>

      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        items={history}
        onDelete={deleteItem}
        onClearAll={() => setHistory([])}
        onExportAll={exportAll}
        onImport={importFile}
        notify={notify}
      />

      {/* ── Toasts ── */}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[80] flex w-[min(360px,90vw)] flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`anim-pop pointer-events-auto flex items-start gap-2.5 rounded-md border border-line border-l-4 px-4 py-3 shadow-lg ${TOAST_STYLE[t.kind].border} ${TOAST_STYLE[t.kind].bg}`}>
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                t.kind === "ok" ? "bg-jade/15 text-jade" : t.kind === "warn" ? "bg-honey/15 text-honey" : "bg-danger/15 text-danger"
              }`}
            >
              <Icon name={t.kind === "ok" ? "check" : "spark"} className="h-3 w-3" />
            </span>
            <p className={`text-[12.5px] font-semibold leading-snug ${TOAST_STYLE[t.kind].text}`}>{t.msg}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
