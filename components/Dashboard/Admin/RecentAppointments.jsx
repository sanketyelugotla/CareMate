'use client'

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Calendar, Clock } from 'lucide-react';

function SkeletonRow() {
    return (
        <div className="border rounded-lg p-3 animate-pulse border-border">
            <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-6 bg-muted rounded w-1/4"></div>
            </div>
            <div className="h-3 bg-muted rounded w-1/4"></div>
        </div>
    );
}

export default function RecentAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/appointments')
            .then(res => res.json())
            .then(data => {
                // Handle both array and object { items: [...] } responses
                const appointmentsArray = Array.isArray(data) ? data : (data?.items || []);
                const recent = appointmentsArray
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
            confirmed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmed' },
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
            cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
            completed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed' }
        };
        const badge = badges[status] || badges.pending;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    return (
        <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] p-6 border border-border">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-foreground">Recent Appointments</h3>
                <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
            </div>
            <div className="space-y-3">
                {loading ? (
                    <>
                        <SkeletonRow />
                        <SkeletonRow />
                        <SkeletonRow />
                    </>
                ) : appointments.length > 0 ? (
                    appointments.map((apt) => (
                        <div key={apt._id} className="border rounded-lg p-3 hover:shadow-md transition-shadow border-border">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    <Calendar size={14} className="text-gray-400" />
                                    <span className="text-sm text-muted-foreground">
                                        {dayjs(apt.start).format('MMM DD, YYYY')}
                                    </span>
                                </div>
                                {getStatusBadge(apt.status)}
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <Clock size={12} />
                                <span>{dayjs(apt.start).format('h:mm A')}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-muted-foreground text-center py-4">No recent appointments</p>
                )}
            </div>
        </div>
    );
}
