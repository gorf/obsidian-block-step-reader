param(
    [string]$VaultPath = "D:\Sync\观行公共"
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$dest = Join-Path $VaultPath ".obsidian\plugins\block-step-reader"

if (-not (Test-Path (Join-Path $root "main.js"))) {
    Write-Host "main.js not found. Run: npm run build"
    exit 1
}

New-Item -ItemType Directory -Force -Path $dest | Out-Null
Copy-Item (Join-Path $root "main.js"), (Join-Path $root "manifest.json") -Destination $dest -Force
Write-Host "Installed to $dest"
Write-Host "Reload Obsidian community plugins, then enable Block Step Reader (渐读)."
