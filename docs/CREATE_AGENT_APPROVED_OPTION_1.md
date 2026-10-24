# AIMock — Create Agent / approved Premium Calm option 1

**Visual foundation:** user-approved light design, 22 October 2026.  
**This revision:** profession-dependent setup and a compact unified right-rail readiness panel.  
**Branch:** `feature/premium-calm-create-agent`; PR #11 remains unmerged until review.

## Layout and behavior

- One central scrolling editor with numbered sections (basics, profession, behavior & instructions, knowledge & integrations, access). The previous **sixth Readiness card is removed** from the center.
- The hero has a visible, high-contrast **“Как настроить агента? Читать инструкцию”** CTA leading to a dedicated guide, with a return link.
- Profession chooser shows **pagination immediately**, alongside search/category filters. There is no “Show 30 more” disclosure or redundant “Selected: …” subtitle.
- The right context panel retains the praised **“Готовность к запуску”** progress bar and houses the full seven-item **“Проверка готовности”** checklist. It no longer contains post-launch counters or a simulated chat.
- Main form remains simple for beginners. Quick rules provide meaningful one-click controls. **Advanced settings** are collapsible and optional.
- Each available profession has a coherent, localized preset with suggested tasks, tone and quick rules, four advanced prompt sections, and examples of company/task/handoff. Defaults must never imply verified prices, HR decisions, or authorization without appropriate systems.
- Currently only **lead manager** and **HR recruiter** are selectable. Future professions are disabled previews, not falsely promised implementations. Every new selectable profession needs its own reviewed preset before enablement.
- Custom advanced prompts are stored **per profession**, as are customized task, handoff, tone and rules. Switching roles loads its distinct defaults or restores its own prior edits instead of copying another profession’s prompt.
- Knowledge/integration choices can scale into dedicated search/filter/paginated pickers; cards in the editor stay compact.

## Lifecycle and limitations

Changes autosave to this browser's organization-scoped local data. Nothing writes to a production server yet. `Создать агента` validates core fields, creates a non-running agent and opens its detail page. The detail page offers test, edit, enable and disable controls; disabling requires confirmation. Preview/test data and actions remain simulated until the real backend is connected.

## Review checklist

Before merging: visual review at 1440×900, 1280×720 and mobile; focused-input autosave; immediate profession pagination and filters; HR↔sales preset switching and persistence; example insertion; expandable advanced editing and restore-defaults; right-rail progress/checklist sync; draft→created→agent-card flow; regression tests for approved Overview and Agents pages. No automatic merge.
