import mongoose from 'mongoose';

const SensorReadingSchema = new mongoose.Schema({
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
  serialNumber: { type: String, required: true, index: true },
  soilMoisture: { type: Number, required: true },
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true },
  battery: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now, index: true }
});

const SensorReading = mongoose.models.SensorReading || mongoose.model('SensorReading', SensorReadingSchema);
export default SensorReading;
