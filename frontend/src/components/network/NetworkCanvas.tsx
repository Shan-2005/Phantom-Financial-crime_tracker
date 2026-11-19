import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core } from 'cytoscape';
import { demoAccounts, demoTransactions } from '../../lib/demoData';

interface NetworkCanvasProps {
  onSelectNode?: (node: any) => void;
  filterRisk?: string;
  searchTerm?: string;
  maxNodes?: number;
  hideIsolated?: boolean;
}

export const NetworkCanvas: React.FC<NetworkCanvasProps> = ({
  onSelectNode,
  filterRisk = 'ALL',
  searchTerm = '',
  maxNodes = 150,
  hideIsolated = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [stats, setStats] = useState({ nodes: 0, edges: 0, cycles: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // Filter accounts by risk & search term
    let filteredAccts = demoAccounts;
    if (filterRisk !== 'ALL') {
      filteredAccts = filteredAccts.filter((a) => a.risk_level === filterRisk);
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filteredAccts = filteredAccts.filter(
        (a) =>
          a.account_number_masked.toLowerCase().includes(q) ||
          a.bank_code.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q)
      );
    }

    // Identify accounts participating in transactions
    const activeAccountIds = new Set<string>();
    demoTransactions.forEach((tx) => {
      activeAccountIds.add(tx.sender_account_id);
      activeAccountIds.add(tx.receiver_account_id);
    });

    const sortedAccts = [...filteredAccts].sort((a, b) => {
      const aActive = activeAccountIds.has(a.id) ? 1 : 0;
      const bActive = activeAccountIds.has(b.id) ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;
      return (b.risk_score || 0) - (a.risk_score || 0);
    });

    const acctSlice = sortedAccts.slice(0, maxNodes);
    const acctIdSet = new Set(acctSlice.map((a) => a.id));

    // Calculate degree map from transactions
    const degreeMap = new Map<string, number>();
    let cycleCount = 0;
    const edgeElements: any[] = [];

    demoTransactions.forEach((tx) => {
      if (acctIdSet.has(tx.sender_account_id) && acctIdSet.has(tx.receiver_account_id)) {
        degreeMap.set(tx.sender_account_id, (degreeMap.get(tx.sender_account_id) || 0) + 1);
        degreeMap.set(tx.receiver_account_id, (degreeMap.get(tx.receiver_account_id) || 0) + 1);
        const isCycle = Number(tx.amount) >= 450000;
        if (isCycle) cycleCount++;

        edgeElements.push({
          data: {
            id: `tx-${tx.id}`,
            source: tx.sender_account_id,
            target: tx.receiver_account_id,
            label: isCycle ? `₹${(Number(tx.amount) / 1000).toFixed(0)}k` : '',
            amount: Number(tx.amount),
            isCycle,
          },
        });
      }
    });

    // Determine nodes to display (optionally hiding isolated zero-transaction nodes)
    const isMatchedBySearch = (a: any) => {
      if (!searchTerm.trim()) return false;
      const q = searchTerm.toLowerCase();
      return (
        a.account_number_masked.toLowerCase().includes(q) ||
        a.bank_code.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q)
      );
    };

    let displayAccts = acctSlice;
    if (hideIsolated) {
      displayAccts = acctSlice.filter(
        (a) =>
          (degreeMap.get(a.id) || 0) > 0 ||
          isMatchedBySearch(a) ||
          a.account_number_masked.includes('ACC-0001') ||
          a.account_number_masked.includes('ACC-0044') ||
          a.account_number_masked.includes('ACC-0078')
      );
    }

    const nodeElements = displayAccts.map((a) => {
      const isPhantom =
        a.account_number_masked.includes('ACC-0001') ||
        a.account_number_masked.includes('ACC-0044') ||
        a.account_number_masked.includes('ACC-0078');
      const degree = degreeMap.get(a.id) || 0;
      const hasEdges = degree > 0;
      const isHighRisk = a.risk_level === 'CRITICAL' || a.risk_level === 'HIGH';
      const searchMatch = isMatchedBySearch(a);

      // Clean label display rules:
      // Disconnected nodes (hasEdges === false) NEVER show labels unless explicitly searched!
      // This completely solves the horizontal text overlapping defect seen in crowded graphs.
      const showLabel = isPhantom || searchMatch || (hasEdges && (isHighRisk || degree >= 2));

      return {
        data: {
          id: a.id,
          label: showLabel ? a.account_number_masked : '',
          fullLabel: a.account_number_masked,
          bank: a.bank_code,
          score: a.risk_score,
          risk: a.risk_level,
          isPhantom,
          hasEdges,
          size: isPhantom ? 44 : isHighRisk ? 34 : hasEdges ? 24 : 12,
        },
      };
    });

    const elements = [...edgeElements, ...nodeElements];

    setStats({
      nodes: displayAccts.length,
      edges: edgeElements.length,
      cycles: cycleCount,
    });

    const isDarkTheme = document.documentElement.classList.contains('dark');

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#10B981',
            label: 'data(label)',
            color: isDarkTheme ? '#F1F5F9' : '#1E293B',
            'font-size': '10px',
            'font-family': 'Plus Jakarta Sans, JetBrains Mono, sans-serif',
            'font-weight': 'bold',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'text-background-color': isDarkTheme ? '#1C2434' : '#FFFFFF',
            'text-background-opacity': 0.85,
            'text-background-padding': '2px',
            'text-background-shape': 'roundrectangle',
            width: 'data(size)',
            height: 'data(size)',
            'border-width': 2,
            'border-color': isDarkTheme ? '#1E293B' : '#FFFFFF',
          },
        },
        {
          selector: 'node[risk = "MEDIUM"]',
          style: {
            'background-color': '#F59E0B',
            'border-color': isDarkTheme ? '#1E293B' : '#FFFFFF',
          },
        },
        {
          selector: 'node[risk = "HIGH"]',
          style: {
            'background-color': '#F97316',
            'border-color': isDarkTheme ? '#1E293B' : '#FFFFFF',
          },
        },
        {
          selector: 'node[risk = "CRITICAL"]',
          style: {
            'background-color': '#EF4444',
            'border-color': isDarkTheme ? '#1E293B' : '#FFFFFF',
            'border-width': 3,
            color: isDarkTheme ? '#FDA4AF' : '#BE123C',
            'font-weight': 'bold',
          },
        },
        {
          selector: 'node[?isPhantom]',
          style: {
            'border-color': '#00C5FF',
            'border-width': 4,
            'background-color': '#5750F1',
            color: isDarkTheme ? '#A5B4FC' : '#4338CA',
            'font-size': '11px',
            'font-weight': 'bold',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 1.5,
            'line-color': isDarkTheme ? '#334155' : '#CBD5E1',
            'target-arrow-color': isDarkTheme ? '#475569' : '#94A3B8',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'arrow-scale': 0.9,
          },
        },
        {
          selector: 'edge[?isCycle]',
          style: {
            width: 3.5,
            'line-color': '#EF4444',
            'target-arrow-color': '#EF4444',
            'line-style': 'solid',
            label: 'data(label)',
            color: '#EF4444',
            'font-size': '10px',
            'font-weight': 'bold',
            'text-background-color': isDarkTheme ? '#1E293B' : '#FFFFFF',
            'text-background-opacity': 0.95,
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
          },
        },
      ],
      layout: {
        name: 'cose',
        animate: false,
        padding: 50,
        componentSpacing: 180,
        nodeRepulsion: () => 950000,
        idealEdgeLength: () => 140,
        edgeElasticity: () => 100,
        nestingFactor: 0.1,
        gravity: 0.2,
      },
      minZoom: 0.2,
      maxZoom: 3.5,
      wheelSensitivity: 0.25,
    });

    cy.on('tap', 'node', (evt) => {
      const node = evt.target.data();
      if (onSelectNode) {
        onSelectNode(node);
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [filterRisk, searchTerm, maxNodes, hideIsolated, onSelectNode]);

  return (
    <div className="relative w-full h-full min-h-[550px] bg-[#F8FAFC] dark:bg-[#0B132B] overflow-hidden select-none">
      {/* Subtle Dot Grid Background Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
        style={{
          backgroundImage: 'radial-gradient(#94A3B8 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Cytoscape Container */}
      <div ref={containerRef} className="w-full h-full min-h-[550px] relative z-0" />

      {/* Floating Canvas Stats & Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/95 dark:bg-[#1C2434]/95 backdrop-blur-md border border-gray-200/80 dark:border-gray-700/80 px-4 py-2.5 rounded-xl shadow-md text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-4">
        <div className="flex items-center gap-3 pr-3 border-r border-gray-200 dark:border-gray-700 font-mono text-[11px]">
          <span>Nodes: <strong className="text-gray-900 dark:text-white">{stats.nodes}</strong></span>
          <span>Edges: <strong className="text-gray-900 dark:text-white">{stats.edges}</strong></span>
          <span>Cycles: <strong className="text-rose-500 font-bold">{stats.cycles}</strong></span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> Low
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> Med
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" /> High
          </span>
          <span className="flex items-center gap-1.5 font-bold text-rose-500">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5750F1] ring-2 ring-[#00C5FF]" /> Operation Ring
          </span>
        </div>
      </div>
    </div>
  );
};
