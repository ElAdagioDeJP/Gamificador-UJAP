const express = require('express');
const authRoutes = require('./authRoutes');
const { auth } = require('../middlewares/auth');
const gameController = require('../controllers/gameController');
const leaderboardController = require('../controllers/leaderboardController');
const teacherController = require('../controllers/teacherController');
const userController = require('../controllers/userController');
const subjectController = require('../controllers/subjectController');
const missionController = require('../controllers/missionController');

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

// Missions (teacher)
router.post('/teacher/missions', auth(true), missionController.createMission);
router.get('/teacher/missions', auth(true), missionController.listMissions);
router.get('/teacher/missions/pending', auth(true), missionController.listPendingSubmissions);
router.post('/teacher/missions/:missionId/students/:studentId/approve', auth(true), missionController.approveSubmission);
router.post('/teacher/missions/:missionId/students/:studentId/reject', auth(true), missionController.rejectSubmission);

// Missions (student)
router.post('/missions/:id/submit', auth(true), missionController.submitMission); // submit normal mission for approval
router.get('/game/daily', auth(true), missionController.getTodayDailyMission);
router.post('/game/daily/:missionId/submit', auth(true), missionController.submitDailyMissionAnswers);

module.exports = router;
