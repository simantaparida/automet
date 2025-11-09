import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';

interface Site {
  id: string;
  name: string;
  address: string;
  gps_lat: number | null;
  gps_lng: number | null;
  client: {
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
  const [sites, setSites] = useState<Site[]>([]);
  const [filteredSites, setFilteredSites] = useState<Site[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = sites;

    // Filter by client if selected
    if (selectedClientId) {
      filtered = filtered.filter((site) => site.client.id === selectedClientId);
    }

    // Filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(
        (site) =>
          site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          site.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          site.client.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSites(filtered);
  }, [searchTerm, selectedClientId, sites]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sitesResponse, clientsResponse] = await Promise.all([
        fetch('/api/sites'),
        fetch('/api/clients'),
      ]);

      if (sitesResponse.ok) {
        const sitesData = await sitesResponse.json();
        setSites(sitesData);
        setFilteredSites(sitesData);
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
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          paddingBottom: '80px',
        }}
      >
        {/* Sticky Header */}
        <header
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '1rem',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: '600',
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
            borderBottom: '1px solid #e5e7eb',
            position: 'sticky',
            top: '66px',
            zIndex: 9,
          }}
        >
          <input
            type="text"
            placeholder="Search sites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem',
              minHeight: '48px',
              boxSizing: 'border-box',
              marginBottom: '0.75rem',
            }}
          />
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem',
              minHeight: '48px',
              boxSizing: 'border-box',
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

        {/* Sites List */}
        <main style={{ padding: '1rem' }}>
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
                  width: '40px',
                  height: '40px',
                  border: '4px solid #e5e7eb',
                  borderTopColor: '#2563eb',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              ></div>
              <style jsx>{`
                @keyframes spin {
                  to {
                    transform: rotate(360deg);
                  }
                }
              `}</style>
            </div>
          ) : filteredSites.length === 0 ? (
            <div
              style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '1rem', color: '#6b7280', margin: 0 }}>
                {searchTerm || selectedClientId
                  ? 'No sites found matching your filters'
                  : 'No sites yet'}
              </p>
              {!searchTerm && !selectedClientId && (
                <button
                  onClick={() => router.push('/sites/new')}
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    minHeight: '48px',
                  }}
                >
                  Create First Site
                </button>
              )}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {filteredSites.map((site) => (
                <button
                  key={site.id}
                  onClick={() => router.push(`/sites/${site.id}`)}
                  style={{
                    backgroundColor: 'white',
                    padding: '1rem',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    minHeight: '80px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: '#1f2937',
                          margin: '0 0 0.25rem 0',
                        }}
                      >
                        {site.name}
                      </h3>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                        }}
                      >
                        {site.client.name}
                      </div>
                    </div>
                    <span style={{ fontSize: '1.25rem' }}>📍</span>
                  </div>

                  {site.address && (
                    <div
                      style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span>🗺️</span>
                      {site.address}
                    </div>
                  )}
                  {site.gps_lat && site.gps_lng && (
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#3b82f6',
                        marginTop: '0.25rem',
                      }}
                    >
                      GPS: {site.gps_lat.toFixed(6)}, {site.gps_lng.toFixed(6)}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </main>

        {/* FAB Button */}
        <button
          onClick={() => router.push('/sites/new')}
          style={{
            position: 'fixed',
            right: '1rem',
            bottom: '5rem',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            fontSize: '1.5rem',
            fontWeight: '300',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          +
        </button>

        <BottomNav activeTab="more" />
      </div>
    </ProtectedRoute>
  );
}
