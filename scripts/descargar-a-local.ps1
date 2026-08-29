# ─────────────────────────────────────────────────────────────────────────────
#  R-C-T-E-E Pro · Descargar el proyecto completo a tu máquina local
#
#  Uso (PowerShell, en la carpeta DONDE QUIERES el proyecto, ej. C:\Proyectos):
#    .\descargar-a-local.ps1
#    .\descargar-a-local.ps1 -Carpeta mi-copia
#    .\descargar-a-local.ps1 -RepoUrl https://github.com/dipo6781/RCTEE-pro-platform.git
#
#  Flujo: clonar → auditar 36 archivos → npm ci → build de verificación
#  Si el repo está vacío, el script te dice exactamente qué ejecutar antes.
# ─────────────────────────────────────────────────────────────────────────────

param(
  [string]$RepoUrl = "https://github.com/dipo6781/RCTEE-pro-platform.git",
  [string]$Carpeta = "RCTEE-pro-platform",
  [switch]$SinInstalar,
  [switch]$SinBuild
)

$ErrorActionPreference = "Continue"

function Ok($m) { Write-Host "[OK] $m" -ForegroundColor Green }
function Av($m) { Write-Host "[..] $m" -ForegroundColor Cyan }
function Er($m) { Write-Host "[XX] $m" -ForegroundColor Red }

# ── Inventario oficial: los 36 archivos que DEBEN existir ──
$ARCHIVOS = @(
  ".github/workflows/ci.yml",
  ".env.example",
  ".gitignore",
  "README.md",
  "index.html",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "vite.config.js",
  "vitest.config.ts",
  "public/favicon.svg",
  "public/site.webmanifest",
  "src/main.tsx",
  "src/index.css",
  "src/vite-env.d.ts",
  "src/App.tsx",
  "src/chrome.tsx",
  "src/data.ts",
  "src/engine.ts",
  "src/supabase.ts",
  "src/ui.tsx",
  "src/views/Chatbot.tsx",
  "src/views/Classic.tsx",
  "src/views/Dashboard.tsx",
  "src/views/Enterprise.tsx",
  "src/views/Intel.tsx",
  "src/views/Runbook.tsx",
  "src/views/Settings.tsx",
  "src/views/Templates.tsx",
  "src/__tests__/setup.ts",
  "src/__tests__/engine.test.ts",
  "src/__tests__/supabase.test.ts",
  "scripts/sincronizar-github.ps1",
  "scripts/recuperacion-github.ps1",
  "scripts/descargar-a-local.ps1",
  "MANIFIESTO-ARCHIVOS.md"
)

# ── Paso 1 · Clonar ──
if (Test-Path $Carpeta) {
  Er "La carpeta '.\$Carpeta' ya existe. Bórrala o usa otro nombre: -Carpeta otro-nombre"
  exit 1
}

Av "Clonando $RepoUrl ..."
git clone $RepoUrl $Carpeta 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0 -or -not (Test-Path $Carpeta)) {
  Er "No se pudo clonar el repositorio. Causas típicas y solución:"
  Write-Host "     1) Repo VACÍO en GitHub → ejecuta primero, en el workspace original:" -ForegroundColor Yellow
  Write-Host "        .\scripts\recuperacion-github.ps1" -ForegroundColor White
  Write-Host "     2) URL incorrecta → verifica que exista: git ls-remote $RepoUrl" -ForegroundColor Yellow
  Write-Host "     3) Repo privado → autentícate antes: gh auth login" -ForegroundColor Yellow
  exit 1
}
Ok "Repositorio clonado en .\$Carpeta"

Set-Location $Carpeta

# ── Paso 2 · Auditoría de integridad (los 36 archivos) ──
Av "Auditando inventario oficial ($($ARCHIVOS.Count) archivos)..."
$faltantes = @()
foreach ($f in $ARCHIVOS) {
  if (-not (Test-Path $f)) { $faltantes += $f }
}

if ($faltantes.Count -gt 0) {
  Er "FALTAN $($faltantes.Count) archivos en el repositorio clonado:"
  $faltantes | ForEach-Object { Write-Host "       - $_" -ForegroundColor Yellow }
  Write-Host "     Solución: en el workspace original ejecuta .\scripts\recuperacion-github.ps1" -ForegroundColor Yellow
  Write-Host "     y vuelve a correr este script." -ForegroundColor Yellow
  Write-Host ""
  Write-Host "     (Puedes continuar con -SinInstalar si solo quieres inspeccionar el código)" -ForegroundColor DarkGray
} else {
  Ok "Integridad verificada: $($ARCHIVOS.Count)/$($ARCHIVOS.Count) archivos presentes"
}

# ── Paso 3 · Dependencias ──
if (-not $SinInstalar) {
  if ($faltantes.Count -gt 0 -and -not (Test-Path "package.json")) {
    Er "Sin package.json no se pueden instalar dependencias. Abortando."
    exit 1
  }
  Av "Instalando dependencias (npm ci)..."
  npm ci
  if ($LASTEXITCODE -ne 0) {
    Er "npm ci falló. Prueba: npm install"
  } else {
    Ok "Dependencias instaladas desde el lockfile"
  }

  # ── Paso 4 · Build de verificación ──
  if (-not $SinBuild) {
    Av "Compilando para confirmar integridad (npm run build)..."
    npm run build
    if ($LASTEXITCODE -eq 0) {
      Ok "BUILD EXITOSO — tu copia local está íntegra y funcional"
    } else {
      Er "El build falló. Revisa los errores arriba."
      exit 1
    }
  }
}

# ── Resumen final ──
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  PROYECTO DESCARGADO EN: $(Get-Location)" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "  Próximos pasos:" -ForegroundColor Cyan
Write-Host "    npm run dev          → servidor en http://localhost:5500" -ForegroundColor White
Write-Host "    npm run test         → 59 tests unitarios (Vitest)" -ForegroundColor White
Write-Host "    npm run test:coverage → reporte de cobertura" -ForegroundColor White
Write-Host ""
Write-Host "  Nota: crea un .env local si usas Supabase (copia .env.example)." -ForegroundColor DarkGray
