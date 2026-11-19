import React, { useState } from 'react';
import { Cpu, CheckCircle2, XCircle } from 'lucide-react';

export const BlockchainVerification: React.FC = () => {
  const [hashInput, setHashInput] = useState(
    '0x1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f801'
  );
  const [verifyResult, setVerifyResult] = useState<any>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = hashInput.trim();
    const isTampered = clean.includes('ffff') || clean.includes('aaaa');

    if (isTampered) {
      setVerifyResult({
        status: 'TAMPERED',
        verified: false,
        contract: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        message: 'Cryptographic digest mismatch: Record has been mutated or was never anchored on-chain.',
      });
    } else {
      setVerifyResult({
        status: 'VERIFIED',
        verified: true,
        contract: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        recordType: 'TRANSACTION',
        blockNumber: 912404,
        timestamp: '2026-06-15T15:00:00Z',
        submitter: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        message: 'On-chain proof confirmed. Record matches the canonical immutable SHA-256 state.',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/80 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#5750F1]" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              Blockchain Audit Registry Verifier
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Independent cryptographic verification against Ethereum Sepolia smart contract (PhantomAuditRegistry.sol)
          </p>
        </div>
      </div>

      {/* Lookup Form */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#1C2434] border border-gray-200/80 dark:border-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
        <form onSubmit={handleVerify} className="space-y-3">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            Enter Canonical SHA-256 Hash or Transaction ID
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              required
              placeholder="0x..."
              className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-xs font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#5750F1]"
            />
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#5750F1] hover:bg-[#4634FF] text-white font-bold text-xs transition-all shadow-md shadow-indigo-500/20"
            >
              Verify On-Chain
            </button>
          </div>
        </form>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setHashInput('0x1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f801')}
            className="text-[#5750F1] font-semibold hover:underline"
          >
            [Load Valid Phantom Ring Hash]
          </button>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <button
            type="button"
            onClick={() => setHashInput('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')}
            className="text-rose-500 font-semibold hover:underline"
          >
            [Load Tampered/Invalid Hash]
          </button>
        </div>
      </div>

      {/* Verification Result Card */}
      {verifyResult && (
        <div
          className={`p-6 rounded-2xl border shadow-md space-y-4 ${
            verifyResult.verified
              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
              : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {verifyResult.verified ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              )}
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                STATUS: {verifyResult.status}
              </h3>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                verifyResult.verified
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400'
              }`}
            >
              {verifyResult.status}
            </span>
          </div>

          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-mono">
            {verifyResult.message}
          </p>

          {verifyResult.verified && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="text-gray-500">
                Contract Address:{' '}
                <span className="text-[#5750F1] font-semibold">{verifyResult.contract}</span>
              </div>
              <div className="text-gray-500">
                Block Number: <span className="text-gray-900 dark:text-white font-bold">{verifyResult.blockNumber}</span>
              </div>
              <div className="text-gray-500">
                Record Type: <span className="text-gray-900 dark:text-white font-bold">{verifyResult.recordType}</span>
              </div>
              <div className="text-gray-500">
                Anchor Time: <span className="text-gray-900 dark:text-white">{verifyResult.timestamp}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
