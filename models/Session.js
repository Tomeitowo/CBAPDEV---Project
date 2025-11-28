const mongoose = require('mongoose');

// Define the Session schema
const sessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Social Media', 'Work', 'Gaming', 'Movies', 'Study', 'Entertainment', 'Other'],
        trim: true
    },
    duration: {
        type: Number, // Duration in minutes
        required: [true, 'Duration is required'],
        min: [1, 'Duration must be at least 1 minute']
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters'],
        trim: true
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
sessionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// method to get total screen time for a user
sessionSchema.statics.getTotalScreenTime = async function(userId, startDate, endDate) {
    try {
        const result = await this.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(userId),
                    date: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalMinutes: { $sum: '$duration' }
                }
            }
        ]);
        
        return result.length > 0 ? result[0].totalMinutes : 0;
    } catch (error) {
        throw error;
    }
};

// method to get screen time by category
sessionSchema.statics.getScreenTimeByCategory = async function(userId, startDate, endDate) {
    try {
        return await this.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(userId),
                    date: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: '$category',
                    totalMinutes: { $sum: '$duration' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { totalMinutes: -1 }
            }
        ]);
    } catch (error) {
        throw error;
    }
};

// method to get recent sessions for a user
sessionSchema.statics.getRecentSessions = async function(userId, limit = 10) {
    try {
        return await this.find({ userId: userId })
            .sort({ date: -1 })
            .limit(limit);
    } catch (error) {
        throw error;
    }
};

// Create and export the Session model
module.exports = mongoose.model('Session', sessionSchema);