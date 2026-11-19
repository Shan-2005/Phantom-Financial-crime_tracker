import React from 'react';
import { RiskBadge } from '../ui/RiskBadge';
import { ShieldAlert, ExternalLink, Hash, Activity, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NodeInspectorProps {
  node: any;
  onClose: () => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({ node, onClose }) => {
  if (!node) return null;

  return (
    <div className="w-84 bg-white dark:bg-[#1C2434] border-l border-gray-200/80 dark:border-gray-800 h-full p-6 flex flex-col justify-between overflow-y-auto shadow-xl z-20 transition-all">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Node Inspector
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4">
          <div className="text-lg font-bold font-mono text-gray-900 dark:text-white break-all">
            {node.fullLabel || node.label}
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <RiskBadge level={node.risk} score={node.score} />
            <span className="text-xs font-mono font-bold text-[#5750F1] bg-[#5750F1]/10 px-2.5 py-0.5 rounded-full border border-[#5750F1]/20">
              {node.bank || 'HDFC'}
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700/60">
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-medium">
              <Hash className="w-3.5 h-3.5 text-[#5750F1]" /> Account Entity UUID
            </span>
            <p className="mt-1 font-mono text-[11px] text-gray-800 dark:text-gray-200 break-all select-all">
              {node.id}
            </p>
          </div>

          <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700/60">
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-medium">
              <Activity className="w-3.5 h-3.5 text-[#5750F1]" /> Betweenness Centrality
            </span>
            <p className="mt-1 font-mono text-sm font-bold text-gray-900 dark:text-white">
              {node.isPhantom ? '0.810 (Intermediary Ring Hub)' : '0.042'}
            </p>
          </div>

          {node.isPhantom && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-xl">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold">
                <ShieldAlert className="w-4 h-4" />
                OPERATION PHANTOM RING (INV-2026-PHANTOM-001)
              </div>
              <p className="mt-1.5 text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                Active member in 3-hop circular RTGS laundering ring (Rs.1,415,000 cycled in 4.25 hours).
              </p>
              <div className="mt-3">
                <Link
                  to="/investigations/INV-2026-PHANTOM-001"
                  className="inline-flex items-center gap-1.5 text-xs text-[#5750F1] dark:text-[#8E82F6] hover:underline font-semibold"
                >
                  View Case Dossier & Evidence <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
        <Link
          to={`/transactions?account=${node.id}`}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#5750F1] hover:bg-[#4634FF] text-white font-bold text-xs transition-all shadow-md shadow-indigo-500/20"
        >
          View Account Ledger
        </Link>
      </div>
    </div>
  );
};
