/* ────────────────────────────────────────────────────────────────────────────
   R-C-T-E-E PRO · src/supabase.ts
   Sincronización ligera del historial con Supabase (PostgreSQL).
   Credenciales SIEMPRE por env vars (VITE_*) o localStorage editable en Ajustes.
   Cero valores hardcodeados · todas las llamadas con try/catch y validación.
   ──────────────────────────────────────────────────────────────────────────── */

import type { SupabaseClient } from "@supabase/supabase-js";
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

/* ── Esquemas SQL: ejecutar en Supabase → SQL Editor ───────────────────────── */

export const SQL_DEMO = `-- R-C-T-E-E Pro · Esquema DEMO (clave anónima, sin Supabase Auth)
-- Ruta: Supabase → SQL Editor → New query → pegar → Run

create table if not exists ${SB_TABLE} (
  id      uuid primary key,
  ts      bigint  not null,
  fuente  text    not null default 'clasico'
          check (fuente in ('clasico','enterprise','plantilla')),
  titulo  text    not null check (char_length(titulo) between 1 and 200),
  prompt  text    not null check (char_length(prompt) between 1 and 100000),
  formato text    not null default 'markdown'
          check (formato in ('markdown','json','texto')),
  score   integer check (score is null or (score between 0 and 100)),
  meta    text    check (meta is null or char_length(meta) <= 500)
);

create index if not exists idx_${SB_TABLE}_ts on ${SB_TABLE} (ts desc);

alter table ${SB_TABLE} enable row level security;

-- Lectura, inserción y actualización para la clave anónima.
-- DELETE queda INTENCIONALMENTE fuera: con la anon key nadie
-- puede borrar registros remotos (solo desde el SQL Editor).
drop policy if exists "rctee_select_demo" on ${SB_TABLE};
create policy "rctee_select_demo" on ${SB_TABLE}
  for select using (true);

drop policy if exists "rctee_insert_demo" on ${SB_TABLE};
create policy "rctee_insert_demo" on ${SB_TABLE}
  for insert with check (true);

drop policy if exists "rctee_update_demo" on ${SB_TABLE};
create policy "rctee_update_demo" on ${SB_TABLE}
  for update using (true) with check (true);`;

export const SQL_PROD = `-- R-C-T-E-E Pro · Esquema PRODUCCIÓN (RLS por usuario con Supabase Auth)
-- Requiere que la app inicie sesión (auth.uid() disponible en la sesión).

create table if not exists ${SB_TABLE} (
  id      uuid primary key,
  owner   uuid references auth.users (id) on delete cascade,
  ts      bigint  not null,
  fuente  text    not null default 'clasico'
          check (fuente in ('clasico','enterprise','plantilla')),
  titulo  text    not null check (char_length(titulo) between 1 and 200),
  prompt  text    not null check (char_length(prompt) between 1 and 100000),
  formato text    not null default 'markdown'
          check (formato in ('markdown','json','texto')),
  score   integer check (score is null or (score between 0 and 100)),
  meta    text    check (meta is null or char_length(meta) <= 500)
);

create index if not exists idx_${SB_TABLE}_ts    on ${SB_TABLE} (ts desc);
create index if not exists idx_${SB_TABLE}_owner on ${SB_TABLE} (owner);

alter table ${SB_TABLE} enable row level security;

-- El owner se estampa automáticamente al insertar.
create or replace function rctee_set_owner()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.owner := coalesce(new.owner, auth.uid());
  return new;
end;
$$;

drop trigger if exists rctee_owner_stamp on ${SB_TABLE};
create trigger rctee_owner_stamp
  before insert on ${SB_TABLE}
  for each row execute function rctee_set_owner();

-- Cada usuario solo ve y modifica sus propios registros.
drop policy if exists "rctee_select_own" on ${SB_TABLE};
create policy "rctee_select_own" on ${SB_TABLE}
  for select using (owner = auth.uid());

drop policy if exists "rctee_insert_own" on ${SB_TABLE};
create policy "rctee_insert_own" on ${SB_TABLE}
  for insert with check (auth.uid() is not null);

drop policy if exists "rctee_update_own" on ${SB_TABLE};
create policy "rctee_update_own" on ${SB_TABLE}
  for update using (owner = auth.uid()) with check (owner = auth.uid());

drop policy if exists "rctee_delete_own" on ${SB_TABLE};
create policy "rctee_delete_own" on ${SB_TABLE}
  for delete using (owner = auth.uid());`;

/** Alias retrocompatible */
export const SQL_SCHEMA = SQL_DEMO;

/* ── Cliente diferido: el SDK se descarga como chunk solo cuando se usa ────── */

let client: SupabaseClient | null = null;
let clientSig = "";
let loading: Promise<SupabaseClient | null> | null = null;

export async function loadSbClient(cfg: SbConfig): Promise<SupabaseClient | null> {
  const url = cfg.url.trim();
  const key = cfg.key.trim();
  if (url.length < 8 || key.length < 8) return null;
  const sig = `${url}|${key}`;
  if (client && clientSig === sig) return client;
  if (loading) return loading;
  loading = (async () => {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      client = createClient(url, key);
      clientSig = sig;
      return client;
    } catch {
      client = null;
      return null;
    } finally {
      loading = null;
    }
  })();
  return loading;
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
    ts: typeof i.ts === "number" && i.ts > 0 ? i.ts : Date.now(),
    fuente: i.fuente === "enterprise" || i.fuente === "plantilla" ? i.fuente : "clasico",
    titulo: (i.titulo || "Prompt sin título").slice(0, 200),
    prompt: i.prompt,
    formato: i.formato,
    score: typeof i.score === "number" ? i.score : null,
    meta: i.meta ?? null,
  };
}

/* ── Operaciones ───────────────────────────────────────────────────────────── */

export async function sbTest(cfg: SbConfig): Promise<SbResult<number>> {
  try {
    const c = await loadSbClient(cfg);
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
    const c = await loadSbClient(cfg);
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
    const c = await loadSbClient(cfg);
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
