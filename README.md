# AIMock · Premium Calm UX/UI

Production-minded **interactive UI prototype**. This repository is a clean rebuild of the approved visual direction, not a reuse of the legacy prototype. Mock data only; no backend, real payments or external service calls.

## Run

Open `index.html` directly or serve it from any static server:

```bash
python3 -m http.server 4173
```

Then visit http://localhost:4173/#/overview.

## Current scope

- **Workspace Overview**: genuine responsive layout, status cards, 7/30-day chart, organization isolation, contextual right rail, attention queue, interactions and navigation.
- Sidebar navigation, search (⌘/Ctrl + K), organization switching, light/dark and RU/EN preferences are interactive.
- Other pages are explicitly marked **not implemented**, to avoid suggesting unreviewed designs are ready.
- Data is fixture-only in `src/data.js`. Reconnection and billing actions do **not** call external systems.

## Design sources

- **AIMock Product Specification v1.6** (approved).
- **AIMock Premium Calm Design System v1.0** (approved).
- **Workspace Overview UI v0.1** (approved).
- Other pages (Agents Catalog, Create Agent) have approved designs but will be coded as separately reviewed stages.

## Structure

- `index.html` static shell
- `src/data.js` isolated mock organization data
- `src/app.js` route + rendering + UI event handlers
- `src/styles.css` Premium Calm tokens/components/responsive design
- `tests/` mock integrity and UI-contract tests

No npm dependency or bundler is required for this initial prototype. The shell can later be migrated to a framework without affecting approved UI decisions.

## Quality

```bash
node --check src/app.js
node --check src/data.js
node --test tests/*.test.mjs
```

## Workflow

One reviewed page at a time; no feature PR is merged without approval. The old source remains available on branch `archive/legacy-prototype-2026-10-22`. The new source **replaces** all previous files, so no legacy CSS cascade is carried forward.

## Create Agent — approved option #1 (under code review)

**Reference:** `docs/CREATE_AGENT_APPROVED_OPTION_1.md`. This is the **light, full-page editor with numbered stacked sections and a detailed preview on the right**, not the previously rejected dark wizard. The approved Overview and Agents Catalog are unchanged.

- `#/agents/new`: single-page editor with a visual introductory banner and inline sections for basics, profession selection, behavior, knowledge and integrations, access and readiness.
- `#/agents/:id/edit`: same page reopening a locally autosaved organization-scoped draft. Typing or selecting a role creates the draft automatically; there is **no Save Draft button**.
- Profession catalog starts compact and expands into searchable, category-filterable paginated results. Only the two validated mock professions can be selected.
- Knowledge and connected provider choices work across whole rows and show updates in the right preview. Original provider icons are used where available.
- `#/agents/:id/testing`: a separate scripted simulation, not a live AI call. Production activation stays disabled.
- Links into Knowledge Base and Integration Hub preserve a contextual back action.
- Full central page scrolls as one coherent document; individual cards do not scroll on their own.
- Local browser state is **not** server/cloud storage. Backend writes, production integration requests, access permissions and real publishing are deliberately out of scope.

Review and merge policy: code stays in draft PR until the user has inspected and approved the working implementation.
