THE ELITE STAY MANAGEMENT REPORT
=================================

Current version:
Admin Login + Visitor Enquiries Report

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

Visitor data:
- Visitor records are stored in the monthlyData JavaScript object in js/app.js.
- The selected month controls the records shown in the table.
- The available months are December 2026 through December 2027.
- The current sample data contains the five visitor records supplied in the project reference.
- Add future visitor records directly to the corresponding month's array.

How to run:
1. Extract the ZIP.
2. Open the project folder.
3. Open index.html in a modern web browser.
