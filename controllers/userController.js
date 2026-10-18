
const User = require('../models/userModel');
const Article = require('../models/articleModel');

// 1. GET : récupérer tous les utilisateurs
// Filtre optionnel : ?role=admin
const getAllUsers = async (req, res) => {
  try {
    const filter = {};

    if (req.query.role) {
      filter.role = req.query.role;
    }

    const users = await User.find(filter);

    return res.status(200).json({
      total: users.length,
      users
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// 2. GET : récupérer un utilisateur par son ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid resource identifier (ObjectId expected)'
      });
    }

    return res.status(500).json({
      message: error.message
    });
  }
};

// 3. POST : créer un utilisateur
const createUser = async (req, res) => {
  try {
    const { name, email, age, bio, phone, role } = req.body;

    const newUser = await User.create({
      name,
      email,
      age,
      bio,
      phone,
      role
    });

    return res.status(201).json({
      message: 'Utilisateur créé',
      user: newUser
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: 'Cette adresse email existe déjà'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: error.message
      });
    }

    return res.status(500).json({
      error: error.message
    });
  }
};

// 4. DELETE : supprimer un utilisateur
// Refuser la suppression si l'utilisateur possède des articles
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const article = await Article.findOne({
      author: req.params.id
    });

    if (article) {
      return res.status(400).json({
        message: 'Impossible to delete an author with published articles'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: 'User deleted successfully',
      user
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid resource identifier (ObjectId expected)'
      });
    }

    return res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  deleteUser
};
