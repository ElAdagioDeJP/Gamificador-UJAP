const express = require('express');
const authRoutes = require('./authRoutes');
const professorRequestRoutes = require('./professorRequestRoutes');
const adminRoutes = require('./adminRoutes');
const { auth } = require('../middlewares/auth');
const gameController = require('../controllers/gameController');
const leaderboardController = require('../controllers/leaderboardController');
const teacherController = require('../controllers/teacherController');
const userController = require('../controllers/userController');
const subjectController = require('../controllers/subjectController');
const missionController = require('../controllers/missionController');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/professor-requests', professorRequestRoutes);
router.use('/admin', adminRoutes);

// Game data
router.get('/game', auth(true), gameController.getSummary);
router.post('/missions/:id/complete', auth(true), gameController.completeMission);
router.post('/skills/redeem/partial', auth(true), gameController.redeemPartial);

// Leaderboard
router.get('/leaderboard', auth(false), leaderboardController.getLeaderboard);

// Teacher endpoints
router.get('/teacher/students', auth(true), teacherController.listStudents);
router.get('/teacher/assignments', auth(true), teacherController.listAssignments);
router.get('/teacher/submissions', auth(true), teacherController.listSubmissions);
router.post('/teacher/submissions/:submissionId/grade', auth(true), teacherController.gradeSubmission);
router.get('/teacher/stats', auth(true), teacherController.getStats);
router.post('/teacher/subjects/:subjectId/students', auth(true), teacherController.enrollStudent);
router.delete('/teacher/subjects/:subjectId/students/:studentId', auth(true), teacherController.unenrollStudent);

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

// Backwards-friendly teacher assignments endpoints (map to missions CRUD)
router.get('/teacher/assignments', auth(true), teacherController.listAssignments);
router.post('/teacher/assignments', auth(true), missionController.createMission);
router.put('/teacher/assignments/:missionId', auth(true), missionController.updateMission);
router.delete('/teacher/assignments/:missionId', auth(true), missionController.deleteMission);

// Missions (student)
router.post('/missions/:id/submit', auth(true), missionController.submitMission); // submit normal mission for approval
router.get('/game/daily', auth(true), missionController.getTodayDailyMission);
router.post('/game/daily/:missionId/submit', auth(true), missionController.submitDailyMissionAnswers);

module.exports = router;
