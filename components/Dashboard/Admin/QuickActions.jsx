'use client'

import React from 'react';
import Link from 'next/link';

export default function QuickActions() {
    const actions = [
        {
            title: 'Approve Doctors',
            description: 'Review pending applications',
            icon: 'how_to_reg',
            color: 'text-primary',
            bgColor: 'bg-primary-container',
            href: '/admin/approve-doctors'
        },
        {
            title: 'View Analytics',
            description: 'System analytics & reports',
            icon: 'monitoring',
            color: 'text-secondary',
            bgColor: 'bg-secondary-container',
            href: '/analytics'
        },
        {
            title: 'All Appointments',
            description: 'Manage all bookings',
            icon: 'calendar_month',
            color: 'text-tertiary',
            bgColor: 'bg-tertiary-container',
            href: '/appointments'
        },
        {
            title: 'System Settings',
            description: 'Configure platform',
            icon: 'settings',
            color: 'text-on-surface-variant',
            bgColor: 'bg-surface-variant',
            href: '/settings'
        }
    ];

    return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg font-body-md text-on-surface">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-stack-md">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-stack-sm">
                {actions.map((action, idx) => (
                    <Link
                        key={idx}
                        href={action.href}
                        className={`flex flex-col items-center p-stack-md ${action.bgColor} rounded-lg hover:opacity-80 transition-opacity cursor-pointer`}
                    >
                        <span className={`material-symbols-outlined ${action.color}`} style={{ fontSize: '28px' }}>{action.icon}</span>
                        <p className="font-label-md text-label-md font-bold text-on-surface mt-stack-sm text-center">{action.title}</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5 text-center">{action.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
