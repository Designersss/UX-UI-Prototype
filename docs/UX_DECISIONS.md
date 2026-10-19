# AIMock UX/UI — accepted direction and review notes

**Functional baseline:** Product Specification v1.6 (approved).
**Visual baseline:** v0.4 (under user review; not globally approved).

## Global

- Consistent full Light and full Dark themes; no unrelated dark sidebar/light canvas styling.
- Complete Russian and English experience, including interactions and status text.
- Application fills the entire viewport, with no outer decorative frame and no document-level horizontal/vertical scrolling. Lists and details may scroll *inside their own panels*.
- Release-oriented text in the UI; do not include prototype/demo/future-work notices inside product screens.
- Provide working hover, focus, selected, disabled, empty, error and confirmation states.

## Workspace navigation (accepted)

- No redundant organization/Plus card above nav, no heading "Рабочее пространство", no big "Центр поддержки" promo.
- Top: AIMock brand. Bottom: clickable profile with current organization and account menu.
- Distinguish account, organization and membership. One account may join/create multiple organizations; switching preserves org data, roles, subscription and wallet isolation.
- Bottom account menu: organization switch/create, personal profile, help/support, login as another account, logout. Simultaneous multi-account session switching is *not yet approved*.

## Overview (accepted)

- Remove "Обзор рабочего пространства", "Онлайн", greeting and marketing subtitle.
- KPI cards: remove redundant subtitles for AI Employees, Active Agents and AI Balance.
- Remove redundant New Agent / Analytics buttons.
- Activity metrics are **general agent task executions and outcomes**, not exclusively chat messages or inbound requests; support future development/analytics/assistant agents.

## Messages/Inbox (accepted)

- No oversized duplicate "Сообщения" title or generic "Один Inbox..." subtitle above the module.
- Inbox fills available width/height in a three-panel layout; each panel scrolls independently. Mobile screens open details via a separate panel.
- Remove separate "Внешний канал" card. Keep channel identity compact where useful.
- Contacts/candidates and assigned agents are links to their respective scoped records.

## Navigation and breadcrumbs (accepted)

- Breadcrumbs show logical hierarchy; Back/Forward follow actual visited history.
- Preserve selected conversation, search/filter, chosen tabs and relevant panel state during contextual navigation.
- Contextual journal and journal-event views must let users return to the exact conversation.
- Support deep links and nested paths (potentially 7–8 levels); collapse middle crumbs visually on narrow screens.
- Verify organization permissions on access to every linked resource.

## Next steps

Continue reviewing remaining Workspace pages and Admin screen-by-screen. Record additional accepted decisions here. Do not label v0.4 a fully approved final design.

## Workspace Overview — design proposal for review (v0.5, NOT approved)

Replace visually promotional / hollow overview cards with a dense operational company dashboard:

- Four compact metrics: all AI employees, effectively active agents, generic task executions (period-based), prepaid AI balance.
- A 7/30 day selector controls chart data, execution counts, success rate and AI spending.
- Main analytics graph shows successful and failed **task executions**, not only chat messages.
- Actionable attention queue from outstanding billing/HR notifications and scenarios.
- Dense agent status list, with direct transitions to agent detail.
- Recent business activity events, linking to the individual journal event.
- All sections are permission-scoped to the current organization in the future API.
- Entire shell remains screen-fitted; inner lists scroll, mobile uses explicit panels/tabs.
- No repeat marketing copy or redundant top-level New Agent / Analytics buttons.
- Both RU/EN and Light/Dark need to remain complete and accessible.

**Prototype-only limitation:** The operational KPI timeseries and spending breakdown for Nord Group are fixed *sample fixtures*. There is no event aggregation backend in the prototype. Figures are consistent internally within the dashboard but should not be represented as real, authoritative billing or operating metrics until connected to the future API and ledger. UI deliberately uses product-oriented copy without a demo banner.
