const Session = require('../models/Session');

const sessionsController = {
    // GET sessions page
    getSessions: async function (req, res) {
        try {
            const userId = req.session.user.id;

            // Get recent sessions from database
            const sessions = await Session.getRecentSessions(userId, 50);

            // Format sessions for the view
            const formattedSessions = sessions.map(session => {
                const hours = Math.floor(session.duration / 60);
                const minutes = session.duration % 60;

                return {
                    _id: session._id,
                    category: session.category,
                    categoryClass: getCategoryClass(session.category),
                    formattedDate: formatDate(session.date),
                    formattedDuration: `${hours}h ${minutes}m`,
                    hours: hours,
                    minutes: minutes,
                    notes: session.notes || ''
                };
            });

            res.render('sessions', { sessions: formattedSessions });

        } catch (error) {
            console.error('Error fetching sessions:', error);
            res.render('sessions', { 
                sessions: [],
                error: 'Failed to load sessions' 
            });
        }
    },

    // POST create new session
    createSession: async function(req, res) {
        try {
            const userId = req.session.user.id;
            const { category, duration, notes } = req.body;

            // Validate input
            if (!category || !duration) {
                return res.status(400).json({
                    success: false,
                    error: 'Category and duration are required'
                });
            }

            // Create new session
			const newSession = new Session({
				userId: userId,
				category: category,
				duration: parseInt(duration),
				date: req.body.date ? new Date(req.body.date) : new Date(), // Use manually inputted date or current date
				notes: notes || ''
			});

            await newSession.save();

            // Format for response
            const hours = Math.floor(newSession.duration / 60);
            const minutes = newSession.duration % 60;

            res.json({
                success: true,
                session: {
                    _id: newSession._id,
                    category: newSession.category,
                    categoryClass: getCategoryClass(newSession.category),
                    formattedDate: formatDate(newSession.date),
                    formattedDuration: `${hours}h ${minutes}m`,
                    hours: hours,
                    minutes: minutes,
                    notes: newSession.notes
                }
            });

        } catch (error) {
            console.error('Error creating session:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create session'
            });
        }
    },

    // PUT update session
    updateSession: async function(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.user.id;
            const { category, duration, notes } = req.body;

            // Find sessions of the owner of the userId
            const session = await Session.findOne({ _id: id, userId: userId });

            if (!session) {
                return res.status(404).json({
                    success: false,
                    error: 'Session not found'
                });
            }

            // Update session fields
            if (category) session.category = category;
            if (duration) session.duration = parseInt(duration);
            if (notes !== undefined) session.notes = notes;

            await session.save();

            // Format for response
            const hours = Math.floor(session.duration / 60);
            const minutes = session.duration % 60;

            res.json({
                success: true,
                session: {
                    _id: session._id,
                    category: session.category,
                    categoryClass: getCategoryClass(session.category),
                    formattedDate: formatDate(session.date),
                    formattedDuration: `${hours}h ${minutes}m`,
                    hours: hours,
                    minutes: minutes,
                    notes: session.notes
                }
            });

        } catch (error) {
            console.error('Error updating session:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update session'
            });
        }
    },

    // DELETE session
    deleteSession: async function(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session.user.id;

            // Find and delete session (verify ownership)
            const session = await Session.findOneAndDelete({ _id: id, userId: userId });

            if (!session) {
                return res.status(404).json({
                    success: false,
                    error: 'Session not found'
                });
            }

            res.json({
                success: true,
                message: 'Session deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting session:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete session'
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
        'Other': 'other'
    };
    return categoryMap[category] || 'other';
}

function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

module.exports = sessionsController;