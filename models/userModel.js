
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\S+@\S+\.\S+$/,
        'Invalid email format'
      ]
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },

    age: {
      type: Number,
      min: [4, 'Minimum age is 4 years old'],
      max: [120, 'Maximum age is 120 years old']
    },

    bio: {
      type: String,
      maxlength: [200, 'Bio cannot exceed 200 characters']
    },

    phone: {
      type: String,
      match: [
        /^\d{8}$/,
        '8-digit phone number required'
      ]
    },

    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: '{VALUE} is not an authorized role'
      },
      default: 'user'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
