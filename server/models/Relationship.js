import mongoose from 'mongoose';

const relationshipSchema = new mongoose.Schema({
  sourceEntityId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Entity', required: true },
  targetEntityId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Entity', required: true },
  type:              { type: String, enum: [
    'called', 'transacted', 'associates_with', 'located_at', 'owns', 'member_of',
    'employed_by', 'coordinates_with', 'suspected_of', 'witnessed_by', 'other'
  ], required: true },
  weight:            { type: Number, default: 1.0, min: 0, max: 10 },
  confidence:        { type: Number, default: 0.5, min: 0, max: 1 },
  sourceEvidenceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Evidence' }],
  caseId:            { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  attributes:        { type: mongoose.Schema.Types.Mixed, default: {} },
  directionality:    { type: String, enum: ['directed', 'undirected'], default: 'undirected' },
}, { timestamps: true });

relationshipSchema.index({ sourceEntityId: 1, targetEntityId: 1, caseId: 1 });

export default mongoose.model('Relationship', relationshipSchema);
