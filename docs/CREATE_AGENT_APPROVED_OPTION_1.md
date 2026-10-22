# AIMock — Create Agent / approved visual option 1

**Visual direction selected:** 22 October 2026. **Implementation:** PR #11, awaiting separate browser-UI review.

## Source of truth for the screen

This is the **first** of four light Premium Calm concepts presented together in the design-choice stage (the illustration called "создание_ai_агента_для_команды.png"). It is **not** the later dark wizard illustration. Preserve the approved Overview and Agents Catalog.

- Light Premium Calm shell and sidebar, wide title area with a close/back action; **no "Save draft" button**.
- Soft green editorial introductory banner with a small diagram of the agent connected to tools.
- One continuously scrolling central editor with compact, numbered white cards: basic information; professions; behavior and instructions; knowledge and integrations; access/permissions; readiness.
- A compact, expandable profession catalog with search, categories and pagination for roughly 36 illustrative professions. Only the two approved professions can actually be selected; the rest remain nonfunctional previews.
- Constant right preview: agent identity, editable description, clearly **mock** conversation, original brand marks of selected integrations and readiness. Do not invent actual live statistics or assert a deployed agent exists.
- One sticky footer, with navigation and demo testing. Live publish remains disabled until real backend implementation.
- Existing local browser drafts autosave while typing, and restore when revisiting an editor from Catalog → Drafts. Do not claim cloud save.
- The main page scrolls naturally because this design displays several sections together; individual cards do not independently scroll.
- The testing route remains a separate, safe scripted mock. Deep links from Knowledge Base and Integration Hub bring users back to the editor.

## Review gates

Before merge: desktop + mobile screenshots compared to the original option #1, keyboard focus regression check, profession filters/pagination, autosave/reload, catalog resume, right preview updates and existing Overview/Catalog regression tests. **Do not merge without user approval of the implementation.**
