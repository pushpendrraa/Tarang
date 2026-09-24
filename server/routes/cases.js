import express from 'express';
import { body, validationResult } from 'express-validator';
import Case from '../models/Case.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { audit } from '../middleware/auditLogger.js';

const router = express.Router();
router.use(authenticate);

// ─── GET /api/cases ──────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.user.role === 'investigator') filter.assignedTo = req.user._id;

    const cases = await Case.find(filter)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    await audit(req, 'CASES_LISTED', null, 'Case', { count: cases.length });
    res.json({ success: true, cases });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST /api/cases ─────────────────────────────────────────────────
router.post('/', authorize('admin', 'investigator'), [
  body('title').trim().notEmpty(),
  body('status').optional().isIn(['open', 'active', 'closed', 'archived']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const caseDoc = await Case.create({ ...req.body, createdBy: req.user._id });
    await audit(req, 'CASE_CREATED', caseDoc._id, 'Case', { title: caseDoc.title });
    res.status(201).json({ success: true, case: caseDoc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/cases/:id ───────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const caseDoc = await Case.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email');
    if (!caseDoc) return res.status(404).json({ success: false, message: 'Case not found' });
    await audit(req, 'CASE_VIEWED', caseDoc._id, 'Case');
    res.json({ success: true, case: caseDoc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PATCH /api/cases/:id ─────────────────────────────────────────────
router.patch('/:id', authorize('admin', 'investigator'), async (req, res) => {
  try {
    const caseDoc = await Case.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!caseDoc) return res.status(404).json({ success: false, message: 'Case not found' });
    await audit(req, 'CASE_UPDATED', caseDoc._id, 'Case', { changes: req.body });
    res.json({ success: true, case: caseDoc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE /api/cases/:id ────────────────────────────────────────────
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const caseDoc = await Case.findByIdAndDelete(req.params.id);
    if (!caseDoc) return res.status(404).json({ success: false, message: 'Case not found' });
    await audit(req, 'CASE_DELETED', req.params.id, 'Case');
    res.json({ success: true, message: 'Case deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
