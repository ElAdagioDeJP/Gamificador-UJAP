const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const subjectController = require('../controllers/subjectController');
const { auth } = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Todas las rutas requieren autenticación y rol de administrador
router.use(auth, adminMiddleware);

// Obtener todos los profesores con filtros y paginación
router.get('/professors', adminController.getAllProfessors);

// Obtener detalles de un profesor específico
router.get('/professors/:id', adminController.getProfessorDetails);

// Cambiar estado de verificación de un profesor
router.put('/professors/:id/status', adminController.updateProfessorStatus);

// Materias - CRUD y asignaciones
router.get('/subjects', subjectController.getAllSubjectsAdmin);
router.get('/subjects/:id', subjectController.getSubjectById);
router.post('/subjects', subjectController.createSubject);
router.put('/subjects/:id', subjectController.updateSubject);
router.delete('/subjects/:id', subjectController.deleteSubject);

// Estadísticas generales del sistema
router.get('/system/statistics', adminController.getSystemStatistics);

// Asignaciones
router.post('/subjects/:id/professors', subjectController.assignProfessorsToSubject);
router.post('/professors/:id/subjects', subjectController.assignSubjectsToProfessor);

module.exports = router;
