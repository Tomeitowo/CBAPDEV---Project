const Goal = require('../models/Goal');

const goalsController = {
    // GET goals page
    getGoals: async function(req, res) {
        try {
            const userId = req.session.user.id;

            // Get active and completed goals from database
            const activeGoals = await Goal.getActiveGoals(userId);
            const completedGoals = await Goal.getCompletedGoals(userId);

            // Format active goals for the view
            const formattedActiveGoals = activeGoals.map(goal => {
                const progressPercentage = goal.getProgressPercentage();
                const exceeded = progressPercentage > 100;

                return {
                    id: goal._id,
                    name: goal.name,
                    category: goal.category,
                    categoryClass: getCategoryClass(goal.category),
                    description: goal.description,
                    currentTime: formatMinutesToTime(goal.currentProgress),
                    targetTime: formatMinutesToTime(goal.timeLimit),
                    progressPercentage: progressPercentage,
                    progressWidth: Math.min(progressPercentage, 100),
                    streak: goal.streak,
                    statusClass: exceeded ? 'exceeded' : 'active',
                    status: exceeded ? 'Exceeded' : 'On Track',
                    exceeded: exceeded
                };
            });

            // Format completed goals for the view
            const formattedCompletedGoals = completedGoals.map(goal => {
                return {
                    id: goal._id,
                    name: goal.name,
                    category: goal.category,
                    categoryClass: getCategoryClass(goal.category),
                    description: goal.description,
                    completedDate: formatDate(goal.completedDate)
                };
            });

            res.render('goals', { 
                activeGoals: formattedActiveGoals,
                completedGoals: formattedCompletedGoals 
            });

        } catch (error) {
            console.error('Error fetching goals:', error);
            res.render('goals', { 
                activeGoals: [],
                completedGoals: [],
                error: 'Failed to load goals' 
            });
        }
    },

    // POST create new goal
    createGoal: async function(req, res) {
        try {
            const userId = req.session.user.id;
            const { name, category, description, timeLimit, timePeriod } = req.body;

            // Validate input
            if (!name || !category || !timeLimit) {
                return res.status(400).json({
                    success: false,
                    error: 'Name, category, and time limit are required'
                });
            }

            // Create new goal
            const newGoal = new Goal({
                userId: userId,
                name: name,
                category: category,
                description: description || '',
                timeLimit: parseInt(timeLimit),
                timePeriod: timePeriod || 'daily',
                currentProgress: 0,
                status: 'active',
                streak: 0
            });

            await newGoal.save();

            // Format for response
            const progressPercentage = newGoal.getProgressPercentage();

            res.json({
                success: true,
                goal: {
                    id: newGoal._id,
                    name: newGoal.name,
                    category: newGoal.category,
                    categoryClass: getCategoryClass(newGoal.category),
                    description: newGoal.description,
                    currentTime: formatMinutesToTime(newGoal.currentProgress),
                    targetTime: formatMinutesToTime(newGoal.timeLimit),
                    progressPercentage: progressPercentage,
                    progressWidth: Math.min(progressPercentage, 100),
                    streak: newGoal.streak,
                    statusClass: 'active',
                    status: 'On Track',
                    exceeded: false
                }
            });

        } catch (error) {
            console.error('Error creating goal:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create goal'
            });
        }
    },

    // PUT update goal (for editing details - should NOT auto-complete)
    updateGoal: async function(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.user.id;
            const { name, category, description, timeLimit } = req.body;

            // Find goal of the owner of the userId
            const goal = await Goal.findOne({ _id: id, userId: userId });

            if (!goal) {
                return res.status(404).json({
                    success: false,
                    error: 'Goal not found'
                });
            }

            // Update the fields
            if (name) goal.name = name;
            if (category) goal.category = category;
            if (description !== undefined) goal.description = description;
            if (timeLimit) goal.timeLimit = parseInt(timeLimit);

            await goal.save();

            // Format for response
            const progressPercentage = goal.getProgressPercentage();
            const exceeded = progressPercentage > 100;

            res.json({
                success: true,
                goal: {
                    id: goal._id,
                    name: goal.name,
                    category: goal.category,
                    categoryClass: getCategoryClass(goal.category),
                    description: goal.description,
                    currentTime: formatMinutesToTime(goal.currentProgress),
                    targetTime: formatMinutesToTime(goal.timeLimit),
                    progressPercentage: progressPercentage,
                    progressWidth: Math.min(progressPercentage, 100),
                    streak: goal.streak,
                    statusClass: goal.status === 'completed' ? 'completed' : (exceeded ? 'exceeded' : 'active'),
                    status: goal.status === 'completed' ? 'Completed' : (exceeded ? 'Exceeded' : 'On Track'),
                    exceeded: exceeded
                }
            });

        } catch (error) {
            console.error('Error updating goal:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update goal'
            });
        }
    },

    // PUT complete goal
    completeGoal: async function(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.user.id;

            const goal = await Goal.findOne({ _id: id, userId: userId });

            if (!goal) {
                return res.status(404).json({
                    success: false,
                    error: 'Goal not found'
                });
            }

            goal.status = 'completed';
            goal.completedDate = new Date();
            await goal.save();

            res.json({
                success: true,
                message: 'Goal marked as completed'
            });

        } catch (error) {
            console.error('Error completing goal:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to complete goal'
            });
        }
    },

    // PUT reactivate goal
    reactivateGoal: async function(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.user.id;

            const goal = await Goal.findOne({ _id: id, userId: userId });

            if (!goal) {
                return res.status(404).json({
                    success: false,
                    error: 'Goal not found'
                });
            }

            goal.status = 'active';
            goal.completedDate = undefined;
            goal.currentProgress = 0; // Reset progress when reactivating
            await goal.save();

            res.json({
                success: true,
                message: 'Goal reactivated successfully'
            });

        } catch (error) {
            console.error('Error reactivating goal:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to reactivate goal'
            });
        }
    },

    // DELETE goal
    deleteGoal: async function(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.user.id;

            // Find and delete goal (verify ownership)
            const goal = await Goal.findOneAndDelete({ _id: id, userId: userId });

            if (!goal) {
                return res.status(404).json({
                    success: false,
                    error: 'Goal not found'
                });
            }

            res.json({
                success: true,
                message: 'Goal deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting goal:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete goal'
            });
        }
    },

    // POST update goal progress (for when user completes a session)
    updateGoalProgress: async function(req, res) {
        try {
            const userId = req.session.user.id;
            const { category, duration } = req.body;

            // Find all active goals for this category
            const goals = await Goal.find({
                userId: userId,
                category: category,
                status: 'active'
            });

            // Update progress for each matching goal
            for (let goal of goals) {
                goal.currentProgress += parseInt(duration);
                // Don't auto-complete here either
                await goal.save();
            }

            res.json({
                success: true,
                message: 'Goal progress updated'
            });

        } catch (error) {
            console.error('Error updating goal progress:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update goal progress'
            });
        }
    }
};

// Helper functions
function getCategoryClass(category) {
    const categoryMap = {
        'Social Media': 'social-media',
        'Work': 'work',
        'Work-related': 'work',
        'Gaming': 'gaming',
        'Movies': 'movies',
        'Movies & Entertainment': 'movies',
        'Study': 'study',
        'Study & Learning': 'study',
        'Entertainment': 'movies',
        'Overall': 'other',
        'Other': 'other'
    };
    return categoryMap[category] || 'other';
}

function formatDate(date) {
    if (!date) return 'Unknown date';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

function formatMinutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
}

module.exports = goalsController;