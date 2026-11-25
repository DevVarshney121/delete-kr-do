const ADMIN_PASSWORD = "admin123";
const SESSION_DURATION = 30 * 1000;
const LOGIN_STATUS_KEY = "eliteStayAdminLoggedIn";
const LOGIN_TIME_KEY = "eliteStayAdminLoginTime";
const SELECTED_MONTH_KEY = "eliteStaySelectedMonth";

const months = [
    "December 2026", "January 2027", "February 2027", "March 2027",
    "April 2027", "May 2027", "June 2027", "July 2027", "August 2027",
    "September 2027", "October 2027", "November 2027", "December 2027"
];

const monthlyData = {
    "December 2026": [
        { timestamp: "01 Dec 2026, 10:24 AM", fullName: "Aman Verma", mobileNumber: "9876543210", roomRequired: "Yes", source: "Google" },
        { timestamp: "02 Dec 2026, 11:05 AM", fullName: "Rahul Singh", mobileNumber: "9123456780", roomRequired: "Yes", source: "Instagram" },
        { timestamp: "03 Dec 2026, 02:18 PM", fullName: "Priya Sharma", mobileNumber: "9988776655", roomRequired: "No", source: "Friend / Reference" },
        { timestamp: "04 Dec 2026, 04:30 PM", fullName: "Nikita Gupta", mobileNumber: "9876501234", roomRequired: "Yes", source: "Google" },
        { timestamp: "05 Dec 2026, 12:10 PM", fullName: "Rohit Kumar", mobileNumber: "9012345678", roomRequired: "No", source: "Other" }
    ],
    "January 2027": [], "February 2027": [], "March 2027": [], "April 2027": [],
    "May 2027": [], "June 2027": [], "July 2027": [], "August 2027": [],
    "September 2027": [], "October 2027": [], "November 2027": [], "December 2027": []
};

const loginPage = document.getElementById("loginPage");
const mainArea = document.getElementById("mainArea");
const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");
const monthSelect = document.getElementById("monthSelect");
const selectedMonthLabel = document.getElementById("selectedMonthLabel");
const statusTitle = document.getElementById("statusTitle");
const totalVisitors = document.getElementById("totalVisitors");
const roomRequiredCount = document.getElementById("roomRequiredCount");
const noRoomRequiredCount = document.getElementById("noRoomRequiredCount");
const donutTotal = document.getElementById("donutTotal");
const donutChart = document.getElementById("donutChart");
const legendYes = document.getElementById("legendYes");
const legendNo = document.getElementById("legendNo");
const legendYesPct = document.getElementById("legendYesPct");
const legendNoPct = document.getElementById("legendNoPct");
const barChart = document.getElementById("barChart");
const searchInput = document.getElementById("searchInput");
const roomFilter = document.getElementById("roomFilter");
const sourceFilter = document.getElementById("sourceFilter");
const resetButton = document.getElementById("resetButton");
const visitorTableBody = document.getElementById("visitorTableBody");
const entrySummary = document.getElementById("entrySummary");
const pagination = document.getElementById("pagination");
const menuButton = document.getElementById("menuButton");
const sidebar = document.getElementById("sidebar");

const PAGE_SIZE = 5;
let currentPage = 1;
let logoutTimer = null;
let selectedMonth = localStorage.getItem(SELECTED_MONTH_KEY) || months[0];

months.forEach(month => {
    const option = document.createElement("option");
    option.value = month;
    option.textContent = month;
    monthSelect.appendChild(option);
});
monthSelect.value = months.includes(selectedMonth) ? selectedMonth : months[0];

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
    const remainingTime = SESSION_DURATION - (Date.now() - loginTime);
    if (remainingTime <= 0) return logoutAdmin();
    logoutTimer = setTimeout(logoutAdmin, remainingTime);
}

function showMainArea() {
    loginPage.classList.add("d-none");
    mainArea.classList.remove("d-none");
    mainArea.setAttribute("aria-hidden", "false");
    renderDashboard();
}

function showLoginPage() {
    mainArea.classList.add("d-none");
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

function getCurrentMonthRecords() {
    return monthlyData[selectedMonth] || [];
}

function getFilteredRecords() {
    const query = searchInput.value.trim().toLowerCase();
    const room = roomFilter.value;
    const source = sourceFilter.value;
    return getCurrentMonthRecords().filter(record => {
        const matchesSearch = !query || record.fullName.toLowerCase().includes(query) || record.mobileNumber.includes(query);
        const matchesRoom = !room || record.roomRequired === room;
        const matchesSource = !source || record.source === source;
        return matchesSearch && matchesRoom && matchesSource;
    });
}

function updateSourceOptions() {
    const current = sourceFilter.value;
    sourceFilter.innerHTML = '<option value="">Source (How did you hear)</option>';
    [...new Set(getCurrentMonthRecords().map(record => record.source))].sort().forEach(source => {
        const option = document.createElement("option");
        option.value = source;
        option.textContent = source;
        sourceFilter.appendChild(option);
    });
    if ([...sourceFilter.options].some(option => option.value === current)) sourceFilter.value = current;
}

function renderDashboard() {
    monthSelect.value = selectedMonth;
    selectedMonthLabel.textContent = selectedMonth;
    statusTitle.textContent = `Visitor Status (${selectedMonth})`;
    const records = getCurrentMonthRecords();
    const yes = records.filter(record => record.roomRequired === "Yes").length;
    const no = records.filter(record => record.roomRequired === "No").length;
    const total = records.length;
    const yesPct = total ? Math.round((yes / total) * 100) : 0;
    const noPct = total ? 100 - yesPct : 0;

    totalVisitors.textContent = total;
    roomRequiredCount.textContent = yes;
    noRoomRequiredCount.textContent = no;
    donutTotal.textContent = total;
    legendYes.textContent = yes;
    legendNo.textContent = no;
    legendYesPct.textContent = yesPct;
    legendNoPct.textContent = noPct;
    donutChart.style.setProperty("--yes", `${yesPct}%`);
    updateSourceOptions();
    renderBarChart();
    renderTable();
}

function renderBarChart() {
    const chartMonths = months.filter((_, index) => index < 2);
    barChart.innerHTML = chartMonths.map(month => {
        const count = (monthlyData[month] || []).length;
        const height = count ? Math.max(12, count * 7) : 2;
        const short = month.split(" ")[0].slice(0, 3) + " " + month.split(" ")[1];
        return `<div class="bar-column"><div class="bar-value">${count}</div><div class="bar" style="height:${height}px"></div><span>${short}</span></div>`;
    }).join("");
}

function renderTable() {
    const filtered = getFilteredRecords();
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageRecords = filtered.slice(start, start + PAGE_SIZE);

    visitorTableBody.innerHTML = pageRecords.length ? pageRecords.map((record, index) => `
        <tr>
            <td>${start + index + 1}</td>
            <td>${escapeHtml(record.timestamp)}</td>
            <td>${escapeHtml(record.fullName)}</td>
            <td>${escapeHtml(record.mobileNumber)}</td>
            <td><span class="room-pill ${record.roomRequired === "Yes" ? "yes" : "no"}">${escapeHtml(record.roomRequired)}</span></td>
            <td>${escapeHtml(record.source)}</td>
        </tr>
    `).join("") : '<tr><td colspan="6" class="empty-row">No visitor records found for this month.</td></tr>';

    const shownStart = filtered.length ? start + 1 : 0;
    const shownEnd = Math.min(start + PAGE_SIZE, filtered.length);
    entrySummary.textContent = `Showing ${shownStart} – ${shownEnd} of ${filtered.length} entries`;
    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    pagination.innerHTML = "";
    const prev = createPageButton("‹ Prev", currentPage === 1, () => { currentPage--; renderTable(); });
    pagination.appendChild(prev);
    for (let page = 1; page <= totalPages; page++) {
        const button = createPageButton(String(page), false, () => { currentPage = page; renderTable(); });
        if (page === currentPage) button.classList.add("active");
        pagination.appendChild(button);
    }
    const next = createPageButton("Next ›", currentPage === totalPages, () => { currentPage++; renderTable(); });
    pagination.appendChild(next);
}

function createPageButton(text, disabled, action) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.disabled = disabled;
    button.addEventListener("click", action);
    return button;
}

function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

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
        loginError.textContent = "Incorrect password.";
        passwordInput.value = "";
        passwordInput.focus();
    }
});

monthSelect.addEventListener("change", () => {
    selectedMonth = monthSelect.value;
    localStorage.setItem(SELECTED_MONTH_KEY, selectedMonth);
    currentPage = 1;
    searchInput.value = "";
    roomFilter.value = "";
    sourceFilter.value = "";
    renderDashboard();
});

[searchInput, roomFilter, sourceFilter].forEach(control => control.addEventListener("input", () => { currentPage = 1; renderTable(); }));
resetButton.addEventListener("click", () => {
    searchInput.value = "";
    roomFilter.value = "";
    sourceFilter.value = "";
    currentPage = 1;
    renderTable();
});
menuButton.addEventListener("click", () => sidebar.classList.toggle("open"));

document.addEventListener("DOMContentLoaded", checkExistingSession);
