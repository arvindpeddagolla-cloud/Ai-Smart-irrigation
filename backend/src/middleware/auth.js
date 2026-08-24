import jwt from 'jsonwebtoken';
import { mockDBActions } from '../config/mockDb.js';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'smart_irrigation_secret_key_99';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route, no token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Database check (Mongoose vs Mock)
    if (global.isMockDB) {
      const user = mockDBActions.findById('users', decoded.id);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User no longer exists in mock database.' });
      }
      req.user = user;
    } else {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'User no longer exists in database.' });
      }
      req.user = user;
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token validation failed, authorization denied.' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user ? req.user.role : 'GUEST'}' is not authorized to access this resource.`
      });
    }
    next();
  };
};
