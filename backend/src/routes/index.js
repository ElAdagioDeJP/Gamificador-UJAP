const express = require('express');
const authRoutes = require('./authRoutes');
const { auth } = require('../middlewares/auth');
const gameController = require('../controllers/gameController');
const leaderboardController = require('../controllers/leaderboardController');
const teacherController = require('../controllers/teacherController');
const userController = require('../controllers/userController');
const subjectController = require('../controllers/subjectController');

const router = express.Router();

router.use('/auth', authRoutes);

// Game data
router.get('/game', auth(true), gameController.getSummary);
router.post('/missions/:id/complete', auth(true), gameController.completeMission);

// Leaderboard
router.get('/leaderboard', auth(false), leaderboardController.getLeaderboard);

// Teacher endpoints
router.get('/teacher/students', auth(true), teacherController.listStudents);
router.get('/teacher/assignments', auth(true), teacherController.listAssignments);
router.get('/teacher/submissions', auth(true), teacherController.listSubmissions);
router.post('/teacher/submissions/:submissionId/grade', auth(true), teacherController.gradeSubmission);
router.get('/teacher/stats', auth(true), teacherController.getStats);

// User
router.put('/user/profile', auth(true), userController.updateProfile);

// Subjects (Materias)
router.get('/subjects', auth(true), subjectController.getStudentSubjects);
router.get('/teacher/subjects', auth(true), subjectController.getTeacherSubjects);

module.exports = router;
