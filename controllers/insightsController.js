const Session = require('../models/Session');
const Goal = require('../models/Goal');
const Mood = require('../models/Mood');

const insightsController = {
    getInsights: async function(req, res) {
        try {
            const userId = req.session.user.id;
            
            // Get time range from query parameter (default to 7 days)
            const range = parseInt(req.query.range) || 7;
            
            // Calculate date range
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - range);
            
            // Get all data
            const [sessions, goals, moods] = await Promise.all([
                Session.find({ 
                    userId: userId,
                    date: { $gte: startDate, $lte: endDate }
                }).sort({ date: -1 }),
                Goal.find({ userId: userId }),
                Mood.find({ 
                    userId: userId,
                    date: { $gte: startDate, $lte: endDate }
                }).sort({ date: -1 })
            ]);
            
            // Calculate total screen time
            const totalMinutes = sessions.reduce((sum, session) => sum + session.duration, 0);
            const totalHours = Math.floor(totalMinutes / 60);
            const totalMins = totalMinutes % 60;
            
            // Calculate daily average
            const dailyAverage = range > 0 ? totalMinutes / range : 0;
            const avgHours = Math.floor(dailyAverage / 60);
            const avgMins = Math.round(dailyAverage % 60);
            
            // Calculate goals achieved
            const completedGoals = goals.filter(g => g.status === 'completed').length;
            const totalGoals = goals.length;
            const successRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
            
            // Calculate average mood
            const avgMood = moods.length > 0 
                ? moods.reduce((sum, m) => sum + m.moodValue, 0) / moods.length 
                : 0;
            const moodLabels = ['', 'Struggling', 'Down', 'Okay', 'Good', 'Excellent'];
            const moodLabel = moodLabels[Math.round(avgMood)] || 'No data';
            
            // Prepare stats
            const insightsData = {
                stats: {
                    totalScreenTime: totalMinutes > 0 ? `${totalHours}h ${totalMins}m` : '0h 0m',
                    totalChange: '', // You can calculate this by comparing to previous period
                    totalChangeClass: 'neutral',
                    goalsAchieved: `${completedGoals}/${totalGoals}`,
                    goalsSuccessRate: totalGoals > 0 ? `${successRate}% success rate` : 'No goals yet',
                    goalsChangeClass: 'neutral',
                    averageMood: moodLabel,
                    moodTrend: moods.length > 0 ? 'Stable' : 'No data',
                    moodChangeClass: 'neutral',
                    dailyAverage: dailyAverage > 0 ? `${avgHours}h ${avgMins}m` : '0h 0m',
                    avgChange: '',
                    avgChangeClass: 'neutral'
                },
                goalProgress: goals.filter(g => g.status === 'active').map(goal => {
                    const percentage = goal.getProgressPercentage();
                    const exceeded = percentage > 100;
                    return {
                        name: goal.name,
                        percentage: percentage.toString(),
                        progressWidth: Math.min(percentage, 100),
                        exceeded: exceeded,
                        color: exceeded ? '#ef4444' : '#48bb78'
                    };
                }),
                summary: {
                    mostUsedCategory: getMostUsedCategory(sessions),
                    bestDay: 'N/A', // Can be calculated
                    longestSession: getLongestSession(sessions),
                    activeStreak: 'N/A' // Can be calculated
                },
                recommendations: generateRecommendations(sessions, goals, moods),
                chartDataJSON: JSON.stringify({
                    trendData: generateTrendData(sessions, range),
                    trendLabels: generateTrendLabels(range),
                    categoryData: generateCategoryData(sessions),
                    categoryLabels: generateCategoryLabels(sessions),
                    moodCorrelationData: generateMoodCorrelation(moods)
                })
            };

            res.render('insights', insightsData);

        } catch (error) {
            console.error('Error fetching insights:', error);
            res.render('insights', { 
                stats: {
                    totalScreenTime: '0h 0m',
                    goalsAchieved: '0/0',
                    averageMood: 'No data',
                    dailyAverage: '0h 0m'
                },
                goalProgress: [],
                summary: {},
                recommendations: [],
                chartDataJSON: JSON.stringify({
                    trendData: [],
                    trendLabels: [],
                    categoryData: [],
                    categoryLabels: [],
                    moodCorrelationData: []
                }),
                error: 'Failed to load insights' 
            });
        }
    }
};

// Helper functions
function getMostUsedCategory(sessions) {
    if (sessions.length === 0) return 'N/A';
    
    const categoryTotals = {};
    sessions.forEach(s => {
        categoryTotals[s.category] = (categoryTotals[s.category] || 0) + s.duration;
    });
    
    let maxCategory = '';
    let maxTime = 0;
    for (const [category, time] of Object.entries(categoryTotals)) {
        if (time > maxTime) {
            maxTime = time;
            maxCategory = category;
        }
    }
    
    return maxCategory || 'N/A';
}

function getLongestSession(sessions) {
    if (sessions.length === 0) return 'N/A';
    
    const longest = sessions.reduce((max, s) => s.duration > max.duration ? s : max);
    const hours = Math.floor(longest.duration / 60);
    const mins = longest.duration % 60;
    
    return `${hours}h ${mins}m (${longest.category})`;
}

function generateRecommendations(sessions, goals, moods) {
    const recommendations = [];
    
    // Check if user has exceeded goals
    const exceededGoals = goals.filter(g => g.status === 'active' && g.getProgressPercentage() > 100);
    if (exceededGoals.length > 0) {
        recommendations.push({
            icon: '💡',
            title: `${exceededGoals.length} Goal(s) Exceeded`,
            description: `You've exceeded your time limit on ${exceededGoals[0].name}. Consider adjusting your goals or taking more breaks.`
        });
    }
    
    // Check mood trends
    if (moods.length >= 3) {
        const recentMoods = moods.slice(0, 3);
        const avgRecentMood = recentMoods.reduce((sum, m) => sum + m.moodValue, 0) / 3;
        
        if (avgRecentMood < 3) {
            recommendations.push({
                icon: '⚠️',
                title: 'Mood Concerns',
                description: 'Your mood has been lower recently. Consider reducing screen time or taking outdoor breaks.'
            });
        }
    }
    
    // Check for high screen time
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
    const dailyAvg = sessions.length > 0 ? totalMinutes / 7 : 0;
    
    if (dailyAvg > 420) { // More than 7 hours
        recommendations.push({
            icon: '⏰',
            title: 'High Screen Time',
            description: 'Your daily average is over 7 hours. Try setting screen time limits or scheduling regular breaks.'
        });
    }
    
    // If no recommendations, add positive message
    if (recommendations.length === 0 && sessions.length > 0) {
        recommendations.push({
            icon: '✨',
            title: 'Doing Great!',
            description: 'Keep up the good work! Your screen time habits look healthy.'
        });
    }
    
    return recommendations;
}

function generateTrendData(sessions, range) {
    const data = new Array(range).fill(0);
    const today = new Date();
    
    sessions.forEach(session => {
        const sessionDate = new Date(session.date);
        const daysAgo = Math.floor((today - sessionDate) / (1000 * 60 * 60 * 24));
        
        if (daysAgo < range && daysAgo >= 0) {
            data[range - 1 - daysAgo] += session.duration / 60; // Convert to hours
        }
    });
    
    return data.map(d => Math.round(d * 10) / 10); // Round to 1 decimal
}

function generateTrendLabels(range) {
    const labels = [];
    const today = new Date();
    
    for (let i = range - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        labels.push(label);
    }
    
    return labels;
}

function generateCategoryData(sessions) {
    const categoryTotals = {};
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
    
    sessions.forEach(s => {
        categoryTotals[s.category] = (categoryTotals[s.category] || 0) + s.duration;
    });
    
    // Calculate percentages
    const percentages = [];
    for (const time of Object.values(categoryTotals)) {
        percentages.push(totalMinutes > 0 ? Math.round((time / totalMinutes) * 100) : 0);
    }
    
    return percentages;
}

function generateCategoryLabels(sessions) {
    const categoryTotals = {};
    
    sessions.forEach(s => {
        categoryTotals[s.category] = (categoryTotals[s.category] || 0) + s.duration;
    });
    
    return Object.keys(categoryTotals);
}

function generateMoodCorrelation(moods) {
    return moods.map(mood => ({
        x: Math.round((mood.screenTime / 60) * 10) / 10, // Convert to hours, 1 decimal
        y: mood.moodValue
    }));
}

module.exports = insightsController;