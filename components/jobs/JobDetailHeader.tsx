import React from 'react';
import { useRouter } from 'next/router';
import {
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Play,
    Edit,
    Trash2,
    CheckCircle,
    ArrowLeft
} from 'lucide-react';

interface JobDetailHeaderProps {
    job: {
        id: string;
        title: string;
        description: string;
        status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
        priority: 'low' | 'medium' | 'high' | 'urgent';
        scheduled_at: string;
        due_date?: string;
        completed_at?: string;
    };
    activeRole: string | null;
    updating: boolean;
    onUpdateStatus: (status: string) => void;
    onDelete: () => void;
}

export default function JobDetailHeader({
    job,
    activeRole,
    updating,
    onUpdateStatus,
    onDelete
}: JobDetailHeaderProps) {
    const router = useRouter();

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'scheduled':
                return { color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', icon: Calendar, label: 'Scheduled' };
            case 'in_progress':
                return { color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100', icon: Play, label: 'In Progress' };
            case 'completed':
                return { color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle2, label: 'Completed' };
            case 'cancelled':
                return { color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', icon: XCircle, label: 'Cancelled' };
            default:
                return { color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-100', icon: AlertCircle, label: status };
        }
    };

    const getPriorityConfig = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return { color: 'text-red-500', bg: 'bg-red-50', label: 'Urgent', icon: AlertCircle };
            case 'high':
                return { color: 'text-amber-500', bg: 'bg-amber-50', label: 'High', icon: AlertCircle };
            case 'medium':
                return { color: 'text-blue-500', bg: 'bg-blue-50', label: 'Medium', icon: AlertCircle };
            case 'low':
                return { color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Low', icon: CheckCircle };
            default:
                return { color: 'text-gray-500', bg: 'bg-gray-50', label: priority, icon: AlertCircle };
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDateShort = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const statusConfig = getStatusConfig(job.status);
    const priorityConfig = getPriorityConfig(job.priority);
    const StatusIcon = statusConfig.icon;
    const PriorityIcon = priorityConfig.icon;

    return (
        <div className="mb-6">
            {/* Back Button */}
            <button
                onClick={() => router.push('/jobs')}
                className="group flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary mb-4 transition-colors"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back to Jobs
            </button>

            {/* Title & Actions Row */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 m-0">
                            {job.title}
                        </h1>
                        <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${priorityConfig.bg} ${priorityConfig.color}`}>
                            <PriorityIcon size={14} />
                            {priorityConfig.label}
                        </div>
                    </div>
                    {job.description && (
                        <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-3xl">
                            {job.description}
                        </p>
                    )}
                </div>

                {/* Desktop Actions */}
                {activeRole !== 'technician' && (
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            onClick={() => router.push(`/jobs/${job.id}/edit`)}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-primary border border-primary/30 rounded-lg text-sm font-semibold hover:bg-orange-50 transition-colors"
                        >
                            <Edit size={16} />
                            Edit
                        </button>
                        <button
                            onClick={onDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-red-500 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {/* Status & Meta Info Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm flex flex-col md:flex-row md:items-center gap-6 md:gap-12">
                {/* Status */}
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusConfig.bg} ${statusConfig.color}`}>
                        <StatusIcon size={20} />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Status</div>
                        <div className={`text-sm font-bold capitalize ${statusConfig.color}`}>
                            {statusConfig.label}
                        </div>
                    </div>
                </div>

                {/* Scheduled */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 text-gray-500">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Scheduled</div>
                        <div className="text-sm font-bold text-gray-900">
                            {formatDate(job.scheduled_at)}
                        </div>
                    </div>
                </div>

                {/* Due Date */}
                {job.due_date && (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 text-gray-500">
                            <Clock size={20} />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Due Date</div>
                            <div className="text-sm font-bold text-gray-900">
                                {formatDateShort(job.due_date)}
                            </div>
                        </div>
                    </div>
                )}

                {/* Completed */}
                {job.completed_at && (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-500">
                            <CheckCircle2 size={20} />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Completed</div>
                            <div className="text-sm font-bold text-emerald-600">
                                {formatDate(job.completed_at)}
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons (Status Change) */}
                {activeRole !== 'technician' && (
                    <div className="md:ml-auto flex items-center gap-3">
                        {job.status === 'scheduled' && (
                            <button
                                onClick={() => onUpdateStatus('in_progress')}
                                disabled={updating}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-600 text-white rounded-lg text-sm font-bold shadow-sm shadow-primary/25 hover:shadow-md hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Play size={18} />
                                {updating ? 'Starting...' : 'Start Job'}
                            </button>
                        )}
                        {job.status === 'in_progress' && (
                            <button
                                onClick={() => onUpdateStatus('completed')}
                                disabled={updating}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg text-sm font-bold shadow-sm shadow-emerald-500/25 hover:shadow-md hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <CheckCircle2 size={18} />
                                {updating ? 'Completing...' : 'Mark Complete'}
                            </button>
                        )}
                        {job.status !== 'completed' && job.status !== 'cancelled' && (
                            <button
                                onClick={() => onUpdateStatus('cancelled')}
                                disabled={updating}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white text-red-500 border border-red-200 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <XCircle size={18} />
                                Cancel
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
