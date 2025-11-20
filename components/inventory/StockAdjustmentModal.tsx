import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';

interface StockAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number, type: 'add' | 'subtract') => Promise<void>;
    itemName: string;
    currentQuantity: number;
    unit?: string | null;
}

export default function StockAdjustmentModal({
    isOpen,
    onClose,
    onConfirm,
    itemName,
    currentQuantity,
    unit = 'units',
}: StockAdjustmentModalProps) {
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'add' | 'subtract'>('add');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseInt(amount);
        if (!numAmount || numAmount <= 0) return;

        setLoading(true);
        try {
            await onConfirm(numAmount, type);
            setAmount('');
            onClose();
        } catch (error) {
            console.error('Error adjusting stock:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Adjust Stock</h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <p className="text-sm text-gray-500 mb-1">Item</p>
                        <p className="font-medium text-gray-900">{itemName}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Current Quantity: <span className="font-medium text-gray-900">{currentQuantity} {unit}</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button
                            type="button"
                            onClick={() => setType('add')}
                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-medium ${type === 'add'
                                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                                    : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50 text-gray-600'
                                }`}
                        >
                            <Plus size={18} />
                            Add Stock
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('subtract')}
                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all font-medium ${type === 'subtract'
                                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                                    : 'border-gray-200 hover:border-amber-200 hover:bg-gray-50 text-gray-600'
                                }`}
                        >
                            <Minus size={18} />
                            Remove Stock
                        </button>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantity to {type === 'add' ? 'add' : 'remove'}
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-lg"
                            autoFocus
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 text-gray-700 font-semibold bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!amount || loading}
                            className={`flex-1 px-4 py-3 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/20 ${!amount || loading
                                    ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                    : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:-translate-y-0.5 hover:shadow-primary-500/30'
                                }`}
                        >
                            {loading ? 'Updating...' : 'Update Stock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
