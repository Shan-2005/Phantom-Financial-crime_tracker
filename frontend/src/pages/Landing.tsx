import React from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  DollarSign,
  Box,
  Users,
  Shield,
  ArrowRight,
  Activity,
  CheckCircle2,
  Lock,
  Cpu,
  TrendingUp,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F4F7FB] dark:bg-[#0B132B] text-gray-900 dark:text-gray-100 flex flex-col font-sans selection:bg-[#5750F1] selection:text-white transition-colors">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#1C2434]/80 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/80">
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#5750F1] to-[#8E82F6] flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center">
                Phantom<span className="text-[#5750F1]">AML</span>
              </span>
              <p className="text-[10px] text-gray-400 font-medium">PHANTOM NETWORK INTELLIGENCE</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
            <Link to="/dashboard" className="hover:text-[#5750F1] transition-colors">
              Dashboard
            </Link>
            <Link to="/network" className="hover:text-[#5750F1] transition-colors">
              Network Graph
            </Link>
            <Link to="/customers/new" className="hover:text-[#5750F1] transition-colors">
              Onboarding Screening
            </Link>
            <Link to="/blockchain" className="hover:text-[#5750F1] transition-colors">
              Blockchain Registry
            </Link>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl bg-[#5750F1] hover:bg-[#4634FF] text-white font-semibold text-xs transition-all shadow-md shadow-indigo-500/25 flex items-center gap-2"
            >
              Launch Command Center <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="pt-16 pb-20 px-6 max-w-6xl mx-auto text-center">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700 text-[#5750F1] dark:text-[#8E82F6] text-xs font-semibold shadow-xs mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            PHANTOM AML & Graph Network Intelligence 2.0
          </div>

          {/* Hero Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white max-w-5xl mx-auto leading-[1.15]">
            Uncover Hidden Financial Networks with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5750F1] via-[#8B5CF6] to-[#00C5FF]">
              Phantom Intelligence
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Expose cyclic laundering rings, rapid pass-through mule chains, and hardware device
            fingerprint collisions across millions of accounts with sub-500ms explainable graph intelligence.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#5750F1] hover:bg-[#4634FF] text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5"
            >
              Access Phantom Console <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/customers/new"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 font-semibold text-sm shadow-xs transition-all"
            >
              Real-Time Screening Flow
            </Link>
          </div>

          {/* Live System Metrics Ticker */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 shadow-2xs">
              <span className="text-xs text-gray-400 font-medium">PaySim Evaluated</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">6,362,620</h3>
              <p className="text-[11px] text-emerald-500 font-semibold mt-1">100% Fraud Recall</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 shadow-2xs">
              <span className="text-xs text-gray-400 font-medium">Screening Latency</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">0.33 ms</h3>
              <p className="text-[11px] text-emerald-500 font-semibold mt-1">Target &lt; 500 ms</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 shadow-2xs">
              <span className="text-xs text-gray-400 font-medium">Planted Rings Defeated</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">26 Rings</h3>
              <p className="text-[11px] text-[#5750F1] font-semibold mt-1">94.0 Critical Score</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 shadow-2xs">
              <span className="text-xs text-gray-400 font-medium">Blockchain Anchor</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">100% Verified</h3>
              <p className="text-[11px] text-emerald-500 font-semibold mt-1">Sepolia EVM Registry</p>
            </div>
          </div>

          {/* Interactive Framed Dashboard Showcase */}
          <div className="mt-16 relative rounded-2xl bg-white dark:bg-gray-900 p-3 sm:p-4 border border-gray-200/80 dark:border-gray-800 shadow-2xl max-w-5xl mx-auto overflow-hidden">
            {/* Window titlebar with dots */}
            <div className="flex items-center justify-between pb-3 px-2 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs text-gray-400 font-mono">
                  https://phantom-admin.dev/dashboard
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                LIVE DEMO ENVIRONMENT
              </span>
            </div>

            {/* Showcase Mockup Content */}
            <div className="p-4 sm:p-6 bg-[#F4F7FB] dark:bg-[#0B132B] rounded-xl mt-3 text-left space-y-6">
              {/* 4 Stat Cards in Mini Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-xs">
                  <div className="w-9 h-9 rounded-full bg-[#10B981] flex items-center justify-center text-white mb-2">
                    <Eye className="w-4 h-4" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">3.5K</h4>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                    <span>Total Views</span>
                    <span className="text-emerald-500 font-semibold">0.43% ↑</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-xs">
                  <div className="w-9 h-9 rounded-full bg-[#FF9C55] flex items-center justify-center text-white mb-2">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">$4.2K</h4>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                    <span>Total Profit</span>
                    <span className="text-emerald-500 font-semibold">4.35% ↑</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-xs">
                  <div className="w-9 h-9 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white mb-2">
                    <Box className="w-4 h-4" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">3.5K</h4>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                    <span>Total Products</span>
                    <span className="text-emerald-500 font-semibold">2.59% ↑</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-xs">
                  <div className="w-9 h-9 rounded-full bg-[#00C5FF] flex items-center justify-center text-white mb-2">
                    <Users className="w-4 h-4" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">3.5K</h4>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                    <span>Total Users</span>
                    <span className="text-rose-500 font-semibold">-0.95% ↓</span>
                  </div>
                </div>
              </div>

              {/* Mini Chart Mockup Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      Payments Overview
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-medium text-gray-600 dark:text-gray-300">
                      Monthly ▾
                    </span>
                  </div>
                  <div className="h-28 mt-3 flex items-end gap-2 justify-between">
                    <div className="w-full bg-gradient-to-t from-[#5750F1]/20 to-[#5750F1]/60 h-16 rounded-t" />
                    <div className="w-full bg-gradient-to-t from-[#00C5FF]/20 to-[#00C5FF]/60 h-24 rounded-t" />
                    <div className="w-full bg-gradient-to-t from-[#5750F1]/20 to-[#5750F1]/60 h-20 rounded-t" />
                    <div className="w-full bg-gradient-to-t from-[#00C5FF]/20 to-[#00C5FF]/60 h-26 rounded-t" />
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between text-[10px] text-gray-400">
                    <span>Received Amount: $580.00</span>
                    <span>Due Amount: $628.00</span>
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-xs flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      Profit this week
                    </span>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Sales</span>
                        <span className="font-bold text-[#5750F1]">67%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#5750F1] h-full w-[67%]" />
                      </div>
                      <div className="flex justify-between text-xs mt-3">
                        <span className="text-gray-500">Revenue</span>
                        <span className="font-bold text-[#00C5FF]">33%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#00C5FF] h-full w-[33%]" />
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    className="mt-4 text-center py-2 rounded-lg bg-[#5750F1]/10 text-[#5750F1] font-semibold text-xs hover:bg-[#5750F1]/20 transition-colors"
                  >
                    Open Live Canvas
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Feature Cards */}
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Four Core Pillars of Anti-Financial Crime Network Intelligence
            </h2>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Deterministic, explainable graph rules that scale across millions of transactions with zero balance leakage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/60 shadow-xs hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-full bg-[#10B981] flex items-center justify-center text-white mb-4 shadow-sm shadow-emerald-500/20">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Circular Flow Engine
              </h3>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Johnson cycle detection & recursive CTEs identifying closed-loop money laundering
                (A &rarr; B &rarr; C &rarr; A) within a 72-hour window.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/60 shadow-xs hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-full bg-[#FF9C55] flex items-center justify-center text-white mb-4 shadow-sm shadow-orange-500/20">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Rapid Mule Pass-Through
              </h3>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Flags intermediary pass-through mules draining at least 85% to 90% of recent inflows
                within 120 minutes with minimal retained balance.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/60 shadow-xs hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white mb-4 shadow-sm shadow-purple-500/20">
                <Box className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Device & Subnet Collisions
              </h3>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Hardware fingerprint (`device_id`) and IP subnet collisions detect synthetic identity
                syndicates with zero raw PII storage.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/60 shadow-xs hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-full bg-[#00C5FF] flex items-center justify-center text-white mb-4 shadow-sm shadow-cyan-500/20">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Ethereum Smart Audit
              </h3>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Chained canonical SHA-256 transaction hashes anchored to `PhantomAuditRegistry.sol`
                for tamper-evident prosecution packages.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-[#1C2434] border-t border-gray-200/80 dark:border-gray-800 py-8 px-6 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              Phantom AML Suite — Operation Phantom Ring Edition
            </span>
          </div>
          <p>© 2026 Phantom AML Network Intelligence. Built for modern financial intelligence and compliance units.</p>
        </div>
      </footer>
    </div>
  );
};
