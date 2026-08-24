import express from 'express';
import { mockDBActions, mockDB } from '../config/mockDb.js';
import Device from '../models/Device.js';
import Warranty from '../models/Warranty.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/devices/register
// @desc    Register a new device for a farmer
router.post('/register', protect, async (req, res) => {
  const { model, serialNumber, purchaseDate } = req.body;

  if (!serialNumber || !purchaseDate) {
    return res.status(400).json({ success: false, message: 'Serial number and purchase date are required.' });
  }

  try {
    const pDate = new Date(purchaseDate);
    const expDate = new Date(pDate.getTime());
    expDate.setFullYear(expDate.getFullYear() + 1); // 1-year warranty standard

    if (global.isMockDB) {
      // Check if device already registered
      const deviceExists = mockDB.devices.find(d => d.serialNumber === serialNumber);
      if (deviceExists) {
        return res.status(400).json({ success: false, message: 'Device with this serial number is already registered.' });
      }

      // Check if warranty exists in mock, otherwise create it
      let warranty = mockDB.warranties.find(w => w.serialNumber === serialNumber);
      if (!warranty) {
        warranty = mockDBActions.create('warranties', {
          serialNumber,
          productName: model || 'Smart Irrigation V1',
          purchaseDate: pDate,
          expiryDate: expDate,
          status: 'ACTIVE'
        });
      }

      const newDevice = mockDBActions.create('devices', {
        model: model || 'Smart Irrigation V1',
        serialNumber,
        owner: req.user._id,
        firmwareVersion: 'v1.0.0',
        purchaseDate: pDate,
        batteryLevel: 100,
        status: 'ONLINE',
        sensors: {
          soilMoisture: { status: 'ONLINE', value: 50 },
          dht22: { status: 'ONLINE', temp: 28, humidity: 60 },
          wifi: { status: 'ONLINE', signalStrength: -70 },
          weatherApi: { status: 'ONLINE' },
          battery: { status: 'ONLINE', health: 'GOOD' }
        },
        registeredAt: new Date()
      });

      return res.status(201).json({ success: true, device: newDevice, warranty });
    } else {
      // Mongoose DB
      const deviceExists = await Device.findOne({ serialNumber });
      if (deviceExists) {
        return res.status(400).json({ success: false, message: 'Device with this serial number is already registered.' });
      }

      // Find or create warranty
      let warranty = await Warranty.findOne({ serialNumber });
      if (!warranty) {
        warranty = await Warranty.create({
          serialNumber,
          productName: model || 'Smart Irrigation V1',
          purchaseDate: pDate,
          expiryDate: expDate,
          status: 'ACTIVE'
        });
      }

      const device = await Device.create({
        model: model || 'Smart Irrigation V1',
        serialNumber,
        owner: req.user._id,
        purchaseDate: pDate,
        firmwareVersion: 'v1.0.0',
        registeredAt: new Date()
      });

      return res.status(201).json({ success: true, device, warranty });
    }
  } catch (error) {
    console.error('Device registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during device registration.' });
  }
});

// @route   GET /api/devices
// @desc    Get all devices for logged in farmer
router.get('/', protect, async (req, res) => {
  try {
    if (global.isMockDB) {
      // Filter mock devices by owner ID
      const userDevices = mockDB.devices.filter(d => d.owner === req.user._id);
      return res.json({ success: true, devices: userDevices });
    } else {
      const devices = await Device.find({ owner: req.user._id });
      res.json({ success: true, devices });
    }
  } catch (error) {
    console.error('Fetch devices error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching devices.' });
  }
});

// @route   GET /api/devices/:serialNumber
// @desc    Get a single device by serial number
router.get('/:serialNumber', protect, async (req, res) => {
  const { serialNumber } = req.params;

  try {
    if (global.isMockDB) {
      const device = mockDB.devices.find(d => d.serialNumber === serialNumber);
      if (!device) {
        return res.status(404).json({ success: false, message: 'Device not found.' });
      }
      return res.json({ success: true, device });
    } else {
      const device = await Device.findOne({ serialNumber });
      if (!device) {
        return res.status(404).json({ success: false, message: 'Device not found.' });
      }
      res.json({ success: true, device });
    }
  } catch (error) {
    console.error('Fetch device by serial error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching device.' });
  }
});

export default router;
