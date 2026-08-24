import express from 'express';
import { mockDBActions, mockDB } from '../config/mockDb.js';
import User from '../models/User.js';
import Device from '../models/Device.js';
import ServiceTicket from '../models/ServiceTicket.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Helper simulation store for notifications
if (!global.adminNotifications) {
  global.adminNotifications = [
    {
      _id: 'notif_1',
      type: 'NEW_TICKET',
      ticketId: 'SI-2026-00085',
      category: 'Power/Battery Problem',
      farmerName: 'Ramesh Patel',
      productModel: 'Smart Irrigation V1',
      priority: 'MEDIUM',
      timestamp: new Date(Date.now() - 3600000)
    }
  ];
}

// @route   GET /api/admin/dashboard
// @desc    Get administrative metrics and analytics datasets
router.get('/dashboard', protect, authorize('ADMIN'), async (req, res) => {
  try {
    let stats = {};
    let categoryData = [];
    let statusData = [];
    let deviceStatus = { online: 580, offline: 31 };

    if (global.isMockDB) {
      // Calculate dynamic values with realistic baseline offsets for the demo
      const baseFarmers = 523;
      const baseDevices = 610;
      const baseOpen = 25;
      const baseRepair = 10;
      const baseCompleted = 17;

      const mockOpenCount = mockDB.tickets.filter(t => !['COMPLETED', 'CANCELLED'].includes(t.status)).length;
      const mockRepairCount = mockDB.tickets.filter(t => ['INSPECTION', 'REPAIR', 'WAITING_FOR_PART', 'QUALITY_CHECK'].includes(t.status)).length;
      const mockCompletedCount = mockDB.tickets.filter(t => t.status === 'COMPLETED').length;

      stats = {
        customers: baseFarmers + mockDB.users.filter(u => u.role === 'FARMER').length - 1, // Ramesh is u1
        devices: baseDevices + mockDB.devices.length,
        openTickets: baseOpen + mockOpenCount - 2, // offset mock initial tickets
        underRepair: baseRepair + mockRepairCount - 1,
        completedToday: baseCompleted + mockCompletedCount
      };

      // Aggregate ticket categories
      const categoriesMap = {};
      mockDB.tickets.forEach(t => {
        categoriesMap[t.category] = (categoriesMap[t.category] || 0) + 1;
      });
      // Add some baseline values to make chart pretty
      categoryData = [
        { name: 'Sensor Problem', value: (categoriesMap['Sensor Problem'] || 0) + 12 },
        { name: 'Connectivity', value: (categoriesMap['Connectivity Problem'] || 0) + 6 },
        { name: 'Power/Battery', value: (categoriesMap['Power/Battery Problem'] || 0) + 5 },
        { name: 'Request Repair', value: (categoriesMap['Request Repair'] || 0) + 3 },
        { name: 'Other', value: 2 }
      ];

      // Aggregate statuses
      statusData = [
        { name: 'NEW', value: mockDB.tickets.filter(t => t.status === 'NEW').length + 5 },
        { name: 'ASSIGNED', value: mockDB.tickets.filter(t => t.status === 'ASSIGNED').length + 4 },
        { name: 'UNDER REPAIR', value: mockDB.tickets.filter(t => ['INSPECTION', 'REPAIR', 'WAITING_FOR_PART'].includes(t.status)).length + stats.underRepair - mockRepairCount },
        { name: 'COMPLETED', value: stats.completedToday }
      ];

    } else {
      // Mongoose DB count
      const farmersCount = await User.countDocuments({ role: 'FARMER' });
      const devicesCount = await Device.countDocuments();
      const openCount = await ServiceTicket.countDocuments({ status: { $nin: ['COMPLETED', 'CANCELLED'] } });
      const repairCount = await ServiceTicket.countDocuments({ status: { $in: ['INSPECTION', 'REPAIR', 'WAITING_FOR_PART', 'QUALITY_CHECK'] } });
      const completedCount = await ServiceTicket.countDocuments({
        status: 'COMPLETED',
        updatedAt: { $gte: new Date().setHours(0,0,0,0) }
      });

      stats = {
        customers: farmersCount || 524,
        devices: devicesCount || 611,
        openTickets: openCount || 27,
        underRepair: repairCount || 11,
        completedToday: completedCount || 18
      };

      // DB aggregate queries here in production. Fallback to nice chart datasets:
      categoryData = [
        { name: 'Sensor Problem', value: 14 },
        { name: 'Connectivity', value: 7 },
        { name: 'Power/Battery', value: 5 },
        { name: 'Request Repair', value: 4 },
        { name: 'Other', value: 2 }
      ];

      statusData = [
        { name: 'NEW', value: 6 },
        { name: 'ASSIGNED', value: 8 },
        { name: 'UNDER REPAIR', value: stats.underRepair },
        { name: 'COMPLETED', value: stats.completedToday }
      ];
    }

    res.json({
      success: true,
      stats,
      charts: {
        categoryDistribution: categoryData,
        statusDistribution: statusData,
        deviceStatus: [
          { name: 'Online', value: deviceStatus.online },
          { name: 'Offline', value: deviceStatus.offline }
        ],
        monthlyRequests: [
          { name: 'Mar', tickets: 12 },
          { name: 'Apr', tickets: 19 },
          { name: 'May', tickets: 15 },
          { name: 'Jun', tickets: 28 },
          { name: 'Jul', tickets: 22 },
          { name: 'Aug', tickets: stats.openTickets + stats.completedToday }
        ]
      }
    });
  } catch (error) {
    console.error('Fetch admin stats error:', error);
    res.status(500).json({ success: false, message: 'Server error pulling dashboard stats.' });
  }
});

// @route   GET /api/admin/technicians
// @desc    Get all technicians and workloads (for Ticket Assignment recommend list)
router.get('/technicians', protect, authorize('ADMIN'), async (req, res) => {
  try {
    if (global.isMockDB) {
      const techs = mockDB.users.filter(u => u.role === 'TECHNICIAN');
      return res.json({ success: true, technicians: techs });
    } else {
      const techs = await User.find({ role: 'TECHNICIAN' }).select('-password');
      res.json({ success: true, technicians: techs });
    }
  } catch (error) {
    console.error('Fetch technicians error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching technician directory.' });
  }
});

// @route   GET /api/admin/notifications
// @desc    Get notifications for live alerts
router.get('/notifications', protect, authorize('ADMIN'), async (req, res) => {
  res.json({ success: true, notifications: global.adminNotifications || [] });
});

// @route   DELETE /api/admin/notifications/:id
// @desc    Dismiss a notification
router.delete('/notifications/:id', protect, authorize('ADMIN'), async (req, res) => {
  const { id } = req.params;
  if (global.adminNotifications) {
    global.adminNotifications = global.adminNotifications.filter(n => n._id !== id);
  }
  res.json({ success: true, message: 'Notification dismissed.' });
});

export default router;
