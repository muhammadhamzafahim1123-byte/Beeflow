# BeeFlow UI Structure and Component Plan

## Product Shape

BeeFlow is structured as a desktop-first internal workflow OS for Beenco. The main shell uses a persistent sidebar, global search, quick actions, and a focused content workspace. The revised visual direction is fully dark, compact, and quiet: local Poppins typography, small cards, soft borders, clear pills, long landing-style dashboard sections, and limited accent color.

## Core Views

- Dashboard: daily overview, urgent work, QA status, active projects, notifications.
- My Work List: auto-sorted personal work across assignments, reviews, mentions, stars, due dates, and QA.
- Projects: client/project portfolio with status, priority, progress, team, and dates.
- My Tasks: workflow board with drag and drop status movement.
- Team: member profiles with role, department, workload, and completion counts.
- Review Hub / QA: QA issue tracking and approval flow.
- Figma Work: lightweight Figma metadata, frame specs, ratios, versions, and reviewers.
- Docs: internal guidelines, SOPs, briefs, and client/project notes.
- Files / Deliverables: metadata-first handling for large external files and final packages.
- Reports: minimal workload, QA, delivery, and completion summaries.
- Settings: workspace defaults for departments, task types, reminders, and deletion behavior.

## Reusable Components

- App shell: sidebar, topbar, global search, responsive layout.
- Work components: metric cards, task rows, task cards, kanban columns, detail panel.
- Data labels: status pills, priority badges, tag chips, avatar stacks.
- Workflow components: filter chips, quick actions, activity timeline, empty states.
- Domain components: project cards, team cards, QA cards, Figma cards, doc cards, file rows.

## MVP Interaction Rules

- Task stars are personal to the current user.
- Mentions place tasks into My Work List without changing assignee.
- Completed tasks stay visible in history and can be represented separately.
- Figma and file handling stays lightweight by storing metadata and links only.
- QA follows the delivery flow: Ready for QA, In QA, Changes Required, Rechecking, Approved, Ready for Delivery.
- Global search filters the active view without adding clutter.
