import Graph from 'graphology';
import betweennessDefault from 'graphology-metrics/centrality/betweenness.js';
import degreeDefault from 'graphology-metrics/centrality/degree.js';
import louvain from 'graphology-communities-louvain';

// graphology-metrics centrality functions are the default export (CJS module)
const betweennessCentrality = typeof betweennessDefault === 'function'
  ? betweennessDefault
  : betweennessDefault.betweennessCentrality;

const degreeCentrality = typeof degreeDefault === 'function'
  ? degreeDefault
  : degreeDefault.degreeCentrality || degreeDefault.default;

/**
 * Build a graphology Graph from entity/relationship arrays.
 */
function buildGraph(entities, relationships) {
  const graph = new Graph({ multi: false, allowSelfLoops: false });

  for (const ent of entities) {
    const id = ent._id.toString();
    if (!graph.hasNode(id)) {
      graph.addNode(id, { label: ent.name, type: ent.type });
    }
  }

  for (const rel of relationships) {
    const src = rel.sourceEntityId.toString();
    const tgt = rel.targetEntityId.toString();
    if (graph.hasNode(src) && graph.hasNode(tgt) && !graph.hasEdge(src, tgt)) {
      try {
        graph.addEdge(src, tgt, { weight: rel.weight || 1, type: rel.type });
      } catch (_) {}
    }
  }

  return graph;
}

/**
 * Compute degree centrality for all nodes.
 */
function computeDegreeCentrality(graph) {
  if (graph.order === 0) return {};
  try {
    const result = degreeCentrality(graph);
    return result || {};
  } catch (e) {
    console.warn('Degree centrality error:', e.message);
    // Fallback: manual degree count
    const scores = {};
    const n = graph.order;
    graph.forEachNode(node => {
      scores[node] = n > 1 ? graph.degree(node) / (n - 1) : 0;
    });
    return scores;
  }
}

/**
 * Compute betweenness centrality.
 */
function computeBetweennessCentrality(graph) {
  if (graph.order === 0) return {};
  try {
    const result = betweennessCentrality(graph, { normalized: true });
    return result || {};
  } catch (e) {
    console.warn('Betweenness centrality error:', e.message);
    return {};
  }
}

/**
 * Run Louvain community detection.
 */
function detectCommunities(graph) {
  if (graph.order === 0) return {};
  try {
    return louvain(graph);
  } catch (e) {
    console.warn('Louvain error:', e.message);
    return {};
  }
}

/**
 * Combined analytics: enriched entity list with scores + community IDs.
 */
export function runAnalytics(entities, relationships) {
  if (!entities || entities.length === 0) return [];

  const graph = buildGraph(entities, relationships);
  const degree      = computeDegreeCentrality(graph);
  const betweenness = computeBetweennessCentrality(graph);
  const communities = detectCommunities(graph);

  return entities.map(ent => {
    const id = ent._id.toString();
    const degScore = parseFloat((degree[id]      || 0).toFixed(4));
    const betScore = parseFloat((betweenness[id] || 0).toFixed(4));
    // Composite influence score: 60% degree, 40% betweenness
    const influence = parseFloat((0.6 * degScore + 0.4 * betScore).toFixed(4));
    return {
      ...(ent.toObject ? ent.toObject() : ent),
      influenceScore:   influence,
      degreeScore:      degScore,
      betweennessScore: betScore,
      communityId:      communities[id] ?? -1,
    };
  });
}

/**
 * Detect anomalies: high-weight connections.
 */
export function detectAnomalies(relationships, threshold = 5) {
  const edgeCount = {};
  for (const rel of relationships) {
    const key = rel.sourceEntityId.toString();
    edgeCount[key] = (edgeCount[key] || 0) + (rel.weight || 1);
  }
  return Object.entries(edgeCount)
    .filter(([, cnt]) => cnt >= threshold)
    .map(([entityId, count]) => ({ entityId, count, flag: 'HIGH_ACTIVITY' }));
}
