import React, { useState } from 'react';
import { NetworkCanvas } from '../components/network/NetworkCanvas';
import { NodeInspector } from '../components/network/NodeInspector';
import { SearchBar } from '../components/ui/SearchBar';
import { ShieldAlert, Layers, Network, Filter } from 'lucide-react';

export const NetworkExplorer: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL');
  const [maxNodes, setMaxNodes] = useState(150);
  const [hideIsolated, setHideIsolated] = useState(true);

  const handleSpotlightPhantomRing = () => {
    setSearchTerm('ACC-0044');
    setFilterRisk('ALL');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] space-y-4">
      {/* Top Filter Bar */}
      <div className="bg-white dark:bg-[#1C2434] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px] max-w-md">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search account (e.g. ACC-0001-9041)..."
            className="w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Connected Graph Toggle */}
          <button
            onClick={() => setHideIsolated((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              hideIsolated
                ? 'bg-[#5750F1]/10 text-[#5750F1] border-[#5750F1]/30 dark:bg-[#5750F1]/20 dark:text-[#8E82F6]'
                : 'bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 border-gray-200/80 dark:border-gray-700/80'
            }`}
            title="Toggle between connected transaction graph and full account population"
          >
            <Network className="w-3.5 h-3.5" />
            {hideIsolated ? 'Connected Only' : 'All Accounts'}
          </button>

          {/* Risk Level Pills */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/80 p-1 rounded-xl text-xs font-semibold">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => {
              const isActive = filterRisk === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setFilterRisk(lvl)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    isActive
                      ? 'bg-[#5750F1] text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>

          {/* Node Cap Select */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-200">
            <Layers className="w-3.5 h-3.5 text-[#5750F1]" />
            <span className="text-gray-400">Cap:</span>
            <select
              value={maxNodes}
              onChange={(e) => setMaxNodes(Number(e.target.value))}
              className="bg-transparent text-gray-800 dark:text-gray-100 font-semibold focus:outline-none cursor-pointer"
            >
              <option value={50} className="bg-white dark:bg-gray-800">50</option>
              <option value={150} className="bg-white dark:bg-gray-800">150</option>
              <option value={300} className="bg-white dark:bg-gray-800">300</option>
              <option value={500} className="bg-white dark:bg-gray-800">500</option>
            </select>
          </div>

          {/* Spotlight Phantom Ring button */}
          <button
            onClick={handleSpotlightPhantomRing}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 dark:border dark:border-rose-900/60 text-xs font-bold transition-all shadow-xs"
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Spotlight Phantom Ring
          </button>
        </div>
      </div>

      {/* Main Canvas + Inspector */}
      <div className="flex-1 flex min-h-0 relative rounded-2xl overflow-hidden border border-gray-200/80 dark:border-gray-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex-1 h-full min-h-0">
          <NetworkCanvas
            onSelectNode={setSelectedNode}
            filterRisk={filterRisk}
            searchTerm={searchTerm}
            maxNodes={maxNodes}
            hideIsolated={hideIsolated}
          />
        </div>
        {selectedNode && (
          <NodeInspector node={selectedNode} onClose={() => setSelectedNode(null)} />
        )}
      </div>
    </div>
  );
};
