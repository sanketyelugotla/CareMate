'use client'

import React from 'react';
import { BarChart, Users, Calendar, Settings } from 'lucide-react';
import Link from 'next/link';

export default function QuickActions() {
    const actions = [
        {
            title: 'Approve Doctors',
            description: 'Review pending applications',
            icon: Users,
            color: 'text-primary',
            bgColor: 'bg-muted',
            href: '/dashboard/admin/approve-doctors'
        },
        {
            title: 'View Analytics',
            description: 'System analytics & reports',
            icon: BarChart,
            color: 'text-green-500',
            bgColor: 'bg-green-50',
            href: '/dashboard/admin/analytics'
        },
        {
            title: 'All Appointments',
            description: 'Manage all bookings',
            icon: Calendar,
            color: 'text-purple-500',
            bgColor: 'bg-purple-50',
            href: '/dashboard/admin/appointments'
        },
        {
            title: 'System Settings',
            description: 'Configure platform',
            icon: Settings,
            color: 'text-muted-foreground',
            bgColor: 'bg-background',
            href: '/dashboard/admin/settings'
        }
    ];

    return (
        <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] p-6 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
                {actions.map((action, idx) => (
                    <Link
                        key={idx}
                        href={action.href}
                        className={`flex flex-col items-center p-4 ${action.bgColor} rounded-lg hover:shadow-md transition-shadow cursor-pointer border border-border`}
                    >
                        <action.icon size={24} className={action.color} />
                        <p className="font-semibold text-foreground text-sm mt-2 text-center">{action.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 text-center">{action.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
