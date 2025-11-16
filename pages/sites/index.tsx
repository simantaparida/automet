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
import { Plus, MapPin, Building2, Search, Filter } from 'lucide-react';

interface Site {
  id: string;
  name: string;
  address: string;
  gps_lat: number | null;
  gps_lng: number | null;
  metadata: Record<string, any> | null;
  client_id?: string;
  client?: {
    id: string;
    name: string;
  };
}

interface Client {
  id: string;
  name: string;
}

export default function SitesPage() {
  const router = useRouter();
  const { apiFetch, activeRole} = useRoleSwitch();
  const [sites, setSites] = useState<Site[]>([]);
  const [filteredSites, setFilteredSites] = useState<Site[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // URL-synced filters
  const [filters, setFilters] = useURLFilters({
    search: '',
    client: '',
    sort: 'name:asc',
  });

  useEffect(() => {
    fetchData();
  }, [activeRole]); // Refetch when role changes

  useEffect(() => {
    let filtered = sites;

    // Filter by client if selected
    if (filters.client) {
      filtered = filtered.filter((site) => site.client?.id === filters.client);
    }

    // Filter by search term
    if (filters.search.trim() !== '') {
      filtered = filtered.filter(
        (site) =>
          site.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          site.address.toLowerCase().includes(filters.search.toLowerCase()) ||
          site.client?.name?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredSites(filtered);
  }, [filters.search, filters.client, sites]);

  // Sort sites based on filters.sort
  const sortedSites = useMemo(() => {
    const [field, order] = filters.sort.split(':');
    return [...filteredSites].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      // Handle nested client name for sorting
      if (field === 'client') {
        aVal = a.client?.name || '';
        bVal = b.client?.name || '';
      } else {
        aVal = a[field as keyof Site];
        bVal = b[field as keyof Site];
      }

      // Handle null values
      if (aVal === null) aVal = '';
      if (bVal === null) bVal = '';

      // String comparison (case-insensitive)
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        const comparison = aVal.toLowerCase().localeCompare(bVal.toLowerCase());
        return order === 'asc' ? comparison : -comparison;
      }

      // Numeric comparison
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredSites, filters.sort]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sitesResponse, clientsResponse] = await Promise.all([
        apiFetch('/api/sites'),
        apiFetch('/api/clients'),
      ]);

      if (sitesResponse.ok) {
        const sitesData = await sitesResponse.json();
        console.log('Sites data received:', sitesData);
        
        // If sites don't have nested client data, fetch clients separately and merge
        let sitesWithClientData = sitesData;
        
        // Check if any sites are missing client data
        const sitesNeedingClientData = sitesData.filter(
          (site: Site) => !site.client?.name
        );
        
        if (sitesNeedingClientData.length > 0) {
          // Fetch all clients
          try {
            const clientsResponse = await apiFetch('/api/clients');
            if (clientsResponse.ok) {
              const clientsData = await clientsResponse.json();
              
              // Create a map of client_id -> client data
              const clientsMap = new Map(
                clientsData.map((client: Client) => [client.id, client])
              );
              
              // Merge client data into sites
              sitesWithClientData = sitesData.map((site: Site) => {
                // If site already has client data, return as is
                if (site.client?.name) {
                  return site;
                }
                
                // Otherwise, look up client data from the map
                // Try to get client_id from the site object (it might be in the raw data)
                const clientId = (site as any).client_id;
                if (clientId && clientsMap.has(clientId)) {
                  const client = clientsMap.get(clientId);
                  return {
                    ...site,
                    client_id: clientId,
                    client: {
                      id: client.id,
                      name: client.name,
                    },
                  };
                }
                
                // Return site as is if we can't find client data
                return site;
              });
            }
          } catch (error) {
            console.error('Error fetching clients for sites:', error);
          }
        }
        
        setSites(sitesWithClientData);
        setFilteredSites(sitesWithClientData);
      } else {
        const errorData = await sitesResponse.json().catch(() => ({}));
        console.error('Sites API error:', errorData);
        alert(`Failed to load sites: ${errorData.error || 'Unknown error'}`);
      }

      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json();
        setClients(clientsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
        .sites-container {
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
          .sites-container {
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
        className="sites-container"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Desktop Sidebar */}
        <Sidebar activeTab="sites" />

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
            Sites
          </h1>
          <p style={{ fontSize: '0.875rem', margin: 0, opacity: 0.9 }}>
            {filteredSites.length}{' '}
            {filteredSites.length === 1 ? 'site' : 'sites'}
          </p>
        </header>

        {/* Search & Filter Bar */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Search Input */}
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
                placeholder="Search sites by name, address, or client..."
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

            {/* Client Filter */}
            <div style={{ position: 'relative' }}>
              <Filter
                size={20}
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              />
              <select
                value={filters.client}
                onChange={(e) => setFilters({ client: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  minHeight: '48px',
                  boxSizing: 'border-box',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  appearance: 'none',
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
              >
                <option value="">All Clients</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Sites List */}
        <main className="main-content">
          {!loading && filteredSites.length > 0 && (
            <SortButtons
              options={[
                { field: 'name', label: 'Name' },
                { field: 'address', label: 'Address' },
                { field: 'client', label: 'Client' },
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
          ) : filteredSites.length === 0 ? (
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
                  <MapPin size={40} color="#EF7722" />
                </div>
              }
              title={filters.search || filters.client ? 'No sites found' : 'No sites yet'}
              description={
                filters.search || filters.client
                  ? 'No sites match your search or filter criteria. Try adjusting your filters or browse all sites.'
                  : 'Get started by adding your first site location to manage assets and jobs.'
              }
              actionLabel={filters.search || filters.client ? undefined : 'Add First Site'}
              actionHref={filters.search || filters.client ? undefined : '/sites/new'}
              showAction={!filters.search && !filters.client}
            />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '1rem',
              }}
            >
              {sortedSites.map((site) => (
                <button
                  key={site.id}
                  onClick={() => router.push(`/sites/${site.id}`)}
                  style={{
                    backgroundColor: 'white',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(239,119,34,0.1)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    minHeight: '120px',
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
                        flex: 1,
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
                        <MapPin size={24} color="#EF7722" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3
                          style={{
                            fontSize: '1.125rem',
                            fontWeight: '700',
                            color: '#111827',
                            margin: '0 0 0.25rem 0',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {site.name}
                        </h3>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.8125rem',
                            color: '#6b7280',
                          }}
                        >
                          <Building2 size={14} color="#6b7280" />
                          <span
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {site.client?.name || 'Unknown Client'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {site.address && (
                    <div
                      style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        display: 'flex',
                        alignItems: 'start',
                        gap: '0.5rem',
                        marginTop: '0.5rem',
                        paddingLeft: '3.5rem',
                      }}
                    >
                      <MapPin
                        size={16}
                        color="#6b7280"
                        style={{ marginTop: '2px', flexShrink: 0 }}
                      />
                      <span style={{ lineHeight: '1.5' }}>{site.address}</span>
                    </div>
                  )}
                  {site.gps_lat && site.gps_lng && (
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#EF7722',
                        marginTop: '0.5rem',
                        paddingLeft: '3.5rem',
                        fontWeight: '500',
                      }}
                    >
                      📍 GPS: {site.gps_lat.toFixed(6)}, {site.gps_lng.toFixed(6)}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </main>

        {/* FAB Button - Hide for technicians */}
        {activeRole !== 'technician' && (
        <button
          onClick={() => router.push('/sites/new')}
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

        <BottomNav activeTab="more" />
      </div>
    </ProtectedRoute>
  );
}
