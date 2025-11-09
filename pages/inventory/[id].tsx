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
  notes: string | null;
  created_at: string;
}

export default function InventoryDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [adjusting, setAdjusting] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract'>(
    'add'
  );

  useEffect(() => {
    if (id) {
      fetchItem();
    }
  }, [id]);

  const fetchItem = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/inventory/${id}`);
      const data = await response.json();
      setItem(data.item);
    } catch (error) {
      console.error('Error fetching inventory item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStockAdjustment = async () => {
    if (!item || !adjustmentAmount) return;

    const amount = parseInt(adjustmentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid positive number');
      return;
    }

    setAdjusting(true);
    try {
      const newQuantity =
        adjustmentType === 'add'
          ? item.quantity_available + amount
          : Math.max(0, item.quantity_available - amount);

      const response = await fetch(`/api/inventory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          quantity_available: newQuantity,
        }),
      });

      if (response.ok) {
        setShowAdjustModal(false);
        setAdjustmentAmount('');
        await fetchItem();
      }
    } catch (error) {
      console.error('Error adjusting stock:', error);
      alert('Error adjusting stock');
    } finally {
      setAdjusting(false);
    }
  };

  const deleteItem = async () => {
    if (!confirm(`Are you sure you want to delete ${item?.item_name}?`)) return;

    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/inventory');
      } else {
        alert('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item');
    }
  };

  const getStockStatus = () => {
    if (!item) return { color: '#6b7280', label: 'Unknown', icon: '⚪' };
    if (item.quantity_available === 0) {
      return { color: '#ef4444', label: 'Out of Stock', icon: '🔴' };
    } else if (item.quantity_available <= item.reorder_level) {
      return { color: '#f59e0b', label: 'Low Stock', icon: '⚠️' };
    } else {
      return { color: '#10b981', label: 'In Stock', icon: '✓' };
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
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
      </ProtectedRoute>
    );
  }

  if (!item) {
    return (
      <ProtectedRoute>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '1rem',
            padding: '1rem',
          }}
        >
          <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
            Item not found
          </p>
          <button
            onClick={() => router.push('/inventory')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer',
              minHeight: '44px',
            }}
          >
            Back to Inventory
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  const stockStatus = getStockStatus();

  return (
    <ProtectedRoute>
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          paddingBottom: '80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Header */}
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
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          >
            <button
              onClick={() => router.push('/inventory')}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.25rem',
                minWidth: '44px',
                minHeight: '44px',
              }}
            >
              ←
            </button>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
                {item.item_name}
              </h1>
              <p
                style={{
                  fontSize: '0.75rem',
                  margin: '0.25rem 0 0 0',
                  opacity: 0.9,
                }}
              >
                {item.category}
              </p>
            </div>
          </div>
        </header>

        {/* Quick Actions */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            padding: '1rem',
            backgroundColor: 'white',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          <button
            onClick={() => router.push(`/inventory/${id}/edit`)}
            style={{
              padding: '0.75rem',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              minHeight: '44px',
            }}
          >
            <span>✏️</span> Edit
          </button>
          <button
            onClick={() => setShowAdjustModal(true)}
            style={{
              padding: '0.75rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              minHeight: '44px',
            }}
          >
            <span>📊</span> Adjust Stock
          </button>
        </div>

        <main style={{ padding: '1rem' }}>
          {/* Stock Status */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '1rem',
              marginBottom: '0.75rem',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <h3
              style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.75rem',
              }}
            >
              Current Stock
            </h3>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                backgroundColor: `${stockStatus.color}10`,
                borderRadius: '8px',
                border: `2px solid ${stockStatus.color}`,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: '600',
                    color: stockStatus.color,
                  }}
                >
                  {item.quantity_available}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {item.unit_of_measure}
                </div>
              </div>
              <div
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: stockStatus.color,
                  color: 'white',
                  borderRadius: '999px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>{stockStatus.icon}</span>
                {stockStatus.label}
              </div>
            </div>
          </div>

          {/* Item Details */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '1rem',
              marginBottom: '0.75rem',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <h3
              style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.75rem',
              }}
            >
              Item Details
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {item.sku && (
                <div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      marginBottom: '0.25rem',
                    }}
                  >
                    SKU
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                    {item.sku}
                  </div>
                </div>
              )}
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginBottom: '0.25rem',
                  }}
                >
                  Reorder Level
                </div>
                <div style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                  {item.reorder_level} {item.unit_of_measure}
                </div>
              </div>
              {item.unit_cost && (
                <div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Unit Cost
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#1f2937' }}>
                    ₹{item.unit_cost.toFixed(2)}
                  </div>
                </div>
              )}
              {item.notes && (
                <div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Notes
                  </div>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      color: '#1f2937',
                      fontStyle: 'italic',
                    }}
                  >
                    {item.notes}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Delete Button */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '1rem',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <button
              onClick={deleteItem}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'white',
                color: '#ef4444',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                minHeight: '44px',
              }}
            >
              🗑️ Delete Item
            </button>
          </div>
        </main>

        {/* Stock Adjustment Modal */}
        {showAdjustModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
              padding: '1rem',
            }}
            onClick={() => setShowAdjustModal(false)}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                maxWidth: '400px',
                width: '100%',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                }}
              >
                Adjust Stock
              </h2>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    marginBottom: '0.5rem',
                    display: 'block',
                  }}
                >
                  Current: {item.quantity_available} {item.unit_of_measure}
                </label>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                <button
                  onClick={() => setAdjustmentType('add')}
                  style={{
                    padding: '0.75rem',
                    backgroundColor:
                      adjustmentType === 'add' ? '#10b981' : 'white',
                    color: adjustmentType === 'add' ? 'white' : '#6b7280',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    minHeight: '44px',
                  }}
                >
                  + Add
                </button>
                <button
                  onClick={() => setAdjustmentType('subtract')}
                  style={{
                    padding: '0.75rem',
                    backgroundColor:
                      adjustmentType === 'subtract' ? '#ef4444' : 'white',
                    color: adjustmentType === 'subtract' ? 'white' : '#6b7280',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    minHeight: '44px',
                  }}
                >
                  - Subtract
                </button>
              </div>
              <input
                type="number"
                min="1"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
                placeholder="Enter quantity"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  minHeight: '48px',
                  marginBottom: '1rem',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleStockAdjustment}
                  disabled={adjusting || !adjustmentAmount}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor:
                      adjusting || !adjustmentAmount ? '#9ca3af' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor:
                      adjusting || !adjustmentAmount
                        ? 'not-allowed'
                        : 'pointer',
                    minHeight: '48px',
                  }}
                >
                  {adjusting ? 'Adjusting...' : 'Confirm'}
                </button>
                <button
                  onClick={() => {
                    setShowAdjustModal(false);
                    setAdjustmentAmount('');
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: 'white',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    minHeight: '48px',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <BottomNav activeTab="more" />
      </div>
    </ProtectedRoute>
  );
}
