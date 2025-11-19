import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import RoleBadge from '@/components/RoleBadge';
import EmptyState from '@/components/EmptyState';
import { useRoleSwitch } from '@/contexts/RoleSwitchContext';
import { Plus, Package, Building2, MapPin, ChevronRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

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
  const [clients, setClients] = useState<Client[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeRole]);

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
        let assetsWithSiteData = assetsData;

        const assetsNeedingSiteData = assetsData.filter(
          (asset: Asset) => !asset.site?.name || !asset.site?.client?.name
        );

        if (assetsNeedingSiteData.length > 0) {
          try {
            const sitesResponse = await apiFetch('/api/sites');
            if (sitesResponse.ok) {
              const sitesData = await sitesResponse.json();
              const sitesMap = new Map(sitesData.map((site: any) => [site.id, site]));

              assetsWithSiteData = assetsData.map((asset: Asset) => {
                if (asset.site?.name && asset.site?.client?.name) return asset;

                const siteId = asset.site_id || asset.site?.id;
                if (siteId && sitesMap.has(siteId)) {
                  const site = sitesMap.get(siteId) as any;
                  return {
                    ...asset,
                    site: {
                      id: site.id,
                      name: site.name,
                      client: site.client
                        ? { id: site.client.id, name: site.client.name }
                        : undefined,
                    },
                  };
                }
                return asset;
              });
            }
          } catch (error) {
            console.error('Error fetching sites for assets:', error);
          }
        }

        setAssets(assetsWithSiteData);
      } else {
        const errorData = await assetsResponse.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to fetch assets:', assetsResponse.status, errorData);
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

  const filteredAssets = assets.filter((asset) => {
    if (selectedClientId && asset.site?.client?.id !== selectedClientId) return false;
    if (selectedSiteId && asset.site?.id !== selectedSiteId && asset.site_id !== selectedSiteId) return false;
    return true;
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white font-sans">
        <Sidebar activeTab="assets" />

        <div className="desktop-header fixed top-0 left-0 right-0 z-30 backdrop-blur-md bg-white/80 border-b border-primary/10">
          <TopHeader />
        </div>

        <div className="desktop-header">
          <RoleBadge />
        </div>

        <main className="ml-0 md:ml-[260px] pt-16 md:pt-20 pb-20 md:pb-0 px-4 md:px-8 max-w-[1400px] mx-auto">
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="w-12 h-12 border-4 border-primary-100 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="mb-6 flex justify-between items-start flex-wrap gap-3">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">Assets</h1>
                  <p className="text-[15px] text-gray-500">
                    {filteredAssets.length} {filteredAssets.length === 1 ? 'asset' : 'assets'} in your organization
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {clients.length > 0 && (
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-[13px] outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white"
                    >
                      <option value="">All Clients</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {selectedClientId && sites.length > 0 && (
                    <select
                      value={selectedSiteId}
                      onChange={(e) => setSelectedSiteId(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-[13px] outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white"
                    >
                      <option value="">All Sites</option>
                      {sites.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {activeRole !== 'technician' && (
                    <button
                      onClick={() => router.push('/assets/new')}
                      className="bg-gradient-to-br from-primary to-primary-600 text-white border-none rounded-md px-4 py-2 text-[13px] font-semibold cursor-pointer flex items-center gap-2 shadow-sm shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/35"
                    >
                      <Plus size={18} /> Add Asset
                    </button>
                  )}
                </div>
              </div>

              {filteredAssets.length === 0 ? (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <EmptyState
                    icon={<Package size={48} className="text-gray-300" />}
                    title={selectedClientId || selectedSiteId ? "No assets found" : "No assets yet"}
                    description={selectedClientId || selectedSiteId ? "Try selecting different filters" : "Get started by adding your first asset"}
                  />
                  {!selectedClientId && !selectedSiteId && activeRole !== 'technician' && (
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={() => router.push('/assets/new')}
                        className="bg-gradient-to-br from-primary to-primary-600 text-white border-none rounded-md px-6 py-3 text-[14px] font-semibold cursor-pointer flex items-center gap-2 shadow-sm shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/35"
                      >
                        <Plus size={18} /> Create First Asset
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredAssets.map((asset) => {
                    const warrantyExpiry = getWarrantyExpiry(asset);
                    const isExpired = isWarrantyExpired(warrantyExpiry);

                    return (
                      <button
                        key={asset.id}
                        onClick={() => router.push(`/assets/${asset.id}`)}
                        className="bg-white p-4 rounded-lg border border-gray-200 cursor-pointer text-left transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md hover:shadow-primary/15"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center flex-shrink-0 border border-primary/20">
                            <Package size={24} className="text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="text-[15px] font-bold text-gray-900 truncate capitalize">
                                {asset.asset_type.replace(/_/g, ' ')}
                              </h3>
                              <ChevronRight size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                            </div>
                            {asset.model && (
                              <div className="text-[13px] text-gray-600 truncate">
                                {asset.model}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1.5 pl-[60px]">
                          {asset.serial_number && (
                            <div className="text-[13px] text-gray-500">
                              <span className="font-medium">S/N:</span> {asset.serial_number}
                            </div>
                          )}
                          {asset.site && (
                            <>
                              <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
                                <MapPin size={14} className="flex-shrink-0" />
                                <span className="truncate">{asset.site.name}</span>
                              </div>
                              {asset.site.client && (
                                <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
                                  <Building2 size={14} className="flex-shrink-0" />
                                  <span className="truncate">{asset.site.client.name}</span>
                                </div>
                              )}
                            </>
                          )}
                          {warrantyExpiry && (
                            <div className={`flex items-center gap-1.5 text-[11px] font-medium ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                              {isExpired ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                              <span>Warranty: {new Date(warrantyExpiry).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>

        <BottomNav activeTab="more" />
      </div>
    </ProtectedRoute>
  );
}
