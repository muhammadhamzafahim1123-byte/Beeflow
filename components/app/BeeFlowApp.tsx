"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

type View = "dashboard" | "work" | "projects" | "tasks" | "review" | "delivery" | "figma" | "docs" | "files" | "team" | "settings";
type Modal = "" | "workspace" | "department" | "team" | "project" | "task" | "figma" | "file" | "doc" | "delivery";

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
  starred: boolean;
};

type Store = {
  workspace: string;
  departments: string[];
  team: string[];
  projects: string[];
  tasks: Task[];
};

const STORAGE_KEY = "beeflow:next-shell";

const nav: Array<[View, string, string]> = [
  ["dashboard", "Dashboard", "grid"],
  ["work", "My Work List", "check"],
  ["projects", "Projects", "grid"],
  ["tasks", "Tasks", "list"],
  ["review", "Review Hub", "shield"],
  ["delivery", "Delivery", "folder"],
  ["figma", "Figma Work", "nodes"],
  ["docs", "Docs", "doc"],
  ["files", "Files", "folder"],
  ["team", "Team", "users"],
  ["settings", "Settings", "gear"]
];

const statuses = ["Backlog", "To Do", "In Progress", "Ready for QA", "In QA", "Changes Required", "Rechecking", "Approved", "Ready for Delivery", "Delivered", "Completed"];
const emptyStore: Store = { workspace: "", departments: [], team: [], projects: [], tasks: [] };

export default function BeeFlowApp({ mode = "dashboard" }: { mode?: "dashboard" | "onboarding" }) {
  const [view, setView] = useState<View>(mode === "onboarding" ? "settings" : "dashboard");
  const [store, setStore] = useState<Store>(emptyStore);
  const [modal, setModal] = useState<Modal>("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setStore({ ...emptyStore, ...JSON.parse(saved) });
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }, [hydrated, store]);

  const setup = useMemo(
    () => [
      ["Create workspace", Boolean(store.workspace), "workspace"],
      ["Add department", store.departments.length > 0, "department"],
      ["Invite team members", store.team.length > 0, "team"],
      ["Create first project", store.projects.length > 0, "project"],
      ["Create first task", store.tasks.length > 0, "task"]
    ] as const,
    [store]
  );

  const today = new Date().toISOString().slice(0, 10);
  const reviewStatuses = ["Ready for QA", "In QA", "Changes Required", "Rechecking", "Approved"];
  const metrics = [
    ["My Tasks", store.tasks.length, "Create your first task to start your workflow."],
    ["Due Today", store.tasks.filter((task) => task.dueDate === today).length, "Tasks due today will appear here."],
    ["Overdue", store.tasks.filter((task) => task.dueDate && task.dueDate < today && !["Delivered", "Completed"].includes(task.status)).length, "Overdue work will appear here."],
    ["In Review", store.tasks.filter((task) => ["Ready for QA", "In QA", "Rechecking"].includes(task.status)).length, "QA and review work will appear here."],
    ["Ready for Delivery", store.tasks.filter((task) => task.status === "Ready for Delivery").length, "Approved delivery items will appear here."]
  ];

  function createItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = String(data.get("value") || "").trim();
    if (!value || !modal) return;

    setStore((current) => {
      if (modal === "workspace") return { ...current, workspace: value };
      if (modal === "department") return { ...current, departments: [...current.departments, value] };
      if (modal === "team") return { ...current, team: [...current.team, value] };
      if (modal === "project") return { ...current, projects: [...current.projects, value] };
      if (modal === "task") {
        return {
          ...current,
          tasks: [...current.tasks, { id: crypto.randomUUID(), title: value, status: "Backlog", priority: "Medium", dueDate: "", starred: false }]
        };
      }
      return current;
    });
    setModal("");
  }

  return (
    <div className="bf-shell">
      <aside className="bf-sidebar">
        <div className="bf-brand"><span>B</span><div><strong>BeeFlow</strong><small>{store.workspace || "Setup workspace"}</small></div></div>
        <nav>
          {nav.map(([key, label, icon]) => (
            <button key={key} className={view === key ? "active" : ""} onClick={() => setView(key)}>
              <i data-icon={icon} />
              {label}
            </button>
          ))}
        </nav>
        <div className="bf-sidebar-footer">
          <button className="bf-profile-card" onClick={() => setView("settings")}>
            <span>H</span>
            <strong>hamza</strong>
            <small>muhammadhamzafa...</small>
          </button>
        </div>
      </aside>

      <main className="bf-main">
        <header className="bf-topbar">
          <div><h1>{nav.find(([key]) => key === view)?.[1]}</h1><p>{store.workspace ? store.workspace : "Finish setup to start managing work."}</p></div>
          <label className="bf-search"><span>S</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search workspace" /></label>
          <button onClick={() => setModal("task")} className="primary">+ New Task</button>
          <button className="bf-icon-button" aria-label="Notifications">!</button>
          <button className="bf-user-pill" onClick={() => setView("settings")}><span>H</span>hamza</button>
        </header>
        {renderView()}
      </main>

      {selectedTask ? (
        <aside className="bf-drawer">
          <button className="close" onClick={() => setSelectedTask(null)}>Close</button>
          <h2>{selectedTask.title}</h2>
          <label>Status<select value={selectedTask.status} onChange={(event) => updateTask(selectedTask.id, { status: event.target.value })}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
          <button className="secondary" onClick={() => updateTask(selectedTask.id, { status: "Ready for QA" })}>Move to QA</button>
          <button className="primary" onClick={() => updateTask(selectedTask.id, { status: "Completed" })}>Mark Complete</button>
          <button className="danger" onClick={() => deleteTask(selectedTask.id)}>Delete Task</button>
        </aside>
      ) : null}

      {modal ? (
        <div className="bf-modal-backdrop">
          <form className="bf-modal" onSubmit={createItem}>
            <h2>{modalTitle(modal)}</h2>
            <input name="value" autoFocus placeholder={modalPlaceholder(modal)} />
            <div><button type="button" className="secondary" onClick={() => setModal("")}>Cancel</button><button className="primary">Save</button></div>
          </form>
        </div>
      ) : null}
    </div>
  );

  function renderView() {
    if (view === "dashboard") {
      return (
        <div className="bf-page">
          <div className="bf-page-head"><div><h1>Dashboard</h1><p>Your work, deadlines, and reviews in one place.</p></div><div><button className="primary" onClick={() => setModal("task")}>New Task</button><button className="secondary" onClick={() => setModal("project")}>New Project</button></div></div>
          {setup.some(([, done]) => !done) ? <section className="bf-panel"><div className="bf-panel-title"><h2>First-time setup</h2><span>{setup.filter(([, done]) => done).length}/{setup.length}</span></div><div className="bf-setup">{setup.map(([label, done, type]) => <button key={label} onClick={() => setModal(type)} className={done ? "done" : ""}><span>{done ? "OK" : ""}</span>{label}</button>)}</div></section> : null}
          <div className="bf-metrics">{metrics.map(([label, value, empty]) => <article key={label}><span>{label}</span><strong>{value}</strong><small>{Number(value) ? "Open details from the sidebar." : empty}</small></article>)}</div>
          <div className="bf-dashboard-grid">
            <section className="bf-panel"><div className="bf-panel-title"><h2>My Work List</h2><button onClick={() => setView("work")}>View all</button></div>{store.tasks.length ? <TaskList tasks={visibleTasks(store.tasks)} /> : <Empty title="No tasks yet." copy="Create your first task to start your workflow." />}</section>
            <section className="bf-panel"><div className="bf-panel-title"><h2>Notifications</h2><button>Mark read</button></div><Empty title="No notifications yet." copy="Mentions, reminders, QA changes, and delivery alerts will appear here." /></section>
          </div>
        </div>
      );
    }

    if (view === "projects") return <Page title="Projects" copy="Create projects, attach team members, and track delivery status."><SimpleCollection title="No projects yet." copy="Create your first project." items={store.projects} action={() => setModal("project")} actionLabel="New Project" /></Page>;
    if (view === "team") return <Page title="Team" copy="Invite teammates and organize departments."><SimpleCollection title="No team members yet." copy="Invite your first team member." items={store.team} action={() => setModal("team")} actionLabel="Invite Team" /></Page>;
    if (view === "tasks" || view === "work") return <Page title={view === "work" ? "My Work List" : "Tasks"} copy="Move work through the complete BeeFlow status workflow."><section className="bf-panel">{store.tasks.length ? <TaskList tasks={visibleTasks(store.tasks)} /> : <Empty title="No tasks yet." copy="Create your first task to start your workflow." />}</section></Page>;
    if (view === "review") return <Page title="Review Hub" copy="QA work appears here when tasks are ready for review."><section className="bf-panel">{store.tasks.filter((task) => reviewStatuses.includes(task.status)).length ? <TaskList tasks={store.tasks.filter((task) => reviewStatuses.includes(task.status))} /> : <Empty title="No QA work yet." copy="Move a task to QA when it is ready for review." />}</section></Page>;
    if (view === "delivery") return <Page title="Delivery" copy="Approved files, final links, and delivery packages."><section className="bf-panel"><Empty title="No delivery packages yet." copy="Approved delivery work will appear here." /></section></Page>;
    if (view === "figma") return <Page title="Figma Work" copy="Store Figma links and frame metadata without loading heavy files."><section className="bf-panel"><Empty title="No Figma links yet." copy="Add Figma metadata after creating a project or task." /></section></Page>;
    if (view === "docs") return <Page title="Docs" copy="SOPs, guidelines, briefs, and delivery notes."><section className="bf-panel"><Empty title="No docs yet." copy="Create internal docs for SOPs and project notes." /></section></Page>;
    if (view === "files") return <Page title="Files" copy="External file links and deliverable metadata."><section className="bf-panel"><Empty title="No files yet." copy="Add external file and delivery links." /></section></Page>;
    return <Page title="Settings" copy="Workspace identity and setup."><section className="bf-panel"><p>Workspace: {store.workspace || "Not created yet"}</p><button className="primary" onClick={() => setModal("workspace")}>Create Workspace</button></section></Page>;
  }

  function Page({ title, copy, children }: { title: string; copy: string; children: ReactNode }) {
    return <div className="bf-page"><div className="bf-page-head"><div><h1>{title}</h1><p>{copy}</p></div></div>{children}</div>;
  }

  function TaskList({ tasks }: { tasks: Task[] }) {
    return <div className="bf-list">{tasks.map((task) => <article key={task.id} onClick={() => setSelectedTask(task)}><button onClick={(event) => { event.stopPropagation(); updateTask(task.id, { starred: !task.starred }); }}>{task.starred ? "*" : "Star"}</button><div><strong>{task.title}</strong><p>{task.status} / {task.priority}</p></div><select value={task.status} onClick={(event) => event.stopPropagation()} onChange={(event) => updateTask(task.id, { status: event.target.value })}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></article>)}</div>;
  }

  function SimpleCollection({ title, copy, items, action, actionLabel }: { title: string; copy: string; items: string[]; action: () => void; actionLabel: string }) {
    return <section className="bf-panel"><button className="primary" onClick={action}>{actionLabel}</button>{items.length ? <div className="bf-cards">{items.map((item) => <article key={item}><strong>{item}</strong></article>)}</div> : <Empty title={title} copy={copy} />}</section>;
  }

  function Empty({ title, copy }: { title: string; copy: string }) {
    return <div className="bf-empty"><strong>{title}</strong><p>{copy}</p></div>;
  }

  function visibleTasks(tasks: Task[]) {
    const needle = search.trim().toLowerCase();
    return needle ? tasks.filter((task) => task.title.toLowerCase().includes(needle)) : tasks;
  }

  function updateTask(id: string, patch: Partial<Task>) {
    setStore((current) => ({ ...current, tasks: current.tasks.map((item) => item.id === id ? { ...item, ...patch } : item) }));
    setSelectedTask((task) => task?.id === id ? { ...task, ...patch } : task);
  }

  function deleteTask(id: string) {
    setStore((current) => ({ ...current, tasks: current.tasks.filter((task) => task.id !== id) }));
    setSelectedTask(null);
  }
}

function modalTitle(type: string) {
  return ({ workspace: "Create workspace", department: "Add department", team: "Invite team member", project: "Create project", task: "Create task", figma: "Add Figma link", file: "Add file", doc: "Create doc", delivery: "Create delivery" } as Record<string, string>)[type] || "Create";
}

function modalPlaceholder(type: string) {
  return ({ workspace: "Workspace name", department: "Department name", team: "Team member email", project: "Project name", task: "Task title", figma: "Figma URL", file: "File link", doc: "Doc title", delivery: "Delivery title" } as Record<string, string>)[type] || "Name";
}
