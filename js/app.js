const ADMIN_PASSWORD = "admin123";
const SESSION_DURATION = 30 * 1000;

const loginPage = document.getElementById("loginPage");
const mainArea = document.getElementById("mainArea");
const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");

const LOGIN_STATUS_KEY = "eliteStayAdminLoggedIn";
const LOGIN_TIME_KEY = "eliteStayAdminLoginTime";

let logoutTimer = null;

document.addEventListener("DOMContentLoaded", function () {
    checkExistingSession();

    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const enteredPassword = passwordInput.value;

        if (enteredPassword === ADMIN_PASSWORD) {
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
});

function checkExistingSession() {
    const isLoggedIn = localStorage.getItem(LOGIN_STATUS_KEY);
    const loginTime = Number(localStorage.getItem(LOGIN_TIME_KEY));

    if (isLoggedIn !== "true" || !loginTime) {
        showLoginPage();
        return;
    }

    const elapsedTime = Date.now() - loginTime;

    if (elapsedTime >= SESSION_DURATION) {
        logoutAdmin();
        return;
    }

    showMainArea();
    startSessionTimer(loginTime);
}

function startSessionTimer(loginTime) {
    if (logoutTimer) {
        clearTimeout(logoutTimer);
    }

    const elapsedTime = Date.now() - loginTime;
    const remainingTime = SESSION_DURATION - elapsedTime;

    if (remainingTime <= 0) {
        logoutAdmin();
        return;
    }

    logoutTimer = setTimeout(logoutAdmin, remainingTime);
}

function showMainArea() {
    loginPage.classList.add("d-none");
    mainArea.classList.remove("d-none");
    mainArea.setAttribute("aria-hidden", "false");
}

function showLoginPage() {
    mainArea.classList.add("d-none");
    mainArea.setAttribute("aria-hidden", "true");

    loginPage.classList.remove("d-none");
}

function logoutAdmin() {
    if (logoutTimer) {
        clearTimeout(logoutTimer);
        logoutTimer = null;
    }

    localStorage.removeItem(LOGIN_STATUS_KEY);
    localStorage.removeItem(LOGIN_TIME_KEY);

    showLoginPage();
    loginForm.reset();
    loginError.textContent = "";
    passwordInput.focus();
}
