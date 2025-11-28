// import module `mongoose`
const mongoose = require('mongoose');

// Connection options (useNewUrlParser and useUnifiedTopology are no longer needed in Mongoose 6+)
const options = {};

const url = 'mongodb+srv://matthewfajardo_db_user:AntipoloCity@cluster0.xamjzld.mongodb.net/?appName=Cluster0';

const database = {
	// connect to database
    connect: async function() {
        try {
            await mongoose.connect(url, options);
            console.log('Connected to MongoDB database');
        } catch (error) {
            console.log('Database connection error:', error);
            console.log('Make sure MongoDB is running on your system');
            process.exit(1); // Exit if can't connect to database
        }
    }
};

// Export database object
module.exports = database;