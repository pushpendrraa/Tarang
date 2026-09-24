import { createContext, useContext, useState, useEffect } from 'react';
import {
  loadAllData,
  buildEntityNodes,
  buildGraphEdges,
  computeInfluenceScores,
  assignCommunities,
} from '../services/dataService';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [rawData, setRawData]   = useState(null);
  const [nodes, setNodes]       = useState([]);
  const [edges, setEdges]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    loadAllData()
      .then(data => {
        setRawData(data);
        const rawNodes = buildEntityNodes(data.entities, data.cdrRecords, data.financialTxns);
        const rawEdges = buildGraphEdges(data.entities, data.cdrRecords, data.financialTxns, rawNodes);
        const scored   = computeInfluenceScores(rawNodes, rawEdges);
        const withComm = assignCommunities(scored);
        setNodes(withComm);
        setEdges(rawEdges);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Filter nodes/edges by case
  const getGraphForCase = (caseId) => {
    if (!caseId) return { nodes, edges };
    const caseNodes = nodes.filter(n =>
      !n.caseIds || n.caseIds.length === 0 || n.caseIds.includes(caseId)
    );
    const nodeIds = new Set(caseNodes.map(n => n.id));
    const caseEdges = edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));
    return { nodes: caseNodes, edges: caseEdges };
  };

  const getInfluencers = (limit = 10) =>
    nodes.filter(n => n.type === 'person').slice(0, limit);

  const searchEntities = (query) => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return nodes.filter(n =>
      n.label.toLowerCase().includes(q) ||
      n.role?.toLowerCase().includes(q) ||
      n.aliases?.some(a => a.toLowerCase().includes(q))
    ).slice(0, 20);
  };

  return (
    <DataContext.Provider value={{
      rawData, nodes, edges, loading, error,
      getGraphForCase, getInfluencers, searchEntities,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
