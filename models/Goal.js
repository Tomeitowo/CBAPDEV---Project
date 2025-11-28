const mongoose = require('mongoose');

// Define the Goal schema
const goalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Goal name is required'],
        trim: true,
        maxlength: [100, 'Goal name cannot exceed 100 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Social Media', 'Work', 'Gaming', 'Movies', 'Study', 'Entertainment', 'Overall', 'Other'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    timeLimit: {
        type: Number, // Time limit in minutes per day/week
        required: [true, 'Time limit is required'],
        min: [1, 'Time limit must be at least 1 minute']
    },
    timePeriod: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'daily'
    },
    currentProgress: {
        type: Number, // Current time spent in minutes
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'failed'],
        default: 'active'
    },
    streak: {
        type: Number,
        default: 0,
        min: 0
    },
    lastStreakUpdate: {
        type: Date,
        default: Date.now
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    completedDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// update the updatedAt timestamp
goalSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    // If goal is being marked as completed, set completedDate
    if (this.isModified('status') && this.status === 'completed' && !this.completedDate) {
        this.completedDate = Date.now();
    }
    
    next();
});

// Method to calculate progress percentage
goalSchema.methods.getProgressPercentage = function() {
    if (this.timeLimit === 0) return 0;
    const percentage = (this.currentProgress / this.timeLimit) * 100;
    return Math.min(Math.round(percentage), 100);
};

// Method to check if goal is achieved
goalSchema.methods.checkGoalAchieved = function() {
    return false;
};

// Method to update streak
goalSchema.methods.updateStreak = function(achieved) {
    const now = new Date();
    const lastUpdate = new Date(this.lastStreakUpdate);
    
    // Check if new day
    const isNewDay = now.toDateString() !== lastUpdate.toDateString();
    
    if (isNewDay) {
        if (achieved) {
            this.streak += 1;
        } else {
            this.streak = 0;
        }
        this.lastStreakUpdate = now;
    }
    
    return this.save();
};

// Method to reset daily progress
goalSchema.methods.resetProgress = function() {
    this.currentProgress = 0;
    this.updatedAt = Date.now();
    return this.save();
};

// method to get active goals for a user
goalSchema.statics.getActiveGoals = async function(userId) {
    try {
        return await this.find({ 
            userId: userId, 
            status: 'active' 
        }).sort({ createdAt: -1 });
    } catch (error) {
        throw error;
    }
};

// method to get completed goals for a user
goalSchema.statics.getCompletedGoals = async function(userId) {
    try {
        return await this.find({ 
            userId: userId, 
            status: 'completed' 
        }).sort({ completedDate: -1 });
    } catch (error) {
        throw error;
    }
};

// method to get goals by category
goalSchema.statics.getGoalsByCategory = async function(userId, category) {
    try {
        return await this.find({ 
            userId: userId, 
            category: category 
        }).sort({ createdAt: -1 });
    } catch (error) {
        throw error;
    }
};

// Create and export the Goal model
module.exports = mongoose.model('Goal', goalSchema);