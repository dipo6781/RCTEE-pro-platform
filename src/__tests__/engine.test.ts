/* ────────────────────────────────────────────────────────────────────────────
   R-C-T-E-E PRO · src/__tests__/engine.test.ts
   Tests unitarios del motor: validateClassic, qualityScore, buildPrompt,
   variables dinámicas, fusión de historiales y utilidades.
   ──────────────────────────────────────────────────────────────────────────── */

import { describe, it, expect, vi, afterEach } from "vitest";
import { PERSONALIDADES, type CamposRCTEE, type Personalidad } from "../data";
import {
  DEFAULT_SETTINGS,
  ENFOQUE_INSTRUCCIONES,
  LS,
  TONO_INSTRUCCIONES,
  buildPrompt,
  buildSystemMessage,
  delay,
  extractVariables,
  groqChat,
  interpolate,
  interpolateCampos,
  loadLS,
  localReply,
  mergeHistories,
  ollamaChat,
  qualityScore,
  saveLS,
  scoreLabel,
  timeAgo,
  uid,
  validateClassic,
  type HistoryItem,
  type Settings,
  type Toggles,
} from "../engine";

/* ── Fixtures ──────────────────────────────────────────────────────────────── */

const VALIDO: CamposRCTEE = {
  rol: "Analista de riesgos senior con 12 años en banca comercial, especializado en crédito PyME y modelos de scoring interno.",
  contexto:
    "La entidad evalúa una solicitud de crédito de $250.000 para una empresa del sector logística con 6 años de operación estable, estados financieros auditados y concentración del 40 % en su principal cliente.",
  tarea: "Elaborar un informe de riesgo crediticio con probabilidad de incumplimiento estimada y dictamen explícito de aprobar, condicionar o rechazar.",
  especificaciones: "Estructura: resumen ejecutivo de 120 palabras, tabla de ratios clave, 5 factores de riesgo con mitigante y dictamen final. Tono técnico.",
  ejemplos: "Entrada: logística, $250.000, 6 años, score 620 → Salida: «Condicional: tasa base +180 pb, garantía líquida 20 %».",
};

const VACIO: CamposRCTEE = { rol: "", contexto: "", tarea: "", especificaciones: "", ejemplos: "" };

const SIN_PRECISION: Toggles = { cot: false, autoverif: false, neg: false };

const mkItem = (id: string, ts: number, extra?: Partial<HistoryItem>): HistoryItem => ({
  id,
  ts,
  fuente: "clasico",
  titulo: `T-${id}`,
  prompt: `P-${id}`,
  formato: "markdown",
  ...extra,
});

/* ── validateClassic ───────────────────────────────────────────────────────── */

describe("validateClassic()", () => {
  it("acepta un prompt completo y devuelve score positivo sin errores", () => {
    const res = validateClassic(VALIDO);
    expect(res.ok).toBe(true);
    expect(Object.keys(res.errors)).toHaveLength(0);
    expect(res.score).toBeGreaterThan(0);
  });

  it("rechaza campos vacíos marcando los 5 bloques", () => {
    const res = validateClassic(VACIO);
    expect(res.ok).toBe(false);
    expect(res.errors.rol).toBeDefined();
    expect(res.errors.contexto).toBeDefined();
    expect(res.errors.tarea).toBeDefined();
    expect(res.errors.especificaciones).toBeDefined();
    expect(res.errors.ejemplos).toBeDefined();
    expect(res.score).toBe(0);
  });

  it("aplica el umbral de 80 caracteres al contexto (80 pasa, 79 falla)", () => {
    const ok = validateClassic({ ...VALIDO, contexto: "a".repeat(80) });
    expect(ok.errors.contexto).toBeUndefined();

    const fail = validateClassic({ ...VALIDO, contexto: "a".repeat(79) });
    expect(fail.errors.contexto).toBeDefined();
    expect(fail.ok).toBe(false);
  });

  it("aplica los umbrales mínimos de rol (20), tarea (40) y especificaciones (30)", () => {
    expect(validateClassic({ ...VALIDO, rol: "a".repeat(20) }).errors.rol).toBeUndefined();
    expect(validateClassic({ ...VALIDO, rol: "a".repeat(19) }).errors.rol).toBeDefined();

    expect(validateClassic({ ...VALIDO, tarea: "a".repeat(40) }).errors.tarea).toBeUndefined();
    expect(validateClassic({ ...VALIDO, tarea: "a".repeat(39) }).errors.tarea).toBeDefined();

    expect(validateClassic({ ...VALIDO, especificaciones: "a".repeat(30) }).errors.especificaciones).toBeUndefined();
    expect(validateClassic({ ...VALIDO, especificaciones: "a".repeat(29) }).errors.especificaciones).toBeDefined();
  });

  it("exige al menos un ejemplo (bloque E² obligatorio)", () => {
    expect(validateClassic({ ...VALIDO, ejemplos: "" }).errors.ejemplos).toBeDefined();
    expect(validateClassic({ ...VALIDO, ejemplos: "x" }).errors.ejemplos).toBeUndefined();
  });
});

/* ── qualityScore ──────────────────────────────────────────────────────────── */

describe("qualityScore()", () => {
  it("devuelve 0 para un prompt vacío", () => {
    expect(qualityScore(VACIO)).toBe(0);
  });

  it("devuelve 100 cuando todos los bloques superan sus umbrales óptimos", () => {
    expect(qualityScore(VALIDO)).toBe(100);
  });

  it("otorga crédito parcial (7 pts) a un rol incompleto pero presente", () => {
    expect(qualityScore({ ...VACIO, rol: "a".repeat(10) })).toBe(7);
  });

  it("se mantiene siempre dentro del rango 0–100", () => {
    const casos: CamposRCTEE[] = [
      VACIO,
      VALIDO,
      { ...VACIO, contexto: "a".repeat(40) },
      { ...VACIO, tarea: "a".repeat(1000), ejemplos: "a".repeat(1000) },
      { rol: "a", contexto: "b".repeat(81), tarea: "c".repeat(41), especificaciones: "d".repeat(61), ejemplos: "e".repeat(51) },
    ];
    for (const c of casos) {
      const s = qualityScore(c);
      expect(s).toBeGreaterThanOrEqual(0);
      expect(s).toBeLessThanOrEqual(100);
    }
  });

  it("es monótono: más contexto nunca reduce el score", () => {
    const corto = qualityScore({ ...VACIO, contexto: "a".repeat(30) });
    const largo = qualityScore({ ...VACIO, contexto: "a".repeat(90) });
    expect(largo).toBeGreaterThanOrEqual(corto);
  });
});

/* ── scoreLabel ────────────────────────────────────────────────────────────── */

describe("scoreLabel()", () => {
  it("clasifica los 4 niveles en sus fronteras exactas", () => {
    expect(scoreLabel(100)).toBe("Nivel Enterprise");
    expect(scoreLabel(85)).toBe("Nivel Enterprise");
    expect(scoreLabel(84)).toBe("Nivel Consultor");
    expect(scoreLabel(65)).toBe("Nivel Consultor");
    expect(scoreLabel(64)).toBe("Nivel Operativo");
    expect(scoreLabel(40)).toBe("Nivel Operativo");
    expect(scoreLabel(39)).toBe("Borrador");
    expect(scoreLabel(0)).toBe("Borrador");
  });
});

/* ── buildPrompt ───────────────────────────────────────────────────────────── */

describe("buildPrompt()", () => {
  it("ensambla Markdown con los 5 bloques etiquetados", () => {
    const md = buildPrompt(VALIDO, "markdown", SIN_PRECISION, "Informe de riesgo");
    expect(md).toContain("# PROMPT EMPRESARIAL — Informe de riesgo");
    expect(md).toContain("## [R] ROL");
    expect(md).toContain("## [C] CONTEXTO");
    expect(md).toContain("## [T] TAREA");
    expect(md).toContain("## [E] ESPECIFICACIONES");
    expect(md).toContain("## [E²] EJEMPLOS");
    expect(md).toContain(VALIDO.tarea);
  });

  it("deriva el título de la tarea cuando no se provee uno explícito", () => {
    const md = buildPrompt(VALIDO, "markdown", SIN_PRECISION);
    expect(md.startsWith("# PROMPT EMPRESARIAL — ")).toBe(true);
    expect(md.length).toBeGreaterThan(40);
  });

  it("genera JSON válido con metodología, bloques y directrices", () => {
    const json = buildPrompt(VALIDO, "json", { cot: true, autoverif: false, neg: false }, "Título JSON");
    const parsed = JSON.parse(json) as {
      metodologia: string;
      titulo: string;
      bloques: CamposRCTEE;
      directrices_razonamiento: string[];
    };
    expect(parsed.metodologia).toBe("R-C-T-E-E");
    expect(parsed.titulo).toBe("Título JSON");
    expect(parsed.bloques.rol).toBe(VALIDO.rol);
    expect(parsed.directrices_razonamiento.length).toBe(1);
  });

  it("genera texto plano con etiquetas ROL / CONTEXTO", () => {
    const txt = buildPrompt(VALIDO, "texto", SIN_PRECISION, "Plano");
    expect(txt).toContain("PROMPT EMPRESARIAL — Plano");
    expect(txt).toContain("ROL:");
    expect(txt).toContain("CONTEXTO:");
    expect(txt).toContain("EJEMPLOS:");
  });

  it("genera salida en lista numerada", () => {
    const lista = buildPrompt(VALIDO, "lista", SIN_PRECISION, "Lista");
    expect(lista).toContain("ROL");
    expect(lista).toMatch(/1[\.)]/);
  });

  it("genera salida en tabla Markdown", () => {
    const tabla = buildPrompt(VALIDO, "tabla", SIN_PRECISION, "Tabla");
    expect(tabla).toContain("|");
    expect(tabla).toContain("ROL");
  });

  it("omite el bloque de directrices cuando no hay precisión activada", () => {
    const md = buildPrompt(VALIDO, "markdown", SIN_PRECISION, "X");
    expect(md).not.toContain("DIRECTRICES DE RAZONAMIENTO");
  });

  it("inyecta Chain of Thought, auto-verificación y restricciones negativas", () => {
    const full = buildPrompt(VALIDO, "markdown", { cot: true, autoverif: true, neg: true }, "X");
    expect(full).toMatch(/paso a paso/i);
    expect(full).toMatch(/verifica/i);
    expect(full).toMatch(/no inventes/i);
  });
});

/* ── Variables dinámicas ───────────────────────────────────────────────────── */

describe("variables dinámicas", () => {
  it("extractVariables devuelve variables únicas en orden de aparición", () => {
    const vars = extractVariables({
      rol: "Asesor del sector {sector}, especialista en {sector} regional.",
      contexto: "Cartera de {monto_cartera} con mora creciente.",
      tarea: "x",
      especificaciones: "x",
      ejemplos: "x",
    });
    expect(vars).toEqual(["sector", "monto_cartera"]);
  });

  it("interpolate sustituye valores presentes y conserva los faltantes", () => {
    const out = interpolate("Cartera de {monto} en {zona}", { monto: "$1.4M" });
    expect(out).toBe("Cartera de $1.4M en {zona}");
  });

  it("interpolateCampos aplica el reemplazo en los 5 bloques", () => {
    const campos: CamposRCTEE = {
      rol: "Rol {sector}",
      contexto: "Ctx {sector}",
      tarea: "Tarea {sector}",
      especificaciones: "Esp {sector}",
      ejemplos: "Ej {sector}",
    };
    const out = interpolateCampos(campos, { sector: "retail" });
    expect(Object.values(out).every((v) => v === `Rol retail` || v.includes("retail"))).toBe(true);
    expect(Object.values(out).some((v) => v.includes("{sector}"))).toBe(false);
  });
});

/* ── mergeHistories ────────────────────────────────────────────────────────── */

describe("mergeHistories()", () => {
  it("el registro local más reciente gana sobre el remoto del mismo id", () => {
    const local = [mkItem("a", 200), mkItem("c", 50)];
    const remote = [mkItem("a", 100), mkItem("b", 150)];
    const merged = mergeHistories(local, remote);

    expect(merged).toHaveLength(3);
    const a = merged.find((i) => i.id === "a");
    expect(a?.ts).toBe(200);
  });

  it("marca los registros remotos como sincronizados y ordena por ts descendente", () => {
    const merged = mergeHistories([mkItem("a", 200)], [mkItem("b", 150)]);
    const b = merged.find((i) => i.id === "b");
    expect(b?.synced).toBe(true);
    expect(merged.map((i) => i.ts)).toEqual([200, 150]);
  });

  it("limita el resultado a 100 registros conservando los más recientes", () => {
    const muchos = Array.from({ length: 120 }, (_, i) => mkItem(`id-${i}`, i + 1));
    const merged = mergeHistories(muchos, []);
    expect(merged).toHaveLength(100);
    expect(merged[0].ts).toBe(120);
  });
});

/* ── Utilidades ────────────────────────────────────────────────────────────── */

describe("utilidades", () => {
  it("uid genera identificadores únicos no vacíos", () => {
    const ids = Array.from({ length: 25 }, () => uid());
    expect(new Set(ids).size).toBe(25);
    ids.forEach((id) => expect(id.length).toBeGreaterThan(0));
  });

  it("timeAgo formatea segundos, minutos, horas y días", () => {
    const now = Date.now();
    expect(timeAgo(now - 30_000)).toBe("hace 30 s");
    expect(timeAgo(now - 5 * 60_000)).toBe("hace 5 min");
    expect(timeAgo(now - 3 * 3_600_000)).toBe("hace 3 h");
    expect(timeAgo(now - 2 * 86_400_000)).toBe("hace 2 d");
  });

  it("saveLS / loadLS hacen round-trip y loadLS tolera JSON corrupto", () => {
    const key = "rctee_test_roundtrip";
    saveLS(key, { a: 1, b: [2, 3] });
    expect(loadLS(key, null)).toEqual({ a: 1, b: [2, 3] });

    localStorage.setItem(`${key}_roto`, "{json-inválido");
    expect(loadLS(`${key}_roto`, "fallback")).toBe("fallback");

    expect(loadLS("rctee_test_inexistente", 42)).toBe(42);

    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_roto`);
  });

  it("delay espera al menos los milisegundos solicitados", async () => {
    const t0 = Date.now();
    await delay(20);
    expect(Date.now() - t0).toBeGreaterThanOrEqual(15);
  });

  it("DEFAULT_SETTINGS expone la estructura base completa", () => {
    expect(DEFAULT_SETTINGS.extensions).toEqual([]);
    expect(DEFAULT_SETTINGS.mode).toBe("local");
    expect(Object.keys(LS).length).toBeGreaterThanOrEqual(3);
  });
});

/* ── Motor local de respaldo ───────────────────────────────────────────────── */

describe("localReply() · motor de respaldo", () => {
  const persona = PERSONALIDADES[0];

  it("responde al saludo presentándose con su nombre", () => {
    const r = localReply(persona, "hola, ¿qué tal?", 0);
    expect(r).toContain("Soy");
    expect(r).toContain(persona.nombre);
  });

  it("explica la estructura R-C-T-E-E cuando se pregunta por prompts", () => {
    const r = localReply(persona, "¿Cómo estructuro un prompt correcto?", 0);
    expect(r).toContain("R-C-T-E-E");
  });

  it("da un marco de precios cuando se pregunta por tarifas", () => {
    const r = localReply(persona, "¿Cuánto debo cobrar por este servicio?", 0);
    expect(r).toContain("$");
  });

  it("rota tres variantes de respuesta genérica y siempre firma", () => {
    const texto = "Necesito orientación sobre mi operación diaria";
    const r0 = localReply(persona, texto, 0);
    const r1 = localReply(persona, texto, 1);
    const r2 = localReply(persona, texto, 2);
    expect(r0).not.toBe(r1);
    expect(r1).not.toBe(r2);
    [r0, r1, r2].forEach((r) => expect(r).toContain(persona.nombre));
  });
});

/* ── buildSystemMessage() · agente adaptativo ──────────────────────────────── */

describe("buildSystemMessage()", () => {
  const ledger = PERSONALIDADES.find((p) => p.id === "ledger") as Personalidad;
  const vector = PERSONALIDADES.find((p) => p.id === "vector") as Personalidad;

  it("concatena en orden: prompt base, tono, enfoque, capacidades, restricciones, ejemplos y adaptabilidad", () => {
    const msg = buildSystemMessage(ledger);
    const iBase = msg.indexOf(ledger.systemPrompt);
    const iTono = msg.indexOf("## TONO");
    const iEnfoque = msg.indexOf("## ENFOQUE");
    const iCaps = msg.indexOf("## CAPACIDADES");
    const iRest = msg.indexOf("## RESTRICCIONES");
    const iEj = msg.indexOf("## EJEMPLOS DE REFERENCIA");
    const iAdapt = msg.indexOf("## ADAPTABILIDAD");

    expect(iBase).toBe(0);
    expect(iTono).toBeGreaterThan(iBase);
    expect(iEnfoque).toBeGreaterThan(iTono);
    expect(iCaps).toBeGreaterThan(iEnfoque);
    expect(iRest).toBeGreaterThan(iCaps);
    expect(iEj).toBeGreaterThan(iRest);
    expect(iAdapt).toBeGreaterThan(iEj);
  });

  it("incluye la instrucción del tono y del enfoque correspondientes", () => {
    const msg = buildSystemMessage(ledger);
    expect(msg).toContain(TONO_INSTRUCCIONES[ledger.tono]);
    expect(msg).toContain(ENFOQUE_INSTRUCCIONES[ledger.enfoque]);
  });

  it("lista todas las capacidades y restricciones sin duplicarlas", () => {
    const msg = buildSystemMessage(vector);
    for (const c of vector.capacidades) {
      expect(msg).toContain(`- ${c}`);
      expect(msg.split(`- ${c}`).length - 1).toBe(1); // aparece exactamente una vez
    }
    for (const r of vector.restricciones) {
      expect(msg).toContain(`- ${r}`);
      expect(msg.split(`- ${r}`).length - 1).toBe(1);
    }
  });

  it("no duplica el system prompt base", () => {
    const msg = buildSystemMessage(ledger);
    expect(msg.split(ledger.systemPrompt).length - 1).toBe(1);
  });

  it("omite la sección de ejemplos cuando la personalidad no los tiene", () => {
    const sinEjemplos: Personalidad = { ...ledger, ejemplos: [] };
    const msg = buildSystemMessage(sinEjemplos);
    expect(msg).not.toContain("## EJEMPLOS DE REFERENCIA");
    // el resto de secciones se mantiene
    expect(msg).toContain("## TONO");
    expect(msg).toContain("## ADAPTABILIDAD");
  });

  it("distingue la directriz de adaptabilidad según el flag", () => {
    const adaptativa = buildSystemMessage(vector); // adaptativo: true
    const estable = buildSystemMessage(ledger); // adaptativo: false
    expect(adaptativa).not.toBe(estable);
    expect(adaptativa.toLowerCase()).toContain("adapt");
    expect(estable.toLowerCase()).toContain("estable");
  });
});

/* ── Payload de API con parámetros dinámicos ───────────────────────────────── */

describe("payload de API · temperatura y maxTokens por personalidad", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const settingsCloud: Settings = {
    ...DEFAULT_SETTINGS,
    mode: "cloud",
    groqKey: "gsk_test_0123456789",
    groqModel: "llama3-8b-8192",
  };

  it("groqChat inyecta temperature y max_tokens de Ledger (0.4 / 2000)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "respuesta de prueba" } }] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const ledger = PERSONALIDADES.find((p) => p.id === "ledger") as Personalidad;
    const out = await groqChat(settingsCloud, [{ role: "user", content: "hola" }], ledger);

    expect(out).toBe("respuesta de prueba");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0] as [string, { body: string; headers: Record<string, string> }];
    expect(url).toContain("api.groq.com");
    expect(init.headers.Authorization).toContain("Bearer ");

    const body = JSON.parse(init.body) as { model: string; temperature: number; max_tokens: number };
    expect(body.model).toBe("llama3-8b-8192");
    expect(body.temperature).toBe(0.4);
    expect(body.max_tokens).toBe(2000);
  });

  it("groqChat usa los parámetros propios de cada personalidad (Dáctilo: 0.8 / 1800)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "ok" } }] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const dactilo = PERSONALIDADES.find((p) => p.id === "dactilo") as Personalidad;
    await groqChat(settingsCloud, [{ role: "user", content: "hola" }], dactilo);

    const body = JSON.parse((fetchMock.mock.calls[0] as [string, { body: string }])[1].body) as {
      temperature: number;
      max_tokens: number;
    };
    expect(body.temperature).toBe(0.8);
    expect(body.max_tokens).toBe(1800);
  });

  it("ollamaChat mapea temperatura y num_predict de la personalidad", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: { content: "respuesta local" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const ledger = PERSONALIDADES.find((p) => p.id === "ledger") as Personalidad;
    const out = await ollamaChat(DEFAULT_SETTINGS, [{ role: "user", content: "hola" }], ledger);

    expect(out).toBe("respuesta local");
    const body = JSON.parse((fetchMock.mock.calls[0] as [string, { body: string }])[1].body) as {
      model: string;
      options: { temperature: number; num_predict: number };
    };
    expect(body.model).toBe("llama3.2");
    expect(body.options.temperature).toBe(0.4);
    expect(body.options.num_predict).toBe(2000);
  });

  it("groqChat lanza cuando la API no devuelve choices válidos", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    const ledger = PERSONALIDADES.find((p) => p.id === "ledger") as Personalidad;
    await expect(groqChat(settingsCloud, [{ role: "user", content: "hola" }], ledger)).rejects.toThrow();
  });
});
