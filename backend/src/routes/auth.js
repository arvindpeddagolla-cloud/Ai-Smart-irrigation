import express from 'express';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { mockDBActions, mockDB } from '../config/mockDb.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'smart_irrigation_secret_key_99';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user (Farmer, Admin, or Technician)
router.post('/register', async (req, res) => {
  const { name, email, password, role, phone, specialty } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ success: false, message: 'Please provide name, email, password, and phone.' });
  }

  try {
    if (global.isMockDB) {
      // Check if user exists in mock
      const userExists = mockDB.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists in mock database.' });
      }

      // Hash password
      const salt = bcryptjs.genSaltSync(10);
      const hashedPassword = bcryptjs.hashSync(password, salt);

      const newUser = mockDBActions.create('users', {
        name,
        email,
        password: hashedPassword,
        role: role || 'FARMER',
        phone,
        specialty: role === 'TECHNICIAN' ? (specialty || 'FIELD') : undefined,
        activeJobs: role === 'TECHNICIAN' ? 0 : undefined,
        status: role === 'TECHNICIAN' ? 'ONLINE' : undefined
      });

      const token = generateToken(newUser._id);
      const userResponse = { ...newUser };
      delete userResponse.password;

      return res.status(201).json({ success: true, token, user: userResponse });
    } else {
      // Mongoose DB
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists.' });
      }

      const user = await User.create({
        name,
        email,
        password,
        role: role || 'FARMER',
        phone,
        specialty: role === 'TECHNICIAN' ? (specialty || 'FIELD') : undefined,
        activeJobs: role === 'TECHNICIAN' ? 0 : undefined,
        status: role === 'TECHNICIAN' ? 'ONLINE' : undefined
      });

      const token = generateToken(user._id);
      const userResponse = user.toObject();
      delete userResponse.password;

      return res.status(201).json({ success: true, token, user: userResponse });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password.' });
  }

  try {
    if (global.isMockDB) {
      const user = mockDB.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid credentials.' });
      }

      const isMatch = bcryptjs.compareSync(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid credentials.' });
      }

      const token = generateToken(user._id);
      const userResponse = { ...user };
      delete userResponse.password;

      return res.json({ success: true, token, user: userResponse });
    } else {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid credentials.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid credentials.' });
      }

      const token = generateToken(user._id);
      const userResponse = user.toObject();
      delete userResponse.password;

      return res.json({ success: true, token, user: userResponse });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
router.get('/me', protect, async (req, res) => {
  const userResponse = { ...req.user };
  if (userResponse.password) {
    delete userResponse.password;
  }
  res.json({ success: true, user: userResponse });
});

export default router;
