import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { authenticate, authorize } from '../middleware/auth.js';
import { audit } from '../middleware/auditLogger.js';
import Evidence from '../models/Evidence.js';
import Entity from '../models/Entity.js';
import Relationship from '../models/Relationship.js';
import Case from '../models/Case.js';
import { extractEntities, parseCDR, parseFinancial } from '../services/nlpService.js';

const router = express.Router();
router.use(authenticate);

// ─── Multer setup ─────────────────────────────────────────────────────
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(UPLOAD_DIR, req.params.caseId || 'misc');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 20) * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.txt', '.csv', '.pdf', '.json'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

// ─── Helper: SHA-256 hash of file ─────────────────────────────────────
function hashFile(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', d => hash.update(d));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

// ─── Helper: process extracted entities + build relationships ──────────
async function processAndStoreEntities(extractedList, caseId, evidenceId, pairings = []) {
  const createdEntities = [];

  for (const ent of extractedList) {
    // Exact-match deduplication
    let entity = await Entity.findOne({
      $or: [{ name: ent.name }, { aliases: ent.name }],
      caseIds: caseId,
      type: ent.type,
    });

    if (!entity) {
      entity = await Entity.create({
        name: ent.name,
        type: ent.type,
        caseIds: [caseId],
        sourceEvidenceIds: [evidenceId],
        attributes: ent.attributes || {},
      });
    } else {
      // Add evidence ref if missing
      if (!entity.sourceEvidenceIds.map(String).includes(evidenceId.toString())) {
        entity.sourceEvidenceIds.push(evidenceId);
        await entity.save();
      }
    }
    createdEntities.push(entity);
  }

  // ─── Build relationships from pairings (CDR calls / financial transactions)
  for (const pair of pairings) {
    const srcEnt = createdEntities.find(e => e.name === pair.source);
    const tgtEnt = createdEntities.find(e => e.name === pair.target);
    if (!srcEnt || !tgtEnt || srcEnt._id.equals(tgtEnt._id)) continue;

    const existing = await Relationship.findOne({
      sourceEntityId: srcEnt._id,
      targetEntityId: tgtEnt._id,
      caseId,
      type: pair.relType,
    });

    if (existing) {
      existing.weight = Math.min(10, existing.weight + 1);
      if (!existing.sourceEvidenceIds.map(String).includes(evidenceId.toString())) {
        existing.sourceEvidenceIds.push(evidenceId);
      }
      await existing.save();
    } else {
      await Relationship.create({
        sourceEntityId: srcEnt._id,
        targetEntityId: tgtEnt._id,
        type: pair.relType,
        weight: pair.weight || 1,
        confidence: pair.confidence || 0.7,
        sourceEvidenceIds: [evidenceId],
        caseId,
      });
    }
  }

  return createdEntities;
}

// ─── POST /api/evidence/:caseId ───────────────────────────────────────
router.post('/:caseId', authorize('admin', 'investigator'), upload.single('file'), async (req, res) => {
  const { caseId } = req.params;
  const { type } = req.body;

  try {
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) return res.status(404).json({ success: false, message: 'Case not found' });

    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const sha256Hash = await hashFile(req.file.path);
    const rawText = fs.readFileSync(req.file.path, 'utf8').slice(0, 500000); // cap at 500KB text

    const evidence = await Evidence.create({
      caseId,
      type: type || 'other',
      originalName: req.file.originalname,
      fileUrl: req.file.path,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      sha256Hash,
      uploadedBy: req.user._id,
      rawText,
      processingStatus: 'processing',
    });

    // ─── Async entity extraction ──────────────────────────────────────
    setImmediate(async () => {
      try {
        let extractedEntities = [];
        let pairings = [];

        if (type === 'cdr') {
          const { entities, calls } = parseCDR(rawText);
          extractedEntities = entities;
          pairings = calls.map(c => ({ source: c.caller, target: c.callee, relType: 'called', weight: 1 + Math.floor(c.duration / 60), confidence: 0.95 }));
        } else if (type === 'financial') {
          const { entities, transactions } = parseFinancial(rawText);
          extractedEntities = entities;
          pairings = transactions.map(t => ({ source: t.sender, target: t.receiver, relType: 'transacted', weight: Math.min(10, Math.ceil(t.amount / 50000)), confidence: 0.9 }));
        } else {
          // FIR / surveillance / other — NLP extraction
          extractedEntities = extractEntities(rawText);
        }

        const created = await processAndStoreEntities(extractedEntities, caseId, evidence._id, pairings);
        evidence.processingStatus = 'done';
        evidence.extractedEntitiesCount = created.length;
        await evidence.save();
      } catch (err) {
        console.error('Extraction error:', err);
        evidence.processingStatus = 'failed';
        await evidence.save();
      }
    });

    await audit(req, 'EVIDENCE_UPLOADED', evidence._id, 'Evidence', { caseId, type, sha256Hash });

    res.status(201).json({
      success: true,
      evidence: {
        id: evidence._id,
        originalName: evidence.originalName,
        sha256Hash: evidence.sha256Hash,
        processingStatus: evidence.processingStatus,
        type: evidence.type,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/evidence/:caseId ────────────────────────────────────────
router.get('/:caseId', async (req, res) => {
  try {
    const evidence = await Evidence.find({ caseId: req.params.caseId })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    await audit(req, 'EVIDENCE_LISTED', req.params.caseId, 'Case');
    res.json({ success: true, evidence });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/evidence/single/:id ────────────────────────────────────
router.get('/single/:id', async (req, res) => {
  try {
    const ev = await Evidence.findById(req.params.id).populate('uploadedBy', 'name email');
    if (!ev) return res.status(404).json({ success: false, message: 'Not found' });
    await audit(req, 'EVIDENCE_VIEWED', ev._id, 'Evidence');
    res.json({ success: true, evidence: ev });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
