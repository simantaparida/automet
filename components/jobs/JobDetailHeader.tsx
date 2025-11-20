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
    ArrowLeft,
    Timer
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
        created_at?: string;
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
                return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: Calendar, label: 'Scheduled', gradient: 'from-blue-500 to-blue-600' };
            case 'in_progress':
                return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: Play, label: 'In Progress', gradient: 'from-amber-500 to-amber-600' };
            case 'completed':
                return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle2, label: 'Completed', gradient: 'from-emerald-500 to-emerald-600' };
            case 'cancelled':
                return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: XCircle, label: 'Cancelled', gradient: 'from-red-500 to-red-600' };
            default:
                return { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', icon: AlertCircle, label: status, gradient: 'from-gray-500 to-gray-600' };
        }
    };

    const getPriorityConfig = (priority: string) => {
        switch (priority) {
            case 'urgent':
                return { color: 'text-red-600', bg: 'bg-red-100', label: 'Urgent', icon: AlertCircle, pulse: true };
            case 'high':
                return { color: 'text-amber-600', bg: 'bg-amber-100', label: 'High', icon: AlertCircle, pulse: false };
            case 'medium':
                return { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Medium', icon: AlertCircle, pulse: false };
            case 'low':
                return { color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Low', icon: CheckCircle, pulse: false };
            default:
                return { color: 'text-gray-600', bg: 'bg-gray-100', label: priority, icon: AlertCircle, pulse: false };
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

    const getTimeAgo = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return formatDateShort(dateString);
    };

    const getTimeUntil = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = date.getTime() - now.getTime();
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMs < 0) return 'Overdue';
        if (diffHours < 24) return `in ${diffHours}h`;
        if (diffDays < 7) return `in ${diffDays}d`;
        return formatDateShort(dateString);
    };

    const statusConfig = getStatusConfig(job.status);
    const priorityConfig = getPriorityConfig(job.priority);
    const StatusIcon = statusConfig.icon;
    const PriorityIcon = priorityConfig.icon;

    const isOverdue = job.status !== 'completed' && job.status !== 'cancelled' && new Date(job.scheduled_at) < new Date();

    return (
        <div className="mb-8">
            {/* Back Button */}
            <button
                onClick={() => router.push('/jobs')}
                className="relative z-10 group flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary mb-6 transition-colors"
            >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back to Jobs
            </button>

            {/* Glassmorphism Header Card */}
            <div className="bg-gradient-to-br from-white via-white to-gray-50 rounded-2xl border border-gray-200/60 shadow-xl shadow-gray-200/50 overflow-hidden backdrop-blur-sm">
                {/* Priority Banner */}
                {priorityConfig.pulse && (
                    <div className={`h-1.5 bg-gradient-to-r ${statusConfig.gradient} animate-pulse`}></div>
                )}

                <div className="p-6 md:p-8">
                    {/* Title & Priority Row */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                        <div className="flex-1">
                            <div className="flex items-start gap-3 mb-3">
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                                    {job.title}
                                </h1>
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${priorityConfig.bg} ${priorityConfig.color} shadow-sm`}>
                                    <PriorityIcon size={14} />
                                    {priorityConfig.label}
                                </div>
                            </div>
                            {job.description && (
                                <p className="text-gray-600 text-base leading-relaxed max-w-3xl">
                                    {job.description}
                                </p>
                            )}
                            {job.created_at && (
                                <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                                    <Timer size={14} />
                                    <span>Created {getTimeAgo(job.created_at)}</span>
                                </div>
                            )}
                        </div>

                        {/* Desktop Actions */}
                        {activeRole !== 'technician' && (
                            <div className="hidden md:flex items-center gap-3">
                                <button
                                    onClick={() => router.push(`/jobs/${job.id}/edit`)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-primary border-2 border-primary/20 rounded-xl text-sm font-bold hover:bg-orange-50 hover:border-primary/40 transition-all hover:-translate-y-0.5 shadow-sm"
                                >
                                    <Edit size={16} />
                                    Edit
                                </button>
                                <button
                                    onClick={onDelete}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-red-600 border-2 border-red-200 rounded-xl text-sm font-bold hover:bg-red-50 hover:border-red-300 transition-all hover:-translate-y-0.5 shadow-sm"
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Status & Meta Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        {/* Status */}
                        <div className="flex items-center gap-4 p-4 bg-white/80 rounded-xl border border-gray-200/60 shadow-sm">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusConfig.bg} ${statusConfig.color} shadow-sm`}>
                                <StatusIcon size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</div>
                                <div className={`text-base font-bold ${statusConfig.color}`}>
                                    {statusConfig.label}
                                </div>
                            </div>
                        </div>

                        {/* Scheduled */}
                        <div className="flex items-center gap-4 p-4 bg-white/80 rounded-xl border border-gray-200/60 shadow-sm">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isOverdue ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'} shadow-sm`}>
                                <Calendar size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Scheduled</div>
                                <div className={`text-sm font-bold ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                                    {formatDateShort(job.scheduled_at)}
                                </div>
                                <div className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
                                    {isOverdue ? 'Overdue' : getTimeUntil(job.scheduled_at)}
                                </div>
                            </div>
                        </div>

                        {/* Due Date or Completed */}
                        {job.completed_at ? (
                            <div className="flex items-center gap-4 p-4 bg-white/80 rounded-xl border border-gray-200/60 shadow-sm">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 shadow-sm">
                                    <CheckCircle2 size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Completed</div>
                                    <div className="text-sm font-bold text-emerald-600">
                                        {formatDateShort(job.completed_at)}
                                    </div>
                                    <div className="text-xs font-medium text-emerald-500">
                                        {getTimeAgo(job.completed_at)}
                                    </div>
                                </div>
                            </div>
                        ) : job.due_date ? (
                            <div className="flex items-center gap-4 p-4 bg-white/80 rounded-xl border border-gray-200/60 shadow-sm">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600 shadow-sm">
                                    <Clock size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Due Date</div>
                                    <div className="text-sm font-bold text-gray-900">
                                        {formatDateShort(job.due_date)}
                                    </div>
                                    <div className="text-xs font-medium text-gray-500">
                                        {getTimeUntil(job.due_date)}
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {/* Action Buttons */}
                        {activeRole !== 'technician' && (
                            <div className="flex items-center justify-center md:justify-end gap-3">
                                {job.status === 'scheduled' && (
                                    <button
                                        onClick={() => onUpdateStatus('in_progress')}
                                        disabled={updating}
                                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Play size={18} />
                                        {updating ? 'Starting...' : 'Start Job'}
                                    </button>
                                )}
                                {job.status === 'in_progress' && (
                                    <button
                                        onClick={() => onUpdateStatus('completed')}
                                        disabled={updating}
                                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CheckCircle2 size={18} />
                                        {updating ? 'Completing...' : 'Complete'}
                                    </button>
                                )}
                                {job.status !== 'completed' && job.status !== 'cancelled' && (
                                    <button
                                        onClick={() => onUpdateStatus('cancelled')}
                                        disabled={updating}
                                        className="flex items-center gap-2 px-5 py-3 bg-white text-red-600 border-2 border-red-200 rounded-xl text-sm font-bold hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <XCircle size={18} />
                                        Cancel
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Overdue Warning */}
                    {isOverdue && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                            <div>
                                <div className="text-sm font-bold text-red-900">This job is overdue</div>
                                <div className="text-xs text-red-700">Scheduled for {formatDate(job.scheduled_at)}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
