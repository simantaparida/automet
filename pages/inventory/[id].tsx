import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import Breadcrumb from '@/components/Breadcrumb';
import RoleBadge from '@/components/RoleBadge';
import { useRoleSwitch } from '@/contexts/RoleSwitchContext';
import {
  Package,
  Edit,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BarChart3,
  Hash,
  Layers,
  Calendar,
  ShieldCheck,
  AlertCircle,
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
      const response = await apiFetch(`/api/inventory/${id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch inventory item');
      }
      const data = await response.json();
      if (!data.item) {
        throw new Error('Inventory item not found');
      }
      setItem(data.item);
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      alert(error instanceof Error ? error.message : 'Failed to load inventory item');
      router.push('/inventory');
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
      const currentQuantity = Number(item.quantity) || 0;
      const newQuantity =
        adjustmentType === 'add'
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
        setShowAdjustModal(false);
        setAdjustmentAmount('');
        await fetchItem();
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || 'Failed to adjust stock');
      }
    } catch (error) {
      console.error('Error adjusting stock:', error);
      alert('Error adjusting stock');
    } finally {
      setAdjusting(false);
    }
  };

  const deleteItem = async () => {
    if (!confirm(`Are you sure you want to delete ${item?.name}?`)) return;

    try {
      const response = await apiFetch(`/api/inventory/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/inventory');
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item');
    }
  };

  const getStockStatus = () => {
    if (!item) return { color: '#6b7280', bg: '#f9fafb', label: 'Unknown', icon: AlertCircle };
    const quantity = Number(item.quantity) || 0;
    const reorderLevel = Number(item.reorder_level) || 0;
    if (quantity === 0) {
      return { color: '#ef4444', bg: '#fef2f2', label: 'Out of Stock', icon: XCircle };
    } else if (quantity <= reorderLevel) {
      return { color: '#f59e0b', bg: '#fffbeb', label: 'Low Stock', icon: AlertTriangle };
    } else {
      return { color: '#10b981', bg: '#f0fdf4', label: 'In Stock', icon: CheckCircle2 };
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
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
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
            background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
          }}
        >
          <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>
            Item not found
          </p>
          <button
            onClick={() => router.push('/inventory')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              minHeight: '44px',
              boxShadow: '0 2px 8px rgba(239,119,34,0.25)',
            }}
          >
            Back to Inventory
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  const stockStatus = getStockStatus();
  const StatusIcon = stockStatus.icon;
  const quantity = Number(item.quantity) || 0;
  const reorderLevel = Number(item.reorder_level) || 0;

  return (
    <ProtectedRoute>
      <style jsx>{`
        .detail-container {
          padding-bottom: 80px;
        }
        .main-content-area {
          padding: 0;
        }
        .mobile-header {
          display: block;
        }
        .desktop-header {
          display: none;
        }
        @media (min-width: 768px) {
          .detail-container {
            margin-left: 260px;
            padding-bottom: 0;
            padding-top: 64px;
          }
          .main-content-area {
            padding: 0;
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
        className="detail-container"
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

        {/* Desktop Role Badge */}
        <div className="desktop-header">
          <RoleBadge />
        </div>

        {/* Desktop Breadcrumb */}
        <div
          className="desktop-header"
          style={{
            position: 'sticky',
            top: '64px',
            zIndex: 19,
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <Breadcrumb
            items={[
              { label: 'Inventory', href: '/inventory' },
              { label: item.name },
            ]}
          />
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
            }}
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ←
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1
                style={{
                  fontSize: '1.125rem',
                  fontWeight: '700',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.name}
              </h1>
              {item.sku && (
                <p
                  style={{
                    fontSize: '0.75rem',
                    margin: '0.25rem 0 0 0',
                    opacity: 0.9,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  SKU: {item.sku}
                </p>
              )}
            </div>
            <Package size={24} color="white" />
          </div>
        </header>

        {/* Quick Actions */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '0.75rem',
            padding: '1rem',
            backgroundColor: 'white',
            borderBottom: '1px solid rgba(239,119,34,0.1)',
          }}
        >
          {activeRole !== 'technician' && (
            <>
              <button
                onClick={() => router.push(`/inventory/${id}/edit`)}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#f9fafb',
                  color: '#1f2937',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                  minHeight: '72px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }}
              >
                <Edit size={20} color="#1f2937" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => setShowAdjustModal(true)}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  border: '1px solid #93c5fd',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                  minHeight: '72px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dbeafe';
                  e.currentTarget.style.borderColor = '#60a5fa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#eff6ff';
                  e.currentTarget.style.borderColor = '#93c5fd';
                }}
              >
                <BarChart3 size={20} color="#2563eb" />
                <span>Adjust Stock</span>
              </button>
            </>
          )}
        </div>

        {/* Main Content */}
        <main className="main-content-area" style={{ padding: '1rem' }}>
          {/* Item Header Card */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              marginBottom: '0.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid rgba(239,119,34,0.1)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  background: 'linear-gradient(135deg, #fff5ed 0%, #ffe8d6 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(239,119,34,0.2)',
                }}
              >
                <Package size={28} color="#EF7722" />
              </div>
              <div style={{ flex: 1 }}>
                <h2
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    margin: 0,
                    color: '#1f2937',
                  }}
                >
                  {item.name}
                </h2>
                {item.sku && (
                  <div
                    style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      marginTop: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                    }}
                  >
                    <Hash size={14} />
                    {item.sku}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stock Status Card */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              marginBottom: '0.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid rgba(239,119,34,0.1)',
            }}
          >
            <h3
              style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '1rem',
              }}
            >
              Current Stock
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem',
                  backgroundColor: stockStatus.bg,
                  borderRadius: '12px',
                  border: `2px solid ${stockStatus.color}`,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: '700',
                      color: stockStatus.color,
                      lineHeight: 1,
                      marginBottom: '0.5rem',
                    }}
                  >
                    {quantity}
                  </div>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      fontWeight: '500',
                    }}
                  >
                    {item.unit || 'units'}
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '0.5rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      backgroundColor: stockStatus.color,
                      color: 'white',
                      borderRadius: '999px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                    }}
                  >
                    <StatusIcon size={16} />
                    {stockStatus.label}
                  </div>
                  {reorderLevel > 0 && (
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        textAlign: 'right',
                      }}
                    >
                      Reorder at: {reorderLevel} {item.unit || 'units'}
                    </div>
                  )}
                </div>
              </div>
              {quantity <= reorderLevel && quantity > 0 && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fbbf24',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <AlertTriangle size={18} color="#f59e0b" />
                  <span
                    style={{
                      fontSize: '0.875rem',
                      color: '#92400e',
                      fontWeight: '500',
                    }}
                  >
                    Stock is below reorder level. Consider restocking.
                  </span>
                </div>
              )}
              {quantity === 0 && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #f87171',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <XCircle size={18} color="#ef4444" />
                  <span
                    style={{
                      fontSize: '0.875rem',
                      color: '#991b1b',
                      fontWeight: '500',
                    }}
                  >
                    This item is out of stock. Restock immediately.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Item Details */}
          <div
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              marginBottom: '0.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              border: '1px solid rgba(239,119,34,0.1)',
            }}
          >
            <h3
              style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '1rem',
              }}
            >
              Item Details
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {item.sku && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#eff6ff',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Hash size={20} color="#2563eb" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        marginBottom: '0.25rem',
                      }}
                    >
                      SKU
                    </div>
                    <div
                      style={{
                        fontSize: '0.9375rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        fontFamily: 'monospace',
                      }}
                    >
                      {item.sku}
                    </div>
                  </div>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Layers size={20} color="#10b981" />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Reorder Level
                  </div>
                  <div
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: '600',
                      color: '#1f2937',
                    }}
                  >
                    {reorderLevel} {item.unit || 'units'}
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: item.is_serialized ? '#f0fdf4' : '#f3f4f6',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {item.is_serialized ? (
                    <ShieldCheck size={20} color="#10b981" />
                  ) : (
                    <Package size={20} color="#6b7280" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Tracking Type
                  </div>
                  <div
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: '600',
                      color: '#1f2937',
                    }}
                  >
                    {item.is_serialized ? 'Serialized' : 'Quantity-based'}
                  </div>
                  {item.is_serialized && (
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        marginTop: '0.25rem',
                      }}
                    >
                      Individual items tracked by serial number
                    </div>
                  )}
                </div>
              </div>
              {item.created_at && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #e5e7eb',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Calendar size={20} color="#6b7280" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        marginBottom: '0.25rem',
                      }}
                    >
                      Created
                    </div>
                    <div
                      style={{
                        fontSize: '0.9375rem',
                        fontWeight: '600',
                        color: '#1f2937',
                      }}
                    >
                      {formatDate(item.created_at)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {activeRole !== 'technician' && (
            <div
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid rgba(239,119,34,0.1)',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                }}
              >
                <button
                  onClick={() => router.push(`/inventory/${id}/edit`)}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'white',
                    color: '#EF7722',
                    border: '2px solid #EF7722',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fff5ed';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <Edit size={18} />
                  Edit
                </button>
                <button
                  onClick={deleteItem}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'white',
                    color: '#ef4444',
                    border: '2px solid #ef4444',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fef2f2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </div>
          )}
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
            onClick={() => {
              if (!adjusting) {
                setShowAdjustModal(false);
                setAdjustmentAmount('');
              }
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '1.5rem',
                maxWidth: '420px',
                width: '100%',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#eff6ff',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BarChart3 size={24} color="#2563eb" />
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: '700',
                      margin: 0,
                      color: '#1f2937',
                    }}
                  >
                    Adjust Stock
                  </h2>
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: '#6b7280',
                      margin: '0.25rem 0 0 0',
                    }}
                  >
                    {item.name}
                  </p>
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '10px',
                  marginBottom: '1.5rem',
                }}
              >
                <div
                  style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    marginBottom: '0.5rem',
                  }}
                >
                  Current Stock
                </div>
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#1f2937',
                  }}
                >
                  {quantity} {item.unit || 'units'}
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                }}
              >
                <button
                  onClick={() => setAdjustmentType('add')}
                  disabled={adjusting}
                  style={{
                    padding: '0.875rem',
                    backgroundColor: adjustmentType === 'add' ? '#10b981' : 'white',
                    color: adjustmentType === 'add' ? 'white' : '#6b7280',
                    border: `2px solid ${adjustmentType === 'add' ? '#10b981' : '#d1d5db'}`,
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: adjusting ? 'not-allowed' : 'pointer',
                    minHeight: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    opacity: adjusting ? 0.6 : 1,
                  }}
                >
                  <Plus size={18} />
                  Add
                </button>
                <button
                  onClick={() => setAdjustmentType('subtract')}
                  disabled={adjusting}
                  style={{
                    padding: '0.875rem',
                    backgroundColor: adjustmentType === 'subtract' ? '#ef4444' : 'white',
                    color: adjustmentType === 'subtract' ? 'white' : '#6b7280',
                    border: `2px solid ${adjustmentType === 'subtract' ? '#ef4444' : '#d1d5db'}`,
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: adjusting ? 'not-allowed' : 'pointer',
                    minHeight: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                    opacity: adjusting ? 0.6 : 1,
                  }}
                >
                  <Minus size={18} />
                  Subtract
                </button>
              </div>

              <input
                type="number"
                min="1"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
                placeholder="Enter quantity"
                disabled={adjusting}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  border: '2px solid #d1d5db',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  minHeight: '48px',
                  marginBottom: '1.5rem',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#2563eb';
                  e.currentTarget.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
              />

              {adjustmentAmount && !isNaN(parseInt(adjustmentAmount)) && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #93c5fd',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      marginBottom: '0.25rem',
                    }}
                  >
                    New Stock After Adjustment
                  </div>
                  <div
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: '700',
                      color: '#2563eb',
                    }}
                  >
                    {adjustmentType === 'add'
                      ? quantity + parseInt(adjustmentAmount)
                      : Math.max(0, quantity - parseInt(adjustmentAmount))}{' '}
                    {item.unit || 'units'}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={handleStockAdjustment}
                  disabled={adjusting || !adjustmentAmount || parseInt(adjustmentAmount) <= 0}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    backgroundColor:
                      adjusting || !adjustmentAmount || parseInt(adjustmentAmount) <= 0
                        ? '#9ca3af'
                        : '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor:
                      adjusting || !adjustmentAmount || parseInt(adjustmentAmount) <= 0
                        ? 'not-allowed'
                        : 'pointer',
                    minHeight: '48px',
                    transition: 'all 0.2s',
                  }}
                >
                  {adjusting ? 'Adjusting...' : 'Confirm'}
                </button>
                <button
                  onClick={() => {
                    if (!adjusting) {
                      setShowAdjustModal(false);
                      setAdjustmentAmount('');
                    }
                  }}
                  disabled={adjusting}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    backgroundColor: 'white',
                    color: '#6b7280',
                    border: '2px solid #d1d5db',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: adjusting ? 'not-allowed' : 'pointer',
                    minHeight: '48px',
                    transition: 'all 0.2s',
                    opacity: adjusting ? 0.6 : 1,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <BottomNav activeTab="more" />
      </div>
    </ProtectedRoute>
  );
}
