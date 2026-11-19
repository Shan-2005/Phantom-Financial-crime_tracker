import React, { useState } from 'react';
import { demoClusters } from '../lib/demoData';
import {
  Users,
  ExternalLink,
  Laptop,
  Globe,
  Fingerprint,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { SearchBar } from '../components/ui/SearchBar';
import { RiskBadge } from '../components/ui/RiskBadge';
import { Link } from 'react-router-dom';

interface CustomerRef {
  id?: string;
  name?: string;
  ref?: string;
}

interface IdentityClusterItem {
  id?: string;
  cluster_name?: string;
  description?: string;
  risk_score?: number;
  entity_ids?: string;
  attribute_type?: string;
  attribute_value?: string;
  customer_count?: number;
  customers?: CustomerRef[];
  risk_level?: string;
}

export const Identities: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const clustersList = (demoClusters || []) as IdentityClusterItem[];

  const filteredClusters = clustersList.filter((c) => {
    const rawRisk = (
      c.risk_level ||
      (c.risk_score && c.risk_score >= 80 ? 'CRITICAL' : c.risk_score && c.risk_score >= 50 ? 'HIGH' : 'MEDIUM')
    ).toUpperCase();

    if (severityFilter !== 'ALL' && rawRisk !== severityFilter) {
      return false;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const val = (c.attribute_value || c.cluster_name || c.id || '').toLowerCase();
      const type = (c.attribute_type || '').toLowerCase();
      const desc = (c.description || '').toLowerCase();
      const custNames = (c.customers || []).map((x) => `${x.name || ''} ${x.ref || ''}`).join(' ').toLowerCase();

      return val.includes(q) || type.includes(q) || desc.includes(q) || custNames.includes(q);
    }
    return true;
  });

  const criticalCount = clustersList.filter((c) => {
    const r = (c.risk_level || (c.risk_score && c.risk_score >= 80 ? 'CRITICAL' : '')).toUpperCase();
    return r === 'CRITICAL';
  }).length;

  const totalCollisions = clustersList.reduce((acc, c) => acc + (c.customer_count || (c.customers ? c.customers.length : 0)), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-[#1C2434] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#5750F1]/10 flex items-center justify-center text-[#5750F1]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                Shared Identity & Device Clusters
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Detecting multi-account syndicates sharing hardware fingerprints (<code className="text-[#5750F1] font-mono">device_id</code>), IP subnets, or proxy clusters
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-72">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by device, IP, or customer..."
            />
          </div>

          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800/80 p-1 rounded-xl text-xs font-semibold">
            {['ALL', 'CRITICAL', 'HIGH'].map((lvl) => {
              const isActive = severityFilter === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setSeverityFilter(lvl)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    isActive
                      ? 'bg-[#5750F1] text-white shadow-xs font-bold'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1C2434] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-[#5750F1] flex items-center justify-center">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-400">Total Monitored Clusters</span>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {clustersList.length} Unique Fingerprints
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1C2434] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-400">Critical Syndicate Clusters</span>
            <div className="text-lg font-bold text-rose-600 dark:text-rose-400">
              {criticalCount} Syndicate Nodes
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1C2434] border border-gray-200/80 dark:border-gray-800/80 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-gray-400">Total Cross-Account Collisions</span>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {totalCollisions} Linked Customer Profiles
            </div>
          </div>
        </div>
      </div>

      {/* Cluster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClusters.map((cluster, idx) => {
          const attributeValue = cluster.attribute_value || cluster.cluster_name || cluster.id || `Cluster #${idx + 1}`;
          const attributeType = (cluster.attribute_type || 'DEVICE').toUpperCase();
          const riskLevel = (
            cluster.risk_level ||
            (cluster.risk_score && cluster.risk_score >= 80 ? 'CRITICAL' : cluster.risk_score && cluster.risk_score >= 50 ? 'HIGH' : 'MEDIUM')
          ).toUpperCase();

          const score = typeof cluster.risk_score === 'number' ? cluster.risk_score : (riskLevel === 'CRITICAL' ? 94.0 : riskLevel === 'HIGH' ? 76.5 : 42.0);

          let customers: CustomerRef[] = [];
          if (Array.isArray(cluster.customers)) {
            customers = cluster.customers;
          } else if (typeof cluster.entity_ids === 'string') {
            try {
              customers = JSON.parse(cluster.entity_ids).map((idStr: string) => ({ id: idStr, name: idStr }));
            } catch {
              customers = [];
            }
          }

          const customerCount = cluster.customer_count ?? customers.length;
          const isPhantom =
            attributeValue.includes('PHANTOM') ||
            (cluster.cluster_name && cluster.cluster_name.includes('Phantom')) ||
            attributeValue.includes('103');

          return (
            <div
              key={cluster.id || attributeValue}
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                isPhantom
                  ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60 shadow-md ring-1 ring-rose-500/20'
                  : 'bg-white dark:bg-[#1C2434] border-gray-200/80 dark:border-gray-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md'
              }`}
            >
              <div className="space-y-4">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isPhantom
                          ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400'
                          : 'bg-[#5750F1]/10 text-[#5750F1]'
                      }`}
                    >
                      {attributeType.includes('IP') ? (
                        <Globe className="w-4 h-4" />
                      ) : (
                        <Laptop className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                        {attributeType} FINGERPRINT
                      </span>
                      <h3 className="text-sm font-extrabold font-mono text-gray-900 dark:text-white tracking-tight break-all">
                        {attributeValue}
                      </h3>
                    </div>
                  </div>

                  <RiskBadge level={riskLevel} score={score} size="sm" />
                </div>

                {/* Description / Syndicate Status */}
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  {cluster.description || (
                    isPhantom
                      ? 'Hardware fingerprint linked to multi-bank RTGS ring cycling Rs.1,415,000 across HDFC, ICICI, and SBI within 4.25 hours.'
                      : `Hardware device collision linking ${customerCount} independent customer accounts with synchronized transactional activity.`
                  )}
                </p>

                {/* Linked Customers Section */}
                <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800/80">
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 flex items-center justify-between">
                    <span>Linked Customer Profiles:</span>
                    <span className="text-xs font-bold text-[#5750F1]">{customerCount} Members</span>
                  </span>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {customers.slice(0, 4).map((cust, i) => (
                      <div
                        key={cust.id || i}
                        className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className="w-5 h-5 rounded-full bg-[#5750F1]/10 text-[#5750F1] text-[10px] font-bold flex items-center justify-center">
                            {(cust.name || 'C')[0]}
                          </div>
                          <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                            {cust.name || cust.id || 'Linked Customer'}
                          </span>
                        </div>
                        {cust.ref && (
                          <span className="font-mono text-[10px] text-gray-400 shrink-0 ml-2">
                            {cust.ref}
                          </span>
                        )}
                      </div>
                    ))}
                    {customers.length > 4 && (
                      <p className="text-[11px] text-gray-400 text-center pt-1">
                        + {customers.length - 4} more accounts in syndicate
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-2">
                <Link
                  to={`/network?search=${encodeURIComponent(attributeValue)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5750F1] dark:text-indigo-400 hover:underline"
                >
                  Inspect in Graph <ExternalLink className="w-3 h-3" />
                </Link>

                {isPhantom && (
                  <Link
                    to="/investigations/INV-2026-PHANTOM-001"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition-colors shadow-xs"
                  >
                    Case Dossier <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
