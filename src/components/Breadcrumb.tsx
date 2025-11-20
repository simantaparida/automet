import { Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        backgroundColor: 'white',
        borderBottom: '1px solid rgba(239,119,34,0.1)',
        fontSize: '0.875rem',
        color: '#6b7280',
        width: '100%',
        boxSizing: 'border-box',
      }}
      aria-label="Breadcrumb"
    >
      {/* Home Icon */}
      <Link
        href="/dashboard"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          color: '#6b7280',
          textDecoration: 'none',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#f3f4f6';
          e.currentTarget.style.color = '#EF7722';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#6b7280';
        }}
        aria-label="Home"
      >
        <Home size={18} />
      </Link>

      {/* Breadcrumb Items */}
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <ChevronRight size={16} color="#9ca3af" />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                style={{
                  color: '#6b7280',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'color 0.2s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '200px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#EF7722';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#6b7280';
                }}
              >
                {item.label}
              </Link>
            ) : (
              <span
                style={{
                  color: isLast ? '#111827' : '#6b7280',
                  fontWeight: isLast ? '600' : '500',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '200px',
                }}
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
