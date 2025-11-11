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
}

export default function EditInventoryPage() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    item_name: '',
    category: '',
    sku: '',
    unit_of_measure: '',
    reorder_level: '',
    unit_cost: '',
    notes: '',
  });

  useEffect(() => {
    if (id) {
      fetchItem();
    }
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await fetch(`/api/inventory/${id}`);
      if (response.ok) {
        const data = await response.json();
        setItem(data);
        setFormData({
          item_name: data.item_name,
          category: data.category,
          sku: data.sku || '',
          unit_of_measure: data.unit_of_measure,
          reorder_level: data.reorder_level.toString(),
          unit_cost: data.unit_cost ? data.unit_cost.toString() : '',
          notes: data.notes || '',
        });
      }
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      alert('Failed to load inventory item');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.item_name ||
      !formData.category ||
      !formData.unit_of_measure
    ) {
      alert('Item name, category, and unit of measure are required');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_name: formData.item_name,
          category: formData.category,
          sku: formData.sku || null,
          unit_of_measure: formData.unit_of_measure,
          quantity_available: item?.quantity_available || 0, // Don't change quantity in edit form
          reorder_level: formData.reorder_level
            ? parseInt(formData.reorder_level)
            : 0,
          unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : null,
          notes: formData.notes || null,
        }),
      });

      if (response.ok) {
        router.push(`/inventory/${id}`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating inventory item:', error);
      alert('Failed to update inventory item');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => router.back()}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0',
                minHeight: '44px',
                minWidth: '44px',
              }}
            >
              ←
            </button>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
              Edit Inventory Item
            </h1>
          </div>
        </header>

        {/* Form */}
        <main style={{ padding: '1rem' }}>
          <form
            onSubmit={handleSubmit}
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            {/* Item Name */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem',
                }}
              >
                Item Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.item_name}
                onChange={(e) =>
                  setFormData({ ...formData, item_name: e.target.value })
                }
                placeholder="e.g., Ethernet Cable 5m"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  minHeight: '48px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Category */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem',
                }}
              >
                Category <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="e.g., Cables, Tools, Parts"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  minHeight: '48px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* SKU */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem',
                }}
              >
                SKU (Stock Keeping Unit)
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                placeholder="e.g., ETH-CAB-5M"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  minHeight: '48px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Unit of Measure */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem',
                }}
              >
                Unit of Measure <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.unit_of_measure}
                onChange={(e) =>
                  setFormData({ ...formData, unit_of_measure: e.target.value })
                }
                placeholder="e.g., pcs, kg, m, liters"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  minHeight: '48px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Current Quantity (Read-only) */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem',
                }}
              >
                Current Quantity
              </label>
              <input
                type="text"
                value={`${item?.quantity_available || 0} ${formData.unit_of_measure}`}
                disabled
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  minHeight: '48px',
                  boxSizing: 'border-box',
                  backgroundColor: '#f9fafb',
                  color: '#6b7280',
                }}
              />
              <p
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  margin: '0.25rem 0 0 0',
                }}
              >
                Use the "Adjust Stock" button on the details page to change
                quantity
              </p>
            </div>

            {/* Reorder Level */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem',
                }}
              >
                Reorder Level
              </label>
              <input
                type="number"
                min="0"
                value={formData.reorder_level}
                onChange={(e) =>
                  setFormData({ ...formData, reorder_level: e.target.value })
                }
                placeholder="0"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  minHeight: '48px',
                  boxSizing: 'border-box',
                }}
              />
              <p
                style={{
                  fontSize: '0.75rem',
                  color: '#6b7280',
                  margin: '0.25rem 0 0 0',
                }}
              >
                Alert when stock falls below this level
              </p>
            </div>

            {/* Unit Cost */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem',
                }}
              >
                Unit Cost (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.unit_cost}
                onChange={(e) =>
                  setFormData({ ...formData, unit_cost: e.target.value })
                }
                placeholder="0.00"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  minHeight: '48px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem',
                }}
              >
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional information..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              />
            </div>

            {/* Buttons */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
              }}
            >
              <button
                type="button"
                onClick={() => router.back()}
                disabled={saving}
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  minHeight: '48px',
                  opacity: saving ? 0.5 : 1,
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  minHeight: '48px',
                  opacity: saving ? 0.5 : 1,
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </main>

        {/* Bottom Navigation */}
        <BottomNav activeTab="more" />
      </div>
    </ProtectedRoute>
  );
}
