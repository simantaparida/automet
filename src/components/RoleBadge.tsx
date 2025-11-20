import { useRoleSwitch } from '@/contexts/RoleSwitchContext';
import { X } from 'lucide-react';

const ROLE_LABELS = {
  owner: 'Owner',
  coordinator: 'Coordinator',
  technician: 'Technician',
};

interface RoleBadgeProps {
  className?: string;
}

/**
 * RoleBadge component - Shows a banner when role is switched
 */
export default function RoleBadge({ className }: RoleBadgeProps) {
  const { actualRole, activeRole, resetRole, isLoading } = useRoleSwitch();

  // Don't show if loading, no role, or role not switched
  if (isLoading || !actualRole || !activeRole || activeRole === actualRole) {
    return null;
  }

  return (
    <div
      className={className || 'role-badge'}
      style={{
        backgroundColor: '#fff5ed',
        borderBottom: '2px solid #EF7722',
        padding: '0.5rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        fontSize: '0.875rem',
        color: '#991b1b',
        fontWeight: '500',
        position: 'sticky',
        top: '64px',
        zIndex: 19,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <span>
        Viewing as: <strong>{ROLE_LABELS[activeRole]}</strong> (Your actual
        role: {ROLE_LABELS[actualRole]})
      </span>
      <button
        onClick={resetRole}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.375rem 0.75rem',
          backgroundColor: '#EF7722',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.75rem',
          fontWeight: '600',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#ff8833';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#EF7722';
        }}
        aria-label="Reset to actual role"
      >
        <X size={14} />
        Reset
      </button>
    </div>
  );
}
