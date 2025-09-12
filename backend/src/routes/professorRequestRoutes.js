const express = require('express');
const router = express.Router();
const professorRequestController = require('../controllers/professorRequestController');
const { auth } = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

// Ruta para crear solicitud de profesor (público)
router.post('/register', professorRequestController.uploadCarnet, professorRequestController.createProfessorRequest);

// Ruta para obtener estado de solicitud del usuario actual
router.get('/status', auth, professorRequestController.getUserRequestStatus);

// Rutas para administradores
router.get('/pending', auth, adminMiddleware, professorRequestController.getPendingRequests);
router.put('/:solicitudId/approve', auth, adminMiddleware, professorRequestController.approveRequest);
router.put('/:solicitudId/reject', auth, adminMiddleware, professorRequestController.rejectRequest);

module.exports = router;