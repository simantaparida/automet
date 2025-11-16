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
import {
  Plus,
  Package,
  Building2,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface Asset {
  id: string;
  asset_type: string;
  model: string | null;
  serial_number: string | null;
  install_date: string | null;
  metadata: Record<string, any> | null;
  site_id?: string;
  site?: {
    id: string;
    name: string;
    client?: {
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
  const { apiFetch, activeRole } = useRoleSwitch();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [sortValue, setSortValue] = useState('asset_type:asc');

  useEffect(() => {
    fetchData();
  }, [activeRole]); // Refetch when role changes

  useEffect(() => {
    let filtered = assets;

    // Filter by client if selected
    if (selectedClientId) {
      filtered = filtered.filter(
        (asset) => asset.site?.client?.id === selectedClientId
      );
    }

    // Filter by site if selected
    if (selectedSiteId) {
      filtered = filtered.filter((asset) => asset.site?.id === selectedSiteId || asset.site_id === selectedSiteId);
    }

    // Filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(
        (asset) =>
          asset.asset_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (asset.serial_number &&
            asset.serial_number
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          asset.site?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.site?.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAssets(filtered);
  }, [searchTerm, selectedClientId, selectedSiteId, assets]);

  // Sort assets based on sortValue
  const sortedAssets = useMemo(() => {
    const [field, order] = sortValue.split(':');
    return [...filteredAssets].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      // Handle nested fields for sorting
      if (field === 'site') {
        aVal = a.site?.name || '';
        bVal = b.site?.name || '';
      } else if (field === 'client') {
        aVal = a.site?.client?.name || '';
        bVal = b.site?.client?.name || '';
      } else {
        aVal = a[field as keyof Asset];
        bVal = b[field as keyof Asset];
      }

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
  }, [filteredAssets, sortValue]);

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
        apiFetch('/api/assets'),
        apiFetch('/api/clients'),
      ]);

      if (assetsResponse.ok) {
        const assetsData = await assetsResponse.json();
        console.log('Assets data received:', assetsData);
        
        // If assets don't have nested site/client data, fetch sites separately and merge
        let assetsWithSiteData = assetsData;
        
        // Check if any assets are missing site data
        const assetsNeedingSiteData = assetsData.filter(
          (asset: Asset) => !asset.site?.name || !asset.site?.client?.name
        );
        
        if (assetsNeedingSiteData.length > 0) {
          // Fetch all sites
          try {
            const sitesResponse = await apiFetch('/api/sites');
            if (sitesResponse.ok) {
              const sitesData = await sitesResponse.json();
              
              // Create a map of site_id -> site data
              const sitesMap = new Map(
                sitesData.map((site: any) => [site.id, site])
              );
              
              // Merge site data into assets
              assetsWithSiteData = assetsData.map((asset: Asset) => {
                // If asset already has complete site data, return as is
                if (asset.site?.name && asset.site?.client?.name) {
                  return asset;
                }
                
                // Otherwise, look up site data from the map
                const siteId = asset.site_id || asset.site?.id;
                if (siteId && sitesMap.has(siteId)) {
                  const site = sitesMap.get(siteId);
                  return {
                    ...asset,
                    site: {
                      id: site.id,
                      name: site.name,
                      client: site.client ? {
                        id: site.client.id,
                        name: site.client.name,
                      } : undefined,
                    },
                  };
                }
                
                // Return asset as is if we can't find site data
                return asset;
              });
            }
          } catch (error) {
            console.error('Error fetching sites for assets:', error);
          }
        }
        
        setAssets(assetsWithSiteData);
        setFilteredAssets(assetsWithSiteData);
      } else {
        const errorData = await assetsResponse.json().catch(() => ({}));
        console.error('Assets API error:', errorData);
        alert(`Failed to load assets: ${errorData.error || 'Unknown error'}`);
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
      const response = await apiFetch(`/api/sites?client_id=${clientId}`);
      if (response.ok) {
        const data = await response.json();
        setSites(data);
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  // Helper function to extract warranty_expiry from metadata if it exists
  const getWarrantyExpiry = (asset: Asset): string | null => {
    if (asset.metadata && typeof asset.metadata === 'object' && 'warranty_expiry' in asset.metadata) {
      return asset.metadata.warranty_expiry as string | null;
    }
    return null;
  };

  const isWarrantyExpired = (warrantyDate: string | null) => {
    if (!warrantyDate) return false;
    return new Date(warrantyDate) < new Date();
  };

  return (
    <ProtectedRoute>
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .assets-container {
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
          .assets-container {
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
        className="assets-container"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Desktop Sidebar */}
        <Sidebar activeTab="assets" />

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
            Assets
          </h1>
          <p style={{ fontSize: '0.875rem', margin: 0, opacity: 0.9 }}>
            {filteredAssets.length}{' '}
            {filteredAssets.length === 1 ? 'asset' : 'assets'}
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
                placeholder="Search assets by type, model, serial number, site..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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

            {/* Filters */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
              }}
            >
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
                  value={selectedClientId}
                  onChange={(e) => {
                    setSelectedClientId(e.target.value);
                    setSelectedSiteId('');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
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

              {/* Site Filter */}
              <div style={{ position: 'relative' }}>
                <MapPin
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
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                  disabled={!selectedClientId}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    minHeight: '48px',
                    boxSizing: 'border-box',
                    backgroundColor: !selectedClientId ? '#f9fafb' : 'white',
                    cursor: selectedClientId ? 'pointer' : 'not-allowed',
                    appearance: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    outline: 'none',
                    opacity: selectedClientId ? 1 : 0.6,
                  }}
                  onFocus={(e) => {
                    if (selectedClientId) {
                      e.target.style.borderColor = '#EF7722';
                      e.target.style.boxShadow = '0 0 0 3px rgba(239,119,34,0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">
                    {selectedClientId ? 'All Sites' : 'Select client first'}
                  </option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Assets List */}
        <main className="main-content">
          {!loading && filteredAssets.length > 0 && (
            <SortButtons
              options={[
                { field: 'asset_type', label: 'Type' },
                { field: 'model', label: 'Model' },
                { field: 'site', label: 'Site' },
                { field: 'client', label: 'Client' },
              ]}
              value={sortValue}
              onChange={setSortValue}
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
          ) : filteredAssets.length === 0 ? (
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
                  <Package size={40} color="#EF7722" />
                </div>
              }
              title={
                searchTerm || selectedClientId || selectedSiteId
                  ? 'No assets found'
                  : 'No assets yet'
              }
              description={
                searchTerm || selectedClientId || selectedSiteId
                  ? 'No assets match your search or filter criteria. Try adjusting your filters or browse all assets.'
                  : 'Get started by adding your first asset to track equipment and maintenance.'
              }
              actionLabel={
                searchTerm || selectedClientId || selectedSiteId ? undefined : 'Add First Asset'
              }
              actionHref={
                searchTerm || selectedClientId || selectedSiteId ? undefined : '/assets/new'
              }
              showAction={!searchTerm && !selectedClientId && !selectedSiteId}
            />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '1rem',
              }}
            >
              {sortedAssets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => router.push(`/assets/${asset.id}`)}
                  style={{
                    backgroundColor: 'white',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(239,119,34,0.1)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    minHeight: '140px',
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
                        <Package size={24} color="#EF7722" />
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
                          {asset.asset_type} - {asset.model}
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
                            {asset.site?.client?.name || 'Unknown Client'}
                          </span>
                          <span style={{ margin: '0 0.25rem' }}>→</span>
                          <MapPin size={14} color="#6b7280" />
                          <span
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {asset.site?.name || 'Unknown Site'}
                          </span>
                        </div>
                      </div>
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
                    {asset.serial_number && (
                      <div
                        style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <span style={{ fontWeight: '600' }}>S/N:</span>
                        <span>{asset.serial_number}</span>
                      </div>
                    )}
                    {(() => {
                      const warrantyExpiry = getWarrantyExpiry(asset);
                      return warrantyExpiry && (
                        <div
                          style={{
                            fontSize: '0.8125rem',
                            color: isWarrantyExpired(warrantyExpiry)
                              ? '#ef4444'
                              : '#10b981',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: '500',
                          }}
                        >
                          {isWarrantyExpired(warrantyExpiry) ? (
                            <>
                              <AlertTriangle size={16} color="#ef4444" />
                              <span>
                                Warranty expired:{' '}
                                {new Date(warrantyExpiry).toLocaleDateString(
                                  'en-IN',
                                  {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  }
                                )}
                              </span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={16} color="#10b981" />
                              <span>
                                Warranty until:{' '}
                                {new Date(warrantyExpiry).toLocaleDateString(
                                  'en-IN',
                                  {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  }
                                )}
                              </span>
                            </>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </main>

        {/* FAB Button - Hide for technicians */}
        {activeRole !== 'technician' && (
          <button
            onClick={() => router.push('/assets/new')}
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
