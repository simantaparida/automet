import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import RoleBadge from '@/components/RoleBadge';
import EmptyState from '@/components/EmptyState';
import { useRoleSwitch } from '@/contexts/RoleSwitchContext';
import { Plus, Building2, Phone, Mail, MapPin, ChevronRight } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, [activeRole]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/clients');
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to fetch clients:', response.status, errorData);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white font-sans">
        {/* Desktop Sidebar */}
        <Sidebar activeTab="clients" />

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
              <div className="mb-6 flex justify-between items-center flex-wrap gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">Clients</h1>
                  <p className="text-[15px] text-gray-500">
                    {clients.length} {clients.length === 1 ? 'client' : 'clients'} in your organization
                  </p>
                </div>
                {activeRole !== 'technician' && (
                  <button
                    onClick={() => router.push('/clients/new')}
                    className="bg-gradient-to-br from-primary to-primary-600 text-white border-none rounded-md px-4 py-2 text-[13px] font-semibold cursor-pointer flex items-center gap-2 shadow-sm shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/35"
                  >
                    <Plus size={18} /> Add Client
                  </button>
                )}
              </div>

              {/* Clients Grid */}
              {clients.length === 0 ? (
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <EmptyState
                    icon={<Building2 size={48} className="text-gray-300" />}
                    title="No clients yet"
                    description="Get started by adding your first client"
                  />
                  {activeRole !== 'technician' && (
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={() => router.push('/clients/new')}
                        className="bg-gradient-to-br from-primary to-primary-600 text-white border-none rounded-md px-6 py-3 text-[14px] font-semibold cursor-pointer flex items-center gap-2 shadow-sm shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/35"
                      >
                        <Plus size={18} /> Create First Client
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {clients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => router.push(`/clients/${client.id}`)}
                      className="bg-white p-4 rounded-lg border border-gray-200 cursor-pointer text-left transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md hover:shadow-primary/15"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center flex-shrink-0 border border-primary/20">
                          <Building2 size={24} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="text-[15px] font-bold text-gray-900 truncate">
                              {client.name}
                            </h3>
                            <ChevronRight size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 pl-[60px]">
                        {client.contact_phone && (
                          <div className="flex items-center gap-2 text-[13px] text-gray-500">
                            <Phone size={14} className="flex-shrink-0" />
                            <span className="truncate">{client.contact_phone}</span>
                          </div>
                        )}
                        {client.contact_email && (
                          <div className="flex items-center gap-2 text-[13px] text-gray-500">
                            <Mail size={14} className="flex-shrink-0" />
                            <span className="truncate">{client.contact_email}</span>
                          </div>
                        )}
                        {client.address && (
                          <div className="flex items-start gap-2 text-[13px] text-gray-500">
                            <MapPin size={14} className="flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2 leading-snug">{client.address}</span>
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
        <BottomNav activeTab="clients" />
      </div>
    </ProtectedRoute>
  );
}
