const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
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

module.exports = router;
