import React from 'react';
import { demoInvestigations } from '../lib/demoData';
import { Briefcase, ArrowRight, Clock, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Investigations: React.FC = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200/80 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#5750F1]" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              Financial Crime Investigations
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Active AML intelligence case dossiers, prosecution evidence packages, and court-admissible audit logs
          </p>
        </div>

        <button className="px-5 py-2.5 rounded-xl bg-[#5750F1] hover:bg-[#4634FF] text-white font-bold text-xs transition-all shadow-md shadow-indigo-500/20">
          + Create Investigation
        </button>
      </div>

      {/* Cases List */}
      <div className="space-y-4">
        {demoInvestigations.map((inv) => (
          <div
            key={inv.id}
            className="p-6 rounded-2xl bg-white dark:bg-[#1C2434] border border-gray-200/80 dark:border-gray-800 hover:border-[#5750F1]/40 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-mono text-[#5750F1]">{inv.case_number}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200">
                  {inv.priority}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5750F1]/10 text-[#5750F1] border border-[#5750F1]/20">
                  {inv.status}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Opened: {new Date(inv.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">{inv.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{inv.description}</p>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <UserCheck className="w-4 h-4 text-[#5750F1]" />
                <span>Lead: <strong className="text-gray-800 dark:text-gray-200">{inv.assigned_to}</strong></span>
              </div>
              <Link
                to={`/investigations/${inv.case_number}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 text-[#5750F1] dark:text-[#8E82F6] text-xs font-bold border border-gray-200 dark:border-gray-700 transition-colors"
              >
                Open Investigation Dossier <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
