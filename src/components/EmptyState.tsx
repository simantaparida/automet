import { useRouter } from 'next/router';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  showAction?: boolean;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  showAction = true,
}: EmptyStateProps) {
  const router = useRouter();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (actionHref) {
      router.push(actionHref);
    }
  };

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid rgba(239,119,34,0.1)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <div
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: '700',
          color: '#111827',
          marginBottom: '0.75rem',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '0.9375rem',
          color: '#6b7280',
          marginBottom: showAction && actionLabel ? '2rem' : 0,
          maxWidth: '500px',
          margin: '0 auto',
          marginBottom: showAction && actionLabel ? '2rem' : 0,
          lineHeight: '1.6',
        }}
      >
        {description}
      </p>
      {showAction && actionLabel && (
        <button
          onClick={handleAction}
          style={{
            background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
            color: 'white',
            padding: '0.875rem 1.75rem',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            fontSize: '0.9375rem',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(239,119,34,0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,119,34,0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(239,119,34,0.25)';
          }}
        >
          <Plus size={18} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
