
const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

const {
  protect,
  adminOnly
} = require('../Middlewares/authMiddleware');

// ========================================
// PUBLIC ROUTES — No token required
// ========================================

// Register a new user
router.post('/register', userController.registerUser);

// Login and receive a JWT
router.post('/login', userController.loginUser);

// ========================================
// PROTECTED ROUTES — JWT required
// ========================================

// Get the authenticated user's profile
router.get('/profile', protect, userController.getUserProfile);
// EXERCICE 1 : Secure Password Update
router.put('/update-password', protect, userController.updatePassword);

// Get all users — administrators only
router.get('/', protect, adminOnly, userController.getAllUsers);
router.put('/:id/role', protect, adminOnly, userController.promoteUserToAdmin);
// Get one user by ID — authenticated users
router.get('/:id', protect, userController.getUserById);

// Create a user — administrators only
router.post('/', protect, adminOnly, userController.createUser);

// Delete a user — administrators only
router.delete('/:id', protect, adminOnly, userController.deleteUser);

module.exports = router;
