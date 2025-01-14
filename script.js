// If you don’t need any JavaScript, you can omit this file.
// Here's a simple script to auto-update the current year in the footer.

const yearSpan = document.getElementById("year");
const currentYear = new Date().getFullYear();
yearSpan.textContent = currentYear;