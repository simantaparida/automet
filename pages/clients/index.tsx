import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import RoleBadge from '@/components/RoleBadge';
import EmptyState from '@/components/EmptyState';
import SortButtons from '@/components/SortButtons';
import { useRoleSwitch } from '@/contexts/RoleSwitchContext';
import { useURLFilters } from '@/hooks/useURLFilters';
import { Plus, Building2, Phone, Mail, MapPin, Search } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  notes: string | null;
}

export default function ClientsPage() {
  const router = useRouter();
  const { apiFetch, activeRole } = useRoleSwitch();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // URL-synced filters
  const [filters, setFilters] = useURLFilters({
    search: '',
    sort: 'name:asc',
  });

  useEffect(() => {
    fetchClients();
  }, [activeRole]); // Refetch when role changes

  useEffect(() => {
    if (filters.search.trim() === '') {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(
        (client) =>
          client.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          client.contact_email
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          client.contact_phone.includes(filters.search)
      );
      setFilteredClients(filtered);
    }
  }, [filters.search, clients]);

  // Sort clients based on filters.sort
  const sortedClients = useMemo(() => {
    const [field, order] = filters.sort.split(':');
    return [...filteredClients].sort((a, b) => {
      let aVal: any = a[field as keyof Client];
      let bVal: any = b[field as keyof Client];

      // Handle null values
      if (aVal === null) aVal = '';
      if (bVal === null) bVal = '';

      // String comparison (case-insensitive)
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comparison = aVal.toLowerCase().localeCompare(bVal.toLowerCase());
        return order === 'asc' ? comparison : -comparison;
      }

      // Numeric or date comparison
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredClients, filters.sort]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data);
        setFilteredClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .clients-container {
          padding-bottom: 80px;
        }
        .main-content {
          padding: 1rem;
        }
        .mobile-header {
          display: block;
        }
        .desktop-header {
          display: none;
        }
        .fab-button {
          bottom: 5rem;
        }
        @media (min-width: 768px) {
          .clients-container {
            margin-left: 260px;
            padding-bottom: 0;
            padding-top: 64px;
          }
          .main-content {
            padding: 2rem;
          }
          .mobile-header {
            display: none;
          }
          .desktop-header {
            display: block;
          }
          .fab-button {
            bottom: 2rem;
          }
        }
      `}</style>

      <div
        className="clients-container"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Desktop Sidebar */}
        <Sidebar activeTab="clients" />

        {/* Desktop Top Header */}
        <div className="desktop-header">
          <TopHeader />
        </div>

        {/* Desktop Role Badge - Shows when role is switched */}
        <div className="desktop-header">
          <RoleBadge />
        </div>

        {/* Mobile Header */}
        <header
          className="mobile-header"
          style={{
            background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
            color: 'white',
            padding: '1rem',
            position: 'sticky',
            top: 0,
            zIndex: 20,
            boxShadow: '0 2px 10px rgba(239,119,34,0.2)',
          }}
        >
          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              margin: '0 0 0.5rem 0',
            }}
          >
            Clients
          </h1>
          <p style={{ fontSize: '0.875rem', margin: 0, opacity: 0.9 }}>
            {filteredClients.length}{' '}
            {filteredClients.length === 1 ? 'client' : 'clients'}
          </p>
        </header>

        {/* Search Bar */}
        <div
          style={{
            backgroundColor: 'white',
            padding: '1rem',
            borderBottom: '1px solid rgba(239,119,34,0.1)',
            position: 'sticky',
            top: '66px',
            zIndex: 19,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ position: 'relative' }}>
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Search clients by name, email, or phone..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem 0.75rem 0.75rem 2.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '1rem',
                minHeight: '48px',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#EF7722';
                e.target.style.boxShadow = '0 0 0 3px rgba(239,119,34,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Clients List */}
        <main className="main-content">
          {!loading && filteredClients.length > 0 && (
            <SortButtons
              options={[
                { field: 'name', label: 'Name' },
                { field: 'contact_email', label: 'Email' },
                { field: 'address', label: 'Location' },
              ]}
              value={filters.sort}
              onChange={(value) => setFilters({ sort: value })}
            />
          )}
          {loading ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '200px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  border: '4px solid #ffe8d6',
                  borderTopColor: '#EF7722',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              ></div>
            </div>
          ) : filteredClients.length === 0 ? (
            <EmptyState
              icon={
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #fff5ed 0%, #ffe8d6 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid rgba(239,119,34,0.2)',
                  }}
                >
                  <Building2 size={40} color="#EF7722" />
                </div>
              }
              title={filters.search ? 'No clients found' : 'No clients yet'}
              description={
                filters.search
                  ? `No clients match "${filters.search}". Try adjusting your search terms or browse all clients.`
                  : 'Get started by adding your first client to manage jobs and track work.'
              }
              actionLabel={filters.search ? undefined : 'Add First Client'}
              actionHref={filters.search ? undefined : '/clients/new'}
              showAction={!filters.search}
            />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '1rem',
              }}
            >
              {sortedClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => router.push(`/clients/${client.id}`)}
                  style={{
                    backgroundColor: 'white',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(239,119,34,0.1)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    minHeight: '100px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.12)';
                    e.currentTarget.style.borderColor = 'rgba(239,119,34,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(239,119,34,0.1)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                      }}
                    >
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          background: 'linear-gradient(135deg, #fff5ed 0%, #ffe8d6 100%)',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px solid rgba(239,119,34,0.2)',
                          flexShrink: 0,
                        }}
                      >
                        <Building2 size={24} color="#EF7722" />
                      </div>
                      <h3
                        style={{
                          fontSize: '1.125rem',
                          fontWeight: '700',
                          color: '#111827',
                          margin: 0,
                        }}
                      >
                        {client.name}
                      </h3>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      paddingLeft: '3.5rem',
                    }}
                  >
                    {client.contact_phone && (
                      <div
                        style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <Phone size={16} color="#6b7280" />
                        <span>{client.contact_phone}</span>
                      </div>
                    )}
                    {client.contact_email && (
                      <div
                        style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <Mail size={16} color="#6b7280" />
                        <span>{client.contact_email}</span>
                      </div>
                    )}
                    {client.address && (
                      <div
                        style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          display: 'flex',
                          alignItems: 'start',
                          gap: '0.5rem',
                        }}
                      >
                        <MapPin
                          size={16}
                          color="#6b7280"
                          style={{ marginTop: '2px', flexShrink: 0 }}
                        />
                        <span style={{ lineHeight: '1.5' }}>{client.address}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </main>

        {/* FAB Button - Hide for technicians */}
        {activeRole !== 'technician' && (
          <button
            onClick={() => router.push('/clients/new')}
            className="fab-button"
            style={{
              position: 'fixed',
              right: '1rem',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
              color: 'white',
              border: 'none',
              fontSize: '1.75rem',
              fontWeight: '300',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239,119,34,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(239,119,34,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,119,34,0.3)';
            }}
          >
            <Plus size={28} />
          </button>
        )}

        <BottomNav activeTab="clients" />
      </div>
    </ProtectedRoute>
  );
}
