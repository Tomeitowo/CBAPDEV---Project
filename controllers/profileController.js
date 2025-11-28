const User = require('../models/User');

const profileController = {
    // GET profile page
    getProfile: async function (req, res) {
        try {
            const userId = req.session.user.id;
            
            // Get user data from database
            const user = await User.findById(userId).select('-password');
            
            if (!user) {
                return res.redirect('/');
            }

            res.render('profile', {
                user: {
                    username: user.username,
                    email: user.email,
                    formattedJoinDate: formatDate(user.createdAt)
                }
            });

        } catch (error) {
            console.error('Error fetching profile:', error);
            res.render('profile', { 
                user: {
                    username: '',
                    email: '',
                    formattedJoinDate: ''
                },
                error: 'Failed to load profile' 
            });
        }
    },

    // PUT update profile (username/email)
    updateProfile: async function(req, res) {
        try {
            const userId = req.session.user.id;
            const { username, email } = req.body;

            // Find user
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            // Check if new username is taken (if username is being changed)
            if (username && username !== user.username) {
                const existingUser = await User.findOne({ username: username });
                if (existingUser) {
                    return res.status(400).json({
                        success: false,
                        error: 'Username already taken'
                    });
                }
                user.username = username;
            }

            // Check if new email is taken (if email is being changed)
            if (email && email !== user.email) {
                const existingEmail = await User.findOne({ email: email });
                if (existingEmail) {
                    return res.status(400).json({
                        success: false,
                        error: 'Email already registered'
                    });
                }
                user.email = email;
            }

            await user.save();

            // Update session with new info
            req.session.user.username = user.username;
            req.session.user.email = user.email;

            res.json({
                success: true,
                message: 'Profile updated successfully',
                user: {
                    username: user.username,
                    email: user.email
                }
            });

        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update profile'
            });
        }
    },

    // PUT change password
    changePassword: async function(req, res) {
        try {
            const userId = req.session.user.id;
            const { currentPassword, newPassword, confirmPassword } = req.body;

            // Validate input
            if (!currentPassword || !newPassword || !confirmPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'All fields are required'
                });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'New passwords do not match'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    error: 'New password must be at least 6 characters'
                });
            }

            // Find user
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            // Verify current password
            const isMatch = await user.comparePassword(currentPassword);

            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    error: 'Current password is incorrect'
                });
            }

            // Update password (will be hashed by pre-save hook)
            user.password = newPassword;
            await user.save();

            res.json({
                success: true,
                message: 'Password changed successfully'
            });

        } catch (error) {
            console.error('Error changing password:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to change password'
            });
        }
    },

    // DELETE account
    deleteAccount: async function(req, res) {
        try {
            const userId = req.session.user.id;
            const { password } = req.body;

            // Validate password confirmation
            if (!password) {
                return res.status(400).json({
                    success: false,
                    error: 'Password is required to delete account'
                });
            }

            // Find user
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            // Verify password
            const isMatch = await user.comparePassword(password);

            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    error: 'Incorrect password'
                });
            }

            // Delete user and all associated data
            const Session = require('../models/Session');
            const Goal = require('../models/Goal');
            const Mood = require('../models/Mood');

            await Session.deleteMany({ userId: userId });
            await Goal.deleteMany({ userId: userId });
            await Mood.deleteMany({ userId: userId });
            await User.findByIdAndDelete(userId);

            // Destroy session
            req.session.destroy(function(err) {
                if (err) {
                    console.error('Session destroy error:', err);
                }
            });

            res.json({
                success: true,
                message: 'Account deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting account:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete account'
            });
        }
    }
};

// Helper function
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

module.exports = profileController;