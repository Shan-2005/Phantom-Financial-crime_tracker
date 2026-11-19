import React from 'react';
import { FileCheck2, ShieldCheck } from 'lucide-react';
import { formatHash } from '../lib/blockchainVerifier';

export const AuditLogs: React.FC = () => {
  const auditEvents = [
    {
      id: 'AUD-001',
      action: 'RISK_SCORE_EVALUATION',
      entity_type: 'ACCOUNT',
      entity_id: 'ACC-0001-9041',
      actor: 'SYSTEM_ANALYTICS_DAEMON',
      prev_hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      curr_hash: '0x1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f801',
      timestamp: '2026-06-15T10:00:05Z',
      status: 'CHAIN_VALID',
    },
    {
      id: 'AUD-002',
      action: 'CYCLE_DETECTION_FLAG',
      entity_type: 'CLUSTER',
      entity_id: 'Circular Ring #1',
      actor: 'ENGINE_RULE_001',
      prev_hash: '0x1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f801',
      curr_hash: '0x2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f80902',
      timestamp: '2026-06-15T14:15:30Z',
      status: 'CHAIN_VALID',
    },
    {
      id: 'AUD-003',
      action: 'INVESTIGATION_OPENED',
      entity_type: 'INVESTIGATION',
      entity_id: 'INV-2026-PHANTOM-001',
      actor: 'agent.vikram@fiu.gov.in',
      prev_hash: '0x2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f80902',
      curr_hash: '0x3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a03',
      timestamp: '2026-06-15T15:00:00Z',
      status: 'CHAIN_VALID',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/80 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-[#5750F1]" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              Immutable Audit Trail & Hash Chain
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Tamper-evident system activity log chained with SHA-256 state transitions
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1C2434] border border-gray-200/80 dark:border-gray-800 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 font-sans">
              <tr>
                <th className="py-3.5 px-4 font-bold">EVENT ID</th>
                <th className="py-3.5 px-4 font-bold">ACTION</th>
                <th className="py-3.5 px-4 font-bold">TARGET ENTITY</th>
                <th className="py-3.5 px-4 font-bold">ACTOR / AGENT</th>
                <th className="py-3.5 px-4 font-bold">PREVIOUS HASH</th>
                <th className="py-3.5 px-4 font-bold">CURRENT HASH</th>
                <th className="py-3.5 px-4 font-bold">CHAIN INTEGRITY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {auditEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#5750F1]">{evt.id}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white font-semibold">{evt.action}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{evt.entity_id}</td>
                  <td className="py-3 px-4 text-gray-500">{evt.actor}</td>
                  <td className="py-3 px-4 text-gray-400">{formatHash(evt.prev_hash, 4)}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300 font-bold">{formatHash(evt.curr_hash, 4)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1 w-fit">
                      <ShieldCheck className="w-3 h-3" /> {evt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
