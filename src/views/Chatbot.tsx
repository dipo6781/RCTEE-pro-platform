/* ────────────────────────────────────────────────────────────────────────────
   R-C-T-E-E PRO · Chatbot IA
   8 personalidades especializadas · Groq (cloud) / Ollama (local) / respaldo.
   ──────────────────────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState } from "react";
import { PERSONAS } from "../data";
import { askAI, delay, uid, type ChatMsg, type Settings } from "../engine";
import { Icon } from "../chrome";
import { CopyBtn } from "../ui";

const SUGERENCIAS = [
  "Estructura un prompt R-C-T-E-E para mi caso",
  "¿Cuánto cobrar por este servicio?",
  "Dame un ejemplo calibrado",
  "Mi prompt no funciona, ¿qué reviso?",
];

export default function Chatbot({
  settings,
  messages,
  setMessages,
  notify,
}: {
  settings: Settings;
  messages: ChatMsg[];
  setMessages: (m: ChatMsg[]) => void;
  notify: (m: string, k?: "ok" | "warn" | "err") => void;
}) {
  const [personaId, setPersonaId] = useState(PERSONAS[0].id);
  const [texto, setTexto] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const persona = PERSONAS.find((p) => p.id === personaId) ?? PERSONAS[0];

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing]);

  const enviar = async (raw?: string) => {
    const contenido = (raw ?? texto).trim();
    if (contenido.length === 0 || typing) return;
    setTexto("");
    const userMsg: ChatMsg = { id: uid(), role: "user", content: contenido, personaId, ts: Date.now() };
    const withUser = [...messages, userMsg];
    setMessages(withUser);
    setTyping(true);
    const started = Date.now();
    try {
      const res = await askAI(settings, persona, withUser, contenido);
      const elapsed = Date.now() - started;
      if (elapsed < 900) await delay(900 - elapsed);
      setMessages([...withUser, { id: uid(), role: "assistant", content: res.text, personaId, engine: res.engine, ts: Date.now() }]);
    } catch {
      setMessages([
        ...withUser,
        {
          id: uid(),
          role: "assistant",
          content: "Se produjo un error inesperado al consultar el motor. Inténtalo de nuevo; si persiste, revisa la configuración en Ajustes.",
          personaId,
          engine: "error",
          ts: Date.now(),
        },
      ]);
      notify("Error al consultar el motor de IA", "err");
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[540px] flex-col gap-4 lg:flex-row">
      {/* ── Personalidades ── */}
      <aside className="panel flex shrink-0 gap-1.5 overflow-x-auto p-2 lg:w-[264px] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible">
        <p className="hidden px-2.5 pb-1 pt-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-mist lg:block">
          Personalidades · {PERSONAS.length}
        </p>
        {PERSONAS.map((p) => {
          const active = p.id === personaId;
          return (
            <button
              key={p.id}
              onClick={() => setPersonaId(p.id)}
              className={`press flex shrink-0 items-center gap-3 rounded-md px-2.5 py-2 text-left transition-colors lg:w-full ${
                active ? "bg-pine text-paper" : "hover:bg-line/50"
              }`}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md font-display text-[13px] font-extrabold text-surface"
                style={{ backgroundColor: p.hex }}
              >
                {p.nombre.slice(0, 2).toUpperCase()}
              </span>
              <span className="min-w-0 hidden sm:block lg:block">
                <span className={`block font-display text-[13.5px] font-bold ${active ? "text-paper" : "text-ink"}`}>{p.nombre}</span>
                <span className={`block truncate text-[10.5px] ${active ? "text-paper/55" : "text-mist"}`}>{p.area}</span>
              </span>
            </button>
          );
        })}
      </aside>

      {/* ── Conversación ── */}
      <div className="panel flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-line bg-pine px-4 py-3 text-paper">
          <span className="flex h-8 w-8 items-center justify-center rounded-md font-display text-[12px] font-extrabold text-surface" style={{ backgroundColor: persona.hex }}>
            {persona.nombre.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="font-display text-[14.5px] font-extrabold">{persona.nombre} · {persona.area}</p>
            <p className="truncate font-mono text-[10px] text-paper/50">{persona.tono}</p>
          </div>
          <span className="hidden rounded-full bg-pine-3 px-2.5 py-1 font-mono text-[9.5px] font-bold uppercase tracking-wide text-[#7ee2b4] sm:block">
            {settings.mode === "cloud" ? "Groq" : "Ollama"} activo
          </span>
          <button
            onClick={() => {
              setMessages([]);
              notify("Conversación reiniciada", "warn");
            }}
            className="press rounded-md p-1.5 text-paper/60 hover:bg-pine-3 hover:text-paper"
            title="Limpiar conversación"
          >
            <Icon name="refresh" className="h-4 w-4" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
          {messages.length === 0 && (
            <div className="mx-auto max-w-md pt-8 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg font-display text-xl font-extrabold text-surface" style={{ backgroundColor: persona.hex }}>
                {persona.nombre.slice(0, 2).toUpperCase()}
              </span>
              <p className="mt-4 font-display text-[17px] font-extrabold text-ink">Canal abierto con {persona.nombre}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-mist">
                {persona.tono}. Consulta sobre prompts, precios, clientes o pide ejemplos de {persona.area.toLowerCase()}.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {SUGERENCIAS.map((s) => (
                  <button
                    key={s}
                    onClick={() => enviar(s)}
                    className="press rounded-full border border-line-2 bg-surface px-3.5 py-2 text-[12px] font-semibold text-ink hover:border-jade hover:text-jade"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="anim-pop flex justify-end">
                <div className="max-w-[82%] rounded-lg rounded-br-sm bg-ink px-4 py-3 text-paper shadow-sm">
                  <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed">{m.content}</p>
                </div>
              </div>
            ) : (
              <div key={m.id} className="anim-pop flex justify-start">
                <div className="max-w-[88%] rounded-lg rounded-bl-sm border border-line bg-surface px-4 py-3 shadow-sm">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: PERSONAS.find((p) => p.id === m.personaId)?.hex ?? "#0f7a55" }} />
                    <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-mist">
                      {PERSONAS.find((p) => p.id === m.personaId)?.nombre ?? "Asistente"}
                    </span>
                    {m.engine && <span className="ml-auto font-mono text-[9px] uppercase tracking-wide text-line-2">{m.engine}</span>}
                  </div>
                  <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink">{m.content}</p>
                  <div className="mt-2">
                    <CopyBtn text={m.content} />
                  </div>
                </div>
              </div>
            )
          )}

          {typing && (
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-md font-display text-[11px] font-extrabold text-surface" style={{ backgroundColor: persona.hex }}>
                {persona.nombre.slice(0, 2).toUpperCase()}
              </span>
              <div className="flex items-center gap-1 rounded-full border border-line bg-surface px-3.5 py-2.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="typing-dot h-1.5 w-1.5 rounded-full bg-mist" />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-line bg-paper/70 px-4 py-3.5">
          <div className="flex items-end gap-2.5">
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  enviar();
                }
              }}
              rows={Math.min(4, Math.max(1, texto.split("\n").length))}
              placeholder={`Escríbele a ${persona.nombre}… (Enter envía, Shift+Enter salta línea)`}
              className="focusable max-h-32 min-h-[46px] flex-1 resize-none rounded-lg border border-line bg-surface px-4 py-3 text-[13.5px] text-ink placeholder:text-mist/60"
            />
            <button
              onClick={() => enviar()}
              disabled={texto.trim().length === 0 || typing}
              className="press flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-lg text-surface transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              style={{ backgroundColor: persona.hex }}
              aria-label="Enviar mensaje"
            >
              <Icon name="send" className="h-[18px] w-[18px]" />
            </button>
          </div>
          <p className="mt-2 font-mono text-[9.5px] uppercase tracking-[0.16em] text-mist">
            Motor: {settings.mode === "cloud" ? `Groq · ${settings.groqModel}` : `Ollama · ${settings.ollamaModel}`} con respaldo local determinista
          </p>
        </div>
      </div>
    </div>
  );
}
