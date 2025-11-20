import React, { useState } from 'react';
import {
    CheckSquare,
    History,
    Info,
    User,
    MapPin,
    Wrench,
    Phone,
    Mail,
    Building2,
    Navigation
} from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import JobInfoCard from './JobInfoCard';

interface JobTabsProps {
    job: any;
    activeRole: string | null;
    onAddTask?: () => void;
    onCall?: () => void;
    onEmail?: () => void;
    onNavigate?: () => void;
}

export default function JobTabs({ job, activeRole, onAddTask, onCall, onEmail, onNavigate }: JobTabsProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'history'>('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Info },
        { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: job.tasks?.length || 0 },
        { id: 'history', label: 'History', icon: History, count: job.assignments?.length || 0 },
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors relative ${isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <Icon size={18} />
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-orange-100 text-primary' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="p-6 min-h-[300px]">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Customer Info */}
                        <JobInfoCard
                            title="Customer"
                            icon={User}
                            items={[
                                {
                                    label: 'Name',
                                    value: job.client?.name || 'N/A',
                                    icon: User
                                },
                                {
                                    label: 'Phone',
                                    value: job.client?.contact_phone || 'N/A',
                                    icon: Phone,
                                    action: job.client?.contact_phone && onCall ? {
                                        label: 'Call',
                                        onClick: onCall,
                                        icon: Phone
                                    } : undefined
                                },
                                {
                                    label: 'Email',
                                    value: job.client?.contact_email || 'N/A',
                                    icon: Mail,
                                    action: job.client?.contact_email && onEmail ? {
                                        label: 'Email',
                                        onClick: onEmail,
                                        icon: Mail
                                    } : undefined
                                }
                            ]}
                        />

                        {/* Site Info */}
                        <JobInfoCard
                            title="Site Location"
                            icon={MapPin}
                            items={[
                                {
                                    label: 'Site Name',
                                    value: job.site?.name || 'N/A',
                                    icon: Building2
                                },
                                {
                                    label: 'Address',
                                    value: job.site?.address || 'N/A',
                                    icon: MapPin,
                                    action: (job.site?.address || (job.site?.gps_lat && job.site?.gps_lng)) && onNavigate ? {
                                        label: 'Navigate',
                                        onClick: onNavigate,
                                        icon: Navigation
                                    } : undefined
                                }
                            ]}
                        />

                        {/* Asset Info */}
                        {job.asset ? (
                            <JobInfoCard
                                title="Asset Details"
                                icon={Wrench}
                                items={[
                                    { label: 'Type', value: job.asset.asset_type, icon: Wrench },
                                    { label: 'Model', value: job.asset.model || 'N/A', icon: Wrench },
                                    { label: 'Serial Number', value: job.asset.serial_number || 'N/A', icon: Wrench }
                                ]}
                            />
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-center">
                                <div className="text-center text-gray-400">
                                    <Wrench size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No asset linked</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'tasks' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Task Checklist</h3>
                            {activeRole !== 'technician' && onAddTask && (
                                <button
                                    onClick={onAddTask}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-600 transition-colors"
                                >
                                    <CheckSquare size={16} /> Add Task
                                </button>
                            )}
                        </div>
                        <EmptyState
                            title="No tasks yet"
                            description="Add tasks to track progress on this job."
                            icon={<CheckSquare size={48} />}
                            action={activeRole !== 'technician' && onAddTask ? { label: 'Add Task', onClick: onAddTask } : undefined}
                        />
                    </div>
                )}

                {activeTab === 'history' && (
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Job History</h3>
                        {job.assignments && job.assignments.length > 0 ? (
                            <div className="relative pl-4 border-l-2 border-gray-100 space-y-8">
                                {job.assignments.map((assignment: any, index: number) => (
                                    <div key={index} className="relative">
                                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white bg-primary shadow-sm" />
                                        <div className="flex flex-col gap-1">
                                            <div className="text-sm font-semibold text-gray-900">
                                                Assigned to {assignment.user?.full_name || assignment.user?.email}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(assignment.started_at || Date.now()).toLocaleString()}
                                            </div>
                                            {assignment.notes && (
                                                <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 border border-gray-100">
                                                    {assignment.notes}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                title="No history"
                                description="No activity recorded for this job yet."
                                icon={<History size={48} />}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
