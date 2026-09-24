import express from 'express';
import Entity from '../models/Entity.js';
import Relationship from '../models/Relationship.js';
import { authenticate } from '../middleware/auth.js';
import { audit } from '../middleware/auditLogger.js';
import { runAnalytics, detectAnomalies } from '../services/analyticsService.js';

const router = express.Router();
router.use(authenticate);

// Entity type → color map (for graph visualization)
const TYPE_COLORS = {
  person:       '#0A84FF',
  phone:        '#30D158',
  vehicle:      '#FF9F0A',
  account:      '#FF453A',
  location:     '#BF5AF2',
  organization: '#64D2FF',
  ip:           '#FF6961',
  email:        '#FFD60A',
};

// ─── GET /api/graph/:caseId — graph nodes + edges ────────────────────
router.get('/:caseId', async (req, res) => {
  try {
    const { caseId } = req.params;
    const { entityType, dateFrom, dateTo } = req.query;

    // Fetch raw entities
    const entityFilter = { caseIds: caseId, mergedInto: null };
    if (entityType) entityFilter.type = entityType;
    const entities = await Entity.find(entityFilter).populate('sourceEvidenceIds', 'originalName type sha256Hash');

    // Fetch relationships
    const entityIds = entities.map(e => e._id);
    const relFilter = { caseId, sourceEntityId: { $in: entityIds }, targetEntityId: { $in: entityIds } };
    if (dateFrom || dateTo) {
      relFilter.createdAt = {};
      if (dateFrom) relFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo)   relFilter.createdAt.$lte = new Date(dateTo);
    }
    const relationships = await Relationship.find(relFilter);

    // Run analytics
    const enrichedEntities = runAnalytics(entities, relationships);
    const anomalies = detectAnomalies(relationships);
    const anomalySet = new Set(anomalies.map(a => a.entityId));

    // Build Cytoscape.js compatible payload
    const nodes = enrichedEntities.map(ent => ({
      data: {
        id:             ent._id.toString(),
        label:          ent.name,
        type:           ent.type,
        color:          TYPE_COLORS[ent.type] || '#8E8E93',
        influenceScore: ent.influenceScore,
        degreeScore:    ent.degreeScore,
        betweennessScore: ent.betweennessScore,
        communityId:    ent.communityId,
        flagged:        ent.flagged || anomalySet.has(ent._id.toString()),
        aliases:        ent.aliases,
        sourceCount:    ent.sourceEvidenceIds?.length || 0,
        evidences:      ent.sourceEvidenceIds?.map(ev => ({
          id: ev._id, name: ev.originalName, type: ev.type, hash: ev.sha256Hash,
        })) || [],
      },
    }));

    const edges = relationships.map(rel => ({
      data: {
        id:         rel._id.toString(),
        source:     rel.sourceEntityId.toString(),
        target:     rel.targetEntityId.toString(),
        type:       rel.type,
        weight:     rel.weight,
        confidence: rel.confidence,
        label:      rel.type,
      },
    }));

    await audit(req, 'GRAPH_VIEWED', caseId, 'Case', { nodes: nodes.length, edges: edges.length });

    res.json({
      success: true,
      graph: { nodes, edges },
      analytics: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        anomalies,
        communities: [...new Set(enrichedEntities.map(e => e.communityId))].filter(c => c >= 0).length,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/graph/:caseId/influencers — top ranked entities ─────────
router.get('/:caseId/influencers', async (req, res) => {
  try {
    const { caseId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const entities = await Entity.find({ caseIds: caseId, mergedInto: null });
    const relationships = await Relationship.find({ caseId });
    const enriched = runAnalytics(entities, relationships);

    const ranked = enriched
      .sort((a, b) => b.influenceScore - a.influenceScore)
      .slice(0, limit)
      .map((ent, idx) => ({
        rank: idx + 1,
        id:   ent._id,
        name: ent.name,
        type: ent.type,
        influenceScore: ent.influenceScore,
        degreeScore:    ent.degreeScore,
        betweennessScore: ent.betweennessScore,
        communityId:    ent.communityId,
        evidenceCount:  ent.sourceEvidenceIds?.length || 0,
        flagged:        ent.flagged,
        whyFlagged:     ent.flagged ? ent.flagReason : null,
      }));

    await audit(req, 'INFLUENCERS_VIEWED', caseId, 'Case');
    res.json({ success: true, influencers: ranked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
