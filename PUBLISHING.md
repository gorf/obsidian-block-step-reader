# Publishing to the Obsidian Community Plugin Marketplace

This guide explains how to publish **Block Step Reader** to the official Obsidian community plugin directory.

## Prerequisites

1. A public GitHub repository: `https://github.com/gorf/obsidian-block-step-reader`
2. A GitHub release for each published version
3. Each release must attach at least:
   - `main.js`
   - `manifest.json`
   - `versions.json`

## Build a release locally

```powershell
npm install
npm run build
```

Then create a GitHub release:

```powershell
.\publish-github.ps1
```

Or manually:

```powershell
gh release create v0.5.0 main.js manifest.json versions.json `
  --title "0.5.0" `
  --notes "Reading library, i18n, frontmatter progress, Buy Me a Coffee"
```

## Submit to Obsidian

1. Fork [obsidianmd/obsidian-releases](https://github.com/obsidianmd/obsidian-releases)
2. Edit `community-plugins.json`
3. Add an entry like:

```json
{
  "id": "block-step-reader",
  "name": "Block Step Reader",
  "author": "gorf",
  "description": "Reader-like step reading in Obsidian with a reading library, progress in frontmatter, and multi-language UI.",
  "repo": "gorf/obsidian-block-step-reader"
}
```

4. Open a pull request to `obsidianmd/obsidian-releases`
5. Wait for Obsidian team review

Official docs: https://docs.obsidian.md/Plugins/Releasing/Submit+your+plugin

## Before each new marketplace version

1. Bump `version` in `manifest.json` and `package.json`
2. Add the new version to `versions.json`
3. Build: `npm run build`
4. Create a GitHub release with the three required files
5. After merge into the community directory, users can install from **Settings → Community plugins**

## Support (Ko-fi)

The plugin exposes support via:

- `manifest.json` → `fundingUrl`
- Plugin settings → **Support** section

Support URL: `https://ko-fi.com/bigmonk`

Update the URL in:

- `manifest.json`
- `src/constants.ts` → `SUPPORT_KOFI_URL`

## BRAT beta testing

Users can install pre-release builds with [BRAT](https://github.com/TfTHacker/obsidian42-brat):

```
https://github.com/gorf/obsidian-block-step-reader
```

## Checklist

- [ ] Ko-fi support URL configured
- [ ] GitHub release created with `main.js`, `manifest.json`, `versions.json`
- [ ] README documents features and frontmatter schema
- [ ] PR opened to `obsidianmd/obsidian-releases`
- [ ] Plugin tested on desktop and mobile reading view
