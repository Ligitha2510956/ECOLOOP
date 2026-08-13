/* ============================================================
   EcoLoop frontend logic
   Talks to the Flask API at API_BASE.
   ============================================================ */

const API_BASE = "http://127.0.0.1:5000/api";

const CATEGORY_ICONS = {
  "Chemicals": "bi-droplet-half",
  "E-waste": "bi-cpu",
  "Lab Equipment": "bi-flask",
  "Textbooks": "bi-book",
  "Furniture": "bi-lamp",
  "Bicycles": "bi-bicycle",
  "General Supplies": "bi-box-seam"
};

/* ---------------------------------------------------------
   Small helpers
--------------------------------------------------------- */
function getCurrentUser() {
  const raw = localStorage.getItem("ecoloop_user");
  return raw ? JSON.parse(raw) : null;
}

function setCurrentUser(user) {
  localStorage.setItem("ecoloop_user", JSON.stringify(user));
  updateAuthUI();
}

function clearCurrentUser() {
  localStorage.removeItem("ecoloop_user");
  updateAuthUI();
}

function showToast(message, type = "success") {
  const toastEl = document.getElementById("ecoToast");
  const body = document.getElementById("ecoToastBody");
  body.textContent = message;
  toastEl.className = "toast align-items-center text-white border-0 " +
    (type === "error" ? "bg-danger" : "bg-success");
  new bootstrap.Toast(toastEl, { delay: 2800 }).show();
}

function pillClass(status) {
  return "pill pill-" + (status || "").toLowerCase();
}

/* ---------------------------------------------------------
   Navigation between the single-page sections
--------------------------------------------------------- */
function showPage(pageId) {
  document.querySelectorAll(".page-section").forEach(sec => sec.classList.add("d-none"));
  const target = document.getElementById("page-" + pageId);
  if (target) target.classList.remove("d-none");

  document.querySelectorAll(".eco-nav-link").forEach(link => {
    link.classList.toggle("active", link.dataset.page === pageId);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });

  // load fresh data whenever a data-driven page is opened
  if (pageId === "browse") loadBrowseItems();
  if (pageId === "dashboard") loadDashboard();
  if (pageId === "requests") loadRequestsPage();
}

document.querySelectorAll("[data-page]").forEach(el => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    const page = el.dataset.page;

    // Upload & Requests require login
    if ((page === "upload" || page === "requests") && !getCurrentUser()) {
      showToast("Please login first", "error");
      showPage("auth");
      return;
    }
    showPage(page);
  });
});

/* ---------------------------------------------------------
   Auth: login / register / logout
--------------------------------------------------------- */
function updateAuthUI() {
  const user = getCurrentUser();
  const loginBtn = document.getElementById("loginNavBtn");
  const userBox = document.getElementById("navUserBox");

  if (user) {
    loginBtn.classList.add("d-none");
    userBox.classList.remove("d-none");
    document.getElementById("navUserName").textContent = user.name;
  } else {
    loginBtn.classList.remove("d-none");
    userBox.classList.add("d-none");
  }
}

document.getElementById("logoutBtn").addEventListener("click", () => {
  clearCurrentUser();
  showToast("Logged out");
  showPage("home");
});

// login/register tab switch
document.getElementById("authTabs").addEventListener("click", (e) => {
  e.preventDefault();
  const tab = e.target.closest("a")?.dataset.tab;
  if (!tab) return;

  document.querySelectorAll("#authTabs .nav-link").forEach(l => l.classList.remove("active"));
  e.target.classList.add("active");

  document.getElementById("loginForm").classList.toggle("d-none", tab !== "login");
  document.getElementById("registerForm").classList.toggle("d-none", tab !== "register");
});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch(`${API_BASE}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    setCurrentUser(data);
    showToast(`Welcome back, ${data.name}!`);
    showPage("home");
    e.target.reset();
  } catch (err) {
    showToast(err.message, "error");
  }
});

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    name: document.getElementById("regName").value,
    email: document.getElementById("regEmail").value,
    department: document.getElementById("regDepartment").value,
    role: document.getElementById("regRole").value,
    password: document.getElementById("regPassword").value
  };

  try {
    const res = await fetch(`${API_BASE}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");

    setCurrentUser(data);
    showToast(`Account created. Welcome, ${data.name}!`);
    showPage("home");
    e.target.reset();
  } catch (err) {
    showToast(err.message, "error");
  }
});

/* ---------------------------------------------------------
   Home: category quick cards
--------------------------------------------------------- */
function renderHomeCategories() {
  const row = document.getElementById("homeCategoryRow");
  const categories = Object.keys(CATEGORY_ICONS);
  row.innerHTML = categories.slice(0, 4).map(cat => `
    <div class="col-6 col-md-3">
      <div class="eco-cat-card" data-category="${cat}">
        <div class="eco-cat-icon"><i class="bi ${CATEGORY_ICONS[cat]}"></i></div>
        <div class="eco-cat-name">${cat}</div>
      </div>
    </div>
  `).join("");

  row.querySelectorAll(".eco-cat-card").forEach(card => {
    card.addEventListener("click", () => {
      showPage("browse");
      document.getElementById("filterCategory").value = card.dataset.category;
      loadBrowseItems();
    });
  });
}

/* ---------------------------------------------------------
   Upload item
--------------------------------------------------------- */
document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = getCurrentUser();
  if (!user) { showToast("Please login first", "error"); showPage("auth"); return; }

  const formData = new FormData();
  formData.append("name", document.getElementById("itemName").value);
  formData.append("category", document.getElementById("itemCategory").value);
  formData.append("department", document.getElementById("itemDepartment").value);
  formData.append("condition", document.getElementById("itemCondition").value);
  formData.append("quantity", document.getElementById("itemQuantity").value);
  formData.append("expiry_date", document.getElementById("itemExpiry").value);
  formData.append("description", document.getElementById("itemDescription").value);
  formData.append("owner_id", user.id);

  const imageFile = document.getElementById("itemImage").files[0];
  if (imageFile) formData.append("image", imageFile);

  try {
    const res = await fetch(`${API_BASE}/items/`, { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not upload item");

    showToast("Item listed successfully!");
    e.target.reset();
    showPage("browse");
  } catch (err) {
    showToast(err.message, "error");
  }
});

/* ---------------------------------------------------------
   Browse + filter
--------------------------------------------------------- */
let allBrowseItems = [];

async function loadBrowseItems() {
  const category = document.getElementById("filterCategory").value;
  const params = new URLSearchParams({ status: "available" });
  if (category) params.append("category", category);

  try {
    const res = await fetch(`${API_BASE}/items/?${params.toString()}`);
    allBrowseItems = await res.json();
    renderBrowseGrid(allBrowseItems);
  } catch (err) {
    showToast("Could not load items — is the backend running?", "error");
  }
}

function renderBrowseGrid(items) {
  const grid = document.getElementById("browseGrid");
  const empty = document.getElementById("browseEmpty");

  const search = document.getElementById("filterSearch").value.trim().toLowerCase();
  const filtered = search
    ? items.filter(i => i.name.toLowerCase().includes(search))
    : items;

  if (filtered.length === 0) {
    grid.innerHTML = "";
    empty.classList.remove("d-none");
    return;
  }
  empty.classList.add("d-none");

  grid.innerHTML = filtered.map(item => `
    <div class="col-sm-6 col-md-4 col-lg-3">
      <div class="eco-item-card">
        <div class="eco-item-img">
          ${item.image_path
            ? `<img src="http://127.0.0.1:5000${item.image_path}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;">`
            : `<i class="bi ${CATEGORY_ICONS[item.category] || 'bi-box-seam'}"></i>`}
        </div>
        <div class="eco-item-body">
          <span class="eco-badge-category">${item.category}</span>
          <div class="eco-item-title">${item.name}</div>
          <div class="eco-item-meta">${item.department || "—"} &middot; ${item.condition || "—"}</div>
          <div class="eco-item-meta mb-2">Qty: ${item.quantity}${item.expiry_date ? " &middot; Expiry: " + item.expiry_date : ""}</div>
          <button class="btn btn-eco-green btn-sm mt-auto request-btn"
                  data-id="${item.id}" data-name="${item.name}">Request</button>
        </div>
      </div>
    </div>
  `).join("");

  grid.querySelectorAll(".request-btn").forEach(btn => {
    btn.addEventListener("click", () => openRequestModal(btn.dataset.id, btn.dataset.name));
  });
}

document.getElementById("filterCategory").addEventListener("change", loadBrowseItems);
document.getElementById("filterSearch").addEventListener("input", () => renderBrowseGrid(allBrowseItems));

/* ---------------------------------------------------------
   Request modal
--------------------------------------------------------- */
let requestModalInstance;

function openRequestModal(itemId, itemName) {
  const user = getCurrentUser();
  if (!user) { showToast("Please login first", "error"); showPage("auth"); return; }

  document.getElementById("reqItemId").value = itemId;
  document.getElementById("reqItemName").textContent = itemName;
  document.getElementById("reqPickupLocation").value = "";
  document.getElementById("reqPickupDate").value = "";

  requestModalInstance = new bootstrap.Modal(document.getElementById("requestModal"));
  requestModalInstance.show();
}

document.getElementById("confirmRequestBtn").addEventListener("click", async () => {
  const user = getCurrentUser();
  const itemId = document.getElementById("reqItemId").value;
  const pickupLocation = document.getElementById("reqPickupLocation").value;
  const pickupDate = document.getElementById("reqPickupDate").value;

  if (!pickupLocation || !pickupDate) {
    showToast("Please fill in pickup location and date", "error");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/requests/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item_id: Number(itemId),
        requester_id: user.id,
        pickup_location: pickupLocation,
        pickup_date: pickupDate
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not send request");

    requestModalInstance.hide();
    showToast("Request sent! Waiting for owner approval.");
    loadBrowseItems();
  } catch (err) {
    showToast(err.message, "error");
  }
});

/* ---------------------------------------------------------
   My Requests page (requester side + owner side)
--------------------------------------------------------- */
async function loadRequestsPage() {
  const user = getCurrentUser();
  if (!user) return;

  try {
    const [mineRes, ownerRes] = await Promise.all([
      fetch(`${API_BASE}/requests/?requester_id=${user.id}`),
      fetch(`${API_BASE}/requests/?owner_id=${user.id}`)
    ]);
    const mine = await mineRes.json();
    const onMine = await ownerRes.json();

    document.getElementById("myRequestsBody").innerHTML = mine.map(r => `
      <tr>
        <td>${r.item_name}</td>
        <td>${r.pickup_location || "—"}</td>
        <td>${r.pickup_date || "—"}</td>
        <td><span class="${pillClass(r.status)}">${r.status}</span></td>
      </tr>
    `).join("") || `<tr><td colspan="4" class="text-center text-muted py-3">No requests yet</td></tr>`;

    document.getElementById("ownerRequestsBody").innerHTML = onMine.map(r => `
      <tr>
        <td>${r.item_name}</td>
        <td>#${r.requester_id}</td>
        <td>${r.pickup_date || "—"}</td>
        <td><span class="${pillClass(r.status)}">${r.status}</span></td>
        <td>
          ${r.status === "pending" ? `
            <button class="btn btn-sm btn-outline-success approve-btn" data-id="${r.id}">Approve</button>
            <button class="btn btn-sm btn-outline-danger reject-btn" data-id="${r.id}">Reject</button>
          ` : r.status === "approved" ? `
            <button class="btn btn-sm btn-eco-green complete-btn" data-id="${r.id}">Mark handed over</button>
          ` : ""}
        </td>
      </tr>
    `).join("") || `<tr><td colspan="5" class="text-center text-muted py-3">No requests on your items</td></tr>`;

    document.querySelectorAll(".approve-btn").forEach(b => b.addEventListener("click", () => updateRequestStatus(b.dataset.id, "approved")));
    document.querySelectorAll(".reject-btn").forEach(b => b.addEventListener("click", () => updateRequestStatus(b.dataset.id, "rejected")));
    document.querySelectorAll(".complete-btn").forEach(b => b.addEventListener("click", () => updateRequestStatus(b.dataset.id, "completed")));
  } catch (err) {
    showToast("Could not load requests", "error");
  }
}

async function updateRequestStatus(requestId, status) {
  try {
    const res = await fetch(`${API_BASE}/requests/${requestId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error("Could not update request");
    showToast(`Request ${status}`);
    loadRequestsPage();
  } catch (err) {
    showToast(err.message, "error");
  }
}

/* ---------------------------------------------------------
   Dashboard
--------------------------------------------------------- */
let categoryChartInstance;

async function loadDashboard() {
  try {
    const [allItemsRes, requestsRes] = await Promise.all([
      fetch(`${API_BASE}/items/?status=`),
      fetch(`${API_BASE}/requests/`)
    ]);
    const items = await allItemsRes.json();
    const requests = await requestsRes.json();

    const total = items.length;
    const claimed = items.filter(i => i.status === "claimed").length;
    const pendingRequests = requests.filter(r => r.status === "pending").length;
    const categories = [...new Set(items.map(i => i.category))];

    document.getElementById("statTotal").textContent = total;
    document.getElementById("statClaimed").textContent = claimed;
    document.getElementById("statPending").textContent = pendingRequests;
    document.getElementById("statCategories").textContent = categories.length;

    // category breakdown chart
    const counts = categories.map(c => items.filter(i => i.category === c).length);
    const ctx = document.getElementById("categoryChart");
    if (categoryChartInstance) categoryChartInstance.destroy();
    categoryChartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: categories.length ? categories : ["No items yet"],
        datasets: [{
          data: categories.length ? counts : [1],
          backgroundColor: ["#2D6A4F", "#C9920A", "#40916C", "#95D5B2", "#74C69D", "#B7E4C7", "#D8F3DC"],
          borderWidth: 0
        }]
      },
      options: { plugins: { legend: { position: "bottom", labels: { boxWidth: 12 } } } }
    });

    // recent items
    const recent = [...items].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);
    document.getElementById("recentList").innerHTML = recent.map(i => `
      <li class="list-group-item d-flex justify-content-between align-items-center px-0">
        <span><i class="bi ${CATEGORY_ICONS[i.category] || 'bi-box-seam'} text-eco-green me-2"></i>${i.name}</span>
        <span class="${pillClass(i.status)}">${i.status}</span>
      </li>
    `).join("") || `<li class="list-group-item px-0 text-muted">No items listed yet</li>`;
  } catch (err) {
    showToast("Could not load dashboard — is the backend running?", "error");
  }
}

/* ---------------------------------------------------------
   Init
--------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  updateAuthUI();
  renderHomeCategories();
  showPage("home");
});