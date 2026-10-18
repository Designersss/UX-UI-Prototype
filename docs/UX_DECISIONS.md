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
