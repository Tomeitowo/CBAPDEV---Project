// import module 'express'
const express = require('express');

// import module 'express-session'
const session = require('express-session');

//import module 'hbs'
const hbs = require('hbs');

// import module 'routes' from './routes/routes.js'
const routes = require('./routes/routes.js');

// import module 'database' from './models/db.js'
const db = require('./models/Db.js');

require('dotenv').config();

const app = express();
const port = 3000;

// set hbs as view engine
app.set('view engine', 'hbs');

// Middleware for serving static files
app.use(express.static('public'));

// Middleware for parsing request bodies
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Session middleware configuration
app.use(session({
    secret: 'hypnos-secret-key-change-this-in-production', // Change this to a random string in production
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// Middleware to make user session available to all views
app.use(function(req, res, next) {
    res.locals.user = req.session.user || null;
    next();
});

//define paths contained in 'routes'
app.use('/', routes);

// error handler for undefined routes
app.use(function (req, res) {
    res.render('error');
});

// connects to the database
db.connect();

app.listen(port, function () {
    console.log('app listening at port ' + port);
});