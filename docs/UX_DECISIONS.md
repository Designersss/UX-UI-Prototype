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

## Workspace Overview + sidebar visual direction v0.6 — awaiting user design review

Based on the user's October 19 reference image (minimal white analytics product, narrow icon-first left rail, softly rounded white cards and restrained accent).

- Visual style is **a candidate**, not globally approved. Apply it only to Workspace left navigation and Overview; all other content screens and Admin content are unchanged.
- Sidebar is an icon rail with accessible labels/tooltips on desktop; on mobile the same actions expand to a drawer with visible text labels. The bottom avatar still opens the full account/organization switcher and sign-out.
- White/off-white low-shadow cards and calm typography in Light; fully coordinated dark surface palette in Dark, with a single restrained violet accent and one soft green KPI highlight.
- Remove the duplicate Overview content heading. Keep hierarchical breadcrumbs and browser Back/Forward functionality in top bar.
- Move the 7/30-day period switcher into the **Agent activity** card, where it controls the execution metrics and chart; preserve RU/EN and mobile tabs.
- Maintain screen-height fit and scroll only within dense data panes; hover/focus and reduced-motion rules are explicit.
- Track the pending critique on composition, color, font, microinteraction and density before propagating a style to the rest of AIMock.

## Workspace floating bottom Dock v0.7 (user-approved idea; visual design still under review)

- Replace left rail in Workspace with a floating, rounded **macOS-like bottom Dock**. Avoid copying Apple trade dress, but use recognizable icon-first navigation and restrained hover lift.
- Entire viewport above belongs to working content; reserve a bottom safe strip so the Dock does not obscure tables, Inbox composer or panels. Never add outer document scrolling.
- Desktop Dock contains all Workspace section icons with localized hover/focus tooltips and selected state; profile avatar at right retains organization switching, profile, help and logout.
- Small/mobile Dock shows five primary sections, a localized **More** panel for the remaining seven sections, and profile avatar. Other screens (including Admin) keep their current navigation for now.
- Preserve Light/Dark, RU/EN, keyboard focus, accessible labels, reduced-motion preference, all existing navigation actions and contextual breadcrumbs.
- This is the experimental Workspace design direction. The global final UX/UI remains unapproved, even though its staging PR will be merged for iterative review.

## Workspace header + Dock refinement v0.8 (accepted UX decision; not final design)

- **Remove the permanent top header for Workspace only.** Its theme, language, notification controls and Workspace/Admin switch no longer occupy screen space.
- Keep notifications in the bottom Dock; do not duplicate them in the page shell.
- Put a visible **AIMock** wordmark at the LEFT edge of the floating bottom Dock, with a divider to its right. Keep the account avatar on the RIGHT, divided on its left. Clicking AIMock navigates to the Workspace Overview.
- Personal **theme and language** settings belong in **My profile → Appearance & language**, separate from organization Settings. Selection persists across organization switching. Existing Admin top header remains unchanged for now.
- Workspace-to-Admin navigation is accessible from the profile menu **only when the account has platform-owner/admin privileges**; production must authorize server-side. Admin can return to Workspace via its existing header toggle.
- Keep contextual breadcrumbs plus Back on nested object pages (agent, contact/candidate, conversation journal, journal-event); no permanent header or duplicate title on root Overview. Back restores prior navigation history.
- On smaller screens Dock shows a subset of sections plus **More**; hidden icons must remain in overflow. Preserve Light/Dark and RU/EN, keyboard focus, minimized motion preferences, full-viewport sizing and panel-local scrolling.
- This v0.8 visual prototype is for iterative user review; Product Specification v1.6 is the approved functional baseline, while the full visual design is not yet approved.

## Workspace floating LEFT rail v0.9 — latest user direction

- User selected **left**, not right: the Workspace navigation floats vertically on the left with a small inset from the window boundaries, fully rounded corners, a subtle shadow, and a coherent Light/Dark surface.
- AIMock wordmark at top of that floating rail separated by a horizontal divider; all 12 Workspace navigation routes are reachable as icon buttons with localized native title/accessible labels. Account avatar stays at the bottom, separated from navigation by another divider.
- In shorter viewports, only the middle nav list scrolls; the top brand and bottom account trigger remain visible. No mobile horizontal Dock, no overlapping content.
- No global header in Workspace. Theme/language belong to personal profile, and breadcrumbs appear on meaningful nested pages only. Admin still retains its own independent layout.
- This replaces the previously proposed bottom Dock; functional spec v1.6 stays approved, while the final visual design remains under review.
