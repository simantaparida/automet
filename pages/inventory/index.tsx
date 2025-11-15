import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import {
  Plus,
  Package,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Hash,
  Tag,
  DollarSign,
} from 'lucide-react';

interface InventoryItem {
  id: string;
  item_name: string;
  category: string;
  sku: string | null;
  unit_of_measure: string;
  quantity_available: number;
  reorder_level: number;
  unit_cost: number | null;
}

export default function InventoryPage() {
  const router = useRouter();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    let filtered = inventory;

    // Filter by category
    if (categoryFilter) {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    // Filter by low stock
    if (showLowStockOnly) {
      filtered = filtered.filter(
        (item) => item.quantity_available <= item.reorder_level
      );
    }

    // Filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(
        (item) =>
          item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.sku &&
            item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredInventory(filtered);
  }, [searchTerm, categoryFilter, showLowStockOnly, inventory]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/inventory');
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

  const uniqueCategories = Array.from(
    new Set(inventory.map((item) => item.category))
  );
  const lowStockCount = inventory.filter(
    (item) => item.quantity_available <= item.reorder_level
  ).length;

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity_available === 0) {
      return {
        color: '#ef4444',
        label: 'Out of Stock',
        icon: XCircle,
        bgColor: '#fee2e2',
      };
    } else if (item.quantity_available <= item.reorder_level) {
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
        @media (min-width: 768px) {
          .inventory-container {
            margin-left: 260px;
            padding-bottom: 0;
          }
          .main-content {
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
          }
          .mobile-header {
            display: none;
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
        <Sidebar activeTab="more" />

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
                placeholder="Search inventory by name, SKU, or category..."
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
                gridTemplateColumns: '1fr auto',
                gap: '0.75rem',
                alignItems: 'center',
              }}
            >
              <div style={{ position: 'relative' }}>
                <Filter
                  size={18}
                  color="#6b7280"
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    minHeight: '48px',
                    boxSizing: 'border-box',
                    backgroundColor: 'white',
                    cursor: 'pointer',
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
                  <option value="">All Categories</option>
                  {uniqueCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: showLowStockOnly ? '#f59e0b' : 'white',
                  color: showLowStockOnly ? 'white' : '#6b7280',
                  border: `2px solid ${showLowStockOnly ? '#f59e0b' : '#d1d5db'}`,
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
                  if (!showLowStockOnly) {
                    e.currentTarget.style.borderColor = '#EF7722';
                    e.currentTarget.style.color = '#EF7722';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showLowStockOnly) {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.color = '#6b7280';
                  }
                }}
              >
                <AlertTriangle size={16} />
                {showLowStockOnly ? 'Low Stock' : 'All Stock'}
              </button>
            </div>
          </div>
        </div>

        {/* Inventory List */}
        <main className="main-content">
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
            <div
              style={{
                backgroundColor: 'white',
                padding: '3rem 2rem',
                borderRadius: '12px',
                textAlign: 'center',
                boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                border: '1px solid rgba(239,119,34,0.1)',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto 1.5rem',
                  background: 'linear-gradient(135deg, #fff5ed 0%, #ffe8d6 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(239,119,34,0.2)',
                }}
              >
                <Package size={40} color="#EF7722" />
              </div>
              <p
                style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#111827',
                  margin: '0 0 0.5rem 0',
                }}
              >
                {searchTerm || categoryFilter || showLowStockOnly
                  ? 'No items found'
                  : 'No inventory items yet'}
              </p>
              <p
                style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  margin: '0 0 1.5rem 0',
                }}
              >
                {searchTerm || categoryFilter || showLowStockOnly
                  ? 'Try adjusting your filters'
                  : 'Start tracking your inventory by adding your first item'}
              </p>
              {!searchTerm && !categoryFilter && !showLowStockOnly && (
                <button
                  onClick={() => router.push('/inventory/new')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    minHeight: '48px',
                    boxShadow: '0 2px 8px rgba(239,119,34,0.25)',
                    transition: 'all 0.2s',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,119,34,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(239,119,34,0.25)';
                  }}
                >
                  <Plus size={20} />
                  Add First Item
                </button>
              )}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '1rem',
              }}
            >
              {filteredInventory.map((item) => {
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

                    {/* Item Name & Category */}
                    <div style={{ marginBottom: '0.75rem', paddingRight: '4rem' }}>
                      <h3
                        style={{
                          fontSize: '1.125rem',
                          fontWeight: '700',
                          color: '#111827',
                          margin: '0 0 0.25rem 0',
                        }}
                      >
                        {item.item_name}
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
                        <Tag size={14} />
                        <span>{item.category}</span>
                        {item.sku && (
                          <>
                            <span>•</span>
                            <Hash size={14} />
                            <span>{item.sku}</span>
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
                          {item.quantity_available} {item.unit_of_measure}
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
                          Reorder at: {item.reorder_level} {item.unit_of_measure}
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

                    {/* Unit Cost */}
                    {item.unit_cost && (
                      <div
                        style={{
                          marginTop: '0.75rem',
                          paddingTop: '0.75rem',
                          borderTop: '1px solid #f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.875rem',
                          color: '#6b7280',
                        }}
                      >
                        <DollarSign size={14} />
                        <span>
                          ₹{item.unit_cost.toFixed(2)}/{item.unit_of_measure}
                        </span>
                      </div>
                    )}
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
