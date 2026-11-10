// Change this if your FastAPI server runs somewhere else.
const API_BASE = "https://task-manager-api-kkxl.onrender.com";

const $ = (id) => document.getElementById(id);
let token = localStorage.getItem("taskflow_token");
let currentUser = null;
let tasks = [];
let activeFilter = "all";
let editingTaskId = null;
let isRegisterMode = false;

function authHeaders(json = true) {
  const headers = {};
  if (json) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}
async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const raw = await response.text();
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
  if (!response.ok) {
    const detail = data && typeof data === "object" ? (data.detail || data.message) : data;
    throw new Error(detail || `Request failed (${response.status})`);
  }
  return data;
}
function showMessage(element, message, isError = true) {
  element.textContent = message || "";
  element.style.color = isError ? "#b24b42" : "#216b50";
}
function showAuth() {
  $("authView").classList.remove("hidden");
  $("appView").classList.add("hidden");
}
function showApp() {
  $("authView").classList.add("hidden");
  $("appView").classList.remove("hidden");
}
function setAuthMode(register) {
  isRegisterMode = register;
  $("authTitle").textContent = register ? "Create your space." : "Welcome back.";
  $("authSubtitle").textContent = register ? "A few details and you're ready to go." : "Sign in to pick up where you left off.";
  $("usernameField").classList.toggle("hidden", !register);
  $("username").required = register;
  $("password").autocomplete = register ? "new-password" : "current-password";
  $("authSubmit").innerHTML = register ? 'Create account <span>→</span>' : 'Sign in <span>→</span>';
  $("switchText").textContent = register ? "Already have an account?" : "New to Taskflow?";
  $("switchMode").textContent = register ? "Sign in" : "Create an account";
  showMessage($("authMessage"), "");
}
$("switchMode").addEventListener("click", () => setAuthMode(!isRegisterMode));

$("authForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = $("authSubmit");
  button.disabled = true;
  showMessage($("authMessage"), isRegisterMode ? "Creating your account..." : "Signing you in...", false);
  const email = $("email").value.trim();
  const password = $("password").value;
  try {
    if (isRegisterMode) {
      await api("/users", {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ username: $("username").value.trim(), email, password })
      });
      // Register first, then use the same login flow.
    }
    const form = new URLSearchParams();
    form.set("username", email); // FastAPI OAuth2 form expects email in the username field.
    form.set("password", password);
    const result = await api("/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form
    });
    token = result.access_token;
    localStorage.setItem("taskflow_token", token);
    await loadApp();
  } catch (error) {
    showMessage($("authMessage"), error.message);
  } finally {
    button.disabled = false;
  }
});

async function loadApp() {
  try {
    currentUser = await api("/me", { headers: authHeaders(false) });
    tasks = await api("/tasks", { headers: authHeaders(false) });
    // The API's /me currently returns user_id; use it as a fallback display label.
    const label = currentUser.username || `User ${currentUser.user_id ?? ""}`.trim() || "User";
    $("profileName").textContent = label;
    $("profileEmail").textContent = currentUser.email || "Signed in";
    $("avatar").textContent = label.charAt(0).toUpperCase();
    $("greeting").textContent = `Your tasks, ${label}.`;
    $("todayLabel").textContent = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date()).toUpperCase();
    showApp();
    renderTasks();
  } catch (error) {
    token = null;
    localStorage.removeItem("taskflow_token");
    showAuth();
    showMessage($("authMessage"), error.message === "Unauthorized" ? "Your session expired. Please sign in again." : error.message);
  }
}

function filteredTasks() {
  const query = $("searchInput").value.trim().toLowerCase();
  return tasks.filter(task => {
    const matchesFilter = activeFilter === "all" ||
      (activeFilter === "pending" && !task.completed) ||
      (activeFilter === "completed" && task.completed);
    const matchesSearch = !query || `${task.title} ${task.description || ""}`.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });
}
function renderTasks() {
  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.length - completed;
  $("allCount").textContent = tasks.length;
  $("pendingCount").textContent = pending;
  $("completedCount").textContent = completed;
  const percent = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
  $("progressPercent").textContent = `${percent}%`;
  $("progressRing").style.background = `conic-gradient(var(--green) ${percent * 3.6}deg, #d2e4d7 0deg)`;
  $("progressTitle").textContent = tasks.length ? `${completed} of ${tasks.length} tasks completed.` : "Let's make today count.";
  $("progressSubtitle").textContent = tasks.length ? (pending ? `${pending} task${pending === 1 ? "" : "s"} left to go. Keep it up.` : "Everything is done. Nice work!") : "Add a task and get moving.";

  const titles = { all: "All tasks", pending: "In progress", completed: "Completed" };
  $("listTitle").childNodes[0].textContent = `${titles[activeFilter]} `;
  const visible = filteredTasks();
  $("visibleCount").textContent = visible.length;
  $("taskList").innerHTML = "";
  $("loadingState").classList.add("hidden");
  $("emptyState").classList.toggle("hidden", visible.length !== 0);
  $("emptyTitle").textContent = tasks.length ? "No matching tasks." : "Nothing here yet.";
  $("emptyText").textContent = tasks.length ? "Try another search or switch filters." : "Add your first task and make a little progress.";

  visible.forEach(task => {
    const card = document.createElement("article");
    card.className = `task-card ${task.completed ? "is-complete" : ""}`;
    const check = document.createElement("button");
    check.className = `check-button ${task.completed ? "checked" : ""}`;
    check.type = "button"; check.textContent = task.completed ? "✓" : "";
    check.title = task.completed ? "Mark as pending" : "Mark as completed";
    check.addEventListener("click", () => updateTask(task.id, { ...task, completed: !task.completed }));
    const copy = document.createElement("div"); copy.className = "task-copy";
    const title = document.createElement("h3"); title.textContent = task.title;
    const description = document.createElement("p"); description.textContent = task.description || "No description";
    copy.append(title, description);
    const meta = document.createElement("span"); meta.className = "task-meta"; meta.textContent = task.completed ? "COMPLETED" : "IN PROGRESS";
    const actions = document.createElement("div"); actions.className = "task-actions";
    const edit = document.createElement("button"); edit.className = "icon-button"; edit.type = "button"; edit.textContent = "✎"; edit.title = "Edit task";
    edit.addEventListener("click", () => openTaskForm(task));
    const del = document.createElement("button"); del.className = "icon-button"; del.type = "button"; del.textContent = "⌫"; del.title = "Delete task";
    del.addEventListener("click", () => deleteTask(task.id));
    actions.append(edit, del);
    card.append(check, copy, meta, actions);
    $("taskList").append(card);
  });
}
async function refreshTasks() {
  tasks = await api("/tasks", { headers: authHeaders(false) });
  renderTasks();
}
function openTaskForm(task = null) {
  editingTaskId = task ? task.id : null;
  $("formTitle").textContent = task ? "Edit task" : "Create a task";
  $("saveTask").textContent = task ? "Save changes" : "Save task";
  $("taskTitle").value = task?.title || "";
  $("taskDescription").value = task?.description || "";
  $("taskForm").classList.remove("hidden");
  $("taskTitle").focus();
  $("taskForm").scrollIntoView({ behavior: "smooth", block: "center" });
}
function closeTaskForm() {
  $("taskForm").classList.add("hidden");
  $("taskForm").reset();
  editingTaskId = null;
}
$("addTaskTop").addEventListener("click", () => openTaskForm());
$("emptyAdd").addEventListener("click", () => openTaskForm());
$("closeForm").addEventListener("click", closeTaskForm);
$("cancelForm").addEventListener("click", closeTaskForm);
$("taskForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = { title: $("taskTitle").value.trim(), description: $("taskDescription").value.trim() || null };
  const button = $("saveTask"); button.disabled = true;
  try {
    if (editingTaskId !== null) {
      const existing = tasks.find(t => t.id === editingTaskId);
      await updateTask(editingTaskId, { ...existing, ...payload });
    } else {
      await api("/tasks", { method: "POST", headers: authHeaders(), body: JSON.stringify(payload) });
      await refreshTasks();
    }
    closeTaskForm();
    showMessage($("appMessage"), "Task saved.", false);
  } catch (error) { showMessage($("appMessage"), error.message); }
  finally { button.disabled = false; }
});
async function updateTask(id, task) {
  await api(`/tasks/${id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify({
    title: task.title, description: task.description || null, completed: Boolean(task.completed)
  }) });
  await refreshTasks();
}
async function deleteTask(id) {
  if (!window.confirm("Delete this task? This can't be undone.")) return;
  try {
    await api(`/tasks/${id}`, { method: "DELETE", headers: authHeaders(false) });
    await refreshTasks();
    showMessage($("appMessage"), "Task deleted.", false);
  } catch (error) { showMessage($("appMessage"), error.message); }
}
document.querySelectorAll(".nav-item").forEach(button => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  document.querySelectorAll(".nav-item").forEach(item => item.classList.toggle("active", item === button));
  renderTasks();
}));
$("searchInput").addEventListener("input", renderTasks);
$("logoutButton").addEventListener("click", () => {
  token = null; currentUser = null; tasks = [];
  localStorage.removeItem("taskflow_token");
  $("authForm").reset(); setAuthMode(false); showAuth();
});

if (token) loadApp(); else showAuth();
