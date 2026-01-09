# Script de vérification robuste pour Windows
# Utilise le chemin absolu pour éviter les problèmes de chemin relatif

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$basePath = Split-Path -Parent $scriptPath
$basePath = Resolve-Path $basePath

Write-Host "=== Vérification de la structure (Windows) ===" -ForegroundColor Cyan
Write-Host "Répertoire de base: $basePath" -ForegroundColor Yellow
Write-Host ""

# Liste complète des dossiers requis
$requiredDirs = @(
    "services",
    "services\auth-service",
    "services\user-service",
    "services\conversation-service",
    "services\ai-service",
    "services\content-service",
    "services\voice-service",
    "frontend",
    "frontend\web",
    "frontend\sdk",
    "shared",
    "shared\types",
    "shared\utils",
    "infrastructure",
    "infrastructure\nginx",
    "infrastructure\nginx\conf.d",
    "infrastructure\monitoring",
    "infrastructure\monitoring\grafana",
    "infrastructure\monitoring\grafana\dashboards",
    "infrastructure\monitoring\grafana\datasources",
    "scripts",
    ".github",
    ".github\workflows"
)

$missingDirs = @()
$existingDirs = @()

# Vérifier chaque dossier
foreach ($dir in $requiredDirs) {
    $fullPath = Join-Path $basePath $dir
    $fullPath = $fullPath -replace '\\', '\'  # Normaliser les séparateurs
    
    # Vérifier avec Test-Path en utilisant le chemin absolu
    $exists = Test-Path -Path $fullPath -PathType Container
    
    if ($exists) {
        Write-Host "✅ $dir" -ForegroundColor Green
        $existingDirs += $dir
    } else {
        Write-Host "❌ $dir - MANQUANT" -ForegroundColor Red
        Write-Host "   Chemin testé: $fullPath" -ForegroundColor Gray
        $missingDirs += $dir
    }
}

Write-Host ""
Write-Host "=== Résumé ===" -ForegroundColor Cyan
Write-Host "Total vérifié: $($requiredDirs.Count)" -ForegroundColor White
Write-Host "Présents: $($existingDirs.Count)" -ForegroundColor Green
Write-Host "Manquants: $($missingDirs.Count)" -ForegroundColor $(if ($missingDirs.Count -eq 0) { "Green" } else { "Red" })

# Créer les dossiers manquants
if ($missingDirs.Count -gt 0) {
    Write-Host ""
    Write-Host "=== Création des dossiers manquants ===" -ForegroundColor Yellow
    
    foreach ($dir in $missingDirs) {
        $fullPath = Join-Path $basePath $dir
        $fullPath = $fullPath -replace '\\', '\'
        
        try {
            if (-not (Test-Path -Path $fullPath -PathType Container)) {
                $created = New-Item -ItemType Directory -Path $fullPath -Force -ErrorAction Stop
                
                if (Test-Path -Path $fullPath -PathType Container) {
                    Write-Host "✅ Créé: $dir" -ForegroundColor Green
                } else {
                    Write-Host "⚠️  Création échouée: $dir" -ForegroundColor Yellow
                }
            }
        } catch {
            Write-Host "❌ Erreur lors de la création de $dir : $_" -ForegroundColor Red
        }
    }
} else {
    Write-Host ""
    Write-Host "✅ TOUS LES DOSSIERS SONT PRÉSENTS!" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Vérification terminée ===" -ForegroundColor Cyan
