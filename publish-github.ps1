param(
    [string]$RepoName = "obsidian-block-step-reader",
    [ValidateSet("public", "private")]
    [string]$Visibility = "public"
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
Set-Location $root

$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

gh auth status *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Host "请先在本机终端运行: gh auth login"
    exit 1
}

npm run build

$manifest = Get-Content -Raw -Path (Join-Path $root "manifest.json") | ConvertFrom-Json
$version = $manifest.version
if (-not $version) {
    Write-Host "manifest.json is missing version"
    exit 1
}

# Obsidian matches GitHub release tags to manifest.version exactly (no leading v).
$tag = $version

$pending = git status --porcelain
if ($pending) {
    Write-Host "Warning: uncommitted changes remain in the working tree."
}

$branch = (git branch --show-current).Trim()
if (-not $branch) { $branch = "master" }

$user = gh api user -q .login
$repo = "$user/$RepoName"

git push -u origin $branch 2>$null

gh release view $tag -R $repo *> $null
if ($LASTEXITCODE -eq 0) {
    gh release upload $tag main.js manifest.json versions.json --clobber -R $repo
} else {
    gh release create $tag main.js manifest.json versions.json --title $version --notes "Release $version" -R $repo
}

Write-Host ""
Write-Host "Repository: https://github.com/$repo"
Write-Host "Release:    https://github.com/$repo/releases/tag/$tag"
Write-Host "BRAT URL:   https://github.com/$repo"
Write-Host "Obsidian tag must match manifest.json exactly: $tag"
