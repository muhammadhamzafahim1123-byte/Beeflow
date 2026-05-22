"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PIPELINE_STAGES, type PipelineStage } from "@/lib/workflow";

type View = "dashboard" | "work" | "inbox" | "projects" | "review" | "delivery" | "docs" | "files" | "team" | "settings";
type Priority = "Low" | "Medium" | "High";
type LeaveType = "medical" | "travel" | "education" | "family" | "personal" | "religious" | "emergency" | "other";
type AttachmentKind = "deliverable" | "brief" | "comment";
type FileItem = { id: string; name: string; type: string; size: number; uploadedAt: string; previewUrl?: string; url?: string; localOnly?: boolean; blobKey?: string; path?: string; kind?: AttachmentKind; uploading?: boolean };
type Member = {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  capacity: number;
  avatarImage?: string;
  profileFocus?: string;
  profileAccess?: string;
  profileAbout?: string;
  goalTitle?: string;
  goalDescription?: string;
  leaveType?: LeaveType;
  leaveFrom?: string;
  leaveTo?: string;
};
type Project = { id: string; name: string; client: string; ownerId: string; xProfile?: string; website?: string; description?: string; audience?: string; logoImage?: string; brandAccent?: string; brandAccentSecondary?: string };
type BrandPalette = { primary: string; secondary: string };
type Activity = { id: string; actor: string; action: string; at: string };
type Comment = { id: string; author: string; text: string; at: string; authorId?: string; attachments?: FileItem[] };
type Subtask = { id: string; label: string; done: boolean };
type InboxItem = { id: string; userId: string; taskId: string; title: string; body: string; read: boolean; createdAt: string };
type Task = {
  id: string;
  projectId: string;
  createdBy: string;
  title: string;
  description: string;
  assigneeId: string;
  reviewerId: string;
  stage: PipelineStage;
  priority: Priority;
  deadline: string;
  attachments: FileItem[];
  briefAttachments: FileItem[];
  subtasks: Subtask[];
  comments: Comment[];
  activity: Activity[];
  rejectionNote?: string;
  qaStamp?: { reviewer: string; at: string };
  deliveredAt?: string;
};
type Store = { setupDismissed: boolean; projects: Project[]; tasks: Task[]; members: Member[]; inbox: InboxItem[] };

const STORAGE_KEY = "beeflow:real-workspace-v2";
const currentUserId = "me";
const reviewerId = currentUserId;
const currentUserFallback: Member = { id: currentUserId, name: "You", role: "Admin", department: "Beenco", avatar: "Y", capacity: 0 };
const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "video/mp4", "application/zip", "application/x-zip-compressed"];
const allowedExtensions = [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".mp4", ".mov", ".zip"];
const maxFileSize = 50 * 1024 * 1024;
const leaveOptions: Array<[LeaveType, string, IconName]> = [
  ["medical", "Medical", "medical"],
  ["travel", "Trip / travel", "plane"],
  ["education", "Education / papers", "education"],
  ["family", "Family", "home"],
  ["personal", "Personal", "user"],
  ["religious", "Religious", "calendarOff"],
  ["emergency", "Emergency", "alertCircle"],
  ["other", "Other", "clock"]
];

const nav: Array<[View, string, IconName]> = [
  ["dashboard", "Dashboard", "layout"],
  ["work", "My Work List", "check"],
  ["inbox", "Inbox", "inbox"],
  ["projects", "Brands", "folder"],
  ["review", "Review Hub", "shield"],
  ["delivery", "Delivery", "delivery"],
  ["docs", "Docs", "fileText"],
  ["files", "Files", "paperclip"],
  ["team", "Team", "users"],
  ["settings", "Settings", "settings"]
];

export default function BeeFlowApp() {
  const [store, setStore] = useState<Store>(seedStore());
  const [hydrated, setHydrated] = useState(false);
  const [view, setView] = useState<View>("dashboard");
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [modal, setModal] = useState<"" | "task" | "editTask" | "project" | "member" | "profile" | "leave">("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingTaskId, setRejectingTaskId] = useState("");
  const [upload, setUpload] = useState({ taskId: "", progress: 0, error: "" });
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [figmaUrl, setFigmaUrl] = useState("");
  const [profileImageDraft, setProfileImageDraft] = useState("");
  const [brandImageDraft, setBrandImageDraft] = useState("");
  const [brandColorDraft, setBrandColorDraft] = useState("");
  const [brandSecondaryColorDraft, setBrandSecondaryColorDraft] = useState("");
  const [leaveDraft, setLeaveDraft] = useState<{ type: LeaveType; from: string; to: string }>({ type: "personal", from: "", to: "" });
  const [leaveDatePicker, setLeaveDatePicker] = useState<"" | "from" | "to">("");
  const [leaveCalendarMonth, setLeaveCalendarMonth] = useState(monthKey(new Date()));
  const [attachmentPanelTaskId, setAttachmentPanelTaskId] = useState("");
  const [commentToolsTaskId, setCommentToolsTaskId] = useState("");
  const [editingComment, setEditingComment] = useState<{ taskId: string; commentId: string } | null>(null);
  const [activityOpen, setActivityOpen] = useState<Record<string, boolean>>({});
  const [selectedAttachment, setSelectedAttachment] = useState<FileItem | null>(null);
  const [confirmDeleteBrandId, setConfirmDeleteBrandId] = useState("");
  const [pendingCommentAttachments, setPendingCommentAttachments] = useState<Record<string, FileItem[]>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const commentInputRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const pendingCommentCaret = useRef<Record<string, number>>({});
  const editCommentRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setStore(normalizeStore(JSON.parse(saved)));
      }
    } catch {
      setStore(seedStore());
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    safePersistStore(store);
  }, [hydrated, store]);

  useEffect(() => {
    if (!hydrated) return;
    const brandsToExtract = store.projects.filter((project) => {
      const src = project.logoImage || brandXAvatarUrl(project);
      return src && (!project.brandAccent || !project.brandAccentSecondary || isWeakBrandAccent(project.brandAccent));
    });
    if (!brandsToExtract.length) return;
    let cancelled = false;
    Promise.all(
      brandsToExtract.map(async (project) => {
        const src = project.logoImage || brandXAvatarUrl(project);
        try {
          const palette = await brandPaletteFromImageSrc(src);
          return palette ? { id: project.id, palette } : { id: project.id, palette: null };
        } catch {
          return { id: project.id, palette: null };
        }
      })
    ).then((items) => {
      if (cancelled) return;
      const paletteById = new Map(items.filter((item) => item.palette).map((item) => [item.id, item.palette as BrandPalette]));
      if (paletteById.size === 0) return;
      setStore((current) => {
        let changed = false;
        const projects = current.projects.map((project) => {
          if (!paletteById.has(project.id)) return project;
          const palette = paletteById.get(project.id);
          if (!palette) return project;
          if (palette.primary === project.brandAccent && palette.secondary === project.brandAccentSecondary) return project;
          changed = true;
          return { ...project, brandAccent: palette.primary, brandAccentSecondary: palette.secondary };
        });
        return changed ? { ...current, projects } : current;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [hydrated, store.projects]);

  useEffect(() => {
    if (!hydrated) return;
    void restoreAttachmentPreviews();
  }, [hydrated]);

  useEffect(() => {
    for (const [taskId, caret] of Object.entries(pendingCommentCaret.current)) {
      const input = commentInputRefs.current[taskId];
      if (!input) continue;
      input.value = commentDrafts[taskId] || input.value;
      input.focus();
      input.setSelectionRange(caret, caret);
      delete pendingCommentCaret.current[taskId];
    }
  }, [commentDrafts]);

  useEffect(() => {
    function closeFloatingUi(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest(".bf-comment-box")) setCommentToolsTaskId("");
      if (!target.closest(".bf-attachment-zone") && !target.closest(".bf-stage-actions")) setAttachmentPanelTaskId("");
      if (!target.closest(".bf-calendar") && !target.closest(".bf-date-field")) setLeaveDatePicker("");
    }
    document.addEventListener("mousedown", closeFloatingUi);
    return () => document.removeEventListener("mousedown", closeFloatingUi);
  }, []);

  const currentUser = member(currentUserId);
  const leavePreviewUser = { ...currentUser, leaveType: leaveDraft.type, leaveFrom: leaveDraft.from, leaveTo: leaveDraft.to };
  const selectedTask = store.tasks.find((task) => task.id === selectedTaskId);
  const unreadCount = store.inbox.filter((item) => item.userId === currentUserId && !item.read).length;
  const reviewTasks = store.tasks.filter((task) => ["In Review", "Changes Required", "Approved"].includes(task.stage));
  const deliveredTasks = store.tasks.filter((task) => ["Ready for Delivery", "Delivered", "Completed"].includes(task.stage));

  return (
    <div className="bf-shell">
      <aside className="bf-sidebar">
        <button className="bf-brand" onClick={() => setView("dashboard")}><Logo /><span><strong>BeeFlow</strong><small>Workflow OS</small></span></button>
        <nav>
          {nav.map(([key, label, icon]) => (
            <button key={key} className={view === key ? "active" : ""} onClick={() => { setView(key); if (key === "projects") setSelectedProjectId(""); }}>
              <Icon name={icon} /> {label}
              {key === "inbox" && unreadCount > 0 ? <b className="bf-nav-badge">{unreadCount}</b> : null}
            </button>
          ))}
        </nav>
        <button className="bf-profile-card" onClick={() => setModal("profile")}><Avatar label={currentUser.avatar} image={currentUser.avatarImage} /><span><strong>{currentUser.name} <LeaveBadge person={currentUser} /></strong><small>{currentUser.role}</small></span></button>
      </aside>
      <main className="bf-main">
        <header className="bf-topbar"><div><h1>{selectedProjectId && view === "projects" ? projectName(selectedProjectId) : nav.find(([key]) => key === view)?.[1]}</h1><p>{store.projects.length ? `${store.projects.length} brands` : "Clean workspace"}</p></div><button className="bf-btn secondary" onClick={() => setModal("project")}><Icon name="folder" /> New Brand</button><button className="bf-btn primary" onClick={() => setModal("task")}><Icon name="plus" /> New Task</button></header>
        {renderView()}
      </main>
      {selectedTask ? TaskDrawer({ task: selectedTask }) : null}
      {modal ? CreateModal() : null}
      {selectedAttachment ? AttachmentViewer({ file: selectedAttachment }) : null}
    </div>
  );

  function renderView() {
    if (view === "dashboard") return Dashboard();
    if (view === "projects") return Projects();
    if (view === "work") return MyTasks();
    if (view === "inbox") return Inbox();
    if (view === "review") return ReviewHub();
    if (view === "delivery") return Page({ title: "Delivery", copy: "Locked delivery history with sign-off stamps.", children: Rows({ tasks: deliveredTasks }) });
    if (view === "files") return Page({ title: "Files", copy: "All task-level deliverables.", children: FileIndex() });
    if (view === "team") return Team();
    if (view === "docs") return Page({ title: "Docs", copy: "Create internal SOPs and notes.", children: EmptyState({ title: "No docs yet.", action: "Create Doc", onAction: () => setErrors({ docs: "Docs editor is next in the MVP queue." }) }) });
    return Settings();
  }

  function Dashboard() {
    const stats = [
      ["Overdue", store.tasks.filter((task) => getDueDateStatus(task.deadline) === "overdue").length, "alertCircle"],
      ["Active", store.tasks.filter((task) => !["Delivered", "Completed"].includes(task.stage)).length, "clock"],
      ["In Review", reviewTasks.length, "shield"],
      ["Approved", store.tasks.filter((task) => task.stage === "Approved").length, "check"],
      ["Delivered", store.tasks.filter((task) => task.stage === "Delivered").length, "send"]
    ] as const;
    return <section className="bf-page">{!store.setupDismissed ? <section className="bf-setup compact"><div><button className="bf-disclosure"><Icon name="chevronDown" /> Workspace setup</button><p>Create a brand, add your team, then create the first task.</p></div><button className="bf-btn secondary" onClick={() => setStore((s) => ({ ...s, setupDismissed: true }))}><Icon name="x" /> Skip</button></section> : null}<div className="bf-stats">{stats.map(([label, value, icon]) => <article key={label} className={label === "Overdue" ? "danger" : ""}><Icon name={icon} /><span>{label}</span><strong>{value}</strong><small>{value ? "Click into work views" : "No items"}</small></article>)}</div>{store.projects.length ? <><div className="bf-viewbar"><div><h2>Core workflow</h2><p>Brief to completion. Every move is gated.</p></div></div>{Board({})}</> : EmptyState({ title: "No brands yet. Create your first brand.", action: "New Brand", onAction: () => setModal("project") })}</section>;
  }

  function Projects() {
    const brand = selectedProjectId ? store.projects.find((project) => project.id === selectedProjectId) : undefined;
    if (brand) return BrandPage({ brand });
    return <section className="bf-page">{store.projects.length ? <><div className="bf-viewbar"><div><h2>Brands</h2><p>Each brand keeps its tasks, collaborators, assets, and workload in one readable place.</p></div><button className="bf-btn secondary" onClick={() => setModal("project")}><Icon name="plus" /> New Brand</button></div><div className="bf-brand-grid">{store.projects.map((project) => BrandCard({ brand: project }))}</div></> : EmptyState({ title: "No brands yet. Create your first brand.", action: "New Brand", onAction: () => setModal("project") })}</section>;
  }

  function BrandCard({ brand }: { brand: Project }) {
    const tasks = store.tasks.filter((task) => task.projectId === brand.id);
    const active = tasks.filter((task) => !["Delivered", "Completed"].includes(task.stage)).length;
    const done = tasks.length ? Math.round((tasks.filter((task) => ["Delivered", "Completed", "Approved"].includes(task.stage)).length / tasks.length) * 100) : 0;
    const collaborators = brandCollaborators(brand.id);
    const confirming = confirmDeleteBrandId === brand.id;
    const brandStyle = brandAccentStyle(brand);
    return (
      <article key={brand.id} className={`bf-brand-card${confirming ? " confirming-delete" : ""}`} style={brandStyle} onClick={() => !confirming && setSelectedProjectId(brand.id)}>
        <span className="bf-brand-card-glow">
          <span className="bf-liquid-blob bf-liquid-blob-1" />
          <span className="bf-liquid-blob bf-liquid-blob-2" />
          <span className="bf-liquid-blob bf-liquid-blob-3" />
        </span>
        <span className="bf-brand-card-top">
          <BrandAvatar brand={brand} />
          <span className="bf-brand-card-actions">
            <span><Icon name="twitter" /> {brandHandle(brand) || "Add X"}</span>
            <button type="button" className="bf-brand-delete" onClick={(event) => { event.stopPropagation(); setConfirmDeleteBrandId(brand.id); }} aria-label={`Delete ${brand.name}`}><Icon name="trash" /></button>
          </span>
        </span>
        <span className="bf-brand-card-body">
          <strong>{brand.name}</strong>
          <small>{brand.description || brand.audience || "Brand workspace for tasks, approvals, assets, and team work."}</small>
        </span>
        <span className="bf-brand-workload"><i style={{ width: `${done}%` }} /><small>{active} active tasks</small><small>{done}% closed</small></span>
        <span className="bf-brand-card-footer">
          <span>{tasks.length} tasks</span>
          <span className="bf-brand-collabs">{collaborators.slice(0, 3).map((person) => <Avatar key={person.id || person.name} label={person.avatar} image={person.avatarImage} />)}{collaborators.length > 3 ? <small>+{collaborators.length - 3}</small> : null}</span>
        </span>
        {confirming ? <span className="bf-brand-delete-confirm" onClick={(event) => event.stopPropagation()}><span className="bf-brand-delete-icon"><Icon name="trash" /></span><strong>Delete {brand.name}?</strong><small>This is permanent. The brand card, all tasks inside it, comments, inbox updates, delivery assets, and brief assets will be removed from this workspace.</small><span><button type="button" className="bf-btn secondary" onClick={() => setConfirmDeleteBrandId("")}>Keep brand</button><button type="button" className="bf-btn reject" onClick={() => deleteBrand(brand.id)}>Delete brand</button></span></span> : null}
      </article>
    );
  }

  function BrandPage({ brand }: { brand: Project }) {
    const tasks = store.tasks.filter((task) => task.projectId === brand.id);
    const active = tasks.filter((task) => !["Delivered", "Completed"].includes(task.stage));
    const delivered = tasks.filter((task) => ["Delivered", "Completed", "Approved"].includes(task.stage));
    const collaborators = brandCollaborators(brand.id);
    const files = tasks.flatMap((task) => [...task.attachments, ...task.briefAttachments].map((file) => ({ ...file, taskTitle: task.title })));
    const workload = tasks.length ? Math.round((delivered.length / tasks.length) * 100) : 0;
    const brandStyle = brandAccentStyle(brand);
    return (
      <section className="bf-page bf-brand-page">
        <div className="bf-viewbar"><div><button type="button" className="bf-backlink" onClick={() => setSelectedProjectId("")}><Icon name="chevronRight" /> Brands</button><h2>{brand.name}</h2><p>{brand.description || "A single brand workspace for work, files, approvals, and collaborators."}</p></div><button className="bf-btn primary" onClick={() => setModal("task")}><Icon name="plus" /> New Task</button></div>
        <section className="bf-brand-hero" style={brandStyle}>
          <span className="bf-brand-hero-glow" />
          <div className="bf-brand-hero-main">
            <BrandAvatar brand={brand} large />
            <div>
              <span className="bf-brand-x"><Icon name="twitter" /> {brandHandle(brand) || "No X profile added"}</span>
              <h3>{brand.name}</h3>
              <p>{brand.audience || brand.client || "Internal brand"}</p>
            </div>
          </div>
          <div className="bf-brand-hero-stats">
            <span><strong>{tasks.length}</strong><small>Total tasks</small></span>
            <span><strong>{active.length}</strong><small>Active</small></span>
            <span><strong>{workload}%</strong><small>Workload closed</small></span>
          </div>
        </section>
        <div className="bf-brand-detail-grid">
          <section className="bf-panel"><div className="bf-panel-head"><h2>Tasks</h2><span>{tasks.length} total</span></div><Rows tasks={tasks} /></section>
          <section className="bf-panel bf-brand-side-panel"><div className="bf-panel-head"><h2>Collaborators</h2><span>{collaborators.length}</span></div>{collaborators.length ? collaborators.map((person) => <article key={person.id || person.name} className="bf-brand-person"><Avatar label={person.avatar} image={person.avatarImage} /><span><strong>{person.name}</strong><small>{person.role}</small></span></article>) : <p className="bf-empty-line">No collaborators yet.</p>}</section>
        </div>
        <section className="bf-panel"><div className="bf-panel-head"><h2>Brand board</h2><span>{active.length} active</span></div><Board projectId={brand.id} /></section>
        <section className="bf-panel"><div className="bf-panel-head"><h2>Assets and references</h2><span>{files.length} files</span></div>{files.length ? <div className="bf-rows">{files.map((file) => <button key={`${file.id}-${file.taskTitle}`}><span>{file.name}</span><span>{file.taskTitle}</span><span>{formatFileSize(file.size)}</span><span>{formatDate(file.uploadedAt.slice(0, 10))}</span></button>)}</div> : <p className="bf-empty-line">No assets attached to this brand yet.</p>}</section>
      </section>
    );
  }

  function BrandAvatar({ brand, large = false }: { brand: Project; large?: boolean }) {
    const src = brand.logoImage || brandXAvatarUrl(brand);
    return <span className={`bf-brand-avatar${large ? " large" : ""}${src ? " has-image" : ""}`}>{src ? <img src={src} alt="" /> : initials(brand.name)}</span>;
  }

  function brandCollaborators(projectId: string) {
    const ids = new Set<string>();
    store.tasks.filter((task) => task.projectId === projectId).forEach((task) => {
      ids.add(task.createdBy);
      ids.add(task.assigneeId);
      ids.add(task.reviewerId);
    });
    return Array.from(ids).map((id) => member(id)).filter((person, index, list) => person.name && list.findIndex((item) => item.name === person.name) === index);
  }

  function brandHandle(brand: Project) {
    return cleanXHandle(brand.xProfile || "");
  }

  function brandXAvatarUrl(brand: Project) {
    const handle = brandHandle(brand);
    return handle ? `https://unavatar.io/x/${encodeURIComponent(handle)}` : "";
  }

  function deleteBrand(brandId: string) {
    const files = store.tasks.filter((task) => task.projectId === brandId).flatMap((task) => [...task.attachments, ...task.briefAttachments, ...task.comments.flatMap((comment) => comment.attachments || [])]);
    files.forEach((file) => {
      if (file.blobKey) void deleteAttachmentBlob(file.blobKey);
    });
    setStore((s) => ({
      ...s,
      projects: s.projects.filter((project) => project.id !== brandId),
      tasks: s.tasks.filter((task) => task.projectId !== brandId),
      inbox: s.inbox.filter((item) => s.tasks.some((task) => task.id === item.taskId && task.projectId !== brandId))
    }));
    setSelectedProjectId("");
    setConfirmDeleteBrandId("");
  }

  function Board({ projectId }: { projectId?: string }) {
    const boardTasks = projectId ? store.tasks.filter((task) => task.projectId === projectId) : store.tasks;
    return <div className="bf-board">{PIPELINE_STAGES.map((stage) => { const tasks = boardTasks.filter((task) => task.stage === stage); return <section className="bf-lane" key={stage}><header><strong>{stage}</strong><span>{tasks.length}</span></header>{tasks.map((task) => <TaskCard key={task.id} task={task} />)}{tasks.length === 0 ? <button className="bf-add-task-ghost" onClick={() => setModal("task")}><Icon name="plus" /> Add task</button> : null}</section>; })}</div>;
  }

  function TaskCard({ task }: { task: Task }) {
    const assignee = member(task.assigneeId);
    const due = getDueDateStatus(task.deadline);
    return <article className={`bf-task urgency-${due}`} onClick={() => setSelectedTaskId(task.id)}><div className="bf-task-head"><strong>{task.title}</strong><span className="bf-avatar-status"><Avatar label={assignee.avatar} image={assignee.avatarImage} /><LeaveBadge person={assignee} /></span></div><p>{task.description ? `${task.description.slice(0, 60)}${task.description.length > 60 ? "..." : ""}` : "No brief yet."}</p><div className="bf-meta"><Priority priority={task.priority} /><span className={`date ${due}`}><i />{formatDate(task.deadline)}</span><span>{task.stage}</span></div><div className="bf-files"><span><Icon name="paperclip" /> {task.attachments.length}</span><span><Icon name="inbox" /> {task.comments.length}</span></div>{task.rejectionNote ? <div className="bf-reject-note">Rejected: {task.rejectionNote}</div> : null}{task.qaStamp ? <div className="bf-qa-stamp">Approved by {task.qaStamp.reviewer}</div> : null}</article>;
  }

  function MyTasks() {
    const mine = store.tasks.filter((task) => task.assigneeId === currentUserId);
    if (!mine.length) return <section className="bf-page"><EmptyState title="No tasks yet. Add your first task." action="New Task" onAction={() => setModal("task")} /></section>;
    const today = new Date().toISOString().slice(0, 10);
    const groups = [
      ["Due today", mine.filter((task) => task.deadline === today)],
      ["Due this week", mine.filter((task) => task.deadline !== today && ["soon", "week"].includes(urgency(task.deadline)))],
      ["Upcoming", mine.filter((task) => urgency(task.deadline) === "normal")],
      ["No date", mine.filter((task) => !task.deadline)]
    ] as const;
    return <section className="bf-page">{groups.map(([label, tasks]) => <section className="bf-panel" key={label}><button className="bf-section-toggle" onClick={() => setCollapsed((c) => ({ ...c, [label]: !c[label] }))}><Icon name={collapsed[label] ? "chevronRight" : "chevronDown"} /><h2>{label}</h2><span>{tasks.length}</span></button>{!collapsed[label] ? <Rows tasks={tasks} /> : null}</section>)}</section>;
  }

  function Inbox() {
    const mine = store.inbox.filter((item) => item.userId === currentUserId);
    if (!mine.length) return <section className="bf-page"><EmptyState title="No inbox updates yet." action="Go to Projects" onAction={() => setView("projects")} /></section>;
    const today = new Date().toISOString().slice(0, 10);
    const groups = [["Today", mine.filter((i) => i.createdAt.slice(0, 10) === today)], ["Past 7 days", mine.filter((i) => i.createdAt.slice(0, 10) !== today)]] as const;
    return <section className="bf-page">{groups.map(([label, items]) => <section className="bf-panel" key={label}><div className="bf-panel-head"><h2>{label}</h2><span>{items.filter((i) => !i.read).length} unread</span></div><div className="bf-inbox-list">{items.map((item) => { const preview = inboxPreview(item); return <button key={item.id} className={item.read ? "" : "unread"} onClick={() => openInbox(item)}><time>{formatInboxDate(item.createdAt)}</time><span><strong>{preview.title}</strong><small>{preview.comment}</small></span></button>; })}</div></section>)}</section>;
  }

  function ReviewHub() {
    return <Page title="Review Hub" copy="QA reviewers approve or reject with mandatory feedback."><div className="bf-review-grid">{reviewTasks.map((task) => <article className="bf-review" key={task.id}><div><strong>{task.title}</strong><p>{projectName(task.projectId)} - <NameWithLeave person={member(task.assigneeId)} /> - <span className={`date-text ${getDueDateStatus(task.deadline)}`}>{formatDate(task.deadline)}</span></p></div><p>{task.description || "No brief yet."}</p><div className="bf-files">{task.attachments.map((file) => <span key={file.id}><Icon name="paperclip" /> {file.name}</span>)}</div><textarea value={rejectingTaskId === task.id ? rejectReason : ""} onChange={(e) => { setRejectingTaskId(task.id); setRejectReason(e.target.value); }} placeholder="Leave QA feedback (required to reject)..." /><div><button className="bf-btn approve" disabled={task.stage !== "In Review"} onClick={() => approveTask(task.id)}><Icon name="check" /> Approve</button><button className="bf-btn reject" disabled={task.stage !== "In Review" || rejectingTaskId !== task.id || !rejectReason.trim()} onClick={() => rejectTask(task.id)}><Icon name="x" /> Changes Required</button></div></article>)}{reviewTasks.length === 0 ? <EmptyState title="No QA items yet." action="Back to Dashboard" onAction={() => setView("dashboard")} /> : null}</div></Page>;
  }

  function Rows({ tasks }: { tasks: Task[] }) {
    return tasks.length ? <div className="bf-rows">{tasks.map((task) => <button key={task.id} onClick={() => setSelectedTaskId(task.id)}><span>{task.title}</span><span>{projectName(task.projectId)}</span><span className={`date-text ${getDueDateStatus(task.deadline)}`}>{formatDate(task.deadline)}</span><span><NameWithLeave person={member(task.assigneeId)} />, <NameWithLeave person={member(task.reviewerId)} /></span><span>{task.stage}</span></button>)}</div> : <EmptyState title="No tasks yet. Add your first task." action="New Task" onAction={() => setModal("task")} />;
  }

  function TaskDrawer({ task }: { task: Task }) {
    const role = taskRole(task);
    const next = nextStage(task);
    return (
      <aside className="bf-drawer">
        <header className="bf-drawer-top">
          <button className="bf-btn secondary" onClick={() => setModal("editTask")}><Icon name="edit" /> Edit task</button>
          <button className="bf-close" onClick={() => setSelectedTaskId("")} aria-label="Close task panel"><Icon name="x" /></button>
        </header>
        <section className="bf-task-title">
          <span>{projectName(task.projectId)}</span>
          <h2>{task.title}</h2>
          <p>{task.description}</p>
        </section>
        <div className="bf-current-stage"><span>{task.stage}</span><div className="bf-stage-actions">{role !== "qa" && next ? <button className={`bf-btn ${next === "Delivered" ? "primary" : "secondary"}`} onClick={() => moveTask(task, next)}><Icon name="arrowRight" /> Move to {next}</button> : null}</div></div>
        <TaskProperties task={task} />
        {role !== "assignee" ? <BriefAttachments task={task} /> : null}
        <Subtasks task={task} />
        {role === "qa" ? <QaDecision task={task} /> : null}
        {Comments({ task })}
        <ActivityLog task={task} />
      </aside>
    );
  }

  function TaskProperties({ task }: { task: Task }) {
    return <section className="bf-task-properties"><label>Created by<strong><NameWithLeave person={member(task.createdBy)} /></strong></label><label>Assignee<strong><NameWithLeave person={member(task.assigneeId)} /></strong></label><label>QA reviewer<strong><NameWithLeave person={member(task.reviewerId)} /></strong></label><label>Deadline<strong className={`date-text ${urgency(task.deadline)}`}>{formatDate(task.deadline)}</strong></label><label>Delivery stamp<strong>{task.deliveredAt ? new Date(task.deliveredAt).toLocaleString() : "Not delivered"}</strong></label><label>Sign-off<strong>{task.qaStamp ? `${task.qaStamp.reviewer} at ${new Date(task.qaStamp.at).toLocaleString()}` : "Pending"}</strong></label></section>;
  }

  function Subtasks({ task }: { task: Task }) {
    const done = task.subtasks.filter((subtask) => subtask.done).length;
    return <section className="bf-drawer-section bf-subtask-section"><header className="bf-section-head"><h3>Subtasks</h3><span>{done}/{task.subtasks.length}</span></header><div className="bf-subtasks">{task.subtasks.map((subtask) => <label className={`bf-subtask ${subtask.done ? "done" : ""}`} key={subtask.id}><input type="checkbox" checked={subtask.done} onChange={() => toggleSubtask(task.id, subtask.id)} /><span><Icon name={subtask.done ? "check" : "clock"} /></span><strong>{subtask.label}</strong></label>)}</div></section>;
  }

  function BriefAttachments({ task }: { task: Task }) {
    const open = attachmentPanelTaskId === `${task.id}:brief`;
    return <section className="bf-drawer-section bf-attachment-zone"><header className="bf-section-head"><h3>Brief assets</h3><button className="bf-icon-btn" type="button" onClick={() => setAttachmentPanelTaskId(open ? "" : `${task.id}:brief`)} aria-label="Add brief asset"><Icon name={open ? "x" : "plus"} /></button></header>{open ? <div className="bf-reveal"><label className="bf-upload" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); void handleUpload(task.id, e.dataTransfer.files[0], "brief"); }}><Icon name="paperclip" /><strong>Add brief asset</strong><small>For content and stakeholder context. These are kept separate from delivery files.</small><input type="file" accept={allowedExtensions.join(",")} onChange={(e) => void handleUpload(task.id, e.target.files?.[0], "brief")} /></label></div> : null}{upload.taskId === `${task.id}:brief` && upload.progress > 0 ? <div className="bf-progress"><i style={{ width: `${upload.progress}%` }} /></div> : null}{upload.taskId === `${task.id}:brief` && upload.error ? <small className="bf-error">{upload.error}</small> : null}<AttachmentGrid taskId={task.id} files={task.briefAttachments} kind="brief" emptyLabel="No brief assets added yet." /></section>;
  }

  function QaDecision({ task }: { task: Task }) {
    return <section className="bf-drawer-section bf-qa-decision"><h3>QA decision</h3><textarea value={rejectingTaskId === task.id ? rejectReason : ""} onChange={(e) => { setRejectingTaskId(task.id); setRejectReason(e.target.value); }} placeholder="Feedback is required before rejecting..." /><div><button className="bf-btn approve" onClick={() => approveTask(task.id)}><Icon name="check" /> Approve</button><button className="bf-btn reject" disabled={rejectingTaskId !== task.id || !rejectReason.trim()} onClick={() => rejectTask(task.id)}><Icon name="x" /> Reject</button></div></section>;
  }

  function AssigneeView({ task }: { task: Task }) {
    return <><section><h3>Subtasks</h3>{task.subtasks.map((subtask) => <label className="bf-check" key={subtask.id}><input type="checkbox" checked={subtask.done} onChange={() => toggleSubtask(task.id, subtask.id)} /> <span>{subtask.label}</span></label>)}</section><UploadBox task={task} />{Comments({ task })}<ActivityLog task={task} /></>;
  }

  function QaView({ task }: { task: Task }) {
    return <><section><h3>Uploaded files</h3><div className="bf-files">{task.attachments.map((file) => <span key={file.id}><Icon name="paperclip" /> {file.name}</span>)}</div></section><section className="bf-qa-actions"><textarea value={rejectingTaskId === task.id ? rejectReason : ""} onChange={(e) => { setRejectingTaskId(task.id); setRejectReason(e.target.value); }} placeholder="Mandatory feedback before rejecting..." /><button className="bf-btn approve" onClick={() => approveTask(task.id)}><Icon name="check" /> Approve</button><button className="bf-btn reject" disabled={rejectingTaskId !== task.id || !rejectReason.trim()} onClick={() => rejectTask(task.id)}><Icon name="x" /> Reject</button></section></>;
  }

  function PmView({ task }: { task: Task }) {
    return <><div className="bf-detail-grid"><label>Created by<strong><NameWithLeave person={member(task.createdBy)} /></strong></label><label>Assignee<strong><NameWithLeave person={member(task.assigneeId)} /></strong></label><label>QA reviewer<strong><NameWithLeave person={member(task.reviewerId)} /></strong></label><label>Deadline<strong className={`date-text ${urgency(task.deadline)}`}>{formatDate(task.deadline)}</strong></label><label>Delivery stamp<strong>{task.deliveredAt ? new Date(task.deliveredAt).toLocaleString() : "Not delivered"}</strong></label><label>Sign-off<strong>{task.qaStamp ? `${task.qaStamp.reviewer} at ${new Date(task.qaStamp.at).toLocaleString()}` : "Pending"}</strong></label></div><UploadBox task={task} />{Comments({ task })}<ActivityLog task={task} /></>;
  }

  function UploadBox({ task }: { task: Task }) {
    const open = attachmentPanelTaskId === task.id;
    return <section className="bf-drawer-section bf-attachment-zone"><header className="bf-section-head"><h3>Delivery assets</h3><button className="bf-icon-btn" type="button" onClick={() => setAttachmentPanelTaskId(open ? "" : task.id)} aria-label="Add delivery asset"><Icon name={open ? "x" : "plus"} /></button></header>{open ? <div className="bf-reveal"><label className="bf-upload" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); void handleUpload(task.id, e.dataTransfer.files[0], "deliverable"); }}><Icon name="upload" /><strong>Drop delivery asset here or choose a file</strong><small>Main delivery files for designer review and handoff.</small><input type="file" accept={allowedExtensions.join(",")} onChange={(e) => void handleUpload(task.id, e.target.files?.[0], "deliverable")} /></label><div className="bf-figma-url"><input value={figmaUrl} onChange={(e) => setFigmaUrl(e.target.value)} placeholder="Paste Figma URL and press Enter" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); attachFigmaUrl(task.id); } }} /></div></div> : null}{upload.taskId === task.id && upload.progress > 0 ? <div className="bf-progress"><i style={{ width: `${upload.progress}%` }} /></div> : null}{upload.taskId === task.id && upload.error ? <small className="bf-error">{upload.error}</small> : null}<AttachmentGrid taskId={task.id} files={task.attachments} kind="deliverable" emptyLabel="No delivery assets added yet." /></section>;
  }

  function AttachmentGrid({ taskId, files, kind, emptyLabel }: { taskId: string; files: FileItem[]; kind: AttachmentKind; emptyLabel: string }) {
    if (!files.length) return <div className="bf-attachment-empty">{emptyLabel}</div>;
    return <div className="bf-attachments">{files.map((file) => <article key={file.id} className={file.previewUrl ? "with-preview" : ""}><button type="button" className="bf-attachment-delete" onClick={() => deleteAttachment(taskId, file, kind)} aria-label={`Delete ${file.name}`}><Icon name="trash" /></button><button type="button" className="bf-attachment-preview" onClick={() => file.url ? window.open(file.url, "_blank", "noreferrer") : setSelectedAttachment(file)}>{file.previewUrl ? <img src={file.previewUrl} alt={file.name} /> : <span className="bf-file-thumb"><Icon name={file.type === "application/x-figma-url" ? "send" : "fileText"} /></span>}</button><div><strong>{file.url ? <a href={file.url} target="_blank" rel="noreferrer">{file.name}</a> : <button type="button" onClick={() => setSelectedAttachment(file)}>{file.name}</button>}</strong><small>{file.type === "application/x-figma-url" ? "Figma link" : `${file.type.split("/").pop()?.toUpperCase() || "FILE"} - ${formatFileSize(file.size)}`}</small></div></article>)}</div>;
  }

  function AttachmentViewer({ file }: { file: FileItem }) {
    const source = file.previewUrl || file.url || "";
    return <div className="bf-modal-backdrop" onMouseDown={() => setSelectedAttachment(null)}><section className="bf-attachment-viewer" onMouseDown={(event) => event.stopPropagation()}><header><div><strong>{file.name}</strong><small>{file.type === "application/x-figma-url" ? "Figma link" : formatFileSize(file.size)}</small></div><button className="bf-close" onClick={() => setSelectedAttachment(null)} aria-label="Close preview"><Icon name="x" /></button></header>{file.type.startsWith("image/") && source ? <img src={source} alt={file.name} /> : file.type.startsWith("video/") && source ? <video src={source} controls /> : <div className="bf-file-large"><Icon name="fileText" /><span>{file.name}</span></div>}<footer>{source ? <a className="bf-btn primary" href={source} download={file.url ? undefined : file.name} target={file.url ? "_blank" : undefined} rel={file.url ? "noreferrer" : undefined}><Icon name="download" /> {file.url ? "Open" : "Download"}</a> : null}</footer></section></div>;
  }

  function Comments({ task }: { task: Task }) {
    const pendingFiles = pendingCommentAttachments[task.id] || [];
    const draft = commentDrafts[task.id] || "";
    const people = mentionOptions(draft);
    return (
      <section className="bf-drawer-section bf-comments">
        <h3>Comments</h3>
        <div className="bf-comment-list">
          {task.comments.length ? task.comments.map((c) => {
            const author = personForActor(c.author, c.authorId);
            return (
              <article className="bf-comment" key={c.id}>
                <Avatar label={author.avatar} image={author.avatarImage} />
                <div>
                  {editingComment?.commentId === c.id ? (
                    <div className="bf-comment-edit">
                      <input defaultValue={c.text} ref={(node) => { editCommentRefs.current[c.id] = node; }} onKeyDown={(e) => { if (e.key === "Enter") saveCommentEdit(task.id, c.id); if (e.key === "Escape") setEditingComment(null); }} autoFocus />
                      <button type="button" className="bf-btn primary" onClick={() => saveCommentEdit(task.id, c.id)}>Save</button>
                    </div>
                  ) : <p><strong>{author.name}</strong><CommentText text={c.text || ""} /></p>}
                  {c.attachments?.length ? <div className="bf-comment-assets">{c.attachments.map((file) => <button key={file.id} type="button" className={file.previewUrl ? "has-image" : ""} onClick={() => file.url ? window.open(file.url, "_blank", "noreferrer") : setSelectedAttachment(file)} aria-label={`Open ${file.name}`}>{file.previewUrl ? <img src={file.previewUrl} alt="" /> : <Icon name="paperclip" />}</button>)}</div> : null}
                  <div className="bf-comment-actions"><button type="button" onClick={() => setEditingComment({ taskId: task.id, commentId: c.id })}>Edit</button><button type="button" onClick={() => deleteComment(task.id, c.id)}>Delete</button></div>
                </div>
              </article>
            );
          }) : <p className="bf-empty-line">No comments yet.</p>}
        </div>
        <div className="bf-comment-box">
          <div className="bf-comment-compose">
            <label className="bf-comment-attach" aria-label="Attach file"><Icon name="paperclip" /><input type="file" multiple onChange={(e) => void addCommentAttachments(task.id, e.currentTarget.files)} /></label>
            <textarea
              className="bf-comment-input"
              defaultValue={draft}
              ref={(node) => { commentInputRefs.current[task.id] = node; }}
              placeholder="Comment with @name or cc @name..."
              onChange={(e) => {
                setCommentToolsTaskId("");
                const value = e.target.value;
                if (hasMentionQuery(value) || hasMentionQuery(draft) || !value) {
                  setCommentDrafts((drafts) => ({ ...drafts, [task.id]: value }));
                }
              }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(task.id); } }}
            />
            <button className="bf-btn primary bf-comment-submit" type="button" onClick={() => submitComment(task.id)}>Comment</button>
          </div>
          {people.length ? <div className="bf-mention-menu" onPointerDown={(event) => handleMentionPointer(event, task.id, people)} onClickCapture={(event) => handleMentionPointer(event, task.id, people)}>{people.map((person, index) => <div className="bf-mention-row" key={person.id || person.name}><div role="button" tabIndex={0} data-index={index} data-mode="mention"><Avatar label={person.avatar} image={person.avatarImage} /><span><strong>{person.name}</strong><small>{person.role || "Team member"}</small></span></div><div role="button" tabIndex={0} className="cc" data-index={index} data-mode="cc">CC</div></div>)}</div> : null}
          {upload.taskId === `${task.id}:comment` && upload.error ? <small className="bf-error bf-comment-error">{upload.error}</small> : null}
          {pendingFiles.length ? <div className="bf-comment-pending" aria-label="Selected attachments waiting to be commented">{pendingFiles.map((file) => <article key={file.id}><button type="button" className="bf-comment-pending-preview" onClick={() => setSelectedAttachment(file)}>{file.previewUrl ? <img src={file.previewUrl} alt="" /> : <Icon name="paperclip" />}</button><span><strong>{file.previewUrl ? "Image ready" : file.name}</strong><small>{file.uploading ? "Preparing..." : "Ready to comment"}</small></span><button type="button" className="bf-comment-pending-remove" onClick={() => removePendingCommentAttachment(task.id, file.id)} aria-label={`Remove ${file.name}`}><Icon name="x" /></button></article>)}</div> : null}
        </div>
      </section>
    );
  }

  function ActivityLog({ task }: { task: Task }) {
    const open = activityOpen[task.id] ?? false;
    return <section className="bf-drawer-section bf-activity-log"><button type="button" className="bf-activity-toggle" onClick={() => setActivityOpen((value) => ({ ...value, [task.id]: !open }))}><span><Icon name={open ? "chevronDown" : "chevronRight"} /> Activity</span><small>{task.activity.length} updates</small></button>{open ? <div className="bf-reveal">{task.activity.length ? task.activity.map((a) => { const actor = personForActor(a.actor); return <p key={a.id} className="bf-activity"><Avatar label={actor.avatar} image={actor.avatarImage} /><strong>{actor.name}</strong><span>{a.action}</span><small>{new Date(a.at).toLocaleString()}</small></p>; }) : <p className="bf-empty-line">No activity yet.</p>}</div> : null}</section>;
  }

  function CommentText({ text }: { text: string }) {
    const parts = text.split(/(@[a-zA-Z]+)/g);
    return <span>{parts.map((part, index) => part.startsWith("@") ? <MentionTag key={`${part}-${index}`} label={part} person={personForMention(part)} /> : part)}</span>;
  }

  function MentionTag({ label, person }: { label: string; person: Member }) {
    return (
      <span className="bf-mentioned-person" tabIndex={0}>
        <mark className="mention">{label}</mark>
        <span className="bf-mention-card" role="tooltip">
          <span className="bf-mention-card-head">
            <Avatar label={person.avatar} image={person.avatarImage} />
            <span>
              <strong>{person.name}</strong>
              <small>{[person.role, person.department].filter(Boolean).join(" - ") || "Team member"}</small>
            </span>
          </span>
          {person.profileAbout ? <span className="bf-mention-card-about">{person.profileAbout}</span> : null}
          <span className="bf-mention-card-meta">
            <span>{person.profileAccess || "BeeFlow teammate"}</span>
            <span>{person.capacity}% capacity</span>
          </span>
          <LeaveBadge person={person} />
        </span>
      </span>
    );
  }

  function CreateModal() {
    const isProfile = modal === "profile";
    const isLeave = modal === "leave";
    const isTaskEditor = modal === "task" || modal === "editTask";
    const editingTask = modal === "editTask" ? selectedTask : undefined;
    const title = modal === "task" ? "Create task" : modal === "editTask" ? "Edit task" : modal === "project" ? "Create brand" : modal === "member" ? "Invite member" : isLeave ? "Set out of office" : "Edit profile";
    const people = [currentUser, ...store.members.filter((person) => person.id !== currentUserId)];
    return (
      <div className="bf-modal-backdrop" onMouseDown={closeModal}>
        <form className={`bf-modal ${isProfile || isLeave ? "bf-profile-modal" : ""}`} onMouseDown={(event) => event.stopPropagation()} onSubmit={isLeave ? saveLeave : isProfile ? saveProfile : modal === "task" ? createTask : modal === "editTask" ? saveTaskEdit : createSimple}>
          <button type="button" className="bf-close" onClick={closeModal}><Icon name="x" /></button>
          <h2>{title}</h2>
          {isTaskEditor ? (
            store.projects.length ? <>
              <Field name="title" label="Task name" defaultValue={editingTask?.title ?? ""} error={errors.title} />
              <label>Brand<select name="projectId" defaultValue={editingTask?.projectId ?? selectedProjectId ?? ""}><option value="">Choose brand</option>{store.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select>{errors.projectId ? <small>{errors.projectId}</small> : null}</label>
              <Field name="taskType" label="Task type" defaultValue="Creative task" />
              <label>Assignee<select name="assigneeId" defaultValue={editingTask?.assigneeId ?? currentUserId}><option value="">Choose assignee</option>{people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>{errors.assigneeId ? <small>{errors.assigneeId}</small> : null}</label>
              <label>Reviewer<select name="reviewerId" defaultValue={editingTask?.reviewerId ?? currentUserId}><option value="">Choose reviewer</option>{people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>{errors.reviewerId ? <small>{errors.reviewerId}</small> : null}</label>
              <label>Deadline<input name="deadline" type="date" defaultValue={editingTask?.deadline ?? ""} />{errors.deadline ? <small>{errors.deadline}</small> : null}</label>
              <label>Priority<select name="priority" defaultValue={editingTask?.priority ?? "Medium"}><option value="">Choose priority</option><option>Low</option><option>Medium</option><option>High</option></select>{errors.priority ? <small>{errors.priority}</small> : null}</label>
              <label>Brief<textarea name="description" placeholder="Write the task brief..." defaultValue={editingTask?.description ?? ""} /></label>
              <label>Brief assets<input name="briefAttachments" type="file" accept={allowedExtensions.join(",")} multiple /><small>Content and stakeholder references only. Delivery files stay in the delivery assets area.</small></label>
              <Field name="tags" label="Tags" />
            </> : <EmptyState title="Create a brand first." action="New Brand" onAction={() => setModal("project")} />
          ) : isLeave ? <>
            <div className="bf-leave-grid"><label>First day<button type="button" className="bf-date-field" onClick={() => openLeaveDatePicker("from")}><span>{leaveDraft.from ? formatFullDate(leaveDraft.from) : "Choose first day"}</span><Icon name="calendarOff" /></button>{errors.leaveFrom ? <small>{errors.leaveFrom}</small> : null}</label><label>Last day<button type="button" className="bf-date-field" onClick={() => openLeaveDatePicker("to")}><span>{leaveDraft.to ? formatFullDate(leaveDraft.to) : "Choose last day"}</span><Icon name="calendarOff" /></button>{errors.leaveTo ? <small>{errors.leaveTo}</small> : null}</label></div>{leaveDatePicker ? <LeaveCalendar /> : null}<label>Issue category<select name="leaveType" value={leaveDraft.type} onChange={(e) => setLeaveDraft((draft) => ({ ...draft, type: e.target.value as LeaveType }))}>{leaveOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><div className="bf-leave-preview"><Avatar label={currentUser.avatar} image={currentUser.avatarImage} /><strong>{currentUser.name}</strong><LeaveBadge person={leavePreviewUser} force /></div><p className="bf-leave-privacy">Only the category and unavailable dates are shown to teammates.</p>
          </> : isProfile ? <>
            <div className="bf-profile-photo-edit"><Avatar label={initials(currentUser.name)} image={profileImageDraft === "__remove__" ? "" : profileImageDraft || currentUser.avatarImage} /><label>Profile picture<input type="file" accept="image/png,image/jpeg,image/webp" onChange={readProfileImage} /></label><button type="button" className="bf-btn secondary" onClick={() => setProfileImageDraft("__remove__")}><Icon name="x" /> Remove photo</button></div><Field name="name" label="Full name" defaultValue={currentUser.name} error={errors.name} /><Field name="role" label="Designation" defaultValue={currentUser.role} error={errors.role} /><Field name="department" label="Department / team" defaultValue={currentUser.department} /><Field name="profileAccess" label="Access / owner label" defaultValue={currentUser.profileAccess ?? "BeeFlow owner"} /><label>About<textarea name="profileAbout" defaultValue={currentUser.profileAbout ?? ""} /></label><Field name="goalTitle" label="Goal title" defaultValue={currentUser.goalTitle ?? ""} /><label>Goal description<textarea name="goalDescription" defaultValue={currentUser.goalDescription ?? ""} /></label>
          </> : modal === "project" ? <BrandFields /> : <Field name="title" label="Member name" error={errors.title} />}
          <div className="bf-modal-actions">{isLeave && currentUser.leaveFrom ? <button type="button" className="bf-btn secondary" onClick={clearLeave}><Icon name="x" /> Clear leave</button> : null}<button type="button" className="bf-btn secondary" onClick={closeModal}><Icon name="x" /> Cancel</button>{isTaskEditor && !store.projects.length ? null : <button className="bf-btn primary"><Icon name="check" /> Save</button>}</div>
        </form>
      </div>
    );
  }

  function Field({ name, label, error, defaultValue }: { name: string; label: string; error?: string; defaultValue?: string }) {
    return <label>{label}<input name={name} defaultValue={defaultValue} />{error ? <small>{error}</small> : null}</label>;
  }

  function BrandFields() {
    return <>
      <div className="bf-brand-photo-edit"><BrandAvatar brand={{ id: "draft", name: "Brand", client: "", ownerId: currentUserId, logoImage: brandImageDraft }} /><label>Brand logo / profile picture<input name="logo" type="file" accept="image/png,image/jpeg,image/webp" onChange={readBrandImage} /></label></div>
      <Field name="title" label="Brand name" error={errors.title} />
      <Field name="xProfile" label="X profile or handle" />
      <Field name="website" label="Website" />
      <Field name="client" label="Client / owner label" defaultValue="Internal" />
      <label>Brand notes<textarea name="description" placeholder="What should the team know about this brand?" /></label>
      <Field name="audience" label="Audience / focus" />
    </>;
  }

  function LeaveCalendar() {
    const days = calendarDays(leaveCalendarMonth);
    return (
      <section className="bf-calendar">
        <header>
          <button type="button" onClick={() => setLeaveCalendarMonth(shiftMonth(leaveCalendarMonth, -1))}><Icon name="chevronRight" /></button>
          <strong>{formatMonth(leaveCalendarMonth)}</strong>
          <button type="button" onClick={() => setLeaveCalendarMonth(shiftMonth(leaveCalendarMonth, 1))}><Icon name="chevronRight" /></button>
        </header>
        <div className="bf-calendar-weekdays">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span key={day}>{day}</span>)}</div>
        <div className="bf-calendar-days">
          {days.map((day) => {
            const selected = day.value === leaveDraft.from || day.value === leaveDraft.to;
            const inRange = Boolean(leaveDraft.from && leaveDraft.to && day.value >= leaveDraft.from && day.value <= leaveDraft.to);
            return <button type="button" key={day.value} className={`${day.inMonth ? "" : "muted"} ${selected ? "selected" : ""} ${inRange ? "range" : ""}`} onClick={() => chooseLeaveDate(day.value)}>{day.label}</button>;
          })}
        </div>
      </section>
    );
  }

  function Team() {
    const teammates = store.members.filter((person) => person.id !== currentUserId);
    return <Page title="Team" copy="Real collaborators only."><div className="bf-team-grid">{teammates.map((p) => <article className="bf-member" key={p.id}><span className="bf-avatar-status"><Avatar label={p.avatar} image={p.avatarImage} /><LeaveBadge person={p} /></span><div><strong><NameWithLeave person={p} /></strong><p>{[p.role, p.department].filter(Boolean).join(" - ")}</p></div><span>{store.tasks.filter((t) => t.assigneeId === p.id && !["Delivered", "Completed"].includes(t.stage)).length} active</span><div className="bf-capacity"><i style={{ width: `${p.capacity}%` }} /></div></article>)}{teammates.length === 0 ? <EmptyState title="No team members yet." action="Add Team Member" onAction={() => setModal("member")} /> : null}</div></Page>;
  }

  function Profile() {
    const activeTasks = store.tasks.filter((t) => t.assigneeId === currentUserId && t.stage !== "Delivered");
    const complete = store.tasks.filter((t) => t.stage === "Delivered" && t.assigneeId === currentUserId).length;
    const onTimeRate = complete ? Math.round((store.tasks.filter((t) => t.stage === "Delivered" && t.assigneeId === currentUserId && (!t.deadline || !t.deliveredAt || t.deliveredAt.slice(0, 10) <= t.deadline)).length / complete) * 100) : 0;
    const recentProjects = store.projects.filter((project) => store.tasks.some((task) => task.projectId === project.id && task.assigneeId === currentUserId));
    const collaborators = store.members.filter((person) => person.id !== currentUserId);
    return (
      <section className="bf-page bf-profile-page">
        <section className="bf-profile-hero">
          <div className="bf-profile-avatar-wrap"><Avatar label={initials(currentUser.name)} image={currentUser.avatarImage} /></div>
          <div className="bf-profile-identity">
            <h2>{currentUser.name}</h2>
            <button className="bf-leave-trigger" onClick={openLeaveModal}><Icon name="calendarOff" /> Set leaves <LeaveBadge person={currentUser} /></button>
            <div className="bf-profile-tags">{[currentUser.role, currentUser.department, currentUser.profileAccess].filter(Boolean).map((item) => <span key={item}>{item}</span>)}</div>
            {currentUser.profileAbout ? <p className="bf-profile-about">{currentUser.profileAbout}</p> : null}
            <button className="bf-btn primary" onClick={() => setModal("profile")}>Edit profile</button>
          </div>
          <aside className="bf-profile-kpis">
            <span><strong>{activeTasks.length}</strong><small>Active</small></span>
            <span><strong>{onTimeRate}%</strong><small>On-time</small></span>
            <span><strong>{complete}</strong><small>Delivered</small></span>
          </aside>
        </section>

        <div className="bf-profile-grid">
          <div className="bf-profile-main">
            <section className="bf-profile-panel bf-profile-tasks">
              <header><h3>My tasks <Icon name="lock" /></h3><button className="bf-btn secondary" onClick={() => setView("work")}>View all tasks</button></header>
              <div>
                {activeTasks.slice(0, 4).map((task) => (
                  <button key={task.id} onClick={() => setSelectedTaskId(task.id)}>
                    <span><Icon name="check" /> {task.title}</span>
                    <strong><i />{task.stage}</strong>
                    <small className={`date-text ${urgency(task.deadline)}`}>{formatDate(task.deadline)}</small>
                  </button>
                ))}
                {activeTasks.length === 0 ? <p className="bf-profile-empty">No active tasks right now.</p> : null}
              </div>
            </section>

            <section className="bf-profile-panel bf-profile-projects">
              <header><h3>My recent projects</h3></header>
              <div>
                {recentProjects.map((project) => (
                  <button key={project.id} onClick={() => setView("projects")}>
                    <Icon name="folder" />
                    <span>{project.name}</span>
                    <small>{store.tasks.filter((task) => task.projectId === project.id).length} tasks</small>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <aside className="bf-profile-side">
            <section className="bf-profile-panel bf-profile-collabs">
              <header><h3>Frequent collaborators <Icon name="lock" /></h3></header>
              <button className="bf-invite" onClick={() => setModal("member")}><span><Icon name="plus" /></span>Invite teammates</button>
              <div>
                {collaborators.map((person) => (
                  <article key={person.id}><span className="bf-avatar-status"><Avatar label={person.avatar} image={person.avatarImage} /><LeaveBadge person={person} /></span><span><strong><NameWithLeave person={person} /></strong><small>{person.role}</small></span></article>
                ))}
              </div>
            </section>

            <section className="bf-profile-panel bf-profile-goals">
              <header><h3>My goals <Icon name="lock" /></h3><button className="bf-btn secondary" onClick={() => setModal("profile")}>Create goal</button></header>
              {currentUser.goalTitle ? <p>{currentUser.goalTitle}</p> : null}
              {currentUser.goalDescription ? <small>{currentUser.goalDescription}</small> : null}
              <div className="bf-goal-bars"><i /><b /></div>
            </section>
          </aside>
        </div>
      </section>
    );
  }

  function FileIndex() {
    const files = store.tasks.flatMap((task) => task.attachments.map((file) => ({ ...file, taskTitle: task.title })));
    return files.length ? <div className="bf-rows">{files.map((file) => <button key={file.id}><span>{file.name}</span><span>{file.taskTitle}</span><span>{Math.round(file.size / 1024)}KB</span><span>{formatDate(file.uploadedAt.slice(0, 10))}</span></button>)}</div> : <EmptyState title="No files uploaded yet." action="New Task" onAction={() => setModal("task")} />;
  }

  function Page({ title, copy, children }: { title: string; copy: string; children: React.ReactNode }) {
    return <section className="bf-page"><div className="bf-viewbar"><div><h2>{title}</h2><p>{copy}</p></div></div>{children}</section>;
  }

  function Settings() {
    return <Page title="Settings" copy="Workspace controls."><div className="bf-panel"><div className="bf-panel-head"><h2>Workflow</h2><span>{PIPELINE_STAGES.join(" -> ")}</span></div><div className="bf-modal-actions"><button className="bf-btn secondary" onClick={() => setStore(seedStore())}><Icon name="x" /> Reset workspace</button><button className="bf-btn secondary" onClick={() => setStore(demoStore())}><Icon name="folder" /> Load demo workspace</button></div></div></Page>;
  }

  function EmptyState({ title, action, onAction }: { title: string; action: string; onAction: () => void }) {
    return <div className="bf-empty"><strong>{title}</strong><button type="button" className="bf-btn primary" onClick={onAction}><Icon name="plus" /> {action}</button></div>;
  }

  async function createTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const taskId = crypto.randomUUID();
    const title = String(data.get("title") || "").trim();
    const deadline = String(data.get("deadline") || "");
    const nextErrors = {
      projectId: !data.get("projectId") ? "Project is required." : "",
      title: title.length < 3 ? "Title must be at least 3 characters." : "",
      assigneeId: "",
      reviewerId: "",
      deadline: deadline && new Date(deadline) <= new Date(new Date().toDateString()) ? "Deadline must be a future date." : "",
      priority: ""
    };
    setErrors(Object.fromEntries(Object.entries(nextErrors).filter(([, v]) => v)));
    if (Object.values(nextErrors).some(Boolean)) return;
    const task: Task = {
      id: taskId,
      projectId: String(data.get("projectId")),
      createdBy: currentUserId,
      title,
      description: String(data.get("description") || "").trim(),
      assigneeId: String(data.get("assigneeId") || currentUserId),
      reviewerId: String(data.get("reviewerId") || currentUserId),
      stage: "Brief",
      priority: String(data.get("priority") || "Medium") as Priority,
      deadline,
      attachments: [],
      briefAttachments: await prepareAttachments(data.getAll("briefAttachments"), taskId, "brief"),
      subtasks: makeSubtasks(),
      comments: [],
      activity: [activity("created task")]
    };
    setStore((s) => ({ ...s, tasks: [task, ...s.tasks], inbox: [inbox(task.assigneeId, task.id, "New task assigned", `${task.title} was assigned to you.`), ...s.inbox] }));
    setModal("");
    setErrors({});
  }

  async function saveTaskEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const task = selectedTask;
    if (!task) return closeModal();
    const data = new FormData(e.currentTarget);
    const title = String(data.get("title") || "").trim();
    const deadline = String(data.get("deadline") || "");
    const nextErrors = {
      projectId: !data.get("projectId") ? "Project is required." : "",
      title: title.length < 3 ? "Title must be at least 3 characters." : "",
      deadline: deadline && new Date(deadline) <= new Date(new Date().toDateString()) ? "Deadline must be a future date." : ""
    };
    setErrors(Object.fromEntries(Object.entries(nextErrors).filter(([, v]) => v)));
    if (Object.values(nextErrors).some(Boolean)) return;

    const patch = {
      title,
      projectId: String(data.get("projectId")),
      description: String(data.get("description") || "").trim(),
      assigneeId: String(data.get("assigneeId") || currentUserId),
      reviewerId: String(data.get("reviewerId") || currentUserId),
      priority: String(data.get("priority") || "Medium") as Priority,
      deadline
    };
    const newBriefAttachments = await prepareAttachments(data.getAll("briefAttachments"), task.id, "brief");
    const changes = describeTaskChanges(task, patch);
    patchTask(task.id, {
      ...patch,
      briefAttachments: newBriefAttachments.length ? [...task.briefAttachments, ...newBriefAttachments] : task.briefAttachments,
      activity: changes.reduce((items, change) => addActivity(items, change), task.activity)
    });
    setErrors({});
    setModal("");
  }

  function createSimple(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = String(data.get("title") || "").trim();
    if (title.length < 3) return setErrors({ title: "Minimum 3 characters." });
    const brandId = crypto.randomUUID();
    setStore((s) => modal === "project" ? { ...s, projects: [...s.projects, { id: brandId, name: title, client: String(data.get("client") || "Internal").trim() || "Internal", ownerId: currentUserId, xProfile: String(data.get("xProfile") || "").trim(), website: String(data.get("website") || "").trim(), description: String(data.get("description") || "").trim(), audience: String(data.get("audience") || "").trim(), logoImage: brandImageDraft, brandAccent: brandColorDraft, brandAccentSecondary: brandSecondaryColorDraft }] } : { ...s, members: [...s.members, { id: crypto.randomUUID(), name: title, role: "Designer", department: "Creative", avatar: initials(title), capacity: 35 }] });
    if (modal === "project") {
      setView("projects");
      setSelectedProjectId(brandId);
    }
    setBrandImageDraft("");
    setBrandColorDraft("");
    setBrandSecondaryColorDraft("");
    setModal("");
  }

  function closeModal() {
    setModal("");
    setErrors({});
    setProfileImageDraft("");
    setBrandImageDraft("");
    setBrandColorDraft("");
    setBrandSecondaryColorDraft("");
    setLeaveDatePicker("");
  }

  function openLeaveModal() {
    const from = cleanLeaveDate(currentUser.leaveFrom);
    const to = cleanLeaveDate(currentUser.leaveTo);
    setLeaveDraft({
      type: currentUser.leaveType || "personal",
      from,
      to
    });
    setLeaveCalendarMonth(monthKey(from ? parseLocalDate(from) : new Date()));
    setLeaveDatePicker("");
    setErrors({});
    setModal("leave");
  }

  function openLeaveDatePicker(field: "from" | "to") {
    setLeaveDatePicker(field);
    const active = field === "from" ? leaveDraft.from : leaveDraft.to;
    setLeaveCalendarMonth(monthKey(active ? parseLocalDate(active) : new Date()));
  }

  function chooseLeaveDate(value: string) {
    const safeValue = cleanLeaveDate(value) || toDateKey(new Date());
    setLeaveDraft((draft) => {
      if (leaveDatePicker === "from") {
        return { ...draft, from: safeValue, to: draft.to && draft.to < safeValue ? safeValue : draft.to };
      }
      return { ...draft, to: safeValue, from: draft.from && draft.from > safeValue ? safeValue : draft.from };
    });
    setErrors({});
    setLeaveDatePicker("");
  }

  async function readProfileImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors({ profileImage: "Choose an image file." });
      return;
    }
    setProfileImageDraft(await makeProfileAvatarDataUrl(file));
    setErrors({});
  }

  async function readBrandImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors({ brandImage: "Choose an image file." });
      return;
    }
    const [image, palette] = await Promise.all([makeProfileAvatarDataUrl(file), brandPaletteFromFile(file)]);
    setBrandImageDraft(image);
    setBrandColorDraft(palette?.primary || "");
    setBrandSecondaryColorDraft(palette?.secondary || "");
    setErrors({});
  }

  function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") || "").trim();
    const role = String(data.get("role") || "").trim();
    if (name.length < 2 || role.length < 2) {
      setErrors({ name: name.length < 2 ? "Name is required." : "", role: role.length < 2 ? "Designation is required." : "" });
      return;
    }
    setStore((s) => ({
      ...s,
      members: upsertCurrentUser(s.members, {
        name,
        role,
        department: String(data.get("department") || "").trim(),
        avatar: initials(name),
        avatarImage: profileImageDraft === "__remove__" ? "" : profileImageDraft || currentUser.avatarImage,
        profileAccess: String(data.get("profileAccess") || "").trim(),
        profileAbout: String(data.get("profileAbout") || "").trim(),
        goalTitle: String(data.get("goalTitle") || "").trim(),
        goalDescription: String(data.get("goalDescription") || "").trim()
      })
    }));
    setProfileImageDraft("");
    setErrors({});
    setModal("");
  }

  function saveLeave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const leaveFrom = cleanLeaveDate(leaveDraft.from);
    const leaveTo = cleanLeaveDate(leaveDraft.to);
    if (!leaveFrom || !leaveTo || leaveTo < leaveFrom) {
      setErrors({
        leaveFrom: !leaveFrom ? "First day is required." : "",
        leaveTo: !leaveTo ? "Last day is required." : leaveTo < leaveFrom ? "Last day must be after first day." : ""
      });
      return;
    }
    setStore((s) => ({
      ...s,
      members: upsertCurrentUser(s.members, {
        leaveFrom,
        leaveTo,
        leaveType: String(data.get("leaveType") || "personal") as LeaveType
      })
    }));
    setErrors({});
    setModal("");
  }

  function clearLeave() {
    setStore((s) => ({
      ...s,
      members: upsertCurrentUser(s.members, { leaveFrom: "", leaveTo: "", leaveType: undefined })
    }));
    setErrors({});
    setModal("");
  }

  async function moveTask(task: Task, to: PipelineStage) {
    const reviewerName = to === "Approved" ? member(task.reviewerId).name : "";
    const response = await fetch("/api/tasks/transition", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ from: task.stage, to, attachmentCount: task.attachments.length, reviewerName, hasBrief: Boolean(task.description.trim()), hasApproval: Boolean(task.qaStamp), hasDeliveryConfirmation: Boolean(task.deliveredAt) }) });
    const result = await response.json();
    if (!result.ok) return patchTask(task.id, { activity: addActivity(task.activity, result.message) });
    patchTask(task.id, { stage: to, deliveredAt: to === "Delivered" ? new Date().toISOString() : task.deliveredAt, activity: addActivity(task.activity, `changed status to ${to}`) });
    if (to === "In Review") notify(task.reviewerId, task.id, "Task ready for QA", `${task.title} is ready for review.`);
  }

  async function handleUpload(taskId: string, file?: File, kind: AttachmentKind = "deliverable") {
    if (!file) return;
    const uploadId = kind === "brief" ? `${taskId}:brief` : taskId;
    if (!isAllowedUpload(file)) return setUpload({ taskId: uploadId, progress: 0, error: "Supported files: PDF, PNG, JPG, WEBP, GIF, MP4, MOV, ZIP, Figma URL." });
    if (file.size > maxFileSize) return setUpload({ taskId: uploadId, progress: 0, error: "File must be 50MB or smaller." });
    setUpload({ taskId: uploadId, progress: 30, error: "" });
    const attachedFile = await prepareAttachment(file, taskId, kind);
    setUpload({ taskId: uploadId, progress: 85, error: "" });
    setUpload({ taskId: uploadId, progress: 100, error: "" });
    addAttachment(taskId, attachedFile, kind, kind === "brief" ? `added brief asset ${file.name}` : `added delivery asset ${file.name}`);
    setAttachmentPanelTaskId("");
    setTimeout(() => setUpload({ taskId: "", progress: 0, error: "" }), 600);
  }

  function attachFigmaUrl(taskId: string) {
    if (!/^https:\/\/(www\.)?figma\.com\//.test(figmaUrl.trim())) return setUpload({ taskId, progress: 0, error: "Paste a valid Figma URL." });
    addAttachment(taskId, { id: crypto.randomUUID(), name: "Figma URL", type: "application/x-figma-url", size: 0, uploadedAt: new Date().toISOString(), url: figmaUrl.trim(), kind: "deliverable", path: `deliverables/${taskId}/figma-url` }, "deliverable", "added delivery Figma asset");
    setFigmaUrl("");
  }

  function addAttachment(taskId: string, file: FileItem, kind: AttachmentKind, action: string) {
    setStore((s) => ({ ...s, tasks: s.tasks.map((t) => t.id === taskId ? { ...t, attachments: kind === "deliverable" ? [...t.attachments, file] : t.attachments, briefAttachments: kind === "brief" ? [...t.briefAttachments, file] : t.briefAttachments, activity: addActivity(t.activity, action) } : t) }));
  }

  function deleteAttachment(taskId: string, file: FileItem, kind: AttachmentKind) {
    if (!taskId) return;
    if (!window.confirm(`Remove ${file.name}?`)) return;
    if (file.blobKey) void deleteAttachmentBlob(file.blobKey);
    setStore((s) => ({ ...s, tasks: s.tasks.map((task) => task.id === taskId ? { ...task, attachments: kind === "deliverable" ? task.attachments.filter((item) => item.id !== file.id) : task.attachments, briefAttachments: kind === "brief" ? task.briefAttachments.filter((item) => item.id !== file.id) : task.briefAttachments, activity: addActivity(task.activity, `removed ${file.name}`) } : task) }));
    if (selectedAttachment?.id === file.id) setSelectedAttachment(null);
  }

  async function restoreAttachmentPreviews() {
    const restored: Record<string, string> = {};
    for (const task of store.tasks) {
      for (const file of [...task.attachments, ...task.briefAttachments, ...task.comments.flatMap((comment) => comment.attachments || [])]) {
        if (!file.previewUrl && file.blobKey && isPreviewableFile(file)) {
          const blob = await getAttachmentBlob(file.blobKey);
          if (blob) restored[file.id] = URL.createObjectURL(blob);
        }
      }
    }
    if (!Object.keys(restored).length) return;
    setStore((s) => ({
      ...s,
      tasks: s.tasks.map((task) => ({
        ...task,
        attachments: task.attachments.map((file) => restored[file.id] ? { ...file, previewUrl: restored[file.id] } : file),
        briefAttachments: task.briefAttachments.map((file) => restored[file.id] ? { ...file, previewUrl: restored[file.id] } : file),
        comments: task.comments.map((comment) => ({ ...comment, attachments: comment.attachments?.map((file) => restored[file.id] ? { ...file, previewUrl: restored[file.id] } : file) }))
      }))
    }));
  }

  function approveTask(taskId: string) {
    const task = store.tasks.find((t) => t.id === taskId);
    if (!task) return;
    if (task.stage !== "In Review") return patchTask(taskId, { activity: addActivity(task.activity, "Task must be in review before approval.") });
    patchTask(taskId, { stage: "Approved", qaStamp: { reviewer: currentUser.name, at: new Date().toISOString() }, rejectionNote: "", activity: addActivity(task.activity, "QA approved") });
    notify(task.assigneeId, task.id, "QA approved", `${task.title} was approved by ${currentUser.name}.`);
  }

  function rejectTask(taskId: string) {
    const task = store.tasks.find((t) => t.id === taskId);
    if (!task || !rejectReason.trim()) return setRejectingTaskId(taskId);
    patchTask(taskId, { stage: "Changes Required", rejectionNote: rejectReason.trim(), activity: addActivity(task.activity, `Changes required: ${rejectReason.trim()}`) });
    notify(task.assigneeId, task.id, "QA rejected", rejectReason.trim());
    setRejectReason("");
  }

  function toggleSubtask(taskId: string, subtaskId: string) {
    const task = store.tasks.find((t) => t.id === taskId);
    if (!task) return;
    const subtask = task.subtasks.find((item) => item.id === subtaskId);
    const nextDone = !subtask?.done;
    patchTask(taskId, { subtasks: task.subtasks.map((s) => s.id === subtaskId ? { ...s, done: nextDone } : s), activity: addActivity(task.activity, `${nextDone ? "completed" : "reopened"} subtask: ${subtask?.label || "Subtask"}`) });
  }

  function submitComment(taskId: string) {
    const input = commentInputRefs.current[taskId];
    const text = (input?.value || commentDrafts[taskId] || "").trim();
    const attachments = pendingCommentAttachments[taskId] || [];
    const task = store.tasks.find((t) => t.id === taskId);
    if ((!text && !attachments.length) || !task) return;
    const mentions = store.members.filter((m) => text.toLowerCase().includes(`@${m.name.toLowerCase().split(" ")[0]}`));
    setStore((s) => ({ ...s, tasks: s.tasks.map((t) => t.id === taskId ? { ...t, comments: [...t.comments, { id: crypto.randomUUID(), author: currentUser.name, authorId: currentUserId, text, attachments, at: new Date().toISOString() }], activity: addActivity(t.activity, attachments.length ? "added a comment attachment" : "added a comment") } : t), inbox: [...mentions.map((m) => inbox(m.id, taskId, task.title, text)), ...s.inbox] }));
    if (input) input.value = "";
    setCommentDrafts((value) => ({ ...value, [taskId]: "" }));
    setPendingCommentAttachments((value) => ({ ...value, [taskId]: [] }));
  }

  async function addCommentAttachments(taskId: string, fileList: FileList | null) {
    const files = fileList ? Array.from(fileList).filter((file) => file.size <= maxFileSize) : [];
    if (fileList?.length && !files.length) setUpload({ taskId: `${taskId}:comment`, progress: 0, error: "Attachment must be 50MB or smaller." });
    if (!files.length) return;
    setUpload({ taskId: "", progress: 0, error: "" });
    const drafts = files.map((file) => makePendingCommentAttachment(file, taskId));
    setPendingCommentAttachments((value) => ({ ...value, [taskId]: [...(value[taskId] || []), ...drafts] }));
    setCommentToolsTaskId("");
    void Promise.all(files.map((file, index) => saveAttachmentBlob(drafts[index].blobKey || "", file))).then(() => {
      setPendingCommentAttachments((value) => ({
        ...value,
        [taskId]: (value[taskId] || []).map((item) => drafts.some((draft) => draft.id === item.id) ? { ...item, uploading: false } : item)
      }));
    });
  }

  function removePendingCommentAttachment(taskId: string, fileId: string) {
    const file = pendingCommentAttachments[taskId]?.find((item) => item.id === fileId);
    if (file?.blobKey) void deleteAttachmentBlob(file.blobKey);
    setPendingCommentAttachments((value) => ({ ...value, [taskId]: (value[taskId] || []).filter((item) => item.id !== fileId) }));
  }

  function saveCommentEdit(taskId: string, commentId: string) {
    const task = store.tasks.find((t) => t.id === taskId);
    const text = editCommentRefs.current[commentId]?.value.trim() || "";
    if (!task || !text) return;
    setStore((s) => ({ ...s, tasks: s.tasks.map((t) => t.id === taskId ? { ...t, comments: t.comments.map((comment) => comment.id === commentId ? { ...comment, text } : comment), activity: addActivity(t.activity, "edited a comment") } : t) }));
    setEditingComment(null);
  }

  function deleteComment(taskId: string, commentId: string) {
    const task = store.tasks.find((t) => t.id === taskId);
    task?.comments.find((comment) => comment.id === commentId)?.attachments?.forEach((file) => {
      if (file.blobKey) void deleteAttachmentBlob(file.blobKey);
    });
    setStore((s) => ({ ...s, tasks: s.tasks.map((t) => t.id === taskId ? { ...t, comments: t.comments.filter((comment) => comment.id !== commentId), activity: addActivity(t.activity, "deleted a comment") } : t) }));
  }

  function applyCommentTool(taskId: string, tool: "attachment" | "mention" | "cc" | "link") {
    if (tool === "attachment") {
      setCommentToolsTaskId("");
      return;
    }
    const additions = {
      mention: " @",
      cc: " cc @",
      link: " https://"
    };
    appendCommentText(taskId, additions[tool]);
    setCommentToolsTaskId("");
  }

  function insertMention(taskId: string, person: Member, mode: "mention" | "cc" = "mention") {
    const input = commentInputRefs.current[taskId];
    if (!input) return;
    const value = replaceMentionQuery(input.value || commentDrafts[taskId] || "", person, mode);
    input.value = value;
    pendingCommentCaret.current[taskId] = value.length;
    setCommentDrafts((drafts) => ({ ...drafts, [taskId]: value }));
  }

  function handleMentionPointer(event: React.PointerEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>, taskId: string, people: Member[]) {
    const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-index][data-mode]") : null;
    if (!target) return;
    event.preventDefault();
    const person = people[Number(target.dataset.index)];
    if (!person) return;
    insertMention(taskId, person, target.dataset.mode === "cc" ? "cc" : "mention");
  }

  function appendCommentText(taskId: string, value: string) {
    const input = commentInputRefs.current[taskId];
    if (!input) return;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const nextValue = `${input.value.slice(0, start)}${value}${input.value.slice(end)}`;
    input.value = nextValue;
    setCommentDrafts((drafts) => ({ ...drafts, [taskId]: nextValue }));
    const caret = start + value.length;
    pendingCommentCaret.current[taskId] = caret;
    input.focus();
    input.setSelectionRange(caret, caret);
  }

  function openInbox(item: InboxItem) {
    setStore((s) => ({ ...s, inbox: s.inbox.map((i) => i.id === item.id ? { ...i, read: true } : i) }));
    setSelectedTaskId(item.taskId);
  }

  function patchTask(taskId: string, patch: Partial<Task>) {
    setStore((s) => ({ ...s, tasks: s.tasks.map((t) => t.id === taskId ? { ...t, ...patch } : t) }));
  }

  function notify(userId: string, taskId: string, title: string, body: string) {
    setStore((s) => ({ ...s, inbox: [inbox(userId, taskId, title, body), ...s.inbox] }));
  }

  function inboxPreview(item: InboxItem) {
    const task = store.tasks.find((candidate) => candidate.id === item.taskId);
    const latestComment = task?.comments[task.comments.length - 1];
    return {
      title: task?.title || item.title,
      comment: latestComment?.text ? `${latestComment.author}: ${latestComment.text}` : item.body
    };
  }

  function taskRole(task: Task) {
    if (task.reviewerId === currentUserId && task.stage === "In Review") return "qa";
    if (task.assigneeId === currentUserId && task.createdBy !== currentUserId) return "assignee";
    return "pm";
  }

  function member(id: string) {
    const saved = store.members.find((m) => m.id === id);
    if (id === currentUserId) return saved || currentUserFallback;
    return saved || { ...currentUserFallback, id: "", name: "Unassigned", avatar: "U", role: "Viewer" };
  }

  function personForActor(name: string, id?: string) {
    if (id) return member(id);
    const normalized = name.trim().toLowerCase();
    if (normalized === currentUser.name.toLowerCase() || normalized === currentUserFallback.name.toLowerCase()) return currentUser;
    const saved = store.members.find((person) => person.name.toLowerCase() === normalized);
    return saved || { ...currentUserFallback, id: "", name, avatar: initials(name), avatarImage: undefined };
  }

  function personForMention(label: string) {
    const token = label.replace(/^@/, "").toLowerCase();
    const people = [currentUser, ...store.members.filter((person) => person.id !== currentUserId)];
    return people.find((person) => {
      const firstName = person.name.split(/\s+/)[0]?.toLowerCase();
      return firstName === token || person.name.toLowerCase() === token;
    }) || { ...currentUserFallback, id: "", name: label, avatar: initials(label), role: "Team member", department: "" };
  }

  function projectName(id: string) {
    return store.projects.find((p) => p.id === id)?.name || "Project";
  }

  function describeTaskChanges(task: Task, patch: Pick<Task, "title" | "projectId" | "description" | "assigneeId" | "reviewerId" | "priority" | "deadline">) {
    const changes: string[] = [];
    if (task.title !== patch.title) changes.push(`updated task name from "${task.title}" to "${patch.title}"`);
    if (task.projectId !== patch.projectId) changes.push(`moved task from ${projectName(task.projectId)} to ${projectName(patch.projectId)}`);
    if (task.description !== patch.description) changes.push("updated brief");
    if (task.assigneeId !== patch.assigneeId) changes.push(`changed assignee from ${member(task.assigneeId).name} to ${member(patch.assigneeId).name}`);
    if (task.reviewerId !== patch.reviewerId) changes.push(`changed QA reviewer from ${member(task.reviewerId).name} to ${member(patch.reviewerId).name}`);
    if (task.priority !== patch.priority) changes.push(`changed priority from ${task.priority} to ${patch.priority}`);
    if (task.deadline !== patch.deadline) changes.push(`changed deadline from ${formatDate(task.deadline)} to ${formatDate(patch.deadline)}`);
    return changes.length ? changes : ["saved task with no field changes"];
  }

  function mentionOptions(value: string) {
    const match = value.match(/(?:^|\s)(?:cc\s+)?@([a-zA-Z]*)$/i);
    if (!match) return [];
    const query = match[1].toLowerCase();
    const people = [currentUser, ...store.members.filter((person) => person.id !== currentUserId)];
    return people.filter((person) => !query || person.name.toLowerCase().includes(query) || person.role.toLowerCase().includes(query)).slice(0, 7);
  }
}

function seedStore(): Store {
  return { setupDismissed: false, projects: [], members: [], tasks: [], inbox: [] };
}

function demoStore(): Store {
  const now = new Date();
  const date = (days: number) => new Date(now.getTime() + days * 86400000).toISOString().slice(0, 10);
  const members: Member[] = [
    { id: "designer", name: "Demo Designer", role: "Designer", department: "Creative", avatar: "DD", capacity: 64 },
    { id: "reviewer", name: "Demo Reviewer", role: "QA Reviewer", department: "QA", avatar: "DR", capacity: 42 }
  ];
  const project: Project = { id: "demo-project", name: "Demo Workspace Project", client: "Internal", ownerId: "me" };
  const tasks = [
    makeTask("demo-task-1", project.id, "Demo brief task", "A sample brief for checking the workflow.", "me", "designer", "reviewer", "Brief", "High", date(2), []),
    makeTask("demo-task-2", project.id, "Demo review task", "A sample task already waiting for review.", "me", "designer", "reviewer", "In Review", "High", date(1), [])
  ];
  return { setupDismissed: false, projects: [project], members, tasks, inbox: [] };
}

function normalizeStore(value: Partial<Store>): Store {
  const seeded = seedStore();
  const projects = value.projects || [];
  const tasks = value.tasks || [];
  const members = value.members || [];
  return {
    setupDismissed: Boolean(value.setupDismissed),
    projects: projects.length ? projects.map((project) => normalizeProject(project)) : seeded.projects,
    members: members.length ? members.map((person) => normalizeMember(person)) : seeded.members,
    inbox: Array.isArray(value.inbox) ? value.inbox.filter((item) => tasks.some((task) => task.id === item.taskId)) : seeded.inbox,
    tasks: Array.isArray(tasks) && tasks.length
      ? tasks.map((task) => ({
          ...task,
          createdBy: task.createdBy || currentUserId,
          assigneeId: task.assigneeId || currentUserId,
          reviewerId: task.reviewerId || reviewerId,
          stage: task.stage || "Brief",
          deadline: task.deadline || "",
          attachments: Array.isArray(task.attachments) ? task.attachments.filter((file) => file.id !== "file-1" && file.name !== "social_mockup.png").map((file) => normalizeAttachment({ ...file, kind: file.kind || "deliverable" })) : [],
          briefAttachments: Array.isArray(task.briefAttachments) ? task.briefAttachments.map((file) => normalizeAttachment({ ...file, kind: file.kind || "brief" })) : [],
          subtasks: Array.isArray(task.subtasks) && typeof task.subtasks[0] === "object" ? task.subtasks : makeSubtasks(),
          comments: Array.isArray(task.comments) ? task.comments.filter((comment) => !comment.text.includes("please check naming before delivery")).map((comment) => ({ ...comment, attachments: Array.isArray(comment.attachments) ? comment.attachments.map((file) => normalizeAttachment({ ...file, kind: file.kind || "comment" })) : [] })) : [],
          activity: Array.isArray(task.activity) && task.activity[0]?.actor ? cleanActivity(task.activity) : []
        }))
      : seeded.tasks
  };
}

function normalizeProject(project: Project): Project {
  return {
    ...project,
    client: project.client || "Internal",
    ownerId: project.ownerId || currentUserId,
    xProfile: project.xProfile || "",
    website: project.website || "",
    description: project.description || "",
    audience: project.audience || "",
    logoImage: project.logoImage || "",
    brandAccent: project.brandAccent || "",
    brandAccentSecondary: project.brandAccentSecondary || ""
  };
}

function brandAccentStyle(brand: Project): CSSProperties {
  const colors = brandAccentColors(brand);
  return {
    "--brand-accent": colors.accent,
    "--brand-accent-rgb": hexToRgbParts(colors.accent),
    "--brand-glow-b": colors.secondary,
    "--brand-glow-b-rgb": hexToRgbParts(colors.secondary)
  } as CSSProperties;
}

function brandAccentColors(brand: Project) {
  if (brand.brandAccent) return expandBrandPalette(brand.brandAccent, brand.brandAccentSecondary);
  const logoColor = brand.logoImage ? colorFromDataUrl(brand.logoImage) : "";
  if (logoColor) return expandBrandPalette(logoColor);
  return { accent: "#28e8c0", secondary: "#f7931e", tertiary: "#f7931e" };
}

function expandBrandPalette(accent: string, secondary?: string) {
  const secondaryColor = secondary && secondary !== accent ? secondary : deriveBrandSecondary(accent);
  return { accent, secondary: secondaryColor, tertiary: secondaryColor };
}

function isWeakBrandAccent(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return true;
  const [r, g, b] = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  const brightness = (r + g + b) / (3 * 255);
  return saturation < 0.18 || brightness > 0.82;
}

function deriveBrandSecondary(hex: string) {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#f7931e";
  const [h, s, l] = rgbToHsl(rgb);
  const shifted = hslToRgb([(h + 148) % 360, Math.min(0.95, Math.max(0.55, s * 1.05)), Math.min(0.68, Math.max(0.42, l))]);
  return rgbToHex(shifted);
}

function colorFromDataUrl(value: string) {
  const match = value.match(/#([0-9a-f]{6})/i);
  return match ? `#${match[1]}` : "";
}

function hexToRgbParts(hex: string) {
  const rgb = hexToRgb(hex);
  return rgb ? `${rgb[0]} ${rgb[1]} ${rgb[2]}` : "213 255 39";
}

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace("#", "");
  const value = clean.length === 3 ? clean.split("").map((char) => char + char).join("") : clean;
  if (!/^[0-9a-f]{6}$/i.test(value)) return null;
  const number = Number.parseInt(value, 16);
  return [(number >> 16) & 255, (number >> 8) & 255, number & 255];
}

function rgbToHex([r, g, b]: [number, number, number]) {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function cleanXHandle(value: string) {
  return value
    .replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//i, "")
    .replace(/^@/, "")
    .split(/[/?#]/)[0]
    .trim();
}

function safePersistStore(store: Store) {
  const attempts = [
    persistableStore(store),
    persistableStore(store, true),
    metadataOnlyStore(store)
  ];

  for (const attempt of attempts) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attempt));
      return;
    } catch {
      // Try a smaller representation next. Never let persistence crash the UI.
    }
  }
}

function persistableStore(store: Store, stripPreviews = false): Store {
  return {
    ...store,
    members: store.members.map((person) => normalizePersistedMember(person, stripPreviews)),
    tasks: store.tasks.map((task) => ({
      ...task,
      attachments: task.attachments.map((file) => normalizeAttachment(file, stripPreviews)),
      briefAttachments: task.briefAttachments.map((file) => normalizeAttachment(file, stripPreviews)),
      comments: task.comments.map((comment) => ({ ...comment, attachments: comment.attachments?.map((file) => normalizeAttachment(file, stripPreviews)) }))
    }))
  };
}

function metadataOnlyStore(store: Store): Store {
  return {
    ...store,
    members: store.members.map((person) => ({ ...person, avatarImage: undefined })),
    tasks: store.tasks.map((task) => ({
      ...task,
      attachments: task.attachments.map((file) => ({ ...file, previewUrl: undefined, localOnly: true })),
      briefAttachments: task.briefAttachments.map((file) => ({ ...file, previewUrl: undefined, localOnly: true })),
      comments: task.comments.map((comment) => ({ ...comment, attachments: comment.attachments?.map((file) => ({ ...file, previewUrl: undefined, localOnly: true })) }))
    }))
  };
}

function normalizePersistedMember(person: Member, stripImages = false): Member {
  const avatarImage = !stripImages && person.avatarImage && person.avatarImage.length < 1200000 ? person.avatarImage : undefined;
  return { ...person, avatarImage };
}

function makeProfileAvatarDataUrl(file: File) {
  return new Promise<string>((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const size = 360;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        resolveWithFileReader(file, resolve);
        return;
      }
      const sourceSize = Math.min(image.naturalWidth, image.naturalHeight);
      const sourceX = Math.max(0, (image.naturalWidth - sourceSize) / 2);
      const sourceY = Math.max(0, (image.naturalHeight - sourceSize) / 2);
      canvas.width = size;
      canvas.height = size;
      context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", 0.84));
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolveWithFileReader(file, resolve);
    };
    image.src = objectUrl;
  });
}

function resolveWithFileReader(file: File, resolve: (value: string) => void) {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ""));
  reader.onerror = () => resolve("");
  reader.readAsDataURL(file);
}

function brandPaletteFromFile(file: File) {
  return new Promise<BrandPalette | null>((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(sampleBrandPaletteFromImage(image));
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };
    image.src = objectUrl;
  });
}

function brandPaletteFromImageSrc(src: string) {
  return new Promise<BrandPalette | null>((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(sampleBrandPaletteFromImage(image));
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function sampleBrandPaletteFromImage(image: CanvasImageSource): BrandPalette | null {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  const size = 48;
  canvas.width = size;
  canvas.height = size;
  try {
    context.drawImage(image, 0, 0, size, size);
    const pixels = context.getImageData(0, 0, size, size).data;
    const buckets = new Map<number, { r: number; g: number; b: number; score: number }>();
    for (let index = 0; index < pixels.length; index += 4) {
      const alpha = pixels[index + 3] / 255;
      if (alpha < 0.35) continue;
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      const max = Math.max(red, green, blue);
      const min = Math.min(red, green, blue);
      const saturation = max - min;
      const brightness = (red + green + blue) / 3;
      if (brightness < 22 || brightness > 238) continue;
      if (saturation < 28 && brightness > 165) continue;
      const vividness = saturation / 255;
      const brightnessBalance = Math.max(0.18, 1 - Math.abs(brightness - 128) / 150);
      const pixelWeight = alpha * Math.max(0.05, vividness * vividness * 4.2) * brightnessBalance;
      if (saturation < 24) continue;
      const [hue] = rgbToHsl([red, green, blue]);
      const bucket = Math.floor(hue / 10);
      const current = buckets.get(bucket) || { r: 0, g: 0, b: 0, score: 0 };
      current.r += red * pixelWeight;
      current.g += green * pixelWeight;
      current.b += blue * pixelWeight;
      current.score += pixelWeight;
      buckets.set(bucket, current);
    }
    const ranked = Array.from(buckets.entries())
      .map(([bucket, value]) => ({
        bucket,
        score: value.score,
        rgb: [Math.round(value.r / value.score), Math.round(value.g / value.score), Math.round(value.b / value.score)] as [number, number, number]
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);
    if (!ranked.length) return null;
    const primary = rgbToHex(ranked[0].rgb);
    const secondaryEntry = ranked.find((item, index) => {
      if (index === 0) return false;
      const hueDistance = Math.min(Math.abs(item.bucket - ranked[0].bucket), 36 - Math.abs(item.bucket - ranked[0].bucket));
      return hueDistance >= 3;
    });
    const secondary = secondaryEntry ? rgbToHex(secondaryEntry.rgb) : deriveBrandSecondary(primary);
    return { primary, secondary };
  } catch {
    return null;
  }
}

function rgbToHsl([r, g, b]: [number, number, number]): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let hue = 0;
  const lightness = (max + min) / 2;
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  if (delta !== 0) {
    if (max === rn) hue = ((gn - bn) / delta) % 6;
    else if (max === gn) hue = (bn - rn) / delta + 2;
    else hue = (rn - gn) / delta + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  return [hue, saturation, lightness];
}

function hslToRgb([h, s, l]: [number, number, number]): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rn = 0;
  let gn = 0;
  let bn = 0;
  if (h < 60) [rn, gn, bn] = [c, x, 0];
  else if (h < 120) [rn, gn, bn] = [x, c, 0];
  else if (h < 180) [rn, gn, bn] = [0, c, x];
  else if (h < 240) [rn, gn, bn] = [0, x, c];
  else if (h < 300) [rn, gn, bn] = [x, 0, c];
  else [rn, gn, bn] = [c, 0, x];
  return [Math.round((rn + m) * 255), Math.round((gn + m) * 255), Math.round((bn + m) * 255)];
}

function normalizeAttachment(file: FileItem, stripPreviews = false): FileItem {
  const previewUrl = file.previewUrl && !file.previewUrl.startsWith("blob:") && !stripPreviews && file.previewUrl.length < 1800000 ? file.previewUrl : "";
  return previewUrl ? { ...file, previewUrl } : { ...file, previewUrl: undefined };
}

async function prepareAttachments(items: FormDataEntryValue[], taskId: string, kind: AttachmentKind) {
  const files = items.filter((item): item is File => item instanceof File && item.size > 0 && isAllowedUpload(item) && item.size <= maxFileSize);
  return Promise.all(files.map((file) => prepareAttachment(file, taskId, kind)));
}

async function prepareAttachment(file: File, taskId: string, kind: AttachmentKind): Promise<FileItem> {
  const id = crypto.randomUUID();
  const fileType = file.type || inferFileType(file.name);
  const folder = kind === "brief" ? "brief" : kind === "comment" ? "comments" : "deliverables";
  const blobKey = `${folder}/${taskId}/${id}`;
  await saveAttachmentBlob(blobKey, file);
  return {
    id,
    name: file.name,
    type: fileType,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    previewUrl: await makeUploadPreviewUrl(file),
    blobKey,
    localOnly: true,
    kind,
    path: `${folder}/${taskId}/${file.name}`
  };
}

function makePendingCommentAttachment(file: File, taskId: string): FileItem {
  const id = crypto.randomUUID();
  const fileType = file.type || inferFileType(file.name);
  return {
    id,
    name: file.name,
    type: fileType,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    previewUrl: isPreviewableFile({ type: fileType, name: file.name } as FileItem) ? URL.createObjectURL(file) : "",
    blobKey: `comments/${taskId}/${id}`,
    localOnly: true,
    kind: "comment",
    path: `comments/${taskId}/${file.name}`,
    uploading: true
  };
}

function upsertCurrentUser(members: Member[], patch: Partial<Member>) {
  const existing = members.find((person) => person.id === currentUserId) || currentUserFallback;
  const next = normalizeMember({ ...existing, ...patch, id: currentUserId });
  return members.some((person) => person.id === currentUserId)
    ? members.map((person) => person.id === currentUserId ? next : person)
    : [next, ...members];
}

function normalizeMember(person: Member): Member {
  const leaveFrom = cleanLeaveDate(person.leaveFrom);
  const leaveTo = cleanLeaveDate(person.leaveTo);
  return {
    ...person,
    avatar: person.avatar || initials(person.name),
    leaveFrom,
    leaveTo: leaveFrom && leaveTo && leaveTo >= leaveFrom ? leaveTo : "",
    leaveType: leaveFrom && leaveTo && leaveTo >= leaveFrom ? person.leaveType : undefined
  };
}

function makeTask(id: string, projectId: string, title: string, description: string, createdBy: string, assigneeId: string, reviewerId: string, stage: PipelineStage, priority: Priority, deadline: string, attachments: FileItem[], briefAttachments: FileItem[] = []): Task {
  return { id, projectId, createdBy, title, description, assigneeId, reviewerId, stage, priority, deadline, attachments, briefAttachments, subtasks: makeSubtasks(), comments: [], activity: [] };
}

function addActivity(items: Activity[], actionText: string) {
  const cleanItems = cleanActivity(items);
  if (cleanItems[0]?.action === actionText) return cleanItems;
  return [activity(actionText), ...cleanItems].slice(0, 80);
}

function cleanActivity(items: Activity[]) {
  const blocked = new Set(["updated subtask", "migrated task"]);
  return items
    .filter((item) => item.actor && item.action && !blocked.has(item.action) && !item.action.startsWith("seeded in"))
    .filter((item, index, list) => index === 0 || item.action !== list[index - 1]?.action || item.at !== list[index - 1]?.at)
    .slice(0, 80);
}

function replaceMentionQuery(value: string, person: Member, mode: "mention" | "cc" = "mention") {
  const mention = `@${person.name.split(" ")[0]} `;
  const replacement = mode === "cc" ? `cc ${mention}` : mention;
  return value.match(/(?:^|\s)(?:cc\s+)?@[a-zA-Z]*$/i) ? value.replace(/(^|\s)(?:cc\s+)?@[a-zA-Z]*$/i, `$1${replacement}`) : `${value}${value.endsWith(" ") || !value ? "" : " "}${replacement}`;
}

function hasMentionQuery(value: string) {
  return /(?:^|\s)(?:cc\s+)?@[a-zA-Z]*$/i.test(value);
}

function makeSubtasks(): Subtask[] {
  return ["Confirm brief", "Prepare deliverable", "Send for QA"].map((label) => ({ id: crypto.randomUUID(), label, done: false }));
}

function activity(action: string): Activity {
  return { id: crypto.randomUUID(), actor: currentUserFallback.name, action, at: new Date().toISOString() };
}

function inbox(userId: string, taskId: string, title: string, body: string): InboxItem {
  return { id: crypto.randomUUID(), userId, taskId, title, body, read: false, createdAt: new Date().toISOString() };
}

function nextStage(task: Task): PipelineStage | null {
  if (task.stage === "In Review") return null;
  if (task.stage === "Changes Required") return "In Review";
  const index = PIPELINE_STAGES.indexOf(task.stage);
  return task.stage === "Completed" ? null : PIPELINE_STAGES[index + 1] || null;
}

function getDueDateStatus(deadline: string) {
  if (!deadline) return "normal";
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  if (days <= 0) return "overdue";
  if (days <= 2) return "soon";
  if (days <= 7) return "week";
  return "normal";
}

function urgency(deadline: string) {
  return getDueDateStatus(deadline);
}

function formatDate(value: string) {
  return value ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "No date";
}

function formatFileSize(value: number) {
  if (!value) return "Link";
  if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(value >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
  return `${Math.max(1, Math.round(value / 1024))} KB`;
}

function isAllowedUpload(file: File) {
  const name = file.name.toLowerCase();
  return allowedTypes.includes(file.type) || allowedExtensions.some((extension) => name.endsWith(extension));
}

function makeUploadPreviewUrl(file: File) {
  const fileType = file.type || inferFileType(file.name);
  if (fileType.startsWith("image/") && file.size <= 1400000) {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || URL.createObjectURL(file)));
      reader.onerror = () => resolve(URL.createObjectURL(file));
      reader.readAsDataURL(file);
    });
  }
  return Promise.resolve(isPreviewableFile({ type: fileType, name: file.name } as FileItem) ? URL.createObjectURL(file) : "");
}

function isPreviewableFile(file: FileItem) {
  return file.type.startsWith("image/") || file.type.startsWith("video/");
}

function attachmentDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("beeflow-attachments", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("files");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveAttachmentBlob(key: string, blob: Blob) {
  try {
    const db = await attachmentDb();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("files", "readwrite");
      transaction.objectStore("files").put(blob, key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    db.close();
  } catch {
    // Metadata still attaches even if browser blob storage is unavailable.
  }
}

async function getAttachmentBlob(key: string) {
  try {
    const db = await attachmentDb();
    const blob = await new Promise<Blob | undefined>((resolve, reject) => {
      const request = db.transaction("files", "readonly").objectStore("files").get(key);
      request.onsuccess = () => resolve(request.result as Blob | undefined);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return blob;
  } catch {
    return undefined;
  }
}

async function deleteAttachmentBlob(key: string) {
  try {
    const db = await attachmentDb();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("files", "readwrite");
      transaction.objectStore("files").delete(key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    db.close();
  } catch {
    // Deleting metadata is enough if blob storage is unavailable.
  }
}

function inferFileType(name: string) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".mov")) return "video/quicktime";
  if (lower.endsWith(".zip")) return "application/zip";
  return "application/octet-stream";
}

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function cleanLeaveDate(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const parsed = parseLocalDate(value);
  if (Number.isNaN(parsed.getTime()) || toDateKey(parsed) !== value) return "";
  const year = parsed.getFullYear();
  const currentYear = new Date().getFullYear();
  return year >= currentYear - 1 && year <= currentYear + 5 ? value : "";
}

function monthKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
}

function shiftMonth(value: string, offset: number) {
  const [year, month] = value.split("-").map(Number);
  return monthKey(new Date(year, month - 1 + offset, 1));
}

function formatMonth(value: string) {
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function formatFullDate(value: string) {
  return parseLocalDate(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatInboxDate(value: string) {
  return new Date(value).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function calendarDays(value: string) {
  const [year, month] = value.split("-").map(Number);
  const first = new Date(year, month - 1, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const start = new Date(year, month - 1, 1 - startOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      value: toDateKey(date),
      label: date.getDate(),
      inMonth: date.getMonth() === month - 1
    };
  });
}

function initials(value: string) {
  return value.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function highlightMentions(value: string) {
  return value.replace(/(@[a-zA-Z]+)/g, '<mark class="mention">$1</mark>');
}

function leaveMeta(type?: LeaveType) {
  return leaveOptions.find(([value]) => value === type) || leaveOptions[leaveOptions.length - 1];
}

function shouldShowLeave(person: Member) {
  if (!person.leaveFrom || !person.leaveTo) return false;
  return new Date(person.leaveTo).getTime() >= new Date(new Date().toDateString()).getTime();
}

function leaveTooltip(person: Member) {
  const [, label] = leaveMeta(person.leaveType);
  return person.leaveFrom && person.leaveTo
    ? `${label} leave, unavailable from ${formatDate(person.leaveFrom)} to ${formatDate(person.leaveTo)}`
    : `${label} leave`;
}

function LeaveBadge({ person, force = false }: { person: Member; force?: boolean }) {
  if (!force && !shouldShowLeave(person)) return null;
  if (!force && (!person.leaveFrom || !person.leaveTo)) return null;
  const [, label, icon] = leaveMeta(person.leaveType);
  const tooltip = person.leaveFrom && person.leaveTo ? `${label} leave, unavailable from ${formatDate(person.leaveFrom)} to ${formatDate(person.leaveTo)}` : `${label} leave`;
  return <span className="bf-leave-badge" aria-label={leaveTooltip(person)}><Icon name={icon} /><span>{tooltip}</span></span>;
}

function NameWithLeave({ person }: { person: Member }) {
  return <span className="bf-name-with-leave">{person.name}<LeaveBadge person={person} /></span>;
}

function Avatar({ label, image }: { label: string; image?: string }) {
  return <span className={`bf-avatar${image ? " has-image" : ""}`}>{image ? <img src={image} alt="" /> : label}</span>;
}

function Priority({ priority }: { priority: Priority }) {
  return <span className={`bf-priority ${priority.toLowerCase()}`}><i />{priority}</span>;
}

function Logo() {
  return <svg className="bf-logo" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="7" /><path d="M9 9h8.5c3 0 5 1.6 5 4.1 0 1.4-.7 2.5-2 3.1 1.7.6 2.6 1.8 2.6 3.5 0 2.7-2.2 4.3-5.6 4.3H9V9Z" /></svg>;
}

type IconName = "layout" | "check" | "inbox" | "folder" | "list" | "shield" | "send" | "delivery" | "fileText" | "paperclip" | "users" | "user" | "settings" | "plus" | "x" | "twitter" | "chevronRight" | "chevronDown" | "clock" | "upload" | "download" | "arrowRight" | "lock" | "medical" | "plane" | "education" | "home" | "alertCircle" | "calendarOff" | "edit" | "trash";

function Icon({ name }: { name: IconName }) {
  if (name === "layout") {
    return <span className="bf-icon bf-icon-dashboard" aria-hidden="true"><span /><span /><span /><span /></span>;
  }
  if (name === "twitter") {
    return <span className="bf-icon bf-icon-x" aria-hidden="true">X</span>;
  }
  if (name === "delivery") {
    return (
      <svg className="bf-icon bf-icon-delivery" viewBox="0 0 512 512" aria-hidden="true">
        <path fillRule="evenodd" clipRule="evenodd" d="M256 0C114.62 0 0 114.62 0 256s114.62 256 256 256 256-114.62 256-256S397.38 0 256 0Zm119.89 152.36-81.29 231.9a19 19 0 0 1-31.41 7.16l-44.73-105.88-105.88-44.73a19 19 0 0 1 7.16-31.41l231.9-81.29a19 19 0 0 1 24.25 24.25Z" />
      </svg>
    );
  }
  const classes: Record<IconName, string> = {
    layout: "fi-sr-dashboard-panel",
    check: "fi-sr-check-circle",
    inbox: "fi-sr-inbox-in",
    folder: "fi-sr-folder",
    list: "fi-sr-list-check",
    shield: "fi-sr-shield-check",
    send: "fi-sr-paper-plane",
    delivery: "fi-sr-paper-plane",
    fileText: "fi-sr-document",
    paperclip: "fi-sr-paperclip-vertical",
    users: "fi-sr-users-alt",
    user: "fi-sr-user",
    settings: "fi-sr-settings",
    plus: "fi-sr-plus",
    x: "fi-sr-cross-small",
    twitter: "",
    chevronRight: "fi-sr-angle-small-right",
    chevronDown: "fi-sr-angle-small-down",
    clock: "fi-sr-clock",
    upload: "fi-sr-upload",
    download: "fi-sr-download",
    arrowRight: "fi-sr-arrow-right",
    lock: "fi-sr-lock",
    medical: "fi-sr-stethoscope",
    plane: "fi-sr-plane",
    education: "fi-sr-graduation-cap",
    home: "fi-sr-home",
    alertCircle: "fi-sr-exclamation",
    calendarOff: "fi-sr-calendar-clock",
    edit: "fi-sr-pencil",
    trash: "fi-sr-trash"
  };
  return <i className={`bf-icon fi ${classes[name]}`} aria-hidden="true" />;
}
