import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role:         { type: String, enum: ['admin', 'investigator', 'analyst'], default: 'analyst' },
  badgeId:      { type: String, default: '' },
  department:   { type: String, default: '' },
  lastLoginAt:  { type: Date },
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
