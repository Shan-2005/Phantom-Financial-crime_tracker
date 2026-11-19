import React, { useState } from 'react';
import { demoTransactions } from '../lib/demoData';
import { SearchBar } from '../components/ui/SearchBar';
import { ArrowLeftRight, ShieldCheck, ShieldAlert, Cpu, Zap, Play, CheckCircle2, AlertOctagon } from 'lucide-react';
import { formatHash } from '../lib/blockchainVerifier';
import { Link } from 'react-router-dom';

export const Transactions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Screening interactive state
  const [isScreeningOpen, setIsScreeningOpen] = useState(true);
  const [senderInput, setSenderInput] = useState('ACC-0001-9041');
  const [receiverInput, setReceiverInput] = useState('ACC-0044-7721');
  const [amountInput, setAmountInput] = useState('480000');
  const [deviceInput, setDeviceInput] = useState('DEV-PHANTOM-103');
  const [screenResult, setScreenResult] = useState<any>(null);
  const [isScreeningLoading, setIsScreeningLoading] = useState(false);

  const handleScreenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsScreeningLoading(true);
    const amt = parseFloat(amountInput) || 0;

    // Simulate sub-500ms screening evaluation
    setTimeout(() => {
      const isRing = (senderInput.includes('ACC-0001') && receiverInput.includes('ACC-0044')) || amt >= 450000;
      const decision = isRing ? 'HOLD_FOR_REVIEW' : amt > 200000 ? 'ALLOW_WITH_MONITORING' : 'ALLOW';
      const riskScore = isRing ? 65.0 : amt > 200000 ? 35.0 : 5.0;

      const rules = [];
      if (isRing) {
        rules.push({
          rule_id: 'RULE_001',
          name: 'Circular Money Flow (Cycle Closure)',
          score: 25.0,
          reason: 'Transaction closes 3-hop circular RTGS loop',
        });
        if (deviceInput.includes('DEV-PHANTOM-103')) {
          rules.push({
            rule_id: 'RULE_005',
            name: 'Shared Identity / Device Collision',
            score: 15.0,
            reason: 'Hardware fingerprint collision with DEV-PHANTOM-103',
          });
        }
      }

      setScreenResult({
        transaction_reference: `TX-SCR-${Date.now().toString().slice(-6)}`,
        decision,
        risk_score: riskScore,
        latency_ms: 0.18,
        rules,
        evaluated_at: new Date().toISOString(),
      });
      setIsScreeningLoading(false);
    }, 120);
  };

  // Filter transactions
  const filtered = demoTransactions.filter((tx) => {
    if (typeFilter !== 'ALL' && tx.transaction_type !== typeFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        tx.transaction_reference.toLowerCase().includes(q) ||
        tx.sender_account_id.toLowerCase().includes(q) ||
        tx.receiver_account_id.toLowerCase().includes(q) ||
        (tx.blockchain_hash && tx.blockchain_hash.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Real-Time Pre-Transaction Screening Panel */}
      <div className="bg-white dark:bg-[#1C2434] border border-gray-200/80 dark:border-gray-800 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#5750F1]" />
            <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
              Pre-Transaction Real-Time AML Screener
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5750F1]/10 text-[#5750F1]">
              TARGET &lt; 500ms
            </span>
          </div>
          <button
            onClick={() => setIsScreeningOpen(!isScreeningOpen)}
            className="text-xs font-semibold text-[#5750F1] hover:underline"
          >
            {isScreeningOpen ? 'Collapse Panel' : 'Expand Panel'}
          </button>
        </div>

        {isScreeningOpen && (
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <form onSubmit={handleScreenSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Sender Account
                  </label>
                  <input
                    type="text"
                    value={senderInput}
                    onChange={(e) => setSenderInput(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-gray-100 font-mono focus:border-[#5750F1] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Receiver Account
                  </label>
                  <input
                    type="text"
                    value={receiverInput}
                    onChange={(e) => setReceiverInput(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-gray-100 font-mono focus:border-[#5750F1] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Amount (INR)
                  </label>
                  <input
                    type="number"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    required
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-gray-100 font-mono focus:border-[#5750F1] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                    Device Fingerprint
                  </label>
                  <input
                    type="text"
                    value={deviceInput}
                    onChange={(e) => setDeviceInput(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-gray-100 font-mono focus:border-[#5750F1] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isScreeningLoading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#5750F1] hover:bg-[#4634FF] text-white font-bold text-xs transition-all shadow-md shadow-indigo-500/20"
                >
                  <Play className="w-3.5 h-3.5" />
                  {isScreeningLoading ? 'Simulating Graph Path...' : 'Screen Payment in Real-Time'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSenderInput('ACC-BENIGN-001');
                    setReceiverInput('ACC-BENIGN-002');
                    setAmountInput('15000');
                    setDeviceInput('DEV-CLEAN-01');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 text-xs font-semibold transition-colors"
                >
                  Load Clean
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSenderInput('ACC-0001-9041');
                    setReceiverInput('ACC-0044-7721');
                    setAmountInput('480000');
                    setDeviceInput('DEV-PHANTOM-103');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 dark:border dark:border-rose-900/60 text-xs font-bold transition-colors"
                >
                  Load Ring
                </button>
              </div>
            </form>

            {/* Live Result View */}
            <div className="bg-gray-50 dark:bg-gray-900/70 border border-gray-200/80 dark:border-gray-700/80 rounded-xl p-4 flex flex-col justify-between">
              {screenResult ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">DECISION:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        screenResult.decision === 'HOLD_FOR_REVIEW'
                          ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/60'
                          : screenResult.decision === 'ALLOW_WITH_MONITORING'
                          ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60'
                      }`}
                    >
                      {screenResult.decision}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Latency:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                      {screenResult.latency_ms} ms
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Simulated Risk Score:</span>
                    <span className="text-gray-900 dark:text-white font-bold font-mono">
                      {screenResult.risk_score} / 100
                    </span>
                  </div>

                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase">
                      Triggered Rules:
                    </span>
                    {screenResult.rules.length > 0 ? (
                      <div className="mt-1 space-y-1">
                        {screenResult.rules.map((r: any) => (
                          <div
                            key={r.rule_id}
                            className="text-xs text-rose-600 dark:text-rose-400 font-mono flex items-center gap-1.5"
                          >
                            <AlertOctagon className="w-3.5 h-3.5" />
                            {r.rule_id}: {r.reason} (+{r.score} pts)
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Cleared real-time graph checks
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  Ready to screen payment. Fill form and click Screen.
                </div>
              )}

              {screenResult?.decision === 'HOLD_FOR_REVIEW' && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                  <Link
                    to="/investigations/INV-2026-PHANTOM-001"
                    className="flex-1 py-2 text-center rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-xs"
                  >
                    Open Investigation Ticket
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white dark:bg-[#1C2434] border border-gray-200/80 dark:border-gray-800 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex-1 min-w-[280px] max-w-md">
            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search tx ref or hash..." />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200/80 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 font-semibold focus:outline-none"
            >
              <option value="ALL">ALL TYPES</option>
              <option value="RTGS">RTGS</option>
              <option value="NEFT">NEFT</option>
              <option value="UPI">UPI</option>
              <option value="WIRE">WIRE</option>
            </select>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800 font-sans">
              <tr>
                <th className="py-3 px-4 font-bold">TX REFERENCE</th>
                <th className="py-3 px-4 font-bold">SENDER</th>
                <th className="py-3 px-4 font-bold">RECEIVER</th>
                <th className="py-3 px-4 font-bold">AMOUNT</th>
                <th className="py-3 px-4 font-bold">TYPE</th>
                <th className="py-3 px-4 font-bold">STATUS</th>
                <th className="py-3 px-4 font-bold">BLOCKCHAIN HASH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {pageItems.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#5750F1]">{tx.transaction_reference}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{formatHash(tx.sender_account_id, 4)}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{formatHash(tx.receiver_account_id, 4)}</td>
                  <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                    Rs.{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                      {tx.transaction_type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        tx.status === 'FLAGGED'
                          ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                      }`}
                    >
                      {tx.status || 'COMPLETED'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#5750F1]" />
                    <span>{formatHash(tx.blockchain_hash || '', 6)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
          <span>
            Page {page} of {totalPages || 1} ({filtered.length} transactions)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3.5 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 font-semibold disabled:opacity-50 transition-colors"
            >
              PREV
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3.5 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 font-semibold disabled:opacity-50 transition-colors"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
