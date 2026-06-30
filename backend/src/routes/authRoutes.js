const express = require('express');
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

router.post('/login', authController.login);
router.post('/login/fayda', authController.loginWithFayda);
router.post('/register/student', authController.registerStudent);
router.post('/register/employer', authController.registerEmployer);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

module.exports = router;
