# Script de vérification de la structure - Windows PowerShell
# Vérifie et crée tous les dossiers nécessaires pour la Phase 0.1

$basePath = "."
$missingDirs = @()

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

Write-Host "=== Vérification de la structure ===" -ForegroundColor Cyan
Write-Host ""

# Vérifier chaque dossier
foreach ($dir in $requiredDirs) {
    $fullPath = Join-Path $basePath $dir
    
    # Vérifier avec Test-Path et PathType Container
    $exists = Test-Path -Path $fullPath -PathType Container
    
    if ($exists) {
        Write-Host "✅ $dir" -ForegroundColor Green
    } else {
        Write-Host "❌ $dir - MANQUANT" -ForegroundColor Red
        $missingDirs += $dir
    }
}

Write-Host ""
Write-Host "Total vérifié: $($requiredDirs.Count)" -ForegroundColor Cyan
Write-Host "Présents: $($requiredDirs.Count - $missingDirs.Count)" -ForegroundColor Green
Write-Host "Manquants: $($missingDirs.Count)" -ForegroundColor $(if ($missingDirs.Count -eq 0) { "Green" } else { "Red" })

# Créer les dossiers manquants
if ($missingDirs.Count -gt 0) {
    Write-Host ""
    Write-Host "Création des dossiers manquants..." -ForegroundColor Yellow
    
    foreach ($dir in $missingDirs) {
        $fullPath = Join-Path $basePath $dir
        
        try {
            # Créer le dossier s'il n'existe pas
            if (-not (Test-Path -Path $fullPath -PathType Container)) {
                New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
                
                # Vérifier que la création a réussi
                if (Test-Path -Path $fullPath -PathType Container) {
                    Write-Host "✅ Créé: $dir" -ForegroundColor Green
                } else {
                    Write-Host "⚠️  Échec création: $dir" -ForegroundColor Yellow
                }
            }
        } catch {
            Write-Host "❌ Erreur lors de la création de $dir : $_" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "Vérification finale..." -ForegroundColor Cyan
    
    # Vérification finale
    $stillMissing = @()
    foreach ($dir in $missingDirs) {
        $fullPath = Join-Path $basePath $dir
        if (-not (Test-Path -Path $fullPath -PathType Container)) {
            $stillMissing += $dir
        }
    }
    
    if ($stillMissing.Count -eq 0) {
        Write-Host "✅ Tous les dossiers ont été créés avec succès!" -ForegroundColor Green
    } else {
        Write-Host "❌ Dossiers toujours manquants: $($stillMissing -join ', ')" -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "✅ TOUS LES DOSSIERS SONT PRÉSENTS!" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Vérification terminée ===" -ForegroundColor Cyan
