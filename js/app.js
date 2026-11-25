/* ==========================================================================
   THE ELITE STAY – MANAGEMENT REPORT
   Main Application Logic (Frontend-Only: HTML, CSS, JS, Bootstrap)
   ========================================================================== */

const ADMIN_PASSWORD = "admin123";
const SESSION_DURATION = 2 * 60 * 1000; // Preserved 30-second session
const LOGIN_STATUS_KEY = "eliteStayAdminLoggedIn";
const LOGIN_TIME_KEY = "eliteStayAdminLoginTime";
const SELECTED_MONTH_KEY = "eliteStaySelectedMonth";

/* ================= GLOBAL APP STATE ================= */
const state = {
    selectedMonth: localStorage.getItem(SELECTED_MONTH_KEY) || AVAILABLE_MONTHS[0],
    activeModule: "profile", // 'profile' | 'payment' | 'expense' | 'more'
    activeSubView: "all",    // sub-view key per module
    // Profile state
    profileSearch: "",
    profileTypeFilter: "",
    profileRoomFilter: "",
    profileModeFilter: "",
    profilePage: 1,
    selectedProfileId: null,
    profileDetailTab: "personal",
    profileMobileDetailOpen: false,
    editProfileId: null,
    // Payment state
    paymentSearch: "",
    paymentTypeFilter: "",
    paymentModeFilter: "",
    paymentStatusFilter: "",
    paymentPage: 1,
    // Expense state
    expenseSearch: "",
    expenseFreqFilter: "",
    expenseCatFilter: "",
    addExpenseFreq: "monthly",
    // Beds state
    bedsSearch: "",
    bedsFloorFilter: "",
    bedsSeaterFilter: "",
    bedsStatusFilter: "",
    // Visitors state
    visitorSearch: "",
    visitorRoomFilter: "",
    visitorSourceFilter: "",
    visitorPage: 1
};

if (!AVAILABLE_MONTHS.includes(state.selectedMonth)) {
    state.selectedMonth = AVAILABLE_MONTHS[0];
}

const SIDEBAR_CONFIG = [
    {
        key: "profile",
        label: "Profile",
        icon: "bi-person-fill",
        defaultSub: "all",
        subs: [
            { key: "all", label: "All Profiles" },
            { key: "add", label: "Add Profile" },
            { key: "update", label: "Update Profile" }
        ]
    },
    {
        key: "payment",
        label: "Payment",
        icon: "bi-credit-card-2-front",
        defaultSub: "all",
        subs: [
            { key: "all", label: "All Payments" },
            { key: "add", label: "Add Payment" },
            { key: "history", label: "Payment History" },
            { key: "pending", label: "Pending Payments" }
        ]
    },
    {
        key: "expense",
        label: "Expense",
        icon: "bi-cash-coin",
        defaultSub: "overview",
        subs: [
            { key: "overview", label: "Expense Overview" },
            { key: "monthly", label: "Monthly Expense" },
            { key: "weekly", label: "Weekly Expense" },
            { key: "daily", label: "Daily Expense (Avg)" },
            { key: "add", label: "Add Expense" },
            { key: "history", label: "Expense History" }
        ]
    },
    {
        key: "more",
        label: "More",
        icon: "bi-grid-fill",
        defaultSub: "hub",
        subs: [
            { key: "hub", label: "More Overview" },
            { key: "beds", label: "Beds Details" },
            { key: "visitors", label: "Visitor Enquiries" }
        ]
    }
];

/* ================= DOM ELEMENTS ================= */
const loginPage = document.getElementById("loginPage");
const mainArea = document.getElementById("mainArea");
const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");
const sidebar = document.getElementById("sidebar");
const sidebarBackdrop = document.getElementById("sidebarBackdrop");
const sidebarNav = document.getElementById("sidebarNav");
const menuButton = document.getElementById("menuButton");
const monthSelectDesktop = document.getElementById("monthSelectDesktop");
const monthSelectMobile = document.getElementById("monthSelectMobile");
const moduleContainer = document.getElementById("moduleContainer");
const mobileBottomNav = document.getElementById("mobileBottomNav");
const logoutButton = document.getElementById("logoutButton");
const sessionTimerLabel = document.getElementById("sessionTimerLabel");
const notifMonthBadge = document.getElementById("notifMonthBadge");
const notifBody = document.getElementById("notifBody");
const appModalEl = document.getElementById("appModal");
const appModalTitle = document.getElementById("appModalTitle");
const appModalBody = document.getElementById("appModalBody");

let appModalInstance = null;
let logoutTimer = null;
let sessionInterval = null;

/* ================= HELPERS ================= */
function escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value).replace(/[&<>'"]/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
    }[char]));
}

function formatINR(num) {
    const val = Number(num) || 0;
    return "₹" + val.toLocaleString("en-IN");
}

function getInitials(name) {
    return (name || "U")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(part => part[0].toUpperCase())
        .join("");
}

function getMonthData(month = state.selectedMonth) {
    if (!monthlyData[month]) {
        monthlyData[month] = createEmptyMonthData();
    }
    return monthlyData[month];
}

function sumObjectValues(obj) {
    if (!obj) return 0;
    return Object.values(obj).reduce((sum, val) => sum + (Number(val) || 0), 0);
}

function getMonthExpenseTotals(month) {
    const exp = getMonthData(month).expenses;
    const monthlyTotal = (exp.monthly || []).reduce((s, r) => s + sumObjectValues(r.items), 0);
    const weeklyTotal = (exp.weekly || []).reduce((s, r) => s + sumObjectValues(r.items), 0);
    const dailyAvgTotal = (exp.dailyAverage || []).reduce((s, r) => s + sumObjectValues(r.items), 0);
    return {
        monthlyTotal,
        weeklyTotal,
        dailyAvgTotal,
        grandTotal: monthlyTotal + weeklyTotal + dailyAvgTotal
    };
}

function formatNowTimestamp() {
    const d = new Date();
    const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = String(d.getDate()).padStart(2, "0");
    const mon = monthsShort[d.getMonth()];
    const yr = d.getFullYear();
    let hr = d.getHours();
    const min = String(d.getMinutes()).padStart(2, "0");
    const ampm = hr >= 12 ? "PM" : "AM";
    hr = hr % 12 || 12;
    return `${day} ${mon} ${yr}, ${String(hr).padStart(2, "0")}:${min} ${ampm}`;
}

function openModal(title, htmlContent) {
    appModalTitle.textContent = title;
    appModalBody.innerHTML = htmlContent;
    if (!appModalInstance && window.bootstrap) {
        appModalInstance = new bootstrap.Modal(appModalEl);
    }
    if (appModalInstance) appModalInstance.show();
}

function closeSidebarDrawer() {
    sidebar.classList.remove("open");
    sidebarBackdrop.classList.remove("show");
}

/* ================= AUTH & 30-SECOND SESSION ================= */
function checkExistingSession() {
    const isLoggedIn = localStorage.getItem(LOGIN_STATUS_KEY);
    const loginTime = Number(localStorage.getItem(LOGIN_TIME_KEY));
    if (isLoggedIn !== "true" || !loginTime) return showLoginPage();
    const elapsedTime = Date.now() - loginTime;
    if (elapsedTime >= SESSION_DURATION) return logoutAdmin();
    showMainArea();
    startSessionTimer(loginTime);
}

function startSessionTimer(loginTime) {
    if (logoutTimer) clearTimeout(logoutTimer);
    if (sessionInterval) clearInterval(sessionInterval);
    const remainingTime = SESSION_DURATION - (Date.now() - loginTime);
    if (remainingTime <= 0) return logoutAdmin();

    updateSessionCountdown(loginTime);
    sessionInterval = setInterval(() => updateSessionCountdown(loginTime), 1000);
    logoutTimer = setTimeout(logoutAdmin, remainingTime);
}

function updateSessionCountdown(loginTime) {
    const remSec = Math.max(0, Math.ceil((SESSION_DURATION - (Date.now() - loginTime)) / 1000));
    if (sessionTimerLabel) sessionTimerLabel.textContent = `${remSec}s`;
}

function showMainArea() {
    loginPage.classList.add("d-none");
    mainArea.classList.remove("d-none");
    mainArea.setAttribute("aria-hidden", "false");
    renderApp();
}

function showLoginPage() {
    mainArea.classList.add("d-none");
    mainArea.setAttribute("aria-hidden", "true");
    loginPage.classList.remove("d-none");
}

function logoutAdmin() {
    if (logoutTimer) clearTimeout(logoutTimer);
    if (sessionInterval) clearInterval(sessionInterval);
    logoutTimer = null;
    sessionInterval = null;
    localStorage.removeItem(LOGIN_STATUS_KEY);
    localStorage.removeItem(LOGIN_TIME_KEY);
    closeSidebarDrawer();
    showLoginPage();
    loginForm.reset();
    loginError.textContent = "";
}

/* ================= MONTH SELECTOR & NAVIGATION ================= */
function initMonthSelectors() {
    const optionsHtml = AVAILABLE_MONTHS.map(m => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join("");
    monthSelectDesktop.innerHTML = optionsHtml;
    monthSelectMobile.innerHTML = optionsHtml;
    monthSelectDesktop.value = state.selectedMonth;
    monthSelectMobile.value = state.selectedMonth;

    function handleMonthChange(newMonth) {
        state.selectedMonth = newMonth;
        localStorage.setItem(SELECTED_MONTH_KEY, newMonth);
        monthSelectDesktop.value = newMonth;
        monthSelectMobile.value = newMonth;
        state.profilePage = 1;
        state.paymentPage = 1;
        state.visitorPage = 1;
        state.selectedProfileId = null;
        state.profileMobileDetailOpen = false;
        renderApp();
    }

    monthSelectDesktop.addEventListener("change", () => handleMonthChange(monthSelectDesktop.value));
    monthSelectMobile.addEventListener("change", () => handleMonthChange(monthSelectMobile.value));
}

function switchModule(moduleKey, subViewKey = null) {
    const mod = SIDEBAR_CONFIG.find(m => m.key === moduleKey) || SIDEBAR_CONFIG[0];
    state.activeModule = mod.key;
    state.activeSubView = subViewKey || mod.defaultSub;
    state.profileMobileDetailOpen = false;
    closeSidebarDrawer();
    renderApp();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderNavigation() {
    // 1. Desktop / Drawer Sidebar: shows main modules and expands ONLY the active module's sub-options
    sidebarNav.innerHTML = SIDEBAR_CONFIG.map(mod => {
        const isActive = state.activeModule === mod.key;
        const subHtml = isActive ? `
            <div class="side-submenu">
                ${mod.subs.map(sub => `
                    <button type="button"
                        class="side-sub-btn ${state.activeSubView === sub.key ? "active" : ""}"
                        data-module="${mod.key}"
                        data-sub="${sub.key}">
                        ${escapeHtml(sub.label)}
                    </button>
                `).join("")}
            </div>
        ` : "";

        return `
            <div class="side-module-group">
                <button type="button"
                    class="side-module-btn ${isActive ? "active" : ""}"
                    data-module="${mod.key}">
                    <i class="bi ${mod.icon}"></i>
                    <span>${escapeHtml(mod.label)}</span>
                    <i class="bi ${isActive ? "bi-chevron-down" : "bi-chevron-right"} chevron"></i>
                </button>
                ${subHtml}
            </div>
        `;
    }).join("");

    sidebarNav.querySelectorAll(".side-module-btn").forEach(btn => {
        btn.addEventListener("click", () => switchModule(btn.dataset.module));
    });

    sidebarNav.querySelectorAll(".side-sub-btn").forEach(btn => {
        btn.addEventListener("click", () => switchModule(btn.dataset.module, btn.dataset.sub));
    });

    // 2. Mobile Fixed Bottom Navigation (Always 4 buttons)
    mobileBottomNav.querySelectorAll(".bottom-nav-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.module === state.activeModule);
    });
}

function renderNotifications() {
    const data = getMonthData();
    const pendingPayments = data.payments.filter(p => p.status === "Pending").length;
    const rooms = (data.beds && data.beds.rooms) || [];
    const totalBeds = rooms.reduce((s, r) => s + r.totalBeds, 0);
    const occBeds = rooms.reduce((s, r) => s + r.occupiedBeds, 0);
    const emptyBeds = Math.max(0, totalBeds - occBeds);
    const expTotals = getMonthExpenseTotals(state.selectedMonth);

    notifMonthBadge.textContent = state.selectedMonth;
    notifBody.innerHTML = `
        <div class="notif-item"><span>Profiles Recorded</span><strong>${data.profiles.length}</strong></div>
        <div class="notif-item"><span>Pending Payments</span><strong class="${pendingPayments ? "text-danger" : "text-success"}">${pendingPayments}</strong></div>
        <div class="notif-item"><span>Total Expenses</span><strong>${formatINR(expTotals.grandTotal)}</strong></div>
        <div class="notif-item"><span>Empty Beds Available</span><strong class="text-primary">${emptyBeds}</strong></div>
        <div class="notif-item"><span>Visitor Enquiries</span><strong>${data.visitors.length}</strong></div>
    `;
}

function renderApp() {
    renderNavigation();
    renderNotifications();

    if (state.activeModule === "profile") {
        renderProfileModule();
    } else if (state.activeModule === "payment") {
        renderPaymentModule();
    } else if (state.activeModule === "expense") {
        renderExpenseModule();
    } else if (state.activeModule === "more") {
        if (state.activeSubView === "beds") {
            renderBedsModule();
        } else if (state.activeSubView === "visitors") {
            renderVisitorsModule();
        } else {
            renderMoreHub();
        }
    }
}

/* ==========================================================================
   MODULE 1: PROFILE MANAGEMENT
   ========================================================================== */
function renderProfileModule() {
    if (state.activeSubView === "add") return renderProfileForm(null);
    if (state.activeSubView === "update") return renderUpdateProfileView();

    const data = getMonthData();
    const profiles = data.profiles || [];
    const studentCount = profiles.filter(p => p.userType === "Student").length;
    const empCount = profiles.filter(p => p.userType === "Employee").length;
    const occupiedRooms = new Set(profiles.map(p => p.roomNumber).filter(Boolean)).size;

    // Filter records
    const q = state.profileSearch.trim().toLowerCase();
    const filtered = profiles.filter(p => {
        const matchQ = !q || [p.fullName, p.mobileNumber, p.email, p.collegeName, p.companyName, p.roomNumber]
            .some(v => (v || "").toLowerCase().includes(q));
        const matchType = !state.profileTypeFilter || p.userType === state.profileTypeFilter;
        const matchRoom = !state.profileRoomFilter || p.roomType === state.profileRoomFilter;
        const matchMode = !state.profileModeFilter || p.paymentMode === state.profileModeFilter;
        return matchQ && matchType && matchRoom && matchMode;
    });

    const PAGE_SIZE = 5;
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (state.profilePage > totalPages) state.profilePage = totalPages;
    const start = (state.profilePage - 1) * PAGE_SIZE;
    const pageRecords = filtered.slice(start, start + PAGE_SIZE);

    // Ensure selected profile for desktop right panel
    let selectedProfile = profiles.find(p => p.id === state.selectedProfileId) || filtered[0] || null;
    if (selectedProfile) state.selectedProfileId = selectedProfile.id;

    // Mobile Full-Screen Profile Detail Mode
    if (state.profileMobileDetailOpen && selectedProfile && window.innerWidth < 992) {
        renderMobileProfileDetail(selectedProfile);
        return;
    }

    moduleContainer.innerHTML = `
        <div class="page-header">
            <div class="page-title-wrap">
                <div class="page-icon"><i class="bi bi-person-fill"></i></div>
                <div>
                    <h1>Profile Management</h1>
                    <p>Manage all students &amp; employees profiles, booking and payment details.</p>
                </div>
            </div>
            <button type="button" class="btn btn-primary rounded-3 fw-semibold" id="quickAddProfileBtn">
                <i class="bi bi-person-plus me-1"></i>Add Profile
            </button>
        </div>

        <section class="kpi-grid">
            <article class="kpi-card highlight">
                <div class="kpi-icon"><i class="bi bi-people-fill"></i></div>
                <div class="kpi-meta"><div class="kpi-label">Total Profiles</div><div class="kpi-value">${profiles.length}</div></div>
            </article>
            <article class="kpi-card">
                <div class="kpi-icon"><i class="bi bi-mortarboard-fill"></i></div>
                <div class="kpi-meta"><div class="kpi-label">Students</div><div class="kpi-value">${studentCount}</div></div>
            </article>
            <article class="kpi-card">
                <div class="kpi-icon purple"><i class="bi bi-briefcase-fill"></i></div>
                <div class="kpi-meta"><div class="kpi-label">Employees</div><div class="kpi-value">${empCount}</div></div>
            </article>
            <article class="kpi-card">
                <div class="kpi-icon green"><i class="bi bi-door-closed-fill"></i></div>
                <div class="kpi-meta"><div class="kpi-label">Occupied Rooms</div><div class="kpi-value">${occupiedRooms}</div></div>
            </article>
            <article class="kpi-card">
                <div class="kpi-icon"><i class="bi bi-calendar3"></i></div>
                <div class="kpi-meta"><div class="kpi-label">Selected Month</div><div class="kpi-value month-val">${escapeHtml(state.selectedMonth)}</div></div>
            </article>
        </section>

        <section class="filter-card">
            <div class="search-box">
                <i class="bi bi-search"></i>
                <input type="search" id="profileSearchInput" value="${escapeHtml(state.profileSearch)}" placeholder="Search by name, mobile, email, college or company...">
            </div>
            <select id="profileTypeFilter" class="filter-select">
                <option value="">All (Student/Employee)</option>
                <option value="Student" ${state.profileTypeFilter === "Student" ? "selected" : ""}>Student</option>
                <option value="Employee" ${state.profileTypeFilter === "Employee" ? "selected" : ""}>Employee</option>
            </select>
            <select id="profileRoomFilter" class="filter-select">
                <option value="">All Room Type</option>
                <option value="1 Seater" ${state.profileRoomFilter === "1 Seater" ? "selected" : ""}>1 Seater</option>
                <option value="2 Seater" ${state.profileRoomFilter === "2 Seater" ? "selected" : ""}>2 Seater</option>
                <option value="3 Seater" ${state.profileRoomFilter === "3 Seater" ? "selected" : ""}>3 Seater</option>
                <option value="4 Seater" ${state.profileRoomFilter === "4 Seater" ? "selected" : ""}>4 Seater</option>
            </select>
            <select id="profileModeFilter" class="filter-select">
                <option value="">All Payment Mode</option>
                <option value="UPI" ${state.profileModeFilter === "UPI" ? "selected" : ""}>UPI</option>
                <option value="Online" ${state.profileModeFilter === "Online" ? "selected" : ""}>Online</option>
                <option value="Cash" ${state.profileModeFilter === "Cash" ? "selected" : ""}>Cash</option>
                <option value="Bank Transfer" ${state.profileModeFilter === "Bank Transfer" ? "selected" : ""}>Bank Transfer</option>
            </select>
            <button type="button" class="btn-reset" id="profileResetBtn"><i class="bi bi-arrow-clockwise"></i> Reset</button>
        </section>

        <div class="profile-split">
            <div>
                <div class="panel-card">
                    <!-- Desktop Table -->
                    <div class="table-wrap desktop-only-table">
                        <div class="table-responsive-custom">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Timestamp</th>
                                        <th>Full Name</th>
                                        <th>Type</th>
                                        <th>Mobile Number</th>
                                        <th>Room No.</th>
                                        <th>Room Type</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${pageRecords.length ? pageRecords.map((p, idx) => `
                                        <tr class="${selectedProfile && selectedProfile.id === p.id ? "selected-row" : ""}" data-select-profile="${escapeHtml(p.id)}" style="cursor:pointer;">
                                            <td>${start + idx + 1}</td>
                                            <td class="text-nowrap small">${escapeHtml(p.timestamp)}</td>
                                            <td class="fw-semibold">${escapeHtml(p.fullName)}</td>
                                            <td><span class="badge-soft ${p.userType === "Student" ? "badge-student" : "badge-employee"}">${escapeHtml(p.userType)}</span></td>
                                            <td>${escapeHtml(p.mobileNumber)}</td>
                                            <td><span class="badge-soft badge-room">${escapeHtml(p.roomNumber)}</span></td>
                                            <td>${escapeHtml(p.roomType)}</td>
                                            <td class="text-nowrap">
                                                <button type="button" class="action-icon-btn me-1" data-view-profile="${escapeHtml(p.id)}" title="View Profile"><i class="bi bi-eye"></i></button>
                                                <button type="button" class="action-icon-btn" data-edit-profile="${escapeHtml(p.id)}" title="Edit Profile"><i class="bi bi-pencil"></i></button>
                                            </td>
                                        </tr>
                                    `).join("") : `<tr><td colspan="8" class="empty-cell">No profiles found for ${escapeHtml(state.selectedMonth)}.</td></tr>`}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Mobile Profile Cards -->
                    <div class="mobile-cards-list">
                        ${pageRecords.length ? pageRecords.map(p => `
                            <div class="mobile-record-card" data-mobile-profile="${escapeHtml(p.id)}">
                                <div class="d-flex align-items-center gap-3">
                                    <div class="profile-avatar">${escapeHtml(getInitials(p.fullName))}</div>
                                    <div class="flex-grow-1 min-w-0">
                                        <div class="fw-bold text-dark text-truncate">${escapeHtml(p.fullName)}</div>
                                        <div class="small text-muted text-truncate"><i class="bi bi-envelope me-1"></i>${escapeHtml(p.email)}</div>
                                        <div class="small text-muted"><i class="bi bi-telephone me-1"></i>${escapeHtml(p.mobileNumber)}</div>
                                    </div>
                                    <div class="text-end d-flex flex-column align-items-end gap-1">
                                        <span class="badge-soft ${p.userType === "Student" ? "badge-student" : "badge-employee"}">${escapeHtml(p.userType)}</span>
                                        <span class="badge-soft badge-room"><i class="bi bi-door-open me-1"></i>${escapeHtml(p.roomNumber)}</span>
                                    </div>
                                </div>
                            </div>
                        `).join("") : `<div class="text-center text-muted py-4">No profiles found for ${escapeHtml(state.selectedMonth)}.</div>`}
                    </div>

                    <!-- Pagination -->
                    <div class="pagination-bar">
                        <div>Showing ${filtered.length ? start + 1 : 0} – ${Math.min(start + PAGE_SIZE, filtered.length)} of ${filtered.length} profiles</div>
                        <div class="pagination-controls" id="profilePagination"></div>
                    </div>
                </div>

                <!-- This Month Summary Card -->
                <div class="panel-card mt-3">
                    <div class="panel-title mb-3"><i class="bi bi-calendar-check"></i> This Month Summary (${escapeHtml(state.selectedMonth)})</div>
                    <div class="row g-3 text-center text-sm-start">
                        <div class="col-6 col-sm-3"><div class="small text-muted">Total Profiles</div><div class="fs-5 fw-bold text-primary">${profiles.length}</div></div>
                        <div class="col-6 col-sm-3"><div class="small text-muted">Students</div><div class="fs-5 fw-bold text-success">${studentCount}</div></div>
                        <div class="col-6 col-sm-3"><div class="small text-muted">Employees</div><div class="fs-5 fw-bold" style="color:var(--purple-600);">${empCount}</div></div>
                        <div class="col-6 col-sm-3"><div class="small text-muted">Rooms Occupied</div><div class="fs-5 fw-bold text-dark">${occupiedRooms}</div></div>
                    </div>
                </div>
            </div>

            <!-- Desktop Right-Side Profile Details Panel -->
            <div class="panel-card d-none d-lg-block" id="desktopProfileDetails">
                ${selectedProfile ? buildProfileDetailPanelHtml(selectedProfile) : `
                    <div class="text-center py-5 text-muted">
                        <i class="bi bi-person-badge fs-1 d-block mb-2 text-primary opacity-50"></i>
                        Select a profile from the list to view full details.
                    </div>
                `}
            </div>
        </div>
    `;

    // Bind events
    document.getElementById("quickAddProfileBtn").addEventListener("click", () => switchModule("profile", "add"));
    document.getElementById("profileSearchInput").addEventListener("input", e => {
        state.profileSearch = e.target.value;
        state.profilePage = 1;
        renderProfileModule();
    });
    document.getElementById("profileTypeFilter").addEventListener("change", e => {
        state.profileTypeFilter = e.target.value;
        state.profilePage = 1;
        renderProfileModule();
    });
    document.getElementById("profileRoomFilter").addEventListener("change", e => {
        state.profileRoomFilter = e.target.value;
        state.profilePage = 1;
        renderProfileModule();
    });
    document.getElementById("profileModeFilter").addEventListener("change", e => {
        state.profileModeFilter = e.target.value;
        state.profilePage = 1;
        renderProfileModule();
    });
    document.getElementById("profileResetBtn").addEventListener("click", () => {
        state.profileSearch = "";
        state.profileTypeFilter = "";
        state.profileRoomFilter = "";
        state.profileModeFilter = "";
        state.profilePage = 1;
        renderProfileModule();
    });

    // Row click / view / edit
    moduleContainer.querySelectorAll("[data-select-profile]").forEach(row => {
        row.addEventListener("click", e => {
            if (e.target.closest("button")) return;
            state.selectedProfileId = row.dataset.selectProfile;
            renderProfileModule();
        });
    });
    moduleContainer.querySelectorAll("[data-view-profile]").forEach(btn => {
        btn.addEventListener("click", () => {
            state.selectedProfileId = btn.dataset.viewProfile;
            renderProfileModule();
        });
    });
    moduleContainer.querySelectorAll("[data-edit-profile]").forEach(btn => {
        btn.addEventListener("click", () => {
            state.editProfileId = btn.dataset.editProfile;
            switchModule("profile", "update");
        });
    });
    moduleContainer.querySelectorAll("[data-mobile-profile]").forEach(card => {
        card.addEventListener("click", () => {
            state.selectedProfileId = card.dataset.mobileProfile;
            state.profileMobileDetailOpen = true;
            renderProfileModule();
        });
    });

    // Profile detail tabs & document preview buttons
    bindProfileDetailInteractions(selectedProfile);

    // Pagination
    buildPaginationButtons(
        document.getElementById("profilePagination"),
        state.profilePage,
        totalPages,
        page => { state.profilePage = page; renderProfileModule(); }
    );
}

function buildProfileDetailPanelHtml(p) {
    const tab = state.profileDetailTab;
    let tabBody = "";

    if (tab === "personal") {
        tabBody = `
            <div class="detail-list">
                <div class="detail-row"><span class="detail-label"><i class="bi bi-clock"></i> Timestamp</span><span class="detail-val">${escapeHtml(p.timestamp)}</span></div>
                <div class="detail-row"><span class="detail-label"><i class="bi bi-envelope"></i> Email Address</span><span class="detail-val">${escapeHtml(p.email)}</span></div>
                <div class="detail-row"><span class="detail-label"><i class="bi bi-person-badge"></i> Type</span><span class="detail-val">${escapeHtml(p.userType)}</span></div>
                <div class="detail-row"><span class="detail-label"><i class="bi bi-person"></i> Full Name</span><span class="detail-val">${escapeHtml(p.fullName)}</span></div>
                <div class="detail-row"><span class="detail-label"><i class="bi bi-phone"></i> Mobile Number</span><span class="detail-val">${escapeHtml(p.mobileNumber)}</span></div>
                <div class="detail-row"><span class="detail-label"><i class="bi bi-mortarboard"></i> College / University</span><span class="detail-val">${escapeHtml(p.collegeName || "—")}</span></div>
                <div class="detail-row"><span class="detail-label"><i class="bi bi-book"></i> Course / Program</span><span class="detail-val">${escapeHtml(p.courseProgram || "—")}</span></div>
                <div class="detail-row"><span class="detail-label"><i class="bi bi-calendar"></i> Which Year</span><span class="detail-val">${escapeHtml(p.whichYear || "—")}</span></div>
                <div class="detail-row"><span class="detail-label"><i class="bi bi-people"></i> Father / Guardian</span><span class="detail-val">${escapeHtml(p.guardianName || "—")}</span></div>
                <div class="detail-row"><span class="detail-label"><i class="bi bi-telephone"></i> Guardian Mobile</span><span class="detail-val">${escapeHtml(p.guardianMobile || "—")}</span></div>
                <div class="detail-row"><span class="detail-label"><i class="bi bi-geo-alt"></i> Home Address</span><span class="detail-val">${escapeHtml(p.homeAddress || "—")}</span></div>
            </div>
        `;
    } else if (tab === "booking") {
        tabBody = `
            <div class="detail-list">
                <div class="detail-row"><span class="detail-label"><i class="bi bi-calendar-event"></i> Booking Date</span><span class="detail-val">${escapeHtml(p.bookingDate || "—")}</span></div>
                <div class="detail-row"><span class="detail-label"><i class="bi bi-calendar-check"></i> Shifting Date</span><span class="detail-val">${escapeHtml(p.shiftingDate || "—")}</span></div>
                <div class="detail-row"><span class="detail-label"><i class="bi bi-door-open"></i> Room Number</span><span class="detail-val">${escapeHtml(p.roomNumber || "—")}</span></div>
                <div class="detail-row"><span class="detail-label"><i class="bi bi-house"></i> Room Type</span><span class="detail-val">${escapeHtml(p.roomType || "—")}</span></div>
                <div class="detail-row"><span class="detail-label"><i class="bi bi-cash"></i> Booking Amount</span><span class="detail-val">${formatINR(p.bookingAmount)}</span></div>
                <div class="detail-row"><span class="detail-label"><i class="bi bi-receipt"></i> Registration Fee</span><span class="detail-val">${formatINR(p.registrationFee)}</span></div>
                <div class="detail-row"><span class="detail-label"><i class="bi bi-currency-rupee"></i> Monthly Rent</span><span class="detail-val">${formatINR(p.monthlyRent)}</span></div>
                <div class="detail-row"><span class="detail-label"><i class="bi bi-shield-check"></i> Security Deposit</span><span class="detail-val">${formatINR(p.securityDeposit)}</span></div>
                <div class="detail-row"><span class="detail-label"><i class="bi bi-credit-card"></i> Payment Mode</span><span class="detail-val">${escapeHtml(p.paymentMode || "—")}</span></div>
                <div class="detail-row">
                    <span class="detail-label"><i class="bi bi-file-earmark-text"></i> Payment Receipt</span>
                    <span class="detail-val">
                        <button type="button" class="btn btn-sm btn-outline-primary py-0 px-2" data-preview-doc="Payment Receipt" data-doc-file="${escapeHtml(p.paymentReceipt || "receipt.pdf")}">
                            <i class="bi bi-eye me-1"></i>${escapeHtml(p.paymentReceipt || "View")}
                        </button>
                    </span>
                </div>
            </div>
        `;
    } else if (tab === "documents") {
        tabBody = `
            <div class="doc-grid">
                <div class="doc-card" data-preview-doc="Aadhaar Card – Front" data-doc-file="${escapeHtml(p.aadhaarFront || "aadhaar_front.jpg")}">
                    <div class="doc-thumb"><i class="bi bi-card-heading"></i></div>
                    <div class="doc-name">Aadhaar (Front)</div>
                    <div class="small text-primary mt-1"><i class="bi bi-eye"></i> Preview</div>
                </div>
                <div class="doc-card" data-preview-doc="Aadhaar Card – Back" data-doc-file="${escapeHtml(p.aadhaarBack || "aadhaar_back.jpg")}">
                    <div class="doc-thumb"><i class="bi bi-card-text"></i></div>
                    <div class="doc-name">Aadhaar (Back)</div>
                    <div class="small text-primary mt-1"><i class="bi bi-eye"></i> Preview</div>
                </div>
                <div class="doc-card" data-preview-doc="Your ID" data-doc-file="${escapeHtml(p.yourId || "id_card.jpg")}">
                    <div class="doc-thumb"><i class="bi bi-person-vcard"></i></div>
                    <div class="doc-name">Your ID</div>
                    <div class="small text-primary mt-1"><i class="bi bi-eye"></i> Preview</div>
                </div>
            </div>
        `;
    } else {
        tabBody = `
            <div class="detail-list">
                <div class="detail-row"><span class="detail-label"><i class="bi bi-person"></i> Full Name</span><span class="detail-val">${escapeHtml(p.employeeFullName || (p.userType === "Employee" ? p.fullName : "—"))}</span></div>
                <div class="detail-row"><span class="detail-label"><i class="bi bi-phone"></i> Mobile Number</span><span class="detail-val">${escapeHtml(p.employeeMobile || (p.userType === "Employee" ? p.mobileNumber : "—"))}</span></div>
                <div class="detail-row"><span class="detail-label"><i class="bi bi-building"></i> Company Name</span><span class="detail-val">${escapeHtml(p.companyName || "—")}</span></div>
                <div class="detail-row"><span class="detail-label"><i class="bi bi-geo-alt"></i> Company Address</span><span class="detail-val">${escapeHtml(p.companyAddress || "—")}</span></div>
            </div>
        `;
    }

    return `
        <div class="panel-header">
            <h3 class="panel-title"><i class="bi bi-person-lines-fill"></i> Profile Details</h3>
            <button type="button" class="btn btn-sm btn-outline-primary rounded-3" data-edit-profile-detail="${escapeHtml(p.id)}">
                <i class="bi bi-pencil me-1"></i>Edit
            </button>
        </div>
        <div class="d-flex align-items-center gap-3 mb-2">
            <div class="profile-avatar">${escapeHtml(getInitials(p.fullName))}</div>
            <div class="min-w-0">
                <div class="d-flex align-items-center gap-2 flex-wrap">
                    <strong class="fs-6 text-dark">${escapeHtml(p.fullName)}</strong>
                    <span class="badge-soft ${p.userType === "Student" ? "badge-student" : "badge-employee"}">${escapeHtml(p.userType)}</span>
                </div>
                <div class="small text-muted text-truncate"><i class="bi bi-envelope me-1"></i>${escapeHtml(p.email)}</div>
                <div class="small text-muted"><i class="bi bi-telephone me-1"></i>${escapeHtml(p.mobileNumber)}</div>
            </div>
        </div>
        <div class="profile-tabs">
            <button type="button" class="profile-tab-btn ${tab === "personal" ? "active" : ""}" data-ptab="personal"><i class="bi bi-person"></i> Personal Info</button>
            <button type="button" class="profile-tab-btn ${tab === "booking" ? "active" : ""}" data-ptab="booking"><i class="bi bi-house-check"></i> Booking &amp; Payment</button>
            <button type="button" class="profile-tab-btn ${tab === "documents" ? "active" : ""}" data-ptab="documents"><i class="bi bi-file-earmark-check"></i> Documents</button>
            <button type="button" class="profile-tab-btn ${tab === "work" ? "active" : ""}" data-ptab="work"><i class="bi bi-briefcase"></i> Work Info</button>
        </div>
        ${tabBody}
    `;
}

function renderMobileProfileDetail(p) {
    moduleContainer.innerHTML = `
        <div class="d-flex align-items-center justify-content-between mb-3">
            <button type="button" class="btn btn-light border rounded-3 fw-semibold" id="mobileProfileBackBtn">
                <i class="bi bi-arrow-left me-1"></i>Profile Details
            </button>
            <button type="button" class="btn btn-primary btn-sm rounded-3" data-edit-profile-detail="${escapeHtml(p.id)}">
                <i class="bi bi-pencil me-1"></i>Edit
            </button>
        </div>

        <div class="panel-card mb-3">
            <div class="d-flex align-items-center gap-3">
                <div class="profile-avatar">${escapeHtml(getInitials(p.fullName))}</div>
                <div class="flex-grow-1 min-w-0">
                    <div class="fw-bold fs-6">${escapeHtml(p.fullName)}</div>
                    <div class="small text-muted text-truncate"><i class="bi bi-envelope me-1"></i>${escapeHtml(p.email)}</div>
                    <div class="small text-muted"><i class="bi bi-telephone me-1"></i>${escapeHtml(p.mobileNumber)}</div>
                </div>
                <div class="d-flex flex-column align-items-end gap-1">
                    <span class="badge-soft ${p.userType === "Student" ? "badge-student" : "badge-employee"}">${escapeHtml(p.userType)}</span>
                    <span class="badge-soft badge-room">${escapeHtml(p.roomNumber)}</span>
                </div>
            </div>
        </div>

        <div class="accordion" id="mobileProfileAcc">
            <div class="accordion-item rounded-4 overflow-hidden mb-2 border">
                <h2 class="accordion-header">
                    <button class="accordion-button fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#mpPersonal">
                        <i class="bi bi-person-fill text-primary me-2"></i>Personal Information
                    </button>
                </h2>
                <div id="mpPersonal" class="accordion-collapse collapse show">
                    <div class="accordion-body">
                        <div class="detail-list">
                            <div class="detail-row"><span class="detail-label">Timestamp</span><span class="detail-val">${escapeHtml(p.timestamp)}</span></div>
                            <div class="detail-row"><span class="detail-label">Full Name</span><span class="detail-val">${escapeHtml(p.fullName)}</span></div>
                            <div class="detail-row"><span class="detail-label">Student / Employee</span><span class="detail-val">${escapeHtml(p.userType)}</span></div>
                            <div class="detail-row"><span class="detail-label">College / University</span><span class="detail-val">${escapeHtml(p.collegeName || "—")}</span></div>
                            <div class="detail-row"><span class="detail-label">Course / Program</span><span class="detail-val">${escapeHtml(p.courseProgram || "—")}</span></div>
                            <div class="detail-row"><span class="detail-label">Which Year</span><span class="detail-val">${escapeHtml(p.whichYear || "—")}</span></div>
                            <div class="detail-row"><span class="detail-label">Father / Guardian</span><span class="detail-val">${escapeHtml(p.guardianName || "—")}</span></div>
                            <div class="detail-row"><span class="detail-label">Guardian Mobile</span><span class="detail-val">${escapeHtml(p.guardianMobile || "—")}</span></div>
                            <div class="detail-row"><span class="detail-label">Home Address</span><span class="detail-val">${escapeHtml(p.homeAddress || "—")}</span></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="accordion-item rounded-4 overflow-hidden mb-2 border">
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#mpBooking">
                        <i class="bi bi-house-door-fill text-primary me-2"></i>Booking &amp; Stay Details
                    </button>
                </h2>
                <div id="mpBooking" class="accordion-collapse collapse">
                    <div class="accordion-body">
                        <div class="detail-list">
                            <div class="detail-row"><span class="detail-label">Booking Date</span><span class="detail-val">${escapeHtml(p.bookingDate || "—")}</span></div>
                            <div class="detail-row"><span class="detail-label">Shifting Date</span><span class="detail-val">${escapeHtml(p.shiftingDate || "—")}</span></div>
                            <div class="detail-row"><span class="detail-label">Room Number</span><span class="detail-val">${escapeHtml(p.roomNumber || "—")}</span></div>
                            <div class="detail-row"><span class="detail-label">Room Type</span><span class="detail-val">${escapeHtml(p.roomType || "—")}</span></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="accordion-item rounded-4 overflow-hidden mb-2 border">
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#mpPayment">
                        <i class="bi bi-credit-card-fill text-primary me-2"></i>Payment Details
                    </button>
                </h2>
                <div id="mpPayment" class="accordion-collapse collapse">
                    <div class="accordion-body">
                        <div class="detail-list">
                            <div class="detail-row"><span class="detail-label">Booking Amount</span><span class="detail-val">${formatINR(p.bookingAmount)}</span></div>
                            <div class="detail-row"><span class="detail-label">Registration Fee</span><span class="detail-val">${formatINR(p.registrationFee)}</span></div>
                            <div class="detail-row"><span class="detail-label">Monthly Rent</span><span class="detail-val">${formatINR(p.monthlyRent)}</span></div>
                            <div class="detail-row"><span class="detail-label">Security Deposit</span><span class="detail-val">${formatINR(p.securityDeposit)}</span></div>
                            <div class="detail-row"><span class="detail-label">Payment Mode</span><span class="detail-val">${escapeHtml(p.paymentMode || "—")}</span></div>
                            <div class="detail-row">
                                <span class="detail-label">Payment Receipt</span>
                                <span class="detail-val">
                                    <button type="button" class="btn btn-sm btn-outline-primary py-0 px-2" data-preview-doc="Payment Receipt" data-doc-file="${escapeHtml(p.paymentReceipt || "receipt.pdf")}">
                                        ${escapeHtml(p.paymentReceipt || "View")}
                                    </button>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="accordion-item rounded-4 overflow-hidden mb-2 border">
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#mpDocs">
                        <i class="bi bi-file-earmark-check-fill text-primary me-2"></i>Documents
                    </button>
                </h2>
                <div id="mpDocs" class="accordion-collapse collapse">
                    <div class="accordion-body">
                        <div class="doc-grid">
                            <div class="doc-card" data-preview-doc="Aadhaar Card – Front" data-doc-file="${escapeHtml(p.aadhaarFront || "aadhaar_front.jpg")}">
                                <div class="doc-thumb"><i class="bi bi-card-heading"></i></div>
                                <div class="doc-name">Aadhaar (Front)</div>
                            </div>
                            <div class="doc-card" data-preview-doc="Aadhaar Card – Back" data-doc-file="${escapeHtml(p.aadhaarBack || "aadhaar_back.jpg")}">
                                <div class="doc-thumb"><i class="bi bi-card-text"></i></div>
                                <div class="doc-name">Aadhaar (Back)</div>
                            </div>
                            <div class="doc-card" data-preview-doc="Your ID" data-doc-file="${escapeHtml(p.yourId || "id_card.jpg")}">
                                <div class="doc-thumb"><i class="bi bi-person-vcard"></i></div>
                                <div class="doc-name">Your ID</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="accordion-item rounded-4 overflow-hidden border">
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#mpWork">
                        <i class="bi bi-briefcase-fill text-primary me-2"></i>(For Employees Only)
                    </button>
                </h2>
                <div id="mpWork" class="accordion-collapse collapse">
                    <div class="accordion-body">
                        <div class="detail-list">
                            <div class="detail-row"><span class="detail-label">Full Name</span><span class="detail-val">${escapeHtml(p.employeeFullName || (p.userType === "Employee" ? p.fullName : "—"))}</span></div>
                            <div class="detail-row"><span class="detail-label">Mobile Number</span><span class="detail-val">${escapeHtml(p.employeeMobile || (p.userType === "Employee" ? p.mobileNumber : "—"))}</span></div>
                            <div class="detail-row"><span class="detail-label">Company Name</span><span class="detail-val">${escapeHtml(p.companyName || "—")}</span></div>
                            <div class="detail-row"><span class="detail-label">Company Address</span><span class="detail-val">${escapeHtml(p.companyAddress || "—")}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById("mobileProfileBackBtn").addEventListener("click", () => {
        state.profileMobileDetailOpen = false;
        renderProfileModule();
    });
    bindProfileDetailInteractions(p);
}

function bindProfileDetailInteractions(profile) {
    moduleContainer.querySelectorAll("[data-ptab]").forEach(btn => {
        btn.addEventListener("click", () => {
            state.profileDetailTab = btn.dataset.ptab;
            renderProfileModule();
        });
    });

    moduleContainer.querySelectorAll("[data-edit-profile-detail]").forEach(btn => {
        btn.addEventListener("click", () => {
            state.editProfileId = btn.dataset.editProfileDetail;
            switchModule("profile", "update");
        });
    });

    moduleContainer.querySelectorAll("[data-preview-doc]").forEach(el => {
        el.addEventListener("click", () => {
            const docLabel = el.dataset.previewDoc;
            const docFile = el.dataset.docFile;
            openModal(docLabel, `
                <div class="text-center p-4 bg-light rounded-4 border">
                    <i class="bi bi-file-earmark-check text-primary" style="font-size:3rem;"></i>
                    <h6 class="fw-bold mt-2 mb-1">${escapeHtml(docLabel)}</h6>
                    <p class="text-muted small mb-3">File Reference: <strong>${escapeHtml(docFile)}</strong></p>
                    <div class="small text-secondary">Resident: ${escapeHtml(profile ? profile.fullName : "—")} &bull; Month: ${escapeHtml(state.selectedMonth)}</div>
                </div>
            `);
        });
    });
}

function renderUpdateProfileView() {
    const profiles = getMonthData().profiles;
    if (!profiles.length) {
        moduleContainer.innerHTML = `
            <div class="page-header">
                <div class="page-title-wrap">
                    <div class="page-icon"><i class="bi bi-pencil-square"></i></div>
                    <div><h1>Update Profile</h1><p>Edit existing profile records for ${escapeHtml(state.selectedMonth)}.</p></div>
                </div>
            </div>
            <div class="panel-card text-center py-5">
                <p class="text-muted mb-3">No profiles available in ${escapeHtml(state.selectedMonth)} to update.</p>
                <button type="button" class="btn btn-primary rounded-3" id="goAddProfileFromEmpty">Add New Profile</button>
            </div>
        `;
        document.getElementById("goAddProfileFromEmpty").addEventListener("click", () => switchModule("profile", "add"));
        return;
    }

    const target = profiles.find(p => p.id === state.editProfileId) || profiles[0];
    state.editProfileId = target.id;
    renderProfileForm(target, profiles);
}

function renderProfileForm(existingProfile, allProfilesForSelect = null) {
    const isEdit = Boolean(existingProfile);
    const p = existingProfile || {
        userType: "Student", fullName: "", email: "", mobileNumber: "",
        collegeName: "", courseProgram: "", whichYear: "",
        guardianName: "", guardianMobile: "", homeAddress: "",
        bookingDate: "", shiftingDate: "", roomNumber: "", roomType: "2 Seater",
        bookingAmount: 5000, registrationFee: 1000, monthlyRent: 7000, securityDeposit: 7000,
        paymentMode: "UPI", paymentReceipt: "", aadhaarFront: "", aadhaarBack: "", yourId: "",
        companyName: "", companyAddress: ""
    };

    moduleContainer.innerHTML = `
        <div class="page-header">
            <div class="page-title-wrap">
                <div class="page-icon"><i class="bi ${isEdit ? "bi-pencil-square" : "bi-person-plus-fill"}"></i></div>
                <div>
                    <h1>${isEdit ? "Update Profile" : "Add New Profile"}</h1>
                    <p>${isEdit ? "Modify student/employee record" : "Create a new resident profile"} for ${escapeHtml(state.selectedMonth)}.</p>
                </div>
            </div>
            <button type="button" class="btn btn-outline-primary rounded-3" id="backToAllProfilesBtn"><i class="bi bi-arrow-left me-1"></i>Back to Profiles</button>
        </div>

        ${isEdit && allProfilesForSelect ? `
            <div class="filter-card mb-3">
                <label class="fw-semibold small text-muted mb-0">Select Profile to Edit:</label>
                <select id="selectProfileToEdit" class="filter-select flex-grow-1">
                    ${allProfilesForSelect.map(item => `<option value="${escapeHtml(item.id)}" ${item.id === p.id ? "selected" : ""}>${escapeHtml(item.fullName)} (${escapeHtml(item.roomNumber)} – ${escapeHtml(item.userType)})</option>`).join("")}
                </select>
            </div>
        ` : ""}

        <form id="profileForm" class="panel-card">
            <h6 class="fw-bold text-primary mb-3"><i class="bi bi-person me-1"></i>Personal &amp; Academic Details</h6>
            <div class="row g-3 mb-4">
                <div class="col-md-4"><label class="form-label small fw-semibold">Full Name *</label><input name="fullName" class="form-control" value="${escapeHtml(p.fullName)}" required></div>
                <div class="col-md-4"><label class="form-label small fw-semibold">Email Address *</label><input type="email" name="email" class="form-control" value="${escapeHtml(p.email)}" required></div>
                <div class="col-md-4"><label class="form-label small fw-semibold">Mobile Number *</label><input name="mobileNumber" class="form-control" value="${escapeHtml(p.mobileNumber)}" required></div>
                <div class="col-md-3">
                    <label class="form-label small fw-semibold">Student or Employee *</label>
                    <select name="userType" class="form-select">
                        <option value="Student" ${p.userType === "Student" ? "selected" : ""}>Student</option>
                        <option value="Employee" ${p.userType === "Employee" ? "selected" : ""}>Employee</option>
                    </select>
                </div>
                <div class="col-md-3"><label class="form-label small fw-semibold">College / University</label><input name="collegeName" class="form-control" value="${escapeHtml(p.collegeName)}"></div>
                <div class="col-md-3"><label class="form-label small fw-semibold">Course / Program</label><input name="courseProgram" class="form-control" value="${escapeHtml(p.courseProgram)}"></div>
                <div class="col-md-3"><label class="form-label small fw-semibold">Which Year</label><input name="whichYear" class="form-control" value="${escapeHtml(p.whichYear)}"></div>
                <div class="col-md-4"><label class="form-label small fw-semibold">Father / Guardian Name</label><input name="guardianName" class="form-control" value="${escapeHtml(p.guardianName)}"></div>
                <div class="col-md-4"><label class="form-label small fw-semibold">Parent / Guardian Mobile</label><input name="guardianMobile" class="form-control" value="${escapeHtml(p.guardianMobile)}"></div>
                <div class="col-md-4"><label class="form-label small fw-semibold">Home Address</label><input name="homeAddress" class="form-control" value="${escapeHtml(p.homeAddress)}"></div>
            </div>

            <h6 class="fw-bold text-primary mb-3"><i class="bi bi-house-check me-1"></i>Booking, Room &amp; Payment Details</h6>
            <div class="row g-3 mb-4">
                <div class="col-md-3"><label class="form-label small fw-semibold">Booking Date</label><input name="bookingDate" class="form-control" placeholder="e.g. 05 Dec 2026" value="${escapeHtml(p.bookingDate)}"></div>
                <div class="col-md-3"><label class="form-label small fw-semibold">Shifting Date</label><input name="shiftingDate" class="form-control" placeholder="e.g. 08 Dec 2026" value="${escapeHtml(p.shiftingDate)}"></div>
                <div class="col-md-3"><label class="form-label small fw-semibold">Room Number *</label><input name="roomNumber" class="form-control" value="${escapeHtml(p.roomNumber)}" required></div>
                <div class="col-md-3">
                    <label class="form-label small fw-semibold">Room Type</label>
                    <select name="roomType" class="form-select">
                        ${["1 Seater", "2 Seater", "3 Seater", "4 Seater"].map(rt => `<option value="${rt}" ${p.roomType === rt ? "selected" : ""}>${rt}</option>`).join("")}
                    </select>
                </div>
                <div class="col-md-3"><label class="form-label small fw-semibold">Booking Amount (₹)</label><input type="number" name="bookingAmount" class="form-control" value="${Number(p.bookingAmount) || 0}"></div>
                <div class="col-md-3"><label class="form-label small fw-semibold">Registration Fee (₹)</label><input type="number" name="registrationFee" class="form-control" value="${Number(p.registrationFee) || 0}"></div>
                <div class="col-md-3"><label class="form-label small fw-semibold">Monthly Rent (₹)</label><input type="number" name="monthlyRent" class="form-control" value="${Number(p.monthlyRent) || 0}"></div>
                <div class="col-md-3"><label class="form-label small fw-semibold">Security Deposit (₹)</label><input type="number" name="securityDeposit" class="form-control" value="${Number(p.securityDeposit) || 0}"></div>
                <div class="col-md-4">
                    <label class="form-label small fw-semibold">Payment Mode</label>
                    <select name="paymentMode" class="form-select">
                        ${["UPI", "Online", "Cash", "Bank Transfer"].map(m => `<option value="${m}" ${p.paymentMode === m ? "selected" : ""}>${m}</option>`).join("")}
                    </select>
                </div>
                <div class="col-md-4"><label class="form-label small fw-semibold">Payment Receipt File</label><input name="paymentReceipt" class="form-control" placeholder="receipt.pdf" value="${escapeHtml(p.paymentReceipt)}"></div>
                <div class="col-md-4"><label class="form-label small fw-semibold">Your ID File</label><input name="yourId" class="form-control" placeholder="id_card.jpg" value="${escapeHtml(p.yourId)}"></div>
            </div>

            <h6 class="fw-bold text-primary mb-3"><i class="bi bi-briefcase me-1"></i>Documents &amp; Employee Details</h6>
            <div class="row g-3 mb-4">
                <div class="col-md-3"><label class="form-label small fw-semibold">Aadhaar Card – Front</label><input name="aadhaarFront" class="form-control" placeholder="aadhaar_front.jpg" value="${escapeHtml(p.aadhaarFront)}"></div>
                <div class="col-md-3"><label class="form-label small fw-semibold">Aadhaar Card – Back</label><input name="aadhaarBack" class="form-control" placeholder="aadhaar_back.jpg" value="${escapeHtml(p.aadhaarBack)}"></div>
                <div class="col-md-3"><label class="form-label small fw-semibold">Company Name (Employees)</label><input name="companyName" class="form-control" value="${escapeHtml(p.companyName)}"></div>
                <div class="col-md-3"><label class="form-label small fw-semibold">Company Address</label><input name="companyAddress" class="form-control" value="${escapeHtml(p.companyAddress)}"></div>
            </div>

            <div class="d-flex gap-2 justify-content-end">
                <button type="button" class="btn btn-light border rounded-3 px-4" id="cancelProfileFormBtn">Cancel</button>
                <button type="submit" class="btn btn-primary rounded-3 px-4 fw-semibold">
                    <i class="bi bi-check2-circle me-1"></i>${isEdit ? "Save Changes" : "Add Profile"}
                </button>
            </div>
        </form>
    `;

    document.getElementById("backToAllProfilesBtn").addEventListener("click", () => switchModule("profile", "all"));
    document.getElementById("cancelProfileFormBtn").addEventListener("click", () => switchModule("profile", "all"));

    const selector = document.getElementById("selectProfileToEdit");
    if (selector) {
        selector.addEventListener("change", () => {
            state.editProfileId = selector.value;
            renderUpdateProfileView();
        });
    }

    document.getElementById("profileForm").addEventListener("submit", e => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const updatedRecord = {
            id: isEdit ? p.id : "PRF-" + Date.now(),
            timestamp: isEdit ? p.timestamp : formatNowTimestamp(),
            fullName: fd.get("fullName").trim(),
            email: fd.get("email").trim(),
            mobileNumber: fd.get("mobileNumber").trim(),
            userType: fd.get("userType"),
            collegeName: fd.get("collegeName").trim(),
            courseProgram: fd.get("courseProgram").trim(),
            whichYear: fd.get("whichYear").trim(),
            guardianName: fd.get("guardianName").trim(),
            guardianMobile: fd.get("guardianMobile").trim(),
            homeAddress: fd.get("homeAddress").trim(),
            bookingDate: fd.get("bookingDate").trim(),
            shiftingDate: fd.get("shiftingDate").trim(),
            roomNumber: fd.get("roomNumber").trim(),
            roomType: fd.get("roomType"),
            bookingAmount: Number(fd.get("bookingAmount")) || 0,
            registrationFee: Number(fd.get("registrationFee")) || 0,
            monthlyRent: Number(fd.get("monthlyRent")) || 0,
            securityDeposit: Number(fd.get("securityDeposit")) || 0,
            paymentMode: fd.get("paymentMode"),
            paymentReceipt: fd.get("paymentReceipt").trim() || "receipt_uploaded.pdf",
            aadhaarFront: fd.get("aadhaarFront").trim() || "aadhaar_front.jpg",
            aadhaarBack: fd.get("aadhaarBack").trim() || "aadhaar_back.jpg",
            yourId: fd.get("yourId").trim() || "id_card.jpg",
            employeeFullName: fd.get("userType") === "Employee" ? fd.get("fullName").trim() : "",
            employeeMobile: fd.get("userType") === "Employee" ? fd.get("mobileNumber").trim() : "",
            companyName: fd.get("companyName").trim(),
            companyAddress: fd.get("companyAddress").trim()
        };

        const list = getMonthData().profiles;
        if (isEdit) {
            const idx = list.findIndex(item => item.id === p.id);
            if (idx >= 0) list[idx] = updatedRecord;
        } else {
            list.unshift(updatedRecord);
        }
        state.selectedProfileId = updatedRecord.id;
        switchModule("profile", "all");
    });
}

/* ==========================================================================
   MODULE 2: PAYMENT MANAGEMENT
   ========================================================================== */
function renderPaymentModule() {
    if (state.activeSubView === "add") return renderAddPaymentForm();

    const data = getMonthData();
    const allPayments = data.payments || [];

    // Apply sub-view preset
    let basePayments = allPayments;
    let subHeading = "Track and manage all rent, booking and other payments.";
    if (state.activeSubView === "pending") {
        basePayments = allPayments.filter(p => p.status === "Pending");
        subHeading = "Review and clear pending payments for " + state.selectedMonth + ".";
    } else if (state.activeSubView === "history") {
        basePayments = allPayments.filter(p => p.status === "Paid");
        subHeading = "Completed payment history for " + state.selectedMonth + ".";
    }

    const totalAmount = allPayments.reduce((s, p) => s + (Number(p.amountPaid) || 0), 0);
    const paidAmount = allPayments.filter(p => p.status === "Paid").reduce((s, p) => s + (Number(p.amountPaid) || 0), 0);
    const pendingAmount = allPayments.filter(p => p.status === "Pending").reduce((s, p) => s + (Number(p.amountPaid) || 0), 0);

    const q = state.paymentSearch.trim().toLowerCase();
    const filtered = basePayments.filter(p => {
        const matchQ = !q || [p.fullName, p.mobileNumber, p.email, p.roomNumber, p.amountType]
            .some(v => (v || "").toLowerCase().includes(q));
        const matchType = !state.paymentTypeFilter || p.amountType === state.paymentTypeFilter;
        const matchMode = !state.paymentModeFilter || p.paymentMode === state.paymentModeFilter;
        const matchStatus = !state.paymentStatusFilter || p.status === state.paymentStatusFilter;
        return matchQ && matchType && matchMode && matchStatus;
    });

    const PAGE_SIZE = 5;
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (state.paymentPage > totalPages) state.paymentPage = totalPages;
    const start = (state.paymentPage - 1) * PAGE_SIZE;
    const pageRecords = filtered.slice(start, start + PAGE_SIZE);

    // Amount Type Breakdown
    const amountTypes = ["Monthly Rent", "Booking Amount", "Registration Fee", "Security Deposit"];
    const typeTotals = amountTypes.map(t => ({
        label: t,
        total: allPayments.filter(p => p.amountType === t).reduce((s, p) => s + (Number(p.amountPaid) || 0), 0)
    }));
    const maxTypeVal = Math.max(1, ...typeTotals.map(t => t.total));

    const paidPct = totalAmount ? Math.round((paidAmount / totalAmount) * 1000) / 10 : 0;
    const pendingPct = totalAmount ? Math.round((100 - paidPct) * 10) / 10 : 0;

    moduleContainer.innerHTML = `
        <div class="page-header">
            <div class="page-title-wrap">
                <div class="page-icon"><i class="bi bi-credit-card-2-front-fill"></i></div>
                <div>
                    <h1>Payment Management</h1>
                    <p>${escapeHtml(subHeading)}</p>
                </div>
            </div>
            <button type="button" class="btn btn-primary rounded-3 fw-semibold" id="quickAddPaymentBtn">
                <i class="bi bi-plus-circle me-1"></i>Add Payment
            </button>
        </div>

        <section class="kpi-grid">
            <article class="kpi-card highlight">
                <div class="kpi-icon"><i class="bi bi-wallet2"></i></div>
                <div class="kpi-meta"><div class="kpi-label">Total Payments</div><div class="kpi-value">${formatINR(totalAmount)}</div></div>
            </article>
            <article class="kpi-card">
                <div class="kpi-icon green"><i class="bi bi-check-circle-fill"></i></div>
                <div class="kpi-meta"><div class="kpi-label">Paid</div><div class="kpi-value">${formatINR(paidAmount)}</div></div>
            </article>
            <article class="kpi-card">
                <div class="kpi-icon red"><i class="bi bi-clock-history"></i></div>
                <div class="kpi-meta"><div class="kpi-label">Pending</div><div class="kpi-value">${formatINR(pendingAmount)}</div></div>
            </article>
            <article class="kpi-card">
                <div class="kpi-icon"><i class="bi bi-people-fill"></i></div>
                <div class="kpi-meta"><div class="kpi-label">Total Records</div><div class="kpi-value">${allPayments.length}</div></div>
            </article>
            <article class="kpi-card">
                <div class="kpi-icon"><i class="bi bi-calendar3"></i></div>
                <div class="kpi-meta"><div class="kpi-label">Selected Month</div><div class="kpi-value month-val">${escapeHtml(state.selectedMonth)}</div></div>
            </article>
        </section>

        <section class="filter-card">
            <div class="search-box">
                <i class="bi bi-search"></i>
                <input type="search" id="paymentSearchInput" value="${escapeHtml(state.paymentSearch)}" placeholder="Search by name, mobile, email or room no...">
            </div>
            <select id="paymentTypeFilter" class="filter-select">
                <option value="">All Amount Type</option>
                ${amountTypes.map(t => `<option value="${t}" ${state.paymentTypeFilter === t ? "selected" : ""}>${t}</option>`).join("")}
            </select>
            <select id="paymentModeFilter" class="filter-select">
                <option value="">All Payment Mode</option>
                ${["UPI", "Online", "Cash", "Bank Transfer"].map(m => `<option value="${m}" ${state.paymentModeFilter === m ? "selected" : ""}>${m}</option>`).join("")}
            </select>
            <select id="paymentStatusFilter" class="filter-select">
                <option value="">All Status</option>
                <option value="Paid" ${state.paymentStatusFilter === "Paid" ? "selected" : ""}>Paid</option>
                <option value="Pending" ${state.paymentStatusFilter === "Pending" ? "selected" : ""}>Pending</option>
            </select>
            <button type="button" class="btn-reset" id="paymentResetBtn"><i class="bi bi-arrow-clockwise"></i> Reset</button>
        </section>

        <div class="panel-card">
            <div class="table-wrap desktop-only-table">
                <div class="table-responsive-custom">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Timestamp</th>
                                <th>Full Name</th>
                                <th>Type</th>
                                <th>Room No.</th>
                                <th>Room Type</th>
                                <th>Fee Month</th>
                                <th>Amount Type</th>
                                <th>Amount Paid</th>
                                <th>Mode</th>
                                <th>Status</th>
                                <th>Receipt</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pageRecords.length ? pageRecords.map((p, idx) => `
                                <tr>
                                    <td>${start + idx + 1}</td>
                                    <td class="small text-nowrap">${escapeHtml(p.timestamp)}</td>
                                    <td class="fw-semibold">${escapeHtml(p.fullName)}</td>
                                    <td><span class="badge-soft ${p.userType === "Student" ? "badge-student" : "badge-employee"}">${escapeHtml(p.userType)}</span></td>
                                    <td>${escapeHtml(p.roomNumber)}</td>
                                    <td>${escapeHtml(p.roomType)}</td>
                                    <td>${escapeHtml(p.feeMonth)}</td>
                                    <td>${escapeHtml(p.amountType)}</td>
                                    <td class="fw-bold">${formatINR(p.amountPaid)}</td>
                                    <td>${escapeHtml(p.paymentMode)}</td>
                                    <td><span class="badge-soft ${p.status === "Paid" ? "badge-paid" : "badge-pending"}">${escapeHtml(p.status)}</span></td>
                                    <td class="text-nowrap">
                                        <button type="button" class="action-icon-btn me-1" data-view-payment="${escapeHtml(p.id)}" title="View Receipt & Details"><i class="bi bi-file-earmark-image"></i></button>
                                        ${p.status === "Pending" ? `<button type="button" class="action-icon-btn text-success" data-mark-paid="${escapeHtml(p.id)}" title="Mark Paid"><i class="bi bi-check-lg"></i></button>` : ""}
                                    </td>
                                </tr>
                            `).join("") : `<tr><td colspan="12" class="empty-cell">No payment records found for ${escapeHtml(state.selectedMonth)}.</td></tr>`}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Mobile Payment Cards -->
            <div class="mobile-cards-list">
                ${pageRecords.length ? pageRecords.map(p => `
                    <div class="mobile-record-card" data-view-payment="${escapeHtml(p.id)}">
                        <div class="d-flex justify-content-between align-items-start gap-2">
                            <div>
                                <div class="fw-bold">${escapeHtml(p.fullName)}</div>
                                <div class="small text-muted">${escapeHtml(p.roomNumber)} &bull; ${escapeHtml(p.roomType)} &bull; ${escapeHtml(p.amountType)}</div>
                                <div class="small text-muted">${escapeHtml(p.paymentDate)} &bull; ${escapeHtml(p.paymentMode)}</div>
                            </div>
                            <div class="text-end">
                                <div class="fw-bold text-primary">${formatINR(p.amountPaid)}</div>
                                <span class="badge-soft ${p.status === "Paid" ? "badge-paid" : "badge-pending"}">${escapeHtml(p.status)}</span>
                            </div>
                        </div>
                    </div>
                `).join("") : `<div class="text-center text-muted py-4">No payment records found for ${escapeHtml(state.selectedMonth)}.</div>`}
            </div>

            <div class="pagination-bar">
                <div>Showing ${filtered.length ? start + 1 : 0} – ${Math.min(start + PAGE_SIZE, filtered.length)} of ${filtered.length} records</div>
                <div class="pagination-controls" id="paymentPagination"></div>
            </div>
        </div>

        <section class="analytics-grid">
            <article class="panel-card">
                <h3 class="panel-title mb-3"><i class="bi bi-bar-chart-fill"></i> Amount Type Summary (${escapeHtml(state.selectedMonth)})</h3>
                ${typeTotals.map(t => `
                    <div class="h-bar-row">
                        <div class="h-bar-head"><span>${escapeHtml(t.label)}</span><strong>${formatINR(t.total)}</strong></div>
                        <div class="h-bar-track"><div class="h-bar-fill" style="width:${t.total ? Math.max(6, Math.round((t.total / maxTypeVal) * 100)) : 0}%"></div></div>
                    </div>
                `).join("")}
            </article>

            <article class="panel-card">
                <h3 class="panel-title mb-3"><i class="bi bi-pie-chart-fill"></i> Payment Status (${escapeHtml(state.selectedMonth)})</h3>
                <div class="donut-layout">
                    <div class="donut-chart" style="background: conic-gradient(#22c55e 0 ${paidPct}%, #ef4444 ${paidPct}% 100%);">
                        <div class="donut-center">
                            <strong>${formatINR(totalAmount)}</strong>
                            <span>Total</span>
                        </div>
                    </div>
                    <div class="chart-legend">
                        <div class="legend-item"><span class="legend-dot" style="background:#22c55e;"></span><span>Paid: <strong>${formatINR(paidAmount)}</strong> (${paidPct}%)</span></div>
                        <div class="legend-item"><span class="legend-dot" style="background:#ef4444;"></span><span>Pending: <strong>${formatINR(pendingAmount)}</strong> (${pendingPct}%)</span></div>
                    </div>
                </div>
            </article>
        </section>
    `;

    // Bind events
    document.getElementById("quickAddPaymentBtn").addEventListener("click", () => switchModule("payment", "add"));
    document.getElementById("paymentSearchInput").addEventListener("input", e => { state.paymentSearch = e.target.value; state.paymentPage = 1; renderPaymentModule(); });
    document.getElementById("paymentTypeFilter").addEventListener("change", e => { state.paymentTypeFilter = e.target.value; state.paymentPage = 1; renderPaymentModule(); });
    document.getElementById("paymentModeFilter").addEventListener("change", e => { state.paymentModeFilter = e.target.value; state.paymentPage = 1; renderPaymentModule(); });
    document.getElementById("paymentStatusFilter").addEventListener("change", e => { state.paymentStatusFilter = e.target.value; state.paymentPage = 1; renderPaymentModule(); });
    document.getElementById("paymentResetBtn").addEventListener("click", () => {
        state.paymentSearch = ""; state.paymentTypeFilter = ""; state.paymentModeFilter = ""; state.paymentStatusFilter = ""; state.paymentPage = 1;
        renderPaymentModule();
    });

    moduleContainer.querySelectorAll("[data-view-payment]").forEach(el => {
        el.addEventListener("click", () => {
            const rec = allPayments.find(item => item.id === el.dataset.viewPayment);
            if (!rec) return;
            const stars = "★".repeat(rec.rating || 5) + "☆".repeat(5 - (rec.rating || 5));
            openModal("Payment Receipt & Details", `
                <div class="detail-list">
                    <div class="detail-row"><span class="detail-label">Timestamp</span><span class="detail-val">${escapeHtml(rec.timestamp)}</span></div>
                    <div class="detail-row"><span class="detail-label">Full Name</span><span class="detail-val">${escapeHtml(rec.fullName)}</span></div>
                    <div class="detail-row"><span class="detail-label">Student / Employee</span><span class="detail-val">${escapeHtml(rec.userType)}</span></div>
                    <div class="detail-row"><span class="detail-label">Email Address</span><span class="detail-val">${escapeHtml(rec.email)}</span></div>
                    <div class="detail-row"><span class="detail-label">Mobile Number</span><span class="detail-val">${escapeHtml(rec.mobileNumber)}</span></div>
                    <div class="detail-row"><span class="detail-label">Room Number / Type</span><span class="detail-val">${escapeHtml(rec.roomNumber)} (${escapeHtml(rec.roomType)})</span></div>
                    <div class="detail-row"><span class="detail-label">Fee Month</span><span class="detail-val">${escapeHtml(rec.feeMonth)}</span></div>
                    <div class="detail-row"><span class="detail-label">Monthly Rent</span><span class="detail-val">${formatINR(rec.monthlyRent)}</span></div>
                    <div class="detail-row"><span class="detail-label">Amount Type</span><span class="detail-val">${escapeHtml(rec.amountType)}</span></div>
                    <div class="detail-row"><span class="detail-label">Amount Paid</span><span class="detail-val text-primary fs-6">${formatINR(rec.amountPaid)}</span></div>
                    <div class="detail-row"><span class="detail-label">Payment Date</span><span class="detail-val">${escapeHtml(rec.paymentDate)}</span></div>
                    <div class="detail-row"><span class="detail-label">Payment Mode</span><span class="detail-val">${escapeHtml(rec.paymentMode)}</span></div>
                    <div class="detail-row"><span class="detail-label">Status</span><span class="detail-val">${escapeHtml(rec.status)}</span></div>
                    <div class="detail-row"><span class="detail-label">Rating</span><span class="detail-val text-warning">${stars}</span></div>
                    <div class="detail-row"><span class="detail-label">Screenshot / Receipt</span><span class="detail-val">${escapeHtml(rec.receipt || "Uploaded")}</span></div>
                </div>
            `);
        });
    });

    moduleContainer.querySelectorAll("[data-mark-paid]").forEach(btn => {
        btn.addEventListener("click", e => {
            e.stopPropagation();
            const rec = allPayments.find(item => item.id === btn.dataset.markPaid);
            if (rec) {
                rec.status = "Paid";
                renderApp();
            }
        });
    });

    buildPaginationButtons(
        document.getElementById("paymentPagination"),
        state.paymentPage,
        totalPages,
        page => { state.paymentPage = page; renderPaymentModule(); }
    );
}

function renderAddPaymentForm() {
    moduleContainer.innerHTML = `
        <div class="page-header">
            <div class="page-title-wrap">
                <div class="page-icon"><i class="bi bi-plus-circle-fill"></i></div>
                <div><h1>Add Payment Record</h1><p>Record a new payment for ${escapeHtml(state.selectedMonth)}.</p></div>
            </div>
            <button type="button" class="btn btn-outline-primary rounded-3" id="backToPaymentsBtn"><i class="bi bi-arrow-left me-1"></i>Back to Payments</button>
        </div>

        <form id="addPaymentForm" class="panel-card">
            <div class="row g-3">
                <div class="col-md-4"><label class="form-label small fw-semibold">Full Name *</label><input name="fullName" class="form-control" required></div>
                <div class="col-md-4"><label class="form-label small fw-semibold">Email Address *</label><input type="email" name="email" class="form-control" required></div>
                <div class="col-md-4"><label class="form-label small fw-semibold">Mobile Number *</label><input name="mobileNumber" class="form-control" required></div>
                <div class="col-md-3">
                    <label class="form-label small fw-semibold">Student or Employee</label>
                    <select name="userType" class="form-select"><option value="Student">Student</option><option value="Employee">Employee</option></select>
                </div>
                <div class="col-md-3"><label class="form-label small fw-semibold">Room Number *</label><input name="roomNumber" class="form-control" placeholder="e.g. A-101" required></div>
                <div class="col-md-3">
                    <label class="form-label small fw-semibold">Room Type</label>
                    <select name="roomType" class="form-select"><option>1 Seater</option><option selected>2 Seater</option><option>3 Seater</option><option>4 Seater</option></select>
                </div>
                <div class="col-md-3"><label class="form-label small fw-semibold">Fee Month</label><input name="feeMonth" class="form-control" value="${escapeHtml(state.selectedMonth)}"></div>
                <div class="col-md-3"><label class="form-label small fw-semibold">Monthly Rent (₹)</label><input type="number" name="monthlyRent" class="form-control" value="7000"></div>
                <div class="col-md-3">
                    <label class="form-label small fw-semibold">Amount Type</label>
                    <select name="amountType" class="form-select"><option>Monthly Rent</option><option>Booking Amount</option><option>Registration Fee</option><option>Security Deposit</option></select>
                </div>
                <div class="col-md-3"><label class="form-label small fw-semibold">Amount Paid (₹) *</label><input type="number" name="amountPaid" class="form-control" required></div>
                <div class="col-md-3"><label class="form-label small fw-semibold">Payment Date</label><input name="paymentDate" class="form-control" placeholder="e.g. 15 Dec 2026"></div>
                <div class="col-md-3">
                    <label class="form-label small fw-semibold">Payment Mode</label>
                    <select name="paymentMode" class="form-select"><option>UPI</option><option>Online</option><option>Cash</option><option>Bank Transfer</option></select>
                </div>
                <div class="col-md-3">
                    <label class="form-label small fw-semibold">Status</label>
                    <select name="status" class="form-select"><option value="Paid">Paid</option><option value="Pending">Pending</option></select>
                </div>
                <div class="col-md-3"><label class="form-label small fw-semibold">Receipt File Name</label><input name="receipt" class="form-control" placeholder="receipt.jpg"></div>
                <div class="col-md-3">
                    <label class="form-label small fw-semibold">Rating (1–5)</label>
                    <select name="rating" class="form-select"><option value="5">5 ★</option><option value="4">4 ★</option><option value="3">3 ★</option><option value="2">2 ★</option><option value="1">1 ★</option></select>
                </div>
            </div>
            <div class="d-flex gap-2 justify-content-end mt-4">
                <button type="button" class="btn btn-light border rounded-3 px-4" id="cancelAddPaymentBtn">Cancel</button>
                <button type="submit" class="btn btn-primary rounded-3 px-4 fw-semibold"><i class="bi bi-check2-circle me-1"></i>Save Payment</button>
            </div>
        </form>
    `;

    document.getElementById("backToPaymentsBtn").addEventListener("click", () => switchModule("payment", "all"));
    document.getElementById("cancelAddPaymentBtn").addEventListener("click", () => switchModule("payment", "all"));
    document.getElementById("addPaymentForm").addEventListener("submit", e => {
        e.preventDefault();
        const fd = new FormData(e.target);
        getMonthData().payments.unshift({
            id: "PAY-" + Date.now(),
            timestamp: formatNowTimestamp(),
            fullName: fd.get("fullName").trim(),
            email: fd.get("email").trim(),
            mobileNumber: fd.get("mobileNumber").trim(),
            userType: fd.get("userType"),
            roomNumber: fd.get("roomNumber").trim(),
            roomType: fd.get("roomType"),
            feeMonth: fd.get("feeMonth").trim() || state.selectedMonth,
            monthlyRent: Number(fd.get("monthlyRent")) || 0,
            amountType: fd.get("amountType"),
            amountPaid: Number(fd.get("amountPaid")) || 0,
            paymentDate: fd.get("paymentDate").trim() || formatNowTimestamp().split(",")[0],
            paymentMode: fd.get("paymentMode"),
            status: fd.get("status"),
            receipt: fd.get("receipt").trim() || "payment_receipt.jpg",
            rating: Number(fd.get("rating")) || 5
        });
        switchModule("payment", "all");
    });
}

/* ==========================================================================
   MODULE 3: EXPENSE MANAGEMENT (Monthly | Weekly 4-Week | Daily Average)
   ========================================================================== */
function renderExpenseModule() {
    if (state.activeSubView === "add") return renderAddExpenseForm();
    if (state.activeSubView === "history") return renderExpenseHistory();

    const exp = getMonthData().expenses;
    const totals = getMonthExpenseTotals(state.selectedMonth);
    const monthlyRec = (exp.monthly && exp.monthly[0]) || null;
    const weeklyList = exp.weekly || [];
    const dailyRec = (exp.dailyAverage && exp.dailyAverage[0]) || null;

    const q = state.expenseSearch.trim().toLowerCase();
    const freqFilter = state.activeSubView === "monthly" ? "monthly"
        : state.activeSubView === "weekly" ? "weekly"
        : state.activeSubView === "daily" ? "daily"
        : state.expenseFreqFilter;

    // Build Monthly Rows filtered by search/category
    const monthlyRows = MONTHLY_EXPENSE_FIELDS.map((head, i) => ({
        index: i + 1,
        head,
        amount: monthlyRec && monthlyRec.items ? (Number(monthlyRec.items[head]) || 0) : 0,
        receipt: monthlyRec ? monthlyRec.receipt : "",
        yourName: monthlyRec ? monthlyRec.yourName : "—"
    })).filter(r => {
        const matchQ = !q || r.head.toLowerCase().includes(q) || r.yourName.toLowerCase().includes(q);
        const matchCat = !state.expenseCatFilter || r.head === state.expenseCatFilter;
        return matchQ && matchCat;
    });

    // Build Weekly Rows
    const filteredWeeks = weeklyList.filter(w => {
        if (!q) return true;
        return w.weekLabel.toLowerCase().includes(q) ||
            (w.yourName || "").toLowerCase().includes(q) ||
            Object.keys(w.items || {}).some(k => k.toLowerCase().includes(q));
    });

    // Build Daily Average Rows
    const dailyRows = DAILY_EXPENSE_FIELDS.map(head => ({
        head,
        amount: dailyRec && dailyRec.items ? (Number(dailyRec.items[head]) || 0) : 0
    })).filter(r => !q || r.head.toLowerCase().includes(q));

    // Donut Percentages
    const gt = totals.grandTotal || 0;
    const mPct = gt ? Math.round((totals.monthlyTotal / gt) * 1000) / 10 : 0;
    const wPct = gt ? Math.round((totals.weeklyTotal / gt) * 1000) / 10 : 0;
    const dPct = gt ? Math.max(0, Math.round((100 - mPct - wPct) * 10) / 10) : 0;

    // Month-wise Expense comparison (months with data + current month)
    const comparisonMonths = AVAILABLE_MONTHS.filter(m => m === state.selectedMonth || getMonthExpenseTotals(m).grandTotal > 0);

    const showMonthly = !freqFilter || freqFilter === "monthly";
    const showWeekly = !freqFilter || freqFilter === "weekly";
    const showDaily = !freqFilter || freqFilter === "daily";

    moduleContainer.innerHTML = `
        <div class="page-header">
            <div class="page-title-wrap">
                <div class="page-icon"><i class="bi bi-cash-coin"></i></div>
                <div>
                    <h1>Expense Management</h1>
                    <p>Track and manage property/hostel expenses separately: Monthly, Weekly (4 Weeks) &amp; Daily Average.</p>
                </div>
            </div>
            <button type="button" class="btn btn-primary rounded-3 fw-semibold" id="quickAddExpenseBtn">
                <i class="bi bi-plus-circle me-1"></i>Add Expense
            </button>
        </div>

        <section class="kpi-grid">
            <article class="kpi-card highlight">
                <div class="kpi-icon"><i class="bi bi-cash-stack"></i></div>
                <div class="kpi-meta"><div class="kpi-label">Total Expense</div><div class="kpi-value">${formatINR(totals.grandTotal)}</div></div>
            </article>
            <article class="kpi-card">
                <div class="kpi-icon"><i class="bi bi-calendar-month"></i></div>
                <div class="kpi-meta"><div class="kpi-label">Monthly</div><div class="kpi-value">${formatINR(totals.monthlyTotal)}</div></div>
            </article>
            <article class="kpi-card">
                <div class="kpi-icon green"><i class="bi bi-calendar-week"></i></div>
                <div class="kpi-meta"><div class="kpi-label">Weekly (Total)</div><div class="kpi-value">${formatINR(totals.weeklyTotal)}</div></div>
            </article>
            <article class="kpi-card">
                <div class="kpi-icon amber"><i class="bi bi-calendar-day"></i></div>
                <div class="kpi-meta"><div class="kpi-label">Daily (Average)</div><div class="kpi-value">${formatINR(totals.dailyAvgTotal)}</div></div>
            </article>
            <article class="kpi-card">
                <div class="kpi-icon"><i class="bi bi-bar-chart-fill"></i></div>
                <div class="kpi-meta"><div class="kpi-label">Selected Month</div><div class="kpi-value month-val">${escapeHtml(state.selectedMonth)}</div></div>
            </article>
        </section>

        <section class="filter-card">
            <div class="search-box">
                <i class="bi bi-search"></i>
                <input type="search" id="expenseSearchInput" value="${escapeHtml(state.expenseSearch)}" placeholder="Search by expense head, week, or your name...">
            </div>
            <select id="expenseCatFilter" class="filter-select">
                <option value="">All Monthly Categories</option>
                ${MONTHLY_EXPENSE_FIELDS.map(c => `<option value="${escapeHtml(c)}" ${state.expenseCatFilter === c ? "selected" : ""}>${escapeHtml(c)}</option>`).join("")}
            </select>
            <select id="expenseFreqFilter" class="filter-select">
                <option value="">All Frequency</option>
                <option value="monthly" ${freqFilter === "monthly" ? "selected" : ""}>Monthly Expense</option>
                <option value="weekly" ${freqFilter === "weekly" ? "selected" : ""}>Weekly Expense</option>
                <option value="daily" ${freqFilter === "daily" ? "selected" : ""}>Daily Expense (Average)</option>
            </select>
            <button type="button" class="btn-reset" id="expenseResetBtn"><i class="bi bi-arrow-clockwise"></i> Reset</button>
        </section>

        <div class="expense-overview-grid">
            <!-- COLUMN 1: MONTHLY EXPENSE -->
            ${showMonthly ? `
                <article class="panel-card">
                    <div class="panel-header">
                        <h3 class="panel-title"><i class="bi bi-calendar-month"></i> Monthly Expense (${escapeHtml(state.selectedMonth)})</h3>
                        ${monthlyRec ? `<span class="badge-soft badge-room">By: ${escapeHtml(monthlyRec.yourName)}</span>` : ""}
                    </div>
                    <div class="table-wrap">
                        <div class="table-responsive-custom">
                            <table class="data-table">
                                <thead><tr><th>#</th><th>Expense Head</th><th class="text-end">Amount (₹)</th><th class="text-center">Receipt</th></tr></thead>
                                <tbody>
                                    ${monthlyRows.map(r => `
                                        <tr>
                                            <td>${r.index}</td>
                                            <td>${escapeHtml(r.head)}</td>
                                            <td class="text-end fw-semibold">${formatINR(r.amount)}</td>
                                            <td class="text-center">
                                                <button type="button" class="action-icon-btn" data-exp-receipt="${escapeHtml(r.head)}" data-exp-file="${escapeHtml(r.receipt || "monthly_bill.pdf")}" data-exp-amt="${r.amount}" data-exp-by="${escapeHtml(r.yourName)}">
                                                    <i class="bi bi-file-earmark-image"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `).join("")}
                                </tbody>
                                <tfoot>
                                    <tr><td colspan="2">Total Monthly Expense</td><td class="text-end">${formatINR(totals.monthlyTotal)}</td><td></td></tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </article>
            ` : ""}

            <!-- COLUMN 2: WEEKLY (4 WEEKS) + DAILY AVERAGE -->
            <div class="d-flex flex-column gap-3">
                ${showWeekly ? `
                    <article class="panel-card">
                        <div class="panel-header">
                            <h3 class="panel-title"><i class="bi bi-calendar-week"></i> Weekly Expense (${escapeHtml(state.selectedMonth)})</h3>
                            <span class="badge-soft badge-paid">4 Weeks Combined</span>
                        </div>
                        <div class="table-wrap">
                            <div class="table-responsive-custom">
                                <table class="data-table">
                                    <thead><tr><th>Week</th><th>Date Range</th><th class="text-end">Total (₹)</th><th class="text-center">View</th></tr></thead>
                                    <tbody>
                                        ${filteredWeeks.length ? filteredWeeks.map(w => {
                                            const wSum = sumObjectValues(w.items);
                                            return `
                                                <tr>
                                                    <td class="fw-bold">${escapeHtml(w.weekLabel)}</td>
                                                    <td class="small">${escapeHtml(w.dateRange || "—")}</td>
                                                    <td class="text-end fw-bold">${formatINR(wSum)}</td>
                                                    <td class="text-center">
                                                        <button type="button" class="action-icon-btn" data-view-week="${escapeHtml(w.id)}" title="View Weekly Breakdown">
                                                            <i class="bi bi-eye"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join("") : `<tr><td colspan="4" class="empty-cell">No weekly records for ${escapeHtml(state.selectedMonth)}.</td></tr>`}
                                    </tbody>
                                    <tfoot>
                                        <tr><td colspan="2">Combined Monthly Weekly Total</td><td class="text-end">${formatINR(totals.weeklyTotal)}</td><td></td></tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </article>
                ` : ""}

                ${showDaily ? `
                    <article class="panel-card">
                        <div class="panel-header">
                            <h3 class="panel-title"><i class="bi bi-calendar-day"></i> Daily Expense (Average – ${escapeHtml(state.selectedMonth)})</h3>
                            ${dailyRec ? `<button type="button" class="action-icon-btn" data-exp-receipt="Daily Food Service Bill / Receipt" data-exp-file="${escapeHtml(dailyRec.receipt || "daily_avg.jpg")}" data-exp-amt="${totals.dailyAvgTotal}" data-exp-by="${escapeHtml(dailyRec.yourName)}" title="View Receipt"><i class="bi bi-file-earmark-image"></i></button>` : ""}
                        </div>
                        <div class="p-3 rounded-3 mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2" style="background:var(--blue-50);border:1px solid var(--border-color);">
                            <div>
                                <div class="small text-muted fw-semibold">Average Daily Expense</div>
                                <div class="fs-4 fw-bold text-primary">${formatINR(totals.dailyAvgTotal)}</div>
                            </div>
                            <div class="small text-muted" style="max-width:240px;">
                                <i class="bi bi-info-circle-fill text-primary me-1"></i>
                                ${escapeHtml(dailyRec && dailyRec.note ? dailyRec.note : "Daily average operational expense for " + state.selectedMonth + ".")}
                            </div>
                        </div>
                        <div class="detail-list">
                            ${dailyRows.map(d => `
                                <div class="detail-row">
                                    <span class="detail-label">${escapeHtml(d.head)}</span>
                                    <span class="detail-val">${formatINR(d.amount)}</span>
                                </div>
                            `).join("")}
                            ${dailyRec ? `<div class="detail-row"><span class="detail-label">Recorded By</span><span class="detail-val text-primary">${escapeHtml(dailyRec.yourName)}</span></div>` : ""}
                        </div>
                    </article>
                ` : ""}
            </div>

            <!-- COLUMN 3: SUMMARY DONUT & MONTH COMPARISON -->
            <div class="d-flex flex-column gap-3">
                <article class="panel-card">
                    <h3 class="panel-title mb-3"><i class="bi bi-pie-chart-fill"></i> Expense Summary</h3>
                    <div class="donut-layout">
                        <div class="donut-chart" style="background: conic-gradient(#1a66e8 0 ${mPct}%, #22c55e ${mPct}% ${mPct + wPct}%, #f59e0b ${mPct + wPct}% 100%);">
                            <div class="donut-center">
                                <strong>${formatINR(gt)}</strong>
                                <span>Total</span>
                            </div>
                        </div>
                        <div class="chart-legend w-100">
                            <div class="legend-item justify-content-between"><span><span class="legend-dot d-inline-block me-2" style="background:#1a66e8;"></span>Monthly Expense</span><strong>${formatINR(totals.monthlyTotal)} (${mPct}%)</strong></div>
                            <div class="legend-item justify-content-between"><span><span class="legend-dot d-inline-block me-2" style="background:#22c55e;"></span>Weekly Expense</span><strong>${formatINR(totals.weeklyTotal)} (${wPct}%)</strong></div>
                            <div class="legend-item justify-content-between"><span><span class="legend-dot d-inline-block me-2" style="background:#f59e0b;"></span>Daily Expense (Avg)</span><strong>${formatINR(totals.dailyAvgTotal)} (${dPct}%)</strong></div>
                        </div>
                    </div>
                </article>

                <article class="panel-card">
                    <h3 class="panel-title mb-3"><i class="bi bi-bar-chart-line-fill"></i> Month-wise Expense</h3>
                    <div class="table-wrap">
                        <table class="data-table">
                            <thead><tr><th>Month</th><th class="text-end">Total Expense (₹)</th></tr></thead>
                            <tbody>
                                ${comparisonMonths.map(m => `
                                    <tr class="${m === state.selectedMonth ? "selected-row" : ""}">
                                        <td class="fw-semibold">${escapeHtml(m)}</td>
                                        <td class="text-end fw-bold">${formatINR(getMonthExpenseTotals(m).grandTotal)}</td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    </div>
                </article>
            </div>
        </div>
    `;

    // Bind events
    document.getElementById("quickAddExpenseBtn").addEventListener("click", () => switchModule("expense", "add"));
    document.getElementById("expenseSearchInput").addEventListener("input", e => { state.expenseSearch = e.target.value; renderExpenseModule(); });
    document.getElementById("expenseCatFilter").addEventListener("change", e => { state.expenseCatFilter = e.target.value; renderExpenseModule(); });
    document.getElementById("expenseFreqFilter").addEventListener("change", e => {
        state.expenseFreqFilter = e.target.value;
        state.activeSubView = "overview";
        renderApp();
    });
    document.getElementById("expenseResetBtn").addEventListener("click", () => {
        state.expenseSearch = ""; state.expenseCatFilter = ""; state.expenseFreqFilter = "";
        state.activeSubView = "overview";
        renderApp();
    });

    moduleContainer.querySelectorAll("[data-view-week]").forEach(btn => {
        btn.addEventListener("click", () => {
            const w = weeklyList.find(item => item.id === btn.dataset.viewWeek);
            if (!w) return;
            const total = sumObjectValues(w.items);
            openModal(`${w.weekLabel} Expense Breakdown (${state.selectedMonth})`, `
                <div class="mb-3 d-flex justify-content-between small text-muted">
                    <span>Date Range: <strong>${escapeHtml(w.dateRange)}</strong></span>
                    <span>Your Name: <strong>${escapeHtml(w.yourName)}</strong></span>
                </div>
                <div class="detail-list mb-3">
                    ${WEEKLY_EXPENSE_FIELDS.map(f => `
                        <div class="detail-row">
                            <span class="detail-label">${escapeHtml(f)}</span>
                            <span class="detail-val">${formatINR(w.items[f])}</span>
                        </div>
                    `).join("")}
                    <div class="detail-row pt-2 border-top">
                        <span class="detail-label text-dark fw-bold">Total ${escapeHtml(w.weekLabel)} Expense</span>
                        <span class="detail-val text-primary fs-6">${formatINR(total)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Weekly Food Service Bill / Receipt</span>
                        <span class="detail-val">${escapeHtml(w.receipt || "Uploaded")}</span>
                    </div>
                </div>
            `);
        });
    });

    moduleContainer.querySelectorAll("[data-exp-receipt]").forEach(btn => {
        btn.addEventListener("click", () => {
            openModal("Expense Bill / Receipt", `
                <div class="detail-list">
                    <div class="detail-row"><span class="detail-label">Expense Head</span><span class="detail-val">${escapeHtml(btn.dataset.expReceipt)}</span></div>
                    <div class="detail-row"><span class="detail-label">Amount</span><span class="detail-val text-primary fw-bold">${formatINR(btn.dataset.expAmt)}</span></div>
                    <div class="detail-row"><span class="detail-label">Recorded By</span><span class="detail-val">${escapeHtml(btn.dataset.expBy)}</span></div>
                    <div class="detail-row"><span class="detail-label">Month</span><span class="detail-val">${escapeHtml(state.selectedMonth)}</span></div>
                    <div class="detail-row"><span class="detail-label">Receipt File</span><span class="detail-val">${escapeHtml(btn.dataset.expFile)}</span></div>
                </div>
            `);
        });
    });
}

function renderAddExpenseForm() {
    const freq = state.addExpenseFreq;
    const fields = freq === "monthly" ? MONTHLY_EXPENSE_FIELDS : freq === "weekly" ? WEEKLY_EXPENSE_FIELDS : DAILY_EXPENSE_FIELDS;

    moduleContainer.innerHTML = `
        <div class="page-header">
            <div class="page-title-wrap">
                <div class="page-icon"><i class="bi bi-plus-circle-fill"></i></div>
                <div><h1>Add / Update Expense</h1><p>Enter ${escapeHtml(freq)} expense data for ${escapeHtml(state.selectedMonth)}.</p></div>
            </div>
            <button type="button" class="btn btn-outline-primary rounded-3" id="backToExpOverviewBtn"><i class="bi bi-arrow-left me-1"></i>Back to Expenses</button>
        </div>

        <div class="panel-card mb-3">
            <div class="btn-group w-100" role="group">
                <button type="button" class="btn ${freq === "monthly" ? "btn-primary" : "btn-outline-primary"}" data-exp-freq="monthly">Monthly Expense</button>
                <button type="button" class="btn ${freq === "weekly" ? "btn-primary" : "btn-outline-primary"}" data-exp-freq="weekly">Weekly Expense</button>
                <button type="button" class="btn ${freq === "daily" ? "btn-primary" : "btn-outline-primary"}" data-exp-freq="daily">Daily Expense (Average)</button>
            </div>
        </div>

        <form id="addExpenseForm" class="panel-card">
            <div class="row g-3 mb-3">
                <div class="col-md-4"><label class="form-label small fw-semibold">Your Name *</label><input name="yourName" class="form-control" value="Dev Gupta" required></div>
                ${freq === "weekly" ? `
                    <div class="col-md-4">
                        <label class="form-label small fw-semibold">Select Week *</label>
                        <select name="weekLabel" class="form-select"><option>Week 1</option><option>Week 2</option><option>Week 3</option><option>Week 4</option></select>
                    </div>
                    <div class="col-md-4"><label class="form-label small fw-semibold">Date Range</label><input name="dateRange" class="form-control" placeholder="e.g. 01 Dec – 07 Dec"></div>
                ` : `
                    <div class="col-md-8"><label class="form-label small fw-semibold">${freq === "monthly" ? "Monthly Bill / Receipt" : "Daily Food Service Bill / Receipt"}</label><input name="receipt" class="form-control" placeholder="bill_receipt.pdf"></div>
                `}
                ${freq === "weekly" ? `<div class="col-md-6"><label class="form-label small fw-semibold">Weekly Food Service Bill / Receipt</label><input name="receipt" class="form-control" placeholder="weekly_bill.jpg"></div>` : ""}
                ${freq === "daily" ? `<div class="col-md-12"><label class="form-label small fw-semibold">Daily Average Note</label><input name="note" class="form-control" value="Average daily operational expense for ${escapeHtml(state.selectedMonth)}."></div>` : ""}
            </div>

            <h6 class="fw-bold text-primary mb-3">Enter Amounts (₹)</h6>
            <div class="row g-3">
                ${fields.map((f, idx) => `
                    <div class="col-sm-6 col-md-4">
                        <label class="form-label small fw-semibold">${escapeHtml(f)}</label>
                        <input type="number" min="0" name="item_${idx}" class="form-control" value="0">
                    </div>
                `).join("")}
            </div>

            <div class="d-flex gap-2 justify-content-end mt-4">
                <button type="button" class="btn btn-light border rounded-3 px-4" id="cancelExpFormBtn">Cancel</button>
                <button type="submit" class="btn btn-primary rounded-3 px-4 fw-semibold"><i class="bi bi-check2-circle me-1"></i>Save Expense</button>
            </div>
        </form>
    `;

    document.getElementById("backToExpOverviewBtn").addEventListener("click", () => switchModule("expense", "overview"));
    document.getElementById("cancelExpFormBtn").addEventListener("click", () => switchModule("expense", "overview"));
    moduleContainer.querySelectorAll("[data-exp-freq]").forEach(btn => {
        btn.addEventListener("click", () => {
            state.addExpenseFreq = btn.dataset.expFreq;
            renderAddExpenseForm();
        });
    });

    document.getElementById("addExpenseForm").addEventListener("submit", e => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const items = {};
        fields.forEach((f, idx) => { items[f] = Number(fd.get("item_" + idx)) || 0; });
        const exp = getMonthData().expenses;

        if (freq === "monthly") {
            exp.monthly = [{
                id: "EXP-M-" + Date.now(),
                yourName: fd.get("yourName").trim(),
                date: formatNowTimestamp().split(",")[0],
                receipt: fd.get("receipt").trim() || "monthly_bill.pdf",
                items
            }];
        } else if (freq === "weekly") {
            const wk = fd.get("weekLabel");
            const rec = {
                id: "EXP-W-" + Date.now(),
                weekLabel: wk,
                dateRange: fd.get("dateRange").trim() || wk,
                yourName: fd.get("yourName").trim(),
                receipt: fd.get("receipt").trim() || "weekly_bill.jpg",
                items
            };
            const existingIdx = exp.weekly.findIndex(w => w.weekLabel === wk);
            if (existingIdx >= 0) exp.weekly[existingIdx] = rec;
            else exp.weekly.push(rec);
        } else {
            exp.dailyAverage = [{
                id: "EXP-D-" + Date.now(),
                yourName: fd.get("yourName").trim(),
                note: fd.get("note").trim(),
                receipt: fd.get("receipt").trim() || "daily_avg.jpg",
                items
            }];
        }
        switchModule("expense", "overview");
    });
}

function renderExpenseHistory() {
    const exp = getMonthData().expenses;
    const rows = [];
    (exp.monthly || []).forEach(r => rows.push({ freq: "Monthly", label: "Monthly Combined Bills", by: r.yourName, total: sumObjectValues(r.items), receipt: r.receipt }));
    (exp.weekly || []).forEach(w => rows.push({ freq: "Weekly", label: `${w.weekLabel} (${w.dateRange})`, by: w.yourName, total: sumObjectValues(w.items), receipt: w.receipt }));
    (exp.dailyAverage || []).forEach(d => rows.push({ freq: "Daily Average", label: "Daily Average Operational", by: d.yourName, total: sumObjectValues(d.items), receipt: d.receipt }));

    moduleContainer.innerHTML = `
        <div class="page-header">
            <div class="page-title-wrap">
                <div class="page-icon"><i class="bi bi-clock-history"></i></div>
                <div><h1>Expense History</h1><p>All recorded Monthly, Weekly, and Daily Average entries for ${escapeHtml(state.selectedMonth)}.</p></div>
            </div>
            <button type="button" class="btn btn-outline-primary rounded-3" id="backFromExpHistory"><i class="bi bi-arrow-left me-1"></i>Expense Overview</button>
        </div>
        <div class="panel-card">
            <div class="table-wrap">
                <div class="table-responsive-custom">
                    <table class="data-table">
                        <thead><tr><th>#</th><th>Frequency</th><th>Description</th><th>Recorded By</th><th class="text-end">Total Amount</th><th>Receipt</th></tr></thead>
                        <tbody>
                            ${rows.length ? rows.map((r, i) => `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td><span class="badge-soft badge-room">${escapeHtml(r.freq)}</span></td>
                                    <td class="fw-semibold">${escapeHtml(r.label)}</td>
                                    <td>${escapeHtml(r.by)}</td>
                                    <td class="text-end fw-bold">${formatINR(r.total)}</td>
                                    <td>${escapeHtml(r.receipt || "—")}</td>
                                </tr>
                            `).join("") : `<tr><td colspan="6" class="empty-cell">No expense history found for ${escapeHtml(state.selectedMonth)}.</td></tr>`}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    document.getElementById("backFromExpHistory").addEventListener("click", () => switchModule("expense", "overview"));
}

/* ==========================================================================
   MODULE 4: MORE HUB, BEDS DETAILS & VISITOR ENQUIRIES
   ========================================================================== */
function renderMoreHub() {
    const data = getMonthData();
    const rooms = (data.beds && data.beds.rooms) || [];
    const totalBeds = rooms.reduce((s, r) => s + r.totalBeds, 0);
    const occBeds = rooms.reduce((s, r) => s + r.occupiedBeds, 0);
    const emptyBeds = Math.max(0, totalBeds - occBeds);
    const occPct = totalBeds ? Math.round((occBeds / totalBeds) * 100) : 0;
    const visitors = data.visitors || [];
    const roomReq = visitors.filter(v => v.roomRequired === "Yes").length;

    moduleContainer.innerHTML = `
        <div class="page-header">
            <div class="page-title-wrap">
                <div class="page-icon"><i class="bi bi-grid-fill"></i></div>
                <div>
                    <h1>More Management Options</h1>
                    <p>Access Beds Details, Visitor Enquiries, and additional reports for ${escapeHtml(state.selectedMonth)}.</p>
                </div>
            </div>
        </div>

        <section class="more-hub-grid">
            <button type="button" class="more-feature-card" id="openBedsDetailsBtn">
                <div class="d-flex justify-content-between align-items-center w-100">
                    <div class="more-feature-icon"><i class="bi bi-building-fill"></i></div>
                    <span class="badge-soft badge-room">${occPct}% Occupied</span>
                </div>
                <div>
                    <h4 class="fw-bold text-dark mb-1">Beds Details</h4>
                    <p class="small text-muted mb-2">View total beds, occupied/empty beds, floor-wise, room-wise &amp; seater-wise occupancy.</p>
                </div>
                <div class="d-flex gap-3 small fw-semibold text-primary mt-auto">
                    <span>Total: ${totalBeds}</span>
                    <span>Occupied: ${occBeds}</span>
                    <span>Empty: ${emptyBeds}</span>
                </div>
            </button>

            <button type="button" class="more-feature-card" id="openVisitorEnquiriesBtn">
                <div class="d-flex justify-content-between align-items-center w-100">
                    <div class="more-feature-icon" style="background:var(--green-100);color:var(--green-600);"><i class="bi bi-people-fill"></i></div>
                    <span class="badge-soft badge-paid">${visitors.length} Visitors</span>
                </div>
                <div>
                    <h4 class="fw-bold text-dark mb-1">Visitor Enquiries</h4>
                    <p class="small text-muted mb-2">Track all visitors, room required status, referral sources, charts and enquiry records.</p>
                </div>
                <div class="d-flex gap-3 small fw-semibold text-success mt-auto">
                    <span>Room Required: ${roomReq}</span>
                    <span>No Room: ${visitors.length - roomReq}</span>
                </div>
            </button>
        </section>
    `;

    document.getElementById("openBedsDetailsBtn").addEventListener("click", () => switchModule("more", "beds"));
    document.getElementById("openVisitorEnquiriesBtn").addEventListener("click", () => switchModule("more", "visitors"));
}

/* ================= BEDS DETAILS DASHBOARD ================= */
function renderBedsModule() {
    const rooms = (getMonthData().beds && getMonthData().beds.rooms) || [];
    const totalBeds = rooms.reduce((s, r) => s + r.totalBeds, 0);
    const occupiedBeds = rooms.reduce((s, r) => s + r.occupiedBeds, 0);
    const emptyBeds = Math.max(0, totalBeds - occupiedBeds);
    const totalStudents = rooms.reduce((s, r) => s + (r.students ? r.students.length : r.occupiedBeds), 0);
    const occPct = totalBeds ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    const floors = ["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor"];
    const seaters = ["1 Seater", "2 Seater", "3 Seater", "4 Seater"];

    const floorStats = floors.map(fl => {
        const list = rooms.filter(r => r.floor === fl);
        const tb = list.reduce((s, r) => s + r.totalBeds, 0);
        const ob = list.reduce((s, r) => s + r.occupiedBeds, 0);
        return { floor: fl, rooms: list.length, totalBeds: tb, occupied: ob, empty: tb - ob, pct: tb ? Math.round((ob / tb) * 100) : 0 };
    });

    const seaterStats = seaters.map(st => {
        const list = rooms.filter(r => r.roomType === st);
        const tb = list.reduce((s, r) => s + r.totalBeds, 0);
        const ob = list.reduce((s, r) => s + r.occupiedBeds, 0);
        return { seater: st, rooms: list.length, totalBeds: tb, occupied: ob, empty: tb - ob };
    });

    const q = state.bedsSearch.trim().toLowerCase();
    const filteredRooms = rooms.filter(r => {
        const status = r.occupiedBeds === 0 ? "Empty" : r.occupiedBeds >= r.totalBeds ? "Full" : "Partial";
        const matchQ = !q || r.roomNumber.toLowerCase().includes(q) || r.floor.toLowerCase().includes(q) ||
            (r.students || []).some(st => st.toLowerCase().includes(q));
        const matchFloor = !state.bedsFloorFilter || r.floor === state.bedsFloorFilter;
        const matchSeater = !state.bedsSeaterFilter || r.roomType === state.bedsSeaterFilter;
        const matchStatus = !state.bedsStatusFilter || status === state.bedsStatusFilter;
        return matchQ && matchFloor && matchSeater && matchStatus;
    });

    moduleContainer.innerHTML = `
        <div class="page-header">
            <div class="page-title-wrap">
                <div class="page-icon"><i class="bi bi-building-fill"></i></div>
                <div>
                    <h1>Beds Details Dashboard</h1>
                    <p>Floor-wise, room-wise &amp; seater-wise bed availability for ${escapeHtml(state.selectedMonth)}.</p>
                </div>
            </div>
            <button type="button" class="btn btn-outline-primary rounded-3" id="backToMoreFromBeds"><i class="bi bi-arrow-left me-1"></i>Back to More</button>
        </div>

        <section class="kpi-grid">
            <article class="kpi-card highlight">
                <div class="kpi-icon"><i class="bi bi-grid-3x3-gap-fill"></i></div>
                <div class="kpi-meta"><div class="kpi-label">Total Beds</div><div class="kpi-value">${totalBeds}</div></div>
            </article>
            <article class="kpi-card">
                <div class="kpi-icon purple"><i class="bi bi-people-fill"></i></div>
                <div class="kpi-meta"><div class="kpi-label">Total Students</div><div class="kpi-value">${totalStudents}</div></div>
            </article>
            <article class="kpi-card">
                <div class="kpi-icon green"><i class="bi bi-person-check-fill"></i></div>
                <div class="kpi-meta"><div class="kpi-label">Occupied Beds</div><div class="kpi-value">${occupiedBeds}</div></div>
            </article>
            <article class="kpi-card">
                <div class="kpi-icon amber"><i class="bi bi-door-open-fill"></i></div>
                <div class="kpi-meta"><div class="kpi-label">Empty Beds</div><div class="kpi-value">${emptyBeds}</div></div>
            </article>
            <article class="kpi-card">
                <div class="kpi-icon"><i class="bi bi-pie-chart-fill"></i></div>
                <div class="kpi-meta"><div class="kpi-label">Occupancy %</div><div class="kpi-value">${occPct}%</div></div>
            </article>
        </section>

        <!-- Floor-wise Summary -->
        <section class="panel-card mb-3">
            <div class="panel-header">
                <h3 class="panel-title"><i class="bi bi-layers-fill"></i> Floor-wise Summary</h3>
                <span class="small text-muted">Click a floor to filter rooms</span>
            </div>
            <div class="floor-grid">
                ${floorStats.map(f => `
                    <div class="stat-tile ${state.bedsFloorFilter === f.floor ? "active-filter" : ""}" data-filter-floor="${escapeHtml(f.floor)}">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <strong class="small">${escapeHtml(f.floor)}</strong>
                            <span class="badge-soft badge-room">${f.pct}%</span>
                        </div>
                        <div class="small text-muted mb-2">${f.rooms} Rooms &bull; ${f.totalBeds} Beds</div>
                        <div class="h-bar-track mb-2"><div class="h-bar-fill" style="width:${f.pct}%"></div></div>
                        <div class="d-flex justify-content-between small fw-semibold">
                            <span class="text-success">Occ: ${f.occupied}</span>
                            <span class="text-warning">Empty: ${f.empty}</span>
                        </div>
                    </div>
                `).join("")}
            </div>
        </section>

        <!-- Seater-wise Summary -->
        <section class="panel-card mb-3">
            <div class="panel-header">
                <h3 class="panel-title"><i class="bi bi-door-closed-fill"></i> Seater-wise Summary</h3>
                <span class="small text-muted">Click a seater type to filter</span>
            </div>
            <div class="seater-grid">
                ${seaterStats.map(s => `
                    <div class="stat-tile ${state.bedsSeaterFilter === s.seater ? "active-filter" : ""}" data-filter-seater="${escapeHtml(s.seater)}">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <strong class="small">${escapeHtml(s.seater)}</strong>
                            <span class="badge-soft badge-student">${s.rooms} Rooms</span>
                        </div>
                        <div class="small text-muted">Total Beds: <strong>${s.totalBeds}</strong></div>
                        <div class="d-flex justify-content-between small fw-semibold mt-1">
                            <span class="text-primary">Occupied: ${s.occupied}</span>
                            <span class="text-danger">Empty: ${s.empty}</span>
                        </div>
                    </div>
                `).join("")}
            </div>
        </section>

        <!-- Room-wise Filter & Table -->
        <section class="filter-card">
            <div class="search-box">
                <i class="bi bi-search"></i>
                <input type="search" id="bedsSearchInput" value="${escapeHtml(state.bedsSearch)}" placeholder="Search by room number, floor, or student name...">
            </div>
            <select id="bedsFloorFilter" class="filter-select">
                <option value="">All Floors</option>
                ${floors.map(f => `<option value="${f}" ${state.bedsFloorFilter === f ? "selected" : ""}>${f}</option>`).join("")}
            </select>
            <select id="bedsSeaterFilter" class="filter-select">
                <option value="">All Seaters</option>
                ${seaters.map(s => `<option value="${s}" ${state.bedsSeaterFilter === s ? "selected" : ""}>${s}</option>`).join("")}
            </select>
            <select id="bedsStatusFilter" class="filter-select">
                <option value="">All Status</option>
                <option value="Full" ${state.bedsStatusFilter === "Full" ? "selected" : ""}>Full</option>
                <option value="Partial" ${state.bedsStatusFilter === "Partial" ? "selected" : ""}>Partial</option>
                <option value="Empty" ${state.bedsStatusFilter === "Empty" ? "selected" : ""}>Empty</option>
            </select>
            <button type="button" class="btn-reset" id="bedsResetBtn"><i class="bi bi-arrow-clockwise"></i> Reset</button>
        </section>

        <div class="panel-card">
            <h3 class="panel-title mb-3"><i class="bi bi-table"></i> Room-wise Beds Data (${escapeHtml(state.selectedMonth)})</h3>
            <div class="table-wrap desktop-only-table">
                <div class="table-responsive-custom">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Room No.</th>
                                <th>Floor</th>
                                <th>Room Type</th>
                                <th>Total Beds</th>
                                <th>Occupied</th>
                                <th>Empty</th>
                                <th>Status</th>
                                <th>Beds Visual</th>
                                <th>Students</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredRooms.length ? filteredRooms.map(r => {
                                const emp = Math.max(0, r.totalBeds - r.occupiedBeds);
                                const status = r.occupiedBeds === 0 ? "Empty" : emp === 0 ? "Full" : "Partial";
                                const badgeCls = status === "Full" ? "badge-paid" : status === "Partial" ? "badge-partial" : "badge-pending";
                                const dots = Array.from({ length: r.totalBeds }, (_, i) => `<span class="bed-dot ${i < r.occupiedBeds ? "occ" : "emp"}"></span>`).join("");
                                return `
                                    <tr>
                                        <td class="fw-bold">${escapeHtml(r.roomNumber)}</td>
                                        <td>${escapeHtml(r.floor)}</td>
                                        <td><span class="badge-soft badge-room">${escapeHtml(r.roomType)}</span></td>
                                        <td class="fw-semibold">${r.totalBeds}</td>
                                        <td class="text-success fw-bold">${r.occupiedBeds}</td>
                                        <td class="text-danger fw-bold">${emp}</td>
                                        <td><span class="badge-soft ${badgeCls}">${status}</span></td>
                                        <td><div class="bed-dots">${dots}</div></td>
                                        <td class="small">${r.students && r.students.length ? escapeHtml(r.students.join(", ")) : '<span class="text-muted">Vacant</span>'}</td>
                                    </tr>
                                `;
                            }).join("") : `<tr><td colspan="9" class="empty-cell">No room/bed data found for ${escapeHtml(state.selectedMonth)}.</td></tr>`}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Mobile Room Cards -->
            <div class="mobile-cards-list">
                ${filteredRooms.length ? filteredRooms.map(r => {
                    const emp = Math.max(0, r.totalBeds - r.occupiedBeds);
                    const status = r.occupiedBeds === 0 ? "Empty" : emp === 0 ? "Full" : "Partial";
                    const badgeCls = status === "Full" ? "badge-paid" : status === "Partial" ? "badge-partial" : "badge-pending";
                    return `
                        <div class="mobile-record-card">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <strong>${escapeHtml(r.roomNumber)} &bull; ${escapeHtml(r.roomType)}</strong>
                                <span class="badge-soft ${badgeCls}">${status}</span>
                            </div>
                            <div class="small text-muted mb-1">${escapeHtml(r.floor)} &bull; Total: ${r.totalBeds} | Occ: ${r.occupiedBeds} | Empty: ${emp}</div>
                            <div class="small"><strong>Students:</strong> ${r.students && r.students.length ? escapeHtml(r.students.join(", ")) : "Vacant"}</div>
                        </div>
                    `;
                }).join("") : `<div class="text-center text-muted py-4">No room/bed data found for ${escapeHtml(state.selectedMonth)}.</div>`}
            </div>
        </div>
    `;

    // Bind events
    document.getElementById("backToMoreFromBeds").addEventListener("click", () => switchModule("more", "hub"));
    document.getElementById("bedsSearchInput").addEventListener("input", e => { state.bedsSearch = e.target.value; renderBedsModule(); });
    document.getElementById("bedsFloorFilter").addEventListener("change", e => { state.bedsFloorFilter = e.target.value; renderBedsModule(); });
    document.getElementById("bedsSeaterFilter").addEventListener("change", e => { state.bedsSeaterFilter = e.target.value; renderBedsModule(); });
    document.getElementById("bedsStatusFilter").addEventListener("change", e => { state.bedsStatusFilter = e.target.value; renderBedsModule(); });
    document.getElementById("bedsResetBtn").addEventListener("click", () => {
        state.bedsSearch = ""; state.bedsFloorFilter = ""; state.bedsSeaterFilter = ""; state.bedsStatusFilter = "";
        renderBedsModule();
    });

    moduleContainer.querySelectorAll("[data-filter-floor]").forEach(tile => {
        tile.addEventListener("click", () => {
            state.bedsFloorFilter = state.bedsFloorFilter === tile.dataset.filterFloor ? "" : tile.dataset.filterFloor;
            renderBedsModule();
        });
    });
    moduleContainer.querySelectorAll("[data-filter-seater]").forEach(tile => {
        tile.addEventListener("click", () => {
            state.bedsSeaterFilter = state.bedsSeaterFilter === tile.dataset.filterSeater ? "" : tile.dataset.filterSeater;
            renderBedsModule();
        });
    });
}

/* ================= VISITOR ENQUIRIES (PRESERVED & UPDATED) ================= */
function renderVisitorsModule() {
    const records = getMonthData().visitors || [];
    const yesCount = records.filter(r => r.roomRequired === "Yes").length;
    const noCount = records.filter(r => r.roomRequired === "No").length;
    const total = records.length;
    const yesPct = total ? Math.round((yesCount / total) * 100) : 0;
    const noPct = total ? 100 - yesPct : 0;

    const sources = [...new Set(records.map(r => r.source))].sort();
    const q = state.visitorSearch.trim().toLowerCase();
    const filtered = records.filter(r => {
        const matchQ = !q || r.fullName.toLowerCase().includes(q) || r.mobileNumber.includes(q);
        const matchRoom = !state.visitorRoomFilter || r.roomRequired === state.visitorRoomFilter;
        const matchSrc = !state.visitorSourceFilter || r.source === state.visitorSourceFilter;
        return matchQ && matchRoom && matchSrc;
    });

    const PAGE_SIZE = 5;
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (state.visitorPage > totalPages) state.visitorPage = totalPages;
    const start = (state.visitorPage - 1) * PAGE_SIZE;
    const pageRecords = filtered.slice(start, start + PAGE_SIZE);

    const chartMonths = AVAILABLE_MONTHS.slice(0, 3);
    const maxVisitors = Math.max(1, ...chartMonths.map(m => (getMonthData(m).visitors || []).length));

    moduleContainer.innerHTML = `
        <div class="page-header">
            <div class="page-title-wrap">
                <div class="page-icon"><i class="bi bi-people-fill"></i></div>
                <div>
                    <h1>Visitor Enquiries Report</h1>
                    <p>Track all visitors &amp; room enquiries month-wise.</p>
                </div>
            </div>
            <button type="button" class="btn btn-outline-primary rounded-3" id="backToMoreFromVisitors"><i class="bi bi-arrow-left me-1"></i>Back to More</button>
        </div>

        <section class="kpi-grid cols-4">
            <article class="kpi-card highlight">
                <div class="kpi-icon"><i class="bi bi-people-fill"></i></div>
                <div class="kpi-meta"><div class="kpi-label">Total Visitors</div><div class="kpi-value">${total}</div></div>
            </article>
            <article class="kpi-card">
                <div class="kpi-icon green"><i class="bi bi-check-circle-fill"></i></div>
                <div class="kpi-meta"><div class="kpi-label">Room Required</div><div class="kpi-value">${yesCount}</div></div>
            </article>
            <article class="kpi-card">
                <div class="kpi-icon red"><i class="bi bi-x-circle-fill"></i></div>
                <div class="kpi-meta"><div class="kpi-label">No Room Required</div><div class="kpi-value">${noCount}</div></div>
            </article>
            <article class="kpi-card">
                <div class="kpi-icon"><i class="bi bi-calendar3"></i></div>
                <div class="kpi-meta"><div class="kpi-label">Selected Month</div><div class="kpi-value month-val">${escapeHtml(state.selectedMonth)}</div></div>
            </article>
        </section>

        <section class="analytics-grid mb-3">
            <article class="panel-card">
                <h3 class="panel-title mb-2"><i class="bi bi-bar-chart-fill"></i> Month-wise Visitors</h3>
                <div class="v-bar-chart">
                    ${chartMonths.map(m => {
                        const c = (getMonthData(m).visitors || []).length;
                        const h = c ? Math.max(18, Math.round((c / maxVisitors) * 115)) : 4;
                        const shortLbl = m.split(" ")[0].slice(0, 3) + " " + m.split(" ")[1];
                        return `
                            <div class="v-bar-col">
                                <div class="v-bar-val">${c}</div>
                                <div class="v-bar" style="height:${h}px"></div>
                                <div class="v-bar-lbl">${shortLbl}</div>
                            </div>
                        `;
                    }).join("")}
                </div>
            </article>

            <article class="panel-card">
                <h3 class="panel-title mb-2"><i class="bi bi-pie-chart-fill"></i> Visitor Status (${escapeHtml(state.selectedMonth)})</h3>
                <div class="donut-layout">
                    <div class="donut-chart" style="background: conic-gradient(#22c55e 0 ${yesPct}%, #ef4444 ${yesPct}% 100%);">
                        <div class="donut-center">
                            <strong>${total}</strong>
                            <span>Visitors</span>
                        </div>
                    </div>
                    <div class="chart-legend">
                        <div class="legend-item"><span class="legend-dot" style="background:#22c55e;"></span>Room Required: <strong>${yesCount}</strong> (${yesPct}%)</div>
                        <div class="legend-item"><span class="legend-dot" style="background:#ef4444;"></span>No Room Required: <strong>${noCount}</strong> (${noPct}%)</div>
                    </div>
                </div>
            </article>
        </section>

        <section class="filter-card">
            <div class="search-box">
                <i class="bi bi-search"></i>
                <input type="search" id="visitorSearchInput" value="${escapeHtml(state.visitorSearch)}" placeholder="Search by name or mobile...">
            </div>
            <select id="visitorRoomFilter" class="filter-select">
                <option value="">Room Required</option>
                <option value="Yes" ${state.visitorRoomFilter === "Yes" ? "selected" : ""}>Yes</option>
                <option value="No" ${state.visitorRoomFilter === "No" ? "selected" : ""}>No</option>
            </select>
            <select id="visitorSourceFilter" class="filter-select">
                <option value="">Source (How did you hear)</option>
                ${sources.map(s => `<option value="${escapeHtml(s)}" ${state.visitorSourceFilter === s ? "selected" : ""}>${escapeHtml(s)}</option>`).join("")}
            </select>
            <button type="button" class="btn-reset" id="visitorResetBtn"><i class="bi bi-arrow-clockwise"></i> Reset</button>
        </section>

        <div class="panel-card">
            <div class="table-wrap desktop-only-table">
                <div class="table-responsive-custom">
                    <table class="data-table">
                        <thead>
                            <tr><th>#</th><th>Timestamp</th><th>Full Name</th><th>Mobile Number</th><th>Room Required</th><th>How did you hear about us</th></tr>
                        </thead>
                        <tbody>
                            ${pageRecords.length ? pageRecords.map((v, idx) => `
                                <tr>
                                    <td>${start + idx + 1}</td>
                                    <td class="small text-nowrap">${escapeHtml(v.timestamp)}</td>
                                    <td class="fw-semibold">${escapeHtml(v.fullName)}</td>
                                    <td>${escapeHtml(v.mobileNumber)}</td>
                                    <td><span class="badge-soft ${v.roomRequired === "Yes" ? "badge-paid" : "badge-pending"}">${escapeHtml(v.roomRequired)}</span></td>
                                    <td>${escapeHtml(v.source)}</td>
                                </tr>
                            `).join("") : `<tr><td colspan="6" class="empty-cell">No visitor records found for ${escapeHtml(state.selectedMonth)}.</td></tr>`}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="mobile-cards-list">
                ${pageRecords.length ? pageRecords.map(v => `
                    <div class="mobile-record-card">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <div class="fw-bold">${escapeHtml(v.fullName)}</div>
                                <div class="small text-muted"><i class="bi bi-telephone me-1"></i>${escapeHtml(v.mobileNumber)} &bull; ${escapeHtml(v.source)}</div>
                                <div class="small text-muted">${escapeHtml(v.timestamp)}</div>
                            </div>
                            <span class="badge-soft ${v.roomRequired === "Yes" ? "badge-paid" : "badge-pending"}">Room: ${escapeHtml(v.roomRequired)}</span>
                        </div>
                    </div>
                `).join("") : `<div class="text-center text-muted py-4">No visitor records found for ${escapeHtml(state.selectedMonth)}.</div>`}
            </div>

            <div class="pagination-bar">
                <div>Showing ${filtered.length ? start + 1 : 0} – ${Math.min(start + PAGE_SIZE, filtered.length)} of ${filtered.length} entries</div>
                <div class="pagination-controls" id="visitorPagination"></div>
            </div>
        </div>
    `;

    document.getElementById("backToMoreFromVisitors").addEventListener("click", () => switchModule("more", "hub"));
    document.getElementById("visitorSearchInput").addEventListener("input", e => { state.visitorSearch = e.target.value; state.visitorPage = 1; renderVisitorsModule(); });
    document.getElementById("visitorRoomFilter").addEventListener("change", e => { state.visitorRoomFilter = e.target.value; state.visitorPage = 1; renderVisitorsModule(); });
    document.getElementById("visitorSourceFilter").addEventListener("change", e => { state.visitorSourceFilter = e.target.value; state.visitorPage = 1; renderVisitorsModule(); });
    document.getElementById("visitorResetBtn").addEventListener("click", () => {
        state.visitorSearch = ""; state.visitorRoomFilter = ""; state.visitorSourceFilter = ""; state.visitorPage = 1;
        renderVisitorsModule();
    });

    buildPaginationButtons(
        document.getElementById("visitorPagination"),
        state.visitorPage,
        totalPages,
        page => { state.visitorPage = page; renderVisitorsModule(); }
    );
}

/* ================= SHARED PAGINATION BUILDER ================= */
function buildPaginationButtons(container, currentPage, totalPages, onPageChange) {
    if (!container) return;
    container.innerHTML = "";

    const makeBtn = (label, disabled, active, handler) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "page-btn" + (active ? " active" : "");
        b.textContent = label;
        b.disabled = disabled;
        b.addEventListener("click", handler);
        return b;
    };

    container.appendChild(makeBtn("‹ Prev", currentPage <= 1, false, () => onPageChange(currentPage - 1)));
    for (let p = 1; p <= totalPages; p++) {
        container.appendChild(makeBtn(String(p), false, p === currentPage, () => onPageChange(p)));
    }
    container.appendChild(makeBtn("Next ›", currentPage >= totalPages, false, () => onPageChange(currentPage + 1)));
}

/* ================= EVENT BINDINGS & INIT ================= */
loginForm.addEventListener("submit", event => {
    event.preventDefault();
    if (passwordInput.value === ADMIN_PASSWORD) {
        const loginTime = Date.now();
        localStorage.setItem(LOGIN_STATUS_KEY, "true");
        localStorage.setItem(LOGIN_TIME_KEY, String(loginTime));
        loginError.textContent = "";
        showMainArea();
        startSessionTimer(loginTime);
    } else {
        loginError.textContent = "Incorrect password. Please try again.";
        passwordInput.value = "";
        passwordInput.focus();
    }
});

logoutButton.addEventListener("click", logoutAdmin);

menuButton.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    sidebarBackdrop.classList.toggle("show");
});

sidebarBackdrop.addEventListener("click", closeSidebarDrawer);

mobileBottomNav.querySelectorAll(".bottom-nav-btn").forEach(btn => {
    btn.addEventListener("click", () => switchModule(btn.dataset.module));
});

document.addEventListener("DOMContentLoaded", () => {
    initMonthSelectors();
    checkExistingSession();
});
