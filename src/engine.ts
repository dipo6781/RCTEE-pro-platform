/* ────────────────────────────────────────────────────────────────────────────
   R-C-T-E-E PRO · src/engine.ts
   Motor de la plataforma: ensamblado de prompts, validación, scoring,
   clientes Groq / Ollama con respaldo local, persistencia y exportación.
   ──────────────────────────────────────────────────────────────────────────── */

import type { CamposRCTEE, FormatoId, Persona, PrecisionId } from "./data";
import { VERSION } from "./data";

/* ── Tipos globales ────────────────────────────────────────────────────────── */

export type MotorMode = "cloud" | "local";

export interface Settings {
  mode: MotorMode;
  groqKey: string;
  groqModel: "llama3-8b-8192" | "mixtral-8x7b-32768";
  ollamaUrl: string;
  ollamaModel: string;
  defaultFormat: FormatoId;
  cot: boolean;
  autoverif: boolean;
  neg: boolean;
}

export type Fuente = "clasico" | "enterprise" | "plantilla";

export interface HistoryItem {
  id: string;
  ts: number;
  fuente: Fuente;
  titulo: string;
  prompt: string;
  formato: FormatoId;
  score?: number;
  meta?: string;
}

export interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  personaId?: string;
  engine?: string;
  ts: number;
}

export const DEFAULT_SETTINGS: Settings = {
  mode: "local",
  groqKey: "",
  groqModel: "llama3-8b-8192",
  ollamaUrl: "http://localhost:11434",
  ollamaModel: "llama3.2",
  defaultFormat: "markdown",
  cot: true,
  autoverif: true,
  neg: false,
};

/* ── Utilidades base ───────────────────────────────────────────────────────── */

export function uid(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  } catch {
    /* fallback */
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function timeAgo(ts: number): string {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `hace ${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
}

export function loadLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveLS(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento no disponible */
  }
}

export function download(filename: string, content: string, mime = "text/plain"): void {
  try {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 800);
  } catch {
    /* sin soporte de descarga */
  }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      return true;
    } catch {
      return false;
    }
  }
}

export const LS = {
  settings: "rctee_settings_v1",
  history: "rctee_history_v1",
  chat: "rctee_chat_v1",
};

export const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/* ── Feedback de celebración (score nivel Enterprise) ──────────────────────── */

export async function celebrate(): Promise<void> {
  try {
    const mod = await import("canvas-confetti");
    const confetti = mod.default;
    confetti({
      particleCount: 130,
      spread: 82,
      startVelocity: 38,
      origin: { y: 0.55 },
      colors: ["#0f7a55", "#e4572e", "#d99125", "#2e5eaa", "#b23a6b", "#fbfcf7"],
      disableForReducedMotion: true,
      zIndex: 90,
    });
    setTimeout(() => {
      confetti({ particleCount: 60, spread: 100, startVelocity: 30, origin: { y: 0.6 }, colors: ["#0f7a55", "#d99125", "#fbfcf7"], disableForReducedMotion: true, zIndex: 90 });
    }, 180);
  } catch {
    /* animación opcional */
  }
}

/* ── Variables dinámicas de plantillas ─────────────────────────────────────── */

const VAR_RE = /\{([a-zA-Z0-9_]+)\}/g;

export function extractVariables(campos: CamposRCTEE): string[] {
  const found = new Set<string>();
  Object.values(campos).forEach((texto) => {
    let m: RegExpExecArray | null;
    VAR_RE.lastIndex = 0;
    while ((m = VAR_RE.exec(texto)) !== null) found.add(m[1]);
  });
  return Array.from(found);
}

export function interpolate(texto: string, values: Record<string, string>): string {
  return texto.replace(VAR_RE, (full, key: string) => {
    const v = (values[key] ?? "").trim();
    return v.length > 0 ? v : full;
  });
}

export function interpolateCampos(campos: CamposRCTEE, values: Record<string, string>): CamposRCTEE {
  return {
    rol: interpolate(campos.rol, values),
    contexto: interpolate(campos.contexto, values),
    tarea: interpolate(campos.tarea, values),
    especificaciones: interpolate(campos.especificaciones, values),
    ejemplos: interpolate(campos.ejemplos, values),
  };
}

export function varLabel(v: string): string {
  return v.replace(/_/g, " ");
}

/* ── Ensamblado de prompts R-C-T-E-E ───────────────────────────────────────── */

export interface Toggles {
  cot: boolean;
  autoverif: boolean;
  neg: boolean;
}

function precisionLines(t: Toggles): string[] {
  const lines: string[] = [];
  if (t.cot) lines.push("Piensa paso a paso antes de producir la respuesta final (Chain of Thought).");
  if (t.autoverif) lines.push("Antes de entregar, verifica tu salida punto por punto contra las especificaciones y corrige cualquier desviación.");
  if (t.neg) lines.push("Restricciones negativas: no inventes datos, no omitas restricciones, no uses lenguaje vago ni calificativos sin sustento.");
  return lines;
}

function derivarTitulo(campos: CamposRCTEE): string {
  const base = campos.tarea.trim().split(/[.:\n]/)[0] ?? "Prompt empresarial";
  const limpio = base.replace(/^(elaborar|crear|diseñar|construir|redactar|escribir)\s+/i, "");
  const words = limpio.split(/\s+/).slice(0, 6).join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function buildPrompt(campos: CamposRCTEE, formato: FormatoId, toggles: Toggles, titulo?: string): string {
  const tituloFinal = titulo && titulo.trim().length > 0 ? titulo.trim() : derivarTitulo(campos);
  const fecha = new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
  const directrices = precisionLines(toggles);

  if (formato === "json") {
    const payload = {
      metodologia: "R-C-T-E-E",
      version: VERSION,
      titulo: tituloFinal,
      generado: new Date().toISOString(),
      bloques: {
        rol: campos.rol.trim(),
        contexto: campos.contexto.trim(),
        tarea: campos.tarea.trim(),
        especificaciones: campos.especificaciones.trim(),
        ejemplos: campos.ejemplos.trim(),
      },
      directrices_razonamiento: directrices,
    };
    return JSON.stringify(payload, null, 2);
  }

  if (formato === "texto") {
    const partes = [
      `PROMPT EMPRESARIAL — ${tituloFinal}`,
      `Metodología R-C-T-E-E v${VERSION} · ${fecha}`,
      "",
      `ROL: ${campos.rol.trim()}`,
      "",
      `CONTEXTO: ${campos.contexto.trim()}`,
      "",
      `TAREA: ${campos.tarea.trim()}`,
      "",
      `ESPECIFICACIONES: ${campos.especificaciones.trim()}`,
      "",
      `EJEMPLOS: ${campos.ejemplos.trim()}`,
    ];
    if (directrices.length > 0) {
      partes.push("", "DIRECTRICES DE RAZONAMIENTO:");
      directrices.forEach((d, i) => partes.push(`${i + 1}. ${d}`));
    }
    return partes.join("\n");
  }

  const md: string[] = [
    `# PROMPT EMPRESARIAL — ${tituloFinal}`,
    "",
    `> Metodología **R-C-T-E-E v${VERSION}** · Generado el ${fecha}`,
    "",
    "## [R] ROL",
    campos.rol.trim(),
    "",
    "## [C] CONTEXTO",
    campos.contexto.trim(),
    "",
    "## [T] TAREA",
    campos.tarea.trim(),
    "",
    "## [E] ESPECIFICACIONES",
    campos.especificaciones.trim(),
    "",
    "## [E²] EJEMPLOS",
    campos.ejemplos.trim(),
  ];
  if (directrices.length > 0) {
    md.push("", "## DIRECTRICES DE RAZONAMIENTO");
    directrices.forEach((d) => md.push(`- ${d}`));
  }
  return md.join("\n");
}

/* ── Validación y scoring ──────────────────────────────────────────────────── */

export interface ValidationResult {
  ok: boolean;
  errors: Partial<Record<keyof CamposRCTEE, string>>;
  score: number;
}

export function qualityScore(campos: CamposRCTEE): number {
  const r = campos.rol.trim().length >= 20 ? 15 : campos.rol.trim().length > 0 ? 7 : 0;
  const c = Math.min(25, (campos.contexto.trim().length / 80) * 25);
  const t = Math.min(25, (campos.tarea.trim().length / 40) * 25);
  const e = Math.min(20, (campos.especificaciones.trim().length / 60) * 20);
  const e2 = Math.min(15, (campos.ejemplos.trim().length / 50) * 15);
  return Math.round(r + c + t + e + e2);
}

export function validateClassic(campos: CamposRCTEE): ValidationResult {
  const errors: ValidationResult["errors"] = {};
  if (campos.rol.trim().length < 20) errors.rol = "Define el rol con al menos 20 caracteres: cargo + experiencia + sector.";
  if (campos.contexto.trim().length < 80) errors.contexto = "El contexto requiere ≥ 80 caracteres: incluye datos, cifras y situación.";
  if (campos.tarea.trim().length < 40) errors.tarea = "La tarea necesita ≥ 40 caracteres: verbo fuerte + entregable medible.";
  if (campos.especificaciones.trim().length < 30) errors.especificaciones = "Añade especificaciones de formato y reglas (≥ 30 caracteres).";
  if (campos.ejemplos.trim().length === 0) errors.ejemplos = "Incluye al menos un ejemplo entrada → salida (bloque E²).";
  return { ok: Object.keys(errors).length === 0, errors, score: qualityScore(campos) };
}

export function scoreLabel(score: number): string {
  if (score >= 85) return "Nivel Enterprise";
  if (score >= 65) return "Nivel Consultor";
  if (score >= 40) return "Nivel Operativo";
  return "Borrador";
}

/* ── Motor de IA: Groq (cloud) / Ollama (local) / respaldo local ───────────── */

const FALLBACK_NOTE = "\n\n_[Respuesta del motor local de respaldo. Configura Groq u Ollama en Ajustes para respuestas de IA completa.]_";

async function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function groqChat(settings: Settings, messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetchWithTimeout(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.groqKey}`,
      },
      body: JSON.stringify({ model: settings.groqModel, messages, temperature: 0.7, max_tokens: 640 }),
    },
    14000
  );
  if (!res.ok) throw new Error(`Groq respondió HTTP ${res.status}`);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const out = data?.choices?.[0]?.message?.content;
  if (typeof out !== "string" || out.length === 0) throw new Error("Groq devolvió una respuesta vacía");
  return out;
}

export async function ollamaChat(settings: Settings, messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetchWithTimeout(
    `${settings.ollamaUrl.replace(/\/$/, "")}/api/chat`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: settings.ollamaModel, messages, stream: false }),
    },
    20000
  );
  if (!res.ok) throw new Error(`Ollama respondió HTTP ${res.status}`);
  const data = (await res.json()) as { message?: { content?: string } };
  const out = data?.message?.content;
  if (typeof out !== "string" || out.length === 0) throw new Error("Ollama devolvió una respuesta vacía");
  return out;
}

export async function pingOllama(url: string): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${url.replace(/\/$/, "")}/api/tags`, { method: "GET" }, 2600);
    return res.ok;
  } catch {
    return false;
  }
}

/* ── Motor local de respaldo (determinista, basado en R-C-T-E-E) ───────────── */

export function localReply(persona: Persona, userText: string, turn: number): string {
  const t = userText.toLowerCase();
  const firma = `— **${persona.nombre}** · ${persona.area}`;

  if (/^(hola|buenas|hey|qué tal|que tal|saludos)/.test(t)) {
    return `Hola. Soy ${persona.nombre}, ${persona.area.toLowerCase()} en esta consola. Puedo estructurar prompts R-C-T-E-E para tu caso, revisar los que ya tienes o ayudarte a ponerles precio. Cuéntame el escenario con datos: sin contexto (mínimo 80 caracteres) trabajo a ciegas.\n\n${firma}`;
  }

  if (t.includes("prompt") || t.includes("estructura") || t.includes("rctee") || t.includes("método") || t.includes("metodo")) {
    const pasos = [
      "**R — Rol**: «Consultor senior de " + persona.area.toLowerCase() + " con 10+ años en el sector». La experiencia declarada calibra el vocabulario.",
      "**C — Contexto**: situación + datos duros. Mínimo 80 caracteres; si no los das, el modelo los inventa.",
      "**T — Tarea**: un verbo fuerte y un entregable: «Elaborar…», «Diseñar…», jamás «hablar de».",
      "**E — Especificaciones**: estructura por secciones, extensión máxima y qué está prohibido.",
      "**E² — Ejemplos**: 1–3 pares entrada→salida. Es el bloque con mayor retorno del método.",
    ];
    return `Así estructuro cualquier prompt con el método R-C-T-E-E, aplicado a ${persona.area.toLowerCase()}:\n\n${pasos.map((p, i) => `${i + 1}. ${p}`).join("\n")}\n\nCierra con directrices de razonamiento (Chain of Thought + auto-verificación) y la varianza de la respuesta cae drásticamente. ¿Quieres que lo armemos sobre tu caso concreto?\n\n${firma}`;
  }

  if (t.includes("precio") || t.includes("cobrar") || t.includes("tarifa") || t.includes("cuánto") || t.includes("cuanto") || t.includes("costo")) {
    return `Marco de precios que uso para servicios de prompt engineering:\n\n1. **Entrada** ($15–40): packs de prompts por nicho, entrega en 48 h.\n2. **Consultor** ($90–250): auditoría + plantillas con variables + capacitación breve.\n3. **Partner** ($1.5K–6K/mes): biblioteca a medida, SLA y versionado.\n\nAncla siempre con el valor del entregable, no con las horas: un protocolo que ahorra 4 horas semanales se vende por el ahorro, no por el tiempo que te tomó escribirlo. Nunca descuentos ante la primera objeción; ofrece plan de pagos.\n\n${firma}`;
  }

  if (t.includes("cliente") || t.includes("propuesta") || t.includes("venta") || t.includes("vender")) {
    return `Para convertir tu trabajo en una venta:\n\n1. **Diagnóstico gratuito de 15 minutos**: revisa un prompt o flujo real del cliente y muestra 2 fugas concretas.\n2. **Propuesta en 3 niveles**: básico, estándar (el que quieres vender) y premium como ancla.\n3. **Prueba social numérica**: «recuperamos 8 % de carritos» vale 10 veces más que «mejoramos resultados».\n\nY el guion de descubrimiento: no menciones precio antes del minuto 30; primero cuantifica el problema del cliente en su propia moneda.\n\n${firma}`;
  }

  if (t.includes("ejemplo") || t.includes("plantilla") || t.includes("muestra")) {
    return `Un ejemplo calibrado de ${persona.area.toLowerCase()}:\n\n> **Rol**: consultor senior del área.\n> **Contexto**: «El servicio atiende 40 casos/día; el tiempo de respuesta subió de 2 a 9 horas en el trimestre; el objetivo es volver a 4 h sin contratar».\n> **Tarea**: «Diseñar un protocolo de priorización de 4 niveles con responsables por paso».\n> **Especificaciones**: tabla nivel→criterio→acción, guiones literales, 5 KPIs con meta.\n> **Ejemplo**: «Nivel 1: incidencia con impacto en ingresos → respuesta < 30 min, escalación directa a dirección».\n\nCopia la estructura y cambia los datos por los tuyos.\n\n${firma}`;
  }

  if (t.includes("error") || t.includes("falla") || t.includes("no funciona") || t.includes("problema")) {
    return `Checklist de depuración de prompts, en orden:\n\n1. ¿El contexto tiene datos duros (cifras, plazos, restricciones)? Si no, el modelo improvisa.\n2. ¿La tarea tiene un solo verbo principal? Dos tareas = una respuesta mediocre en ambas.\n3. ¿Las especificaciones definen estructura y longitud? Sin estructura, el formato es lotería.\n4. ¿Hay al menos un ejemplo entrada→salida?\n5. Activa Chain of Thought y auto-verificación en el generador y compara la salida.\n\nEl 90 % de las «malas respuestas» son contexto insuficiente, no falta de capacidad del modelo.\n\n${firma}`;
  }

  const variantes = [
    `Leo tu planteamiento así: necesitas una salida accionable, no teoría. Mi propuesta:\n\n1. **Diagnóstico**: escribe el contexto del caso con 3 datos duros (volumen, plazo, restricción).\n2. **Estructura**: pasa ese contexto por el generador R-C-T-E-E con auto-verificación activada.\n3. **Calibración**: compara la primera salida contra tu estándar y ajusta solo el bloque de ejemplos.\n\nDime el dato que falta y lo armamos juntos.`,
    `Buena pregunta. Para responderte con precisión de ${persona.area.toLowerCase()} necesito contexto: ¿volumen involucrado?, ¿plazo?, ¿qué se ha intentado ya? Mientras tanto, la regla general: convierte la pregunta en tarea con verbo fuerte («Diseñar…», «Auditar…», «Priorizar…») y define el entregable en formato y extensión. Con eso, el prompt trabaja para ti y no al revés.`,
    `Voy directo al punto, como trabajamos aquí:\n\n1. Define el entregable exacto (formato, extensión, destinatario).\n2. Junta 3 datos del escenario real: sin datos hay invención.\n3. Escribe un ejemplo del resultado que aceptarías como bueno.\n\nCon esos tres insumos, el Generador Clásico te ensambla un prompt de nivel consultor en un minuto. ¿Me pasas los tres?`,
  ];
  return `${variantes[turn % variantes.length]}\n\n${firma}`;
}

/* ── Orquestador de consultas al motor ─────────────────────────────────────── */

export interface AskResult {
  text: string;
  engine: string;
}

export async function askAI(settings: Settings, persona: Persona, history: ChatMsg[], userText: string): Promise<AskResult> {
  const messages = [
    { role: "system", content: persona.system },
    ...history.slice(-8).map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userText },
  ];

  if (settings.mode === "cloud" && settings.groqKey.trim().length > 8) {
    try {
      const text = await groqChat(settings, messages);
      return { text, engine: `Groq · ${settings.groqModel}` };
    } catch {
      return { text: localReply(persona, userText, history.length) + FALLBACK_NOTE, engine: "Motor local (Groq no disponible)" };
    }
  }

  if (settings.mode === "local") {
    try {
      const text = await ollamaChat(settings, messages);
      return { text, engine: `Ollama · ${settings.ollamaModel}` };
    } catch {
      return { text: localReply(persona, userText, history.length) + FALLBACK_NOTE, engine: "Motor local (Ollama sin conexión)" };
    }
  }

  return { text: localReply(persona, userText, history.length) + FALLBACK_NOTE, engine: "Motor local (sin API key)" };
}
