import mongoose from 'mongoose';

const TimelineEventSchema = new mongoose.Schema({
  status: { type: String, required: true },
  note: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const AttachmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String } // 'image', 'video', 'pdf' etc.
});

const ServiceTicketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true, index: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerName: { type: String, required: true },
  farmerPhone: { type: String, required: true },
  serialNumber: { type: String, required: true },
  productModel: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  status: {
    type: String,
    enum: [
      'NEW', 'ADMIN_REVIEW', 'ASSIGNED', 'TECHNICIAN_ACCEPTED',
      'INSPECTION', 'REPAIR', 'WAITING_FOR_PART', 'QUALITY_CHECK',
      'COMPLETED', 'CANCELLED', 'ESCALATED'
    ],
    default: 'NEW'
  },
  assignedTechnicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTechnicianName: { type: String },
  attachments: [AttachmentSchema],
  location: { type: String },
  timeline: [TimelineEventSchema],
  repairNotes: { type: String },
  partsUsed: { type: String },
  photosAfterRepair: [AttachmentSchema],
}, {
  timestamps: true
});

const ServiceTicket = mongoose.models.ServiceTicket || mongoose.model('ServiceTicket', ServiceTicketSchema);
export default ServiceTicket;
