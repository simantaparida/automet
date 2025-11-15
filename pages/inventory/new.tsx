import { useState } from 'react';
import { useRouter } from 'next/router';
import ProtectedRoute from '@/components/ProtectedRoute';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import {
  ArrowLeft,
  Package,
  Save,
  Tag,
  Hash,
  Ruler,
  Package2,
  AlertCircle,
  DollarSign,
  FileText,
} from 'lucide-react';

export default function NewInventoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    item_name: '',
    category: '',
    sku: '',
    unit_of_measure: '',
    quantity_available: '',
    reorder_level: '',
    unit_cost: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !formData.item_name ||
      !formData.category ||
      !formData.unit_of_measure
    ) {
      setError('Item name, category, and unit of measure are required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_name: formData.item_name,
          category: formData.category,
          sku: formData.sku || null,
          unit_of_measure: formData.unit_of_measure,
          quantity_available: formData.quantity_available
            ? parseInt(formData.quantity_available)
            : 0,
          reorder_level: formData.reorder_level
            ? parseInt(formData.reorder_level)
            : 0,
          unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : null,
          notes: formData.notes || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/inventory/${data.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create inventory item');
      }
    } catch (error) {
      console.error('Error creating inventory item:', error);
      setError('Error creating inventory item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <ProtectedRoute>
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .inventory-form-container {
          padding-bottom: 80px;
        }
        .main-content {
          padding: 1rem;
        }
        .mobile-header {
          display: block;
        }
        @media (min-width: 768px) {
          .inventory-form-container {
            margin-left: 260px;
            padding-bottom: 0;
          }
          .main-content {
            padding: 2rem;
            max-width: 600px;
            margin: 0 auto;
          }
          .mobile-header {
            display: none;
          }
        }
      `}</style>

      <div
        className="inventory-form-container"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #fff5ed 0%, #ffffff 50%, #fff8f1 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Desktop Sidebar */}
        <Sidebar activeTab="inventory" />

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => router.back()}
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                minHeight: '44px',
                minWidth: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <ArrowLeft size={24} />
            </button>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>
              New Inventory Item
            </h1>
          </div>
        </header>

        {/* Form */}
        <main className="main-content">
          <div
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
              border: '1px solid rgba(239,119,34,0.1)',
            }}
          >
            {/* Header Icon */}
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
              <div>
                <h1
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#111827',
                    margin: 0,
                  }}
                >
                  Create New Item
                </h1>
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    margin: '0.25rem 0 0 0',
                  }}
                >
                  Add a new item to your inventory
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  padding: '0.75rem',
                  marginBottom: '1.5rem',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  border: '1px solid #fecaca',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Item Name */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#374151',
                  }}
                >
                  <Package size={16} color="#6b7280" />
                  Item Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="item_name"
                  required
                  value={formData.item_name}
                  onChange={handleChange}
                  placeholder="e.g., Ethernet Cable 5m"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
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

              {/* Category */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#374151',
                  }}
                >
                  <Tag size={16} color="#6b7280" />
                  Category <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., Cables, Tools, Parts"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
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

              {/* SKU */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#374151',
                  }}
                >
                  <Hash size={16} color="#6b7280" />
                  SKU (Stock Keeping Unit)
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="e.g., ETH-CAB-5M"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
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

              {/* Unit of Measure */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#374151',
                  }}
                >
                  <Ruler size={16} color="#6b7280" />
                  Unit of Measure <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="unit_of_measure"
                  required
                  value={formData.unit_of_measure}
                  onChange={handleChange}
                  placeholder="e.g., pcs, kg, m, liters"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
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

              {/* Quantity Available & Reorder Level */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  marginBottom: '1.25rem',
                }}
              >
                {/* Quantity Available */}
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      color: '#374151',
                    }}
                  >
                    <Package2 size={16} color="#6b7280" />
                    Initial Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity_available"
                    min="0"
                    value={formData.quantity_available}
                    onChange={handleChange}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
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

                {/* Reorder Level */}
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem',
                      color: '#374151',
                    }}
                  >
                    <AlertCircle size={16} color="#6b7280" />
                    Reorder Level
                  </label>
                  <input
                    type="number"
                    name="reorder_level"
                    min="0"
                    value={formData.reorder_level}
                    onChange={handleChange}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
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
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: '#9ca3af',
                      margin: '0.25rem 0 0 0',
                    }}
                  >
                    Alert threshold
                  </p>
                </div>
              </div>

              {/* Unit Cost */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#374151',
                  }}
                >
                  <DollarSign size={16} color="#6b7280" />
                  Unit Cost (₹)
                </label>
                <input
                  type="number"
                  name="unit_cost"
                  step="0.01"
                  min="0"
                  value={formData.unit_cost}
                  onChange={handleChange}
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
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

              {/* Notes */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#374151',
                  }}
                >
                  <FileText size={16} color="#6b7280" />
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Additional information..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    resize: 'vertical',
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

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1.5rem',
                    background: loading
                      ? '#9ca3af'
                      : 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    minHeight: '48px',
                    transition: 'all 0.2s',
                    boxShadow: loading
                      ? 'none'
                      : '0 2px 8px rgba(239,119,34,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,119,34,0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(239,119,34,0.25)';
                    }
                  }}
                >
                  {loading ? (
                    <>
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTopColor: 'white',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                        }}
                      />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Create Item</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'white',
                    color: '#6b7280',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    minHeight: '48px',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#EF7722';
                    e.currentTarget.style.color = '#EF7722';
                    e.currentTarget.style.boxShadow = '0 0 0 1px rgba(239,119,34,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.color = '#6b7280';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <ArrowLeft size={18} />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          </div>
        </main>

        <BottomNav activeTab="more" />
      </div>
    </ProtectedRoute>
  );
}
