"use client";

import { useEffect, useMemo, useState } from "react";
import { PIPELINE_STAGES, type PipelineStage } from "@/lib/workflow";

type View = "dashboard" | "work" | "projects" | "tasks" | "review" | "delivery" | "docs" | "files" | "team" | "profile" | "settings";
type Priority = "Low" | "Medium" | "High";
type UploadFile = { id: string; name: string; type: string; size: number; uploadedAt: string };
type Member = { id: string; name: string; role: string; department: string; avatar: string; capacity: number };
type Project = { id: string; name: string; client: string; ownerId: string };
type Activity = { id: string; text: string; at: string };
type Comment = { id: string; author: string; text: string; at: string };
type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assigneeId: string;
  reviewerId: string;
  stage: PipelineStage;
  priority: Priority;
  deadline: string;
  attachments: UploadFile[];
  subtasks: string[];
  comments: Comment[];
  activity: Activity[];
  rejectionNote?: string;
  qaStamp?: { reviewer: string; at: string };
  deliveredAt?: string;
};
type Profile = { name: string; role: string; department: string; avatar: string; bio: string; skills: string[]; joinedAt: string };
type Store = { seeded: boolean; setupDismissed: boolean; projects: Project[]; tasks: Task[]; members: Member[]; profile: Profile };

const STORAGE_KEY = "beeflow:vc-ready";
const currentUserId = "me";
const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "video/mp4", "application/zip", "application/x-zip-compressed"];
const maxFileSize = 50 * 1024 * 1024;

const nav: Array<[View, string, IconName]> = [
  ["dashboard", "Dashboard", "layout"],
  ["work", "My Work", "check"],
  ["projects", "Projects", "folder"],
  ["tasks", "Tasks", "list"],
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [rejectingTaskId, setRejectingTaskId] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [upload, setUpload] = useState<{ taskId: string; progress: number; error: string }>({ taskId: "", progress: 0, error: "" });
  const [listSort, setListSort] = useState<"deadline" | "priority" | "assignee">("deadline");
  const [setupCollapsed, setSetupCollapsed] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    setStore(saved ? JSON.parse(saved) : seedStore());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }, [store]);

  const selectedTask = store.tasks.find((task) => task.id === selectedTaskId);
  const currentProject = store.projects[0];
  const dashboardTasks = store.tasks.filter((task) => task.projectId === currentProject?.id);
  const reviewTasks = store.tasks.filter((task) => task.stage === "In Review");
  const delivered = store.tasks.filter((task) => task.stage === "Delivered");

  const stats = [
    ["Active", store.tasks.filter((task) => task.stage !== "Delivered").length, "clock"],
    ["In Review", reviewTasks.length, "shield"],
    ["Approved", store.tasks.filter((task) => task.stage === "Approved").length, "check"],
    ["Delivered", delivered.length, "send"]
  ] as const;

  return (
    <div className="bf-shell">
      <aside className="bf-sidebar">
        <button className="bf-brand" onClick={() => setView("dashboard")} aria-label="BeeFlow dashboard">
          <Logo />
          <span><strong>BeeFlow</strong><small>Workflow OS</small></span>
        </button>
        <nav>
          {nav.map(([key, label, icon]) => (
            <button key={key} className={view === key ? "active" : ""} onClick={() => setView(key)}>
              <Icon name={icon} /> {label}
            </button>
          ))}
        </nav>
        <button className="bf-profile-card" onClick={() => setView("profile")}>
          <Avatar label={store.profile.avatar} />
          <span><strong>{store.profile.name}</strong><small>{store.profile.role}</small></span>
        </button>
      </aside>

      <main className="bf-main">
        <header className="bf-topbar">
          <div><h1>{nav.find(([key]) => key === view)?.[1]}</h1><p>{currentProject?.name || "No project selected"}</p></div>
          <button className="bf-btn secondary" onClick={() => setModal("project")}><Icon name="folder" /> Project</button>
          <button className="bf-btn primary" onClick={() => setModal("task")}><Icon name="plus" /> New Task</button>
        </header>
        {renderView()}
      </main>

      {selectedTask ? <TaskDrawer task={selectedTask} /> : null}
      {modal ? <CreateModal /> : null}
    </div>
  );

  function renderView() {
    if (view === "dashboard" || view === "projects" || view === "tasks") {
      return (
        <section className="bf-page">
          {!store.setupDismissed ? <SetupBanner /> : null}
          <div className="bf-stats">{stats.map(([label, value, icon]) => <article key={label}><Icon name={icon} /><span>{label}</span><strong>{value}</strong></article>)}</div>
          <div className="bf-viewbar">
            <div><h2>{currentProject?.name || "Brand Refresh"}</h2><p>Brief to sign-off pipeline. Cards can only move one stage forward.</p></div>
            <button className="bf-btn secondary" onClick={() => setView(view === "tasks" ? "dashboard" : "tasks")}><Icon name="list" /> {view === "tasks" ? "Board View" : "List View"}</button>
          </div>
          {view === "tasks" ? <ListView /> : <BoardView tasks={dashboardTasks} />}
        </section>
      );
    }
    if (view === "work") return <MyWork />;
    if (view === "review") return <ReviewHub />;
    if (view === "delivery") return <SimplePage title="Delivery" copy="Delivered tasks are locked with approver and timestamp."><TaskRows tasks={delivered} /></SimplePage>;
    if (view === "files") return <SimplePage title="Files" copy="Deliverables attached to task records."><FileIndex /></SimplePage>;
    if (view === "team") return <TeamPage />;
    if (view === "profile") return <ProfilePage />;
    if (view === "docs") return <SimplePage title="Docs" copy="Briefs, QA notes, and delivery SOPs will live here."><div className="bf-empty">No docs yet.</div></SimplePage>;
    return <SimplePage title="Settings" copy="Workflow rules are locked for the demo."><div className="bf-note">Pipeline: {PIPELINE_STAGES.join(" -> ")}</div></SimplePage>;
  }

  function SetupBanner() {
    return (
      <section className="bf-setup">
        <div>
          <button className="bf-disclosure" onClick={() => setSetupCollapsed(!setupCollapsed)}><Icon name={setupCollapsed ? "chevronRight" : "chevronDown"} /> First-time setup</button>
          {!setupCollapsed ? <p>Demo data is loaded. You can skip setup and use the product immediately.</p> : null}
        </div>
        <button className="bf-btn secondary" onClick={() => setStore((current) => ({ ...current, setupDismissed: true }))}><Icon name="x" /> Skip</button>
      </section>
    );
  }

  function BoardView({ tasks }: { tasks: Task[] }) {
    return <div className="bf-board">{PIPELINE_STAGES.map((stage) => <section className="bf-lane" key={stage}><header><strong>{stage}</strong><span>{tasks.filter((task) => task.stage === stage).length}</span></header>{tasks.filter((task) => task.stage === stage).map((task) => <TaskCard key={task.id} task={task} />)}</section>)}</div>;
  }

  function TaskCard({ task }: { task: Task }) {
    const assignee = member(task.assigneeId);
    return (
      <article className={`bf-task urgency-${urgency(task.deadline)}`} draggable={nextStage(task) !== null} onDragStart={(event) => event.dataTransfer.setData("taskId", task.id)} onClick={() => setSelectedTaskId(task.id)}>
        <div className="bf-task-head"><strong>{task.title}</strong><Avatar label={assignee.avatar} /></div>
        <p>{task.description}</p>
        <div className="bf-meta"><PriorityBadge priority={task.priority} /><span className={`date ${urgency(task.deadline)}`}><i />{formatDate(task.deadline)}</span><span>{task.stage}</span></div>
        <div className="bf-files">{task.attachments.slice(0, 2).map((file) => <span key={file.id}><Icon name="paperclip" /> {file.name}</span>)}{task.attachments.length ? <b>{task.attachments.length} files</b> : null}</div>
        {task.rejectionNote ? <div className="bf-reject-note">Rejected: {task.rejectionNote}</div> : null}
        {task.qaStamp ? <div className="bf-qa-stamp">Approved by {task.qaStamp.reviewer}</div> : null}
      </article>
    );
  }

  function ListView() {
    const tasks = [...dashboardTasks].sort((a, b) => {
      if (listSort === "priority") return priorityRank(b.priority) - priorityRank(a.priority);
      if (listSort === "assignee") return member(a.assigneeId).name.localeCompare(member(b.assigneeId).name);
      return a.deadline.localeCompare(b.deadline);
    });
    return <section className="bf-panel"><div className="bf-panel-head"><h2>Task List</h2><select value={listSort} onChange={(event) => setListSort(event.target.value as typeof listSort)}><option value="deadline">Deadline</option><option value="priority">Priority</option><option value="assignee">Assignee</option></select></div><TaskRows tasks={tasks} /></section>;
  }

  function TaskRows({ tasks }: { tasks: Task[] }) {
    return <div className="bf-rows">{tasks.map((task) => <button key={task.id} onClick={() => setSelectedTaskId(task.id)}><span>{task.title}</span><PriorityBadge priority={task.priority} /><span>{member(task.assigneeId).name}</span><span>{formatDate(task.deadline)}</span><span>{task.stage}</span></button>)}</div>;
  }

  function MyWork() {
    const mine = store.tasks.filter((task) => task.assigneeId === currentUserId);
    const groups = [
      ["Overdue", mine.filter((task) => urgency(task.deadline) === "overdue")],
      ["Next 3 days", mine.filter((task) => urgency(task.deadline) === "soon")],
      ["This week", mine.filter((task) => urgency(task.deadline) === "week")],
      ["Later", mine.filter((task) => urgency(task.deadline) === "normal")]
    ] as const;
    return <section className="bf-page">{groups.map(([label, tasks]) => <section className="bf-panel" key={label}><div className="bf-panel-head"><h2>{label}</h2><span>{tasks.length}</span></div><TaskRows tasks={tasks} /></section>)}</section>;
  }

  function ReviewHub() {
    return (
      <SimplePage title="Review Hub" copy="Approve with a name stamp or reject with a required reason.">
        <div className="bf-review-grid">
          {reviewTasks.map((task) => <article className="bf-review" key={task.id}><div><strong>{task.title}</strong><p>Submitted by {member(task.assigneeId).name} · {task.attachments.length} attachments</p></div><div className="bf-files">{task.attachments.map((file) => <span key={file.id}><Icon name="paperclip" /> {file.name}</span>)}</div><textarea value={rejectingTaskId === task.id ? rejectReason : ""} onChange={(event) => { setRejectingTaskId(task.id); setRejectReason(event.target.value); }} placeholder="Leave QA feedback (required to reject)..." /><div><button className="bf-btn approve" onClick={() => approveTask(task.id)}><Icon name="check" /> Approve</button><button className="bf-btn reject" onClick={() => rejectTask(task.id)}><Icon name="x" /> Reject</button></div></article>)}
          {!reviewTasks.length ? <div className="bf-empty">No tasks in review.</div> : null}
        </div>
      </SimplePage>
    );
  }

  function TeamPage() {
    return <SimplePage title="Team" copy="Capacity and ownership at a glance."><div className="bf-team-grid">{store.members.map((person) => <article className="bf-member" key={person.id}><Avatar label={person.avatar} /><div><strong>{person.name}</strong><p>{person.role} · {person.department}</p></div><span>{store.tasks.filter((task) => task.assigneeId === person.id && task.stage !== "Delivered").length} active</span><div className="bf-capacity"><i style={{ width: `${person.capacity}%` }} /></div></article>)}</div></SimplePage>;
  }

  function ProfilePage() {
    const completed = store.tasks.filter((task) => task.stage === "Delivered" && task.assigneeId === currentUserId).length;
    return <SimplePage title="Profile" copy="Identity, role, skills, and delivery history."><section className="bf-profile"><Avatar label={store.profile.avatar} /><div><h2>{store.profile.name}</h2><p>{store.profile.role} · {store.profile.department}</p><p>{store.profile.bio}</p><div>{store.profile.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></div><aside><strong>{store.tasks.filter((task) => task.assigneeId === currentUserId && task.stage !== "Delivered").length}</strong><small>Active</small><strong>94%</strong><small>On-time</small><strong>{completed}</strong><small>Delivered</small></aside></section></SimplePage>;
  }

  function FileIndex() {
    const files = store.tasks.flatMap((task) => task.attachments.map((file) => ({ ...file, taskTitle: task.title })));
    return <div className="bf-rows">{files.map((file) => <button key={file.id}><span>{file.name}</span><span>{file.taskTitle}</span><span>{Math.round(file.size / 1024)}KB</span><span>{formatDate(file.uploadedAt.slice(0, 10))}</span></button>)}</div>;
  }

  function SimplePage({ title, copy, children }: { title: string; copy: string; children: React.ReactNode }) {
    return <section className="bf-page"><div className="bf-viewbar"><div><h2>{title}</h2><p>{copy}</p></div></div>{children}</section>;
  }

  function TaskDrawer({ task }: { task: Task }) {
    const next = nextStage(task);
    return (
      <aside className="bf-drawer">
        <button className="bf-close" onClick={() => setSelectedTaskId("")}><Icon name="x" /></button>
        <h2>{task.title}</h2>
        <p>{task.description}</p>
        <div className="bf-detail-grid">
          <label>Assignee<select value={task.assigneeId} onChange={(event) => patchTask(task.id, { assigneeId: event.target.value })}>{store.members.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select></label>
          <label>Deadline<input type="date" value={task.deadline} onChange={(event) => patchTask(task.id, { deadline: event.target.value })} /></label>
          <label>Status<select value={task.stage} onChange={(event) => moveTask(task, event.target.value as PipelineStage)}>{PIPELINE_STAGES.map((stage) => <option key={stage}>{stage}</option>)}</select></label>
        </div>
        <UploadBox task={task} />
        {task.stage === "In Review" ? <div className="bf-qa-actions"><button className="bf-btn approve" onClick={() => approveTask(task.id)}><Icon name="check" /> Approve</button><button className="bf-btn reject" onClick={() => setRejectingTaskId(task.id)}><Icon name="x" /> Reject</button><textarea value={rejectingTaskId === task.id ? rejectReason : ""} onChange={(event) => { setRejectingTaskId(task.id); setRejectReason(event.target.value); }} placeholder="Reason required to reject" /></div> : null}
        <div className="bf-drawer-actions">{next ? <button className="bf-btn primary" onClick={() => moveTask(task, next)}><Icon name="arrowRight" /> Move to {next}</button> : <button className="bf-btn secondary" disabled><Icon name="lock" /> Locked</button>}</div>
        <section><h3>Subtasks</h3>{task.subtasks.map((item) => <label className="bf-check" key={item}><input type="checkbox" /> {item}</label>)}</section>
        <section><h3>Comments</h3>{task.comments.map((comment) => <p key={comment.id}><strong>{comment.author}</strong> {comment.text}</p>)}<input placeholder="Comment with @mention..." onKeyDown={(event) => addComment(event, task.id)} /></section>
        <section><h3>Activity</h3>{task.activity.map((item) => <p key={item.id}>{item.text} · {new Date(item.at).toLocaleString()}</p>)}</section>
      </aside>
    );
  }

  function UploadBox({ task }: { task: Task }) {
    return (
      <section className="bf-upload" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void handleUpload(task.id, event.dataTransfer.files[0]); }}>
        <Icon name="upload" />
        <span>Drop deliverable here or choose a file</span>
        <input type="file" accept=".pdf,.png,.jpg,.jpeg,.mp4,.zip" onChange={(event) => void handleUpload(task.id, event.target.files?.[0])} />
        {upload.taskId === task.id && upload.progress > 0 ? <div className="bf-progress"><i style={{ width: `${upload.progress}%` }} /></div> : null}
        {upload.taskId === task.id && upload.error ? <small className="bf-error">{upload.error}</small> : null}
        <div className="bf-files">{task.attachments.map((file) => <span key={file.id}><Icon name="paperclip" /> {file.name}</span>)}</div>
      </section>
    );
  }

  function CreateModal() {
    return (
      <div className="bf-modal-backdrop">
        <form className="bf-modal" onSubmit={modal === "task" ? createTask : createSimple}>
          <h2>{modal === "task" ? "Create task" : modal === "project" ? "Create project" : "Invite member"}</h2>
          {modal === "task" ? (
            <>
              <Field name="title" label="Task name" error={formErrors.title} />
              <label>Assignee<select name="assigneeId" defaultValue=""><option value="">Choose assignee</option>{store.members.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select>{formErrors.assigneeId ? <small>{formErrors.assigneeId}</small> : null}</label>
              <label>Deadline<input name="deadline" type="date" />{formErrors.deadline ? <small>{formErrors.deadline}</small> : null}</label>
              <label>Priority<select name="priority" defaultValue=""><option value="">Choose priority</option><option>Low</option><option>Medium</option><option>High</option></select>{formErrors.priority ? <small>{formErrors.priority}</small> : null}</label>
              <Field name="description" label="Description" error={formErrors.description} />
            </>
          ) : <Field name="title" label={modal === "project" ? "Project name" : "Member name"} error={formErrors.title} />}
          <div className="bf-modal-actions"><button type="button" className="bf-btn secondary" onClick={() => { setModal(""); setFormErrors({}); }}><Icon name="x" /> Cancel</button><button className="bf-btn primary"><Icon name="check" /> Save</button></div>
        </form>
      </div>
    );
  }

  function Field({ name, label, error }: { name: string; label: string; error?: string }) {
    return <label>{label}<input name={name} />{error ? <small>{error}</small> : null}</label>;
  }

  function createTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const errors = {
      title: !String(data.get("title") || "").trim() ? "Task name is required." : "",
      assigneeId: !String(data.get("assigneeId") || "") ? "Assignee is required." : "",
      deadline: !String(data.get("deadline") || "") ? "Deadline is required." : "",
      priority: !String(data.get("priority") || "") ? "Priority is required." : ""
    };
    setFormErrors(Object.fromEntries(Object.entries(errors).filter(([, value]) => value)));
    if (Object.values(errors).some(Boolean)) return;
    const task: Task = {
      id: crypto.randomUUID(),
      projectId: currentProject.id,
      title: String(data.get("title")),
      description: String(data.get("description") || "No description yet."),
      assigneeId: String(data.get("assigneeId")),
      reviewerId: "nadia",
      stage: "Brief",
      priority: String(data.get("priority")) as Priority,
      deadline: String(data.get("deadline")),
      attachments: [],
      subtasks: ["Confirm brief", "Prepare deliverable", "Send for QA"],
      comments: [],
      activity: [activity("Task created")]
    };
    setStore((current) => ({ ...current, tasks: [task, ...current.tasks] }));
    setModal("");
    setFormErrors({});
  }

  function createSimple(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("title") || "").trim();
    if (!value) {
      setFormErrors({ title: "This field is required." });
      return;
    }
    setStore((current) => {
      if (modal === "project") return { ...current, projects: [...current.projects, { id: crypto.randomUUID(), name: value, client: "Internal", ownerId: currentUserId }] };
      if (modal === "member") return { ...current, members: [...current.members, { id: crypto.randomUUID(), name: value, role: "Designer", department: "Creative", avatar: initials(value), capacity: 35 }] };
      return current;
    });
    setModal("");
    setFormErrors({});
  }

  async function moveTask(task: Task, to: PipelineStage) {
    const response = await fetch("/api/tasks/transition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: task.stage, to, attachmentCount: task.attachments.length, reviewerName: to === "Approved" ? member(task.reviewerId).name : "" })
    });
    const result = await response.json();
    if (!result.ok) {
      patchTask(task.id, { activity: [activity(result.message), ...task.activity] });
      return;
    }
    patchTask(task.id, {
      stage: to,
      deliveredAt: to === "Delivered" ? new Date().toISOString() : task.deliveredAt,
      activity: [activity(`Moved to ${to}`), ...task.activity]
    });
  }

  async function handleUpload(taskId: string, file?: File) {
    if (!file) return;
    if (!allowedTypes.includes(file.type)) return setUpload({ taskId, progress: 0, error: "Supported files: PDF, PNG, JPG, MP4, ZIP." });
    if (file.size > maxFileSize) return setUpload({ taskId, progress: 0, error: "File must be 50MB or smaller." });
    setUpload({ taskId, progress: 25, error: "" });
    const form = new FormData();
    form.set("taskId", taskId);
    form.set("file", file);
    setUpload({ taskId, progress: 65, error: "" });
    const response = await fetch("/api/tasks/upload", { method: "POST", body: form });
    const result = await response.json();
    if (!result.ok) return setUpload({ taskId, progress: 0, error: result.message });
    setUpload({ taskId, progress: 100, error: "" });
    setStore((current) => ({ ...current, tasks: current.tasks.map((task) => task.id === taskId ? { ...task, attachments: [...task.attachments, result.file], activity: [activity(`Uploaded ${result.file.name}`), ...task.activity] } : task) }));
    window.setTimeout(() => setUpload({ taskId: "", progress: 0, error: "" }), 700);
  }

  function approveTask(taskId: string) {
    const task = store.tasks.find((item) => item.id === taskId);
    if (!task) return;
    void moveTask({ ...task, reviewerId: currentUserId }, "Approved");
    patchTask(taskId, { qaStamp: { reviewer: store.profile.name, at: new Date().toISOString() }, rejectionNote: "" });
  }

  function rejectTask(taskId: string) {
    const task = store.tasks.find((item) => item.id === taskId);
    if (!task || !rejectReason.trim()) {
      setRejectingTaskId(taskId);
      return;
    }
    patchTask(taskId, { stage: "In Progress", rejectionNote: rejectReason.trim(), activity: [activity(`Rejected: ${rejectReason.trim()}`), ...task.activity] });
    setRejectReason("");
    setRejectingTaskId("");
  }

  function addComment(event: React.KeyboardEvent<HTMLInputElement>, taskId: string) {
    if (event.key !== "Enter") return;
    const value = event.currentTarget.value.trim();
    if (!value) return;
    const task = store.tasks.find((item) => item.id === taskId);
    if (!task) return;
    patchTask(taskId, { comments: [...task.comments, { id: crypto.randomUUID(), author: store.profile.name, text: value, at: new Date().toISOString() }] });
    event.currentTarget.value = "";
  }

  function patchTask(taskId: string, patch: Partial<Task>) {
    setStore((current) => ({ ...current, tasks: current.tasks.map((task) => task.id === taskId ? { ...task, ...patch } : task) }));
    setSelectedTaskId(taskId);
  }

  function member(id: string) {
    return store.members.find((person) => person.id === id) || store.members[0];
  }
}

function seedStore(): Store {
  const now = new Date();
  const date = (offset: number) => new Date(now.getTime() + offset * 86400000).toISOString().slice(0, 10);
  const files: UploadFile[] = [
    { id: "file-brand", name: "brand_kit.pdf", type: "application/pdf", size: 4200000, uploadedAt: now.toISOString() },
    { id: "file-social", name: "social_mockup.png", type: "image/png", size: 1800000, uploadedAt: now.toISOString() }
  ];
  const members: Member[] = [
    { id: "me", name: "Muhammad Hamza", role: "Creative Director", department: "Design", avatar: "H", capacity: 72 },
    { id: "nadia", name: "Nadia Khan", role: "QA Reviewer", department: "QA", avatar: "N", capacity: 44 }
  ];
  const project = { id: "project-brand-refresh", name: "Brand Refresh", client: "Beenco", ownerId: "me" };
  return {
    seeded: true,
    setupDismissed: false,
    projects: [project],
    members,
    profile: { name: "Muhammad Hamza", role: "Creative Director", department: "Design", avatar: "H", bio: "Leads brand systems, QA sign-off, and delivery quality for BeeFlow.", skills: ["Brand strategy", "Typography", "Motion design"], joinedAt: date(-180) },
    tasks: [
      task("task-brief", project.id, "Finalize creative brief", "Lock scope, references, and deliverable list.", "me", "nadia", "Brief", "Medium", date(5), []),
      task("task-social", project.id, "Social media kit", "Design launch assets and export approved sizes.", "me", "nadia", "In Review", "High", date(2), files),
      task("task-video", project.id, "Launch teaser edit", "Cut a short launch motion piece for review.", "me", "nadia", "In Progress", "High", date(-1), []),
      task("task-delivery", project.id, "Package final brand files", "Prepare final files for delivery handoff.", "nadia", "me", "Approved", "Low", date(8), [files[0]])
    ]
  };
}

function task(id: string, projectId: string, title: string, description: string, assigneeId: string, reviewerId: string, stage: PipelineStage, priority: Priority, deadline: string, attachments: UploadFile[]): Task {
  return { id, projectId, title, description, assigneeId, reviewerId, stage, priority, deadline, attachments, subtasks: ["Review brief", "Produce output", "Attach deliverable"], comments: [{ id: `${id}-comment`, author: "Nadia Khan", text: "@Muhammad please keep the export names clean.", at: new Date().toISOString() }], activity: [activity(`Seeded in ${stage}`)] };
}

function activity(text: string): Activity {
  return { id: crypto.randomUUID(), text, at: new Date().toISOString() };
}

function nextStage(task: Task): PipelineStage | null {
  if (task.stage === "Delivered") return null;
  const index = PIPELINE_STAGES.indexOf(task.stage);
  return PIPELINE_STAGES[index + 1] || null;
}

function priorityRank(priority: Priority) {
  return { Low: 1, Medium: 2, High: 3 }[priority];
}

function urgency(deadline: string) {
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  if (days < 0) return "overdue";
  if (days <= 3) return "soon";
  if (days <= 7) return "week";
  return "normal";
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function initials(value: string) {
  return value.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function Avatar({ label }: { label: string }) {
  return <span className="bf-avatar">{label}</span>;
}

function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={`bf-priority ${priority.toLowerCase()}`}><i />{priority}</span>;
}

function Logo() {
  return <svg className="bf-logo" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="7" /><path d="M9 9h8.5c3 0 5 1.6 5 4.1 0 1.4-.7 2.5-2 3.1 1.7.6 2.6 1.8 2.6 3.5 0 2.7-2.2 4.3-5.6 4.3H9V9Zm7.8 6.1c1.3 0 2-.5 2-1.5s-.7-1.5-2-1.5h-4v3h4Zm.5 5.8c1.4 0 2.2-.6 2.2-1.7s-.8-1.7-2.2-1.7h-4.5v3.4h4.5Z" /></svg>;
}

type IconName = "layout" | "check" | "folder" | "list" | "shield" | "send" | "fileText" | "paperclip" | "users" | "user" | "settings" | "plus" | "x" | "chevronRight" | "chevronDown" | "clock" | "upload" | "arrowRight" | "lock";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    layout: "M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z",
    check: "M20 6 9 17l-5-5",
    folder: "M3 7h7l2 2h9v9H3V7Z",
    list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
    shield: "M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z",
    send: "M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z",
    fileText: "M6 2h9l5 5v15H6V2Zm8 1v5h5M9 13h6M9 17h6",
    paperclip: "M21 12 12 21a6 6 0 0 1-8-8l9-9a4 4 0 0 1 6 6l-9 9a2 2 0 0 1-3-3l8-8",
    users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 3-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21h-3.6v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-2-3 .1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4v-3.4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2-3 .1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3h3.6v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 2 3-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1v3.4h-.1a1.7 1.7 0 0 0-1.6 1Z",
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
