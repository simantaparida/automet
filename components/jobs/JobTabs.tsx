import React, { useState } from 'react';
import {
    CheckSquare,
    Package,
    Paperclip,
    History,
    Plus
} from 'lucide-react';
import EmptyState from '@/components/EmptyState';

interface JobTabsProps {
    job: any;
    activeRole: string | null;
}

export default function JobTabs({ job, activeRole }: JobTabsProps) {
    const [activeTab, setActiveTab] = useState<'tasks' | 'parts' | 'attachments' | 'history'>('tasks');

    const tabs = [
        { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: 0 },
        { id: 'parts', label: 'Parts', icon: Package, count: 0 },
        { id: 'attachments', label: 'Attachments', icon: Paperclip, count: 0 },
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
                            {tab.count > 0 && (
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
                {activeTab === 'tasks' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Task Checklist</h3>
                            {activeRole !== 'technician' && (
                                <button className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-600 transition-colors">
                                    <Plus size={16} /> Add Task
                                </button>
                            )}
                        </div>
                        <EmptyState
                            title="No tasks yet"
                            description="Add tasks to track progress on this job."
                            icon={<CheckSquare size={48} />}
                            action={activeRole !== 'technician' ? { label: 'Add Task', onClick: () => { } } : undefined}
                        />
                    </div>
                )}

                {activeTab === 'parts' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Parts & Materials</h3>
                            <button className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-600 transition-colors">
                                <Plus size={16} /> Add Part
                            </button>
                        </div>
                        <EmptyState
                            title="No parts used"
                            description="Record parts and materials used for this job."
                            icon={<Package size={48} />}
                            action={{ label: 'Add Part', onClick: () => { } }}
                        />
                    </div>
                )}

                {activeTab === 'attachments' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Photos & Documents</h3>
                            <button className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-600 transition-colors">
                                <Plus size={16} /> Upload
                            </button>
                        </div>
                        <EmptyState
                            title="No attachments"
                            description="Upload photos or documents related to this job."
                            icon={<Paperclip size={48} />}
                            action={{ label: 'Upload File', onClick: () => { } }}
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
