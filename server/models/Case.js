import mongoose from 'mongoose';

const caseSchema = new mongoose.Schema({
  title:              { type: String, required: true, trim: true },
  description:        { type: String, default: '' },
  status:             { type: String, enum: ['open', 'active', 'closed', 'archived'], default: 'open' },
  priority:           { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  assignedTo:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  caseNumber:         { type: String, unique: true },
  tags:               [{ type: String }],
  jurisdiction:       { type: String, default: '' },
  incidentDate:       { type: Date },
  closedAt:           { type: Date },
}, { timestamps: true });

// Auto-generate case number
caseSchema.pre('save', function (next) {
  if (!this.caseNumber) {
    const ts = Date.now().toString(36).toUpperCase();
    this.caseNumber = `TN-${ts}`;
  }
  next();
});

export default mongoose.model('Case', caseSchema);
