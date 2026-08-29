/* ────────────────────────────────────────────────────────────────────────────
   R-C-T-E-E PRO · src/supabase.ts
   Sincronización ligera del historial con Supabase (PostgreSQL).
   Credenciales SIEMPRE por env vars (VITE_*) o localStorage editable en Ajustes.
   Cero valores hardcodeados · todas las llamadas con try/catch y validación.
   ──────────────────────────────────────────────────────────────────────────── */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { HistoryItem } from "./engine";

export interface SbConfig {
  url: string;
  key: string;
}

export interface SbResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export const SB_TABLE = "rctee_history";

/* ── Esquema SQL: ejecutar en Supabase → SQL Editor ────────────────────────── */

export const SQL_SCHEMA = `-- R-C-T-E-E Pro · tabla de historial sincronizado
create table if not exists ${SB_TABLE} (
  id uuid primary key,
  ts bigint not null,
  fuente text not null default 'clasico',
  titulo text not null,
  prompt text not null,
  formato text not null default 'markdown',
  score integer,
  meta text
);

alter table ${SB_TABLE} enable row level security;

-- Política de demostración (clave anónima). Para producción,
-- reemplaza por políticas basadas en auth.uid().
create policy "rctee_acceso_anon" on ${SB_TABLE}
  for all using (true) with check (true);`;

/* ── Cliente diferido (singleton por combinación de credenciales) ──────────── */

let client: SupabaseClient | null = null;
let clientSig = "";

export function getSbClient(cfg: SbConfig): SupabaseClient | null {
  const url = cfg.url.trim();
  const key = cfg.key.trim();
  if (url.length < 8 || key.length < 8) return null;
  const sig = `${url}|${key}`;
  if (!client || clientSig !== sig) {
    try {
      client = createClient(url, key);
      clientSig = sig;
    } catch {
      return null;
    }
  }
  return client;
}

export function sbConfigured(cfg: SbConfig): boolean {
  return cfg.url.trim().length > 8 && cfg.key.trim().length > 8;
}

/* ── Mapeo seguro de filas remotas → HistoryItem ───────────────────────────── */

interface SbRow {
  id?: unknown;
  ts?: unknown;
  fuente?: unknown;
  titulo?: unknown;
  prompt?: unknown;
  formato?: unknown;
  score?: unknown;
  meta?: unknown;
}

function rowToItem(r: SbRow): HistoryItem | null {
  if (typeof r.id !== "string" || typeof r.prompt !== "string" || typeof r.titulo !== "string") return null;
  const fuente = r.fuente === "enterprise" || r.fuente === "plantilla" ? r.fuente : "clasico";
  const formato = r.formato === "json" || r.formato === "texto" ? r.formato : "markdown";
  return {
    id: r.id,
    ts: typeof r.ts === "number" && r.ts > 0 ? r.ts : Date.now(),
    fuente,
    titulo: r.titulo,
    prompt: r.prompt,
    formato,
    score: typeof r.score === "number" ? r.score : undefined,
    meta: typeof r.meta === "string" ? r.meta : undefined,
    synced: true,
  };
}

function itemToRow(i: HistoryItem): SbRow {
  return {
    id: i.id,
    ts: i.ts,
    fuente: i.fuente,
    titulo: i.titulo,
    prompt: i.prompt,
    formato: i.formato,
    score: typeof i.score === "number" ? i.score : null,
    meta: i.meta ?? null,
  };
}

/* ── Operaciones ───────────────────────────────────────────────────────────── */

export async function sbTest(cfg: SbConfig): Promise<SbResult<number>> {
  try {
    const c = getSbClient(cfg);
    if (!c) return { ok: false, error: "Faltan URL o clave anónima (mínimo 8 caracteres cada una)" };
    const { data, error, count } = await c.from(SB_TABLE).select("id", { count: "exact", head: true });
    if (error) return { ok: false, error: error.message };
    if (data === null || data === undefined) return { ok: false, error: "Consulta sin respuesta" };
    return { ok: true, data: typeof count === "number" ? count : data.length };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error de red o credenciales" };
  }
}

export async function sbPull(cfg: SbConfig): Promise<SbResult<HistoryItem[]>> {
  try {
    const c = getSbClient(cfg);
    if (!c) return { ok: false, error: "Supabase no configurado" };
    const { data, error } = await c.from(SB_TABLE).select("*").order("ts", { ascending: false }).limit(200);
    if (error) return { ok: false, error: error.message };
    if (!Array.isArray(data)) return { ok: false, error: "Respuesta remota inválida" };
    const items = data.map(rowToItem).filter((x): x is HistoryItem => x !== null);
    return { ok: true, data: items };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error de red" };
  }
}

export async function sbPush(cfg: SbConfig, items: HistoryItem[]): Promise<SbResult<number>> {
  try {
    const c = getSbClient(cfg);
    if (!c) return { ok: false, error: "Supabase no configurado" };
    if (items.length === 0) return { ok: true, data: 0 };
    const rows = items.map(itemToRow);
    const { error } = await c.from(SB_TABLE).upsert(rows, { onConflict: "id" });
    if (error) return { ok: false, error: error.message };
    return { ok: true, data: rows.length };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error de red" };
  }
}
