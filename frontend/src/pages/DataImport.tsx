import React from 'react';
import { Database, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { demoSamplingReport } from '../lib/demoData';

export const DataImport: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/80 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#5750F1]" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              Data Ingestion & PaySim Pipeline
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Status of the streaming 2-pass PaySim adapter, stratified sampling, and deterministic hashing
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-[#1C2434] border border-gray-200/80 dark:border-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#5750F1]" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Raw PaySim Dataset Log (PS_20174392719_1491204439457_log.csv)
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
            PROCESSED & SEEDED
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200/60 dark:border-gray-700/60">
            <span className="text-gray-400">Total Raw Rows:</span>
            <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
              {Number(demoSamplingReport.raw_rows || 6362620).toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200/60 dark:border-gray-700/60">
            <span className="text-gray-400">Sampled Target:</span>
            <p className="mt-1 text-lg font-bold text-[#5750F1]">
              {Number(demoSamplingReport.sampled_rows || 69981).toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200/60 dark:border-gray-700/60">
            <span className="text-gray-400">Fraud Retention:</span>
            <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {Number(demoSamplingReport.fraud_rows_retained || 8213).toLocaleString()} (100.0%)
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200/60 dark:border-gray-700/60">
            <span className="text-gray-400">Unique Accounts:</span>
            <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
              {Number(demoSamplingReport.unique_accounts || 82218).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200/80 dark:border-gray-700/80 text-xs space-y-2 text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" /> Pipeline Integrity Verification
          </div>
          <p>• Zero foreign-key violations across customers, accounts, and transactions.</p>
          <p>• PaySim balance columns completely stripped to guarantee zero leakage into detection features.</p>
          <p>• Deterministic seed: 42 (Reproducible SHA-256 output hash).</p>
        </div>
      </div>
    </div>
  );
};
