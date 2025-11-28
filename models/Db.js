// import module `mongoose`
const mongoose = require('mongoose');

// Connection options (useNewUrlParser and useUnifiedTopology are no longer needed in Mongoose 6+)
const options = {};

const database = {
	// connect to database
    connect: async function() {
        try {
            await mongoose.connect(process.env.MONGODB_CONNECT_URI, options);
            console.log('Connected to MongoDB database: hypnos');
        } catch (error) {
            console.log('Database connection error:', error);
            console.log('Make sure MongoDB is running on your system');
            process.exit(1); // Exit if can't connect to database
        }
    }
};

// Export database object
module.exports = database;