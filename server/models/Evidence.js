import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema({
  caseId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Case', required: true },
  type:         { type: String, enum: ['fir', 'cdr', 'financial', 'surveillance', 'other'], required: true },
  originalName: { type: String },
  fileUrl:      { type: String },
  mimeType:     { type: String },
  fileSize:     { type: Number },
  sha256Hash:   { type: String },
  uploadedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rawText:      { type: String, default: '' },
  processingStatus: { type: String, enum: ['pending', 'processing', 'done', 'failed'], default: 'pending' },
  extractedEntitiesCount: { type: Number, default: 0 },
  metadata:     { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export default mongoose.model('Evidence', evidenceSchema);
