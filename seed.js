// seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Import your models
const User = require('./models/User');
const Session = require('./models/Session');
const Goal = require('./models/Goal');
const Mood = require('./models/Mood');

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/hypnos', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Session.deleteMany({});
        await Goal.deleteMany({});
        await Mood.deleteMany({});

        // Create sample users with hashed passwords
        console.log('Creating sample users...');
        const sampleUsers = [
            {
				// will be used to demo 5 samples for each CRUD
                username: 'JohnMiguel',
                email: 'john.miguel@email.com',
                password: await bcrypt.hash('Hello!123', 10),
                createdAt: new Date()
            },
            {
                username: 'JuanDelaCruz', 
                email: 'juan.delacruz@email.com',
                password: await bcrypt.hash('Pilipinas', 10),
                createdAt: new Date()
            },
            {
                username: 'SophiaCruz',
                email: 'sophia.cruz@email.com',
                password: await bcrypt.hash('12345', 10),
                createdAt: new Date()
            },
            {
                username: 'JoseRizal',
                email: 'jose.rizal@email.com',
                password: await bcrypt.hash('54321', 10),
                createdAt: new Date()
            },
            {
                username: 'MannyPacman',
                email: 'manny.pacman@email.com',
                password: await bcrypt.hash('labanlang', 10),
                createdAt: new Date()
            }
        ];
        
        const createdUsers = await User.insertMany(sampleUsers);
        const johnUser = createdUsers.find(user => user.username === 'JohnMiguel');
        const juanUser = createdUsers.find(user => user.username === 'JuanDelaCruz');
        const sophiaUser = createdUsers.find(user => user.username === 'SophiaCruz');
        const joseUser = createdUsers.find(user => user.username === 'JoseRizal');
        const mannyUser = createdUsers.find(user => user.username === 'MannyPacman');

        console.log('Creating sample sessions...');
        const sampleSessions = [
            // JohnMiguel sessions
            {
                userId: johnUser._id,
                category: 'Social Media',
                duration: 85, // 1 hour 25 minutes
                date: new Date(), // Today
                notes: 'Scrolling through Instagram and Facebook'
            },
            {
                userId: johnUser._id,
                category: 'Work',
                duration: 245, // 4 hours 5 minutes
                date: new Date(), // Today
                notes: 'Work projects and emails'
            },
            {
                userId: johnUser._id,
                category: 'Gaming',
                duration: 65, // 1 hour 5 minutes
                date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
                notes: 'Played some video games'
            },
            {
                userId: johnUser._id,
                category: 'Study',
                duration: 120, // 2 hours
                date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
                notes: 'Online course and research'
            },
            {
                userId: johnUser._id,
                category: 'Movies',
                duration: 95, // 1 hour 35 minutes
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                notes: 'Watched a movie on Netflix'
            },
            // JuanDelaCruz sessions
            {
                userId: juanUser._id,
                category: 'Social Media',
                duration: 45,
                date: new Date(),
                notes: 'Quick social media check'
            },
            {
                userId: juanUser._id,
                category: 'Work',
                duration: 320,
                date: new Date(),
                notes: 'Office work and meetings'
            },
            // SophiaCruz sessions
            {
                userId: sophiaUser._id,
                category: 'Study',
                duration: 180,
                date: new Date(),
                notes: 'Research for school project'
            },
            // JoseRizal sessions
            {
                userId: joseUser._id,
                category: 'Gaming',
                duration: 150,
                date: new Date(),
                notes: 'Multiplayer gaming session'
            },
            // MannyPacman sessions
            {
                userId: mannyUser._id,
                category: 'Movies',
                duration: 120,
                date: new Date(),
                notes: 'Movie marathon'
            }
        ];
        await Session.insertMany(sampleSessions);

        console.log('Creating sample goals...');
        const sampleGoals = [
            // JohnMiguel goals (5 active goals)
            {
                userId: johnUser._id,
                name: 'Reduce Social Media Time',
                category: 'Social Media',
                description: 'Limit social media usage to less than 1 hour per day',
                timeLimit: 60, // 1 hour in minutes
                timePeriod: 'daily',
                currentProgress: 85,
                status: 'active',
                streak: 5
            },
            {
                userId: johnUser._id,
                name: 'Work-Life Balance',
                category: 'Work',
                description: 'Keep work-related screen time under 6 hours per day',
                timeLimit: 360, // 6 hours
                timePeriod: 'daily',
                currentProgress: 245,
                status: 'active',
                streak: 12
            },
            {
                userId: johnUser._id,
                name: 'Gaming Moderation',
                category: 'Gaming',
                description: 'Limit gaming sessions to 2 hours per day maximum',
                timeLimit: 120, // 2 hours
                timePeriod: 'daily',
                currentProgress: 65,
                status: 'active',
                streak: 3
            },
            {
                userId: johnUser._id,
                name: 'Study Consistency',
                category: 'Study',
                description: 'Study for at least 1 hour every day',
                timeLimit: 60,
                timePeriod: 'daily',
                currentProgress: 120,
                status: 'active',
                streak: 7
            },
            {
                userId: johnUser._id,
                name: 'Entertainment Limit',
                category: 'Movies',
                description: 'Keep entertainment screen time under 3 hours daily',
                timeLimit: 180, // 3 hours
                timePeriod: 'daily',
                currentProgress: 95,
                status: 'active',
                streak: 2
            },
            // Other users goals
            {
                userId: juanUser._id,
                name: 'Reduce Total Screen Time',
                category: 'Other',
                description: 'Reduce overall screen time from 10 hours to 8 hours',
                timeLimit: 480, // 8 hours
                timePeriod: 'daily',
                currentProgress: 320,
                status: 'active',
                streak: 2
            },
            {
                userId: sophiaUser._id,
                name: 'Focus on Studies',
                category: 'Study',
                description: 'Limit study time to 4 hours maximum per day',
                timeLimit: 240,
                timePeriod: 'daily',
                currentProgress: 180,
                status: 'active',
                streak: 4
            },
            {
                userId: joseUser._id,
                name: 'Gaming Time Limit',
                category: 'Gaming',
                description: 'Keep gaming under 3 hours daily',
                timeLimit: 180,
                timePeriod: 'daily',
                currentProgress: 150,
                status: 'active',
                streak: 1
            },
            {
                userId: mannyUser._id,
                name: 'Movie Time Control',
                category: 'Movies',
                description: 'Watch movies for maximum 2 hours per day',
                timeLimit: 120,
                timePeriod: 'daily',
                currentProgress: 120,
                status: 'completed',
                streak: 5,
                completedDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
        ];
        await Goal.insertMany(sampleGoals);

		console.log('Creating sample moods...');
		const sampleMoods = [
			// JohnMiguel moods
			{
				userId: johnUser._id,
				moodType: 'Good',
				moodValue: 4, 
				notes: 'Had a productive work day and stayed within my goals!',
				date: new Date(),
				screenTime: 395
			},
			{
				userId: johnUser._id,
				moodType: 'Okay',
				moodValue: 3, 
				notes: 'Feeling okay, could be better. Spent a bit too much time on social media.',
				date: new Date(Date.now() - 24 * 60 * 60 * 1000),
				screenTime: 185
			},
			{
				userId: johnUser._id,
				moodType: 'Excellent',
				moodValue: 5,
				notes: 'Excellent day! Completed all my tasks ahead of schedule and had time for gaming.',
				date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
				screenTime: 95
			},
			{
				userId: johnUser._id,
				moodType: 'Down',
				moodValue: 2, 
				notes: 'Struggled to focus today. Screen time was higher than I wanted.',
				date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
				screenTime: 420
			},
			{
				userId: johnUser._id,
				moodType: 'Good',
				moodValue: 4,
				notes: 'Good balance today. Worked efficiently and had time for hobbies.',
				date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
				screenTime: 300
			},
			// Other users moods
			{
				userId: juanUser._id,
				moodType: 'Excellent',
				moodValue: 5, 
				notes: 'Excellent day! Completed all my tasks ahead of schedule.',
				date: new Date(),
				screenTime: 365
			},
			{
				userId: sophiaUser._id,
				moodType: 'Okay',
				moodValue: 3, 
				notes: 'Average day, got some studying done.',
				date: new Date(),
				screenTime: 180
			},
			{
				userId: joseUser._id,
				moodType: 'Good',
				moodValue: 4, 
				notes: 'Great gaming session with friends!',
				date: new Date(),
				screenTime: 150
			},
			{
				userId: mannyUser._id,
				moodType: 'Excellent',
				moodValue: 5, 
				notes: 'Finished my movie goal for the week!',
				date: new Date(),
				screenTime: 120
			}
		];
		await Mood.insertMany(sampleMoods);

        console.log('Database seeded successfully!');
        console.log('\nSample users for logging in:');
        console.log('-------------------');
        console.log('Username: JohnMiguel');
        console.log('Password: Hello!123');
        console.log('\nUsername: JuanDelaCruz');
        console.log('Password: Pilipinas');
        console.log('\nUsername: SophiaCruz');
        console.log('Password: 12345');
        console.log('\nUsername: JoseRizal');
        console.log('Password: 54321');
        console.log('\nUsername: MannyPacman');
        console.log('Password: labanlang');
        console.log('\nStart your app with: npm start');
        console.log('\nRecommended: Login as JohnMiguel to see the most sample data');

        mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        mongoose.connection.close();
        process.exit(1);
    }
}

if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;