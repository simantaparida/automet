import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Search,
  Briefcase,
  Users,
  MapPin,
  Wrench,
  Package,
  Home,
  Plus,
  X,
  FileText,
  Settings,
  Calendar,
  TrendingUp,
} from 'lucide-react';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  action: () => void;
  keywords: string[];
  category: 'navigation' | 'actions' | 'search';
  shortcut?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Define all available commands
  const allCommands: Command[] = [
    // Navigation
    {
      id: 'dashboard',
      label: 'Go to Dashboard',
      description: 'View your dashboard overview',
      icon: Home,
      action: () => {
        router.push('/dashboard');
        onClose();
      },
      keywords: ['dashboard', 'home', 'overview'],
      category: 'navigation',
      shortcut: 'G D',
    },
    {
      id: 'jobs',
      label: 'Go to Jobs',
      description: 'View and manage all jobs',
      icon: Briefcase,
      action: () => {
        router.push('/jobs');
        onClose();
      },
      keywords: ['jobs', 'work', 'tasks'],
      category: 'navigation',
      shortcut: 'G J',
    },
    {
      id: 'clients',
      label: 'Go to Clients',
      description: 'View and manage clients',
      icon: Users,
      action: () => {
        router.push('/clients');
        onClose();
      },
      keywords: ['clients', 'customers'],
      category: 'navigation',
      shortcut: 'G C',
    },
    {
      id: 'sites',
      label: 'Go to Sites',
      description: 'View and manage client sites',
      icon: MapPin,
      action: () => {
        router.push('/sites');
        onClose();
      },
      keywords: ['sites', 'locations', 'addresses'],
      category: 'navigation',
      shortcut: 'G S',
    },
    {
      id: 'assets',
      label: 'Go to Assets',
      description: 'View and manage assets',
      icon: Wrench,
      action: () => {
        router.push('/assets');
        onClose();
      },
      keywords: ['assets', 'equipment'],
      category: 'navigation',
      shortcut: 'G A',
    },
    {
      id: 'inventory',
      label: 'Go to Inventory',
      description: 'View and manage inventory',
      icon: Package,
      action: () => {
        router.push('/inventory');
        onClose();
      },
      keywords: ['inventory', 'stock', 'items'],
      category: 'navigation',
      shortcut: 'G I',
    },
    // Actions
    {
      id: 'create-job',
      label: 'Create New Job',
      description: 'Create a new field service job',
      icon: Plus,
      action: () => {
        router.push('/jobs/new');
        onClose();
      },
      keywords: ['create', 'new', 'add', 'job'],
      category: 'actions',
      shortcut: 'C',
    },
    {
      id: 'create-client',
      label: 'Create New Client',
      description: 'Add a new client',
      icon: Plus,
      action: () => {
        router.push('/clients/new');
        onClose();
      },
      keywords: ['create', 'new', 'add', 'client', 'customer'],
      category: 'actions',
    },
    {
      id: 'create-site',
      label: 'Create New Site',
      description: 'Add a new client site',
      icon: Plus,
      action: () => {
        router.push('/sites/new');
        onClose();
      },
      keywords: ['create', 'new', 'add', 'site', 'location'],
      category: 'actions',
    },
    {
      id: 'create-asset',
      label: 'Create New Asset',
      description: 'Add a new asset',
      icon: Plus,
      action: () => {
        router.push('/assets/new');
        onClose();
      },
      keywords: ['create', 'new', 'add', 'asset', 'equipment'],
      category: 'actions',
    },
    // Search (can be extended)
    {
      id: 'search-jobs',
      label: 'Search Jobs',
      description: 'Search across all jobs',
      icon: Search,
      action: () => {
        router.push('/jobs?search=');
        onClose();
      },
      keywords: ['search', 'find', 'jobs'],
      category: 'search',
      shortcut: '/',
    },
  ];

  // Filter commands based on search
  const filteredCommands = allCommands.filter((command) => {
    if (!search.trim()) return true;
    const searchLower = search.toLowerCase();
    return (
      command.label.toLowerCase().includes(searchLower) ||
      command.description?.toLowerCase().includes(searchLower) ||
      command.keywords.some((keyword) => keyword.includes(searchLower))
    );
  });

  // Group commands by category
  const groupedCommands = filteredCommands.reduce(
    (acc, command) => {
      if (!acc[command.category]) {
        acc[command.category] = [];
      }
      acc[command.category].push(command);
      return acc;
    },
    {} as Record<string, Command[]>
  );

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Handle Cmd/Ctrl+K to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle won't work here since we don't control state, but parent will
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out',
        }}
      />

      {/* Command Palette */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '640px',
          maxHeight: '80vh',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.2s ease-out',
          border: '1px solid rgba(239, 119, 34, 0.1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem',
            borderBottom: '1px solid rgba(239, 119, 34, 0.1)',
            gap: '0.75rem',
          }}
        >
          <Search size={20} color="#6b7280" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or search..."
            autoFocus
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              color: '#111827',
              background: 'transparent',
            }}
          />
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Commands List */}
        <div
          style={{
            overflowY: 'auto',
            padding: '0.5rem',
            maxHeight: 'calc(80vh - 80px)',
          }}
        >
          {filteredCommands.length === 0 ? (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#6b7280',
              }}
            >
              <p style={{ margin: 0, fontSize: '0.9375rem' }}>No commands found</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8125rem' }}>
                Try a different search term
              </p>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, commands]) => (
              <div key={category} style={{ marginBottom: '1rem' }}>
                <div
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {category === 'navigation' && 'Navigate'}
                  {category === 'actions' && 'Actions'}
                  {category === 'search' && 'Search'}
                </div>
                {commands.map((command, index) => {
                  const globalIndex = filteredCommands.findIndex((c) => c.id === command.id);
                  const isSelected = globalIndex === selectedIndex;
                  const Icon = command.icon;

                  return (
                    <button
                      key={command.id}
                      onClick={command.action}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        border: 'none',
                        background: isSelected
                          ? 'linear-gradient(135deg, #fff5ed 0%, #ffe8d6 100%)'
                          : 'transparent',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        textAlign: 'left',
                        transition: 'all 0.15s',
                        borderLeft: isSelected ? '3px solid #EF7722' : '3px solid transparent',
                      }}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: isSelected
                            ? 'rgba(239, 119, 34, 0.1)'
                            : '#f3f4f6',
                          borderRadius: '8px',
                          color: isSelected ? '#EF7722' : '#6b7280',
                        }}
                      >
                        <Icon size={20} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '0.9375rem',
                            fontWeight: '600',
                            color: '#111827',
                            marginBottom: '0.125rem',
                          }}
                        >
                          {command.label}
                        </div>
                        {command.description && (
                          <div
                            style={{
                              fontSize: '0.8125rem',
                              color: '#6b7280',
                            }}
                          >
                            {command.description}
                          </div>
                        )}
                      </div>
                      {command.shortcut && (
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: '#9ca3af',
                            fontFamily: 'monospace',
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '4px',
                          }}
                        >
                          {command.shortcut}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '0.75rem 1rem',
            borderTop: '1px solid rgba(239, 119, 34, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: '#6b7280',
          }}
        >
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>
              <kbd style={{ padding: '0.125rem 0.375rem', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
                ↑↓
              </kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd style={{ padding: '0.125rem 0.375rem', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
                Enter
              </kbd>{' '}
              Select
            </span>
            <span>
              <kbd style={{ padding: '0.125rem 0.375rem', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
                Esc
              </kbd>{' '}
              Close
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -45%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </>
  );
}

