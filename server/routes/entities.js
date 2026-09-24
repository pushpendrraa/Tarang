import express from 'express';
import Entity from '../models/Entity.js';
import Relationship from '../models/Relationship.js';
import Evidence from '../models/Evidence.js';
import { authenticate } from '../middleware/auth.js';
import { audit } from '../middleware/auditLogger.js';

const router = express.Router();
router.use(authenticate);

// ─── GET /api/entities — list / search ───────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { caseId, type, search, flagged, limit = 100, skip = 0 } = req.query;
    const filter = {};
    if (caseId)  filter.caseIds = caseId;
    if (type)    filter.type = type;
    if (flagged !== undefined) filter.flagged = flagged === 'true';
    if (search)  filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { aliases: { $elemMatch: { $regex: search, $options: 'i' } } },
    ];

    const entities = await Entity.find(filter)
      .sort({ influenceScore: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('sourceEvidenceIds', 'originalName type sha256Hash');

    await audit(req, 'ENTITIES_LISTED', null, 'Entity', { count: entities.length });
    res.json({ success: true, entities, total: await Entity.countDocuments(filter) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/entities/:id ───────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const entity = await Entity.findById(req.params.id)
      .populate('sourceEvidenceIds', 'originalName type sha256Hash rawText');
    if (!entity) return res.status(404).json({ success: false, message: 'Entity not found' });

    // Fetch relationships for explainability
    const relationships = await Relationship.find({
      $or: [{ sourceEntityId: entity._id }, { targetEntityId: entity._id }],
    })
      .populate('sourceEntityId', 'name type')
      .populate('targetEntityId', 'name type')
      .populate('sourceEvidenceIds', 'originalName type sha256Hash');

    await audit(req, 'ENTITY_VIEWED', entity._id, 'Entity', { name: entity.name });
    res.json({ success: true, entity, relationships });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/entities/merge/suggestions — fuzzy merge candidates ────
router.get('/merge/suggestions', async (req, res) => {
  try {
    const { caseId } = req.query;
    const filter = caseId ? { caseIds: caseId, mergedInto: null } : { mergedInto: null };
    const entities = await Entity.find(filter).select('name type aliases');

    const suggestions = [];
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const a = entities[i], b = entities[j];
        if (a.type !== b.type) continue;
        // Levenshtein-style similarity check (simple)
        const sim = similarity(a.name.toLowerCase(), b.name.toLowerCase());
        if (sim > 0.8 && sim < 1.0) {
          suggestions.push({ entityA: a, entityB: b, similarity: sim });
        }
      }
    }

    res.json({ success: true, suggestions: suggestions.slice(0, 50) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/entities/merge ─────────────────────────────────────────
router.post('/merge', async (req, res) => {
  try {
    const { keepId, mergeId } = req.body;
    if (!keepId || !mergeId) return res.status(400).json({ success: false, message: 'keepId and mergeId required' });

    const keep  = await Entity.findById(keepId);
    const merge = await Entity.findById(mergeId);
    if (!keep || !merge) return res.status(404).json({ success: false, message: 'Entity not found' });

    // Merge aliases, caseIds, sourceEvidenceIds
    const newAliases = [...new Set([...keep.aliases, merge.name, ...merge.aliases])];
    const newCaseIds = [...new Set([...keep.caseIds.map(String), ...merge.caseIds.map(String)])];
    const newEvIds   = [...new Set([...keep.sourceEvidenceIds.map(String), ...merge.sourceEvidenceIds.map(String)])];

    keep.aliases = newAliases;
    keep.caseIds = newCaseIds;
    keep.sourceEvidenceIds = newEvIds;
    await keep.save();

    // Redirect relationships
    await Relationship.updateMany({ sourceEntityId: mergeId }, { sourceEntityId: keepId });
    await Relationship.updateMany({ targetEntityId: mergeId }, { targetEntityId: keepId });

    // Mark merged
    merge.mergedInto = keepId;
    merge.isResolved = true;
    await merge.save();

    await audit(req, 'ENTITY_MERGED', keepId, 'Entity', { mergedId: mergeId });
    res.json({ success: true, entity: keep });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Simple string similarity (Dice coefficient) ─────────────────────
function similarity(a, b) {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;
  const bigrams = s => {
    const m = new Map();
    for (let i = 0; i < s.length - 1; i++) {
      const bg = s.slice(i, i + 2);
      m.set(bg, (m.get(bg) || 0) + 1);
    }
    return m;
  };
  const aBig = bigrams(a), bBig = bigrams(b);
  let intersection = 0;
  for (const [bg, cnt] of aBig) {
    intersection += Math.min(cnt, bBig.get(bg) || 0);
  }
  return (2 * intersection) / (a.length + b.length - 2);
}

export default router;
