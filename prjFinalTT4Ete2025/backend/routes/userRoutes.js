const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authenticateToken } = require('../middleware/auth');

// Routes publiques
router.post('/register', UserController.register);
router.post('/login', UserController.login);

// Routes protégées (nécessitent une authentification)
router.get('/profile', authenticateToken, UserController.getProfile);
router.put('/profile', authenticateToken, UserController.updateProfile);
router.get('/all', authenticateToken, UserController.getAllUsers);

module.exports = router;
