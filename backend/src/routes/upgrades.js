import express from 'express';
import { mockDBActions, mockDB } from '../config/mockDb.js';
import UpgradeRequest from '../models/UpgradeRequest.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/upgrades
// @desc    Create a new device upgrade request
router.post('/', protect, async (req, res) => {
  const { serialNumber, currentModel, requestedUpgrade } = req.body;

  if (!serialNumber || !requestedUpgrade) {
    return res.status(400).json({ success: false, message: 'Please provide serial number and requested upgrade model.' });
  }

  try {
    if (global.isMockDB) {
      // Check if upgrade already exists
      const existing = mockDB.upgrades.find(u => u.serialNumber === serialNumber && u.status === 'PENDING');
      if (existing) {
        return res.status(400).json({ success: false, message: 'An upgrade request is already pending for this device.' });
      }

      const reqUpgrade = mockDBActions.create('upgrades', {
        farmerId: req.user._id,
        farmerName: req.user.name,
        serialNumber,
        currentModel: currentModel || 'Smart Irrigation V1',
        requestedUpgrade,
        status: 'PENDING'
      });

      return res.status(201).json({ success: true, upgrade: reqUpgrade });
    } else {
      // Mongoose DB
      const existing = await UpgradeRequest.findOne({ serialNumber, status: 'PENDING' });
      if (existing) {
        return res.status(400).json({ success: false, message: 'An upgrade request is already pending for this device.' });
      }

      const reqUpgrade = await UpgradeRequest.create({
        farmerId: req.user._id,
        farmerName: req.user.name,
        serialNumber,
        currentModel: currentModel || 'Smart Irrigation V1',
        requestedUpgrade,
        status: 'PENDING'
      });

      return res.status(201).json({ success: true, upgrade: reqUpgrade });
    }
  } catch (error) {
    console.error('Upgrade request error:', error);
    res.status(500).json({ success: false, message: 'Server error filing upgrade request.' });
  }
});

// @route   GET /api/upgrades
// @desc    Get all upgrade requests
router.get('/', protect, async (req, res) => {
  try {
    if (global.isMockDB) {
      let items = [];
      if (req.user.role === 'ADMIN') {
        items = mockDB.upgrades;
      } else {
        items = mockDB.upgrades.filter(u => u.farmerId === req.user._id);
      }
      return res.json({ success: true, upgrades: items });
    } else {
      let query = {};
      if (req.user.role !== 'ADMIN') {
        query = { farmerId: req.user._id };
      }
      const upgrades = await UpgradeRequest.find(query).sort({ createdAt: -1 });
      res.json({ success: true, upgrades });
    }
  } catch (error) {
    console.error('Fetch upgrades error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching upgrades list.' });
  }
});

// @route   PATCH /api/upgrades/:id/status
// @desc    Update upgrade request status (Admin route)
router.patch('/:id/status', protect, authorize('ADMIN'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Please provide status.' });
  }

  try {
    if (global.isMockDB) {
      const upgrade = mockDB.upgrades.find(u => u._id === id);
      if (!upgrade) {
        return res.status(404).json({ success: false, message: 'Upgrade request not found.' });
      }
      upgrade.status = status;
      return res.json({ success: true, upgrade });
    } else {
      const upgrade = await UpgradeRequest.findByIdAndUpdate(id, { status }, { new: true });
      if (!upgrade) {
        return res.status(404).json({ success: false, message: 'Upgrade request not found.' });
      }
      return res.json({ success: true, upgrade });
    }
  } catch (error) {
    console.error('Update upgrade status error:', error);
    res.status(500).json({ success: false, message: 'Server error updating upgrade request.' });
  }
});

export default router;
