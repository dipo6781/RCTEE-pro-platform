/* ────────────────────────────────────────────────────────────────────────────
   R-C-T-E-E PRO · src/__tests__/supabase.test.ts
   Tests de la capa Supabase con cliente mockado: sbConfigured, sbTest,
   sbPull (mapeo defensivo) y sbPush (normalización + upsert).
   ──────────────────────────────────────────────────────────────────────────── */

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(),
}));

import { createClient } from "@supabase/supabase-js";
import { SB_TABLE, SQL_DEMO, SQL_PROD, sbConfigured, sbPull, sbPush, sbTest, type SbConfig } from "../supabase";
import type { HistoryItem } from "../engine";

const mockCreateClient = vi.mocked(createClient);
const mockFrom = vi.fn();

const CFG: SbConfig = { url: "https://test.supabase.co", key: "anon-key-123456789" };
const CFG_CORTA: SbConfig = { url: "https://test.supabase.co", key: "corta" };
const CFG_OTRA: SbConfig = { url: "https://otro-proyecto.supabase.co", key: "otra-key-abcdef" };

/* Cadena thenable que soporta: await from().select() y .order().limit() */
function makeChain(result: unknown) {
  const promise = Promise.resolve(result);
  const chain: {
    order: () => unknown;
    limit: () => unknown;
    then: <T>(onF?: (v: unknown) => T, onR?: (e: unknown) => T) => Promise<T>;
    catch: (onR?: (e: unknown) => unknown) => Promise<unknown>;
  } = {
    order: () => chain,
    limit: () => chain,
    then: (onF, onR) => promise.then(onF as never, onR as never),
    catch: (onR) => promise.catch(onR as never),
  };
  return chain;
}

function montarFrom(selectResult: unknown, upsertResult: unknown = { error: null }) {
  const select = vi.fn().mockReturnValue(makeChain(selectResult));
  const upsert = vi.fn().mockReturnValue(Promise.resolve(upsertResult));
  mockFrom.mockReturnValue({ select, upsert });
  return { select, upsert };
}

const mkItem = (id: string, extra?: Partial<HistoryItem>): HistoryItem => ({
  id,
  ts: 1_700_000_000_000,
  fuente: "clasico",
  titulo: `T-${id}`,
  prompt: `P-${id}`,
  formato: "markdown",
  ...extra,
});

beforeEach(() => {
  mockFrom.mockReset();
  mockCreateClient.mockReset();
  mockCreateClient.mockReturnValue({ from: mockFrom } as never);
});

/* ── sbConfigured ──────────────────────────────────────────────────────────── */

describe("sbConfigured()", () => {
  it("requiere URL y clave de más de 8 caracteres", () => {
    expect(sbConfigured(CFG)).toBe(true);
    expect(sbConfigured(CFG_CORTA)).toBe(false);
    expect(sbConfigured({ url: "  ", key: "clave-larga-123" })).toBe(false);
  });
});

/* ── sbTest ────────────────────────────────────────────────────────────────── */

describe("sbTest()", () => {
  it("falla con mensaje si faltan credenciales", async () => {
    const res = await sbTest(CFG_CORTA);
    expect(res.ok).toBe(false);
    expect(typeof res.error).toBe("string");
  });

  it("devuelve el conteo exacto de registros cuando la conexión es exitosa", async () => {
    montarFrom({ data: [], error: null, count: 7 });
    const res = await sbTest(CFG);
    expect(res.ok).toBe(true);
    expect(res.data).toBe(7);
    expect(mockFrom).toHaveBeenCalledWith(SB_TABLE);
  });

  it("usa la longitud de data cuando count no viene en la respuesta", async () => {
    montarFrom({ data: [], error: null });
    const res = await sbTest(CFG);
    expect(res.ok).toBe(true);
    expect(res.data).toBe(0);
  });

  it("propaga el error remoto de PostgREST", async () => {
    montarFrom({ data: null, error: { message: "relation does not exist" } });
    const res = await sbTest(CFG);
    expect(res.ok).toBe(false);
    expect(res.error).toBe("relation does not exist");
  });

  it("rechaza respuestas con data nula sin error declarado", async () => {
    montarFrom({ data: null, error: null });
    const res = await sbTest(CFG);
    expect(res.ok).toBe(false);
  });

  it("no rompe si createClient lanza (credenciales inválidas)", async () => {
    mockCreateClient.mockImplementationOnce(() => {
      throw new Error("invalid url");
    });
    const res = await sbTest(CFG_OTRA);
    expect(res.ok).toBe(false);
    expect(typeof res.error).toBe("string");
  });
});

/* ── sbPull ────────────────────────────────────────────────────────────────── */

describe("sbPull()", () => {
  it("mapea filas remotas a HistoryItem y descarta las inválidas", async () => {
    montarFrom({
      data: [
        { id: "uuid-1", ts: 123, fuente: "enterprise", titulo: "T1", prompt: "P1", formato: "json", score: 80, meta: "m" },
        { id: 555, ts: 1, fuente: "clasico", titulo: "inválido", prompt: "x", formato: "markdown" },
        { id: "uuid-2", fuente: "fuente-rara", titulo: "T2", prompt: "P2", formato: "pdf" },
      ],
      error: null,
    });
    const res = await sbPull(CFG);
    expect(res.ok).toBe(true);
    expect(res.data).toHaveLength(2);

    const primero = res.data?.[0];
    expect(primero?.id).toBe("uuid-1");
    expect(primero?.fuente).toBe("enterprise");
    expect(primero?.formato).toBe("json");
    expect(primero?.synced).toBe(true);

    const segundo = res.data?.[1];
    expect(segundo?.fuente).toBe("clasico"); // fuente desconocida → por defecto
    expect(segundo?.formato).toBe("markdown"); // formato desconocido → por defecto
    expect(typeof segundo?.ts).toBe("number"); // ts ausente → Date.now()
  });

  it("devuelve error cuando la consulta falla", async () => {
    montarFrom({ data: null, error: { message: "timeout" } });
    const res = await sbPull(CFG);
    expect(res.ok).toBe(false);
    expect(res.error).toBe("timeout");
  });

  it("rechaza respuestas que no son un array", async () => {
    montarFrom({ data: null, error: null });
    const res = await sbPull(CFG);
    expect(res.ok).toBe(false);
  });
});

/* ── sbPush ────────────────────────────────────────────────────────────────── */

describe("sbPush()", () => {
  it("no llama a upsert con lista vacía y reporta éxito", async () => {
    const { upsert } = montarFrom({ data: [], error: null });
    const res = await sbPush(CFG, []);
    expect(res.ok).toBe(true);
    expect(res.data).toBe(0);
    expect(upsert).not.toHaveBeenCalled();
  });

  it("normaliza las filas y hace upsert por id", async () => {
    const { upsert } = montarFrom({ data: [], error: null });
    const items = [
      mkItem("id-1", { fuente: "plantilla", formato: "lista", score: 150, meta: "m".repeat(600) }),
      mkItem("id-2"),
    ];
    const res = await sbPush(CFG, items);

    expect(res.ok).toBe(true);
    expect(res.data).toBe(2);
    expect(upsert).toHaveBeenCalledTimes(1);

    const rows = upsert.mock.calls[0][0] as Record<string, unknown>[];
    const opciones = upsert.mock.calls[0][1] as { onConflict: string };
    expect(opciones.onConflict).toBe("id");
    expect(rows).toHaveLength(2);

    const r1 = rows[0];
    expect(r1.id).toBe("id-1");
    expect(["clasico", "enterprise", "plantilla"]).toContain(r1.fuente);
    expect(["markdown", "json", "texto", "lista", "tabla"]).toContain(r1.formato);
    expect(r1.score === null || (typeof r1.score === "number" && r1.score >= 0 && r1.score <= 100)).toBe(true);
    expect(typeof r1.meta === "string" ? r1.meta.length <= 500 : r1.meta === null).toBe(true);
  });

  it("propaga el error del upsert remoto", async () => {
    montarFrom({ data: [], error: null }, { error: { message: "violates row-level security" } });
    const res = await sbPush(CFG, [mkItem("id-x")]);
    expect(res.ok).toBe(false);
    expect(res.error).toBe("violates row-level security");
  });
});

/* ── Esquemas SQL ──────────────────────────────────────────────────────────── */

describe("esquemas SQL", () => {
  it("ambas variantes crean la tabla con RLS", () => {
    for (const sql of [SQL_DEMO, SQL_PROD]) {
      expect(sql).toContain(SB_TABLE);
      expect(sql).toContain("row level security");
      expect(sql).toContain("create policy");
    }
  });

  it("la variante de producción exige auth.uid()", () => {
    expect(SQL_PROD).toContain("auth.uid()");
    expect(SQL_DEMO).not.toContain("auth.uid()");
  });
});
