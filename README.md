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

## Create Agent (mock-only)

Third page under review on \`feature/premium-calm-create-agent\`:
- \`#/agents/new\`: choose type and name, and create a **local browser draft** (no server).
- \`#/agents/:id/setup/1..7\`: editable seven-step configuration; saved locally across reloads.
- \`#/agents/:id/testing\`: safe scripted test only, with no model or external-service calls.
- Drafts appear in Catalog → Drafts, scoped to the active mock organization.
- No cross-device sync, real server autosave or live launch is implemented. Do not treat local save as backend confirmation.

### Profession selection and full-row integration controls

- **Step 1:** provide a name and short purpose. **Step 2:** select a profession on its own routed page.
- The 36-entry **demonstration catalog** has search, category filters, and pagination; only two approved role templates can be selected. All other names are non-functional future previews, not production commitments.
- Knowledge and integration selections use full-row accessible buttons (not nested checkboxes) and persist in the same browser without remounting the clicked control.
- Other stages shift to 3: instructions, 4: knowledge, 5: integrations, 6: permissions, 7: readiness. Live agent deployment is disabled.
