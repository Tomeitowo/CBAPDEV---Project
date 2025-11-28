const express = require('express');
const router = express.Router();

const homeController = require('../controllers/homeController');
const sessionsController = require('../controllers/sessionsController');
const goalsController = require('../controllers/goalsController');
const moodController = require('../controllers/moodController');
const insightsController = require('../controllers/insightsController');
const profileController = require('../controllers/profileController');
const authController = require('../controllers/authController');

// Import authentication middleware
const { requireAuth, requireGuest } = require('../middleware/authMiddleware');

// Parse JSON and URL-encoded bodies
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Public routes
router.get('/', requireGuest, authController.getLogin);
router.get('/register', requireGuest, authController.getRegister);

// Auth routes
router.post('/login', authController.postLogin);
router.post('/register', authController.postRegister);
router.post('/logout', authController.postLogout);

// Home/Dashboard
router.get('/home', requireAuth, homeController.getHome);

// Sessions routes
router.get('/sessions', requireAuth, sessionsController.getSessions);
router.post('/api/sessions', requireAuth, sessionsController.createSession);
router.put('/api/sessions/:id', requireAuth, sessionsController.updateSession);
router.delete('/api/sessions/:id', requireAuth, sessionsController.deleteSession);

// Goals routes
router.get('/goals', requireAuth, goalsController.getGoals);
router.post('/api/goals', requireAuth, goalsController.createGoal);
router.put('/api/goals/:id', requireAuth, goalsController.updateGoal); 
router.put('/api/goals/:id/complete', requireAuth, goalsController.completeGoal);
router.put('/api/goals/:id/reactivate', requireAuth, goalsController.reactivateGoal);
router.delete('/api/goals/:id', requireAuth, goalsController.deleteGoal);
router.post('/api/goals/update-progress', requireAuth, goalsController.updateGoalProgress);

// Mood routes
router.get('/mood', requireAuth, moodController.getMood);
router.post('/api/mood', requireAuth, moodController.createMood);
router.put('/api/mood/:id', requireAuth, moodController.updateMood);
router.delete('/api/mood/:id', requireAuth, moodController.deleteMood);

// Insights routes
router.get('/insights', requireAuth, insightsController.getInsights);

// Profile routes
router.get('/profile', requireAuth, profileController.getProfile);
router.put('/api/profile', requireAuth, profileController.updateProfile);
router.put('/api/profile/password', requireAuth, profileController.changePassword);
router.delete('/api/profile', requireAuth, profileController.deleteAccount);

module.exports = router;