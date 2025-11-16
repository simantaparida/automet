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
import {
  Plus,
  Package,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Hash,
  Tag,
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

  // URL-synced filters
  const [filters, setFilters] = useURLFilters({
    search: '',
    lowStock: '',
    sort: 'name:asc',
  });

  useEffect(() => {
    fetchInventory();
  }, [activeRole]); // Refetch when role changes

  useEffect(() => {
    let filtered = inventory;

    // Filter by low stock
    if (filters.lowStock === 'true') {
      filtered = filtered.filter((item) => {
        const quantity = Number(item.quantity) || 0;
        const reorderLevel = Number(item.reorder_level) || 0;
        return quantity <= reorderLevel;
      });
    }

    // Filter by search term
    if (filters.search.trim() !== '') {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          (item.sku &&
            item.sku.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    setFilteredInventory(filtered);
  }, [filters.search, filters.lowStock, inventory]);

  // Sort inventory based on filters.sort
  const sortedInventory = useMemo(() => {
    const [field, order] = filters.sort.split(':');
    return [...filteredInventory].sort((a, b) => {
      let aVal: any = a[field as keyof InventoryItem];
      let bVal: any = b[field as keyof InventoryItem];

      // Handle null values
      if (aVal === null) aVal = field === 'quantity' || field === 'reorder_level' ? 0 : '';
      if (bVal === null) bVal = field === 'quantity' || field === 'reorder_level' ? 0 : '';

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
  }, [filteredInventory, filters.sort]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/inventory');
      if (response.ok) {
        const data = await response.json();
        setInventory(data);
        setFilteredInventory(data);
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

  const getStockStatus = (item: InventoryItem) => {
    const quantity = Number(item.quantity) || 0;
    const reorderLevel = Number(item.reorder_level) || 0;
    
    if (quantity === 0) {
      return {
        color: '#ef4444',
        label: 'Out of Stock',
        icon: XCircle,
        bgColor: '#fee2e2',
      };
    } else if (quantity <= reorderLevel) {
      return {
        color: '#f59e0b',
        label: 'Low Stock',
        icon: AlertTriangle,
        bgColor: '#fef3c7',
      };
    } else {
      return {
        color: '#10b981',
        label: 'In Stock',
        icon: CheckCircle2,
        bgColor: '#d1fae5',
      };
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
        .inventory-container {
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
        @media (min-width: 768px) {
          .inventory-container {
            margin-left: 260px;
            padding-bottom: 0;
            padding-top: 64px;
          }
          .main-content {
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
          }
          .mobile-header {
            display: none;
          }
          .desktop-header {
            display: block;
          }
        }
      `}</style>

      <div
        className="inventory-container"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Desktop Sidebar */}
        <Sidebar activeTab="inventory" />

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
            Inventory
          </h1>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              fontSize: '0.875rem',
              opacity: 0.95,
            }}
          >
            <span>{filteredInventory.length} items</span>
            {lowStockCount > 0 && (
              <span style={{ color: '#fef3c7', fontWeight: '600' }}>
                <AlertTriangle size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {lowStockCount} low stock
              </span>
            )}
          </div>
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
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
              <Search
                size={20}
                color="#9ca3af"
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Search inventory by name or SKU..."
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

            {/* Filters */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                alignItems: 'center',
              }}
            >
              <button
                onClick={() => setFilters({ lowStock: filters.lowStock === 'true' ? '' : 'true' })}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: filters.lowStock === 'true' ? '#f59e0b' : 'white',
                  color: filters.lowStock === 'true' ? 'white' : '#6b7280',
                  border: `2px solid ${filters.lowStock === 'true' ? '#f59e0b' : '#d1d5db'}`,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  minHeight: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (filters.lowStock !== 'true') {
                    e.currentTarget.style.borderColor = '#EF7722';
                    e.currentTarget.style.color = '#EF7722';
                  }
                }}
                onMouseLeave={(e) => {
                  if (filters.lowStock !== 'true') {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.color = '#6b7280';
                  }
                }}
              >
                <AlertTriangle size={16} />
                {filters.lowStock === 'true' ? 'Low Stock' : 'All Stock'}
              </button>
            </div>
          </div>
        </div>

        {/* Inventory List */}
        <main className="main-content">
          {!loading && filteredInventory.length > 0 && (
            <SortButtons
              options={[
                { field: 'name', label: 'Name' },
                { field: 'sku', label: 'SKU' },
                { field: 'quantity', label: 'Stock' },
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
                minHeight: '400px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  border: '4px solid rgba(239,119,34,0.2)',
                  borderTopColor: '#EF7722',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
            </div>
          ) : filteredInventory.length === 0 ? (
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
              title={filters.search || filters.lowStock === 'true' ? 'No items found' : 'No inventory items yet'}
              description={
                filters.search || filters.lowStock === 'true'
                  ? 'No inventory items match your search or filter criteria. Try adjusting your filters or browse all inventory.'
                  : 'Start tracking your inventory by adding spare parts, tools, and materials.'
              }
              actionLabel={filters.search || filters.lowStock === 'true' ? undefined : 'Add First Item'}
              actionHref={filters.search || filters.lowStock === 'true' ? undefined : '/inventory/new'}
              showAction={!filters.search && filters.lowStock !== 'true'}
            />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '1rem',
              }}
            >
              {sortedInventory.map((item) => {
                const stockStatus = getStockStatus(item);
                const StatusIcon = stockStatus.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => router.push(`/inventory/${item.id}`)}
                    style={{
                      backgroundColor: 'white',
                      padding: '1.25rem',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      border: '1px solid rgba(239,119,34,0.1)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
                      e.currentTarget.style.borderColor = 'rgba(239,119,34,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                      e.currentTarget.style.borderColor = 'rgba(239,119,34,0.1)';
                    }}
                  >
                    {/* Icon Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '1.25rem',
                        right: '1.25rem',
                        width: '48px',
                        height: '48px',
                        background: 'linear-gradient(135deg, #fff5ed 0%, #ffe8d6 100%)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid rgba(239,119,34,0.2)',
                      }}
                    >
                      <Package size={24} color="#EF7722" />
                    </div>

                    {/* Item Name & SKU */}
                    <div style={{ marginBottom: '0.75rem', paddingRight: '4rem' }}>
                      <h3
                        style={{
                          fontSize: '1.125rem',
                          fontWeight: '700',
                          color: '#111827',
                          margin: '0 0 0.25rem 0',
                        }}
                      >
                        {item.name}
                      </h3>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.875rem',
                          color: '#6b7280',
                        }}
                      >
                        {item.sku && (
                          <>
                            <Hash size={14} />
                            <span>{item.sku}</span>
                          </>
                        )}
                        {item.is_serialized && (
                          <>
                            {item.sku && <span>•</span>}
                            <Tag size={14} />
                            <span>Serialized</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Quantity & Status */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '1rem',
                        paddingTop: '1rem',
                        borderTop: '1px solid #f3f4f6',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: stockStatus.color,
                            marginBottom: '0.25rem',
                          }}
                        >
                          {item.quantity || 0} {item.unit || 'units'}
                        </div>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: '#9ca3af',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          Reorder at: {item.reorder_level || 0} {item.unit || 'units'}
                        </div>
                      </div>
                      <div
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: stockStatus.bgColor,
                          color: stockStatus.color,
                          borderRadius: '999px',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          border: `1px solid ${stockStatus.color}40`,
                        }}
                      >
                        <StatusIcon size={16} />
                        {stockStatus.label}
                      </div>
                    </div>

                  </button>
                );
              })}
            </div>
          )}
        </main>

        {/* FAB Button */}
        <button
          onClick={() => router.push('/inventory/new')}
          style={{
            position: 'fixed',
            right: '1rem',
            bottom: '5rem',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(239,119,34,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(239,119,34,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,119,34,0.4)';
          }}
        >
          <Plus size={28} />
        </button>

        <BottomNav activeTab="more" />
      </div>
    </ProtectedRoute>
  );
}
