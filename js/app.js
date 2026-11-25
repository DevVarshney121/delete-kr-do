const ADMIN_PASSWORD = "admin123";
const AUTO_LOGOUT_TIME = 30 * 1000;

const loginPage = document.getElementById("loginPage");
const mainArea = document.getElementById("mainArea");
const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("loginError");

let logoutTimer = null;

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const enteredPassword = passwordInput.value;

    if (enteredPassword === ADMIN_PASSWORD) {
        loginError.textContent = "";
        showMainArea();

        logoutTimer = setTimeout(logoutAdmin, AUTO_LOGOUT_TIME);
    } else {
        loginError.textContent = "Incorrect password.";
        passwordInput.value = "";
        passwordInput.focus();
    }
});

function showMainArea() {
    loginPage.classList.add("d-none");
    mainArea.classList.remove("d-none");
    mainArea.setAttribute("aria-hidden", "false");
}

function logoutAdmin() {
    if (logoutTimer) {
        clearTimeout(logoutTimer);
        logoutTimer = null;
    }

    mainArea.classList.add("d-none");
    mainArea.setAttribute("aria-hidden", "true");

    loginPage.classList.remove("d-none");
    loginForm.reset();
    loginError.textContent = "";
    passwordInput.focus();
}
