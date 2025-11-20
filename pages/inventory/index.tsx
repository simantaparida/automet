import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import RoleBadge from '@/components/RoleBadge';
import { useRoleSwitch } from '@/contexts/RoleSwitchContext';
import StockBadge from '@/components/inventory/StockBadge';
import EmptyState from '@/components/EmptyState';
import {
  Plus,
  Package,
  Search,
  AlertTriangle,
  Hash,
  Tag,
  Filter,
} from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  sku: string | null;
  unit: string | null;
  quantity: number | null;
  reorder_level: number | null;
  is_serialized: boolean;
  org_id: string;
  created_at: string;
  updated_at: string | null;
}

export default function InventoryPage() {
  const router = useRouter();
  const { apiFetch, activeRole } = useRoleSwitch();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, [activeRole]); // Refetch when role changes

  useEffect(() => {
    let filtered = inventory;

    // Filter by low stock
    if (showLowStockOnly) {
      filtered = filtered.filter((item) => {
        const quantity = Number(item.quantity) || 0;
        const reorderLevel = Number(item.reorder_level) || 0;
        return quantity <= reorderLevel;
      });
    }

    // Filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.sku &&
            item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredInventory(filtered);
  }, [searchTerm, showLowStockOnly, inventory]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/inventory');
      if (response.ok) {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          setInventory(data);
          setFilteredInventory(data);
        } catch (e) {
          console.error('Failed to parse inventory JSON:', e);
          console.error('Raw response:', text);
        }
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const lowStockCount = inventory.filter((item) => {
    const quantity = Number(item.quantity) || 0;
    const reorderLevel = Number(item.reorder_level) || 0;
    return quantity <= reorderLevel;
  }).length;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 pb-20 md:pb-0 md:pt-16 md:ml-[260px] font-sans">
        {/* Desktop Sidebar */}
        <Sidebar activeTab="inventory" />

        {/* Desktop Top Header */}
        <div className="hidden md:block">
          <TopHeader />
        </div>

        {/* Desktop Role Badge */}
        <div className="hidden md:block">
          <RoleBadge />
        </div>

        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-20 bg-gradient-to-br from-primary-500 to-primary-600 text-white p-4 shadow-lg shadow-primary-500/20">
          <h1 className="text-xl font-bold m-0 mb-2">Inventory</h1>
          <div className="flex gap-4 text-sm opacity-95">
            <span>{filteredInventory.length} items</span>
            {lowStockCount > 0 && (
              <span className="text-amber-100 font-semibold flex items-center gap-1">
                <AlertTriangle size={14} /> {lowStockCount} low stock
              </span>
            )}
          </div>
        </header>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 border-b border-orange-100 sticky top-[66px] md:top-16 z-10 shadow-sm">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search inventory by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                className={`px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all border ${showLowStockOnly
                  ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-amber-500 hover:text-amber-500'
                  }`}
              >
                <Filter size={16} />
                {showLowStockOnly ? 'Low Stock Only' : 'Filter Stock'}
                {lowStockCount > 0 && !showLowStockOnly && (
                  <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
                    {lowStockCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => router.push('/inventory/new')}
                className="hidden md:flex px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary-500/20 hover:-translate-y-0.5 hover:shadow-primary-500/30 transition-all items-center gap-2 border-none cursor-pointer"
              >
                <Plus size={20} />
                Add Item
              </button>
            </div>
          </div>
        </div>

        {/* Inventory List */}
        <main className="p-4 md:p-8 max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="w-12 h-12 border-4 border-orange-200 border-t-primary-500 rounded-full animate-spin"></div>
            </div>
          ) : filteredInventory.length === 0 ? (
            <EmptyState
              icon={<Package size={48} className="text-primary-500" />}
              title={searchTerm || showLowStockOnly ? 'No items found' : 'No inventory items yet'}
              description={
                searchTerm || showLowStockOnly
                  ? 'Try adjusting your filters or search term'
                  : 'Start tracking your inventory by adding your first item'
              }
              action={
                !searchTerm && !showLowStockOnly ? (
                  <button
                    onClick={() => router.push('/inventory/new')}
                    className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary-500/20 hover:-translate-y-0.5 hover:shadow-primary-500/30 transition-all flex items-center gap-2 border-none cursor-pointer"
                  >
                    <Plus size={20} />
                    Add First Item
                  </button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredInventory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => router.push(`/inventory/${item.id}`)}
                  className="bg-white p-5 rounded-xl shadow-sm border border-orange-100 cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-orange-300 transition-all relative overflow-hidden group"
                >
                  {/* Icon Badge */}
                  <div className="absolute top-5 right-5 w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100 group-hover:bg-orange-100 transition-colors">
                    <Package size={24} className="text-primary-500" />
                  </div>

                  {/* Item Name & SKU */}
                  <div className="mb-4 pr-16">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      {item.sku && (
                        <div className="flex items-center gap-1">
                          <Hash size={14} />
                          <span>{item.sku}</span>
                        </div>
                      )}
                      {item.is_serialized && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-300">•</span>
                          <Tag size={14} />
                          <span>Serialized</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Status */}
                  <div className="flex justify-between items-end pt-4 border-t border-gray-50">
                    <div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {item.quantity || 0} <span className="text-sm font-medium text-gray-500">{item.unit || 'units'}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Reorder at: {item.reorder_level || 0} {item.unit || 'units'}
                      </div>
                    </div>
                    <StockBadge
                      quantity={Number(item.quantity) || 0}
                      reorderLevel={Number(item.reorder_level) || 0}
                      unit={item.unit}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Mobile FAB Button */}
        <button
          onClick={() => router.push('/inventory/new')}
          className="md:hidden fixed right-4 bottom-20 w-14 h-14 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white border-none shadow-lg shadow-primary-500/30 flex items-center justify-center z-30 hover:scale-110 active:scale-95 transition-all"
        >
          <Plus size={28} />
        </button>

        <BottomNav activeTab="more" />
      </div>
    </ProtectedRoute>
  );
}
