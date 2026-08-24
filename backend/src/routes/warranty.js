import express from 'express';
import { mockDBActions, mockDB } from '../config/mockDb.js';
import Warranty from '../models/Warranty.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/warranty/:serialNumber
// @desc    Check warranty status for a device serial number
router.get('/:serialNumber', protect, async (req, res) => {
  const { serialNumber } = req.params;

  try {
    if (global.isMockDB) {
      const warranty = mockDB.warranties.find(w => w.serialNumber === serialNumber);
      if (!warranty) {
        return res.status(404).json({
          success: false,
          status: 'NOT_FOUND',
          message: `No warranty record found for serial number ${serialNumber}.`
        });
      }
      
      const now = new Date();
      const isExpired = now > new Date(warranty.expiryDate);
      warranty.status = isExpired ? 'EXPIRED' : 'ACTIVE';

      return res.json({ success: true, warranty });
    } else {
      const warranty = await Warranty.findOne({ serialNumber });
      if (!warranty) {
        return res.status(404).json({
          success: false,
          status: 'NOT_FOUND',
          message: `No warranty record found for serial number ${serialNumber}.`
        });
      }

      const now = new Date();
      const isExpired = now > warranty.expiryDate;
      warranty.status = isExpired ? 'EXPIRED' : 'ACTIVE';
      await warranty.save();

      return res.json({ success: true, warranty });
    }
  } catch (error) {
    console.error('Warranty check error:', error);
    res.status(500).json({ success: false, message: 'Server error checking warranty record.' });
  }
});

export default router;
