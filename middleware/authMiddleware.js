// Check if user is logged in
function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    
    // User is not logged in (redirect to login)
    res.redirect('/');
}

// Middleware to check if user is not logged in (for login/register pages)
function requireGuest(req, res, next) {
    if (req.session && req.session.user) {
        // User is already logged in, redirect to home
        return res.redirect('/home');
    }
    
    // User is not logged in, proceed
    next();
}

module.exports = {
    requireAuth,
    requireGuest
};