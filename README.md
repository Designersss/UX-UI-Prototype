# AIMock — UX/UI Prototype

Interactive, framework-free design prototype for AIMock Workspace and AIMock Admin.

**Current baseline:** UX/UI v0.4 functionality with experimental Workspace Overview + floating left navigation + Soft System Workspace Overview v1.1 candidate (**not yet final approved**). The approved functional source of truth is AIMock Product Specification v1.6.

## Run locally

Open `index.html` in a browser, or run a local static server:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`. No build step or backend is needed.

## Repository layout

- `index.html` — document shell and asset entry points
- `src/styles/base.css` — original v0.4 base styling
- `src/styles/theme.css` — subsequent theme, layout and responsive overrides
- `src/app.js` — interactive prototype data, navigation and other page rendering
- `src/overview.js` — updated Workspace Overview (independent page renderer)
- `src/styles/overview.css` — legacy Workspace Overview layout (previous design iteration)
- `src/styles/overview-four-panels.css` — chosen Soft System visual direction for the four-panel Overview, RU/EN and Light/Dark
- `src/assets/integrations/*.svg` — local, provider-specific vector marks shared by Overview and Integration Hub
- `src/styles/workspace-direction.css` — reference-inspired Workspace Overview and former icon rail styling
- `src/styles/workspace-dock.css` — floating vertical navigation to the left of Workspace (replaces bottom Dock)
- `src/styles/workspace-headerless.css` — Workspace-only header removal, left-rail brand, contextual breadcrumbs and personal preferences
- `docs/UX_DECISIONS.md` — decisions accepted during design reviews

The original v0.4 single-file HTML was split into these files **without changing application behavior**. JavaScript remains a sizeable legacy file: new changes should progressively extract independent concerns and remove accumulated CSS overrides, rather than rewriting the UI from scratch.

## Review process

1. Keep `main` as the latest reviewed baseline.
2. Make focused changes on a descriptive feature branch.
3. Create a pull request with a summary and screenshots if appearance changed.
4. Verify Light/Dark and RU/EN, desktop/mobile, internal scrolling, routing and existing workflows.
5. Only merge after review.

The UI intentionally looks like the planned product, but **its data and actions are simulated**. There is no real authentication, LLM integration, payment processing or external messaging. Do not put production credentials or customer data in this repository.

Repository name and AIMock brand are working titles.

## Integration brand artwork

Real SVG brand marks used in the prototype are stored in `src/assets/integrations/`. Telegram, WhatsApp, VK, Viber and Google Calendar marks come from the [Simple Icons](https://github.com/simple-icons/simple-icons) collection. Bitrix24 uses the [official Bitrix24 icon library](https://github.com/bitrix24/b24icons) service icon. MAX uses the actual MAX messenger brand symbol (as published by [MAX](https://go.max.ru/brandbook), adapted from [vector artwork](https://zaplata.ru/forum/scripts/skachat-gradient-fona-messendzhera-max) with official brand colors).

Logos identify **specific providers**; generic/unidentified connectors such as a calendar without a declared service use a neutral icon, never a fake Google/other brand. Keep original shapes and check trademark/brand-guide terms before commercial release.
