import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InfoItem {
  label: string;
  value: string | React.ReactNode;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
    icon: LucideIcon;
  };
}

interface JobInfoCardProps {
  title: string;
  icon: LucideIcon;
  items: InfoItem[];
  className?: string;
}

export default function JobInfoCard({
  title,
  icon: Icon,
  items,
  className = '',
}: JobInfoCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden ${className}`}
    >
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2.5">
        <Icon size={18} className="text-primary" />
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide m-0">
          {title}
        </h3>
      </div>
      <div className="p-5 flex flex-col gap-5">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            {item.icon && (
              <div className="mt-0.5 text-gray-400">
                <item.icon size={16} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-gray-500 tracking-wide mb-0.5">
                {item.label}
              </div>
              <div className="text-sm font-medium text-gray-900 break-words">
                {item.value || (
                  <span className="text-gray-400 italic">Not provided</span>
                )}
              </div>
              {item.action && (
                <button
                  onClick={item.action.onClick}
                  className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-600 transition-colors"
                >
                  <item.action.icon size={12} />
                  {item.action.label}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
