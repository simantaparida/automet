import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import RoleBadge from '@/components/RoleBadge';
import EmptyState from '@/components/EmptyState';
import { useRoleSwitch } from '@/contexts/RoleSwitchContext';
import { Plus, MapPin, Building2, ChevronRight } from 'lucide-react';

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
  const { apiFetch, activeRole } = useRoleSwitch();
  const [sites, setSites] = useState<Site[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClientId, setSelectedClientId] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeRole]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sitesResponse, clientsResponse] = await Promise.all([
        apiFetch('/api/sites'),
        apiFetch('/api/clients'),
      ]);

      if (sitesResponse.ok) {
        const sitesData = await sitesResponse.json();

        let sitesWithClientData = sitesData;
        const sitesNeedingClientData = sitesData.filter(
          (site: Site) => !site.client?.name
        );

        if (sitesNeedingClientData.length > 0) {
          try {
            const clientsResponse = await apiFetch('/api/clients');
            if (clientsResponse.ok) {
              const clientsData = await clientsResponse.json();
              const clientsMap = new Map(
                clientsData.map((client: Client) => [client.id, client])
              );

              sitesWithClientData = sitesData.map((site: Site) => {
                if (site.client?.name) return site;

                const clientId = (site as any).client_id;
                if (clientId && clientsMap.has(clientId)) {
                  const client = clientsMap.get(clientId) as Client;
                  return {
                    ...site,
                    client_id: clientId,
                    client: {
                      id: client.id,
                      name: client.name,
                    },
                  };
                }
                return site;
              });
            }
          } catch (error) {
            console.error('Error fetching clients for sites:', error);
          }
        }

        setSites(sitesWithClientData);
      } else {
        const errorData = await sitesResponse.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to fetch sites:', sitesResponse.status, errorData);
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

  const filteredSites = selectedClientId
    ? sites.filter((site) => site.client?.id === selectedClientId)
    : sites;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white font-sans">
        {/* Desktop Sidebar */}
        <Sidebar activeTab="sites" />

        {/* Desktop Top Header with Glassmorphism */}
        <div className="desktop-header fixed top-0 left-0 right-0 z-30 backdrop-blur-md bg-white/80 border-b border-primary/10">
          <TopHeader />
        </div>

        {/* Desktop Role Badge */}
        <div className="desktop-header">
          <RoleBadge />
        </div>

        {/* Main Content */}
        <main className="ml-0 md:ml-[260px] pt-16 md:pt-20 pb-20 md:pb-0 px-4 md:px-8 max-w-[1400px] mx-auto">
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="w-12 h-12 border-4 border-primary-100 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Page Header */}
              <div className="mb-6 flex justify-between items-start flex-wrap gap-3">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">Sites</h1>
                  <p className="text-[15px] text-gray-500">
                    {filteredSites.length} {filteredSites.length === 1 ? 'site' : 'sites'} in your organization
                  </p>
                </div>

                {/* Filter and Add Button */}
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Client Filter */}
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

                  {activeRole !== 'technician' && (
                    <button
                      onClick={() => router.push('/sites/new')}
                      className="bg-gradient-to-br from-primary to-primary-600 text-white border-none rounded-md px-4 py-2 text-[13px] font-semibold cursor-pointer flex items-center gap-2 shadow-sm shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/35"
                    >
                      <Plus size={18} /> Add Site
                    </button>
                  )}
                </div>
              </div>

              {/* Sites Grid */}
              {filteredSites.length === 0 ? (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <EmptyState
                    icon={<MapPin size={48} className="text-gray-300" />}
                    title={selectedClientId ? "No sites found" : "No sites yet"}
                    description={selectedClientId ? "Try selecting a different client" : "Get started by adding your first site"}
                  />
                  {!selectedClientId && activeRole !== 'technician' && (
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={() => router.push('/sites/new')}
                        className="bg-gradient-to-br from-primary to-primary-600 text-white border-none rounded-md px-6 py-3 text-[14px] font-semibold cursor-pointer flex items-center gap-2 shadow-sm shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/35"
                      >
                        <Plus size={18} /> Create First Site
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredSites.map((site) => (
                    <button
                      key={site.id}
                      onClick={() => router.push(`/sites/${site.id}`)}
                      className="bg-white p-4 rounded-lg border border-gray-200 cursor-pointer text-left transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md hover:shadow-primary/15"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center flex-shrink-0 border border-primary/20">
                          <MapPin size={24} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="text-[15px] font-bold text-gray-900 truncate">
                              {site.name}
                            </h3>
                            <ChevronRight size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                          </div>
                          <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
                            <Building2 size={14} className="flex-shrink-0" />
                            <span className="truncate">{site.client?.name || 'Unknown Client'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 pl-[60px]">
                        {site.address && (
                          <div className="flex items-start gap-2 text-[13px] text-gray-500">
                            <MapPin size={14} className="flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2 leading-snug">{site.address}</span>
                          </div>
                        )}
                        {site.gps_lat && site.gps_lng && (
                          <div className="text-[11px] text-primary font-medium">
                            📍 {site.gps_lat.toFixed(6)}, {site.gps_lng.toFixed(6)}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation - Only visible on mobile */}
        <BottomNav activeTab="more" />
      </div>
    </ProtectedRoute>
  );
}
