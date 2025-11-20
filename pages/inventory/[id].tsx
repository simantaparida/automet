import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import Breadcrumb from '@/components/Breadcrumb';
import RoleBadge from '@/components/RoleBadge';
import { useRoleSwitch } from '@/contexts/RoleSwitchContext';
import StockBadge from '@/components/inventory/StockBadge';
import StockAdjustmentModal from '@/components/inventory/StockAdjustmentModal';
import toast from 'react-hot-toast';
import {
  Package,
  Edit,
  Trash2,
  BarChart3,
  Hash,
  Layers,
  Calendar,
  ShieldCheck,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  sku: string | null;
  unit: string | null;
  quantity: number | null;
  reorder_level: number | null;
  is_serialized: boolean;
  created_at: string;
  updated_at: string | null;
}

export default function InventoryDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { apiFetch, activeRole } = useRoleSwitch();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchItem();
    }
  }, [id]);

  const fetchItem = async () => {
    setLoading(true);
    try {
      const response = await apiFetch(`/api/inventory/${id}`);
      if (!response.ok) {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || 'Failed to fetch inventory item');
        } catch (e) {
          console.error('Failed to parse error response:', e);
          console.error('Raw error response:', text);
          throw new Error('Failed to fetch inventory item');
        }
      }
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        if (!data.item) {
          throw new Error('Inventory item not found');
        }
        setItem(data.item);
      } catch (e) {
        console.error('Failed to parse inventory item JSON:', e);
        console.error('Raw response:', text);
        throw new Error('Invalid server response');
      }
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load inventory item');
      router.push('/inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleStockAdjustment = async (amount: number, type: 'add' | 'subtract') => {
    if (!item) return;

    try {
      const currentQuantity = Number(item.quantity) || 0;
      const newQuantity =
        type === 'add'
          ? currentQuantity + amount
          : Math.max(0, currentQuantity - amount);

      const response = await apiFetch(`/api/inventory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          quantity: newQuantity,
        }),
      });

      if (response.ok) {
        toast.success('Stock updated successfully');
        await fetchItem();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || 'Failed to adjust stock');
      }
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast.error('Error adjusting stock');
    }
  };

  const deleteItem = async () => {
    if (!confirm(`Are you sure you want to delete ${item?.name}?`)) return;

    try {
      const response = await apiFetch(`/api/inventory/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Item deleted successfully');
        router.push('/inventory');
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Error deleting item');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!item) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4 bg-gradient-to-br from-orange-50 via-white to-orange-50">
          <p className="text-lg text-gray-500">Item not found</p>
          <button
            onClick={() => router.push('/inventory')}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary-500/20 hover:-translate-y-0.5 hover:shadow-primary-500/30 transition-all border-none cursor-pointer"
          >
            Back to Inventory
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  const quantity = Number(item.quantity) || 0;
  const reorderLevel = Number(item.reorder_level) || 0;

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

        {/* Desktop Breadcrumb */}
        <div className="hidden md:block sticky top-16 z-10 bg-white/80 backdrop-blur-md border-b border-orange-100">
          <Breadcrumb
            items={[
              { label: 'Inventory', href: '/inventory' },
              { label: item.name },
            ]}
          />
        </div>

        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-20 bg-gradient-to-br from-primary-500 to-primary-600 text-white p-4 shadow-lg shadow-primary-500/20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/inventory')}
              className="bg-transparent border-none text-white text-2xl cursor-pointer p-1 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
            >
              ←
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold m-0 truncate">
                {item.name}
              </h1>
              {item.sku && (
                <p className="text-xs m-0 mt-1 opacity-90 truncate">
                  SKU: {item.sku}
                </p>
              )}
            </div>
            <Package size={24} className="text-white/90" />
          </div>
        </header>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-white border-b border-orange-100 sticky md:static top-[76px] z-10 shadow-sm">
          {activeRole !== 'technician' && (
            <>
              <button
                onClick={() => router.push(`/inventory/${id}/edit`)}
                className="p-3 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-sm font-semibold cursor-pointer flex flex-col items-center justify-center gap-2 min-h-[72px] hover:bg-gray-100 hover:border-gray-300 transition-all"
              >
                <Edit size={20} className="text-gray-600" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setShowAdjustModal(true)}
                className="p-3 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl text-sm font-semibold cursor-pointer flex flex-col items-center justify-center gap-2 min-h-[72px] hover:bg-blue-100 hover:border-blue-300 transition-all"
              >
                <BarChart3 size={20} className="text-blue-500" />
                <span>Adjust Stock</span>
              </button>
              <button
                onClick={deleteItem}
                className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold cursor-pointer flex flex-col items-center justify-center gap-2 min-h-[72px] hover:bg-red-100 hover:border-red-300 transition-all"
              >
                <Trash2 size={20} className="text-red-500" />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>

        {/* Main Content */}
        <main className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
          {/* Item Header Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100">
                <Package size={28} className="text-primary-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 m-0">
                  {item.name}
                </h2>
                {item.sku && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Hash size={14} />
                    <span className="font-mono">{item.sku}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stock Status Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
              Current Stock
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-1 leading-none">
                    {quantity}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {item.unit || 'units'}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StockBadge
                    quantity={quantity}
                    reorderLevel={reorderLevel}
                    unit={item.unit}
                  />
                  {reorderLevel > 0 && (
                    <div className="text-xs text-gray-500 text-right">
                      Reorder at: {reorderLevel} {item.unit || 'units'}
                    </div>
                  )}
                </div>
              </div>

              {quantity <= reorderLevel && quantity > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-800">
                  <AlertTriangle size={20} className="text-amber-500 flex-shrink-0" />
                  <span className="text-sm font-medium">
                    Stock is below reorder level. Consider restocking.
                  </span>
                </div>
              )}

              {quantity === 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800">
                  <XCircle size={20} className="text-red-500 flex-shrink-0" />
                  <span className="text-sm font-medium">
                    This item is out of stock. Restock immediately.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Item Details */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
              Item Details
            </h3>
            <div className="space-y-4">
              {item.sku && (
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Hash size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-0.5">SKU</div>
                    <div className="text-base font-semibold text-gray-900 font-mono">
                      {item.sku}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Layers size={20} className="text-emerald-600" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-0.5">Reorder Level</div>
                  <div className="text-base font-semibold text-gray-900">
                    {reorderLevel} {item.unit || 'units'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={20} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-0.5">Serialized</div>
                  <div className="text-base font-semibold text-gray-900">
                    {item.is_serialized ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar size={20} className="text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-0.5">Created On</div>
                  <div className="text-base font-semibold text-gray-900">
                    {formatDate(item.created_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <BottomNav activeTab="more" />

        {/* Stock Adjustment Modal */}
        <StockAdjustmentModal
          isOpen={showAdjustModal}
          onClose={() => setShowAdjustModal(false)}
          onConfirm={handleStockAdjustment}
          itemName={item.name}
          currentQuantity={quantity}
          unit={item.unit}
        />
      </div>
    </ProtectedRoute>
  );
}
