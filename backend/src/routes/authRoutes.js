const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');
const { auth } = require('../middlewares/auth');

const router = express.Router();

router.post(
  '/register',
  [
    body('username').optional().isString().trim().isLength({ min: 3 }),
    body('name').optional().isString().trim().isLength({ min: 3 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 6 }),
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 6 }),
  ],
  validate,
  authController.login
);

// Me endpoint
router.get('/me', auth(true), authController.me);

module.exports = router;
