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
        localStorage.setItem('darkMode', 'enabled'); // Save dark mode preference
        updateChartColors(); // Update chart colors for dark mode
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        localStorage.setItem('darkMode', 'disabled'); // Save light mode preference
        updateChartColors(); // Update chart colors for light mode
    }
});

// Filter functionality
const dateFilter = document.getElementById('date-filter');
const testTypeFilter = document.getElementById('test-type-filter');
const reportsTable = document.querySelector('.reports-table tbody');

// Event listener for date filter
dateFilter.addEventListener('change', function () {
    const selectedDateFilter = dateFilter.value;
    filterReports(selectedDateFilter, testTypeFilter.value);
});

// Event listener for test type filter
testTypeFilter.addEventListener('change', function () {
    const selectedTestType = testTypeFilter.value;
    filterReports(dateFilter.value, selectedTestType);
});

// Function to filter reports
function filterReports(dateFilterValue, testTypeValue) {
    const rows = reportsTable.querySelectorAll('tr');

    rows.forEach(row => {
        const date = new Date(row.querySelector('td:nth-child(2)').textContent.trim());
        const testType = row.querySelector('td:nth-child(1)').textContent.trim();

        let dateMatches = true;
        let typeMatches = true;

        // Filter by date
        if (dateFilterValue === 'last-week') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            dateMatches = date >= oneWeekAgo;
        } else if (dateFilterValue === 'last-month') {
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            dateMatches = date >= oneMonthAgo;
        } else if (dateFilterValue === 'last-quarter') {
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            dateMatches = date >= threeMonthsAgo;
        }

        // Filter by test type
        if (testTypeValue !== 'all') {
            typeMatches = testType === testTypeValue;
        }

        // Show or hide row based on filters
        if (dateMatches && typeMatches) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Extract performance data
const performanceData = JSON.parse(document.getElementById('performance-data').textContent);

// Extract unique, sorted dates for the X-axis
const labels = [...new Set(performanceData.map(data => data.date))].sort();

// Prepare datasets by test name, aligning scores with dates
const datasets = {};
performanceData.forEach(data => {
    if (!datasets[data.test_name]) {
        datasets[data.test_name] = {
            label: data.test_name,
            data: Array(labels.length).fill(null), // Pre-fill with nulls
            fill: false,
            borderColor: getRandomColor(),
            pointBackgroundColor: getRandomColor(),
            tension: 0.1
        };
    }
    const dateIndex = labels.indexOf(data.date); // Find the correct date index
    datasets[data.test_name].data[dateIndex] = data.score_percentage; // Align score to date
});

// Initialize the chart
const ctx = document.getElementById('performance-chart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: Object.values(datasets).map(dataset => ({
            ...dataset,
            pointRadius: 10, // Set the circle size here
            pointHoverRadius: 12 // Set the size on hover
        }))
    },
    options: {
        plugins: {
            title: {
                display: true,
                text: 'Performance Trend Over Time',
                font: {
                    size: 20
                },
                color: getFontColor()
            },
            legend: {
                display: true,
                labels: {
                    color: getFontColor()
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Score (%)',
                    color: getFontColor()
                },
                ticks: {
                    color: getFontColor()
                },
                grid: {
                    color: getGridColor()
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Date',
                    color: getFontColor()
                },
                ticks: {
                    color: getFontColor()
                },
                grid: {
                    color: getGridColor()
                }
            }
        }
    }
});


// Utility function to generate random colors
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Utility functions for colors based on mode
function getFontColor() {
    return document.body.classList.contains('dark-mode') ? '#eceff4' : '#333';
}

function getGridColor() {
    return document.body.classList.contains('dark-mode') ? '#4c566a' : '#ddd';
}

// Update chart colors dynamically
function updateChartColors() {
    const fontColor = getFontColor();
    const gridColor = getGridColor();

    chart.options.plugins.title.color = fontColor;
    chart.options.plugins.legend.labels.color = fontColor;
    chart.options.scales.x.title.color = fontColor;
    chart.options.scales.y.title.color = fontColor;
    chart.options.scales.x.ticks.color = fontColor;
    chart.options.scales.y.ticks.color = fontColor;
    chart.options.scales.x.grid.color = gridColor;
    chart.options.scales.y.grid.color = gridColor;

    chart.update();
}
