import { Coffee } from 'lucide-react';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="mb-4 text-gray-300">
                {icon || <Coffee size={48} />}
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">{title}</h3>
            {description && (
                <p className="text-xs text-gray-500">{description}</p>
            )}
        </div>
    );
}
