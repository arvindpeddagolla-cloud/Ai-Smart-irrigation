import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['FARMER', 'TECHNICIAN', 'ADMIN'], default: 'FARMER' },
  phone: { type: String, required: true },
  // Technician specific fields
  specialty: { type: String, enum: ['HARDWARE', 'SOFTWARE_IOT', 'FIELD'] },
  activeJobs: { type: Number, default: 0 },
  status: { type: String, enum: ['ONLINE', 'OFFLINE'], default: 'OFFLINE' }
}, {
  timestamps: true
});

// Pre-save hook to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcryptjs.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
