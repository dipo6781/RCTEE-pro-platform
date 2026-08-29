<#
.SYNOPSIS
    Publica el proyecto R-C-T-E-E Pro en GitHub desde cero, o recupera un push fallido.
.DESCRIPTION
    Cubre los 4 motivos por los que un repo de GitHub aparece vacio:
    1) git nunca se inicializo localmente
    2) los archivos nunca se commitearon (git add pendiente)
    3) el remoto 'origin' no existe o apunta a otro repositorio
    4) se empujo una rama distinta a la que muestra GitHub por defecto
.USAGE
    .\scripts\sincronizar-github.ps1 -RepoUrl https://github.com/USUARIO/REPO.git
    .\scripts\sincronizar-github.ps1        (si 'origin' ya esta configurado)
#>
param([string]$RepoUrl = "")

function Paso($m)  { Write-Host "-> $m" -ForegroundColor Cyan }
function Ok($m)    { Write-Host "[OK] $m" -ForegroundColor Green }
function Aviso($m) { Write-Host "[!!] $m" -ForegroundColor Yellow }
function Fail($m)  { Write-Host "[XX] $m" -ForegroundColor Red; exit 1 }

# 0 · Raiz del proyecto y archivos fuente presentes
if (-not (Test-Path "package.json")) { Fail "Ejecuta el script desde la raiz del proyecto (donde esta package.json)." }
if (-not (Test-Path "src/App.tsx"))  { Fail "No se encuentran los archivos fuente (src/). Descarga el workspace completo antes de publicar." }
Ok "Raiz correcta: package.json y src/ presentes."

# 1 · Identidad git (solo si falta)
if (-not (git config user.name))  { git config user.name  "R-C-T-E-E Pro" }
if (-not (git config user.email)) { git config user.email "rctee-pro@users.noreply.github.com" }
Paso ("Identidad: {0} <{1}>" -f (git config user.name), (git config user.email))

# 2 · Inicializar repo si no existe
if (-not (Test-Path ".git")) {
    git init -b main
    Ok "Repositorio git inicializado en la rama 'main'."
} else {
    Ok "Repositorio git ya existe en este directorio."
}

# 3 · Estandarizar rama 'main' (es la que dispara el pipeline CI)
$rama = git branch --show-current
if ($rama -and $rama -ne "main") {
    git branch -M main
    Aviso ("Rama renombrada: '{0}' -> 'main'." -f $rama)
}

# 4 · Remoto origin
$remoto = git remote get-url origin 2>$null
if ($RepoUrl) {
    if ($remoto -and $remoto -ne $RepoUrl) {
        git remote set-url origin $RepoUrl
        Aviso ("Remoto actualizado -> {0}" -f $RepoUrl)
    } elseif (-not $remoto) {
        git remote add origin $RepoUrl
        Ok "Remoto 'origin' agregado."
    }
} elseif (-not $remoto) {
    Fail "No existe el remoto 'origin'. Re-ejecuta asi:  .\scripts\sincronizar-github.ps1 -RepoUrl https://github.com/USUARIO/REPO.git"
}
Ok ("Remoto: {0}" -f (git remote get-url origin))

# 5 · Commit de todo el trabajo (el .gitignore ya protege node_modules, dist y .env)
git add .
$pendientes = git status --porcelain
if ($pendientes) {
    git commit -m "feat: proyecto completo R-C-T-E-E Pro v2.1.0"
    Ok ("Commit creado con {0} cambios." -f ($pendientes | Measure-Object).Count)
} else {
    Ok "Sin cambios pendientes: el ultimo commit ya contiene todo el trabajo."
}

# 6 · Publicar
Paso "Publicando en GitHub..."
git push -u origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Aviso "El push fue rechazado. Causas tipicas y su solucion:"
    Aviso "A) El repo remoto solo tiene un README inicial que puedes sobreescribir:"
    Aviso "     git push -u origin main --force"
    Aviso "B) El repo remoto tiene contenido que quieres conservar:"
    Aviso "     git pull origin main --rebase --allow-unrelated-histories"
    Aviso "     git push -u origin main"
    Aviso "C) Autenticacion: GitHub no acepta la clave de la cuenta; usa 'gh auth login'"
    Aviso "   (GitHub CLI) o un Personal Access Token cuando git te pida la clave."
    exit 1
}

Write-Host ""
Ok "Publicacion completada."
$url = (git remote get-url origin) -replace "\.git$", "" -replace "^git@github\.com:", "https://github.com/"
Paso ("Verifica en el navegador: {0}" -f $url)
Paso ("Verifica por consola:   git ls-remote origin   (debe listar refs/heads/main)")
Paso "Pestana Actions: el workflow 'CI Pipeline' debe dispararse solo."
