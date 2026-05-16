const currentUserId = "u1";

const icons = {
  dashboard: "dashboard",
  work: "checklist",
  projects: "grid",
  tasks: "tasks",
  team: "users",
  qa: "shieldCheck",
  figma: "figma",
  docs: "document",
  files: "folder",
  reports: "chart",
  settings: "settings",
};

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
  chart: '<path d="M6 13a2 2 0 0 1 2 2v4a2 2 0 1 1-4 0v-4a2 2 0 0 1 2-2Zm6-8a2 2 0 0 1 2 2v12a2 2 0 1 1-4 0V7a2 2 0 0 1 2-2Zm6 4a2 2 0 0 1 2 2v8a2 2 0 1 1-4 0v-8a2 2 0 0 1 2-2Z"/>',
  settings: '<path d="M10.8 2.5h2.4l.5 2a7.7 7.7 0 0 1 1.5.6l1.8-1.1 1.7 1.7-1.1 1.8c.3.5.5 1 .6 1.5l2 .5v2.4l-2 .5c-.1.5-.3 1-.6 1.5l1.1 1.8-1.7 1.7-1.8-1.1c-.5.3-1 .5-1.5.6l-.5 2h-2.4l-.5-2a7.7 7.7 0 0 1-1.5-.6L7 18.4l-1.7-1.7 1.1-1.8c-.3-.5-.5-1-.6-1.5l-2-.5v-2.4l2-.5c.1-.5.3-1 .6-1.5L5.3 5.7 7 4l1.8 1.1c.5-.3 1-.5 1.5-.6l.5-2ZM12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/>',
  search: '<path d="M10.5 4a6.5 6.5 0 0 1 5.1 10.5l3.2 3.2a1 1 0 0 1-1.4 1.4l-3.2-3.2A6.5 6.5 0 1 1 10.5 4Zm0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z"/>',
  bell: '<path d="M12 3a5 5 0 0 0-5 5v2.7c0 .7-.3 1.3-.7 1.8L5 13.8A2.5 2.5 0 0 0 6.8 18h10.4a2.5 2.5 0 0 0 1.8-4.2l-1.3-1.3c-.4-.5-.7-1.1-.7-1.8V8a5 5 0 0 0-5-5Zm-2.2 16a2.3 2.3 0 0 0 4.4 0H9.8Z"/>',
  plus: '<path d="M11 5a1 1 0 0 1 2 0v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H5a1 1 0 1 1 0-2h6V5Z"/>',
  arrow: '<path d="M13.3 5.3a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 1 1-1.4-1.4L16.6 12H5a1 1 0 1 1 0-2h11.6l-3.3-3.3a1 1 0 0 1 0-1.4Z"/>',
  star: '<path d="M10.9 3.7a1.2 1.2 0 0 1 2.2 0l1.8 3.7 4.1.6a1.2 1.2 0 0 1 .7 2l-3 2.9.7 4.1a1.2 1.2 0 0 1-1.7 1.3L12 16.4l-3.7 1.9A1.2 1.2 0 0 1 6.6 17l.7-4.1-3-2.9A1.2 1.2 0 0 1 5 8l4.1-.6 1.8-3.7Z"/>',
};

function icon(name, className = "") {
  return `<svg class="ui-icon ${className}" viewBox="0 0 24 24" aria-hidden="true">${svgPaths[name] || svgPaths.dashboard}</svg>`;
}

const navItems = [
  ["dashboard", "Dashboard", "dashboard"],
  ["work", "My Work List", "work"],
  ["projects", "Projects", "projects"],
  ["tasks", "My Tasks", "tasks"],
  ["team", "Team", "team"],
  ["qa", "Review Hub / QA", "qa"],
  ["figma", "Figma Work", "figma"],
  ["docs", "Docs", "docs"],
  ["files", "Files / Deliverables", "files"],
  ["reports", "Reports", "reports"],
  ["settings", "Settings", "settings"],
];

const users = [
  { id: "u1", name: "Hamza Khan", email: "hamza@beenco.io", role: "Product Lead", department: "Management", status: "Active", avatar: "HK" },
  { id: "u2", name: "Ayesha Noor", email: "ayesha@beenco.io", role: "UI/UX Designer", department: "UI/UX", status: "Active", avatar: "AN" },
  { id: "u3", name: "Bilal Raza", email: "bilal@beenco.io", role: "Web3 Developer", department: "Development", status: "Active", avatar: "BR" },
  { id: "u4", name: "Mira Shah", email: "mira@beenco.io", role: "Content Strategist", department: "Content", status: "Active", avatar: "MS" },
  { id: "u5", name: "Omar Ali", email: "omar@beenco.io", role: "QA Reviewer", department: "QA", status: "Active", avatar: "OA" },
];

const projects = [
  {
    id: "p1",
    name: "NexaChain Launch Site",
    clientName: "NexaChain",
    description: "Web3 landing page, pitch visuals, and launch delivery package.",
    ownerId: "u1",
    teamMembers: ["u1", "u2", "u3", "u4", "u5"],
    status: "In QA",
    priority: "Critical",
    tags: ["Web3", "Landing Page", "QA Required"],
    startDate: "2026-05-01",
    dueDate: "2026-05-18",
    progress: 74,
  },
  {
    id: "p2",
    name: "Orbit DAO Brand Kit",
    clientName: "Orbit DAO",
    description: "Brand system, social templates, and creative guideline docs.",
    ownerId: "u2",
    teamMembers: ["u1", "u2", "u4"],
    status: "In Review",
    priority: "High",
    tags: ["Branding", "Social Post", "Final Files"],
    startDate: "2026-05-04",
    dueDate: "2026-05-24",
    progress: 58,
  },
  {
    id: "p3",
    name: "BeeLabs Dashboard",
    clientName: "Internal",
    description: "Internal analytics UI screens and export-ready dashboard frames.",
    ownerId: "u1",
    teamMembers: ["u1", "u2", "u3", "u5"],
    status: "In Progress",
    priority: "Medium",
    tags: ["Dashboard", "UI", "Development"],
    startDate: "2026-05-08",
    dueDate: "2026-06-02",
    progress: 36,
  },
];

const tasks = [
  {
    id: "t1",
    projectId: "p1",
    title: "QA launch hero Figma frames",
    description: "Check desktop, tablet, mobile frame sizes, copy alignment, and CTA states before export.",
    assigneeId: "u5",
    reviewerId: "u1",
    status: "In QA",
    priority: "Critical",
    taskType: "QA Fix",
    tags: ["Web3", "QA Required", "Landing Page"],
    dueDate: "2026-05-15",
    figmaWorkId: "f1",
    checklist: ["Verify 1440 hero", "Check 390 mobile", "Confirm export notes"],
    mentions: ["u1"],
    starUserIds: ["u1"],
    completed: false,
  },
  {
    id: "t2",
    projectId: "p1",
    title: "Finalize token utility section copy",
    description: "Tighten the section copy and add the final CTA angle for investor audience.",
    assigneeId: "u4",
    reviewerId: "u1",
    status: "Changes Required",
    priority: "Urgent",
    taskType: "Content",
    tags: ["Content", "Client Feedback", "Urgent"],
    dueDate: "2026-05-16",
    checklist: ["Update headline", "Add key points", "Link final copy doc"],
    mentions: ["u1", "u4"],
    starUserIds: [],
    completed: false,
  },
  {
    id: "t3",
    projectId: "p2",
    title: "Export social launch kit v2",
    description: "Prepare square, portrait, and story exports with clean file names and source links.",
    assigneeId: "u2",
    reviewerId: "u5",
    status: "Ready for QA",
    priority: "High",
    taskType: "Social Post",
    tags: ["Final Files", "Social Post", "Branding"],
    dueDate: "2026-05-17",
    figmaWorkId: "f2",
    checklist: ["1080x1080", "1080x1350", "1080x1920"],
    mentions: [],
    starUserIds: ["u1", "u2"],
    completed: false,
  },
  {
    id: "t4",
    projectId: "p3",
    title: "Build dashboard stats cards",
    description: "Implement compact task, project, QA, and delivery metrics with loading states.",
    assigneeId: "u3",
    reviewerId: "u1",
    status: "In Progress",
    priority: "Medium",
    taskType: "Development",
    tags: ["Dashboard", "Development"],
    dueDate: "2026-05-22",
    checklist: ["Create cards", "Wire sample data", "Responsive tablet state"],
    mentions: ["u1"],
    starUserIds: [],
    completed: false,
  },
  {
    id: "t5",
    projectId: "p1",
    title: "Prepare final delivery folder",
    description: "Collect final Figma URL, export ZIP, delivery notes, and QA approval record.",
    assigneeId: "u1",
    reviewerId: "u5",
    status: "Ready for Delivery",
    priority: "High",
    taskType: "Final Delivery",
    tags: ["Final Files", "Internal"],
    dueDate: "2026-05-18",
    checklist: ["Cloud folder", "Version labels", "Delivery notes"],
    mentions: [],
    starUserIds: ["u1"],
    completed: false,
  },
  {
    id: "t6",
    projectId: "p2",
    title: "Publish brand guideline doc",
    description: "Move approved usage rules, logo spacing, and typography notes into docs.",
    assigneeId: "u2",
    reviewerId: "u1",
    status: "Completed",
    priority: "Low",
    taskType: "Brand Design",
    tags: ["Branding", "Docs"],
    dueDate: "2026-05-12",
    checklist: ["Logo rules", "Color tokens", "Export PDF"],
    mentions: [],
    starUserIds: [],
    completed: true,
    completedAt: "2026-05-13",
    completedBy: "u2",
  },
];

const figmaWork = [
  { id: "f1", projectId: "p1", taskId: "t1", figmaFileName: "NexaChain Launch v4", figmaUrl: "#", pageName: "QA Frames", frameName: "Hero Desktop Final", width: 1440, height: 900, aspectRatio: "16:10", platform: "Website", version: "v4", status: "Ready for Review", designerId: "u2", reviewerId: "u5", notes: "Open in Figma. Dashboard only stores metadata and lightweight preview." },
  { id: "f2", projectId: "p2", taskId: "t3", figmaFileName: "Orbit DAO Social Kit", figmaUrl: "#", pageName: "Exports", frameName: "IG Portrait Final", width: 1080, height: 1350, aspectRatio: "4:5", platform: "Instagram", version: "v2", status: "Changes Required", designerId: "u2", reviewerId: "u5", notes: "Check safe area and crop marks." },
];

const docs = [
  { id: "d1", title: "NexaChain Delivery SOP", category: "Delivery SOP", ownerId: "u1", projectId: "p1", tags: ["Delivery", "QA"], lastUpdated: "2026-05-15", content: "Final delivery checklist, version labels, approval rules, and client handoff notes." },
  { id: "d2", title: "Orbit DAO Brand Guidelines", category: "Brand Guidelines", ownerId: "u2", projectId: "p2", tags: ["Branding", "Design"], lastUpdated: "2026-05-13", content: "Logo usage, typography, social composition, and export requirements." },
  { id: "d3", title: "Content Voice Rules", category: "Content Guidelines", ownerId: "u4", projectId: null, tags: ["Content", "Internal"], lastUpdated: "2026-05-11", content: "Tone, CTA structures, Web3 clarity rules, and review checklist." },
];

const files = [
  { id: "file1", projectId: "p1", taskId: "t5", fileName: "nexachain-final-export.zip", fileType: "ZIP Folder", fileSize: "2.4 GB", fileUrl: "#", version: "Final Approved", status: "QA Review", uploadedBy: "u1", notes: "Stored as external cloud link." },
  { id: "file2", projectId: "p2", taskId: "t3", fileName: "orbit-social-kit-v2", fileType: "External Link", fileSize: "Drive", fileUrl: "#", version: "v2", status: "Internal Review", uploadedBy: "u2", notes: "Contains PNG and Figma source." },
  { id: "file3", projectId: "p1", taskId: "t2", fileName: "token-utility-copy.doc", fileType: "Document", fileSize: "240 KB", fileUrl: "#", version: "v3", status: "Draft", uploadedBy: "u4", notes: "Needs final review." },
];

const qaIssues = [
  { id: "q1", taskId: "t1", title: "Mobile hero CTA too close to safe area", description: "390x844 frame needs 24px bottom spacing before export.", issueType: "Mobile Issue", priority: "Critical", status: "Open", assignedTo: "u2", createdBy: "u5" },
  { id: "q2", taskId: "t3", title: "Portrait export missing v2 badge", description: "Add version marker and re-export PNG.", issueType: "Export Issue", priority: "High", status: "Rechecking", assignedTo: "u2", createdBy: "u5" },
  { id: "q3", taskId: "t2", title: "CTA copy does not match approved angle", description: "Use client-approved investor language from comment thread.", issueType: "Text Issue", priority: "Urgent", status: "In Progress", assignedTo: "u4", createdBy: "u1" },
];

const reminders = [
  { id: "r1", taskId: "t5", userId: "u1", reminderDate: "2026-05-16", reminderTime: "16:30", reminderNote: "Confirm final cloud folder permissions.", status: "Active" },
  { id: "r2", taskId: "t1", userId: "u1", reminderDate: "2026-05-16", reminderTime: "11:00", reminderNote: "Review QA notes after fixes.", status: "Active" },
];

const notifications = [
  { id: "n1", userId: "u1", type: "Mention", title: "You were mentioned in QA launch hero Figma frames", unread: true },
  { id: "n2", userId: "u1", type: "Reminder", title: "Final delivery folder reminder today", unread: true },
  { id: "n3", userId: "u1", type: "QA", title: "Token utility copy needs changes", unread: false },
];

const activity = [
  "Task moved to In QA by Omar",
  "Hamza was mentioned in a comment",
  "Figma frame Hero Desktop Final linked",
  "QA issue opened for mobile spacing",
  "Delivery package checklist updated",
];

const state = {
  view: "dashboard",
  selectedTaskId: "t1",
  search: "",
};

const $ = (selector) => document.querySelector(selector);
const userById = (id) => users.find((user) => user.id === id) || users[0];
const projectById = (id) => projects.find((project) => project.id === id) || projects[0];
const taskById = (id) => tasks.find((task) => task.id === id) || tasks[0];
const formatDate = (date) => new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const isOverdue = (task) => !task.completed && new Date(`${task.dueDate}T23:59:59`) < new Date("2026-05-16T23:59:59");

function statusClass(status) {
  const value = status.toLowerCase();
  if (value.includes("qa")) return "qa";
  if (value.includes("review") || value.includes("rechecking")) return "review";
  if (value.includes("changes") || value.includes("overdue")) return "changes";
  if (value.includes("approved") || value.includes("delivered") || value.includes("completed")) return "approved";
  return "";
}

function priorityClass(priority) {
  return priority.toLowerCase();
}

function statusPill(status) {
  return `<span class="status ${statusClass(status)}">${status}</span>`;
}

function priorityBadge(priority) {
  return `<span class="priority ${priorityClass(priority)}">${priority}</span>`;
}

function tagChips(tags) {
  return tags.map((tag) => `<span class="tag">${tag}</span>`).join("");
}

function avatarStack(ids) {
  return `<div class="avatar-stack">${ids.slice(0, 4).map((id) => `<span title="${userById(id).name}">${userById(id).avatar}</span>`).join("")}</div>`;
}

function taskScore(task) {
  const priorityScore = { Critical: 100, Urgent: 90, High: 70, Medium: 45, Low: 20 }[task.priority] || 0;
  const overdueScore = isOverdue(task) ? 80 : 0;
  const todayScore = task.dueDate === "2026-05-16" ? 60 : 0;
  const mentionScore = task.mentions.includes(currentUserId) ? 35 : 0;
  return priorityScore + overdueScore + todayScore + mentionScore;
}

function getMyWork() {
  return tasks
    .filter((task) => task.assigneeId === currentUserId || task.reviewerId === currentUserId || task.mentions.includes(currentUserId) || task.starUserIds.includes(currentUserId))
    .sort((a, b) => taskScore(b) - taskScore(a));
}

function matchesSearch(item, fields) {
  if (!state.search.trim()) return true;
  const query = state.search.trim().toLowerCase();
  return fields.some((field) => String(item[field] || "").toLowerCase().includes(query));
}

function emptyState(label) {
  return `<div class="empty-state">${label}</div>`;
}

function renderShell() {
  const app = $("#app");
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark">B</div>
          <div>
            <strong>BeeFlow</strong>
            <span>Beenco workflow OS</span>
          </div>
        </div>
        <div class="sidebar-search">${icon("search")}<span>Search workspace...</span></div>
        <nav class="nav">
          <div class="nav-section">Workspace</div>
          ${navItems.slice(0, 8).map(navButton).join("")}
          <div class="nav-section">Operate</div>
          ${navItems.slice(8).map(navButton).join("")}
        </nav>
        <div class="sidebar-footer">
          <div class="focus-card">
            <strong>Daily focus</strong>
            <p>${getMyWork().length} active items need your attention across QA, delivery, mentions, and starred work.</p>
            <button class="primary-btn" data-view="work">Open My Work</button>
          </div>
          <div class="user-chip">
            <div class="avatar">${userById(currentUserId).avatar}</div>
            <div>
              <strong>${userById(currentUserId).name}</strong><br />
              <small>${userById(currentUserId).email}</small>
            </div>
          </div>
        </div>
      </aside>
      <main class="main">
        <header class="topbar">
          <label class="searchbar">
            ${icon("search")}
            <input id="globalSearch" value="${state.search}" placeholder="Search tasks, projects, docs, files..." />
          </label>
          <div class="top-actions">
            <button class="icon-btn" title="Notifications">${icon("bell")}</button>
            <button class="ghost-btn" data-view="qa">QA Hub</button>
            <button class="primary-btn" data-view="tasks">${icon("plus")} New Task</button>
          </div>
        </header>
        <section id="view"></section>
      </main>
    </div>
  `;
  bindShellEvents();
  renderView();
}

function navButton([view, label, iconKey]) {
  return `
    <button class="nav-item ${state.view === view ? "active" : ""}" data-view="${view}">
      <span class="nav-icon">${icon(icons[iconKey])}</span>
      <span class="nav-label">${label}</span>
    </button>
  `;
}

function bindShellEvents() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      renderShell();
    });
  });

  $("#globalSearch").addEventListener("input", (event) => {
    state.search = event.target.value;
    renderView();
  });
}

function viewHeader(title, subtitle, actions = "", summary = "") {
  return `
    <div class="hero-panel">
      <div class="view-header ${summary ? "" : "single"}">
        <div>
          <span class="eyebrow">Beenco daily ops</span>
          <h1>${title}</h1>
          <p>${subtitle}</p>
          <div class="hero-actions" style="margin-top:20px">${actions}</div>
        </div>
        ${summary ? `<div class="hero-summary">${summary}</div>` : ""}
      </div>
    </div>
  `;
}

function summaryItem(label, value) {
  return `<div class="summary-item"><small>${label}</small><strong>${value}</strong></div>`;
}

function metricCard(label, value, progress) {
  return `
    <div class="metric-card">
      <small>${label}</small>
      <strong>${value}</strong>
      <div class="mini-progress"><span style="width:${progress}%"></span></div>
    </div>
  `;
}

function taskRow(task) {
  const project = projectById(task.projectId);
  return `
    <article class="task-row" data-task="${task.id}">
      <button class="star ${task.starUserIds.includes(currentUserId) ? "active" : ""}" data-star="${task.id}" title="Star task">${icon("star")}</button>
      <div>
        <div class="task-title">
          ${task.title}
          ${statusPill(task.status)}
          ${priorityBadge(task.priority)}
          ${task.mentions.includes(currentUserId) ? `<span class="status review">Unread mention</span>` : ""}
        </div>
        <div class="task-meta">
          <span>${project.name}</span>
          <span>${task.taskType}</span>
          <span>${isOverdue(task) ? "Overdue" : "Due"} ${formatDate(task.dueDate)}</span>
          <span>Reviewer: ${userById(task.reviewerId).name}</span>
        </div>
      </div>
      <div>${tagChips(task.tags.slice(0, 2))}</div>
    </article>
  `;
}

function taskCard(task) {
  return `
    <article class="task-card" draggable="true" data-task="${task.id}">
      <div>${priorityBadge(task.priority)}</div>
      <h3>${task.title}</h3>
      <p>${task.description}</p>
      <div class="card-footer">
        ${avatarStack([task.assigneeId, task.reviewerId])}
        <span>${formatDate(task.dueDate)}</span>
      </div>
    </article>
  `;
}

function renderDashboard() {
  const myWork = getMyWork().filter((task) => matchesSearch(task, ["title", "description", "taskType", "status", "priority"]));
  const dueToday = tasks.filter((task) => task.dueDate === "2026-05-16" && !task.completed);
  const overdue = tasks.filter(isOverdue);
  const qa = tasks.filter((task) => task.status.includes("QA") || task.status.includes("Changes"));
  return `
    ${viewHeader(
      "BeeFlow keeps agency work readable.",
      "A dark, quiet workflow space for Beenco projects, tasks, Figma frames, content briefs, QA review, files, docs, reminders, and final delivery. Built to show what matters now without pushing every detail into your face.",
      `<button class="primary-btn" data-view="work">Open My Work</button><button class="ghost-btn" data-view="qa">Review QA</button><button class="ghost-btn" data-view="figma">Figma Work</button>`,
      `${summaryItem("Today", `${dueToday.length} due`)}${summaryItem("QA lane", `${qa.length} items`)}${summaryItem("Delivery", `${tasks.filter((task) => task.status === "Ready for Delivery").length} ready`)}`
    )}
    <section class="landing-section">
      <div class="panel-title"><h2>Daily signal</h2><span class="status">Small numbers, clear action</span></div>
      <p class="section-copy">The top layer stays intentionally light: a few counters, a clear work queue, and enough context to decide the next move. Heavy files, full Figma embeds, and noisy charts stay out of the dashboard.</p>
      <div class="grid metrics-grid">
      ${metricCard("My tasks", myWork.length, 78)}
      ${metricCard("Due today", dueToday.length, 42)}
      ${metricCard("Overdue", overdue.length, 28)}
      ${metricCard("Tasks in QA", qa.length, 64)}
      </div>
    </section>
    <section class="landing-section">
      <div class="panel-title"><h2>Core workflow</h2><span class="status approved">Delivery path</span></div>
      <p class="section-copy">BeeFlow follows the actual agency path from project setup to task execution, creative/content work, QA changes, approval, and final delivery.</p>
      <div class="showcase-grid">
        <article class="workflow-step showcase-card large">
          <span>${icon("grid")}</span>
          <strong>Build workflows that match Beenco.</strong>
          <p>Projects, tasks, creative briefs, content work, reminders, Figma frames, QA checks, and delivery links live in one calm operating space. The goal is not more software noise. The goal is knowing what should move next.</p>
        </article>
        <div class="showcase-stack">
          <article class="workflow-step showcase-card">
            <span>${icon("shieldCheck")}</span>
            <strong>Review work before it ships.</strong>
            <p>Move work through Ready for QA, In QA, Changes Required, Rechecking, Approved, and Ready for Delivery with clear owners and issue notes.</p>
          </article>
          <article class="workflow-step showcase-card">
            <span>${icon("folder")}</span>
            <strong>Keep heavy files lightweight.</strong>
            <p>Store file metadata, Figma frame specs, external links, versions, sizes, ratios, and final delivery status without loading huge assets on the dashboard.</p>
          </article>
        </div>
      </div>
    </section>
    <div class="grid workspace-grid">
      <section class="content-panel">
        <div class="panel-title">
          <h2>Highest priority now</h2>
          <button class="ghost-btn" data-view="work">View all</button>
        </div>
        <div class="filter-bar">
          <span class="filter-chip">Critical first</span>
          <span class="filter-chip">Overdue</span>
          <span class="filter-chip">Mentioned</span>
          <span class="filter-chip">QA waiting</span>
          <span class="filter-chip">Final delivery</span>
        </div>
        <div class="task-list">${myWork.slice(0, 6).map(taskRow).join("") || emptyState("No matching focus items.")}</div>
      </section>
      ${renderDetailPanel()}
    </div>
    <div class="grid two-col">
      <section class="content-panel">
        <div class="panel-title"><h2>Active projects</h2><button class="ghost-btn" data-view="projects">Open projects</button></div>
        <div class="grid">${projects.map(projectCard).join("")}</div>
      </section>
      <section class="content-panel">
        <div class="panel-title"><h2>Notifications</h2><span class="status review">${notifications.filter((item) => item.unread).length} unread</span></div>
        <div class="task-list">${notifications.map((item) => `<article class="task-row"><div class="star ${item.unread ? "active" : ""}">${icon("bell")}</div><div><div class="task-title">${item.title}</div><div class="task-meta">${item.type}</div></div><span class="status">${item.unread ? "Unread" : "Read"}</span></article>`).join("")}</div>
      </section>
    </div>
    <section class="landing-section">
      <div class="panel-title"><h2>Operating areas</h2><span class="status">MVP ready</span></div>
      <p class="section-copy">Each area is kept narrow and practical. The product should feel like a daily operating system, not a crowded SaaS template.</p>
      <div class="grid three-col">
        ${[
          ["My Work List", "One personal queue for assigned tasks, mentions, starred tasks, reviews, rework, and delivery follow-ups."],
          ["Figma Work", "File names, frame names, ratios, sizes, versions, designers, reviewers, and links without loading heavy files."],
          ["QA Hub", "A dedicated place for issues, screenshots, priorities, rechecking, approvals, and delivery readiness."],
          ["Docs", "Guidelines, SOPs, reusable briefs, client notes, content rules, and QA checklists."],
          ["Files", "External links, versions, sizes, owners, notes, statuses, and final approved packages."],
          ["Team", "Roles, departments, workload, active tasks, assigned projects, and completion history."]
        ].map(([title, copy]) => `<article class="feature-card"><span class="tag">BeeFlow</span><h3>${title}</h3><p>${copy}</p></article>`).join("")}
      </div>
    </section>
  `;
}

function renderMyWork() {
  const work = getMyWork().filter((task) => matchesSearch(task, ["title", "description", "taskType", "status", "priority"]));
  return `
    ${viewHeader(
      "My Work List",
      "Automatically sorted around what matters now: critical priority, overdue items, due today, fresh mentions, starred tasks, QA reviews, and rework.",
      `<button class="ghost-btn">Add reminder</button><button class="primary-btn">Move selected to QA</button>`
    )}
    <div class="grid workspace-grid">
      <section class="content-panel">
        <div class="panel-title"><h2>Work sorted by urgency</h2><span class="status">${work.length} items</span></div>
        <div class="filter-bar">
          <span class="filter-chip">Assigned to me</span>
          <span class="filter-chip">Reviewer</span>
          <span class="filter-chip">Mentioned</span>
          <span class="filter-chip">Starred</span>
          <span class="filter-chip">Needs rework</span>
          <span class="filter-chip">Ready for delivery</span>
        </div>
        <div class="task-list">${work.map(taskRow).join("") || emptyState("No matching work items.")}</div>
      </section>
      ${renderDetailPanel()}
    </div>
  `;
}

function renderTasks() {
  const visibleTasks = tasks.filter((task) => matchesSearch(task, ["title", "description", "taskType", "status", "priority"]));
  const lanes = ["Backlog", "In Progress", "Ready for QA", "In QA", "Changes Required", "Ready for Delivery"];
  const laneTasks = {
    Backlog: visibleTasks.filter((task) => task.status === "Backlog" || task.status === "To Do"),
    "In Progress": visibleTasks.filter((task) => task.status === "In Progress"),
    "Ready for QA": visibleTasks.filter((task) => task.status === "Ready for QA"),
    "In QA": visibleTasks.filter((task) => task.status === "In QA" || task.status === "Rechecking"),
    "Changes Required": visibleTasks.filter((task) => task.status === "Changes Required"),
    "Ready for Delivery": visibleTasks.filter((task) => task.status === "Ready for Delivery"),
  };
  return `
    ${viewHeader(
      "My Tasks",
      "List and board views for task assignment, QA movement, reminders, Figma links, creative specs, content briefs, and completed history.",
      `<button class="ghost-btn">List View</button><button class="primary-btn">Board View</button>`
    )}
    <section class="content-panel">
      <div class="panel-title"><h2>Kanban workflow</h2><span class="status">Drag cards between lanes</span></div>
      <div class="filter-bar">
        <span class="filter-chip">Assignee</span><span class="filter-chip">Project</span><span class="filter-chip">Status</span><span class="filter-chip">Priority</span><span class="filter-chip">Task type</span><span class="filter-chip">Starred</span>
      </div>
      <div class="kanban">
        ${lanes.map((lane, index) => `
          <div class="kanban-column" data-lane="${lane}">
            <div class="kanban-head"><strong><span class="lane-dot"></span>${lane}</strong><span>${laneTasks[lane].length}</span></div>
            ${laneTasks[lane].map(taskCard).join("") || emptyState("No tasks here")}
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderProjects() {
  const visibleProjects = projects.filter((project) => matchesSearch(project, ["name", "description", "clientName", "status", "priority"]));
  return `
    ${viewHeader("Projects", "Project records connect client work, team ownership, Figma files, docs, delivery links, activity, priority, status, and progress.", `<button class="primary-btn">New Project</button>`)}
    <section class="content-panel">
      <div class="panel-title"><h2>Project portfolio</h2><span class="status">${projects.length} active</span></div>
      <div class="grid three-col">${visibleProjects.map(projectCard).join("") || emptyState("No matching projects.")}</div>
    </section>
  `;
}

function projectCard(project) {
  return `
    <article class="project-card">
      <div>${statusPill(project.status)} ${priorityBadge(project.priority)}</div>
      <h3>${project.name}</h3>
      <p>${project.description}</p>
      <div class="task-meta">
        <span>${project.clientName}</span>
        <span>Due ${formatDate(project.dueDate)}</span>
      </div>
      <div class="mini-progress" style="margin:14px 0 12px"><span style="width:${project.progress}%"></span></div>
      <div class="card-footer">${avatarStack(project.teamMembers)}<strong>${project.progress}%</strong></div>
    </article>
  `;
}

function renderTeam() {
  return `
    ${viewHeader("Team", "A simple team area for roles, departments, workload, assigned projects, active tasks, completed tasks, and availability.", `<button class="primary-btn">Invite Member</button>`)}
    <section class="content-panel">
      <div class="panel-title"><h2>Members</h2><span class="status">Active team</span></div>
      <div class="grid three-col">
        ${users.map((user) => {
          const activeTasks = tasks.filter((task) => task.assigneeId === user.id && !task.completed).length;
          const completed = tasks.filter((task) => task.completedBy === user.id).length;
          return `<article class="team-card">
            <div class="avatar">${user.avatar}</div>
            <h3>${user.name}</h3>
            <p>${user.role} · ${user.department}</p>
            <div class="info-line"><span>Active tasks</span><strong>${activeTasks}</strong></div>
            <div class="info-line"><span>Completed</span><strong>${completed}</strong></div>
            <div class="info-line"><span>Status</span><strong>${user.status}</strong></div>
          </article>`;
        }).join("")}
      </div>
    </section>
  `;
}

function renderQA() {
  const visibleIssues = qaIssues.filter((issue) => matchesSearch(issue, ["title", "description", "issueType", "priority", "status"]));
  return `
    ${viewHeader("Review Hub / QA", "The approval lane before final delivery: Ready for QA, In QA, Changes Required, Rechecking, Approved, and Ready for Delivery.", `<button class="ghost-btn">QA Board</button><button class="primary-btn">Log Issue</button>`)}
    <section class="content-panel">
      <div class="panel-title"><h2>QA issues</h2><span class="status qa">${qaIssues.length} tracked</span></div>
      <div class="grid three-col">
        ${visibleIssues.map((issue) => {
          const task = taskById(issue.taskId);
          return `<article class="qa-card">
            <div>${statusPill(issue.status)} ${priorityBadge(issue.priority)}</div>
            <h3>${issue.title}</h3>
            <p>${issue.description}</p>
            <div class="task-meta"><span>${issue.issueType}</span><span>${task.title}</span><span>${userById(issue.assignedTo).name}</span></div>
          </article>`;
        }).join("") || emptyState("No matching QA issues.")}
      </div>
    </section>
  `;
}

function renderFigma() {
  const visibleFigma = figmaWork.filter((item) => matchesSearch(item, ["figmaFileName", "pageName", "frameName", "aspectRatio", "platform", "status"]));
  return `
    ${viewHeader("Figma Work", "Lightweight Figma management for file links, frames, sizes, ratios, versions, designers, reviewers, and status without loading heavy files in the dashboard.", `<button class="primary-btn">Attach Figma Link</button>`)}
    <section class="content-panel">
      <div class="panel-title"><h2>Figma frames</h2><span class="status">Metadata only</span></div>
      <div class="grid two-col">
        ${visibleFigma.map((item) => `<article class="figma-card">
          <div>${statusPill(item.status)} <span class="tag">${item.version}</span></div>
          <h3>${item.figmaFileName}</h3>
          <p>${item.notes}</p>
          <div class="info-line"><span>Frame</span><strong>${item.frameName}</strong></div>
          <div class="info-line"><span>Size</span><strong>${item.width} x ${item.height}</strong></div>
          <div class="info-line"><span>Ratio</span><strong>${item.aspectRatio}</strong></div>
          <div class="info-line"><span>Designer</span><strong>${userById(item.designerId).name}</strong></div>
        </article>`).join("") || emptyState("No matching Figma work.")}
      </div>
    </section>
  `;
}

function renderDocs() {
  const visibleDocs = docs.filter((doc) => matchesSearch(doc, ["title", "category", "content", "lastUpdated"]));
  return `
    ${viewHeader("Docs", "Internal documentation for brand guidelines, content rules, QA checklists, client notes, project instructions, delivery SOPs, and reusable briefs.", `<button class="primary-btn">New Doc</button>`)}
    <section class="content-panel">
      <div class="panel-title"><h2>Knowledge base</h2><span class="status">${docs.length} docs</span></div>
      <div class="grid three-col">
        ${visibleDocs.map((doc) => `<article class="doc-card">
          <span class="status">${doc.category}</span>
          <h3>${doc.title}</h3>
          <p>${doc.content}</p>
          <div class="task-meta"><span>${userById(doc.ownerId).name}</span><span>Updated ${formatDate(doc.lastUpdated)}</span></div>
          <div style="margin-top:12px">${tagChips(doc.tags)}</div>
        </article>`).join("") || emptyState("No matching docs.")}
      </div>
    </section>
  `;
}

function renderFiles() {
  const visibleFiles = files.filter((file) => matchesSearch(file, ["fileName", "fileType", "fileSize", "version", "status"]));
  return `
    ${viewHeader("Files / Deliverables", "Fast metadata-first handling for large creative files, external folders, Figma source links, versions, status, owners, notes, and final delivery packages.", `<button class="primary-btn">Add Deliverable</button>`)}
    <section class="content-panel">
      <div class="panel-title"><h2>Deliverable tracker</h2><span class="status">No heavy previews</span></div>
      <div class="task-list">
        ${visibleFiles.map((file) => `<article class="file-row">
          <strong>${file.fileName}</strong>
          <span>${file.fileType}</span>
          <span>${file.fileSize}</span>
          <span>${file.version}</span>
          ${statusPill(file.status)}
        </article>`).join("") || emptyState("No matching deliverables.")}
      </div>
    </section>
  `;
}

function renderReports() {
  return `
    ${viewHeader("Reports", "Minimal reporting for workload, QA bottlenecks, overdue tasks, delivery readiness, and active project progress.", `<button class="primary-btn">Export Summary</button>`)}
    <div class="grid metrics-grid">
      ${metricCard("Active projects", projects.length, 66)}
      ${metricCard("QA bottlenecks", qaIssues.filter((issue) => issue.status !== "Approved").length, 48)}
      ${metricCard("Delivery pending", tasks.filter((task) => task.status === "Ready for Delivery").length, 30)}
      ${metricCard("Completed history", tasks.filter((task) => task.completed).length, 22)}
    </div>
  `;
}

function renderSettings() {
  return `
    ${viewHeader("Settings", "Simple workspace controls for notification hygiene, departments, task types, tags, statuses, reminder defaults, and delivery rules.", `<button class="primary-btn">Save Settings</button>`)}
    <section class="content-panel">
      <div class="panel-title"><h2>Workspace setup</h2><span class="status">MVP</span></div>
      <div class="grid two-col">
        <div class="brief-box"><h4>Departments</h4><p>Design, UI/UX, Development, Web3, Content, Video, QA, Management</p></div>
        <div class="brief-box"><h4>Task types</h4><p>UI/UX Design, Brand Design, Landing Page, Social Post, Development, Content, QA Fix, Final Delivery</p></div>
        <div class="brief-box"><h4>Reminder defaults</h4><p>Today, tomorrow, before due date, and custom date/time.</p></div>
        <div class="brief-box"><h4>Delete behavior</h4><p>Important records require confirmation and completed tasks stay in history.</p></div>
      </div>
    </section>
  `;
}

function renderDetailPanel() {
  const task = taskById(state.selectedTaskId);
  const project = projectById(task.projectId);
  const figma = figmaWork.find((item) => item.id === task.figmaWorkId);
  const taskReminder = reminders.find((item) => item.taskId === task.id && item.userId === currentUserId);
  return `
    <aside class="detail-panel">
      <div class="panel-title">
        <h3>Selected task</h3>
        <span class="status ${statusClass(task.status)}">${task.status}</span>
      </div>
      <h2 style="margin:0 0 8px">${task.title}</h2>
      <p style="margin:0 0 14px;color:var(--muted);line-height:1.5">${task.description}</p>
      <div class="info-list">
        <div class="info-line"><span>Project</span><strong>${project.name}</strong></div>
        <div class="info-line"><span>Assignee</span><strong>${userById(task.assigneeId).name}</strong></div>
        <div class="info-line"><span>Reviewer</span><strong>${userById(task.reviewerId).name}</strong></div>
        <div class="info-line"><span>Due date</span><strong>${formatDate(task.dueDate)}</strong></div>
        <div class="info-line"><span>Type</span><strong>${task.taskType}</strong></div>
      </div>
      <div class="brief-box">
        <h4>Task brief</h4>
        <ul>
          <li>Objective: complete the work with QA-ready output.</li>
          <li>Required format: Figma source, final exports, and linked notes where needed.</li>
          <li>Reviewer must approve before delivery.</li>
        </ul>
      </div>
      ${figma ? `<div class="brief-box"><h4>Figma spec</h4><div class="info-line"><span>Frame</span><strong>${figma.frameName}</strong></div><div class="info-line"><span>Size</span><strong>${figma.width} x ${figma.height}</strong></div><div class="info-line"><span>Ratio</span><strong>${figma.aspectRatio}</strong></div></div>` : ""}
      ${taskReminder ? `<div class="brief-box"><h4>Reminder</h4><p>${taskReminder.reminderDate} at ${taskReminder.reminderTime}: ${taskReminder.reminderNote}</p></div>` : ""}
      <div class="brief-box">
        <h4>Quick actions</h4>
        <div class="filter-bar">
          <span class="filter-chip">Star</span>
          <span class="filter-chip">Reminder</span>
          <span class="filter-chip">Move to QA</span>
          <span class="filter-chip">Comment</span>
          <span class="filter-chip">Attach link</span>
        </div>
      </div>
      <div class="brief-box">
        <h4>Activity</h4>
        <div class="activity">${activity.map((item) => `<div class="activity-item">${item}</div>`).join("")}</div>
      </div>
    </aside>
  `;
}

function renderView() {
  const view = $("#view");
  const renderers = {
    dashboard: renderDashboard,
    work: renderMyWork,
    projects: renderProjects,
    tasks: renderTasks,
    team: renderTeam,
    qa: renderQA,
    figma: renderFigma,
    docs: renderDocs,
    files: renderFiles,
    reports: renderReports,
    settings: renderSettings,
  };
  view.innerHTML = renderers[state.view]();
  bindViewEvents();
}

function bindViewEvents() {
  document.querySelectorAll("[data-task]").forEach((item) => {
    item.addEventListener("click", () => {
      state.selectedTaskId = item.dataset.task;
      renderView();
    });
  });

  document.querySelectorAll("[data-star]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const task = taskById(button.dataset.star);
      if (task.starUserIds.includes(currentUserId)) {
        task.starUserIds = task.starUserIds.filter((id) => id !== currentUserId);
      } else {
        task.starUserIds.push(currentUserId);
      }
      renderView();
    });
  });

  document.querySelectorAll(".task-card").forEach((card) => {
    card.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", card.dataset.task);
    });
  });

  document.querySelectorAll(".kanban-column").forEach((column) => {
    column.addEventListener("dragover", (event) => event.preventDefault());
    column.addEventListener("drop", (event) => {
      event.preventDefault();
      const task = taskById(event.dataTransfer.getData("text/plain"));
      task.status = column.dataset.lane;
      renderView();
    });
  });

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      renderShell();
    });
  });
}

renderShell();
