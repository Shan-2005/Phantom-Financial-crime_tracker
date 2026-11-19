import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Server, CheckCircle2, Key, Database, Cpu, Save } from 'lucide-react';
import { isCloudMode } from '../lib/supabase';

export const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useState('dev-key');
  const [mode, setMode] = useState(isCloudMode ? 'cloud' : 'local');
  const [saved, setSaved] = useState(false);
  const [cycleThreshold, setCycleThreshold] = useState('450000');
  const [relayWindow, setRelayWindow] = useState('120');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Card */}
      <div className="bg-white dark:bg-[#1C2434] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5750F1]/10 flex items-center justify-center text-[#5750F1]">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              System Configuration & Execution Engine
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Manage PHANTOM execution profile, API key authentication, and cloud infrastructure bindings
            </p>
          </div>
        </div>

        {saved && (
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" /> Configuration Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Execution Profile Selection */}
        <div className="bg-white dark:bg-[#1C2434] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-[#5750F1]" /> Execution Environment
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select between standalone local zero-dependency sandbox and cloud-scale cluster
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setMode('local')}
              className={`p-5 rounded-2xl border text-left transition-all relative ${
                mode === 'local'
                  ? 'border-[#5750F1] bg-[#5750F1]/5 ring-2 ring-[#5750F1]/20'
                  : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5750F1] dark:text-indigo-400">
                  LOCAL SANDBOX MODE
                </span>
                {mode === 'local' && (
                  <CheckCircle2 className="w-4 h-4 text-[#5750F1]" />
                )}
              </div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                Embedded SQLite & Hardhat EVM
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                In-memory NetworkX graph + local SQLite + embedded Hardhat test node. Zero external cloud credentials required.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode('cloud')}
              className={`p-5 rounded-2xl border text-left transition-all relative ${
                mode === 'cloud'
                  ? 'border-[#5750F1] bg-[#5750F1]/5 ring-2 ring-[#5750F1]/20'
                  : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#5750F1] dark:text-indigo-400">
                  MANAGED CLOUD CLUSTER
                </span>
                {mode === 'cloud' && (
                  <CheckCircle2 className="w-4 h-4 text-[#5750F1]" />
                )}
              </div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                Supabase Postgres + Neo4j Aura
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                Production-grade cloud graph clustering, Supabase PostgreSQL with Row-Level Security, and Ethereum Sepolia anchors.
              </p>
            </button>
          </div>
        </div>

        {/* Security & API Keys */}
        <div className="bg-white dark:bg-[#1C2434] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-[#5750F1]" /> Internal Microservice Authentication
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Bearer tokens passed in the <code className="text-[#5750F1] font-mono">X-Internal-API-Key</code> header to secure FastAPI analytics endpoints
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Internal Analytics API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-[#F4F7FB] dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:border-[#5750F1] focus:ring-1 focus:ring-[#5750F1]"
            />
            <p className="text-[11px] text-gray-400">
              Default development credential: <code className="text-gray-600 dark:text-gray-300 font-mono">dev-key</code>
            </p>
          </div>
        </div>

        {/* Typology Threshold Parameters */}
        <div className="bg-white dark:bg-[#1C2434] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#5750F1]" /> Typology Algorithm Parameters
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Global mathematical bounds for circular routing and rapid relay detection
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Minimum Cycle Transaction Amount (₹)
              </label>
              <input
                type="number"
                value={cycleThreshold}
                onChange={(e) => setCycleThreshold(e.target.value)}
                className="w-full bg-[#F4F7FB] dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:border-[#5750F1]"
              />
              <p className="text-[11px] text-gray-400">
                Transactions below this value are not flagged as critical cycles.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Rapid Relay Detection Window (Seconds)
              </label>
              <input
                type="number"
                value={relayWindow}
                onChange={(e) => setRelayWindow(e.target.value)}
                className="w-full bg-[#F4F7FB] dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:border-[#5750F1]"
              />
              <p className="text-[11px] text-gray-400">
                Inflow-to-outflow time interval that triggers pass-through mule alert.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#5750F1] hover:bg-[#463fc5] text-white font-semibold text-xs transition-all shadow-md shadow-indigo-500/20"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
