# Script de vérification robuste pour Windows
# Utilise plusieurs méthodes pour vérifier l'existence des dossiers

param(
    [string]$BasePath = "."
)

$ErrorActionPreference = "Continue"

Write-Host "=== Vérification de la structure (Windows) ===" -ForegroundColor Cyan
Write-Host "Répertoire de base: $(Resolve-Path $BasePath -ErrorAction SilentlyContinue)" -ForegroundColor Yellow
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

# Vérifier chaque dossier avec plusieurs méthodes
foreach ($dir in $requiredDirs) {
    $fullPath = Join-Path $BasePath $dir
    
    # Méthode 1: Test-Path avec PathType Container
    $exists1 = Test-Path -Path $fullPath -PathType Container
    
    # Méthode 2: Get-Item avec gestion d'erreur
    $exists2 = $false
    try {
        $item = Get-Item -Path $fullPath -ErrorAction Stop
        $exists2 = $item.PSIsContainer
    } catch {
        $exists2 = $false
    }
    
    # Méthode 3: Test avec Get-ChildItem
    $exists3 = $false
    try {
        $parent = Split-Path -Path $fullPath -Parent
        $name = Split-Path -Path $fullPath -Leaf
        if (Test-Path -Path $parent) {
            $children = Get-ChildItem -Path $parent -Directory -ErrorAction SilentlyContinue
            $exists3 = ($children | Where-Object { $_.Name -eq $name }) -ne $null
        }
    } catch {
        $exists3 = $false
    }
    
    # Considérer comme existant si au moins une méthode confirme
    $exists = $exists1 -or $exists2 -or $exists3
    
    if ($exists) {
        Write-Host "✅ $dir" -ForegroundColor Green
        $existingDirs += $dir
    } else {
        Write-Host "❌ $dir - MANQUANT" -ForegroundColor Red
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
        $fullPath = Join-Path $BasePath $dir
        
        try {
            # Créer le dossier
            if (-not (Test-Path -Path $fullPath -PathType Container)) {
                $created = New-Item -ItemType Directory -Path $fullPath -Force -ErrorAction Stop
                
                # Vérifier la création
                if (Test-Path -Path $fullPath -PathType Container) {
                    Write-Host "✅ Créé: $dir" -ForegroundColor Green
                } else {
                    Write-Host "⚠️  Création échouée: $dir" -ForegroundColor Yellow
                }
            } else {
                Write-Host "ℹ️  Déjà présent: $dir" -ForegroundColor Cyan
            }
        } catch {
            Write-Host "❌ Erreur lors de la création de $dir : $_" -ForegroundColor Red
        }
    }
    
    # Vérification finale
    Write-Host ""
    Write-Host "=== Vérification finale ===" -ForegroundColor Cyan
    $stillMissing = @()
    foreach ($dir in $missingDirs) {
        $fullPath = Join-Path $BasePath $dir
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
