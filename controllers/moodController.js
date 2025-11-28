const Mood = require('../models/Mood');
const Session = require('../models/Session');
const mongoose = require('mongoose');

const moodController = {
    // GET mood page
    getMood: async function(req, res) {
        try {
            const userId = req.session.user.id;

            // Get mood history from database
            const moods = await Mood.find({ userId: userId })
                .sort({ date: -1 })
                .limit(30);

            // Format moods for the view
            const formattedMoods = moods.map(mood => {
                return {
                    _id: mood._id,
                    emoji: mood.getMoodEmoji(),
                    label: mood.moodType,
                    formattedDate: formatDate(mood.date),
                    note: mood.notes || 'No note added.',
                    totalScreenTime: formatMinutesToTime(mood.screenTime),
                    goalsMetText: '' // Can be calculated if needed
                };
            });

            // Generate insights based on mood and screen time correlation
            const insights = await generateMoodInsights(userId);

            res.render('mood', { 
                moods: formattedMoods,
                insights: insights 
            });

        } catch (error) {
            console.error('Error fetching moods:', error);
            res.render('mood', { 
                moods: [],
                insights: [],
                error: 'Failed to load mood data' 
            });
        }
    },

    // POST create new mood entry
    createMood: async function(req, res) {
        try {
            const userId = req.session.user.id;
            const { moodLevel, note } = req.body;

            // Validate required fields
            if (!moodLevel) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Mood level is required' 
                });
            }

            // Map mood level to type and value
            const moodMap = {
                'very-happy': { type: 'Excellent', value: 5 },
                'happy': { type: 'Good', value: 4 },
                'neutral': { type: 'Okay', value: 3 },
                'sad': { type: 'Down', value: 2 },
                'very-sad': { type: 'Struggling', value: 1 }
            };

            const moodData = moodMap[moodLevel];
            if (!moodData) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Invalid mood level' 
                });
            }

            // Check if mood already exists for today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            
            const existingMood = await Mood.findOne({
                userId: userId,
                date: {
                    $gte: today,
                    $lte: endOfDay
                }
            });
			
			// error handline for multiple moods in a day
            if (existingMood) {
                return res.status(400).json({
                    success: false,
                    error: 'You have already logged your mood for today. Please edit the existing entry.'
                });
            }

            // Calculate today's screen time
            let totalScreenTime = 0;
            try {
                const screenTimeResult = await Session.aggregate([
                    {
                        $match: {
                            userId: new mongoose.Types.ObjectId(userId),
                            date: {
                                $gte: today,
                                $lte: endOfDay
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
                
                totalScreenTime = screenTimeResult.length > 0 ? screenTimeResult[0].totalMinutes : 0;
            } catch (screenTimeError) {
                console.error('Error calculating screen time:', screenTimeError);
                totalScreenTime = 0;
            }

            // Create new mood entry
            const newMood = new Mood({
                userId: userId,
                moodType: moodData.type,
                moodValue: moodData.value, // This fixes the validation error
                date: new Date(),
                notes: note || '',
                screenTime: totalScreenTime
            });

            await newMood.save();

            res.json({
                success: true,
                mood: {
                    _id: newMood._id,
                    emoji: newMood.getMoodEmoji(),
                    label: newMood.moodType,
                    formattedDate: formatDate(newMood.date),
                    note: newMood.notes || 'No note added.',
                    totalScreenTime: formatMinutesToTime(newMood.screenTime),
                    goalsMetText: '✓ New entry'
                }
            });

        } catch (error) {
            console.error('Error creating mood:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to create mood entry: ' + error.message 
            });
        }
    },

    // PUT update mood entry
    updateMood: async function(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.user.id;
            const { moodLevel, note } = req.body;

            // Find mood of the owner of the userId
            const mood = await Mood.findOne({ _id: id, userId: userId });

            if (!mood) {
                return res.status(404).json({
                    success: false,
                    error: 'Mood entry not found'
                });
            }

            // Map mood level to type and value
            const moodMap = {
                'very-happy': { type: 'Excellent', value: 5 },
                'happy': { type: 'Good', value: 4 },
                'neutral': { type: 'Okay', value: 3 },
                'sad': { type: 'Down', value: 2 },
                'very-sad': { type: 'Struggling', value: 1 }
            };

            if (moodLevel) {
                const moodData = moodMap[moodLevel];
                if (!moodData) {
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Invalid mood level' 
                    });
                }
                mood.moodType = moodData.type;
                mood.moodValue = moodData.value; // Update both fields
            }

            if (note !== undefined) {
                mood.notes = note;
            }

            await mood.save();

            res.json({
                success: true,
                mood: {
                    _id: mood._id,
                    emoji: mood.getMoodEmoji(),
                    label: mood.moodType,
                    formattedDate: formatDate(mood.date),
                    note: mood.notes || 'No note added.',
                    totalScreenTime: formatMinutesToTime(mood.screenTime),
                    goalsMetText: 'Updated'
                }
            });

        } catch (error) {
            console.error('Error updating mood:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to update mood entry' 
            });
        }
    },

    // DELETE mood entry
    deleteMood: async function(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.user.id;

            // Find and delete mood
            const mood = await Mood.findOneAndDelete({ _id: id, userId: userId });

            if (!mood) {
                return res.status(404).json({
                    success: false,
                    error: 'Mood entry not found'
                });
            }

            res.json({
                success: true,
                message: 'Mood entry deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting mood:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to delete mood entry' 
            });
        }
    }
};

// Helper function to generate mood insights
async function generateMoodInsights(userId) {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const today = new Date();

        // Get mood-screen time correlation
        const correlation = await Mood.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    date: {
                        $gte: thirtyDaysAgo,
                        $lte: today
                    }
                }
            },
            {
                $group: {
                    _id: '$moodType',
                    averageScreenTime: { $avg: '$screenTime' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const insights = [];

        // Simple analysis correlation data
        if (correlation.length > 0) {
            // Find mood with lowest screen time
            const lowestScreenTime = correlation.reduce((min, curr) => 
                curr.averageScreenTime < min.averageScreenTime ? curr : min
            );

            insights.push({
                icon: '💡',
                title: 'Pattern Detected',
                description: `You tend to feel ${lowestScreenTime._id} on days with lower screen time (avg ${formatMinutesToTime(Math.round(lowestScreenTime.averageScreenTime))}).`
            });
        }

        return insights;

    } catch (error) {
        console.error('Error generating insights:', error);
        return [];
    }
}

// Helper functions
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

function formatMinutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
}

module.exports = moodController;