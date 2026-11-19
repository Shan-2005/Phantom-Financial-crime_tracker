import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
  iconColor?: 'green' | 'orange' | 'purple' | 'cyan' | 'blue';
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  iconColor = 'purple',
  subtitle,
}) => {
  const iconColorClasses = {
    green: 'bg-[#10B981] text-white shadow-sm shadow-emerald-500/20',
    orange: 'bg-[#FF9C55] text-white shadow-sm shadow-orange-500/20',
    purple: 'bg-[#8B5CF6] text-white shadow-sm shadow-purple-500/20',
    cyan: 'bg-[#00C5FF] text-white shadow-sm shadow-cyan-500/20',
    blue: 'bg-[#5750F1] text-white shadow-sm shadow-indigo-500/20',
  }[iconColor];

  return (
    <div className="bg-white dark:bg-[#1C2434] rounded-2xl p-6 border border-gray-100/80 dark:border-gray-800/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-all">
      <div className="flex items-center justify-between">
        {icon && (
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconColorClasses}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-2">
        <div>
          <h4 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {value}
          </h4>
          <p className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
        </div>

        {change && (
          <div
            className={`flex items-center gap-0.5 text-xs font-semibold ${
              isPositive
                ? 'text-[#10B981] dark:text-emerald-400'
                : 'text-[#F43F5E] dark:text-rose-400'
            }`}
          >
            <span>{change}</span>
            <span>{isPositive ? '↑' : '↓'}</span>
          </div>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500 truncate border-t border-gray-50 dark:border-gray-700/40 pt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
};
