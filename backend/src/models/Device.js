import mongoose from 'mongoose';

const DeviceSchema = new mongoose.Schema({
  model: { type: String, required: true, default: 'Smart Irrigation V1' },
  serialNumber: { type: String, required: true, unique: true, index: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  firmwareVersion: { type: String, default: 'v1.0.0' },
  purchaseDate: { type: Date, required: true },
  batteryLevel: { type: Number, default: 100 },
  status: { type: String, enum: ['ONLINE', 'OFFLINE'], default: 'ONLINE' },
  sensors: {
    soilMoisture: {
      status: { type: String, enum: ['ONLINE', 'OFFLINE', 'ERROR'], default: 'ONLINE' },
      value: { type: Number, default: 50 }
    },
    dht22: {
      status: { type: String, enum: ['ONLINE', 'OFFLINE', 'ERROR'], default: 'ONLINE' },
      temp: { type: Number, default: 28 },
      humidity: { type: Number, default: 60 }
    },
    wifi: {
      status: { type: String, enum: ['ONLINE', 'OFFLINE', 'ERROR'], default: 'ONLINE' },
      signalStrength: { type: Number, default: -70 } // RSSI in dBm
    },
    weatherApi: {
      status: { type: String, enum: ['ONLINE', 'OFFLINE', 'ERROR'], default: 'ONLINE' }
    },
    battery: {
      status: { type: String, enum: ['ONLINE', 'OFFLINE', 'ERROR'], default: 'ONLINE' },
      health: { type: String, enum: ['GOOD', 'REPLACE', 'LOW'], default: 'GOOD' }
    }
  },
  registeredAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const Device = mongoose.models.Device || mongoose.model('Device', DeviceSchema);
export default Device;
