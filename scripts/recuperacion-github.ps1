# ─────────────────────────────────────────────────────────────────────────────
#  R-C-T-E-E Pro · Recuperación y publicación forzosa en GitHub
#
#  Uso (PowerShell, desde la raíz del proyecto):
#    .\scripts\recuperacion-github.ps1
#    .\scripts\recuperacion-github.ps1 -RepoUrl https://github.com/OTRO/repo.git
#
#  Resuelve: repo remoto vacío, historiales divergentes, rama master→main,
#  remoto 'origin' inexistente o con URL equivocada.
# ─────────────────────────────────────────────────────────────────────────────

param(
  [string]$RepoUrl = "https://github.com/dipo6781/RCTEE-pro-platform.git"
)

$ErrorActionPreference = "Continue"

function Ok($m) { Write-Host "[OK] $m" -ForegroundColor Green }
function Av($m) { Write-Host "[..] $m" -ForegroundColor Cyan }
function Er($m) { Write-Host "[XX] $m" -ForegroundColor Red }

# ── Verificación de raíz ──
if (-not (Test-Path "package.json") -or -not (Test-Path "src")) {
  Er "Ejecuta este script desde la RAÍZ del proyecto (donde está package.json)."
  exit 1
}

# ── 1 · Asegurar rama main (tolerante: la crea si no existe) ──
git checkout main 2>$null
if ($LASTEXITCODE -ne 0) {
  Av "La rama 'main' no existe; creándola desde el estado actual..."
  git checkout -b main
  Ok "Rama 'main' creada"
} else {
  Ok "En rama 'main'"
}

# ── 2 · Añadir TODO ──
git add -A
Av "Cambios añadidos al índice (git add -A)"

# ── 3 · Commit de seguridad (no falla si no hay cambios) ──
git commit -m "Recuperación: sincronización completa del proyecto" --allow-empty | Out-Null
Ok "Commit de seguridad registrado"

# ── 4 · Remoto idempotente (no falla si 'origin' no existe) ──
git remote remove origin 2>$null
git remote add origin $RepoUrl
Ok "Remoto 'origin' apunta a $RepoUrl"

# ── 5 · Push forzado (sobrescribe remoto vacío o divergente) ──
Av "Publicando con push forzado..."
git push origin main --force

if ($LASTEXITCODE -eq 0) {
  Ok "PUSH EXITOSO — el proyecto completo está en GitHub"
  Write-Host ""
  Write-Host "Verificación remota:" -ForegroundColor Cyan
  git ls-remote origin | Select-Object -First 3
  Write-Host ""
  Write-Host "Abre en el navegador: $($RepoUrl -replace '\.git$','')" -ForegroundColor Cyan
} else {
  Er "El push fue rechazado. Diagnóstico rápido:"
  Write-Host "     1) 'Authentication failed' → usa 'gh auth login' o un Personal Access Token" -ForegroundColor Yellow
  Write-Host "     2) 'remote: Repository not found' → verifica la URL del repo en GitHub" -ForegroundColor Yellow
  Write-Host "     3) Rama protegida → Settings → Branches → desactiva la protección temporalmente" -ForegroundColor Yellow
  exit 1
}
