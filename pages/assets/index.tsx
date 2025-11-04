import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';

interface Asset {
  id: string;
  asset_type: string;
  model: string;
  serial_number: string | null;
  purchase_date: string | null;
  warranty_expiry: string | null;
  site: {
    id: string;
    name: string;
    client: {
      id: string;
      name: string;
    };
  };
}

interface Client {
  id: string;
  name: string;
}

interface Site {
  id: string;
  name: string;
  client_id: string;
}

export default function AssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = assets;

    // Filter by client if selected
    if (selectedClientId) {
      filtered = filtered.filter(asset => asset.site.client.id === selectedClientId);
    }

    // Filter by site if selected
    if (selectedSiteId) {
      filtered = filtered.filter(asset => asset.site.id === selectedSiteId);
    }

    // Filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(asset =>
        asset.asset_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (asset.serial_number && asset.serial_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        asset.site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.site.client.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAssets(filtered);
  }, [searchTerm, selectedClientId, selectedSiteId, assets]);

  // Update sites list when client changes
  useEffect(() => {
    if (selectedClientId) {
      fetchSites(selectedClientId);
    } else {
      setSites([]);
      setSelectedSiteId('');
    }
  }, [selectedClientId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assetsResponse, clientsResponse] = await Promise.all([
        fetch('/api/assets'),
        fetch('/api/clients'),
      ]);

      if (assetsResponse.ok) {
        const assetsData = await assetsResponse.json();
        setAssets(assetsData);
        setFilteredAssets(assetsData);
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

  const fetchSites = async (clientId: string) => {
    try {
      const response = await fetch(`/api/sites?client_id=${clientId}`);
      if (response.ok) {
        const data = await response.json();
        setSites(data);
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  const isWarrantyExpired = (warrantyDate: string | null) => {
    if (!warrantyDate) return false;
    return new Date(warrantyDate) < new Date();
  };

  return (
    <ProtectedRoute>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        paddingBottom: '80px',
      }}>
        {/* Sticky Header */}
        <header style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '1rem',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
            Assets
          </h1>
          <p style={{ fontSize: '0.875rem', margin: 0, opacity: 0.9 }}>
            {filteredAssets.length} {filteredAssets.length === 1 ? 'asset' : 'assets'}
          </p>
        </header>

        {/* Search & Filter Bar */}
        <div style={{
          backgroundColor: 'white',
          padding: '1rem',
          borderBottom: '1px solid #e5e7eb',
          position: 'sticky',
          top: '66px',
          zIndex: 9,
        }}>
          <input
            type="text"
            placeholder="Search assets..."
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <select
              value={selectedClientId}
              onChange={(e) => {
                setSelectedClientId(e.target.value);
                setSelectedSiteId('');
              }}
              style={{
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                minHeight: '48px',
                boxSizing: 'border-box',
              }}
            >
              <option value="">All Clients</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              disabled={!selectedClientId}
              style={{
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                minHeight: '48px',
                boxSizing: 'border-box',
                backgroundColor: !selectedClientId ? '#f9fafb' : 'white',
              }}
            >
              <option value="">All Sites</option>
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Assets List */}
        <main style={{ padding: '1rem' }}>
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '200px',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #e5e7eb',
                borderTopColor: '#2563eb',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <style jsx>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '1rem', color: '#6b7280', margin: 0 }}>
                {searchTerm || selectedClientId || selectedSiteId ? 'No assets found matching your filters' : 'No assets yet'}
              </p>
              {!searchTerm && !selectedClientId && !selectedSiteId && (
                <button
                  onClick={() => router.push('/assets/new')}
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
                  Create First Asset
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredAssets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => router.push(`/assets/${asset.id}`)}
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
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '0.5rem',
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: '0 0 0.25rem 0',
                      }}>
                        {asset.asset_type} - {asset.model}
                      </h3>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                      }}>
                        {asset.site.client.name} → {asset.site.name}
                      </div>
                    </div>
                    <span style={{ fontSize: '1.25rem' }}>📦</span>
                  </div>

                  {asset.serial_number && (
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      marginBottom: '0.25rem',
                    }}>
                      S/N: {asset.serial_number}
                    </div>
                  )}
                  {asset.warranty_expiry && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: isWarrantyExpired(asset.warranty_expiry) ? '#ef4444' : '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}>
                      {isWarrantyExpired(asset.warranty_expiry) ? '⚠️' : '✓'} Warranty: {new Date(asset.warranty_expiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </main>

        {/* FAB Button */}
        <button
          onClick={() => router.push('/assets/new')}
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
