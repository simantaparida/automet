import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
}

export default function CollapsibleSection({
  title,
  icon,
  defaultOpen = true,
  children,
  badge,
  badgeColor = '#EF7722',
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        marginBottom: '1.5rem',
        borderRadius: '12px',
        backgroundColor: 'white',
        border: '1px solid rgba(239,119,34,0.1)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          backgroundColor: isOpen ? 'white' : '#fafafa',
          border: 'none',
          borderBottom: isOpen ? '1px solid rgba(239,119,34,0.1)' : 'none',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = '#f5f5f5';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = '#fafafa';
          }
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          {icon && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#EF7722',
              }}
            >
              {icon}
            </div>
          )}
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: '700',
              color: '#111827',
              margin: 0,
            }}
          >
            {title}
          </h2>
          {badge !== undefined && (
            <span
              style={{
                backgroundColor: `${badgeColor}15`,
                color: badgeColor,
                padding: '0.25rem 0.5rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600',
              }}
            >
              {badge}
            </span>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            color: '#6b7280',
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(0deg)' : 'rotate(0deg)',
          }}
        >
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {/* Content */}
      {isOpen && (
        <div
          style={{
            padding: '1.25rem',
            animation: 'slideDown 0.2s ease-out',
          }}
        >
          <style jsx>{`
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
          {children}
        </div>
      )}
    </div>
  );
}
