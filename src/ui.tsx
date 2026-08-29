/* ────────────────────────────────────────────────────────────────────────────
   R-C-T-E-E PRO · src/ui.tsx
   Componentes compartidos: Reveal, Toggle, Meter, CopyBtn, Field, Spinner…
   ──────────────────────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { copyText } from "./engine";

/* ── Revelado al entrar en viewport ────────────────────────────────────────── */

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVis(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`rv ${vis ? "rv-in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ── Etiqueta técnica (eyebrow) ────────────────────────────────────────────── */

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-mist ${className}`}>{children}</p>
  );
}

/* ── Chip de letra R-C-T-E-E ───────────────────────────────────────────────── */

export function LetterChip({ letter, hex, size = "md" }: { letter: string; hex: string; size?: "sm" | "md" | "lg" }) {
  const s = size === "lg" ? "w-11 h-11 text-lg" : size === "sm" ? "w-6 h-6 text-[11px]" : "w-8 h-8 text-sm";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md font-display font-bold text-surface shrink-0 ${s}`}
      style={{ backgroundColor: hex, boxShadow: `0 3px 10px -3px ${hex}66` }}
    >
      {letter}
    </span>
  );
}

/* ── Toggle ────────────────────────────────────────────────────────────────── */

export function Toggle({
  checked,
  onChange,
  label,
  desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="press flex w-full items-center justify-between gap-4 rounded-lg border border-line bg-surface px-4 py-3 text-left hover:border-line-2"
    >
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {desc && <span className="mt-0.5 block text-xs leading-relaxed text-mist">{desc}</span>}
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${checked ? "bg-jade" : "bg-line-2"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-surface shadow transition-transform duration-300 ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

/* ── Medidor animado ───────────────────────────────────────────────────────── */

export function Meter({ value, hex = "#0f7a55" }: { value: number; hex?: string }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(Math.max(0, Math.min(100, value))), 80);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-line/70">
      <div
        className="bar-fill h-full rounded-full"
        style={{ width: `${w}%`, backgroundColor: hex, boxShadow: `0 0 10px ${hex}55` }}
      />
    </div>
  );
}

/* ── Botón copiar ──────────────────────────────────────────────────────────── */

export function CopyBtn({ text, dark = false, className = "" }: { text: string; dark?: boolean; className?: string }) {
  const [ok, setOk] = useState(false);
  const onCopy = async () => {
    const done = await copyText(text);
    if (done) {
      setOk(true);
      setTimeout(() => setOk(false), 1600);
    }
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      className={`press inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-xs font-semibold transition-colors ${
        dark
          ? ok
            ? "bg-jade text-surface"
            : "bg-pine-3 text-paper hover:bg-pine-2"
          : ok
            ? "bg-jade text-surface"
            : "border border-line-2 bg-surface text-ink hover:border-jade hover:text-jade"
      } ${className}`}
    >
      {ok ? (
        <>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Copiado
        </>
      ) : (
        <>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="12" height="12" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copiar
        </>
      )}
    </button>
  );
}

/* ── Spinner ───────────────────────────────────────────────────────────────── */

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3.5" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

/* ── Campo de formulario R-C-T-E-E ─────────────────────────────────────────── */

export function Field({
  letter,
  hex,
  label,
  value,
  onChange,
  min = 0,
  rows = 3,
  placeholder,
  error,
  hint,
}: {
  letter: string;
  hex: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  min?: number;
  rows?: number;
  placeholder: string;
  error?: string;
  hint?: string;
}) {
  const len = value.trim().length;
  const ok = min > 0 && len >= min;
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2.5">
        <LetterChip letter={letter} hex={hex} size="sm" />
        <label className="font-display text-[15px] font-bold text-ink">{label}</label>
        {min > 0 && (
          <span className={`ml-auto font-mono text-[11px] font-medium tabular-nums ${ok ? "text-jade" : len > 0 ? "text-honey" : "text-mist"}`}>
            {len}/{min}
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={`focusable w-full resize-y rounded-lg border bg-surface px-3.5 py-2.5 text-[14px] leading-relaxed text-ink placeholder:text-mist/60 transition-colors ${
          error ? "border-danger" : "border-line hover:border-line-2"
        }`}
      />
      {error ? (
        <p className="anim-pop mt-1.5 flex items-start gap-1.5 text-xs font-medium text-danger">
          <svg viewBox="0 0 24 24" className="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-mist">{hint}</p>
      ) : null}
    </div>
  );
}

/* ── Contador animado ──────────────────────────────────────────────────────── */

export function CountUp({ to, duration = 1100 }: { to: number; duration?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <span className="tabular-nums">{n}</span>;
}
