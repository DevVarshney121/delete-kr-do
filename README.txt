THE ELITE STAY MANAGEMENT REPORT
=================================

Current version:
Local Admin Login Demo

Technology:
- HTML
- CSS
- JavaScript
- Bootstrap 5.3.3 CDN

Login password:
admin123

Session behavior:
- Successful login starts a 30-second session.
- Login status and exact login timestamp are stored in browser localStorage.
- Refreshing/reopening the page during the 30-second session keeps the admin logged in.
- The original login timestamp is used, so refresh does not reset the 30-second timer.
- When 30 seconds have elapsed, the session is cleared and the login page is shown.
- After logout, the admin must enter the password again.

Current flow:
Admin Login
    -> Correct password
    -> Completely empty website area
    -> Refresh keeps the same session
    -> 30 seconds from original login complete
    -> Automatic logout
    -> Login page appears again

How to run:
1. Extract the ZIP.
2. Open the project folder.
3. Open index.html in a modern web browser.
