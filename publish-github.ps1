param(
    [string]$RepoName = "obsidian-reading-view-enhancer",
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

$pending = git status --porcelain
if ($pending) {
    git add -A
    git commit -m "chore: add local maintenance tooling"
}

$branch = (git branch --show-current).Trim()
if (-not $branch) { $branch = "master" }

if ((git rev-parse --is-shallow-repository).Trim() -eq "true") {
    if ((@(git remote) -contains "upstream")) {
        git fetch upstream --unshallow
    } else {
        git fetch --unshallow
    }
}

$remotes = @(git remote)
if ($remotes -notcontains "origin") {
    if ($Visibility -eq "private") {
        gh repo create $RepoName --private --source . --remote origin --description "Obsidian reading view block selector (maintenance mirror)" --push
    } else {
        gh repo create $RepoName --public --source . --remote origin --description "Obsidian reading view block selector (maintenance mirror)" --push
    }
} else {
    git push -u origin $branch
}

$user = gh api user -q .login
$repo = "$user/$RepoName"
$tag = "v0.2.1-maintenance"

gh release view $tag -R $repo *> $null
if ($LASTEXITCODE -eq 0) {
    gh release upload $tag main.js manifest.json --clobber -R $repo
} else {
    gh api "repos/$repo/releases" -X POST -f tag_name=$tag -f name="0.2.1" -f body="Maintenance release with prebuilt main.js for manual install and BRAT." | Out-Null
    gh release upload $tag main.js manifest.json --clobber -R $repo
}

Write-Host ""
Write-Host "Repository: https://github.com/$repo"
Write-Host "Release:    https://github.com/$repo/releases/tag/$tag"
Write-Host "BRAT URL:   https://github.com/$repo"
