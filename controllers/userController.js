
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const Article = require('../models/articleModel');

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: '1s' }
  );
};

// 1. POST: Register a new user
const registerUser = async (req, res) => {
  try {
const { name, email, password, age, bio, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required'
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(409).json({
        message: 'Email is already registered'
      });
    }

    // Hash the password before saving it
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
  name,
  email,
  password: hashedPassword,
  age,
  bio,
  phone,
  role: 'user'
});

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Email is already registered'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: error.message
      });
    }

    return res.status(500).json({
      message: error.message
    });
  }
};

// 2. POST: Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Compare the submitted password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role)
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// 3. GET: Get all users
// Optional filter: ?role=admin
const getAllUsers = async (req, res) => {
  try {
    const filter = {};

    if (req.query.role) {
      filter.role = req.query.role;
    }

    // Never return passwords or password hashes
    const users = await User.find(filter).select('-password');

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

// 4. GET: Get a user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');

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

// 5. POST: Create a user (previous CRUD operation)
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
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        age: newUser.age,
        bio: newUser.bio,
        phone: newUser.phone,
        role: newUser.role
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Cette adresse email existe déjà'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: error.message
      });
    }

    return res.status(500).json({
      message: error.message
    });
  }
};

// 6. DELETE: Delete a user
// Refuse deletion if the user has published articles
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
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
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

// 7. GET: Get the authenticated user's profile
// Requires authentication middleware to set req.user
const getUserProfile = async (req, res) => {
  try {
    return res.status(200).json(req.user);
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// Update the authenticated user's password
const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Check that both passwords are provided
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        message: 'Old password and new password are required'
      });
    }

    // Check the minimum length of the new password
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must contain at least 6 characters'
      });
    }

    // Find the authenticated user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Verify the old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Old password is incorrect'
      });
    }

    // Hash the new password before saving it
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    return res.status(200).json({
      message: 'Password updated successfully'
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};
// Promote a user to admin
const promoteUserToAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    user.role = 'admin';
    await user.save();

    return res.status(200).json({
      message: 'User promoted to admin successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
};

// ==========================================
// EXERCICE 1 : Secure Password Update
// ==========================================
// ==========================================

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  createUser,
  deleteUser,
  getUserProfile,
  updatePassword,
  promoteUserToAdmin
};