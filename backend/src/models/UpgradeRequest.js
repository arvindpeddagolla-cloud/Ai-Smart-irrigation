import mongoose from 'mongoose';

const UpgradeRequestSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerName: { type: String, required: true },
  serialNumber: { type: String, required: true },
  currentModel: { type: String, required: true, default: 'Smart Irrigation V1' },
  requestedUpgrade: { type: String, required: true, default: 'Smart Irrigation V2' },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'SHIPPED', 'COMPLETED'], default: 'PENDING' }
}, {
  timestamps: true
});

const UpgradeRequest = mongoose.models.UpgradeRequest || mongoose.model('UpgradeRequest', UpgradeRequestSchema);
export default UpgradeRequest;
