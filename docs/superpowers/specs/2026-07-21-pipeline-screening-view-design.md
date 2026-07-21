# Pipeline Screening View — Design

**Date:** 2026-07-21
**Scope:** Job Detail → Pipeline tab

## Problem

Kanban view gives pipeline-wide overview, but recruiters spend most of their triage time on ONE candidate at a time: read summary, glance resume, check screening answers, then either move-to-next-stage or disqualify. Kanban forces them to click through to a full-page profile for each candidate, losing the list context.

The Recruitee-style 3-pane screening layout (stage-tabs top, list left, profile right) is the industry-standard shape for this workflow.

## Approach

Add a **view-mode toggle** to the Pipeline tab: `Kanban` (existing) / `Screening` (new). Persist per-user via localStorage. Kanban is untouched. Screening is a new 3-pane layout in our brand system.

## Layout

```
┌────────────────────────────────────────────────────────────────┐
│  Qualified 6 | Disqualified 1        [Kanban ⇆ Screening] ⋯   │
├────────────────────────────────────────────────────────────────┤
│  ● All 9   ● Sourced 0   ● Applied 3   ● Phone 2  …           │   stage bar
├────────────────┬───────────────────────────────────────────────┤
│  ☐ Search  ⚙  │  Wade Brakus                    Follow · 2    │
│                │  Manager · via monster.com                    │
│  ▸ Wade B.     │  [📧] [📅] [💬] ⋯   [Disqualify] [Move ▾]    │
│    Hal S.      │  ┌ Profile | Timeline | Comm | Review | Cmt ┐│
│    George L.   │  │  Summary · Resume · Answers               ││
│    …           │  └───────────────────────────────────────────┘│
└────────────────┴───────────────────────────────────────────────┘
```

Responsive: <1024px list becomes a slide-in sheet; <640px list-only until row tapped.

## Component split

- `PipelineScreeningView.vue` — 3-pane shell, owns selected-stage + selected-candidate state
- `ScreeningStageBar.vue` — horizontal stage tabs with dot + count, keyboard ← / →
- `ScreeningCandidateRow.vue` — list row (avatar, name, headline, tags, source, rating icon)
- `ScreeningProfilePane.vue` — right pane: header + action row + tabs
- `ScreeningActionRow.vue` — icons + Disqualify + split-button Move to <next>

Kanban stays in `PipelineBoard`-shaped code already inline in `[id].vue` — we only add the screening branch behind the toggle.

## State

- `pipelineViewMode: 'kanban' | 'screening'` — `useLocalStorage(`pipeline-view-mode:${jobId}`, 'kanban')`
- `activeStageKey: JobStageDot | 'all'` — defaults to first non-empty stage
- `selectedCandidateId: string | null` — defaults to first in filtered list; auto-selects next when current is moved/disqualified

Stage data + counts come from existing `useJobPipeline`.

## Design system

All colors from `--brand-*` tokens. Components:
- shadcn `Tabs` for the profile tabs
- shadcn `DropdownMenu` for split-button Move to stage and ⋯ overflow
- `BrandLimeCheckbox` for row select
- `BrandAvatarInitials` for avatars
- `BrandSearchBar` for list search
- Segmented `Kanban ⇆ Screening` toggle uses the same `--brand-canvas` capsule style as Qualified/Disqualified

No hex codes anywhere in the new files.

## Keyboard

- `j` / `k` or `↓` / `↑` — move selection in list
- `Enter` — open full candidate profile page
- `d` — disqualify current
- `m` — open Move-to-stage menu
- `[` / `]` — prev / next stage tab

Announced through the existing `aria-live` region.

## Data / API-swap posture

Fixture today (`useJobPipeline`). When the API lands, screening view reuses the same `['pipeline', jobId, stageKey, filters]` infinite-query key documented in the composable JSDoc — list column IS a per-stage infinite scroll, exactly what that key was designed for. Zero re-architecture needed.

## Out of scope for v1

- The 4th "Candidate overview / latest comments" side panel in the Recruitee reference — defer.
- Real-time selected-candidate sync across viewers — defer with the rest of Part 6.
- Per-row bulk-action checkbox in screening list — inherit from the toolbar spec; not blocking v1.
