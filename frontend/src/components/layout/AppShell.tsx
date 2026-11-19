import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Network,
  ArrowLeftRight,
  UserPlus,
  Users,
  ShieldAlert,
  Bell,
  Briefcase,
  Cpu,
  FileCheck2,
  Database,
  Settings,
  Search,
  Sun,
  Moon,
  ChevronDown,
  Shield,
  Activity,
  Layers,
} from 'lucide-react';
import { isCloudMode } from '../../lib/supabase';

const menuSections = [
  {
    title: 'MAIN MENU',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/network', label: 'Network Graph', icon: Network },
      { to: '/customers/new', label: 'New Customer', icon: UserPlus, badge: 'Live', badgeType: 'live' },
      { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
      { to: '/identities', label: 'Identity Clusters', icon: Users, badge: 'Pro', badgeType: 'pro' },
      { to: '/risk-intelligence', label: 'Risk Intelligence', icon: ShieldAlert, badge: 'Pro', badgeType: 'pro' },
    ],
  },
  {
    title: 'SUPPORT & AUDIT',
    items: [
      { to: '/alerts', label: 'Alerts', icon: Bell, badge: '5', badgeType: 'count' },
      { to: '/investigations', label: 'Investigations', icon: Briefcase },
      { to: '/blockchain', label: 'Blockchain Audit', icon: Cpu, badge: 'EVM', badgeType: 'pro' },
      { to: '/audit-logs', label: 'Audit Trail', icon: FileCheck2 },
      { to: '/data-import', label: 'Data Ingestion', icon: Database },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export const AppShell: React.FC = () => {
  const location = useLocation();
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('phantom_theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('phantom_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('phantom_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Derive human-readable page title and subtitle
  const getPageInfo = () => {
    const path = location.pathname;
    if (path.startsWith('/network')) {
      return { title: 'Network Explorer', subtitle: 'Interactive Cytoscape.js Transaction & Ring Graph' };
    }
    if (path.startsWith('/customers/new')) {
      return { title: 'New Customer Onboarding', subtitle: 'Privacy-Shielded SHA-256 Onboarding & Screening' };
    }
    if (path.startsWith('/transactions')) {
      return { title: 'Transactions', subtitle: 'PaySim Financial Transfer Log & Anomaly Inspector' };
    }
    if (path.startsWith('/identities')) {
      return { title: 'Identity Clusters', subtitle: 'Hardware Device & Subnet IP Collision Matrix' };
    }
    if (path.startsWith('/risk-intelligence')) {
      return { title: 'Risk Intelligence', subtitle: '8-Factor Explainable Typology Scoring Rules' };
    }
    if (path.startsWith('/alerts')) {
      return { title: 'Intelligence Alerts', subtitle: 'Real-Time Typology Violations & Queue' };
    }
    if (path.startsWith('/investigations')) {
      return { title: 'Investigations Dossier', subtitle: 'FIU Case Management & Evidence Bundles' };
    }
    if (path.startsWith('/blockchain')) {
      return { title: 'Blockchain Verification', subtitle: 'Sepolia EVM Merkle Anchor & Tamper Detection' };
    }
    if (path.startsWith('/audit-logs')) {
      return { title: 'Audit Logs', subtitle: 'Immutable Administrative & Event Audit History' };
    }
    if (path.startsWith('/data-import')) {
      return { title: 'Data Ingestion', subtitle: 'PaySim Streaming Dataset & Seed Pipeline' };
    }
    if (path.startsWith('/settings')) {
      return { title: 'Settings', subtitle: 'System Configuration, API Keys, and Thresholds' };
    }
    return { title: 'Dashboard', subtitle: 'Phantom Anti-Money Laundering Solution' };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="flex h-screen bg-[#F4F7FB] dark:bg-[#0B132B] text-gray-800 dark:text-gray-100 overflow-hidden font-sans">
      {/* Left Sidebar */}
      <aside className="w-64 flex flex-col bg-white dark:bg-[#1C2434] border-r border-gray-200/80 dark:border-gray-800/80 select-none transition-colors z-20">
        {/* Brand Area */}
        <div className="h-[72px] flex items-center gap-3 px-6 border-b border-gray-100 dark:border-gray-800/60">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#5750F1] to-[#8E82F6] flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center">
              Phantom
            </h1>
            <p className="text-[10px] text-gray-400 font-semibold tracking-wider">
              AML INTELLIGENCE
            </p>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {menuSections.map((sec) => (
            <div key={sec.title} className="space-y-1">
              <p className="px-3 text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                {sec.title}
              </p>
              <div className="mt-2 space-y-1">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                          isActive
                            ? 'bg-[#5750F1]/10 text-[#5750F1] font-semibold dark:bg-[#5750F1]/20 dark:text-[#8E82F6]'
                            : 'text-gray-600 hover:text-[#5750F1] hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-white'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                      <span>{item.label}</span>

                      {item.badge && item.badgeType === 'pro' && (
                        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#5750F1] text-white">
                          {item.badge}
                        </span>
                      )}
                      {item.badge && item.badgeType === 'live' && (
                        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {item.badge}
                        </span>
                      )}
                      {item.badge && item.badgeType === 'count' && (
                        <span className="ml-auto text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom System Status Card */}
        <div className="p-4 m-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Engine Online
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 shadow-2xs">
              {isCloudMode ? 'Cloud' : 'Local'}
            </span>
          </div>
          <div className="mt-2 text-[10px] text-gray-400 truncate">
            EVM Sepolia: 100% Verified
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-[72px] flex items-center justify-between px-8 bg-white dark:bg-[#1C2434] border-b border-gray-200/80 dark:border-gray-800/80 transition-colors z-10">
          {/* Left: Dynamic Page Title & Subtitle */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5 font-medium">
              {subtitle}
            </p>
          </div>

          {/* Right: Controls & User Profile */}
          <div className="flex items-center gap-4">
            {/* Search capsule */}
            <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#F4F7FB] dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700/60 text-xs text-gray-500 w-60 focus-within:w-72 focus-within:border-[#5750F1] transition-all">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-xs text-gray-700 dark:text-gray-200 placeholder-gray-400 w-full"
              />
            </div>

            {/* Dark / Light Toggle Switch */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-full bg-[#F4F7FB] dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-[#5750F1] dark:hover:text-white transition-colors border border-gray-200/60 dark:border-gray-700/60"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
            </button>

            {/* Notification Bell */}
            <NavLink
              to="/alerts"
              className="relative p-2 rounded-full bg-[#F4F7FB] dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-[#5750F1] transition-colors border border-gray-200/60 dark:border-gray-700/60"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-gray-800" />
            </NavLink>

            {/* User Profile Chip (matching John Smith in screenshot) */}
            <div className="flex items-center gap-3 pl-2 border-l border-gray-200/80 dark:border-gray-800">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#5750F1] to-[#00C5FF] p-0.5 flex items-center justify-center shadow-sm">
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center font-bold text-xs text-[#5750F1] dark:text-indigo-400">
                  JS
                </div>
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                  <span>John Smith</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <span className="text-[10px] text-gray-400 font-medium">FIU Lead</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#F4F7FB] dark:bg-[#0B132B]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
