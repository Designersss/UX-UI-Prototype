# AIMock — UX/UI Prototype

Interactive, framework-free design prototype for AIMock Workspace and AIMock Admin.

**Current baseline:** UX/UI v0.4 functionality with a proposed Workspace sidebar + Overview v0.6 visual direction (**not yet approved**). The approved functional source of truth is AIMock Product Specification v1.6.

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
- `src/styles/overview.css` — Workspace Overview base layout
- `src/styles/workspace-direction.css` — candidate reference-inspired look, scoped to Workspace left rail and Overview
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
