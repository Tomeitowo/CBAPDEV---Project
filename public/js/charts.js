// charts.js - Chart initialization for insights page
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the insights page and chart data exists
    if (typeof chartData !== 'undefined' && window.location.pathname === '/insights') {
        initializeCharts();
    }
});

function initializeCharts() {
    // Screen Time Trend Chart
    const trendCtx = document.getElementById('screenTimeTrendChart');
    if (trendCtx) {
        new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: chartData.trendLabels,
                datasets: [{
                    label: 'Screen Time (hours)',
                    data: chartData.trendData,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Hours'
                        }
                    }
                }
            }
        });
    }

    // Category Distribution Chart
    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx && chartData.categoryData.length > 0) {
        new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: chartData.categoryLabels,
                datasets: [{
                    data: chartData.categoryData,
                    backgroundColor: [
                        '#667eea', '#764ba2', '#f093fb', '#f5576c', 
                        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Mood vs Screen Time Correlation Chart
    const moodCtx = document.getElementById('moodCorrelationChart');
    if (moodCtx && chartData.moodCorrelationData.length > 0) {
        new Chart(moodCtx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Mood vs Screen Time',
                    data: chartData.moodCorrelationData,
                    backgroundColor: 'rgba(102, 126, 234, 0.6)',
                    borderColor: '#667eea',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Screen Time (hours)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Mood Level'
                        },
                        min: 1,
                        max: 5,
                        ticks: {
                            callback: function(value) {
                                const moodLabels = ['', 'Struggling', 'Down', 'Okay', 'Good', 'Excellent'];
                                return moodLabels[value] || '';
                            }
                        }
                    }
                }
            }
        });
    }
}