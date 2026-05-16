"use client";

import { useMemo, useState } from "react";

type View = "dashboard" | "work" | "projects" | "tasks" | "review" | "delivery" | "figma" | "docs" | "files" | "team" | "settings";

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
  starred: boolean;
};

const nav: Array<[View, string]> = [
  ["dashboard", "Dashboard"],
  ["work", "My Work List"],
  ["projects", "Projects"],
  ["tasks", "Tasks"],
  ["review", "Review Hub"],
  ["delivery", "Delivery"],
  ["figma", "Figma Work"],
  ["docs", "Docs"],
  ["files", "Files"],
  ["team", "Team"],
  ["settings", "Settings"]
];

const statuses = ["Backlog", "To Do", "In Progress", "Ready for QA", "In QA", "Changes Required", "Rechecking", "Approved", "Ready for Delivery", "Delivered", "Completed"];

export default function BeeFlowApp({ mode = "dashboard" }: { mode?: "dashboard" | "onboarding" }) {
  const [view, setView] = useState<View>(mode === "onboarding" ? "settings" : "dashboard");
  const [workspace, setWorkspace] = useState("");
  const [team, setTeam] = useState<string[]>([]);
  const [projects, setProjects] = useState<string[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modal, setModal] = useState<"" | "workspace" | "team" | "project" | "task" | "figma" | "file" | "doc" | "delivery">("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const setup = useMemo(
    () => [
      ["Create workspace", Boolean(workspace), "workspace"],
      ["Invite team", team.length > 0, "team"],
      ["Create first project", projects.length > 0, "project"],
      ["Create first task", tasks.length > 0, "task"]
    ] as const,
    [workspace, team.length, projects.length, tasks.length]
  );

  const metrics = [
    ["My Tasks", tasks.length, "Create your first task to start your workflow."],
    ["Due Today", tasks.filter((task) => task.dueDate === new Date().toISOString().slice(0, 10)).length, "Tasks due today appear here."],
    ["Overdue", 0, "Overdue work appears here."],
    ["In Review", tasks.filter((task) => ["Ready for QA", "In QA", "Rechecking"].includes(task.status)).length, "QA work appears here."],
    ["Ready for Delivery", tasks.filter((task) => task.status === "Ready for Delivery").length, "Approved work appears here."]
  ];

  function createItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = String(data.get("value") || "").trim();
    if (!value) return;

    if (modal === "workspace") setWorkspace(value);
    if (modal === "team") setTeam((items) => [...items, value]);
    if (modal === "project") setProjects((items) => [...items, value]);
    if (modal === "task") {
      setTasks((items) => [
        ...items,
        { id: crypto.randomUUID(), title: value, status: "Backlog", priority: "Medium", dueDate: "", starred: false }
      ]);
    }
    setModal("");
  }

  return (
    <div className="bf-shell">
      <aside className="bf-sidebar">
        <div className="bf-brand"><span>B</span><div><strong>BeeFlow</strong><small>{workspace || "Beenco workspace"}</small></div></div>
        <nav>
          {nav.map(([key, label]) => (
            <button key={key} className={view === key ? "active" : ""} onClick={() => setView(key)}>{label}</button>
          ))}
        </nav>
      </aside>
      <main className="bf-main">
        <header className="bf-topbar">
          <div><h1>{nav.find(([key]) => key === view)?.[1]}</h1><p>Your work, deadlines, and reviews in one place.</p></div>
          <button onClick={() => setModal("project")} className="secondary">New Project</button>
          <button onClick={() => setModal("task")} className="primary">New Task</button>
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
          {setup.some(([, done]) => !done) ? <section className="bf-panel"><h2>First-time setup</h2><div className="bf-setup">{setup.map(([label, done, type]) => <button key={label} onClick={() => setModal(type)} className={done ? "done" : ""}><span>{done ? "✓" : ""}</span>{label}</button>)}</div></section> : null}
          <div className="bf-metrics">{metrics.map(([label, value, empty]) => <article key={label}><span>{label}</span><strong>{value}</strong><small>{Number(value) ? "Open details from the sidebar." : empty}</small></article>)}</div>
          <section className="bf-panel"><h2>My Work List</h2>{tasks.length ? <TaskList tasks={tasks} /> : <Empty title="No tasks yet." copy="Create your first task to start your workflow." />}</section>
        </div>
      );
    }

    if (view === "projects") return <SimpleCollection title="No projects yet." copy="Create your first project." items={projects} action={() => setModal("project")} actionLabel="New Project" />;
    if (view === "team") return <SimpleCollection title="No team members yet." copy="Invite your first team member." items={team} action={() => setModal("team")} actionLabel="Invite Team" />;
    if (view === "tasks" || view === "work") return <section className="bf-panel">{tasks.length ? <TaskList tasks={tasks} /> : <Empty title="No tasks yet." copy="Create your first task to start your workflow." />}</section>;
    if (view === "review") return <section className="bf-panel"><h2>Review Hub</h2>{tasks.filter((task) => ["Ready for QA", "In QA", "Changes Required", "Rechecking", "Approved"].includes(task.status)).length ? <TaskList tasks={tasks.filter((task) => ["Ready for QA", "In QA", "Changes Required", "Rechecking", "Approved"].includes(task.status))} /> : <Empty title="No QA work yet." copy="Move a task to QA when it is ready for review." />}</section>;
    if (view === "delivery") return <section className="bf-panel"><h2>Delivery</h2><Empty title="No delivery packages yet." copy="Approved delivery work will appear here." /></section>;
    if (view === "figma") return <section className="bf-panel"><h2>Figma Work</h2><Empty title="No Figma links yet." copy="Add Figma metadata after creating a project or task." /></section>;
    if (view === "docs") return <section className="bf-panel"><h2>Docs</h2><Empty title="No docs yet." copy="Create internal docs for SOPs and project notes." /></section>;
    if (view === "files") return <section className="bf-panel"><h2>Files</h2><Empty title="No files yet." copy="Add external file and delivery links." /></section>;
    return <section className="bf-panel"><h2>Settings</h2><p>Workspace: {workspace || "Not created yet"}</p><button className="primary" onClick={() => setModal("workspace")}>Create Workspace</button></section>;
  }

  function TaskList({ tasks: visibleTasks }: { tasks: Task[] }) {
    return <div className="bf-list">{visibleTasks.map((task) => <article key={task.id} onClick={() => setSelectedTask(task)}><button onClick={(event) => { event.stopPropagation(); updateTask(task.id, { starred: !task.starred }); }}>{task.starred ? "★" : "☆"}</button><div><strong>{task.title}</strong><p>{task.status} · {task.priority}</p></div><select value={task.status} onClick={(event) => event.stopPropagation()} onChange={(event) => updateTask(task.id, { status: event.target.value })}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></article>)}</div>;
  }

  function SimpleCollection({ title, copy, items, action, actionLabel }: { title: string; copy: string; items: string[]; action: () => void; actionLabel: string }) {
    return <section className="bf-panel"><button className="primary" onClick={action}>{actionLabel}</button>{items.length ? <div className="bf-cards">{items.map((item) => <article key={item}><strong>{item}</strong></article>)}</div> : <Empty title={title} copy={copy} />}</section>;
  }

  function Empty({ title, copy }: { title: string; copy: string }) {
    return <div className="bf-empty"><strong>{title}</strong><p>{copy}</p></div>;
  }

  function updateTask(id: string, patch: Partial<Task>) {
    setTasks((items) => items.map((item) => item.id === id ? { ...item, ...patch } : item));
    setSelectedTask((task) => task?.id === id ? { ...task, ...patch } : task);
  }

  function deleteTask(id: string) {
    setTasks((items) => items.filter((task) => task.id !== id));
    setSelectedTask(null);
  }
}

function modalTitle(type: string) {
  return ({ workspace: "Create workspace", team: "Invite team member", project: "Create project", task: "Create task", figma: "Add Figma link", file: "Add file", doc: "Create doc", delivery: "Create delivery" } as Record<string, string>)[type] || "Create";
}

function modalPlaceholder(type: string) {
  return ({ workspace: "Workspace name", team: "Team member email", project: "Project name", task: "Task title", figma: "Figma URL", file: "File link", doc: "Doc title", delivery: "Delivery title" } as Record<string, string>)[type] || "Name";
}
