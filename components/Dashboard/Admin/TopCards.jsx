'use client'

import React, { useEffect, useState } from 'react';

export default function AdminTopCards() {
    const [stats, setStats] = useState({
        totalDoctors: 0,
        totalPatients: 0,
        totalAppointments: 0,
        pendingApprovals: 0
    });

    useEffect(() => {
        fetch('/api/dashboard/admin/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error('Error fetching stats:', err));
    }, []);

    const cards = [
        {
            title: 'Total Doctors',
            description: `${stats.totalDoctors} registered`,
            icon: 'how_to_reg',
            textColor: 'text-primary',
            bgColor: 'bg-primary-container',
            iconColor: 'text-on-primary-container'
        },
        {
            title: 'Total Patients',
            description: `${stats.totalPatients} users`,
            icon: 'group',
            textColor: 'text-secondary',
            bgColor: 'bg-secondary-container',
            iconColor: 'text-on-secondary-container'
        },
        {
            title: 'Appointments (30d)',
            description: `${stats.totalAppointments} bookings`,
            icon: 'calendar_month',
            textColor: 'text-tertiary',
            bgColor: 'bg-tertiary-container',
            iconColor: 'text-on-tertiary-container'
        },
        {
            title: 'Pending Approvals',
            description: `${stats.pendingApprovals} doctors`,
            icon: 'pending_actions',
            textColor: 'text-error',
            bgColor: 'bg-error-container',
            iconColor: 'text-on-error-container'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-stack-xl font-body-md text-on-surface">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className="bg-surface-container-lowest p-stack-lg rounded-xl border border-outline-variant hover:bg-surface-container transition-colors cursor-pointer"
                >
                    <div className="flex items-start justify-between mb-stack-md">
                        <div className={`w-12 h-12 ${card.bgColor} rounded-full flex items-center justify-center`}>
                            <span className={`material-symbols-outlined ${card.iconColor}`} style={{ fontSize: '24px' }}>
                                {card.icon}
                            </span>
                        </div>
                    </div>
                    <div>
                        <p className={`font-headline-sm text-headline-sm font-bold ${card.textColor}`}>{card.title}</p>
                        <p className="font-label-md text-label-md text-on-surface-variant mt-stack-xs">{card.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
