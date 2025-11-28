const mongoose = require('mongoose');

// Define the Mood schema
const moodSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    moodType: {
        type: String,
        required: [true, 'Mood type is required'],
        enum: ['Excellent', 'Good', 'Okay', 'Down', 'Struggling'],
        trim: true
    },
    moodValue: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    notes: {
        type: String,
        maxlength: [500, 'Notes cannot exceed 500 characters'],
        trim: true
    },
    screenTime: {
        type: Number, // Screen time in minutes for that day
        default: 0,
        min: 0
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

// set moodValue based on moodType
moodSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    // Set numeric value based on mood type for easier calculations
    const moodValues = {
        'Excellent': 5,
        'Good': 4,
        'Okay': 3,
        'Down': 2,
        'Struggling': 1
    };
    
    if (this.isModified('moodType')) {
        this.moodValue = moodValues[this.moodType];
    }
    
    next();
});

// Compound index to ensure one mood entry per user per day
moodSchema.index({ userId: 1, date: 1 }, { unique: false });

// Static method to get mood history for a user
moodSchema.statics.getMoodHistory = async function(userId, limit = 30) {
    try {
        return await this.find({ userId: userId })
            .sort({ date: -1 })
            .limit(limit);
    } catch (error) {
        throw error;
    }
};

// Static method to get average mood for a time period
moodSchema.statics.getAverageMood = async function(userId, startDate, endDate) {
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
                    averageMood: { $avg: '$moodValue' },
                    count: { $sum: 1 }
                }
            }
        ]);
        
        return result.length > 0 ? result[0] : { averageMood: 0, count: 0 };
    } catch (error) {
        throw error;
    }
};

// Static method to get mood distribution
moodSchema.statics.getMoodDistribution = async function(userId, startDate, endDate) {
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
                    _id: '$moodType',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
    } catch (error) {
        throw error;
    }
};

// Static method to analyze mood vs screen time correlation
moodSchema.statics.getMoodScreenTimeCorrelation = async function(userId, startDate, endDate) {
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
                    _id: '$moodType',
                    averageScreenTime: { $avg: '$screenTime' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { averageScreenTime: -1 }
            }
        ]);
    } catch (error) {
        throw error;
    }
};

// Static method to check if mood exists for a specific date
moodSchema.statics.getMoodForDate = async function(userId, date) {
    try {
        // Set time to start of day
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        // Set time to end of day
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        return await this.findOne({
            userId: userId,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });
    } catch (error) {
        throw error;
    }
};

// Method to get mood emoji
moodSchema.methods.getMoodEmoji = function() {
    const emojiMap = {
        'Excellent': '😊',
        'Good': '🙂',
        'Okay': '😐',
        'Down': '😔',
        'Struggling': '😢'
    };
    return emojiMap[this.moodType] || '😐';
};

// Create and export the Mood model
module.exports = mongoose.model('Mood', moodSchema);