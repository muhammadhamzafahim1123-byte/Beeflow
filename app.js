const STORAGE_KEY = "beeflow:v2";

const taskStatuses = [
  "Backlog",
  "To Do",
  "In Progress",
  "Ready for QA",
  "In QA",
  "Changes Required",
  "Rechecking",
  "Approved",
  "Ready for Delivery",
  "Delivered",
  "Completed",
];

const priorities = ["Low", "Medium", "High", "Urgent", "Critical"];
const roles = ["Owner / Admin", "Project Manager", "Designer", "Content Writer", "Developer", "QA / Reviewer", "Video / Motion Designer"];
const departments = ["Design", "UI/UX", "Development", "Web3", "Content", "Video", "QA", "Management"];
const docCategories = ["Brand Guidelines", "Content Guidelines", "Creative Direction", "QA Checklist", "Client Notes", "Delivery SOP", "Internal Process"];
const qaStatuses = ["Open", "In Progress", "Fixed", "Rechecking", "Approved", "Rejected"];
const qaTabs = ["Ready for QA", "In QA", "Changes Required", "Rechecking", "Approved"];
const creativeTypes = ["UI/UX Design", "Brand Design", "Landing Page", "Website Design", "Social Post", "Presentation", "Animation", "Video", "Development", "Content", "QA Fix", "Client Feedback", "Final Delivery"];
const commonSizes = ["1080 x 1080", "1080 x 1350", "1080 x 1920", "1920 x 1080", "1500 x 500", "1920 x 600", "1440 x 900", "1440 x 1024", "390 x 844", "Custom"];

const navItems = [
  ["dashboard", "Dashboard", "dashboard"],
  ["work", "My Work List", "checklist"],
  ["projects", "Projects", "grid"],
  ["tasks", "Tasks", "tasks"],
  ["review", "Review Hub", "shieldCheck"],
  ["delivery", "Delivery", "folder"],
  ["figma", "Figma Work", "figma"],
  ["docs", "Docs", "document"],
  ["files", "Files", "folder"],
  ["team", "Team", "users"],
  ["settings", "Settings", "settings"],
];

const svgPaths = {
  dashboard: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h3A2.5 2.5 0 0 1 12 5.5v3A2.5 2.5 0 0 1 9.5 11h-3A2.5 2.5 0 0 1 4 8.5v-3Zm8 0A2.5 2.5 0 0 1 14.5 3h3A2.5 2.5 0 0 1 20 5.5v1A2.5 2.5 0 0 1 17.5 9h-3A2.5 2.5 0 0 1 12 6.5v-1ZM4 15.5A2.5 2.5 0 0 1 6.5 13h3a2.5 2.5 0 0 1 2.5 2.5v3A2.5 2.5 0 0 1 9.5 21h-3A2.5 2.5 0 0 1 4 18.5v-3Zm8-2A2.5 2.5 0 0 1 14.5 11h3a2.5 2.5 0 0 1 2.5 2.5v5a2.5 2.5 0 0 1-2.5 2.5h-3a2.5 2.5 0 0 1-2.5-2.5v-5Z"/>',
  checklist: '<path d="M6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11A2.5 2.5 0 0 1 6.5 4Zm9.65 5.7a1 1 0 0 0-1.42-1.4l-4.05 4.1-1.43-1.44a1 1 0 0 0-1.42 1.41l2.14 2.15a1 1 0 0 0 1.42 0l4.76-4.82Z"/>',
  grid: '<path d="M5.5 4h4A1.5 1.5 0 0 1 11 5.5v4A1.5 1.5 0 0 1 9.5 11h-4A1.5 1.5 0 0 1 4 9.5v-4A1.5 1.5 0 0 1 5.5 4Zm9 0h4A1.5 1.5 0 0 1 20 5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 13 9.5v-4A1.5 1.5 0 0 1 14.5 4Zm-9 9h4a1.5 1.5 0 0 1 1.5 1.5v4A1.5 1.5 0 0 1 9.5 20h-4A1.5 1.5 0 0 1 4 18.5v-4A1.5 1.5 0 0 1 5.5 13Zm9 0h4a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a1.5 1.5 0 0 1-1.5-1.5v-4a1.5 1.5 0 0 1 1.5-1.5Z"/>',
  tasks: '<path d="M5 5.5A1.5 1.5 0 0 1 6.5 4h11A1.5 1.5 0 0 1 19 5.5v1A1.5 1.5 0 0 1 17.5 8h-11A1.5 1.5 0 0 1 5 6.5v-1Zm0 6A1.5 1.5 0 0 1 6.5 10h8a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-1Zm0 6A1.5 1.5 0 0 1 6.5 16h11a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18.5v-1Z"/>',
  users: '<path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7.2 1a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4ZM3 18.2C3 15.3 5.7 13 9 13s6 2.3 6 5.2c0 1-.8 1.8-1.8 1.8H4.8A1.8 1.8 0 0 1 3 18.2Zm12.7-3.8c.8-.3 1.7-.4 2.7-.2 1.9.4 3.6 1.9 3.6 3.9 0 .8-.7 1.5-1.5 1.5h-4c.3-.4.5-.9.5-1.4 0-1.4-.5-2.7-1.3-3.8Z"/>',
  shieldCheck: '<path d="M11.4 2.2a2 2 0 0 1 1.2 0l6 2.1A2 2 0 0 1 20 6.2v4.9c0 4.4-2.7 8.4-6.8 10.1a3 3 0 0 1-2.4 0A11 11 0 0 1 4 11.1V6.2a2 2 0 0 1 1.4-1.9l6-2.1Zm5.1 7.2a1 1 0 0 0-1.5-1.3l-3.8 4.4-1.7-1.7a1 1 0 1 0-1.4 1.4l2.5 2.5a1 1 0 0 0 1.5-.1l4.4-5.2Z"/>',
  figma: '<path d="M9.5 3h3A3.5 3.5 0 0 1 16 6.5 3.5 3.5 0 0 1 12.5 10h-3a3.5 3.5 0 1 1 0-7Zm0 7h3a3.5 3.5 0 1 1 0 7h-3v-7Zm0 7H12a3.5 3.5 0 1 1-2.5 1.05V17Zm-3-7h3v7h-3a3.5 3.5 0 1 1 0-7Zm0-7h3v7h-3a3.5 3.5 0 1 1 0-7Z"/>',
  document: '<path d="M7 3h6.8c.5 0 1 .2 1.4.6l3.2 3.2c.4.4.6.9.6 1.4V19a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm7 1.8V8h3.2L14 4.8ZM8 12a1 1 0 0 0 0 2h8a1 1 0 1 0 0-2H8Zm0 4a1 1 0 1 0 0 2h5a1 1 0 1 0 0-2H8Z"/>',
  folder: '<path d="M4 7a3 3 0 0 1 3-3h3.3c.8 0 1.5.3 2.1.9l1.2 1.2c.2.2.4.3.7.3H17a3 3 0 0 1 3 3v7.1a3.5 3.5 0 0 1-3.5 3.5h-9A3.5 3.5 0 0 1 4 16.5V7Z"/>',
  settings: '<path d="M10.8 2.5h2.4l.5 2a7.7 7.7 0 0 1 1.5.6l1.8-1.1 1.7 1.7-1.1 1.8c.3.5.5 1 .6 1.5l2 .5v2.4l-2 .5c-.1.5-.3 1-.6 1.5l1.1 1.8-1.7 1.7-1.8-1.1c-.5.3-1 .5-1.5.6l-.5 2h-2.4l-.5-2a7.7 7.7 0 0 1-1.5-.6L7 18.4l-1.7-1.7 1.1-1.8c-.3-.5-.5-1-.6-1.5l-2-.5v-2.4l2-.5c.1-.5.3-1 .6-1.5L5.3 5.7 7 4l1.8 1.1c.5-.3 1-.5 1.5-.6l.5-2ZM12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/>',
  search: '<path d="M10.5 4a6.5 6.5 0 0 1 5.1 10.5l3.2 3.2a1 1 0 0 1-1.4 1.4l-3.2-3.2A6.5 6.5 0 1 1 10.5 4Zm0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z"/>',
  bell: '<path d="M12 3a5 5 0 0 0-5 5v2.7c0 .7-.3 1.3-.7 1.8L5 13.8A2.5 2.5 0 0 0 6.8 18h10.4a2.5 2.5 0 0 0 1.8-4.2l-1.3-1.3c-.4-.5-.7-1.1-.7-1.8V8a5 5 0 0 0-5-5Zm-2.2 16a2.3 2.3 0 0 0 4.4 0H9.8Z"/>',
  plus: '<path d="M11 5a1 1 0 0 1 2 0v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H5a1 1 0 1 1 0-2h6V5Z"/>',
  star: '<path d="M10.9 3.7a1.2 1.2 0 0 1 2.2 0l1.8 3.7 4.1.6a1.2 1.2 0 0 1 .7 2l-3 2.9.7 4.1a1.2 1.2 0 0 1-1.7 1.3L12 16.4l-3.7 1.9A1.2 1.2 0 0 1 6.6 17l.7-4.1-3-2.9A1.2 1.2 0 0 1 5 8l4.1-.6 1.8-3.7Z"/>',
};

const $ = (selector) => document.querySelector(selector);
const uid = (prefix) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
const todayISO = () => new Date().toISOString().slice(0, 10);
const tomorrowISO = () => new Date(Date.now() + 86400000).toISOString().slice(0, 10);
const icon = (name) => `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true">${svgPaths[name] || svgPaths.dashboard}</svg>`;
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);

function defaultState() {
  return {
    meta: { isAuthenticated: false, pendingEmail: "", verificationCode: "", verificationSent: false, loginError: "", role: "", workspaceName: "", departments: [], activeView: "dashboard", search: "", selectedTaskId: "", qaTab: "Ready for QA", projectView: "list" },
    currentUser: { id: "me", name: "", email: "", role: "", department: "", avatar: "" },
    projects: [],
    tasks: [],
    team: [],
    tags: [],
    docs: [],
    files: [],
    deliveries: [],
    figma: [],
    qaIssues: [],
    reminders: [],
    notifications: [],
    activity: [],
  };
}

let state = loadState();
let modal = null;
let drawerTaskId = "";
let toast = "";

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultState();
    const parsed = JSON.parse(saved);
    const base = defaultState();
    return { ...base, ...parsed, meta: { ...base.meta, ...(parsed.meta || {}) }, currentUser: { ...base.currentUser, ...(parsed.currentUser || {}) } };
  } catch {
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setView(view) {
  state.meta.activeView = view;
  saveState();
  render();
}

function notify(title, taskId = "") {
  state.notifications.unshift({ id: uid("notification"), title, taskId, read: false, createdAt: new Date().toISOString() });
}

function logActivity(message, taskId = "") {
  state.activity.unshift({ id: uid("activity"), message, taskId, createdAt: new Date().toISOString() });
}

function userOptions(selected = "") {
  const people = [state.currentUser, ...state.team];
  return `<option value="">Unassigned</option>${people.map((user) => `<option value="${user.id}" ${selected === user.id ? "selected" : ""}>${escapeHtml(user.name || user.email || "Unnamed")}</option>`).join("")}`;
}

function projectOptions(selected = "") {
  return `<option value="">No project</option>${state.projects.map((project) => `<option value="${project.id}" ${selected === project.id ? "selected" : ""}>${escapeHtml(project.name)}</option>`).join("")}`;
}

function taskOptions(selected = "") {
  return `<option value="">No task</option>${state.tasks.map((task) => `<option value="${task.id}" ${selected === task.id ? "selected" : ""}>${escapeHtml(task.title)}</option>`).join("")}`;
}

function optionList(values, selected = "") {
  return values.map((value) => `<option value="${value}" ${selected === value ? "selected" : ""}>${value}</option>`).join("");
}

function personName(id) {
  if (!id) return "Unassigned";
  const person = [state.currentUser, ...state.team].find((user) => user.id === id);
  return person ? person.name || person.email || "Unnamed" : "Unknown";
}

function projectName(id) {
  const project = state.projects.find((item) => item.id === id);
  return project ? project.name : "No project";
}

function taskName(id) {
  const task = state.tasks.find((item) => item.id === id);
  return task ? task.title : "No task";
}

function isOverdue(task) {
  return task.dueDate && task.status !== "Completed" && task.status !== "Delivered" && task.dueDate < todayISO();
}

function taskNeedsQA(task) {
  return ["UI/UX Design", "Brand Design", "Landing Page", "Website Design", "Social Post", "Presentation", "Animation", "Video", "Content", "QA Fix", "Client Feedback", "Final Delivery"].includes(task.taskType);
}

function myWorkTasks() {
  const priorityScore = { Critical: 80, Urgent: 70, High: 50, Medium: 20, Low: 10 };
  return state.tasks
    .filter((task) => task.assigneeId === "me" || task.reviewerId === "me" || task.mentionedUserIds?.includes("me") || task.starredBy?.includes("me") || isOverdue(task) || task.dueDate === todayISO() || ["Changes Required", "Ready for QA"].includes(task.status))
    .sort((a, b) => {
      const score = (task) =>
        (priorityScore[task.priority] || 0) +
        (isOverdue(task) ? 60 : 0) +
        (task.dueDate === todayISO() ? 45 : 0) +
        (task.mentionedUserIds?.includes("me") ? 30 : 0) +
        (task.starredBy?.includes("me") ? 20 : 0);
      return score(b) - score(a);
    });
}

function setupSteps() {
  return [
    ["Create workspace", Boolean(state.meta.workspaceName), "workspace"],
    ["Add department", state.meta.departments.length > 0, "department"],
    ["Invite team members", state.team.length > 0, "team"],
    ["Create first project", state.projects.length > 0, "project"],
    ["Create first task", state.tasks.length > 0, "task"],
  ];
}

function render() {
  state.meta.isAuthenticated = true;
  state.meta.role = state.meta.role || "Owner / Admin";
  state.currentUser.name = state.currentUser.name || "Beenco User";
  state.currentUser.email = state.currentUser.email || "team@beenco.io";
  state.currentUser.avatar = state.currentUser.avatar || "BU";

  $("#app").innerHTML = `
    <div class="app-shell">
      ${renderSidebar()}
      <main class="main">
        ${renderTopbar()}
        <section class="page fade-in">${renderView()}</section>
      </main>
      ${drawerTaskId ? renderTaskDrawer() : ""}
      ${modal ? renderModal() : ""}
      ${toast ? `<div class="toast">${escapeHtml(toast)}</div>` : ""}
    </div>
  `;
  bindEvents();
}

function renderRoleGate() {
  return `
    <main class="onboarding-screen">
      <section class="onboarding-card fade-in">
        <div class="brand-row"><span class="brand-mark">B</span><div><strong>BeeFlow</strong><small>${escapeHtml(state.currentUser.email)}</small></div></div>
        <h1>Who are you?</h1>
        <p>Choose your role so BeeFlow can shape your first workspace around the work you manage every day.</p>
        <div class="role-grid">
          ${roles.map((role) => `<button class="role-card" data-action="select-role" data-role="${role}">${role}</button>`).join("")}
        </div>
      </section>
    </main>
  `;
}

function renderLogin() {
  const hasCode = Boolean(state.meta.pendingEmail && state.meta.verificationCode);
  return `
    <main class="onboarding-screen">
      <form class="onboarding-card fade-in" data-form="${hasCode ? "verifyLogin" : "login"}">
        <div class="brand-row"><span class="brand-mark">B</span><div><strong>BeeFlow</strong><small>Verified workspace login</small></div></div>
        <h1>${hasCode ? "Enter verification code" : "Login to BeeFlow"}</h1>
        <p>${hasCode ? `We sent a one-time verification code to ${escapeHtml(state.meta.pendingEmail)}. Check your inbox and enter the code below.` : "Use your work email. BeeFlow will send a one-time code before opening the workspace."}</p>
        ${state.meta.loginError ? `<div class="form-error">${escapeHtml(state.meta.loginError)}</div>` : ""}
        ${hasCode ? `${field("code", "Verification code", "", "6 digit code", true, "text")}` : `${field("name", "Your name", state.currentUser.name, "Your name", true)}${field("email", "Work email", state.currentUser.email, "you@beenco.io", true, "email")}`}
        <div class="modal-actions">
          ${hasCode ? `<button type="button" class="secondary" data-action="restart-login">Use another email</button><button type="button" class="secondary" data-action="resend-code">Resend code</button>` : ""}
          <button class="primary" type="submit">${hasCode ? "Verify and continue" : "Send verification code"}</button>
        </div>
      </form>
    </main>
  `;
}

function renderSidebar() {
  return `
    <aside class="sidebar">
      <div class="brand"><span class="brand-mark">B</span><div><strong>BeeFlow</strong><small>${escapeHtml(state.meta.workspaceName || "Setup workspace")}</small></div></div>
      <nav class="nav">
        ${navItems.map(([view, label, iconName]) => `<button class="nav-item ${state.meta.activeView === view ? "active" : ""}" data-view="${view}"><span>${icon(iconName)}</span>${label}</button>`).join("")}
      </nav>
      <div class="sidebar-footer">
        <button class="profile-card" data-action="open-modal" data-modal="profile">
          <span class="avatar mini">${escapeHtml(currentInitials())}</span>
          <span><strong>${escapeHtml(state.currentUser.name || "Profile")}</strong><small>${escapeHtml(state.currentUser.email || "Add email")}</small></span>
        </button>
        <button class="secondary full" data-action="load-demo">Load demo workspace</button>
      </div>
    </aside>
  `;
}

function renderTopbar() {
  const pageLabel = navItems.find(([view]) => view === state.meta.activeView)?.[1] || "Dashboard";
  return `
    <header class="topbar">
      <div>
        <h2>${pageLabel}</h2>
        <p>${state.meta.workspaceName ? escapeHtml(state.meta.workspaceName) : "Finish setup to start managing work."}</p>
      </div>
      <label class="searchbar">${icon("search")}<input data-action="search" value="${escapeHtml(state.meta.search)}" placeholder="Search workspace" /></label>
      <button class="primary" data-action="open-modal" data-modal="task">${icon("plus")} New Task</button>
      <button class="icon-btn" data-action="toggle-notifications" title="Notifications">${icon("bell")}${unreadCount() ? `<span>${unreadCount()}</span>` : ""}</button>
      <button class="profile-pill" data-action="open-modal" data-modal="profile"><span class="avatar tiny">${escapeHtml(currentInitials())}</span>${escapeHtml(state.currentUser.name || state.meta.role)}</button>
    </header>
  `;
}

function currentInitials() {
  return state.currentUser.avatar || initials(state.currentUser.name || state.currentUser.email || "You");
}

function unreadCount() {
  return state.notifications.filter((item) => !item.read).length;
}

function renderView() {
  const views = {
    dashboard: renderDashboard,
    work: renderMyWork,
    projects: renderProjects,
    tasks: renderTasks,
    review: renderReview,
    delivery: renderDelivery,
    figma: renderFigma,
    docs: renderDocs,
    files: renderFiles,
    team: renderTeam,
    settings: renderSettings,
  };
  return views[state.meta.activeView]();
}

function pageHead(title, subtitle, actions = "") {
  return `<div class="page-head"><div><h1>${title}</h1><p>${subtitle}</p></div><div class="page-actions">${actions}</div></div>`;
}

function renderSetupPanel() {
  const steps = setupSteps();
  if (steps.every(([, done]) => done)) return "";
  return `
    <section class="panel setup-panel">
      <div class="panel-title"><h3>First-time setup</h3><span>${steps.filter(([, done]) => done).length}/${steps.length}</span></div>
      <div class="setup-list">
        ${steps.map(([label, done, modalName]) => `<button class="setup-step ${done ? "done" : ""}" data-action="open-modal" data-modal="${modalName}"><span>${done ? "✓" : ""}</span><strong>${label}</strong></button>`).join("")}
      </div>
    </section>
  `;
}

function renderDashboard() {
  const metrics = [
    ["My Tasks", state.tasks.filter((task) => task.assigneeId === "me" && task.status !== "Completed").length, "Create your first task to start your workflow."],
    ["Due Today", state.tasks.filter((task) => task.dueDate === todayISO()).length, "Tasks due today will appear here."],
    ["Overdue", state.tasks.filter(isOverdue).length, "Overdue work will appear here."],
    ["In Review", state.tasks.filter((task) => ["Ready for QA", "In QA", "Rechecking"].includes(task.status)).length, "QA and review work will appear here."],
    ["Ready for Delivery", state.tasks.filter((task) => task.status === "Ready for Delivery").length, "Approved delivery items will appear here."],
  ];
  return `
    ${pageHead("Dashboard", "Your work, deadlines, and reviews in one place.", `<button class="primary" data-action="open-modal" data-modal="task">New Task</button><button class="secondary" data-action="open-modal" data-modal="project">New Project</button>`)}
    ${renderSetupPanel()}
    <div class="metric-grid">${metrics.map(([label, value, empty]) => `<article class="metric-card"><span>${label}</span><strong>${value}</strong><small>${value ? "Open details from the sidebar." : empty}</small></article>`).join("")}</div>
    <div class="dashboard-grid">
      <section class="panel">
        <div class="panel-title"><h3>My Work List</h3><button class="text-btn" data-view="work">View all</button></div>
        ${renderTaskList(myWorkTasks().slice(0, 6), "No tasks yet.", "Create your first task to start your workflow.")}
      </section>
      <section class="panel">
        <div class="panel-title"><h3>Notifications</h3><button class="text-btn" data-action="mark-notifications-read">Mark read</button></div>
        ${state.notifications.length ? `<div class="stack">${state.notifications.slice(0, 5).map(renderNotification).join("")}</div>` : emptyState("No notifications yet.", "Mentions, reminders, QA changes, and delivery alerts will appear here.")}
      </section>
    </div>
  `;
}

function renderMyWork() {
  return `
    ${pageHead("My Work List", "Assigned, mentioned, starred, review, overdue, and rework tasks sorted by urgency.", `<button class="primary" data-action="open-modal" data-modal="task">New Task</button>`)}
    <section class="panel">${renderTaskList(myWorkTasks(), "No work assigned yet.", "Tasks assigned to you, mentions, reminders, and QA work will appear here.")}</section>
  `;
}

function renderProjects() {
  return `
    ${pageHead("Projects", "Create projects, attach team members, and track delivery status.", `<button class="secondary" data-action="toggle-project-view">${state.meta.projectView === "list" ? "Board View" : "List View"}</button><button class="primary" data-action="open-modal" data-modal="project">New Project</button>`)}
    <section class="panel">
      ${state.projects.length ? `<div class="${state.meta.projectView === "board" ? "card-grid" : "stack"}">${filtered(state.projects, ["name", "client", "description", "status", "priority"]).map(renderProjectCard).join("")}</div>` : emptyState("No projects yet.", "Create your first project.")}
    </section>
  `;
}

function renderTasks() {
  const tasks = filtered(state.tasks, ["title", "description", "status", "priority", "taskType"]);
  return `
    ${pageHead("Tasks", "Move work through the complete BeeFlow status workflow.", `<button class="primary" data-action="open-modal" data-modal="task">New Task</button>`)}
    <section class="panel">
      ${tasks.length ? `<div class="board">${taskStatuses.slice(0, -1).map((status) => `<div class="lane"><div class="lane-head"><strong>${status}</strong><span>${tasks.filter((task) => task.status === status).length}</span></div>${tasks.filter((task) => task.status === status).map(renderTaskCard).join("") || `<div class="lane-empty">No tasks</div>`}</div>`).join("")}</div>` : emptyState("No tasks yet.", "Create your first task to start your workflow.")}
    </section>
  `;
}

function renderReview() {
  const tasks = state.tasks.filter((task) => qaTabs.includes(task.status));
  const visible = tasks.filter((task) => task.status === state.meta.qaTab);
  return `
    ${pageHead("Review Hub", "Only real tasks that are ready for QA or currently in review appear here.", `<button class="primary" data-action="open-modal" data-modal="qaIssue">Add QA Issue</button>`)}
    <section class="panel">
      <div class="tabs">${qaTabs.map((tab) => `<button class="tab ${state.meta.qaTab === tab ? "active" : ""}" data-action="qa-tab" data-tab="${tab}">${tab}</button>`).join("")}</div>
      ${visible.length ? renderTaskList(visible, "", "") : emptyState(`No ${state.meta.qaTab} tasks.`, "Move a task to QA when it is ready for review.")}
    </section>
    <section class="panel">
      <div class="panel-title"><h3>QA Issues</h3><span>${state.qaIssues.length}</span></div>
      ${state.qaIssues.length ? `<div class="stack">${state.qaIssues.map(renderQaIssue).join("")}</div>` : emptyState("No QA issues yet.", "Add QA issues from review tasks when something needs changes.")}
    </section>
  `;
}

function renderDelivery() {
  const deliveryTasks = state.tasks.filter((task) => ["Approved", "Ready for Delivery", "Delivered", "Completed"].includes(task.status));
  return `
    ${pageHead("Delivery", "Prepare final handoff packages with approved files, notes, and final links.", `<button class="primary" data-action="open-modal" data-modal="delivery">Create Delivery</button>`)}
    <section class="panel">
      <div class="panel-title"><h3>Ready tasks</h3><span>${deliveryTasks.length}</span></div>
      ${deliveryTasks.length ? renderTaskList(deliveryTasks, "", "") : emptyState("No delivery-ready work yet.", "Approved and ready-for-delivery tasks will appear here.")}
    </section>
    <section class="panel">
      <div class="panel-title"><h3>Delivery packages</h3><span>${state.deliveries.length}</span></div>
      ${state.deliveries.length ? `<div class="card-grid">${filtered(state.deliveries, ["title", "status", "notes", "finalLink"]).map(renderDeliveryCard).join("")}</div>` : emptyState("No delivery packages yet.", "Create a delivery package when final files are ready.")}
    </section>
  `;
}

function renderFigma() {
  return `
    ${pageHead("Figma Work", "Store Figma links and frame metadata without embedding heavy files.", `<button class="primary" data-action="open-modal" data-modal="figma">Add Figma Link</button>`)}
    <section class="panel">${state.figma.length ? `<div class="card-grid">${filtered(state.figma, ["fileName", "url", "pageName", "frameName", "status", "platform"]).map(renderFigmaCard).join("")}</div>` : emptyState("No Figma links yet.", "Add your first Figma file or frame link.")}</section>
  `;
}

function renderDocs() {
  return `
    ${pageHead("Docs", "Create internal docs for guidelines, QA checklists, SOPs, and project notes.", `<button class="primary" data-action="open-modal" data-modal="doc">Create Doc</button>`)}
    <section class="panel">${state.docs.length ? `<div class="card-grid">${filtered(state.docs, ["title", "category", "content"]).map(renderDocCard).join("")}</div>` : emptyState("No docs yet.", "Create your first internal doc.")}</section>
  `;
}

function renderFiles() {
  return `
    ${pageHead("Files", "Track external links and file metadata without loading heavy files directly.", `<button class="primary" data-action="open-modal" data-modal="file">Add File Link</button>`)}
    <section class="panel">${state.files.length ? `<div class="stack">${filtered(state.files, ["fileName", "fileType", "version", "status", "externalLink"]).map(renderFileRow).join("")}</div>` : emptyState("No files yet.", "Add your first file or external delivery link.")}</section>
  `;
}

function renderTeam() {
  return `
    ${pageHead("Team", "Invite team members and organize work by role and department.", `<button class="primary" data-action="open-modal" data-modal="team">Invite team member</button>`)}
    <section class="panel">${state.team.length ? `<div class="card-grid">${filtered(state.team, ["name", "email", "role", "department"]).map(renderTeamCard).join("")}</div>` : emptyState("No team members yet.", "Invite your first team member.")}</section>
  `;
}

function renderSettings() {
  return `
    ${pageHead("Settings", "Manage onboarding, departments, and local workspace data.", `<button class="danger" data-action="reset-app">Reset local data</button>`)}
    <section class="panel settings-grid">
      <div><h3>Profile</h3><p>${escapeHtml(state.currentUser.name || "No name")} · ${escapeHtml(state.currentUser.email || "No email")}</p><button class="secondary" data-action="open-modal" data-modal="profile">Edit profile</button></div>
      <div><h3>Workspace</h3><p>${escapeHtml(state.meta.workspaceName || "No workspace created yet.")}</p><button class="secondary" data-action="open-modal" data-modal="workspace">Edit workspace</button></div>
      <div><h3>Your role</h3><p>${escapeHtml(state.meta.role)}</p><button class="secondary" data-action="change-role">Change role</button></div>
      <div><h3>Departments</h3><p>${state.meta.departments.length ? state.meta.departments.map(escapeHtml).join(", ") : "No departments yet."}</p><button class="secondary" data-action="open-modal" data-modal="department">Add department</button></div>
      <div><h3>Tags</h3><p>${state.tags.length ? state.tags.map((tag) => `#${escapeHtml(tag.name)}`).join(", ") : "No tags created yet."}</p><button class="secondary" data-action="open-modal" data-modal="tag">Create tag</button></div>
    </section>
  `;
}

function filtered(items, fields) {
  const query = state.meta.search.trim().toLowerCase();
  if (!query) return items;
  return items.filter((item) => fields.some((field) => String(item[field] || "").toLowerCase().includes(query)));
}

function emptyState(title, copy) {
  return `<div class="empty-state"><strong>${title}</strong><p>${copy}</p></div>`;
}

function renderTaskList(tasks, title, copy) {
  return tasks.length ? `<div class="stack">${tasks.map(renderTaskCard).join("")}</div>` : emptyState(title, copy);
}

function renderTaskCard(task) {
  const tags = normalizeTags(task.tags);
  return `
    <article class="task-card" data-task-id="${task.id}">
      <button class="star-btn ${task.starredBy?.includes("me") ? "active" : ""}" data-action="star-task" data-id="${task.id}" title="Star task">${icon("star")}</button>
      <div class="task-main" data-action="open-task" data-id="${task.id}">
        <div class="task-title"><strong>${escapeHtml(task.title)}</strong>${task.mentionedUserIds?.includes("me") ? `<span class="pill accent">Mentioned</span>` : ""}</div>
        <p>${escapeHtml(task.description || "No description added.")}</p>
        <div class="task-meta"><span>${escapeHtml(projectName(task.projectId))}</span><span>${escapeHtml(task.priority)}</span><span>${escapeHtml(task.dueDate || "No due date")}</span></div>
        ${tags.length ? `<div class="tag-row">${tags.map((tag) => `<span class="tag-chip">#${escapeHtml(tag)}</span>`).join("")}</div>` : ""}
      </div>
      <select class="status-select" data-action="change-status" data-id="${task.id}">${optionList(taskStatuses, task.status)}</select>
    </article>
  `;
}

function renderProjectCard(project) {
  return `<article class="data-card"><div class="card-top"><h3>${escapeHtml(project.name)}</h3><span class="pill">${escapeHtml(project.status)}</span></div><p>${escapeHtml(project.description || "No description.")}</p><div class="meta-row"><span>${escapeHtml(project.client || "No client")}</span><span>${escapeHtml(project.priority)}</span><span>${escapeHtml(project.dueDate || "No due date")}</span></div></article>`;
}

function renderTeamCard(member) {
  return `<article class="data-card"><div class="avatar">${initials(member.name || member.email)}</div><h3>${escapeHtml(member.name || "Unnamed")}</h3><p>${escapeHtml(member.email)}</p><div class="meta-row"><span>${escapeHtml(member.role)}</span><span>${escapeHtml(member.department)}</span><span>${escapeHtml(member.status)}</span></div></article>`;
}

function renderFigmaCard(item) {
  return `<article class="data-card"><div class="card-top"><h3>${escapeHtml(item.fileName)}</h3><span class="pill">${escapeHtml(item.status)}</span></div><p>${escapeHtml(item.frameName || "No frame name.")}</p><div class="meta-row"><span>${escapeHtml(item.width)} x ${escapeHtml(item.height)}</span><span>${escapeHtml(item.aspectRatio)}</span><span>${escapeHtml(item.platform)}</span></div><button class="secondary" data-action="open-link" data-url="${escapeHtml(item.url)}">Open Figma</button></article>`;
}

function renderDocCard(doc) {
  return `<article class="data-card"><div class="card-top"><h3>${escapeHtml(doc.title)}</h3><span class="pill">${escapeHtml(doc.category)}</span></div><p>${escapeHtml(doc.content || "No content yet.")}</p></article>`;
}

function renderFileRow(file) {
  return `<article class="file-row"><strong>${escapeHtml(file.fileName)}</strong><span>${escapeHtml(file.fileType)}</span><span>${escapeHtml(file.size || "No size")}</span><span>${escapeHtml(file.version)}</span><button class="secondary" data-action="open-link" data-url="${escapeHtml(file.externalLink)}">Open</button></article>`;
}

function renderDeliveryCard(delivery) {
  return `<article class="data-card"><div class="card-top"><h3>${escapeHtml(delivery.title)}</h3><span class="pill">${escapeHtml(delivery.status)}</span></div><p>${escapeHtml(delivery.notes || "No notes.")}</p><div class="meta-row"><span>${escapeHtml(projectName(delivery.projectId))}</span><span>${escapeHtml(taskName(delivery.taskId))}</span></div><button class="secondary" data-action="open-link" data-url="${escapeHtml(delivery.finalLink)}">Open delivery</button></article>`;
}

function renderQaIssue(issue) {
  return `<article class="data-card"><div class="card-top"><h3>${escapeHtml(issue.title)}</h3><span class="pill">${escapeHtml(issue.status)}</span></div><p>${escapeHtml(issue.comment || "No comment.")}</p><div class="meta-row"><span>${escapeHtml(issue.issueType)}</span><span>${escapeHtml(issue.priority)}</span><span>${escapeHtml(personName(issue.assignedTo))}</span></div></article>`;
}

function renderNotification(item) {
  return `<button class="notification ${item.read ? "" : "unread"}" data-action="notification-click" data-id="${item.id}"><span>${escapeHtml(item.title)}</span><small>${new Date(item.createdAt).toLocaleString()}</small></button>`;
}

function initials(value = "") {
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "U";
}

function renderTaskDrawer() {
  const task = state.tasks.find((item) => item.id === drawerTaskId);
  if (!task) return "";
  const comments = task.comments || [];
  const taskFiles = state.files.filter((file) => file.taskId === task.id);
  const taskFigma = state.figma.filter((item) => item.taskId === task.id);
  const taskActivity = state.activity.filter((item) => item.taskId === task.id).slice(0, 8);
  return `
    <aside class="drawer slide-in">
      <div class="drawer-head"><div><h2>${escapeHtml(task.title)}</h2><p>${escapeHtml(task.taskType)} · ${escapeHtml(task.priority)}</p></div><button class="icon-btn" data-action="close-drawer">×</button></div>
      <div class="drawer-actions">
        <button class="secondary" data-action="open-modal" data-modal="reminder" data-task="${task.id}">Add Reminder</button>
        <button class="secondary" data-action="move-qa" data-id="${task.id}">Move to QA</button>
        <button class="secondary" data-action="open-modal" data-modal="delivery" data-task="${task.id}">Deliver</button>
        ${task.status === "Completed" ? `<button class="secondary" data-action="reopen-task" data-id="${task.id}">Reopen Task</button>` : `<button class="primary" data-action="mark-complete" data-id="${task.id}">Mark Complete</button>`}
        <button class="danger" data-action="delete-task" data-id="${task.id}">Delete Task</button>
      </div>
      <div class="drawer-section"><h3>Details</h3>${detailLine("Project", projectName(task.projectId))}${detailLine("Assignee", personName(task.assigneeId))}${detailLine("Reviewer", personName(task.reviewerId))}${detailLine("Status", task.status)}${detailLine("Due date", task.dueDate || "No due date")}<div class="detail-line"><span>Tags</span><strong>${normalizeTags(task.tags).length ? normalizeTags(task.tags).map((tag) => `#${escapeHtml(tag)}`).join(" ") : "No tags"}</strong></div></div>
      <div class="drawer-section"><h3>Description</h3><p>${escapeHtml(task.description || "No description added.")}</p></div>
      <div class="drawer-section"><h3>Figma links</h3>${taskFigma.length ? taskFigma.map((item) => `<p><button class="text-btn" data-action="open-link" data-url="${escapeHtml(item.url)}">${escapeHtml(item.fileName)}</button></p>`).join("") : `<p class="muted">No Figma link attached.</p>`}</div>
      <div class="drawer-section"><h3>Files</h3>${taskFiles.length ? taskFiles.map((file) => `<p><button class="text-btn" data-action="open-link" data-url="${escapeHtml(file.externalLink)}">${escapeHtml(file.fileName)}</button></p>`).join("") : `<p class="muted">No files attached.</p>`}</div>
      <div class="drawer-section">
        <h3>Comments</h3>
        <div class="mention-box">${state.team.length ? state.team.map((user) => `<button data-action="insert-mention" data-name="${escapeHtml(user.name)}">@${escapeHtml(user.name)}</button>`).join("") : `<span>No team members to mention yet.</span>`}</div>
        <textarea id="commentText" placeholder="Add a comment. Type @name to mention someone."></textarea>
        <button class="primary" data-action="add-comment" data-id="${task.id}">Add Comment</button>
        <div class="stack comment-list">${comments.length ? comments.map((comment) => `<article class="comment"><p>${escapeHtml(comment.text)}</p><small>${new Date(comment.createdAt).toLocaleString()}</small></article>`).join("") : `<p class="muted">No comments yet.</p>`}</div>
      </div>
      <div class="drawer-section"><h3>Activity log</h3>${taskActivity.length ? taskActivity.map((item) => `<p class="activity-line">${escapeHtml(item.message)}</p>`).join("") : `<p class="muted">No activity yet.</p>`}</div>
    </aside>
  `;
}

function detailLine(label, value) {
  return `<div class="detail-line"><span>${label}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function renderModal() {
  const content = modalContent(modal);
  return `<div class="modal-backdrop fade-in"><form class="modal scale-in" data-form="${modal.type}"><div class="modal-head"><h2>${content.title}</h2><button type="button" class="icon-btn" data-action="close-modal">×</button></div>${content.body}<div class="modal-actions"><button type="button" class="secondary" data-action="close-modal">Cancel</button><button class="primary" type="submit">${content.submit}</button></div></form></div>`;
}

function modalContent(context) {
  const type = context.type;
  const taskId = context.taskId || "";
  const shared = {
    profile: { title: "Profile", submit: "Save Profile", body: field("name", "Name", state.currentUser.name, "Your name", true) + field("email", "Email", state.currentUser.email, "you@beenco.io", true, "email") + selectField("role", "Role", roles, state.currentUser.role || state.meta.role) + selectField("department", "Department", state.meta.departments.length ? state.meta.departments : departments, state.currentUser.department) },
    workspace: { title: "Create workspace", submit: "Save Workspace", body: field("workspaceName", "Workspace name", state.meta.workspaceName, "Beenco Workspace", true) },
    department: { title: "Add department", submit: "Add Department", body: selectField("department", "Department", departments) },
    tag: { title: "Create tag", submit: "Create Tag", body: field("name", "Tag name", "", "Urgent", true) },
    team: { title: "Invite team member", submit: "Invite Team", body: field("name", "Name", "", "Full name", true) + field("email", "Email", "", "name@beenco.io", true, "email") + selectField("role", "Role", roles) + selectField("department", "Department", state.meta.departments.length ? state.meta.departments : departments) },
    project: { title: "New project", submit: "Create Project", body: field("name", "Project name", "", "", true) + field("client", "Client optional") + textArea("description", "Description") + selectField("managerId", "Manager", [state.currentUser, ...state.team].map((u) => u.id), "me", personName) + selectField("status", "Status", ["Not Started", "In Progress", "In Review", "In QA", "Changes Required", "Approved", "Ready for Delivery", "Delivered", "On Hold"]) + selectField("priority", "Priority", priorities, "Medium") + field("startDate", "Start date", todayISO(), "", false, "date") + field("dueDate", "Due date", "", "", false, "date") + field("tags", "Tags", "", "Web3, Design") },
    task: { title: "New task", submit: "Create Task", body: field("title", "Task title", "", "", true) + textArea("description", "Description") + selectFieldHtml("projectId", "Project", projectOptions()) + selectFieldHtml("assigneeId", "Assignee", userOptions("me")) + selectFieldHtml("reviewerId", "Reviewer", userOptions()) + selectField("priority", "Priority", priorities, "Medium") + selectField("status", "Status", taskStatuses, "Backlog") + selectField("taskType", "Task type", creativeTypes, "UI/UX Design") + field("dueDate", "Due date", "", "", false, "date") + field("tags", "Tags", "", "QA Required, Web3") + tagHint() + renderDesignFields() },
    figma: { title: "Add Figma link", submit: "Save Figma Link", body: field("fileName", "Figma file name", "", "", true) + field("url", "Figma URL", "", "https://figma.com/...", true, "url") + field("pageName", "Page name") + field("frameName", "Frame name") + field("width", "Width", "", "1440", false, "number") + field("height", "Height", "", "900", false, "number") + field("aspectRatio", "Aspect ratio", "", "16:9") + field("platform", "Platform", "", "Website") + field("version", "Version", "v1") + selectField("status", "Status", ["Draft", "In Progress", "Ready for Review", "Changes Required", "Approved", "Final", "Exported", "Delivered"]) + selectFieldHtml("projectId", "Related project", projectOptions()) + selectFieldHtml("taskId", "Related task", taskOptions()) },
    file: { title: "Add file link", submit: "Save File", body: field("fileName", "File name", "", "", true) + selectField("fileType", "File type", ["Image", "Video", "Design File", "Document", "Source File", "ZIP Folder", "External Link"]) + field("size", "Size", "", "2.4 GB") + field("version", "Version", "v1") + selectField("status", "Status", ["Draft", "Internal Review", "QA Review", "Approved", "Final", "Delivered"]) + selectFieldHtml("projectId", "Related project", projectOptions()) + selectFieldHtml("taskId", "Related task", taskOptions()) + field("externalLink", "External link", "", "https://drive.google.com/...", true, "url") },
    delivery: { title: "Create delivery", submit: "Create Delivery", body: field("title", "Delivery title", "", "", true) + selectFieldHtml("projectId", "Related project", projectOptions()) + selectFieldHtml("taskId", "Related task", taskOptions(taskId)) + field("finalLink", "Final delivery link", "", "https://drive.google.com/...", true, "url") + field("figmaLink", "Final Figma link", "", "https://figma.com/...") + selectField("status", "Status", ["Preparing", "Internal Review", "QA Approved", "Ready to Deliver", "Delivered"]) + textArea("notes", "Delivery notes") },
    doc: { title: "Create doc", submit: "Create Doc", body: field("title", "Doc title", "", "", true) + selectField("category", "Category", docCategories) + textArea("content", "Content") + selectFieldHtml("projectId", "Related project", projectOptions()) + selectFieldHtml("taskId", "Related task", taskOptions()) },
    reminder: { title: "Add reminder", submit: "Save Reminder", body: selectField("preset", "Reminder option", ["Today", "Tomorrow", "Before due date", "Custom"]) + field("date", "Reminder date", todayISO(), "", false, "date") + field("time", "Reminder time", "09:00", "", false, "time") + field("note", "Reminder note", "", "Follow up") + `<input type="hidden" name="taskId" value="${taskId}" />` },
    qaIssue: { title: "Add QA issue", submit: "Add QA Issue", body: field("title", "Issue title", "", "", true) + selectField("issueType", "Issue type", ["UI Issue", "UX Issue", "Size Issue", "Aspect Ratio Issue", "Export Issue", "Text Issue", "Design Mismatch", "Missing Requirement", "Mobile Issue", "File Issue", "Client Feedback"]) + selectField("priority", "Priority", priorities, "Medium") + selectFieldHtml("assignedTo", "Assigned to", userOptions()) + selectFieldHtml("taskId", "Task", taskOptions(taskId)) + field("screenshotUrl", "Screenshot/file link", "", "https://...") + field("figmaFrameUrl", "Figma frame link", "", "https://figma.com/...") + textArea("comment", "Comment") + selectField("status", "Status", qaStatuses) },
  };
  return shared[type];
}

function field(name, label, value = "", placeholder = "", required = false, type = "text") {
  return `<label class="field"><span>${label}</span><input name="${name}" type="${type}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" ${required ? "required" : ""} /></label>`;
}

function textArea(name, label) {
  return `<label class="field"><span>${label}</span><textarea name="${name}" rows="4"></textarea></label>`;
}

function selectField(name, label, values, selected = "", labelFn = (value) => value) {
  return `<label class="field"><span>${label}</span><select name="${name}">${values.map((value) => `<option value="${value}" ${selected === value ? "selected" : ""}>${escapeHtml(labelFn(value))}</option>`).join("")}</select></label>`;
}

function selectFieldHtml(name, label, html) {
  return `<label class="field"><span>${label}</span><select name="${name}">${html}</select></label>`;
}

function renderDesignFields() {
  return `<details class="form-details"><summary>Creative size/spec fields</summary>${selectField("commonSize", "Common size", commonSizes)}${field("outputType", "Output type")}${field("width", "Width", "", "", false, "number")}${field("height", "Height", "", "", false, "number")}${field("aspectRatio", "Aspect ratio")}${field("platform", "Platform")}${field("format", "Format", "", "PNG, SVG, PDF")}${textArea("safeAreaNotes", "Safe area notes")}${textArea("exportRequirement", "Export requirement")}</details>`;
}

function tagHint() {
  return state.tags.length ? `<div class="tag-row form-tags">${state.tags.map((tag) => `<span class="tag-chip">#${escapeHtml(tag.name)}</span>`).join("")}</div>` : `<p class="form-note">Tags you type here are saved to the workspace tag system.</p>`;
}

function bindEvents() {
  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
  document.querySelectorAll("[data-action]:not(select)").forEach((element) => element.addEventListener("click", handleAction));
  document.querySelectorAll('select[data-action="change-status"]').forEach((select) => select.addEventListener("change", handleAction));
  const search = document.querySelector('[data-action="search"]');
  if (search) search.addEventListener("input", (event) => { state.meta.search = event.target.value; saveState(); render(); });
  const commentText = $("#commentText");
  if (commentText) commentText.addEventListener("input", () => document.body.classList.toggle("mentioning", commentText.value.includes("@")));
  document.querySelectorAll("[data-form]").forEach((form) => form.addEventListener("submit", handleFormSubmit));
  document.querySelectorAll("form[data-form] input").forEach((input) => {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        event.currentTarget.closest("form")?.requestSubmit();
      }
    });
  });
}

function handleAction(event) {
  const action = event.currentTarget.dataset.action;
  const el = event.currentTarget;
  if (action !== "search") event.preventDefault();
  const actions = {
    "select-role": () => { state.meta.role = el.dataset.role; state.currentUser.role = el.dataset.role; saveState(); render(); },
    "open-modal": () => { modal = { type: el.dataset.modal, taskId: el.dataset.task || "" }; render(); },
    "close-modal": () => { modal = null; render(); },
    "open-task": () => { drawerTaskId = el.dataset.id; render(); },
    "close-drawer": () => { drawerTaskId = ""; render(); },
    "star-task": () => toggleStar(el.dataset.id),
    "change-status": () => changeStatus(el.dataset.id, el.value),
    "move-qa": () => changeStatus(el.dataset.id, "Ready for QA"),
    "mark-complete": () => markComplete(el.dataset.id),
    "reopen-task": () => changeStatus(el.dataset.id, "To Do"),
    "add-comment": () => addComment(el.dataset.id),
    "insert-mention": () => insertMention(el.dataset.name),
    "qa-tab": () => { state.meta.qaTab = el.dataset.tab; saveState(); render(); },
    "toggle-project-view": () => { state.meta.projectView = state.meta.projectView === "list" ? "board" : "list"; saveState(); render(); },
    "mark-notifications-read": () => { state.notifications.forEach((item) => item.read = true); saveState(); render(); },
    "notification-click": () => openNotification(el.dataset.id),
    "toggle-notifications": () => setView("dashboard"),
    "open-link": () => { if (el.dataset.url) window.open(el.dataset.url, "_blank", "noopener"); },
    "change-role": () => { state.meta.role = ""; saveState(); render(); },
    "restart-login": () => { state.meta.pendingEmail = ""; state.meta.verificationCode = ""; state.meta.verificationSent = false; state.meta.loginError = ""; saveState(); render(); },
    "resend-code": () => resendVerificationCode(),
    "delete-task": () => deleteTask(el.dataset.id),
    "reset-app": () => resetApp(),
    "load-demo": () => loadDemo(),
  };
  if (actions[action]) actions[action]();
}

function handleFormSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  const handlers = {
    login: () => startLogin(data),
    verifyLogin: () => verifyLogin(data),
    profile: () => saveProfile(data),
    workspace: () => { state.meta.workspaceName = data.workspaceName.trim(); },
    department: () => { if (!state.meta.departments.includes(data.department)) state.meta.departments.push(data.department); },
    tag: () => createTag(data.name),
    team: () => state.team.push({ id: uid("user"), name: data.name, email: data.email, role: data.role, department: data.department, status: "Active" }),
    project: () => state.projects.push({ id: uid("project"), ...data, teamMembers: [], createdAt: new Date().toISOString() }),
    task: () => createTask(data),
    figma: () => state.figma.push({ id: uid("figma"), ...data, createdAt: new Date().toISOString() }),
    file: () => state.files.push({ id: uid("file"), ...data, uploadedBy: "me", date: todayISO(), createdAt: new Date().toISOString() }),
    delivery: () => createDelivery(data),
    doc: () => state.docs.push({ id: uid("doc"), ...data, ownerId: "me", createdAt: new Date().toISOString(), lastUpdated: todayISO() }),
    reminder: () => createReminder(data),
    qaIssue: () => createQaIssue(data),
  };
  Promise.resolve(handlers[form.dataset.form]()).then((result) => {
    if (result === false) return;
    modal = null;
    saveState();
    render();
  });
}

function createTask(data) {
  normalizeTags(data.tags).forEach(createTag);
  const task = { id: uid("task"), ...data, comments: [], mentionedUserIds: [], starredBy: [], completedAt: "", completedBy: "", createdAt: new Date().toISOString() };
  state.tasks.push(task);
  notify(`Task created: ${task.title}`, task.id);
  logActivity(`Task created`, task.id);
}

async function startLogin(data) {
  state.currentUser.name = data.name.trim();
  state.currentUser.email = data.email.trim();
  state.currentUser.avatar = initials(data.name || data.email);
  state.meta.pendingEmail = state.currentUser.email;
  state.meta.verificationCode = String(Math.floor(100000 + Math.random() * 900000));
  state.meta.loginError = "";
  const sent = await sendVerificationEmail(state.currentUser.email, state.meta.verificationCode, state.currentUser.name);
  if (!sent) return false;
  state.meta.verificationSent = true;
}

async function verifyLogin(data) {
  state.meta.loginError = "";
  const backendVerified = await verifyCodeWithBackend(state.meta.pendingEmail, String(data.code).trim());
  if (backendVerified === false) return false;
  if (String(data.code).trim() !== state.meta.verificationCode) {
    state.meta.loginError = "Verification code is not correct.";
    saveState();
    render();
    return false;
  }
  state.meta.isAuthenticated = true;
  state.meta.pendingEmail = "";
  state.meta.verificationCode = "";
  state.meta.verificationSent = false;
  state.meta.loginError = "";
  return true;
}

async function resendVerificationCode() {
  if (!state.meta.pendingEmail) return;
  state.meta.verificationCode = String(Math.floor(100000 + Math.random() * 900000));
  state.meta.loginError = "";
  const sent = await sendVerificationEmail(state.meta.pendingEmail, state.meta.verificationCode, state.currentUser.name);
  if (sent) {
    state.meta.verificationSent = true;
    flash("Verification code sent.");
  }
  saveState();
  render();
}

async function sendVerificationEmail(email, code, name) {
  try {
    const response = await fetch("/api/auth/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, name, product: "BeeFlow" }),
    });
    if (!response.ok) throw new Error("Email service rejected the request.");
    return true;
  } catch {
    state.meta.loginError = "Open BeeFlow through the Vercel/Next app so the secure email login route can send your code.";
    state.meta.pendingEmail = "";
    state.meta.verificationCode = "";
    state.meta.verificationSent = false;
    saveState();
    render();
    return false;
  }
}

async function verifyCodeWithBackend(email, code) {
  try {
    const response = await fetch("/api/auth/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    if (response.status === 404) return null;
    if (!response.ok) {
      state.meta.loginError = "Verification failed. Check the code and try again.";
      saveState();
      render();
      return false;
    }
    const result = await response.json().catch(() => ({ verified: true }));
    if (result.verified === false) {
      state.meta.loginError = "Verification code is not correct.";
      saveState();
      render();
      return false;
    }
    return true;
  } catch {
    return null;
  }
}

function saveProfile(data) {
  state.currentUser.name = data.name.trim();
  state.currentUser.email = data.email.trim();
  state.currentUser.role = data.role;
  state.currentUser.department = data.department;
  state.currentUser.avatar = initials(data.name || data.email);
  state.meta.role = data.role || state.meta.role;
}

function createTag(name) {
  const tagName = String(name || "").trim().replace(/^#/, "");
  if (!tagName) return;
  if (!state.tags.some((tag) => tag.name.toLowerCase() === tagName.toLowerCase())) {
    state.tags.push({ id: uid("tag"), name: tagName, createdAt: new Date().toISOString() });
  }
}

function normalizeTags(value = "") {
  return String(value).split(",").map((tag) => tag.trim().replace(/^#/, "")).filter(Boolean);
}

function createDelivery(data) {
  state.deliveries.push({ id: uid("delivery"), ...data, createdBy: "me", deliveredAt: data.status === "Delivered" ? new Date().toISOString() : "", createdAt: new Date().toISOString() });
  if (data.taskId && ["Ready to Deliver", "Delivered"].includes(data.status)) {
    changeStatus(data.taskId, data.status === "Delivered" ? "Delivered" : "Ready for Delivery", false);
  }
  notify(`Delivery created: ${data.title}`, data.taskId);
  logActivity(`Delivery package created`, data.taskId);
}

function createReminder(data) {
  const task = state.tasks.find((item) => item.id === data.taskId);
  const date = data.preset === "Tomorrow" ? tomorrowISO() : data.preset === "Before due date" && task?.dueDate ? task.dueDate : data.date;
  state.reminders.push({ id: uid("reminder"), taskId: data.taskId, userId: "me", reminderDate: date, reminderTime: data.time, reminderNote: data.note, status: "Active", createdAt: new Date().toISOString() });
  notify(`Reminder set${task ? ` for ${task.title}` : ""}`, data.taskId);
  logActivity(`Reminder added`, data.taskId);
}

function createQaIssue(data) {
  state.qaIssues.push({ id: uid("qa"), ...data, createdBy: "me", createdAt: new Date().toISOString() });
  if (data.taskId) changeStatus(data.taskId, "Changes Required", false);
  notify(`QA issue added: ${data.title}`, data.taskId);
}

function toggleStar(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;
  task.starredBy = task.starredBy || [];
  task.starredBy = task.starredBy.includes("me") ? task.starredBy.filter((id) => id !== "me") : [...task.starredBy, "me"];
  saveState();
  render();
}

function changeStatus(taskId, status, shouldRender = true) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;
  task.status = status;
  if (status === "Ready for QA") notify(`Task ready for QA: ${task.title}`, task.id);
  if (status === "Approved") notify(`Task approved: ${task.title}`, task.id);
  if (status === "Ready for Delivery") notify(`Delivery ready: ${task.title}`, task.id);
  logActivity(`Status changed to ${status}`, task.id);
  saveState();
  if (shouldRender) render();
}

function markComplete(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;
  if (taskNeedsQA(task) && !["Approved", "Ready for Delivery", "Delivered", "Completed"].includes(task.status)) {
    flash("This task needs QA before completion.");
    return;
  }
  task.status = "Completed";
  task.completedAt = new Date().toISOString();
  task.completedBy = "me";
  notify(`Task completed: ${task.title}`, task.id);
  logActivity(`Task completed`, task.id);
  saveState();
  render();
}

function deleteTask(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;
  if (!confirm(`Delete task "${task.title}"? This cannot be undone.`)) return;
  state.tasks = state.tasks.filter((item) => item.id !== taskId);
  state.figma = state.figma.filter((item) => item.taskId !== taskId);
  state.files = state.files.filter((item) => item.taskId !== taskId);
  state.qaIssues = state.qaIssues.filter((item) => item.taskId !== taskId);
  state.reminders = state.reminders.filter((item) => item.taskId !== taskId);
  state.deliveries = state.deliveries.filter((item) => item.taskId !== taskId);
  state.notifications = state.notifications.filter((item) => item.taskId !== taskId);
  drawerTaskId = "";
  saveState();
  render();
}

function addComment(taskId) {
  const textarea = $("#commentText");
  const text = textarea?.value.trim();
  if (!text) return;
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;
  task.comments = task.comments || [];
  task.comments.push({ id: uid("comment"), text, authorId: "me", createdAt: new Date().toISOString() });
  state.team.forEach((user) => {
    if (text.toLowerCase().includes(`@${user.name.toLowerCase()}`)) {
      task.mentionedUserIds = [...new Set([...(task.mentionedUserIds || []), user.id])];
      notify(`${user.name} mentioned in ${task.title}`, task.id);
    }
  });
  if (text.includes("@You") || text.includes("@you")) task.mentionedUserIds = [...new Set([...(task.mentionedUserIds || []), "me"])];
  logActivity(`Comment added`, task.id);
  saveState();
  render();
}

function insertMention(name) {
  const textarea = $("#commentText");
  if (!textarea) return;
  textarea.value = `${textarea.value}${textarea.value.endsWith(" ") || !textarea.value ? "" : " "}@${name} `;
  textarea.focus();
}

function openNotification(id) {
  const item = state.notifications.find((notification) => notification.id === id);
  if (!item) return;
  item.read = true;
  if (item.taskId) drawerTaskId = item.taskId;
  saveState();
  render();
}

function resetApp() {
  if (!confirm("Reset all local BeeFlow data?")) return;
  localStorage.removeItem(STORAGE_KEY);
  state = defaultState();
  modal = null;
  drawerTaskId = "";
  render();
}

function loadDemo() {
  if (!confirm("Load demo workspace data? This replaces current local data.")) return;
  state = defaultState();
  state.meta.role = "Owner / Admin";
  state.currentUser.role = "Owner / Admin";
  state.meta.workspaceName = "Beenco Demo Workspace";
  state.meta.departments = ["Design", "Development", "QA"];
  state.team = [
    { id: "demo_designer", name: "Demo Designer", email: "designer@example.com", role: "Designer", department: "Design", status: "Active" },
    { id: "demo_reviewer", name: "Demo Reviewer", email: "reviewer@example.com", role: "QA / Reviewer", department: "QA", status: "Active" },
  ];
  state.projects = [{ id: "demo_project", name: "Demo Project", client: "", description: "Optional demo data. Remove with reset.", managerId: "me", status: "In Progress", priority: "High", startDate: todayISO(), dueDate: tomorrowISO(), tags: "Demo" }];
  state.tasks = [{ id: "demo_task", projectId: "demo_project", title: "Demo task ready for QA", description: "This exists only after clicking Load demo workspace.", assigneeId: "demo_designer", reviewerId: "demo_reviewer", priority: "High", status: "Ready for QA", taskType: "UI/UX Design", dueDate: tomorrowISO(), tags: "Demo", comments: [], mentionedUserIds: [], starredBy: [], createdAt: new Date().toISOString() }];
  saveState();
  render();
}

function flash(message) {
  toast = message;
  render();
  setTimeout(() => { toast = ""; render(); }, 1800);
}

render();
