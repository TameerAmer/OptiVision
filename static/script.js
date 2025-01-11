// Check if dark mode is already set in localStorage
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    document.getElementById('theme-icon').classList.remove('fa-moon');
    document.getElementById('theme-icon').classList.add('fa-sun');
}

// Dark/Light Mode Toggle Function
document.getElementById('theme-toggle').addEventListener('click', function () {
    // Toggle Dark Mode on body
    document.body.classList.toggle('dark-mode');

    // Change icon between moon and sun
    const themeIcon = document.getElementById('theme-icon');
    if (document.body.classList.contains('dark-mode')) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        localStorage.setItem('darkMode', 'enabled');  // Save dark mode preference
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        localStorage.setItem('darkMode', 'disabled');  // Save light mode preference
    }
});
