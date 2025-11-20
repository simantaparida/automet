import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface StockBadgeProps {
    quantity: number;
    reorderLevel: number;
    unit?: string | null;
}

export default function StockBadge({ quantity, reorderLevel, unit }: StockBadgeProps) {
    const getStatus = () => {
        if (quantity === 0) {
            return {
                label: 'Out of Stock',
                icon: XCircle,
                className: 'bg-red-100 text-red-600 border-red-200',
                iconColor: '#ef4444',
            };
        } else if (quantity <= reorderLevel) {
            return {
                label: 'Low Stock',
                icon: AlertTriangle,
                className: 'bg-amber-100 text-amber-700 border-amber-200',
                iconColor: '#f59e0b',
            };
        } else {
            return {
                label: 'In Stock',
                icon: CheckCircle2,
                className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                iconColor: '#10b981',
            };
        }
    };

    const status = getStatus();
    const Icon = status.icon;

    return (
        <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${status.className}`}
        >
            <Icon size={14} />
            <span>{status.label}</span>
        </div>
    );
}
