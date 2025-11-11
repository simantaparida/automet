import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';

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
      return { color: '#ef4444', label: 'Out of Stock', icon: '🔴' };
    } else if (item.quantity_available <= item.reorder_level) {
      return { color: '#f59e0b', label: 'Low Stock', icon: '⚠️' };
    } else {
      return { color: '#10b981', label: 'In Stock', icon: '✓' };
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
            Inventory
          </h1>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              fontSize: '0.875rem',
              opacity: 0.9,
            }}
          >
            <span>{filteredInventory.length} items</span>
            {lowStockCount > 0 && (
              <span style={{ color: '#fbbf24' }}>
                ⚠️ {lowStockCount} low stock
              </span>
            )}
          </div>
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
            placeholder="Search inventory..."
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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.5rem',
            }}
          >
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                minHeight: '48px',
                boxSizing: 'border-box',
              }}
            >
              <option value="">All Categories</option>
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              style={{
                padding: '0.75rem',
                backgroundColor: showLowStockOnly ? '#f59e0b' : 'white',
                color: showLowStockOnly ? 'white' : '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                minHeight: '48px',
              }}
            >
              {showLowStockOnly ? '⚠️ Low Stock' : 'All Stock'}
            </button>
          </div>
        </div>

        {/* Inventory List */}
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
          ) : filteredInventory.length === 0 ? (
            <div
              style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '1rem', color: '#6b7280', margin: 0 }}>
                {searchTerm || categoryFilter || showLowStockOnly
                  ? 'No items found matching your filters'
                  : 'No inventory items yet'}
              </p>
              {!searchTerm && !categoryFilter && !showLowStockOnly && (
                <button
                  onClick={() => router.push('/inventory/new')}
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
                  Add First Item
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
              {filteredInventory.map((item) => {
                const stockStatus = getStockStatus(item);
                return (
                  <button
                    key={item.id}
                    onClick={() => router.push(`/inventory/${item.id}`)}
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
                          {item.item_name}
                        </h3>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          {item.category}
                          {item.sku && ` • SKU: ${item.sku}`}
                        </div>
                      </div>
                      <span style={{ fontSize: '1.25rem' }}>📦</span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '0.5rem',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: stockStatus.color,
                          }}
                        >
                          {item.quantity_available} {item.unit_of_measure}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          Reorder at: {item.reorder_level}
                        </div>
                      </div>
                      <div
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: `${stockStatus.color}20`,
                          color: stockStatus.color,
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <span>{stockStatus.icon}</span>
                        {stockStatus.label}
                      </div>
                    </div>

                    {item.unit_cost && (
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          marginTop: '0.5rem',
                        }}
                      >
                        ₹{item.unit_cost.toFixed(2)}/{item.unit_of_measure}
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

        {/* Bottom Navigation */}
        <BottomNav activeTab="more" />
      </div>
    </ProtectedRoute>
  );
}
