import React, { useState } from 'react';
import { demoFraudRules } from '../lib/demoData';
import { Sliders, CheckCircle2, Save, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

export const RiskIntelligence: React.FC = () => {
  const [rules, setRules] = useState(demoFraudRules);
  const [savedMessage, setSavedMessage] = useState(false);

  const handleWeightChange = (ruleId: string, newWeight: number) => {
    setRules((prev) =>
      prev.map((r) => (r.rule_id === ruleId ? { ...r, default_weight: newWeight } : r))
    );
  };

  const handleToggleActive = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.rule_id === ruleId ? { ...r, is_active: !r.is_active } : r))
    );
  };

  const handleResetDefaults = () => {
    setRules(demoFraudRules);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
  };

  const handleSave = () => {
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  const activeCount = rules.filter((r) => r.is_active).length;
  const totalWeight = rules.reduce((acc, r) => acc + (r.is_active ? r.default_weight : 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-[#1C2434] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5750F1]/10 flex items-center justify-center text-[#5750F1]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                8-Factor Explainable Typology Scoring Engine
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Calibrate topological risk weights, cycle detection thresholds, and automated freeze triggers
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {savedMessage && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" /> Rules Synchronized
            </span>
          )}
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-gray-400" /> Reset Defaults
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5750F1] hover:bg-[#463fc5] text-white font-semibold text-xs transition-all shadow-md shadow-indigo-500/20"
          >
            <Save className="w-3.5 h-3.5" /> Save Weights
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1C2434] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-400">Active Typology Rules</span>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {activeCount} / {rules.length} Active
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1C2434] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950/40 text-[#5750F1] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-400">Total Dynamic Weight</span>
            <div className="text-lg font-bold text-[#5750F1]">
              {totalWeight} pts (Cap 100)
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1C2434] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-400">Auto-SAR Trigger Threshold</span>
            <div className="text-lg font-bold text-rose-600 dark:text-rose-400">
              Score ≥ 80 / 100
            </div>
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {rules.map((rule) => {
          const isCritical = rule.severity === 'CRITICAL';
          const isHigh = rule.severity === 'HIGH';

          return (
            <div
              key={rule.rule_id}
              className={`p-6 rounded-2xl border transition-all ${
                rule.is_active
                  ? 'bg-white dark:bg-[#1C2434] border-gray-200/80 dark:border-gray-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
                  : 'bg-gray-50/70 dark:bg-gray-900/40 border-gray-200/50 dark:border-gray-800/40 opacity-70'
              } space-y-4`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#5750F1] dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/60">
                      {rule.rule_id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCritical
                          ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60'
                          : isHigh
                          ? 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60'
                          : 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60'
                      }`}
                    >
                      {rule.severity}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-gray-900 dark:text-white">
                    {rule.name}
                  </h3>
                </div>

                {/* Active Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rule.is_active}
                    onChange={() => handleToggleActive(rule.rule_id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5750F1]"></div>
                </label>
              </div>

              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed min-h-[36px]">
                {rule.description}
              </p>

              {/* Slider for Rule Weight */}
              <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800/80">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">Risk Score Weight:</span>
                  <span className="font-mono font-bold text-[#5750F1] dark:text-indigo-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                    +{rule.default_weight} pts
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="1"
                  value={rule.default_weight}
                  onChange={(e) => handleWeightChange(rule.rule_id, Number(e.target.value))}
                  disabled={!rule.is_active}
                  className="w-full accent-[#5750F1] bg-gray-200 dark:bg-gray-700 h-2 rounded-lg cursor-pointer disabled:opacity-40"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
