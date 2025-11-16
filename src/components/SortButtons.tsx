import { ArrowUp, ArrowDown } from 'lucide-react';

export interface SortOption {
  field: string;
  label: string;
}

interface SortButtonsProps {
  options: SortOption[];
  value: string; // format: "field:order" e.g., "name:asc"
  onChange: (value: string) => void;
}

export default function SortButtons({ options, value, onChange }: SortButtonsProps) {
  const [sortBy, sortOrder] = value.split(':');

  const handleToggle = (field: string) => {
    if (sortBy === field) {
      // Toggle order if same field
      const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      onChange(`${field}:${newOrder}`);
    } else {
      // Default to ascending for new field
      onChange(`${field}:asc`);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        flexWrap: 'wrap',
        marginBottom: '1rem',
      }}
    >
      <span
        style={{
          fontSize: '0.8125rem',
          color: '#6b7280',
          fontWeight: '500',
          paddingRight: '0.25rem',
        }}
      >
        Sort by:
      </span>
      {options.map((option) => {
        const isActive = sortBy === option.field;
        return (
          <button
            key={option.field}
            onClick={() => handleToggle(option.field)}
            style={{
              padding: '0.5rem 0.875rem',
              borderRadius: '6px',
              border: isActive ? '2px solid #EF7722' : '1px solid #e5e7eb',
              backgroundColor: isActive ? '#fff5ed' : 'white',
              fontSize: '0.8125rem',
              fontWeight: '600',
              color: isActive ? '#EF7722' : '#111827',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              transition: 'all 0.2s',
              minHeight: '36px',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = '#d1d5db';
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.backgroundColor = 'white';
              }
            }}
          >
            {option.label}
            {isActive && (
              <span style={{ display: 'flex', alignItems: 'center' }}>
                {sortOrder === 'asc' ? (
                  <ArrowUp size={14} strokeWidth={2.5} />
                ) : (
                  <ArrowDown size={14} strokeWidth={2.5} />
                )}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
