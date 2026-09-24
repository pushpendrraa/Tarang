import mongoose from 'mongoose';

const entitySchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  type:          { type: String, enum: ['person', 'phone', 'vehicle', 'account', 'location', 'organization', 'ip', 'email'], required: true },
  aliases:       [{ type: String }],
  caseIds:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'Case' }],
  sourceEvidenceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evidence' }],
  influenceScore: { type: Number, default: 0 },
  communityId:   { type: Number, default: -1 },
  attributes:    { type: mongoose.Schema.Types.Mixed, default: {} },
  isResolved:    { type: Boolean, default: false },
  mergedInto:    { type: mongoose.Schema.Types.ObjectId, ref: 'Entity', default: null },
  flagged:       { type: Boolean, default: false },
  flagReason:    { type: String, default: '' },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

entitySchema.index({ name: 'text', type: 1 });
entitySchema.index({ caseIds: 1 });

export default mongoose.model('Entity', entitySchema);
