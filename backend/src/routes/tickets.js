import express from 'express';
import { mockDBActions, mockDB } from '../config/mockDb.js';
import ServiceTicket from '../models/ServiceTicket.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { classifyIssue } from '../services/aiService.js';
import { sendTicketConfirmationEmail } from '../services/emailService.js';

const router = express.Router();

// Helper to generate Unique Ticket ID: SI-2026-XXXXX
const generateTicketId = () => {
  const randNum = Math.floor(10000 + Math.random() * 90000);
  return `SI-2026-${randNum}`;
};

// @route   POST /api/tickets
// @desc    Create a new service support ticket
router.post('/', protect, async (req, res) => {
  const { serialNumber, productModel, category, description, location, attachments, priority, farmerName, farmerPhone, email } = req.body;

  if (!serialNumber || !productModel || !category || !description) {
    return res.status(400).json({ success: false, message: 'Please provide serialNumber, productModel, category, and description.' });
  }

  try {
    const ticketId = generateTicketId();

    // Auto classify issue via AI layer to suggest specialty and priority if not provided
    const aiClassification = classifyIssue(description);
    const resolvedPriority = priority || aiClassification.recommendedPriority || 'MEDIUM';
    const suggestedSpecialty = aiClassification.recommendedSpecialty || 'HARDWARE';

    const timeline = [
      {
        status: 'NEW',
        note: `Ticket created. Issue classified as ${category} (${suggestedSpecialty}).`,
        timestamp: new Date()
      }
    ];

    let savedTicket;

    if (global.isMockDB) {
      const newTicket = mockDBActions.create('tickets', {
        ticketId,
        farmerId: req.user._id,
        farmerName: farmerName || req.user.name,
        farmerPhone: farmerPhone || req.user.phone,
        farmerEmail: email || req.user.email,
        serialNumber,
        productModel,
        category,
        description,
        priority: resolvedPriority,
        status: 'NEW',
        attachments: attachments || [],
        location: location || 'Default Farm Site',
        timeline,
        suggestedSpecialty
      });

      // Simple notification triggers for admin dashboard
      if (!global.adminNotifications) global.adminNotifications = [];
      global.adminNotifications.push({
        _id: `notif_${Date.now()}`,
        type: 'NEW_TICKET',
        ticketId,
        category,
        farmerName: farmerName || req.user.name,
        productModel,
        priority: resolvedPriority,
        timestamp: new Date()
      });

      savedTicket = newTicket;
    } else {
      // Mongoose DB
      const ticket = await ServiceTicket.create({
        ticketId,
        farmerId: req.user._id,
        farmerName: farmerName || req.user.name,
        farmerPhone: farmerPhone || req.user.phone,
        farmerEmail: email || req.user.email,
        serialNumber,
        productModel,
        category,
        description,
        priority: resolvedPriority,
        status: 'NEW',
        attachments: attachments || [],
        location: location || 'Default Farm Site',
        timeline
      });

      // Notification
      if (!global.adminNotifications) global.adminNotifications = [];
      global.adminNotifications.push({
        _id: `notif_${Date.now()}`,
        type: 'NEW_TICKET',
        ticketId,
        category,
        farmerName: farmerName || req.user.name,
        productModel,
        priority: resolvedPriority,
        timestamp: new Date()
      });

      savedTicket = ticket;
    }

    // Try sending email confirmation to the farmer
    const recipientEmail = email || req.user.email;
    const recipientName = farmerName || req.user.name;
    if (recipientEmail) {
      try {
        await sendTicketConfirmationEmail({
          to: recipientEmail,
          name: recipientName,
          ticketId: savedTicket.ticketId,
          productModel: savedTicket.productModel,
          description: description
        });
      } catch (emailErr) {
        console.error('⚠️ Non-blocking email dispatch error:', emailErr);
      }
    }

    return res.status(201).json({ success: true, ticket: savedTicket });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ success: false, message: 'Server error creating support ticket.' });
  }
});

// @route   GET /api/tickets
// @desc    Get all tickets. Farmers see their own, Technicians see assigned, Admin sees all
router.get('/', protect, async (req, res) => {
  try {
    if (global.isMockDB) {
      let userTickets = [];
      if (req.user.role === 'ADMIN') {
        userTickets = mockDB.tickets;
      } else if (req.user.role === 'TECHNICIAN') {
        userTickets = mockDB.tickets.filter(t => t.assignedTechnicianId === req.user._id);
      } else {
        userTickets = mockDB.tickets.filter(t => t.farmerId === req.user._id);
      }
      // Sort by date descending
      userTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json({ success: true, tickets: userTickets });
    } else {
      let query = {};
      if (req.user.role === 'TECHNICIAN') {
        query = { assignedTechnicianId: req.user._id };
      } else if (req.user.role === 'FARMER') {
        query = { farmerId: req.user._id };
      }
      const tickets = await ServiceTicket.find(query).sort({ createdAt: -1 });
      res.json({ success: true, tickets });
    }
  } catch (error) {
    console.error('Fetch tickets error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching tickets.' });
  }
});

// @route   GET /api/tickets/:id
// @desc    Get ticket by ticket ID (or Mongo ID)
router.get('/:id', protect, async (req, res) => {
  const { id } = req.params;

  try {
    if (global.isMockDB) {
      const ticket = mockDB.tickets.find(t => t.ticketId === id || t._id === id);
      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Ticket not found.' });
      }
      return res.json({ success: true, ticket });
    } else {
      const ticket = await ServiceTicket.findOne({ $or: [{ ticketId: id }, { _id: id }] });
      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Ticket not found.' });
      }
      res.json({ success: true, ticket });
    }
  } catch (error) {
    console.error('Fetch ticket error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching ticket detail.' });
  }
});

// @route   PATCH /api/tickets/:id/assign
// @desc    Assign a technician to a ticket (Admin route)
router.patch('/:id/assign', protect, authorize('ADMIN'), async (req, res) => {
  const { id } = req.params;
  const { technicianId } = req.body;

  if (!technicianId) {
    return res.status(400).json({ success: false, message: 'Please provide technicianId.' });
  }

  try {
    let techName = '';

    // Verify technician and get name
    if (global.isMockDB) {
      const tech = mockDB.users.find(u => u._id === technicianId && u.role === 'TECHNICIAN');
      if (!tech) return res.status(404).json({ success: false, message: 'Technician not found.' });
      techName = tech.name;

      // Update ticket
      const ticket = mockDB.tickets.find(t => t._id === id || t.ticketId === id);
      if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });

      ticket.assignedTechnicianId = technicianId;
      ticket.assignedTechnicianName = techName;
      ticket.status = 'ASSIGNED';
      ticket.timeline.push({
        status: 'ASSIGNED',
        note: `Technician ${techName} assigned by administrator.`,
        timestamp: new Date()
      });

      // Update technician workload
      tech.activeJobs = (tech.activeJobs || 0) + 1;

      return res.json({ success: true, ticket });
    } else {
      const tech = await User.findOne({ _id: technicianId, role: 'TECHNICIAN' });
      if (!tech) return res.status(404).json({ success: false, message: 'Technician not found.' });
      techName = tech.name;

      const ticket = await ServiceTicket.findOne({ $or: [{ ticketId: id }, { _id: id }] });
      if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });

      ticket.assignedTechnicianId = technicianId;
      ticket.assignedTechnicianName = techName;
      ticket.status = 'ASSIGNED';
      ticket.timeline.push({
        status: 'ASSIGNED',
        note: `Technician ${techName} assigned by administrator.`,
        timestamp: new Date()
      });

      await ticket.save();

      // Update technician job count
      tech.activeJobs = (tech.activeJobs || 0) + 1;
      await tech.save();

      return res.json({ success: true, ticket });
    }
  } catch (error) {
    console.error('Assign technician error:', error);
    res.status(500).json({ success: false, message: 'Server error assigning technician.' });
  }
});

// @route   PATCH /api/tickets/:id/status
// @desc    Change status of a ticket (Admin / Tech route)
router.patch('/:id/status', protect, async (req, res) => {
  const { id } = req.params;
  const { status, note, repairNotes, partsUsed, photosAfterRepair } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required.' });
  }

  try {
    if (global.isMockDB) {
      const ticket = mockDB.tickets.find(t => t._id === id || t.ticketId === id);
      if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });

      ticket.status = status;
      ticket.timeline.push({
        status,
        note: note || `Status updated to ${status}`,
        timestamp: new Date()
      });

      if (repairNotes !== undefined) ticket.repairNotes = repairNotes;
      if (partsUsed !== undefined) ticket.partsUsed = partsUsed;
      if (photosAfterRepair !== undefined) ticket.photosAfterRepair = photosAfterRepair;

      // Handle technician job decrement on completion
      if (status === 'COMPLETED' || status === 'CANCELLED') {
        const tech = mockDB.users.find(u => u._id === ticket.assignedTechnicianId);
        if (tech && tech.activeJobs > 0) {
          tech.activeJobs -= 1;
        }
      }

      return res.json({ success: true, ticket });
    } else {
      const ticket = await ServiceTicket.findOne({ $or: [{ ticketId: id }, { _id: id }] });
      if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });

      ticket.status = status;
      ticket.timeline.push({
        status,
        note: note || `Status updated to ${status}`,
        timestamp: new Date()
      });

      if (repairNotes !== undefined) ticket.repairNotes = repairNotes;
      if (partsUsed !== undefined) ticket.partsUsed = partsUsed;
      if (photosAfterRepair !== undefined) ticket.photosAfterRepair = photosAfterRepair;

      await ticket.save();

      if ((status === 'COMPLETED' || status === 'CANCELLED') && ticket.assignedTechnicianId) {
        await User.findByIdAndUpdate(ticket.assignedTechnicianId, { $inc: { activeJobs: -1 } });
      }

      return res.json({ success: true, ticket });
    }
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({ success: false, message: 'Server error updating ticket status.' });
  }
});

export default router;
