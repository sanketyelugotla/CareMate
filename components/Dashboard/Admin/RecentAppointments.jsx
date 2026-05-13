'use client'

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

export default function RecentAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/appointments')
            .then(res => res.json())
            .then(data => {
                // Get recent appointments
                const recent = data
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 10);
                setAppointments(recent);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching appointments:', err);
                setLoading(false);
            });
    }, []);

    const getStatusBadge = (status) => {
        const badges = {
            confirmed: { bg: 'bg-secondary-container', text: 'text-on-secondary-container', label: 'Confirmed' },
            pending: { bg: 'bg-tertiary-container', text: 'text-on-tertiary-container', label: 'Pending' },
            cancelled: { bg: 'bg-error-container', text: 'text-on-error-container', label: 'Cancelled' },
            completed: { bg: 'bg-primary-container', text: 'text-on-primary-container', label: 'Completed' }
        };
        const badge = badges[status] || badges.pending;
        return (
            <span className={`px-stack-sm py-1 rounded font-label-sm text-label-sm font-bold ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg font-body-md text-on-surface">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-stack-lg">Recent Appointments</h3>
                <p className="font-label-md text-label-md text-on-surface-variant">Loading...</p>
            </div>
        );
    }

    return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg font-body-md text-on-surface">
            <div className="flex justify-between items-center mb-stack-lg">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Recent Appointments</h3>
                <button className="font-label-md text-label-md font-bold text-primary hover:underline">View All</button>
            </div>
            <div className="space-y-stack-sm">
                {appointments.length > 0 ? (
                    appointments.map((apt) => (
                        <div key={apt._id} className="border border-outline-variant bg-surface rounded-lg p-stack-md hover:bg-surface-container transition-colors">
                            <div className="flex items-center justify-between mb-stack-xs">
                                <div className="flex items-center gap-stack-xs text-on-surface-variant">
                                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>calendar_month</span>
                                    <span className="font-label-md text-label-md">
                                        {dayjs(apt.start).format('MMM DD, YYYY')}
                                    </span>
                                </div>
                                {getStatusBadge(apt.status)}
                            </div>
                            <div className="flex items-center gap-stack-xs font-label-sm text-label-sm text-on-surface-variant">
                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>schedule</span>
                                <span>{dayjs(apt.start).format('h:mm A')}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="font-label-md text-label-md text-on-surface-variant text-center py-stack-lg">No recent appointments</p>
                )}
            </div>
        </div>
    );
}
