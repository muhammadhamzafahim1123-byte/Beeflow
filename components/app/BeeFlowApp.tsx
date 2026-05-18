"use client";

import { useEffect, useState } from "react";
import { PIPELINE_STAGES, type PipelineStage } from "@/lib/workflow";

type View = "dashboard" | "work" | "inbox" | "projects" | "tasks" | "review" | "delivery" | "docs" | "files" | "team" | "profile" | "settings";
type Priority = "Low" | "Medium" | "High";
type FileItem = { id: string; name: string; type: string; size: number; uploadedAt: string };
type Member = { id: string; name: string; role: string; department: string; avatar: string; capacity: number };
type Project = { id: string; name: string; client: string; ownerId: string };
type Activity = { id: string; actor: string; action: string; at: string };
type Comment = { id: string; author: string; text: string; at: string };
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
  subtasks: Subtask[];
  comments: Comment[];
  activity: Activity[];
  rejectionNote?: string;
  qaStamp?: { reviewer: string; at: string };
  deliveredAt?: string;
};
type Store = { setupDismissed: boolean; projects: Project[]; tasks: Task[]; members: Member[]; inbox: InboxItem[] };

const STORAGE_KEY = "beeflow:role-routing-v1";
const currentUserId = "me";
const reviewerId = "nadia";
const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "video/mp4", "application/zip", "application/x-zip-compressed"];
const maxFileSize = 50 * 1024 * 1024;

const nav: Array<[View, string, IconName]> = [
  ["dashboard", "Dashboard", "layout"],
  ["work", "My Tasks", "check"],
  ["inbox", "Inbox", "inbox"],
  ["projects", "Projects", "folder"],
  ["tasks", "Board", "list"],
  ["review", "Review Hub", "shield"],
  ["delivery", "Delivery", "send"],
  ["docs", "Docs", "fileText"],
  ["files", "Files", "paperclip"],
  ["team", "Team", "users"],
  ["profile", "Profile", "user"],
  ["settings", "Settings", "settings"]
];

export default function BeeFlowApp() {
  const [store, setStore] = useState<Store>(seedStore());
  const [view, setView] = useState<View>("dashboard");
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [modal, setModal] = useState<"" | "task" | "project" | "member">("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingTaskId, setRejectingTaskId] = useState("");
  const [upload, setUpload] = useState({ taskId: "", progress: 0, error: "" });
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [figmaUrl, setFigmaUrl] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setStore(normalizeStore(JSON.parse(saved)));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }, [store]);

  const currentUser = member(currentUserId);
  const selectedTask = store.tasks.find((task) => task.id === selectedTaskId);
  const unreadCount = store.inbox.filter((item) => item.userId === currentUserId && !item.read).length;
  const reviewTasks = store.tasks.filter((task) => task.stage === "In Review");
  const deliveredTasks = store.tasks.filter((task) => task.stage === "Delivered");

  return (
    <div className="bf-shell">
      <aside className="bf-sidebar">
        <button className="bf-brand" onClick={() => setView("dashboard")}><Logo /><span><strong>BeeFlow</strong><small>Workflow OS</small></span></button>
        <nav>
          {nav.map(([key, label, icon]) => (
            <button key={key} className={view === key ? "active" : ""} onClick={() => setView(key)}>
              <Icon name={icon} /> {label}
              {key === "inbox" && unreadCount > 0 ? <b className="bf-nav-badge">{unreadCount}</b> : null}
            </button>
          ))}
        </nav>
        <button className="bf-profile-card" onClick={() => setView("profile")}><Avatar label={currentUser.avatar} /><span><strong>{currentUser.name}</strong><small>{currentUser.role}</small></span></button>
      </aside>
      <main className="bf-main">
        <header className="bf-topbar"><div><h1>{nav.find(([key]) => key === view)?.[1]}</h1><p>{store.projects[0]?.name}</p></div><button className="bf-btn secondary" onClick={() => setModal("project")}><Icon name="folder" /> Project</button><button className="bf-btn primary" onClick={() => setModal("task")}><Icon name="plus" /> New Task</button></header>
        {renderView()}
      </main>
      {selectedTask ? <TaskDrawer task={selectedTask} /> : null}
      {modal ? <CreateModal /> : null}
    </div>
  );

  function renderView() {
    if (["dashboard", "projects", "tasks"].includes(view)) return <Dashboard />;
    if (view === "work") return <MyTasks />;
    if (view === "inbox") return <Inbox />;
    if (view === "review") return <ReviewHub />;
    if (view === "delivery") return <Page title="Delivery" copy="Locked delivery history with sign-off stamps."><Rows tasks={deliveredTasks} /></Page>;
    if (view === "files") return <Page title="Files" copy="All task-level deliverables."><FileIndex /></Page>;
    if (view === "team") return <Team />;
    if (view === "profile") return <Profile />;
    if (view === "docs") return <Page title="Docs" copy="Briefs, SOPs, and delivery notes."><div className="bf-empty">No docs yet.</div></Page>;
    return <Page title="Settings" copy="Workflow rules are locked for this demo."><div className="bf-note">Pipeline: {PIPELINE_STAGES.join(" -> ")}</div></Page>;
  }

  function Dashboard() {
    const stats = [
      ["Active", store.tasks.filter((task) => task.stage !== "Delivered").length, "clock"],
      ["In Review", reviewTasks.length, "shield"],
      ["Approved", store.tasks.filter((task) => task.stage === "Approved").length, "check"],
      ["Delivered", deliveredTasks.length, "send"]
    ] as const;
    return <section className="bf-page">{!store.setupDismissed ? <section className="bf-setup"><div><button className="bf-disclosure"><Icon name="chevronDown" /> First-time setup</button><p>Demo data is loaded. Skip setup and start working.</p></div><button className="bf-btn secondary" onClick={() => setStore((s) => ({ ...s, setupDismissed: true }))}><Icon name="x" /> Skip</button></section> : null}<div className="bf-stats">{stats.map(([label, value, icon]) => <article key={label}><Icon name={icon} /><span>{label}</span><strong>{value}</strong></article>)}</div><div className="bf-viewbar"><div><h2>{store.projects[0]?.name}</h2><p>Brief to sign-off pipeline. No skipped stages.</p></div></div><Board /></section>;
  }

  function Board() {
    return <div className="bf-board">{PIPELINE_STAGES.map((stage) => <section className="bf-lane" key={stage}><header><strong>{stage}</strong><span>{store.tasks.filter((task) => task.stage === stage).length}</span></header>{store.tasks.filter((task) => task.stage === stage).map((task) => <TaskCard key={task.id} task={task} />)}</section>)}</div>;
  }

  function TaskCard({ task }: { task: Task }) {
    return <article className={`bf-task urgency-${urgency(task.deadline)}`} onClick={() => setSelectedTaskId(task.id)}><div className="bf-task-head"><strong>{task.title}</strong><Avatar label={member(task.assigneeId).avatar} /></div><p>{task.description}</p><div className="bf-meta"><Priority priority={task.priority} /><span className={`date ${urgency(task.deadline)}`}><i />{formatDate(task.deadline)}</span><span>{task.stage}</span></div><div className="bf-files">{task.attachments.map((file) => <span key={file.id}><Icon name="paperclip" /> {file.name}</span>)}</div>{task.rejectionNote ? <div className="bf-reject-note">Rejected: {task.rejectionNote}</div> : null}{task.qaStamp ? <div className="bf-qa-stamp">Approved by {task.qaStamp.reviewer}</div> : null}</article>;
  }

  function MyTasks() {
    const mine = store.tasks.filter((task) => task.assigneeId === currentUserId);
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
    const today = new Date().toISOString().slice(0, 10);
    const groups = [["Today", mine.filter((i) => i.createdAt.slice(0, 10) === today)], ["Past 7 days", mine.filter((i) => i.createdAt.slice(0, 10) !== today)]] as const;
    return <section className="bf-page">{groups.map(([label, items]) => <section className="bf-panel" key={label}><div className="bf-panel-head"><h2>{label}</h2><span>{items.filter((i) => !i.read).length} unread</span></div><div className="bf-inbox-list">{items.map((item) => <button key={item.id} className={item.read ? "" : "unread"} onClick={() => openInbox(item)}><strong>{item.title}</strong><span>{item.body}</span><small>{new Date(item.createdAt).toLocaleString()}</small></button>)}</div></section>)}</section>;
  }

  function ReviewHub() {
    return <Page title="Review Hub" copy="QA reviewers approve or reject with mandatory feedback."><div className="bf-review-grid">{reviewTasks.map((task) => <article className="bf-review" key={task.id}><div><strong>{task.title}</strong><p>Submitted by {member(task.assigneeId).name} - {task.attachments.length} attachments</p></div><div className="bf-files">{task.attachments.map((file) => <span key={file.id}><Icon name="paperclip" /> {file.name}</span>)}</div><textarea value={rejectingTaskId === task.id ? rejectReason : ""} onChange={(e) => { setRejectingTaskId(task.id); setRejectReason(e.target.value); }} placeholder="Leave QA feedback (required to reject)..." /><div><button className="bf-btn approve" onClick={() => approveTask(task.id)}><Icon name="check" /> Approve</button><button className="bf-btn reject" disabled={rejectingTaskId !== task.id || !rejectReason.trim()} onClick={() => rejectTask(task.id)}><Icon name="x" /> Reject</button></div></article>)}{reviewTasks.length === 0 ? <div className="bf-empty">No tasks in review.</div> : null}</div></Page>;
  }

  function Rows({ tasks }: { tasks: Task[] }) {
    return <div className="bf-rows">{tasks.map((task) => <button key={task.id} onClick={() => setSelectedTaskId(task.id)}><span>{task.title}</span><span>{projectName(task.projectId)}</span><span className={`date-text ${urgency(task.deadline)}`}>{formatDate(task.deadline)}</span><span>{member(task.assigneeId).name}, {member(task.reviewerId).name}</span><span>{task.stage}</span></button>)}</div>;
  }

  function TaskDrawer({ task }: { task: Task }) {
    const role = taskRole(task);
    const next = nextStage(task);
    return <aside className="bf-drawer"><button className="bf-close" onClick={() => setSelectedTaskId("")} aria-label="Close task panel"><Icon name="x" /></button><h2>{task.title}</h2><p>{task.description}</p><div className="bf-current-stage"><span>{task.stage}</span>{role !== "qa" && next ? <button className="bf-btn secondary" onClick={() => moveTask(task, next)}><Icon name="arrowRight" /> Move to {next}</button> : null}</div>{role === "assignee" ? <AssigneeView task={task} /> : null}{role === "qa" ? <QaView task={task} /> : null}{role === "pm" ? <PmView task={task} /> : null}</aside>;
  }

  function AssigneeView({ task }: { task: Task }) {
    return <><section><h3>Subtasks</h3>{task.subtasks.map((subtask) => <label className="bf-check" key={subtask.id}><input type="checkbox" checked={subtask.done} onChange={() => toggleSubtask(task.id, subtask.id)} /> <span>{subtask.label}</span></label>)}</section><UploadBox task={task} /><Comments task={task} /><ActivityLog task={task} /></>;
  }

  function QaView({ task }: { task: Task }) {
    return <><section><h3>Uploaded files</h3><div className="bf-files">{task.attachments.map((file) => <span key={file.id}><Icon name="paperclip" /> {file.name}</span>)}</div></section><section className="bf-qa-actions"><textarea value={rejectingTaskId === task.id ? rejectReason : ""} onChange={(e) => { setRejectingTaskId(task.id); setRejectReason(e.target.value); }} placeholder="Mandatory feedback before rejecting..." /><button className="bf-btn approve" onClick={() => approveTask(task.id)}><Icon name="check" /> Approve</button><button className="bf-btn reject" disabled={rejectingTaskId !== task.id || !rejectReason.trim()} onClick={() => rejectTask(task.id)}><Icon name="x" /> Reject</button></section></>;
  }

  function PmView({ task }: { task: Task }) {
    return <><div className="bf-detail-grid"><label>Created by<strong>{member(task.createdBy).name}</strong></label><label>Assignee<strong>{member(task.assigneeId).name}</strong></label><label>QA reviewer<strong>{member(task.reviewerId).name}</strong></label><label>Deadline<strong className={`date-text ${urgency(task.deadline)}`}>{formatDate(task.deadline)}</strong></label><label>Delivery stamp<strong>{task.deliveredAt ? new Date(task.deliveredAt).toLocaleString() : "Not delivered"}</strong></label><label>Sign-off<strong>{task.qaStamp ? `${task.qaStamp.reviewer} at ${new Date(task.qaStamp.at).toLocaleString()}` : "Pending"}</strong></label></div><UploadBox task={task} /><Comments task={task} /><ActivityLog task={task} /></>;
  }

  function UploadBox({ task }: { task: Task }) {
    return <section className="bf-upload" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); void handleUpload(task.id, e.dataTransfer.files[0]); }}><Icon name="upload" /><span>Drop deliverable here or choose a file</span><input type="file" accept=".pdf,.png,.jpg,.jpeg,.mp4,.zip" onChange={(e) => void handleUpload(task.id, e.target.files?.[0])} /><div className="bf-figma-url"><input value={figmaUrl} onChange={(e) => setFigmaUrl(e.target.value)} placeholder="Paste Figma URL and press Enter" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); attachFigmaUrl(task.id); } }} /></div>{upload.taskId === task.id && upload.progress > 0 ? <div className="bf-progress"><i style={{ width: `${upload.progress}%` }} /></div> : null}{upload.taskId === task.id && upload.error ? <small className="bf-error">{upload.error}</small> : null}<div className="bf-files">{task.attachments.map((file) => <span key={file.id}><Icon name="paperclip" /> {file.name}</span>)}</div></section>;
  }

  function Comments({ task }: { task: Task }) {
    return <section><h3>Comments</h3>{task.comments.map((c) => <p className="bf-comment" key={c.id}><strong>{c.author}</strong> <span dangerouslySetInnerHTML={{ __html: highlightMentions(c.text) }} /></p>)}<input className="bf-comment-input" placeholder="Comment with @mention..." onKeyDown={(e) => addComment(e, task.id)} /></section>;
  }

  function ActivityLog({ task }: { task: Task }) {
    return <section><h3>Activity</h3>{task.activity.map((a) => <p key={a.id} className="bf-activity">{a.actor} - {a.action} - {new Date(a.at).toLocaleString()}</p>)}</section>;
  }

  function CreateModal() {
    return <div className="bf-modal-backdrop"><form className="bf-modal" onSubmit={modal === "task" ? createTask : createSimple}><button type="button" className="bf-close" onClick={() => { setModal(""); setErrors({}); }}><Icon name="x" /></button><h2>{modal === "task" ? "Create task" : modal === "project" ? "Create project" : "Invite member"}</h2>{modal === "task" ? <><Field name="title" label="Task name" error={errors.title} /><label>Assignee<select name="assigneeId" defaultValue=""><option value="">Choose assignee</option>{store.members.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>{errors.assigneeId ? <small>{errors.assigneeId}</small> : null}</label><label>Deadline<input name="deadline" type="date" />{errors.deadline ? <small>{errors.deadline}</small> : null}</label><label>Priority<select name="priority" defaultValue=""><option value="">Choose priority</option><option>Low</option><option>Medium</option><option>High</option></select>{errors.priority ? <small>{errors.priority}</small> : null}</label><Field name="description" label="Brief" error={errors.description} /></> : <Field name="title" label={modal === "project" ? "Project name" : "Member name"} error={errors.title} />}<div className="bf-modal-actions"><button type="button" className="bf-btn secondary" onClick={() => setModal("")}><Icon name="x" /> Cancel</button><button className="bf-btn primary"><Icon name="check" /> Save</button></div></form></div>;
  }

  function Field({ name, label, error }: { name: string; label: string; error?: string }) {
    return <label>{label}<input name={name} />{error ? <small>{error}</small> : null}</label>;
  }

  function Team() {
    return <Page title="Team" copy="Capacity and ownership."><div className="bf-team-grid">{store.members.map((p) => <article className="bf-member" key={p.id}><Avatar label={p.avatar} /><div><strong>{p.name}</strong><p>{p.role} - {p.department}</p></div><span>{store.tasks.filter((t) => t.assigneeId === p.id && t.stage !== "Delivered").length} active</span><div className="bf-capacity"><i style={{ width: `${p.capacity}%` }} /></div></article>)}</div></Page>;
  }

  function Profile() {
    const complete = store.tasks.filter((t) => t.stage === "Delivered" && t.assigneeId === currentUserId).length;
    return <Page title="Profile" copy="Identity and delivery history."><section className="bf-profile"><Avatar label={currentUser.avatar} /><div><h2>{currentUser.name}</h2><p>{currentUser.role} - {currentUser.department}</p><p>Leads brand systems, QA sign-off, and delivery quality for BeeFlow.</p><div><span>Brand strategy</span><span>Typography</span><span>Motion design</span></div></div><aside><strong>{store.tasks.filter((t) => t.assigneeId === currentUserId && t.stage !== "Delivered").length}</strong><small>Active</small><strong>94%</strong><small>On-time</small><strong>{complete}</strong><small>Delivered</small></aside></section></Page>;
  }

  function FileIndex() {
    const files = store.tasks.flatMap((task) => task.attachments.map((file) => ({ ...file, taskTitle: task.title })));
    return <div className="bf-rows">{files.map((file) => <button key={file.id}><span>{file.name}</span><span>{file.taskTitle}</span><span>{Math.round(file.size / 1024)}KB</span><span>{formatDate(file.uploadedAt.slice(0, 10))}</span></button>)}</div>;
  }

  function Page({ title, copy, children }: { title: string; copy: string; children: React.ReactNode }) {
    return <section className="bf-page"><div className="bf-viewbar"><div><h2>{title}</h2><p>{copy}</p></div></div>{children}</section>;
  }

  function createTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const title = String(data.get("title") || "").trim();
    const deadline = String(data.get("deadline") || "");
    const nextErrors = {
      title: title.length < 3 ? "Title must be at least 3 characters." : "",
      assigneeId: !data.get("assigneeId") ? "Assignee is required." : "",
      deadline: !deadline ? "Deadline is required." : new Date(deadline) <= new Date(new Date().toDateString()) ? "Deadline must be a future date." : "",
      priority: !data.get("priority") ? "Priority is required." : ""
    };
    setErrors(Object.fromEntries(Object.entries(nextErrors).filter(([, v]) => v)));
    if (Object.values(nextErrors).some(Boolean)) return;
    const task: Task = {
      id: crypto.randomUUID(),
      projectId: store.projects[0].id,
      createdBy: currentUserId,
      title,
      description: String(data.get("description") || "No brief yet."),
      assigneeId: String(data.get("assigneeId")),
      reviewerId,
      stage: "Brief",
      priority: String(data.get("priority")) as Priority,
      deadline,
      attachments: [],
      subtasks: makeSubtasks(),
      comments: [],
      activity: [activity("created task")]
    };
    setStore((s) => ({ ...s, tasks: [task, ...s.tasks], inbox: [inbox(task.assigneeId, task.id, "New task assigned", `${task.title} was assigned to you.`), ...s.inbox] }));
    setModal("");
    setErrors({});
  }

  function createSimple(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const title = String(new FormData(e.currentTarget).get("title") || "").trim();
    if (title.length < 3) return setErrors({ title: "Minimum 3 characters." });
    setStore((s) => modal === "project" ? { ...s, projects: [...s.projects, { id: crypto.randomUUID(), name: title, client: "Internal", ownerId: currentUserId }] } : { ...s, members: [...s.members, { id: crypto.randomUUID(), name: title, role: "Designer", department: "Creative", avatar: initials(title), capacity: 35 }] });
    setModal("");
  }

  async function moveTask(task: Task, to: PipelineStage) {
    const reviewerName = to === "Approved" ? member(task.reviewerId).name : "";
    const response = await fetch("/api/tasks/transition", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ from: task.stage, to, attachmentCount: task.attachments.length, reviewerName }) });
    const result = await response.json();
    if (!result.ok) return patchTask(task.id, { activity: [activity(result.message), ...task.activity] });
    patchTask(task.id, { stage: to, deliveredAt: to === "Delivered" ? new Date().toISOString() : task.deliveredAt, activity: [activity(`changed status to ${to}`), ...task.activity] });
    if (to === "In Review") notify(task.reviewerId, task.id, "Task ready for QA", `${task.title} is ready for review.`);
  }

  async function handleUpload(taskId: string, file?: File) {
    if (!file) return;
    if (!allowedTypes.includes(file.type)) return setUpload({ taskId, progress: 0, error: "Supported files: PDF, PNG, JPG, MP4, ZIP, Figma URL." });
    if (file.size > maxFileSize) return setUpload({ taskId, progress: 0, error: "File must be 50MB or smaller." });
    setUpload({ taskId, progress: 30, error: "" });
    const form = new FormData();
    form.set("taskId", taskId);
    form.set("file", file);
    setUpload({ taskId, progress: 70, error: "" });
    const response = await fetch("/api/tasks/upload", { method: "POST", body: form });
    const result = await response.json();
    if (!result.ok) return setUpload({ taskId, progress: 0, error: result.message });
    setUpload({ taskId, progress: 100, error: "" });
    addAttachment(taskId, result.file, `uploaded ${result.file.name}`);
    setTimeout(() => setUpload({ taskId: "", progress: 0, error: "" }), 600);
  }

  function attachFigmaUrl(taskId: string) {
    if (!/^https:\/\/(www\.)?figma\.com\//.test(figmaUrl.trim())) return setUpload({ taskId, progress: 0, error: "Paste a valid Figma URL." });
    addAttachment(taskId, { id: crypto.randomUUID(), name: "Figma URL", type: "application/x-figma-url", size: 0, uploadedAt: new Date().toISOString() }, "attached Figma URL");
    setFigmaUrl("");
  }

  function addAttachment(taskId: string, file: FileItem, action: string) {
    setStore((s) => ({ ...s, tasks: s.tasks.map((t) => t.id === taskId ? { ...t, attachments: [...t.attachments, file], activity: [activity(action), ...t.activity] } : t) }));
  }

  function approveTask(taskId: string) {
    const task = store.tasks.find((t) => t.id === taskId);
    if (!task) return;
    patchTask(taskId, { stage: "Approved", qaStamp: { reviewer: currentUser.name, at: new Date().toISOString() }, rejectionNote: "", activity: [activity("QA approved"), ...task.activity] });
    notify(task.assigneeId, task.id, "QA approved", `${task.title} was approved by ${currentUser.name}.`);
  }

  function rejectTask(taskId: string) {
    const task = store.tasks.find((t) => t.id === taskId);
    if (!task || !rejectReason.trim()) return setRejectingTaskId(taskId);
    patchTask(taskId, { stage: "In Progress", rejectionNote: rejectReason.trim(), activity: [activity(`QA rejected: ${rejectReason.trim()}`), ...task.activity] });
    notify(task.assigneeId, task.id, "QA rejected", rejectReason.trim());
    setRejectReason("");
  }

  function toggleSubtask(taskId: string, subtaskId: string) {
    const task = store.tasks.find((t) => t.id === taskId);
    if (!task) return;
    patchTask(taskId, { subtasks: task.subtasks.map((s) => s.id === subtaskId ? { ...s, done: !s.done } : s), activity: [activity("updated subtask"), ...task.activity] });
  }

  function addComment(e: React.KeyboardEvent<HTMLInputElement>, taskId: string) {
    if (e.key !== "Enter") return;
    const text = e.currentTarget.value.trim();
    const task = store.tasks.find((t) => t.id === taskId);
    if (!text || !task) return;
    const mentions = store.members.filter((m) => text.toLowerCase().includes(`@${m.name.toLowerCase().split(" ")[0]}`));
    setStore((s) => ({ ...s, tasks: s.tasks.map((t) => t.id === taskId ? { ...t, comments: [...t.comments, { id: crypto.randomUUID(), author: currentUser.name, text, at: new Date().toISOString() }], activity: [activity("posted comment"), ...t.activity] } : t), inbox: [...mentions.map((m) => inbox(m.id, taskId, "Mentioned in comment", `${currentUser.name} mentioned you on ${task.title}.`)), ...s.inbox] }));
    e.currentTarget.value = "";
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

  function taskRole(task: Task) {
    if (task.reviewerId === currentUserId && task.stage === "In Review") return "qa";
    if (task.assigneeId === currentUserId && task.createdBy !== currentUserId) return "assignee";
    return "pm";
  }

  function member(id: string) {
    return store.members.find((m) => m.id === id) || store.members[0];
  }

  function projectName(id: string) {
    return store.projects.find((p) => p.id === id)?.name || "Project";
  }
}

function seedStore(): Store {
  const now = new Date();
  const date = (days: number) => new Date(now.getTime() + days * 86400000).toISOString().slice(0, 10);
  const members: Member[] = [
    { id: "me", name: "Muhammad Hamza", role: "Project Manager", department: "Creative", avatar: "H", capacity: 70 },
    { id: "artist", name: "Ayaan Malik", role: "Designer", department: "Design", avatar: "A", capacity: 64 },
    { id: "nadia", name: "Nadia Khan", role: "QA Reviewer", department: "QA", avatar: "N", capacity: 42 }
  ];
  const project: Project = { id: "brand-refresh", name: "Brand Refresh", client: "Beenco", ownerId: "me" };
  const files = [{ id: "file-1", name: "social_mockup.png", type: "image/png", size: 1200000, uploadedAt: now.toISOString() }];
  const tasks = [
    makeTask("task-1", project.id, "IM logo", "Create logo exploration for internal motion identity.", "me", "artist", "nadia", "In Progress", "High", date(2), []),
    makeTask("task-2", project.id, "Social media kit", "Export launch social templates and submit for QA.", "me", "artist", "nadia", "In Review", "High", date(1), files),
    makeTask("task-3", project.id, "Brand guideline PDF", "Prepare final brand document package.", "me", "artist", "nadia", "Approved", "Medium", date(6), files),
    makeTask("task-4", project.id, "Delivery archive", "Final handoff package for approved assets.", "me", "nadia", "me", "Delivered", "Low", date(10), files)
  ];
  return { setupDismissed: false, projects: [project], members, tasks, inbox: [inbox("artist", "task-1", "New task assigned", "IM logo was assigned to you."), inbox("me", "task-2", "Task ready for QA", "Social media kit is ready for review.")] };
}

function normalizeStore(value: Partial<Store>): Store {
  const seeded = seedStore();
  return {
    setupDismissed: Boolean(value.setupDismissed),
    projects: value.projects?.length ? value.projects : seeded.projects,
    members: value.members?.length ? value.members : seeded.members,
    inbox: Array.isArray(value.inbox) ? value.inbox : seeded.inbox,
    tasks: Array.isArray(value.tasks) && value.tasks.length
      ? value.tasks.map((task) => ({
          ...task,
          createdBy: task.createdBy || currentUserId,
          assigneeId: task.assigneeId || currentUserId,
          reviewerId: task.reviewerId || reviewerId,
          stage: task.stage || "Brief",
          deadline: task.deadline || "",
          attachments: Array.isArray(task.attachments) ? task.attachments : [],
          subtasks: Array.isArray(task.subtasks) && typeof task.subtasks[0] === "object" ? task.subtasks : makeSubtasks(),
          comments: Array.isArray(task.comments) ? task.comments : [],
          activity: Array.isArray(task.activity) && task.activity[0]?.actor ? task.activity : [activity("migrated task")]
        }))
      : seeded.tasks
  };
}

function makeTask(id: string, projectId: string, title: string, description: string, createdBy: string, assigneeId: string, reviewerId: string, stage: PipelineStage, priority: Priority, deadline: string, attachments: FileItem[]): Task {
  return { id, projectId, createdBy, title, description, assigneeId, reviewerId, stage, priority, deadline, attachments, subtasks: makeSubtasks(), comments: [{ id: `${id}-c`, author: "Nadia Khan", text: "@Muhammad please check naming before delivery.", at: new Date().toISOString() }], activity: [activity(`seeded in ${stage}`)] };
}

function makeSubtasks(): Subtask[] {
  return ["Confirm brief", "Prepare deliverable", "Send for QA"].map((label) => ({ id: crypto.randomUUID(), label, done: false }));
}

function activity(action: string): Activity {
  return { id: crypto.randomUUID(), actor: "Muhammad Hamza", action, at: new Date().toISOString() };
}

function inbox(userId: string, taskId: string, title: string, body: string): InboxItem {
  return { id: crypto.randomUUID(), userId, taskId, title, body, read: false, createdAt: new Date().toISOString() };
}

function nextStage(task: Task): PipelineStage | null {
  const index = PIPELINE_STAGES.indexOf(task.stage);
  return task.stage === "Delivered" ? null : PIPELINE_STAGES[index + 1] || null;
}

function urgency(deadline: string) {
  if (!deadline) return "normal";
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  if (days < 0) return "overdue";
  if (days <= 3) return "soon";
  if (days <= 7) return "week";
  return "normal";
}

function formatDate(value: string) {
  return value ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "No date";
}

function initials(value: string) {
  return value.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function highlightMentions(value: string) {
  return value.replace(/(@[a-zA-Z]+)/g, '<mark class="mention">$1</mark>');
}

function Avatar({ label }: { label: string }) {
  return <span className="bf-avatar">{label}</span>;
}

function Priority({ priority }: { priority: Priority }) {
  return <span className={`bf-priority ${priority.toLowerCase()}`}><i />{priority}</span>;
}

function Logo() {
  return <svg className="bf-logo" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="7" /><path d="M9 9h8.5c3 0 5 1.6 5 4.1 0 1.4-.7 2.5-2 3.1 1.7.6 2.6 1.8 2.6 3.5 0 2.7-2.2 4.3-5.6 4.3H9V9Z" /></svg>;
}

type IconName = "layout" | "check" | "inbox" | "folder" | "list" | "shield" | "send" | "fileText" | "paperclip" | "users" | "user" | "settings" | "plus" | "x" | "chevronRight" | "chevronDown" | "clock" | "upload" | "arrowRight" | "lock";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    layout: "M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z",
    check: "M20 6 9 17l-5-5",
    inbox: "M4 4h16v12h-4l-2 4h-4l-2-4H4V4Z",
    folder: "M3 7h7l2 2h9v9H3V7Z",
    list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
    shield: "M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z",
    send: "M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z",
    fileText: "M6 2h9l5 5v15H6V2Zm8 1v5h5M9 13h6M9 17h6",
    paperclip: "M21 12 12 21a6 6 0 0 1-8-8l9-9a4 4 0 0 1 6 6l-9 9a2 2 0 0 1-3-3l8-8",
    users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87",
    user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
    plus: "M12 5v14M5 12h14",
    x: "M18 6 6 18M6 6l12 12",
    chevronRight: "m9 18 6-6-6-6",
    chevronDown: "m6 9 6 6 6-6",
    clock: "M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    upload: "M12 16V4M7 9l5-5 5 5M5 20h14",
    arrowRight: "M5 12h14M13 5l7 7-7 7",
    lock: "M7 10V8a5 5 0 0 1 10 0v2M6 10h12v11H6V10Z"
  };
  return <svg className="bf-icon" viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name]} /></svg>;
}
