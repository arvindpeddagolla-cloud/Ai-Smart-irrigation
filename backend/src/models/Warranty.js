import mongoose from 'mongoose';

const WarrantySchema = new mongoose.Schema({
  serialNumber: { type: String, required: true, unique: true, index: true },
  productName: { type: String, required: true, default: 'Smart Irrigation V1' },
  purchaseDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  status: { type: String, enum: ['ACTIVE', 'EXPIRED'], default: 'ACTIVE' }
}, {
  timestamps: true
});

const Warranty = mongoose.models.Warranty || mongoose.model('Warranty', WarrantySchema);
export default Warranty;
