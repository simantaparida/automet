import { useState, useRef, useEffect } from 'react';
import { Crown, Briefcase, Wrench, ChevronDown, RotateCcw } from 'lucide-react';
import { useRoleSwitch, type UserRole } from '@/contexts/RoleSwitchContext';

const ROLE_ICONS = {
  owner: Crown,
  coordinator: Briefcase,
  technician: Wrench,
};

const ROLE_LABELS = {
  owner: 'Owner',
  coordinator: 'Coordinator',
  technician: 'Technician',
};

interface RoleSwitchProps {
  className?: string;
}

export default function RoleSwitch({ className }: RoleSwitchProps) {
  const {
    actualRole,
    activeRole,
    availableRoles,
    switchRole,
    resetRole,
    isLoading,
  } = useRoleSwitch();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Don't show if loading or no role
  if (isLoading || !actualRole || !activeRole) {
    return null;
  }

  // Don't show if only one role available (technician)
  if (availableRoles.length <= 1) {
    return null;
  }

  const isRoleSwitched = activeRole !== actualRole;
  const Icon = ROLE_ICONS[activeRole];

  const handleRoleSwitch = (role: UserRole) => {
    switchRole(role);
    setIsOpen(false);
  };

  const handleReset = () => {
    resetRole();
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      className={className}
      style={{ position: 'relative' }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          backgroundColor: isRoleSwitched ? '#fff5ed' : 'transparent',
          border: isRoleSwitched ? '1px solid #EF7722' : '1px solid #e5e7eb',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: isRoleSwitched ? '#EF7722' : '#6b7280',
          transition: 'all 0.2s',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = isRoleSwitched
            ? '#fff5ed'
            : '#f9fafb';
          e.currentTarget.style.borderColor = '#EF7722';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = isRoleSwitched
            ? '#fff5ed'
            : 'transparent';
          e.currentTarget.style.borderColor = isRoleSwitched
            ? '#EF7722'
            : '#e5e7eb';
        }}
        aria-label="Switch role"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Icon size={16} />
        <span>{ROLE_LABELS[activeRole]}</span>
        {isRoleSwitched && (
          <span
            style={{
              fontSize: '0.75rem',
              padding: '0.125rem 0.375rem',
              backgroundColor: '#EF7722',
              color: 'white',
              borderRadius: '4px',
              fontWeight: '600',
            }}
          >
            Viewing
          </span>
        )}
        <ChevronDown size={14} style={{ opacity: 0.7 }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            right: 0,
            minWidth: '200px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow:
              '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
            zIndex: 1000,
            padding: '0.5rem',
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#6b7280',
              padding: '0.5rem 0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderBottom: '1px solid #f3f4f6',
              marginBottom: '0.25rem',
            }}
          >
            View as:
          </div>
          {availableRoles.map((role) => {
            const RoleIcon = ROLE_ICONS[role];
            const isActive = activeRole === role;
            const isActual = actualRole === role && !isRoleSwitched;

            return (
              <button
                key={role}
                onClick={() => handleRoleSwitch(role)}
                disabled={isActive}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.625rem 0.75rem',
                  backgroundColor: isActive ? '#fff5ed' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isActive ? 'default' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? '#EF7722' : '#111827',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  opacity: isActive ? 1 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <RoleIcon size={18} />
                <span style={{ flex: 1 }}>{ROLE_LABELS[role]}</span>
                {isActual && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      fontStyle: 'italic',
                    }}
                  >
                    (Actual)
                  </span>
                )}
                {isActive && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.375rem',
                      backgroundColor: '#EF7722',
                      color: 'white',
                      borderRadius: '4px',
                      fontWeight: '600',
                    }}
                  >
                    Active
                  </span>
                )}
              </button>
            );
          })}
          {isRoleSwitched && (
            <>
              <div
                style={{
                  height: '1px',
                  backgroundColor: '#f3f4f6',
                  margin: '0.5rem 0',
                }}
              />
              <button
                onClick={handleReset}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.625rem 0.75rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#6b7280',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.color = '#EF7722';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                <RotateCcw size={18} />
                <span>Reset to {ROLE_LABELS[actualRole]}</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
