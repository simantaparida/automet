import { useState } from 'react';
import { useRouter } from 'next/router';
import { Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCommandPalette } from '@/hooks/useCommandPalette';

interface TopHeaderProps {
  onSearchFocus?: () => void;
}

export default function TopHeader({ onSearchFocus }: TopHeaderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { open: openCommandPalette } = useCommandPalette();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // For now, open command palette or navigate to search
      // Can be extended to show search results
      openCommandPalette();
    } else {
      openCommandPalette();
    }
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        backgroundColor: 'white',
        borderBottom: '1px solid rgba(239,119,34,0.1)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.5rem',
        zIndex: 25,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      {/* Branding - Left */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          minWidth: '200px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.125rem',
            fontWeight: '700',
            color: 'white',
          }}
        >
          A
        </div>
        <div>
          <h1
            style={{
              fontSize: '1.125rem',
              fontWeight: '700',
              color: '#111827',
              margin: 0,
              lineHeight: '1.2',
            }}
          >
            Automet
          </h1>
          <p
            style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              margin: 0,
              lineHeight: '1',
            }}
          >
            Field Service
          </p>
        </div>
      </div>

      {/* Global Search - Center */}
      <div
        style={{
          flex: 1,
          maxWidth: '600px',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        <form onSubmit={handleSearch}>
          <div style={{ position: 'relative' }}>
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Search jobs, clients, sites, assets... (Cmd+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={onSearchFocus}
              onClick={(e) => {
                e.preventDefault();
                openCommandPalette();
              }}
              style={{
                width: '100%',
                padding: '0.625rem 1rem 0.625rem 2.75rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '0.9375rem',
                backgroundColor: '#f9fafb',
                transition: 'all 0.2s',
                outline: 'none',
                minHeight: '40px',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#EF7722';
                e.target.style.backgroundColor = 'white';
                e.target.style.boxShadow = '0 0 0 3px rgba(239,119,34,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.backgroundColor = '#f9fafb';
                e.target.style.boxShadow = 'none';
              }}
            />
            <div
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '0.75rem',
                color: '#9ca3af',
                fontFamily: 'monospace',
                backgroundColor: '#f3f4f6',
                padding: '0.125rem 0.375rem',
                borderRadius: '4px',
                pointerEvents: 'none',
              }}
            >
              ⌘K
            </div>
          </div>
        </form>
      </div>

      {/* User Actions - Right */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          minWidth: '200px',
          justifyContent: 'flex-end',
        }}
      >
        {/* User Profile with Username */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            padding: '0.375rem 0.75rem',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          onClick={() => router.push('/profile')}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '600',
            }}
          >
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.125rem',
            }}
          >
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#111827',
                lineHeight: '1.2',
              }}
            >
              {user?.email?.split('@')[0] || 'User'}
            </span>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#6b7280',
                lineHeight: '1',
              }}
            >
              {user?.email || ''}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
