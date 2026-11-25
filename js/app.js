const ADMIN_PASSWORD = "admin123";
const SESSION_DURATION = 2 * 60 * 1000;
const LOGIN_STATUS_KEY = "eliteStayAdminLoggedIn";
const LOGIN_TIME_KEY = "eliteStayAdminLoginTime";
const SELECTED_MONTH_KEY = "eliteStaySelectedMonth";

const months = [
    "December 2026", "January 2027", "February 2027", "March 2027", "April 2027",
    "May 2027", "June 2027", "July 2027", "August 2027", "September 2027",
    "October 2027", "November 2027", "December 2027"
];

const monthlyData = buildMonthlyData();
const state = {
    module: "profile",
    profileView: "all",
    paymentView: "all",
    expenseView: "overview",
    moreView: "more",
    profilePage: 1,
    paymentPage: 1,
    visitorPage: 1,
    selectedProfileId: null
};

const PAGE_SIZE = 5;
let selectedMonth = localStorage.getItem(SELECTED_MONTH_KEY) || months[0];
let logoutTimer = null;

const loginPage = document.getElementById("loginPage");
const mainArea = document.getElementById("mainArea");
const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");
const monthSelect = document.getElementById("monthSelect");
const sideNav = document.getElementById("sideNav");
const moduleNav = document.getElementById("moduleNav");
const moduleContent = document.getElementById("moduleContent");
const mobileBottomNav = document.getElementById("mobileBottomNav");
const sidebar = document.getElementById("sidebar");
const menuButton = document.getElementById("menuButton");
const adminButton = document.getElementById("adminButton");
const adminMenu = document.getElementById("adminMenu");
const logoutButton = document.getElementById("logoutButton");
const notificationButton = document.getElementById("notificationButton");
const notificationPanel = document.getElementById("notificationPanel");

months.forEach(month => {
    const option = document.createElement("option");
    option.value = month;
    option.textContent = month;
    monthSelect.appendChild(option);
});
selectedMonth = months.includes(selectedMonth) ? selectedMonth : months[0];
monthSelect.value = selectedMonth;

const sidebarMenus = {
    profile: [
        ["all", "All Profiles", "bi-people"],
        ["add", "Add Profile", "bi-person-plus"],
        ["update", "Update Profile", "bi-pencil-square"]
    ],
    payment: [
        ["all", "All Payments", "bi-credit-card"],
        ["add", "Add Payment", "bi-plus-circle"],
        ["history", "Payment History", "bi-clock-history"],
        ["pending", "Pending Payments", "bi-hourglass-split"]
    ],
    expense: [
        ["overview", "Expense Overview", "bi-grid"],
        ["monthly", "Monthly Expense", "bi-calendar3"],
        ["weekly", "Weekly Expense", "bi-calendar-week"],
        ["daily", "Daily Expense (Avg)", "bi-calendar-day"],
        ["add", "Add Expense", "bi-plus-circle"],
        ["history", "Expense History", "bi-clock-history"]
    ],
    more: [
        ["more", "More", "bi-grid"],
        ["reports", "Reports", "bi-bar-chart"],
        ["rooms", "Room Management", "bi-door-open"],
        ["beds", "Beds Details", "bi-bed"],
        ["visitors", "Visitor Enquiries", "bi-megaphone"],
        ["notice", "Notice & Updates", "bi-megaphone-fill"],
        ["documents", "Documents", "bi-file-earmark-text"],
        ["tasks", "Tasks / Reminder", "bi-calendar-check"],
        ["backup", "Data Backup", "bi-database"],
        ["settings", "Settings", "bi-gear"]
    ]
};

function buildMonthlyData() {
    const data = {};
    months.forEach(month => {
        data[month] = {
            profiles: [],
            payments: [],
            expenses: { monthly: [], weekly: [], dailyAverage: [], otherBills: [] },
            visitors: [],
            beds: createEmptyBeds(),
            reports: [],
            rooms: [],
            notices: [],
            documents: [],
            tasks: []
        };
    });

    data["December 2026"].profiles = [
        profile("p1", "02 Dec 2026, 10:24 AM", "amanverma@gmail.com", "Student", "Aman Verma", "9876543210", "GL Bajaj Institute of Technology", "BCA", "2nd Year", "Rajesh Verma", "9812345678", "Sector 62, Noida, Uttar Pradesh", "05 Dec 2026", "08 Dec 2026", "A-101", "2 Seater", 5000, 1000, 7000, 8000, "UPI", "receipt_dec2026.pdf"),
        profile("p2", "05 Dec 2026, 03:18 PM", "priyasharma@gmail.com", "Student", "Priya Sharma", "9988776655", "GL Bajaj Institute of Technology", "BCA", "2nd Year", "Mahesh Sharma", "9898989898", "Indirapuram, Ghaziabad, Uttar Pradesh", "05 Dec 2026", "08 Dec 2026", "A-102", "3 Seater", 5000, 1000, 8000, 8000, "Online", "receipt_dec2026_2.pdf"),
        profile("p3", "28 Dec 2026, 11:07 AM", "rohit.singh@gmail.com", "Employee", "Rohit Singh", "9123456780", "", "", "", "Suresh Singh", "9000000000", "Noida, Uttar Pradesh", "28 Dec 2026", "01 Jan 2027", "B-201", "1 Seater", 3000, 0, 10000, 5000, "Cash", "receipt_dec2026_3.pdf")
    ];

    data["December 2026"].payments = [
        payment("pay1", "02 Dec 2026, 10:24 AM", "amanverma@gmail.com", "Student", "Aman Verma", "9876543210", "A-101", "2 Seater", "December 2026", 7000, "Monthly Rent", 7000, "02 Dec 2026", "UPI", "receipt_dec2026.pdf", "5"),
        payment("pay2", "05 Dec 2026, 03:18 PM", "priyasharma@gmail.com", "Student", "Priya Sharma", "9988776655", "A-102", "3 Seater", "December 2026", 8000, "Booking Amount", 5000, "05 Dec 2026", "Online", "receipt_dec2026_2.pdf", "5"),
        payment("pay3", "28 Dec 2026, 11:07 AM", "rohit.singh@gmail.com", "Employee", "Rohit Singh", "9123456780", "B-201", "1 Seater", "December 2026", 10000, "Monthly Rent", 3000, "28 Dec 2026", "Cash", "receipt_dec2026_3.pdf", "4")
    ];

    data["December 2026"].expenses = {
        monthly: [{
            yourName: "Dev Gupta", propertyRent: 85000, electricity: 12500, water: 2800, internet: 1200,
            workerSalary: 15000, ration: 18000, gas: 3200, cleaning: 2000, furniture: 5000,
            security: 4500, license: 3000, foodService: 28000, other: 4800, receipt: "monthly_dec2026.pdf"
        }],
        weekly: [
            { yourName: "Dev Gupta", week: "Week 1", dateRange: "01 Dec – 07 Dec", vegetables: 2000, grocery: 2500, cleaning: 500, transport: 1000, other: 1000, receipt: "weekly_1_dec2026.pdf" },
            { yourName: "Dev Gupta", week: "Week 2", dateRange: "08 Dec – 14 Dec", vegetables: 2000, grocery: 3500, cleaning: 700, transport: 1000, other: 1000, receipt: "weekly_2_dec2026.pdf" },
            { yourName: "Dev Gupta", week: "Week 3", dateRange: "15 Dec – 21 Dec", vegetables: 2500, grocery: 4500, cleaning: 400, transport: 1000, other: 1100, receipt: "weekly_3_dec2026.pdf" },
            { yourName: "Dev Gupta", week: "Week 4", dateRange: "22 Dec – 28 Dec", vegetables: 1500, grocery: 4500, cleaning: 400, transport: 1000, other: 1000, receipt: "weekly_4_dec2026.pdf" }
        ],
        dailyAverage: [{ yourName: "Dev Gupta", petrol: 2000, milk: 1500, freshVegetables: 3000, repair: 1000, labour: 1500, cleaning: 1000, other: 1000, receipt: "daily_dec2026.pdf" }],
        otherBills: [{ head: "Other Bills", amount: 0, receipt: "" }]
    };

    data["December 2026"].visitors = [
        { timestamp: "01 Dec 2026, 10:24 AM", fullName: "Aman Verma", mobileNumber: "9876543210", roomRequired: "Yes", source: "Google" },
        { timestamp: "02 Dec 2026, 11:05 AM", fullName: "Rahul Singh", mobileNumber: "9123456780", roomRequired: "Yes", source: "Instagram" },
        { timestamp: "03 Dec 2026, 02:18 PM", fullName: "Priya Sharma", mobileNumber: "9988776655", roomRequired: "No", source: "Friend / Reference" },
        { timestamp: "04 Dec 2026, 04:30 PM", fullName: "Nikita Gupta", mobileNumber: "9876501234", roomRequired: "Yes", source: "Google" },
        { timestamp: "05 Dec 2026, 12:10 PM", fullName: "Rohit Kumar", mobileNumber: "9012345678", roomRequired: "No", source: "Other" }
    ];

    data["December 2026"].beds = createBedsData();
    data["January 2027"].beds = createBedsData(120, 106);
    return data;
}

function profile(id, timestamp, email, type, fullName, mobile, college, course, year, guardian, guardianMobile, address, bookingDate, shiftingDate, room, roomType, bookingAmount, registrationFee, rent, deposit, paymentMode, receipt) {
    return { id, timestamp, email, type, fullName, mobile, college, course, year, guardian, guardianMobile, address, bookingDate, shiftingDate, room, roomType, bookingAmount, registrationFee, rent, deposit, paymentMode, receipt, aadhaarFront: "aadhaar_front.jpg", aadhaarBack: "aadhaar_back.jpg", yourId: "college_id.jpg", companyName: type === "Employee" ? "The Elite Stay" : "", companyAddress: type === "Employee" ? "Noida, Uttar Pradesh" : "" };
}

function payment(id, timestamp, email, type, fullName, mobile, room, roomType, feeMonth, monthlyRent, amountType, amountPaid, paymentDate, mode, receipt, rating) {
    return { id, timestamp, email, type, fullName, mobile, room, roomType, feeMonth, monthlyRent, amountType, amountPaid, paymentDate, mode, receipt, rating, status: amountPaid >= monthlyRent ? "Paid" : "Pending" };
}

function createEmptyBeds() {
    return { totalBeds: 0, totalStudents: 0, floors: [], rooms: [], seaters: { "1 Seater": 0, "2 Seater": 0, "3 Seater": 0, "4 Seater": 0 }, occupancyTrend: [] };
}

function createBedsData(totalBeds = 120, occupied = 104) {
    const floors = [
        { floor: "Ground Floor", totalBeds: 30, occupied: 26, empty: 4 },
        { floor: "1st Floor", totalBeds: 30, occupied: 27, empty: 3 },
        { floor: "2nd Floor", totalBeds: 30, occupied: 25, empty: 5 },
        { floor: "3rd Floor", totalBeds: 30, occupied: 26, empty: 4 }
    ];
    const rooms = [
        { room: "A-101", floor: "Ground", roomType: "2 Seater", totalBeds: 2, occupied: 2, empty: 0, students: "Aman Verma, Rahul Singh" },
        { room: "A-102", floor: "Ground", roomType: "3 Seater", totalBeds: 3, occupied: 3, empty: 0, students: "Priya Sharma, Nikita Gupta, Rohit Kumar" },
        { room: "B-201", floor: "1st", roomType: "4 Seater", totalBeds: 4, occupied: 3, empty: 1, students: "Ankit Yadav, Saurabh, Vivek" },
        { room: "B-202", floor: "1st", roomType: "2 Seater", totalBeds: 2, occupied: 1, empty: 1, students: "Neha" },
        { room: "C-301", floor: "2nd", roomType: "1 Seater", totalBeds: 1, occupied: 1, empty: 0, students: "Rohit Singh" }
    ];
    return { totalBeds, totalStudents: occupied, floors, rooms, seaters: { "1 Seater": 10, "2 Seater": 24, "3 Seater": 36, "4 Seater": 50 }, occupancyTrend: [{ month: "Dec 2026", percent: 86.7 }, { month: "Jan 2027", percent: totalBeds ? Math.round((occupied / totalBeds) * 1000) / 10 : 0 }] };
}

function getMonthData() { return monthlyData[selectedMonth]; }
function money(value) { return `₹${Number(value || 0).toLocaleString("en-IN")}`; }
function escapeHtml(value) { return String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char])); }
function totalExpenseRecord(record) { return Object.keys(record).reduce((sum, key) => typeof record[key] === "number" ? sum + record[key] : sum, 0); }
function getMonthlyExpenseTotal() { return getMonthData().expenses.monthly.reduce((sum, r) => sum + totalExpenseRecord(r), 0); }
function getWeeklyExpenseTotal() { return getMonthData().expenses.weekly.reduce((sum, r) => sum + totalExpenseRecord(r), 0); }
function getDailyExpenseTotal() { return getMonthData().expenses.dailyAverage.reduce((sum, r) => sum + totalExpenseRecord(r), 0); }
function getOtherBillsTotal() { return getMonthData().expenses.otherBills.reduce((sum, r) => sum + Number(r.amount || 0), 0); }
function getTotalExpense() { return getMonthlyExpenseTotal() + getWeeklyExpenseTotal() + getDailyExpenseTotal() + getOtherBillsTotal(); }
function getPaymentTotal() { return getMonthData().payments.reduce((sum, r) => sum + Number(r.amountPaid || 0), 0); }
function getPaymentPending() { return getMonthData().payments.reduce((sum, r) => sum + Math.max(0, Number(r.monthlyRent || 0) - Number(r.amountPaid || 0)), 0); }

function checkExistingSession() {
    const isLoggedIn = localStorage.getItem(LOGIN_STATUS_KEY);
    const loginTime = Number(localStorage.getItem(LOGIN_TIME_KEY));
    if (isLoggedIn !== "true" || !loginTime) return showLoginPage();
    if (Date.now() - loginTime >= SESSION_DURATION) return logoutAdmin();
    showMainArea();
    startSessionTimer(loginTime);
}

function startSessionTimer(loginTime) {
    if (logoutTimer) clearTimeout(logoutTimer);
    const remaining = SESSION_DURATION - (Date.now() - loginTime);
    if (remaining <= 0) return logoutAdmin();
    logoutTimer = setTimeout(logoutAdmin, remaining);
}

function showMainArea() {
    loginPage.classList.add("d-none");
    mainArea.classList.remove("d-none");
    mobileBottomNav.classList.remove("d-none");
    mainArea.setAttribute("aria-hidden", "false");
    renderApp();
}

function showLoginPage() {
    mainArea.classList.add("d-none");
    mobileBottomNav.classList.add("d-none");
    mainArea.setAttribute("aria-hidden", "true");
    loginPage.classList.remove("d-none");
}

function logoutAdmin() {
    if (logoutTimer) clearTimeout(logoutTimer);
    logoutTimer = null;
    localStorage.removeItem(LOGIN_STATUS_KEY);
    localStorage.removeItem(LOGIN_TIME_KEY);
    showLoginPage();
    loginForm.reset();
    loginError.textContent = "";
}

function renderApp() {
    monthSelect.value = selectedMonth;
    renderSidebar();
    renderModule();
    updateMobileNav();
}

function renderSidebar() {
    moduleNav.innerHTML = [
        ["profile", "Profile", "bi-person-fill"],
        ["payment", "Payment", "bi-credit-card"],
        ["expense", "Expense", "bi-coin"],
        ["more", "More", "bi-grid"]
    ].map(([key, label, icon]) => `<button type="button" class="module-nav-item ${state.module === key ? "active" : ""}" data-module="${key}"><i class="bi ${icon}"></i><span>${label}</span></button>`).join("");
    moduleNav.querySelectorAll(".module-nav-item").forEach(button => button.addEventListener("click", () => {
        setModule(button.dataset.module);
        sidebar.classList.remove("open");
    }));

    const activeKey = state.module === "profile" ? state.profileView : state.module === "payment" ? state.paymentView : state.module === "expense" ? state.expenseView : state.moreView;
    sideNav.innerHTML = sidebarMenus[state.module].map(([key, label, icon]) => `
        <button type="button" class="side-nav-item ${key === activeKey ? "active" : ""}" data-view="${key}">
            <i class="bi ${icon}"></i><span>${label}</span>
        </button>
    `).join("");
    sideNav.querySelectorAll(".side-nav-item").forEach(button => button.addEventListener("click", () => {
        setModuleView(state.module, button.dataset.view);
        sidebar.classList.remove("open");
    }));
}

function setModule(module) {
    state.module = module;
    renderApp();
}

function setModuleView(module, view) {
    if (module === "profile") state.profileView = view;
    if (module === "payment") state.paymentView = view;
    if (module === "expense") state.expenseView = view;
    if (module === "more") state.moreView = view;
    renderApp();
}

function updateMobileNav() {
    mobileBottomNav.querySelectorAll("button").forEach(button => button.classList.toggle("active", button.dataset.module === state.module));
}

function renderModule() {
    if (state.module === "profile") renderProfile();
    else if (state.module === "payment") renderPayment();
    else if (state.module === "expense") renderExpense();
    else renderMore();
}

function pageHeader(icon, title, subtitle) {
    return `<section class="page-heading"><div class="heading-icon"><i class="bi ${icon}"></i></div><div><h1>${title}</h1><p>${subtitle}</p></div></section>`;
}

function monthCard() { return `<div class="selected-month-card"><i class="bi bi-calendar3"></i><div><span>Selected Month</span><strong>${escapeHtml(selectedMonth)}</strong></div></div>`; }
function statCard(icon, label, value, extraClass = "") { return `<article class="stat-card ${extraClass}"><div class="stat-icon"><i class="bi ${icon}"></i></div><div><span>${label}</span><strong>${value}</strong></div></article>`; }

function renderProfile() {
    if (state.profileView === "add") return renderSimpleForm("Add Profile", "bi-person-plus", "Add a new profile using the same fields as the profile data structure.", "profile");
    if (state.profileView === "update") return renderSimpleForm("Update Profile", "bi-pencil-square", "Select a profile from All Profiles to review and update its information.", "profile");

    const profiles = getMonthData().profiles;
    const students = profiles.filter(p => p.type === "Student").length;
    const employees = profiles.filter(p => p.type === "Employee").length;
    const beds = profiles.length;
    moduleContent.innerHTML = `
        ${pageHeader("bi-person", "Profile Management", "Manage all students & employees profiles, booking and payment details.")}
        <section class="stats-grid">${statCard("bi-people-fill", "Total Profiles", profiles.length, "highlight")}${statCard("bi-mortarboard-fill", "Students", students)}${statCard("bi-briefcase-fill", "Employees", employees)}${statCard("bi-bed-fill", "Occupied Rooms", beds)}${monthCard()}</section>
        <section class="filter-panel app-panel"><div class="filter-controls profile-filters"><div class="search-wrap"><i class="bi bi-search"></i><input id="profileSearch" type="search" placeholder="Search by name, mobile, email, college or company..."></div><select id="profileType"><option value="">All (Student/Employee)</option><option>Student</option><option>Employee</option></select><select id="profileRoom"><option value="">All Room Type</option><option>1 Seater</option><option>2 Seater</option><option>3 Seater</option><option>4 Seater</option></select><select id="profilePayment"><option value="">All Payment Mode</option><option>UPI</option><option>Online</option><option>Cash</option></select><button class="reset-button" id="profileReset"><i class="bi bi-arrow-counterclockwise"></i> Reset</button></div></section>
        <div class="module-grid profile-grid"><section class="app-panel table-panel"><div class="panel-heading"><h2><i class="bi bi-people"></i> Profiles</h2></div><div class="table-scroll"><table class="data-table"><thead><tr><th>#</th><th>Timestamp</th><th>Full Name</th><th>Type</th><th>Mobile Number</th><th>Room No.</th><th>Room Type</th><th>Actions</th></tr></thead><tbody id="profileTable"></tbody></table></div><div class="table-footer"><span id="profileSummary"></span><div id="profilePagination" class="pagination"></div></div></section><aside id="profileDetails" class="app-panel detail-panel"></aside></div>
        <section class="app-panel summary-strip"><h2><i class="bi bi-calendar3"></i> This Month Summary (${escapeHtml(selectedMonth)})</h2><div class="summary-strip-grid"><div><i class="bi bi-people-fill"></i><span>Total Profiles</span><b>${profiles.length}</b></div><div><i class="bi bi-mortarboard-fill"></i><span>Students</span><b>${students}</b></div><div><i class="bi bi-briefcase-fill"></i><span>Employees</span><b>${employees}</b></div><div><i class="bi bi-bed-fill"></i><span>Rooms Occupied</span><b>${beds}</b></div></div></section>
    `;
    bindProfileFilters();
    renderProfileTable();
    if (!state.selectedProfileId && profiles[0]) state.selectedProfileId = profiles[0].id;
    renderProfileDetails();
}

function bindProfileFilters() {
    ["profileSearch", "profileType", "profileRoom", "profilePayment"].forEach(id => document.getElementById(id).addEventListener("input", () => { state.profilePage = 1; renderProfileTable(); }));
    document.getElementById("profileReset").addEventListener("click", () => { document.getElementById("profileSearch").value = ""; document.getElementById("profileType").value = ""; document.getElementById("profileRoom").value = ""; document.getElementById("profilePayment").value = ""; state.profilePage = 1; renderProfileTable(); });
}

function getFilteredProfiles() {
    const q = document.getElementById("profileSearch")?.value.trim().toLowerCase() || "";
    const type = document.getElementById("profileType")?.value || "";
    const room = document.getElementById("profileRoom")?.value || "";
    const mode = document.getElementById("profilePayment")?.value || "";
    return getMonthData().profiles.filter(p => (!q || [p.fullName, p.mobile, p.email, p.college, p.companyName].some(v => String(v).toLowerCase().includes(q))) && (!type || p.type === type) && (!room || p.roomType === room) && (!mode || p.paymentMode === mode));
}

function renderProfileTable() {
    const rows = getFilteredProfiles();
    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    state.profilePage = Math.min(state.profilePage, totalPages);
    const start = (state.profilePage - 1) * PAGE_SIZE;
    const pageRows = rows.slice(start, start + PAGE_SIZE);
    const tbody = document.getElementById("profileTable");
    if (!tbody) return;
    tbody.innerHTML = pageRows.length ? pageRows.map((p, i) => `<tr><td>${start + i + 1}</td><td>${escapeHtml(p.timestamp)}</td><td><strong>${escapeHtml(p.fullName)}</strong></td><td><span class="type-pill ${p.type.toLowerCase()}">${escapeHtml(p.type)}</span></td><td>${escapeHtml(p.mobile)}</td><td>${escapeHtml(p.room)}</td><td>${escapeHtml(p.roomType)}</td><td class="action-cell"><button class="table-icon-btn" data-action="view" data-id="${p.id}" title="View"><i class="bi bi-eye"></i></button><button class="table-icon-btn" data-action="edit" data-id="${p.id}" title="Edit"><i class="bi bi-pencil"></i></button></td></tr>`).join("") : `<tr><td colspan="8" class="empty-row">No profile records found for this month.</td></tr>`;
    tbody.querySelectorAll("button").forEach(btn => btn.addEventListener("click", () => { state.selectedProfileId = btn.dataset.id; renderProfileDetails(); }));
    document.getElementById("profileSummary").textContent = `Showing ${rows.length ? start + 1 : 0} – ${Math.min(start + PAGE_SIZE, rows.length)} of ${rows.length} profiles`;
    renderPagination(document.getElementById("profilePagination"), totalPages, state.profilePage, page => { state.profilePage = page; renderProfileTable(); });
}

function renderProfileDetails() {
    const panel = document.getElementById("profileDetails");
    if (!panel) return;
    const p = getMonthData().profiles.find(x => x.id === state.selectedProfileId) || getMonthData().profiles[0];
    if (!p) { panel.innerHTML = `<div class="empty-state">No profile details for ${escapeHtml(selectedMonth)}.</div>`; return; }
    panel.innerHTML = `<div class="panel-heading"><h2><i class="bi bi-person-circle"></i> Profile Details</h2><button class="close-detail" id="closeProfileDetail" type="button"><i class="bi bi-x-lg"></i></button></div><div class="profile-card-head"><div class="profile-avatar"><i class="bi bi-person-fill"></i></div><div><h3>${escapeHtml(p.fullName)} <span class="type-pill ${p.type.toLowerCase()}">${escapeHtml(p.type)}</span></h3><div><i class="bi bi-envelope"></i> ${escapeHtml(p.email)}</div><div><i class="bi bi-telephone"></i> ${escapeHtml(p.mobile)}</div></div></div><div class="detail-tabs"><button class="active" type="button">Personal Info</button><button type="button" data-detail-tab="booking">Booking & Payment</button><button type="button" data-detail-tab="documents">Documents</button><button type="button" data-detail-tab="work">Work Info</button></div><div id="profileDetailBody">${profilePersonalInfo(p)}</div>`;
    document.getElementById("closeProfileDetail").addEventListener("click", () => { panel.classList.add("collapsed"); });
    panel.querySelectorAll(".detail-tabs button").forEach(btn => btn.addEventListener("click", () => { panel.querySelectorAll(".detail-tabs button").forEach(b => b.classList.remove("active")); btn.classList.add("active"); document.getElementById("profileDetailBody").innerHTML = btn.dataset.detailTab === "booking" ? profileBookingInfo(p) : btn.dataset.detailTab === "documents" ? profileDocuments(p) : btn.dataset.detailTab === "work" ? profileWorkInfo(p) : profilePersonalInfo(p); }));
}

function detailTable(items) { return `<div class="detail-table">${items.map(([a,b]) => `<div><b>${a}</b><span>${escapeHtml(b)}</span></div>`).join("")}</div>`; }
function profilePersonalInfo(p) { return detailTable([["Timestamp",p.timestamp],["Email Address",p.email],["Type",p.type],["Full Name",p.fullName],["Mobile Number",p.mobile],["College/University",p.college || "-"],["Course / Program",p.course || "-"],["Which Year",p.year || "-"],["Father / Guardian Name",p.guardian],["Parent / Guardian Mobile",p.guardianMobile],["Home Address",p.address]]); }
function profileBookingInfo(p) { return detailTable([["Booking Date",p.bookingDate],["Shifting Date",p.shiftingDate],["Room Number",p.room],["Room Type",p.roomType],["Booking Amount",money(p.bookingAmount)],["Registration Fee",money(p.registrationFee)],["Monthly Rent",money(p.rent)],["Security Deposit",money(p.deposit)],["Payment Mode",p.paymentMode],["Payment Receipt",p.receipt]]); }
function profileDocuments(p) { return `<div class="document-grid">${[p.aadhaarFront,p.aadhaarBack,p.yourId].map((name,i)=>`<button type="button" class="document-card" data-doc="${escapeHtml(name)}"><div class="document-placeholder"><i class="bi bi-card-image"></i></div><span>${["Aadhaar (Front)","Aadhaar (Back)","Your ID"][i]}</span><small>View document</small></button>`).join("")}</div>`; }
function profileWorkInfo(p) { return detailTable([["Full Name",p.fullName],["Mobile Number",p.mobile],["Company Name",p.companyName || "-"],["Company Address",p.companyAddress || "-"]]); }

function renderPayment() {
    if (state.paymentView === "add") return renderSimpleForm("Add Payment", "bi-credit-card", "Add a payment record using the payment fields defined for this module.", "payment");
    const payments = getMonthData().payments;
    const paid = getPaymentTotal();
    const pending = getPaymentPending();
    const title = state.paymentView === "pending" ? "Pending Payments" : state.paymentView === "history" ? "Payment History" : "Payment Management";
    moduleContent.innerHTML = `${pageHeader("bi-credit-card", title, "Track and manage all rent, booking and other payments.")}<section class="stats-grid">${statCard("bi-wallet2", "Total Payments", money(paid + pending), "highlight")}${statCard("bi-check-circle-fill", "Paid", money(paid), "success")}${statCard("bi-clock-history", "Pending", money(pending), "danger")}${statCard("bi-people-fill", "Total Records", payments.length)}${monthCard()}</section><section class="filter-panel app-panel"><div class="filter-controls payment-filters"><div class="search-wrap"><i class="bi bi-search"></i><input id="paymentSearch" type="search" placeholder="Search by name, mobile, email or room no..."></div><select id="paymentAmount"><option value="">All Amount Type</option><option>Monthly Rent</option><option>Booking Amount</option><option>Registration Fee</option><option>Security Deposit</option></select><select id="paymentMode"><option value="">All Payment Mode</option><option>UPI</option><option>Online</option><option>Cash</option></select><select id="paymentStatus"><option value="">All Status</option><option>Paid</option><option>Pending</option></select><button class="reset-button" id="paymentReset"><i class="bi bi-arrow-counterclockwise"></i> Reset</button></div></section><section class="app-panel table-panel"><div class="table-scroll"><table class="data-table"><thead><tr><th>#</th><th>Timestamp</th><th>Full Name</th><th>Room No.</th><th>Room Type</th><th>Fee Month</th><th>Amount Type</th><th>Amount Paid</th><th>Mode</th><th>Status</th><th>Receipt</th></tr></thead><tbody id="paymentTable"></tbody></table></div><div class="table-footer"><span id="paymentSummary"></span><div id="paymentPagination" class="pagination"></div></div></section><section class="two-column-panels"><section class="app-panel"><div class="panel-heading"><h2><i class="bi bi-bar-chart"></i> Amount Type Summary (${escapeHtml(selectedMonth)})</h2></div>${paymentTypeSummary(payments)}</section><section class="app-panel"><div class="panel-heading"><h2><i class="bi bi-pie-chart"></i> Payment Status (${escapeHtml(selectedMonth)})</h2></div>${paymentStatusChart(paid,pending)}</section></section>`;
    bindPaymentFilters();
    renderPaymentTable();
}

function bindPaymentFilters() { ["paymentSearch","paymentAmount","paymentMode","paymentStatus"].forEach(id => document.getElementById(id).addEventListener("input", () => { state.paymentPage = 1; renderPaymentTable(); })); document.getElementById("paymentReset").addEventListener("click", () => { ["paymentSearch","paymentAmount","paymentMode","paymentStatus"].forEach(id => document.getElementById(id).value = ""); state.paymentPage = 1; renderPaymentTable(); }); }
function getFilteredPayments() { const q = document.getElementById("paymentSearch")?.value.trim().toLowerCase() || ""; const amount = document.getElementById("paymentAmount")?.value || ""; const mode = document.getElementById("paymentMode")?.value || ""; const status = document.getElementById("paymentStatus")?.value || ""; let rows = getMonthData().payments.filter(p => (!q || [p.fullName,p.mobile,p.email,p.room].some(v=>String(v).toLowerCase().includes(q))) && (!amount || p.amountType === amount) && (!mode || p.mode === mode) && (!status || p.status === status)); if (state.paymentView === "pending") rows = rows.filter(p=>p.status === "Pending"); return rows; }
function renderPaymentTable() { const rows=getFilteredPayments(); const pages=Math.max(1,Math.ceil(rows.length/PAGE_SIZE)); state.paymentPage=Math.min(state.paymentPage,pages); const start=(state.paymentPage-1)*PAGE_SIZE; const slice=rows.slice(start,start+PAGE_SIZE); const tbody=document.getElementById("paymentTable"); if(!tbody)return; tbody.innerHTML=slice.length?slice.map((p,i)=>`<tr><td>${start+i+1}</td><td>${escapeHtml(p.timestamp)}</td><td><strong>${escapeHtml(p.fullName)}</strong></td><td>${escapeHtml(p.room)}</td><td>${escapeHtml(p.roomType)}</td><td>${escapeHtml(p.feeMonth)}</td><td>${escapeHtml(p.amountType)}</td><td><strong>${money(p.amountPaid)}</strong></td><td>${escapeHtml(p.mode)}</td><td><span class="status-pill ${p.status.toLowerCase()}">${p.status}</span></td><td><button class="table-icon-btn receipt-btn" data-id="${p.id}" title="View receipt"><i class="bi bi-image"></i></button></td></tr>`).join(""): `<tr><td colspan="11" class="empty-row">No payment records found for this month.</td></tr>`; tbody.querySelectorAll(".receipt-btn").forEach(btn=>btn.addEventListener("click",()=>showModal("Payment Receipt",`<div class="receipt-preview"><i class="bi bi-file-earmark-pdf"></i><h4>${escapeHtml(getMonthData().payments.find(p=>p.id===btn.dataset.id)?.receipt || "Receipt")}</h4><p>Frontend demo receipt preview.</p></div>`))); document.getElementById("paymentSummary").textContent=`Showing ${rows.length?start+1:0} – ${Math.min(start+PAGE_SIZE,rows.length)} of ${rows.length} records`; renderPagination(document.getElementById("paymentPagination"),pages,state.paymentPage,p=>{state.paymentPage=p;renderPaymentTable();}); }
function paymentTypeSummary(rows) { const types=["Monthly Rent","Booking Amount","Registration Fee","Security Deposit"]; const totals=types.map(type=>[type,rows.filter(p=>p.amountType===type).reduce((s,p)=>s+p.amountPaid,0)]); const max=Math.max(1,...totals.map(x=>x[1])); return `<div class="progress-summary">${totals.map(([label,value])=>`<div class="progress-row"><span>${label}</span><div class="progress"><div class="progress-bar" style="width:${value/max*100}%"></div></div><b>${money(value)}</b></div>`).join("")}</div>`; }
function paymentStatusChart(paid,pending) { const total=paid+pending; const pct=total?Math.round(paid/total*100):0; return `<div class="donut-large" style="--paid:${pct}%"><div><strong>${money(total)}</strong><span>Total</span></div></div><div class="chart-legend"><span><i class="legend-dot paid"></i>Paid : ${money(paid)} (${pct}%)</span><span><i class="legend-dot pending"></i>Pending : ${money(pending)} (${100-pct}%)</span></div>`; }

function renderExpense() {
    if (state.expenseView === "add") return renderSimpleForm("Add Expense", "bi-plus-circle", "Add an expense using the selected frequency structure.", "expense");
    const monthly=getMonthlyExpenseTotal(), weekly=getWeeklyExpenseTotal(), daily=getDailyExpenseTotal(), other=getOtherBillsTotal(), total=monthly+weekly+daily+other;
    const title = state.expenseView === "monthly" ? "Monthly Expense" : state.expenseView === "weekly" ? "Weekly Expense" : state.expenseView === "daily" ? "Daily Expense (Avg)" : state.expenseView === "history" ? "Expense History" : "Expense Management";
    moduleContent.innerHTML=`${pageHeader("bi-coin",title,"Track and manage all property/hostel expenses (Monthly, Weekly, Daily & Other Bills).")}<section class="stats-grid">${statCard("bi-coin", "Total Expense", money(total), "highlight")}${statCard("bi-calendar3", "Monthly Expense", money(monthly))}${statCard("bi-calendar-week", "Weekly Expense", money(weekly))}${statCard("bi-calendar-day", "Daily Expense (Avg)", money(daily))}${monthCard()}</section><section class="filter-panel app-panel"><div class="filter-controls expense-filters"><div class="search-wrap"><i class="bi bi-search"></i><input id="expenseSearch" type="search" placeholder="Search by expense head, category or note..."></div><select id="expenseCategory"><option value="">All Category</option><option>Monthly</option><option>Weekly</option><option>Daily Average</option><option>Other Bills</option></select><select id="expenseFrequency"><option value="">All Frequency</option><option>Monthly</option><option>Weekly</option><option>Daily Average</option></select><button class="reset-button" id="expenseReset"><i class="bi bi-arrow-counterclockwise"></i> Reset</button></div></section><div class="expense-tabs">${[["overview","Overview"],["monthly","Monthly Expenses"],["weekly","Weekly Expenses"],["daily","Daily Expenses"],["other","Other Bills"]].map(([v,l])=>`<button type="button" data-expense-tab="${v}" class="${(state.expenseView===v||(state.expenseView==='overview'&&v==='overview'))?'active':''}"><i class="bi bi-calendar3"></i>${l}</button>`).join("")}</div><div id="expenseMain"></div>`;
    bindExpenseFilters();
    document.querySelectorAll("[data-expense-tab]").forEach(btn=>btn.addEventListener("click",()=>{state.expenseView=btn.dataset.expenseTab;renderExpense();}));
    renderExpenseMain(total,monthly,weekly,daily,other);
}
function bindExpenseFilters(){["expenseSearch","expenseCategory","expenseFrequency"].forEach(id=>document.getElementById(id).addEventListener("input",()=>renderExpenseMain(getTotalExpense(),getMonthlyExpenseTotal(),getWeeklyExpenseTotal(),getDailyExpenseTotal(),getOtherBillsTotal()))); document.getElementById("expenseReset").addEventListener("click",()=>{document.getElementById("expenseSearch").value="";document.getElementById("expenseCategory").value="";document.getElementById("expenseFrequency").value="";renderExpenseMain(getTotalExpense(),getMonthlyExpenseTotal(),getWeeklyExpenseTotal(),getDailyExpenseTotal(),getOtherBillsTotal());});}
function renderExpenseMain(total,monthly,weekly,daily,other){ const target=document.getElementById("expenseMain"); if(!target)return; const forced=(document.getElementById("expenseCategory")?.value||document.getElementById("expenseFrequency")?.value||"").toLowerCase(); if(state.expenseView==='monthly'||forced==='monthly'){target.innerHTML=monthlyExpenseTable();return;} if(state.expenseView==='weekly'||forced==='weekly'){target.innerHTML=weeklyExpenseTable();return;} if(state.expenseView==='daily'||forced==='daily average'){target.innerHTML=dailyExpensePanel();return;} if(state.expenseView==='other'||forced==='other bills'){target.innerHTML=otherBillsTable();return;} target.innerHTML=`<div class="expense-overview-grid"><section class="app-panel"><div class="panel-heading"><h2><i class="bi bi-calendar3"></i> Monthly Expenses (${escapeHtml(selectedMonth)})</h2><span class="panel-total">Total: ${money(monthly)}</span></div>${monthlyExpenseTable(true)}</section><section class="app-panel"><div class="panel-heading"><h2><i class="bi bi-calendar-week"></i> Weekly Expenses (${escapeHtml(selectedMonth)})</h2><span class="panel-total">Total: ${money(weekly)}</span></div>${weeklyExpenseTable(true)}</section><section class="app-panel"><div class="panel-heading"><h2><i class="bi bi-calendar-day"></i> Daily Expenses (${escapeHtml(selectedMonth)})</h2><span class="panel-total">Total: ${money(daily)}</span></div>${dailyExpensePanel(true)}</section><section class="app-panel"><div class="panel-heading"><h2><i class="bi bi-file-earmark-text"></i> Other Bills</h2><span class="panel-total">Total: ${money(other)}</span></div>${otherBillsTable(true)}</section></div><section class="app-panel month-summary-table"><div class="panel-heading"><h2><i class="bi bi-bar-chart"></i> Month-wise Expense Summary</h2></div>${monthExpenseSummary()}</section>`; }
function expenseMatches(record, keys){ const q=(document.getElementById("expenseSearch")?.value||"").trim().toLowerCase(); if(!q) return true; return keys.some(k=>String(record[k]??"").toLowerCase().includes(q)); }
function monthlyExpenseTable(compact=false){ const r=getMonthData().expenses.monthly.filter(x=>expenseMatches(x,["yourName","propertyRent","electricity","water","internet","workerSalary","ration","gas","cleaning","furniture","security","license","foodService","other"])); if(!r.length)return `<div class="empty-state">No monthly expense data.</div>`; return `<div class="table-scroll"><table class="data-table expense-table"><thead><tr><th>#</th><th>Your Name</th><th>Property Rent</th><th>Electricity</th><th>Water</th><th>Internet / Wi-Fi</th><th>Worker Salary</th><th>Ration</th><th>LPG / Gas</th><th>Cleaning</th><th>Furniture / Equip.</th><th>CCTV / Security</th><th>License Fees</th><th>Food Service</th><th>Misc. / Other</th><th>Receipt</th></tr></thead><tbody>${r.map((x,i)=>`<tr><td>${i+1}</td><td>${escapeHtml(x.yourName)}</td>${[x.propertyRent,x.electricity,x.water,x.internet,x.workerSalary,x.ration,x.gas,x.cleaning,x.furniture,x.security,x.license,x.foodService,x.other].map(v=>`<td>${money(v)}</td>`).join("")}<td><button class="table-icon-btn" data-receipt="${escapeHtml(x.receipt)}"><i class="bi bi-image"></i></button></td></tr>`).join("")}</tbody><tfoot><tr><th colspan="15">Total Monthly Expense</th><th>${money(getMonthlyExpenseTotal())}</th></tr></tfoot></table></div>`; }
function weeklyExpenseTable(compact=false){ const r=getMonthData().expenses.weekly.filter(x=>expenseMatches(x,["yourName","week","dateRange","vegetables","grocery","cleaning","transport","other"])); if(!r.length)return `<div class="empty-state">No weekly expense data.</div>`; return `<div class="table-scroll"><table class="data-table"><thead><tr><th>#</th><th>Your Name</th><th>Week</th><th>Date Range</th><th>Vegetables</th><th>Grocery</th><th>Cleaning Material</th><th>Transportation / Delivery</th><th>Other Expense</th><th>Total</th><th>Receipt</th></tr></thead><tbody>${r.map((x,i)=>`<tr><td>${i+1}</td><td>${escapeHtml(x.yourName)}</td><td>${x.week}</td><td>${x.dateRange}</td>${[x.vegetables,x.grocery,x.cleaning,x.transport,x.other].map(v=>`<td>${money(v)}</td>`).join("")}<td><strong>${money(totalExpenseRecord(x))}</strong></td><td><button class="table-icon-btn" data-receipt="${escapeHtml(x.receipt)}"><i class="bi bi-image"></i></button></td></tr>`).join("")}</tbody><tfoot><tr><th colspan="9">Total Weekly Expense</th><th>${money(getWeeklyExpenseTotal())}</th><th></th></tr></tfoot></table></div>`; }
function dailyExpensePanel(compact=false){ const r=getMonthData().expenses.dailyAverage.filter(x=>expenseMatches(x,["yourName","petrol","milk","freshVegetables","repair","labour","cleaning","other"])); if(!r.length)return `<div class="empty-state">No daily average expense data.</div>`; const x=r[0]; return `<div class="daily-average-card"><div><i class="bi bi-calendar-day"></i><span>Average Daily Expense</span><strong>${money(totalExpenseRecord(x))}</strong></div><div><i class="bi bi-info-circle"></i><p>This is the average daily expense data for ${escapeHtml(selectedMonth)}.</p></div></div><div class="table-scroll mt-3"><table class="data-table"><thead><tr><th>Your Name</th><th>Petrol</th><th>Milk</th><th>Fresh Vegetables</th><th>Small Repair / Hardware</th><th>Daily Labour</th><th>Cleaning / Consumables</th><th>Other Expense</th><th>Receipt</th></tr></thead><tbody><tr><td>${escapeHtml(x.yourName)}</td>${[x.petrol,x.milk,x.freshVegetables,x.repair,x.labour,x.cleaning,x.other].map(v=>`<td>${money(v)}</td>`).join("")}<td><button class="table-icon-btn" data-receipt="${escapeHtml(x.receipt)}"><i class="bi bi-image"></i></button></td></tr></tbody></table></div>`; }
function otherBillsTable(compact=false){ const r=getMonthData().expenses.otherBills.filter(x=>expenseMatches(x,["head","amount"])); return `<div class="table-scroll"><table class="data-table"><thead><tr><th>#</th><th>Expense Head</th><th>Amount (₹)</th><th>Receipt</th></tr></thead><tbody>${r.map((x,i)=>`<tr><td>${i+1}</td><td>${escapeHtml(x.head)}</td><td>${money(x.amount)}</td><td>${x.receipt?`<button class="table-icon-btn" data-receipt="${escapeHtml(x.receipt)}"><i class="bi bi-image"></i></button>`:"-"}</td></tr>`).join("")}</tbody><tfoot><tr><th colspan="2">Total Other Bills</th><th>${money(getOtherBillsTotal())}</th><th></th></tr></tfoot></table></div>`; }
function monthExpenseSummary(){ const current=getTotalExpense(); const next=monthlyData["January 2027"]?getMonthTotals("January 2027"):0; return `<div class="table-scroll"><table class="data-table"><thead><tr><th>Month</th><th>Monthly Expense (₹)</th><th>Weekly Expense (₹)</th><th>Daily Expense (₹)</th><th>Other Bills (₹)</th><th>Total Expense (₹)</th></tr></thead><tbody><tr><td>${escapeHtml(selectedMonth)}</td><td>${money(getMonthlyExpenseTotal())}</td><td>${money(getWeeklyExpenseTotal())}</td><td>${money(getDailyExpenseTotal())}</td><td>${money(getOtherBillsTotal())}</td><td><strong>${money(current)}</strong></td></tr><tr><td>January 2027</td><td>${money(monthlyData["January 2027"].expenses.monthly.length ? getMonthTotals("January 2027").monthly : 0)}</td><td>${money(getMonthTotals("January 2027").weekly)}</td><td>${money(getMonthTotals("January 2027").daily)}</td><td>${money(getMonthTotals("January 2027").other)}</td><td><strong>${money(next)}</strong></td></tr></tbody></table></div>`; }
function getMonthTotals(month){ const e=monthlyData[month].expenses; const sum=(arr,key)=>arr.reduce((s,r)=>s+(key?Number(r[key]||0):totalExpenseRecord(r)),0); return {monthly:sum(e.monthly),weekly:sum(e.weekly),daily:sum(e.dailyAverage),other:sum(e.otherBills,"amount"),total:sum(e.monthly)+sum(e.weekly)+sum(e.dailyAverage)+sum(e.otherBills,"amount")}; }

function renderMore(){
    if(state.moreView==='beds') return renderBeds();
    if(state.moreView==='visitors') return renderVisitors();
    if(state.moreView !== 'more') return renderMoreOption(state.moreView);
    const cards=[
        ["reports","Reports","bi-bar-chart","View & download reports (PDF/Excel)"],["rooms","Room Management","bi-bed","Manage rooms, room types and occupancy"],["visitors","Visitor Enquiries","bi-people","View all visitor enquiries and enquiry status"],["beds","Beds Details","bi-bed-fill","View total beds, occupied/empty beds, floor-wise, room-wise & month-wise data","New"],["notice","Notice & Updates","bi-megaphone","Create and manage notices"],["documents","Documents","bi-file-earmark-text","Upload and manage important documents"],["tasks","Tasks / Reminder","bi-calendar-check","Add and track important tasks and reminders"],["backup","Data Backup","bi-database","Backup and restore your data securely"]
    ];
    moduleContent.innerHTML=`${pageHeader("bi-grid","More","Additional tools, reports and management options.")}<section class="more-grid">${cards.map(([key,title,icon,desc,badge])=>`<button type="button" class="more-card" data-more="${key}"><div class="more-icon"><i class="bi ${icon}"></i></div><div><h3>${title}${badge?`<span class="new-badge">${badge}</span>`:""}</h3><p>${desc}</p></div><i class="bi bi-chevron-right more-arrow"></i></button>`).join("")}</section>`;
    moduleContent.querySelectorAll("[data-more]").forEach(btn=>btn.addEventListener("click",()=>{state.moreView=btn.dataset.more;renderMore();}));
}

function renderBeds(){
    const beds=getMonthData().beds; const occupied=beds.occupied ?? beds.totalStudents; const empty=Math.max(0,beds.totalBeds-occupied); const pct=beds.totalBeds?((occupied/beds.totalBeds)*100).toFixed(1):"0.0";
    if(!beds.totalBeds){moduleContent.innerHTML=`${pageHeader("bi-bed-fill","Beds Details Report","Complete bed occupancy, room, floor and month-wise analysis.")}<div class="empty-state">No bed data available for ${escapeHtml(selectedMonth)}.</div>`;return;}
    moduleContent.innerHTML=`${pageHeader("bi-bed-fill","Beds Details Report","Complete bed occupancy, room, floor and month-wise analysis.")}<section class="stats-grid">${statCard("bi-bed-fill","Total Beds",beds.totalBeds)}${statCard("bi-people-fill","Total Students",beds.totalStudents)}${statCard("bi-bed-fill","Occupied Beds",`${occupied} (${pct}%)`,"success")}${statCard("bi-bed","Empty Beds",`${empty} (${(100-Number(pct)).toFixed(1)}%)`,"muted")}</section><div class="beds-tabs">${[["overview","Overview"],["floor","Floor-wise"],["room","Room-wise"],["seater","Seater-wise"],["month","Month-wise"]].map(([v,l])=>`<button type="button" class="${(state.bedsView||'overview')===v?'active':''}" data-beds-tab="${v}">${l}</button>`).join("")}</div><div id="bedsMain"></div>`;
    document.querySelectorAll("[data-beds-tab]").forEach(btn=>btn.addEventListener("click",()=>{state.bedsView=btn.dataset.bedsTab;renderBeds();})); renderBedsMain();
}
function renderBedsMain(){ const v=state.bedsView||'overview'; const target=document.getElementById("bedsMain"); if(!target)return; const b=getMonthData().beds; if(v==='floor'){target.innerHTML=`<section class="app-panel"><div class="panel-heading"><h2><i class="bi bi-layers"></i> Floor-wise Bed Status (${escapeHtml(selectedMonth)})</h2></div>${bedsFloorTable(b)}</section>`;return;} if(v==='room'){target.innerHTML=`<section class="app-panel"><div class="panel-heading"><h2><i class="bi bi-door-open"></i> Room-wise Details (${escapeHtml(selectedMonth)})</h2><div class="search-wrap compact-search"><i class="bi bi-search"></i><input id="roomSearch" type="search" placeholder="Search by room no. or student name..."></div></div><div id="roomTable">${bedsRoomTable(b.rooms)}</div></section>`;document.getElementById("roomSearch").addEventListener("input",()=>{const q=document.getElementById("roomSearch").value.toLowerCase();document.getElementById("roomTable").innerHTML=bedsRoomTable(b.rooms.filter(r=>r.room.toLowerCase().includes(q)||r.students.toLowerCase().includes(q)));});return;} if(v==='seater'){target.innerHTML=`<section class="app-panel"><div class="panel-heading"><h2><i class="bi bi-pie-chart"></i> Room Type (Seater-wise)</h2></div><div class="seater-grid">${Object.entries(b.seaters).map(([label,count])=>`<div><i class="bi bi-bed-fill"></i><span>${label}</span><strong>${count}</strong><small>${b.totalBeds?((count/b.totalBeds)*100).toFixed(1):0}%</small></div>`).join("")}</div></section>`;return;} if(v==='month'){target.innerHTML=`<section class="app-panel"><div class="panel-heading"><h2><i class="bi bi-bar-chart"></i> Monthly Trend (Occupancy %)</h2></div><div class="simple-bars">${b.occupancyTrend.map(x=>`<div><strong>${x.percent}%</strong><div class="simple-bar"><span style="height:${x.percent}%"></span></div><b>${x.month}</b></div>`).join("")}</div></section>`;return;} target.innerHTML=`<div class="beds-overview-grid"><section class="app-panel"><div class="panel-heading"><h2><i class="bi bi-layers"></i> Floor-wise Bed Status</h2></div>${bedsFloorTable(b)}</section><section class="app-panel"><div class="panel-heading"><h2><i class="bi bi-pie-chart"></i> Room Type (Seater-wise)</h2></div><div class="seater-list">${Object.entries(b.seaters).map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join("")}</div></section><section class="app-panel"><div class="panel-heading"><h2><i class="bi bi-bar-chart"></i> Monthly Trend (Occupancy %)</h2></div><div class="simple-bars">${b.occupancyTrend.map(x=>`<div><strong>${x.percent}%</strong><div class="simple-bar"><span style="height:${x.percent}%"></span></div><b>${x.month}</b></div>`).join("")}</div></section></div><section class="app-panel mt-3"><div class="panel-heading"><h2><i class="bi bi-door-open"></i> Room-wise Details</h2></div>${bedsRoomTable(b.rooms)}</section>`; }
function bedsFloorTable(b){return `<div class="table-scroll"><table class="data-table"><thead><tr><th>Floor</th><th>Total Beds</th><th>Occupied</th><th>Empty</th><th>Occupancy</th></tr></thead><tbody>${b.floors.map(f=>`<tr><td>${f.floor}</td><td>${f.totalBeds}</td><td>${f.occupied}</td><td>${f.empty}</td><td><span class="occupancy-pill">${(f.occupied/f.totalBeds*100).toFixed(1)}%</span></td></tr>`).join("")}<tr class="total-row"><th>Total</th><th>${b.floors.reduce((s,x)=>s+x.totalBeds,0)}</th><th>${b.floors.reduce((s,x)=>s+x.occupied,0)}</th><th>${b.floors.reduce((s,x)=>s+x.empty,0)}</th><th>${b.totalBeds?((b.totalStudents/b.totalBeds)*100).toFixed(1):0}%</th></tr></tbody></table></div>`;}
function bedsRoomTable(rooms){return `<div class="table-scroll"><table class="data-table"><thead><tr><th>#</th><th>Room No.</th><th>Floor</th><th>Room Type</th><th>Total Beds</th><th>Occupied</th><th>Empty</th><th>Students</th></tr></thead><tbody>${rooms.length?rooms.map((r,i)=>`<tr><td>${i+1}</td><td><strong>${r.room}</strong></td><td>${r.floor}</td><td>${r.roomType}</td><td>${r.totalBeds}</td><td>${r.occupied}</td><td>${r.empty}</td><td>${escapeHtml(r.students)}</td></tr>`).join(""):`<tr><td colspan="8" class="empty-row">No room data.</td></tr>`}</tbody></table></div>`;}

function renderVisitors(){ const records=getMonthData().visitors; const yes=records.filter(r=>r.roomRequired==='Yes').length,no=records.length-yes; moduleContent.innerHTML=`${pageHeader("bi-people","Visitor Enquiries Report","Track all visitors & room enquiries month-wise.")}<section class="stats-grid">${statCard("bi-people-fill","Total Visitors",records.length,"highlight")}${statCard("bi-check-circle-fill","Room Required",yes,"success")}${statCard("bi-x-circle-fill","No Room Required",no,"danger")}${monthCard()}</section><section class="two-column-panels visitor-chart-grid"><section class="app-panel"><div class="panel-heading"><h2><i class="bi bi-bar-chart"></i> Month-wise Visitors</h2></div>${visitorBarChart()}</section><section class="app-panel"><div class="panel-heading"><h2><i class="bi bi-pie-chart"></i> Visitor Status (${escapeHtml(selectedMonth)})</h2></div>${visitorDonut(records.length,yes,no)}</section></section><section class="filter-panel app-panel"><div class="filter-controls visitor-filters"><div class="search-wrap"><i class="bi bi-search"></i><input id="visitorSearch" type="search" placeholder="Search by name or mobile..."></div><select id="visitorRoom"><option value="">Room Required</option><option>Yes</option><option>No</option></select><select id="visitorSource"><option value="">Source (How did you hear)</option>${[...new Set(records.map(r=>r.source))].map(s=>`<option>${escapeHtml(s)}</option>`).join("")}</select><button class="reset-button" id="visitorReset"><i class="bi bi-arrow-counterclockwise"></i> Reset</button></div></section><section class="app-panel table-panel"><div class="table-scroll"><table class="data-table"><thead><tr><th>#</th><th>Timestamp</th><th>Full Name</th><th>Mobile Number</th><th>Room Required</th><th>How did you hear about us</th></tr></thead><tbody id="visitorTable"></tbody></table></div><div class="table-footer"><span id="visitorSummary"></span><div id="visitorPagination" class="pagination"></div></div></section>`; bindVisitorFilters(); renderVisitorTable(); }
function visitorBarChart(){ return `<div class="bar-chart light-chart">${months.slice(0,2).map(m=>{const c=monthlyData[m].visitors.length;return `<div class="bar-column"><strong>${c}</strong><span class="bar" style="height:${Math.max(10,c*18)}px"></span><small>${m.split(' ')[0].slice(0,3)} ${m.split(' ')[1]}</small></div>`}).join("")}</div>`; }
function visitorDonut(total,yes,no){const pct=total?Math.round(yes/total*100):0;return `<div class="donut-large green-red" style="--yes:${pct}%"><div><strong>${total}</strong><span>Visitors</span></div></div><div class="chart-legend"><span><i class="legend-dot paid"></i>Room Required : ${yes} (${pct}%)</span><span><i class="legend-dot pending"></i>No Room Required : ${no} (${100-pct}%)</span></div>`;}
function bindVisitorFilters(){["visitorSearch","visitorRoom","visitorSource"].forEach(id=>document.getElementById(id).addEventListener("input",()=>{state.visitorPage=1;renderVisitorTable();}));document.getElementById("visitorReset").addEventListener("click",()=>{document.getElementById("visitorSearch").value="";document.getElementById("visitorRoom").value="";document.getElementById("visitorSource").value="";state.visitorPage=1;renderVisitorTable();});}
function renderVisitorTable(){const q=document.getElementById("visitorSearch")?.value.toLowerCase()||"",room=document.getElementById("visitorRoom")?.value||"",source=document.getElementById("visitorSource")?.value||"";const rows=getMonthData().visitors.filter(r=>(!q||r.fullName.toLowerCase().includes(q)||r.mobileNumber.includes(q))&&(!room||r.roomRequired===room)&&(!source||r.source===source));const pages=Math.max(1,Math.ceil(rows.length/PAGE_SIZE));state.visitorPage=Math.min(state.visitorPage,pages);const start=(state.visitorPage-1)*PAGE_SIZE,slice=rows.slice(start,start+PAGE_SIZE),tbody=document.getElementById("visitorTable");tbody.innerHTML=slice.length?slice.map((r,i)=>`<tr><td>${start+i+1}</td><td>${r.timestamp}</td><td>${r.fullName}</td><td>${r.mobileNumber}</td><td><span class="room-pill ${r.roomRequired==='Yes'?'yes':'no'}">${r.roomRequired}</span></td><td>${r.source}</td></tr>`).join(""):`<tr><td colspan="6" class="empty-row">No visitor records found for this month.</td></tr>`;document.getElementById("visitorSummary").textContent=`Showing ${rows.length?start+1:0} – ${Math.min(start+PAGE_SIZE,rows.length)} of ${rows.length} entries`;renderPagination(document.getElementById("visitorPagination"),pages,state.visitorPage,p=>{state.visitorPage=p;renderVisitorTable();});}

function renderMoreOption(view) {
    const options = {
        reports: ["Reports", "bi-bar-chart", "View and download management report summaries using the frontend sample data."],
        rooms: ["Room Management", "bi-door-open", "Review room numbers, room types and current occupancy from the selected month."],
        notice: ["Notice & Updates", "bi-megaphone", "Management notice area for the selected month."],
        documents: ["Documents", "bi-file-earmark-text", "Management document area for the selected month."],
        tasks: ["Tasks / Reminder", "bi-calendar-check", "Management task and reminder area for the selected month."],
        backup: ["Data Backup", "bi-database", "Create a local frontend JSON backup of the current sample data."],
        settings: ["Settings", "bi-gear", "Frontend settings area."]
    };
    const item = options[view] || options.reports;
    const extra = view === "rooms" ? `<div class="table-scroll mt-3">${bedsRoomTable(getMonthData().beds.rooms || [])}</div>` : view === "backup" ? `<button type="button" class="primary-button mt-3" id="backupButton"><i class="bi bi-download"></i> Download Current Data</button>` : `<div class="empty-state">This section is ready for the selected month: <strong>${escapeHtml(selectedMonth)}</strong>.</div>`;
    moduleContent.innerHTML = `${pageHeader(item[1], item[0], item[2])}<section class="app-panel simple-form-panel"><button type="button" class="secondary-button" id="backToMore"><i class="bi bi-arrow-left"></i> Back to More</button>${extra}</section>`;
    document.getElementById("backToMore").addEventListener("click",()=>{state.moreView='more';renderMore();});
    if(view==='backup') document.getElementById("backupButton").addEventListener("click",downloadBackup);
}

function downloadBackup() {
    const blob = new Blob([JSON.stringify(monthlyData, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `elite-stay-${selectedMonth.toLowerCase().replace(/[^a-z0-9]+/g,"-")}-backup.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

function renderSimpleForm(title, icon, description, type) {
    moduleContent.innerHTML=`${pageHeader(icon,title,description)}<section class="app-panel simple-form-panel"><div class="simple-form-note"><i class="bi bi-info-circle"></i><span>Frontend-only demo form. Data can be connected to your final data source later.</span></div><form id="simpleForm" class="row g-3"><div class="col-md-6"><label class="form-label">Full Name</label><input class="form-control" required></div><div class="col-md-6"><label class="form-label">Mobile Number</label><input class="form-control" required></div><div class="col-md-6"><label class="form-label">${type==='expense'?'Amount':'Email Address'}</label><input class="form-control" ${type==='expense'?'type="number"':'type="email"'} required></div><div class="col-md-6"><label class="form-label">${type==='payment'?'Payment Mode':type==='expense'?'Frequency':'Room Number'}</label><select class="form-select"><option>Select</option><option>UPI</option><option>Online</option><option>Cash</option></select></div><div class="col-12"><button class="primary-button" type="submit">Save ${title}</button></div></form></section>`;
    document.getElementById("simpleForm").addEventListener("submit",e=>{e.preventDefault();showModal(title,"<div class='success-state'><i class='bi bi-check-circle-fill'></i><h4>Saved successfully</h4><p>This frontend demo action completed successfully.</p></div>");});
}

function renderPagination(container,totalPages,current,onPage){if(!container)return;container.innerHTML="";const prev=document.createElement("button");prev.type="button";prev.textContent="‹ Prev";prev.disabled=current===1;prev.onclick=()=>onPage(current-1);container.appendChild(prev);for(let i=1;i<=totalPages;i++){const b=document.createElement("button");b.type="button";b.textContent=i;b.className=i===current?"active":"";b.onclick=()=>onPage(i);container.appendChild(b);}const next=document.createElement("button");next.type="button";next.textContent="Next ›";next.disabled=current===totalPages;next.onclick=()=>onPage(current+1);container.appendChild(next);}

function showModal(title,body){document.getElementById("genericModalTitle").textContent=title;document.getElementById("genericModalBody").innerHTML=body;bootstrap.Modal.getOrCreateInstance(document.getElementById("genericModal")).show();}

monthSelect.addEventListener("change",()=>{selectedMonth=monthSelect.value;localStorage.setItem(SELECTED_MONTH_KEY,selectedMonth);state.profilePage=1;state.paymentPage=1;state.visitorPage=1;state.selectedProfileId=null;renderApp();});
loginForm.addEventListener("submit",e=>{e.preventDefault();if(passwordInput.value===ADMIN_PASSWORD){const loginTime=Date.now();localStorage.setItem(LOGIN_STATUS_KEY,"true");localStorage.setItem(LOGIN_TIME_KEY,String(loginTime));loginError.textContent="";showMainArea();startSessionTimer(loginTime);}else{loginError.textContent="Incorrect password.";passwordInput.value="";passwordInput.focus();}});
mobileBottomNav.querySelectorAll("button").forEach(button=>button.addEventListener("click",()=>{setModule(button.dataset.module);window.scrollTo({top:0,behavior:"smooth"});}));
menuButton.addEventListener("click",()=>sidebar.classList.toggle("open"));
adminButton.addEventListener("click",()=>{const open=adminMenu.classList.toggle("d-none");adminButton.setAttribute("aria-expanded",String(!open));});
logoutButton.addEventListener("click",logoutAdmin);
notificationButton.addEventListener("click",()=>notificationPanel.classList.toggle("d-none"));
document.addEventListener("click",e=>{if(!adminButton.contains(e.target)&&!adminMenu.contains(e.target))adminMenu.classList.add("d-none");if(!notificationButton.contains(e.target)&&!notificationPanel.contains(e.target))notificationPanel.classList.add("d-none");});

document.addEventListener("click",e=>{const receipt=e.target.closest("[data-receipt]");if(receipt)showModal("Receipt Preview",`<div class="receipt-preview"><i class="bi bi-file-earmark-image"></i><h4>${escapeHtml(receipt.dataset.receipt)}</h4><p>Frontend demo receipt preview.</p></div>`);const doc=e.target.closest("[data-doc]");if(doc)showModal("Document Preview",`<div class="receipt-preview"><i class="bi bi-file-earmark-image"></i><h4>${escapeHtml(doc.dataset.doc)}</h4><p>Frontend demo document preview.</p></div>`);});

document.addEventListener("DOMContentLoaded",checkExistingSession);
