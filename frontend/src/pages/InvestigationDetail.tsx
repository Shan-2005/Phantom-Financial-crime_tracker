import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Briefcase,
  ShieldAlert,
  Cpu,
  Clock,
  ArrowLeft,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { RiskBadge } from '../components/ui/RiskBadge';

export const InvestigationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [frozen, setFrozen] = useState(false);
  const [exported, setExported] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back & Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/80 dark:border-gray-800">
        <div className="space-y-1">
          <Link
            to="/investigations"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5750F1] hover:underline mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Investigations
          </Link>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold font-mono text-gray-900 dark:text-white">
              {id || 'INV-2026-PHANTOM-001'}
            </h2>
            <RiskBadge level="CRITICAL" score={94.0} size="md" />
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200">
              PRIORITY: URGENT
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFrozen(!frozen)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
              frozen
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-400'
            }`}
          >
            {frozen ? 'ACCOUNTS FROZEN (ORDER FIU-992)' : 'Freeze Associated Accounts'}
          </button>
          <button
            onClick={() => {
              setExported(true);
              setTimeout(() => setExported(false), 2000);
            }}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#5750F1] hover:bg-[#4634FF] text-white font-bold text-xs transition-all shadow-md shadow-indigo-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            {exported ? 'Dossier Downloaded' : 'Export Court Dossier'}
          </button>
        </div>
      </div>

      {/* Case Overview Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1C2434] border border-gray-200/80 dark:border-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          Operation Phantom Ring — Multi-Bank RTGS Laundering Ring
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed max-w-4xl">
          Assigned to <strong className="text-gray-900 dark:text-white font-mono">Agent Vikram Rathore (FIU Taskforce)</strong>.
          Detected coordinated 3-hop circular RTGS laundering ring cycling <strong className="text-[#5750F1] font-mono">Rs.1,415,000</strong> across HDFC, ICICI, and SBI accounts within 4.25 hours using common hardware fingerprint <strong className="text-rose-600 font-mono">DEV-PHANTOM-103</strong>.
        </p>
      </div>

      {/* Split View: Transaction Ring Timeline & Evidence Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3-Hop Transaction Flow Timeline */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1C2434] border border-gray-200/80 dark:border-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#5750F1]" />
              Circular Money Flow Timeline
            </h4>
            <span className="text-xs font-bold text-[#5750F1]">Total Cycled: Rs.1,415,000</span>
          </div>

          <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
            {/* Hop 1 */}
            <div className="relative flex items-start gap-4">
              <span className="w-7 h-7 rounded-full bg-[#5750F1]/10 border border-[#5750F1]/30 text-[#5750F1] font-mono font-bold text-xs flex items-center justify-center shrink-0 z-10 bg-white dark:bg-gray-800">
                1
              </span>
              <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 rounded-xl flex-1 space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-bold text-gray-900 dark:text-white">ACC-0001-9041 (HDFC) → ACC-0044-7721 (ICICI)</span>
                  <span className="text-[#5750F1] font-bold">Rs.480,000</span>
                </div>
                <div className="text-[11px] text-gray-500">
                  2026-06-15 10:00 UTC • Origin Transfer (Devraj Singhania)
                </div>
              </div>
            </div>

            {/* Hop 2 */}
            <div className="relative flex items-start gap-4">
              <span className="w-7 h-7 rounded-full bg-[#5750F1]/10 border border-[#5750F1]/30 text-[#5750F1] font-mono font-bold text-xs flex items-center justify-center shrink-0 z-10 bg-white dark:bg-gray-800">
                2
              </span>
              <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 rounded-xl flex-1 space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-bold text-gray-900 dark:text-white">ACC-0044-7721 (ICICI) → ACC-0078-3319 (SBI)</span>
                  <span className="text-[#5750F1] font-bold">Rs.470,000</span>
                </div>
                <div className="text-[11px] text-gray-500">
                  2026-06-15 11:45 UTC • Rapid Mule Relay (Drained 97.9% in 105 mins)
                </div>
              </div>
            </div>

            {/* Hop 3 (Cycle Closed) */}
            <div className="relative flex items-start gap-4">
              <span className="w-7 h-7 rounded-full bg-rose-50 border border-rose-300 text-rose-600 font-mono font-bold text-xs flex items-center justify-center shrink-0 z-10 bg-white dark:bg-gray-800">
                3
              </span>
              <div className="p-3.5 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl flex-1 space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-bold text-rose-700 dark:text-rose-300">ACC-0078-3319 (SBI) → ACC-0001-9041 (HDFC)</span>
                  <span className="text-rose-600 font-bold">Rs.465,000</span>
                </div>
                <div className="text-[11px] text-rose-600/80 dark:text-rose-400/80">
                  2026-06-15 14:15 UTC • Cycle Closed Back to Origin in 4.25 Hours
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 8-Factor Explainable Evidence Table */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1C2434] border border-gray-200/80 dark:border-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              Risk Rules Triggered (94.0 / 100)
            </h4>
            <span className="text-xs font-bold text-rose-600">5 OF 8 RULES HIT</span>
          </div>

          <div className="space-y-2.5">
            {[
              {
                rule: 'RULE_001',
                name: 'Circular Money Flow',
                pts: 24.0,
                desc: '3-hop closed loop within 4.25 hours (Rs.1,415,000 volume)',
              },
              {
                rule: 'RULE_002',
                name: 'Rapid Pass-Through / Mule',
                pts: 20.0,
                desc: 'Funds drained >90% within 2 hours at intermediate hop',
              },
              {
                rule: 'RULE_003',
                name: 'Transaction Structuring',
                pts: 20.0,
                desc: 'Transfers Rs.465K–Rs.480K clustered just below Rs.5L reporting threshold',
              },
              {
                rule: 'RULE_005',
                name: 'Shared Device Fingerprint',
                pts: 15.0,
                desc: 'DEV-PHANTOM-103 hardware collision across distinct accounts',
              },
              {
                rule: 'RULE_006',
                name: 'High Network Centrality',
                pts: 15.0,
                desc: 'Betweenness Centrality 0.810 (structural bottleneck intermediary)',
              },
            ].map((r) => (
              <div
                key={r.rule}
                className="p-3.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60 rounded-xl flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="text-gray-900 dark:text-white font-bold">{r.rule}: {r.name}</span>
                  <p className="text-[11px] text-gray-500 mt-0.5">{r.desc}</p>
                </div>
                <span className="font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">+{r.pts} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Blockchain Registry Anchor Verification Stamp */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1C2434] border border-gray-200/80 dark:border-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#5750F1]" />
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
              On-Chain Cryptographic Integrity Anchor
            </h4>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED ON-CHAIN
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div>
            <span className="text-gray-400 font-medium">Smart Contract:</span>
            <p className="text-[#5750F1] font-mono font-semibold truncate mt-0.5">0x5FbDB2315678afecb367f032d93F642f64180aa3</p>
          </div>
          <div>
            <span className="text-gray-400 font-medium">Canonical SHA-256 Digest:</span>
            <p className="text-gray-700 dark:text-gray-300 font-mono truncate mt-0.5">0x1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f801</p>
          </div>
          <div>
            <span className="text-gray-400 font-medium">Anchor Timestamp:</span>
            <p className="text-gray-700 dark:text-gray-300 font-mono mt-0.5">2026-06-15T15:00:00Z (Block #912,404)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
