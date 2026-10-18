// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET : récupérer tous les utilisateurs
router.get('/', userController.getAllUsers);

// GET : récupérer un utilisateur par ID
router.get('/:id', userController.getUserById);

// POST : créer un utilisateur
router.post('/', userController.createUser);

// DELETE : supprimer un utilisateur
router.delete('/:id', userController.deleteUser);

module.exports = router;