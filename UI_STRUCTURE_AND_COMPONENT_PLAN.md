# BeeFlow UI Structure and Component Plan

BeeFlow is now structured as an interactive internal workflow app instead of a landing page.

## Product Structure

- Role gate: first-time users choose who they are before entering the app.
- Login gate: users enter a name/email and verify a one-time code sent by email.
- Email backend contract: frontend calls `POST /api/auth/send-code` with `{ email, code, name, product }` and `POST /api/auth/verify-code` with `{ email, code }`. Codes must never be shown in the UI.
- Setup checklist: create workspace, add department, invite team, create project, create task.
- App shell: 240px sidebar, 64px topbar, compact content area.
- Empty-first data model: no fake projects, tasks, clients, or team members load by default.
- Local state: workspace data persists in `localStorage` until a backend is added.

## Core Views

- Dashboard: compact metrics and empty states.
- My Work List: assigned, mentioned, starred, review, overdue, due today, and rework tasks.
- Projects: list/board toggle and project creation.
- Tasks: workflow board with status dropdowns.
- Review Hub: QA tabs and QA issue tracking.
- Delivery: approved work and final delivery packages.
- Files: task-level deliverables, metadata, and external links only.
- Docs: internal documentation editor modal.
- Files: external file/deliverable metadata.
- Team: invite team members from empty state.
- Settings: workspace, role, departments, and reset controls.

## Required Interactions

- New Task, New Project, Invite Team, Create Workspace, Create Doc.
- Add File Link, Add Reminder, Add QA Issue.
- Create Delivery, create/manage tags, edit profile.
- Star task, change status, move to QA, mark complete, reopen task, delete task.
- Task drawer with details, comments, mentions, files, reminders, and activity.
- @mention suggestions appear while typing `@` in a comment.

## Visual System

- Palette: black `#000000`, lemon `#D5FF27`, white `#FFFFFF`.
- Supporting surfaces: `#080808`, `#111111`.
- Borders: `rgba(255,255,255,0.08)`.
- Muted text: `rgba(255,255,255,0.55)`.
- No extra color coding, heavy gradients, fake charts, or large marketing hero sections.
