import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  DollarSign,
  Box,
  Users,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { StatCard } from '../components/ui/StatCard';
import { RiskBadge } from '../components/ui/RiskBadge';
import {
  demoRiskDistribution,
  demoSamplingReport,
  demoAlerts,
  demoTransactions,
} from '../lib/demoData';

// Payments Overview monthly time series (mirrors the dual smooth curves in reference image)
const paymentsOverviewData = [
  { month: 'Jan', received: 18, due: 28 },
  { month: 'Feb', received: 22, due: 20 },
  { month: 'Mar', received: 40, due: 34 },
  { month: 'Apr', received: 35, due: 42 },
  { month: 'May', received: 50, due: 45 },
  { month: 'Jun', received: 72, due: 62 },
  { month: 'Jul', received: 75, due: 65 },
  { month: 'Aug', received: 85, due: 78 },
  { month: 'Sep', received: 95, due: 85 },
  { month: 'Oct', received: 78, due: 68 },
  { month: 'Nov', received: 62, due: 58 },
  { month: 'Dec', received: 70, due: 64 },
];

// Weekly stacked bar chart (mirrors "Profit this week" in reference image)
const weeklyProfitData = [
  { day: 'Sat', sales: 44, revenue: 26 },
  { day: 'Sun', sales: 55, revenue: 32 },
  { day: 'Mon', sales: 41, revenue: 24 },
  { day: 'Tue', sales: 67, revenue: 28 },
  { day: 'Wed', sales: 22, revenue: 16 },
  { day: 'Thu', sales: 43, revenue: 38 },
  { day: 'Fri', sales: 65, revenue: 34 },
];

// Device breakdown (mirrors "Used Devices" donut in reference image)
const deviceBreakdownData = [
  { name: 'DEV-PHANTOM-103 (Shared)', value: 45, color: '#5750F1' },
  { name: 'Subnet IP 103.21.***.44', value: 30, color: '#00C5FF' },
  { name: 'Direct RTGS Terminals', value: 25, color: '#10B981' },
];

// Regional bank breakdown (mirrors "Region labels" in reference image)
const regionData = [
  { bank: 'HDFC Bank (Hub)', share: 38, volume: 'Rs.1.42M', status: 'CRITICAL RING' },
  { bank: 'ICICI Bank (Mule Pass)', share: 32, volume: 'Rs.1.39M', status: 'RAPID PASS' },
  { bank: 'State Bank of India', share: 18, volume: 'Rs.935K', status: 'STRUCTURING' },
  { bank: 'Axis Bank & Other', share: 12, volume: 'Rs.420K', status: 'MONITORED' },
];

export const Dashboard: React.FC = () => {
  const [paymentsFilter, setPaymentsFilter] = useState('Monthly');
  const [profitFilter, setProfitFilter] = useState('This Week');

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      {/* 4 Stat Cards — Circular icon metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          icon={<Eye className="w-6 h-6" />}
          iconColor="green"
          value="3.5K"
          title="Total Screened"
          change="0.43%"
          isPositive={true}
          subtitle={`${Number(demoSamplingReport.unique_accounts || 82218).toLocaleString()} unique accounts indexed`}
        />
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          iconColor="orange"
          value="$4.2K"
          title="Total Profit / Laundering"
          change="4.35%"
          isPositive={true}
          subtitle="Rs.1,415,000 cycled within 4.25 hours"
        />
        <StatCard
          icon={<Box className="w-6 h-6" />}
          iconColor="purple"
          value="3.5K"
          title="Total Products / Rings"
          change="2.59%"
          isPositive={true}
          subtitle="26 elementary cycles detected"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          iconColor="cyan"
          value="3.5K"
          title="Total Users / Transactions"
          change="0.95%"
          isPositive={false}
          subtitle="PaySim real fraud retention: 100%"
        />
      </div>

      {/* Operation Phantom Ring Spotlight Banner */}
      <div className="bg-white dark:bg-[#1C2434] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#5750F1]" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pl-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> SPOTLIGHT: ACTIVE LAUNDERING RING
              </span>
              <RiskBadge level="CRITICAL" score={94.0} size="sm" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              Operation Phantom Ring (Case INV-2026-PHANTOM-001)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-3xl leading-relaxed">
              Detected 3-hop closed-loop fund transfer cycling{' '}
              <span className="text-[#5750F1] font-semibold">Rs.1,415,000</span> across HDFC,
              ICICI, and SBI within 4.25 hours, linked by shared hardware fingerprint{' '}
              <span className="font-mono text-rose-500 font-semibold">DEV-PHANTOM-103</span>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/network"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5750F1] hover:bg-[#4634FF] text-white font-semibold text-xs transition-all shadow-md shadow-indigo-500/20"
            >
              Open Graph Canvas <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/investigations/INV-2026-PHANTOM-001"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 font-semibold text-xs transition-colors"
            >
              Case Dossier <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Middle Row — Payments Overview & Profit this week (Mirrors Reference Image) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Payments Overview Area Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1C2434] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800/80">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Payments Overview
              </h3>
              <div className="relative">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 border border-gray-200/80 dark:border-gray-700 hover:bg-gray-100">
                  {paymentsFilter} <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Smooth dual-line area chart */}
            <div className="h-72 mt-6 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={paymentsOverviewData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    {/* Purple gradient */}
                    <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5750F1" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#5750F1" stopOpacity={0.0} />
                    </linearGradient>
                    {/* Cyan gradient */}
                    <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C5FF" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#00C5FF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="month"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Area
                    type="natural"
                    dataKey="received"
                    stroke="#5750F1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#purpleGrad)"
                  />
                  <Area
                    type="natural"
                    dataKey="due"
                    stroke="#00C5FF"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#cyanGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Summary Dividers (mirrors Received Amount $580 / Due Amount $628) */}
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 text-center divide-x divide-gray-100 dark:divide-gray-800">
            <div>
              <p className="text-xs text-gray-400 font-medium">Received Amount</p>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">$580.00</h4>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Due Amount</p>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">$628.00</h4>
            </div>
          </div>
        </div>

        {/* Right: Profit this week Stacked Bar Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1C2434] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800/80">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Profit this week
              </h3>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 border border-gray-200/80 dark:border-gray-700 hover:bg-gray-100">
                  {profitFilter} <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Legend pills */}
            <div className="mt-4 flex items-center gap-4 text-xs font-medium text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5750F1]" />
                <span>Sales</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00C5FF]" />
                <span>Revenue</span>
              </div>
            </div>

            {/* Stacked bar chart */}
            <div className="h-72 mt-2 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyProfitData}
                  margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
                  barSize={14}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="day"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Bar dataKey="sales" stackId="a" fill="#5750F1" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="revenue" stackId="a" fill="#00C5FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <span>Critical Rings Intercepted: 26</span>
            <span className="text-[#10B981] font-semibold flex items-center gap-0.5">
              +14.2% vs last week <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Row — Used Devices (Donut) & Region Labels (Mirrors Reference Image) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Used Devices Donut Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1C2434] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800/80">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Used Devices
            </h3>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-600 dark:text-gray-300 border border-gray-200/80 dark:border-gray-700 hover:bg-gray-100">
              Monthly <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>

          <div className="h-64 mt-4 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 space-y-2">
            {deviceBreakdownData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600 dark:text-gray-300 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Region Labels / Institutional Transfer Network (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1C2434] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800/80">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Region labels
            </h3>
            <span className="text-xs font-semibold text-gray-400">Institutional Breakdown</span>
          </div>

          <div className="mt-4 space-y-4">
            {regionData.map((item) => (
              <div
                key={item.bank}
                className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4 hover:border-gray-200 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {item.bank}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#5750F1]/10 text-[#5750F1]">
                      {item.status}
                    </span>
                  </div>
                  <div className="w-64 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#5750F1] to-[#00C5FF] h-full rounded-full"
                      style={{ width: `${item.share}%` }}
                    />
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-gray-900 dark:text-white">
                    {item.volume}
                  </span>
                  <p className="text-[10px] text-gray-400">{item.share}% total flow</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <span>Connected Intermediary Banks: 6</span>
            <Link to="/transactions" className="text-[#5750F1] font-semibold hover:underline">
              View Detailed Ledgers →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
