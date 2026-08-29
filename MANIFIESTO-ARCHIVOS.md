# 📦 Manifiesto de Archivos — R-C-T-E-E Pro v2.1.0

> **Inventario oficial: 36 archivos.** Usa este documento para verificar que tu copia local (o tu repo en GitHub) está completa.
> Verificación automática: `.\scripts\descargar-a-local.ps1` (audita los 36 y compila).

---

## 🗂️ Estructura completa

```text
RCTEE-pro-platform/
├── .github/
│   └── workflows/
│       └── ci.yml                  # Pipeline CI/CD (GitHub Actions)
├── public/
│   ├── favicon.svg                 # Logo de marca (5 bloques)
│   └── site.webmanifest            # Manifiesto PWA
├── scripts/
│   ├── sincronizar-github.ps1      # Publicación inicial completa
│   ├── recuperacion-github.ps1     # Push forzado + corrección de rama/remoto
│   └── descargar-a-local.ps1       # Clone + auditoría + build
├── src/
│   ├── __tests__/
│   │   ├── setup.ts                # Configuración jest-dom (RTL)
│   │   ├── engine.test.ts          # 44 tests del motor
│   │   └── supabase.test.ts        # 15 tests de la capa Supabase
│   ├── views/
│   │   ├── Dashboard.tsx           # Consola de mando + terminal animada
│   │   ├── Classic.tsx             # Generador R-C-T-E-E (5 formatos)
│   │   ├── Enterprise.tsx          # Esquema ejecutivo ↔ JSON
│   │   ├── Templates.tsx           # Temas → Subtemas → Plantillas
│   │   ├── Intel.tsx               # Nichos rentables + Mercado
│   │   ├── Runbook.tsx             # Ejecutables manuales
│   │   ├── Chatbot.tsx             # 8 personalidades adaptativas
│   │   └── Settings.tsx            # Motores, extensiones, Supabase
│   ├── App.tsx                     # Orquestador global
│   ├── chrome.tsx                  # Sidebar, TopBar, Historial
│   ├── data.ts                     # Catálogos estáticos
│   ├── engine.ts                   # Lógica de negocio + IA
│   ├── supabase.ts                 # Cliente diferido + esquemas SQL
│   ├── ui.tsx                      # Componentes compartidos
│   ├── index.css                   # Sistema de diseño
│   ├── main.tsx                    # Arranque React
│   └── vite-env.d.ts               # Tipos de import.meta.env
├── .env.example                    # Plantilla de variables (NUNCA el .env)
├── .gitignore                      # Exclusiones (node_modules, dist, .env)
├── index.html                      # Shell HTML
├── package.json                    # Dependencias + scripts
├── package-lock.json               # Lockfile (requerido por npm ci)
├── tsconfig.json                   # TypeScript + tipos Vitest
├── vite.config.js                  # Configuración Vite + Tailwind
├── vitest.config.ts                # Tests + cobertura ≥60 %
├── MANIFIESTO-ARCHIVOS.md          # Este documento
└── README.md                       # Documentación del proyecto
```

---

## ✅ Checklist de verificación manual (36/36)

Marca cada uno tras descargar. Si falta alguno, ejecuta `scripts\recuperacion-github.ps1` en el workspace original.

| # | Archivo | Capa | Crítico |
|---|---|---|:---:|
| 1 | `.github/workflows/ci.yml` | CI/CD | ✅ |
| 2 | `.env.example` | Config | — |
| 3 | `.gitignore` | Config | ✅ |
| 4 | `README.md` | Docs | — |
| 5 | `index.html` | Shell | ✅ |
| 6 | `package.json` | Dependencias | ✅ |
| 7 | `package-lock.json` | Dependencias | ✅ |
| 8 | `tsconfig.json` | TypeScript | ✅ |
| 9 | `vite.config.js` | Build | ✅ |
| 10 | `vitest.config.ts` | Tests | ✅ |
| 11 | `public/favicon.svg` | Estático | — |
| 12 | `public/site.webmanifest` | Estático | — |
| 13 | `src/main.tsx` | Arranque | ✅ |
| 14 | `src/index.css` | Estilos | ✅ |
| 15 | `src/vite-env.d.ts` | Tipos | ✅ |
| 16 | `src/App.tsx` | Orquestador | ✅ |
| 17 | `src/chrome.tsx` | Estructura | ✅ |
| 18 | `src/data.ts` | Datos | ✅ |
| 19 | `src/engine.ts` | Lógica | ✅ |
| 20 | `src/supabase.ts` | Integración | ✅ |
| 21 | `src/ui.tsx` | UI | ✅ |
| 22 | `src/views/Dashboard.tsx` | Vista | ✅ |
| 23 | `src/views/Classic.tsx` | Vista | ✅ |
| 24 | `src/views/Enterprise.tsx` | Vista | ✅ |
| 25 | `src/views/Templates.tsx` | Vista | ✅ |
| 26 | `src/views/Intel.tsx` | Vista | ✅ |
| 27 | `src/views/Runbook.tsx` | Vista | ✅ |
| 28 | `src/views/Chatbot.tsx` | Vista | ✅ |
| 29 | `src/views/Settings.tsx` | Vista | ✅ |
| 30 | `src/__tests__/setup.ts` | Tests | ✅ |
| 31 | `src/__tests__/engine.test.ts` | Tests | ✅ |
| 32 | `src/__tests__/supabase.test.ts` | Tests | ✅ |
| 33 | `scripts/sincronizar-github.ps1` | DevOps | — |
| 34 | `scripts/recuperacion-github.ps1` | DevOps | — |
| 35 | `scripts/descargar-a-local.ps1` | DevOps | — |
| 36 | `MANIFIESTO-ARCHIVOS.md` | Docs | — |

**Crítico** = sin él, el build o los tests fallan.

---

## 🚀 Comandos de verificación rápida

```powershell
# Contar archivos (debe decir 36)
git ls-tree -r main --name-only | Measure-Object -Line

# Verificar que NADA prohibido está versionado (debe devolver vacío)
git ls-files | Select-String -Pattern "node_modules|dist/|^\.env$"

# Verificar que el repo remoto tiene la rama main
git ls-remote origin
```

---

## ⚠️ Lo que NUNCA debe descargarse ni versionarse

- `node_modules/` → se regenera con `npm ci`
- `dist/` → se regenera con `npm run build`
- `coverage/` → se regenera con `npm run test:coverage`
- `.env` → contiene secretos; usa `.env.example` como plantilla
