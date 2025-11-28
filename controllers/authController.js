const { is } = require('type-is');
const User = require('../models/User');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const authController = {
    // GET login page
    getLogin: function(req, res) {
	// If already logged in, redirect to home
		if (req.session.user) {
			return res.redirect('/home');
		}
		
		const success = req.query.success;
		res.render('index', { 
			error: null,
			success: success 
		});
	},

    // POST login
    postLogin: async function(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.render('index', { 
                    error: 'Please provide both username and password' 
                });
            }

            const user = await User.findOne({ username: username });

            if (!user) {
                return res.render('index', { 
                    error: 'Invalid username or password' 
                });
            }

            // Direct bcrypt password check here
            const isMatch = await bcrypt.compare(password, user.password);
            
            bcrypt.compare(password, user.password, function(err, isMatch) {
                if (!isMatch) 
                    return res.render('index', { 
                        error: 'Invalid username or password' 
                });
            })

            await user.updateLastLogin();

            req.session.user = {
                id: user._id,
                username: user.username,
                email: user.email
            };

            res.redirect('/home');

        } catch (error) {
            console.error('Login error:', error);
            res.render('index', { 
                error: 'An error occurred during login. Please try again.' 
            });
        }
    },

    // GET register page
    getRegister: function(req, res) {
        // If already logged in, redirect to home
        if (req.session.user) {
            return res.redirect('/home');
        }
        res.render('register', { error: null, success: null });
    },

    // POST register (Redirect to login after successful registration)
    postRegister: async function(req, res) {
        try {
            const { username, email, password, confirmPassword } = req.body;

            // Validate input
            if (!username || !email || !password || !confirmPassword) {
                return res.render('register', { 
                    error: 'All fields are required',
                    success: null 
                });
            }

            // Check if passwords match
            if (password !== confirmPassword) {
                return res.render('register', { 
                    error: 'Passwords do not match',
                    success: null 
                });
            }

            // Check password length
            if (password.length < 6) {
                return res.render('register', { 
                    error: 'Password must be at least 6 characters long',
                    success: null 
                });
            }

            // Check if username already exists
            const existingUsername = await User.findOne({ username: username });
            if (existingUsername) {
                return res.render('register', { 
                    error: 'Username already taken',
                    success: null 
                });
            }

            // Check if email already exists
            const existingEmail = await User.findOne({ email: email });
            if (existingEmail) {
                return res.render('register', { 
                    error: 'Email already registered',
                    success: null 
                });
            }

            const hash = await bcrypt.hash(password, saltRounds);

            const newUser = new User({
                username,
                email,
                password: hash
            });

            await newUser.save();

            // Redirect to login page
            res.redirect('/?success=Account created successfully! Please login.');

        } catch (error) {
            console.error('Registration error:', error);
            
            // Handle validation errors from mongoose
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message);
                return res.render('register', { 
                    error: messages.join(', '),
                    success: null 
                });
            }

            res.render('register', { 
                error: 'An error occurred during registration. Please try again.',
                success: null 
            });
        }
    },

    // POST logout
    postLogout: function(req, res) {
        req.session.destroy(function(err) {
            if (err) {
                console.error('Logout error:', err);
            }
            res.redirect('/');
        });
    }
};

module.exports = authController;