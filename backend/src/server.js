import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { connectDB, getDBStatus } from './config/db.js';

// Import Route handlers
import authRoutes from './routes/auth.js';
import deviceRoutes from './routes/devices.js';
import iotRoutes from './routes/iot.js';
import ticketRoutes from './routes/tickets.js';
import weatherRoutes from './routes/weather.js';
import upgradeRoutes from './routes/upgrades.js';
import warrantyRoutes from './routes/warranty.js';
import aiRoutes from './routes/ai.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Multer for simulated uploads (stored in memory)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB Max
});

// @route   POST /api/upload
// @desc    Upload attachments (Invoices, Photos, Videos)
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file provided.' });
  }

  // Generate a mock URL (in production this would upload to S3/Cloudinary/etc.)
  const fileUrl = `https://smart-irrigation-iot-bucket.s3.amazonaws.com/uploads/${Date.now()}-${req.file.originalname}`;

  res.json({
    success: true,
    file: {
      name: req.file.originalname,
      url: fileUrl,
      type: req.file.mimetype.split('/')[0] // 'image', 'video', 'application' etc
    }
  });
});

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/iot', iotRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/upgrades', upgradeRoutes);
app.use('/api/warranty', warrantyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Base route status checking
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Irrigation IoT Backend is active',
    timestamp: new Date(),
    databaseMode: getDBStatus()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to Database first
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\x1b[36m%s\x1b[0m`, `🚀 Smart Irrigation server running on port ${PORT} [Mode: ${getDBStatus()}]`);
  });
});
