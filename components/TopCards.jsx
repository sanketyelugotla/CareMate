'use client'

import React, { useEffect, useState } from 'react';
import { Activity, Calendar, FileText } from 'lucide-react';

export default function TopCards() {
    const [stats, setStats] = useState({
        upcomingAppointments: 0,
        totalPredictions: 0,
        activeReminders: 0
    });

    useEffect(() => {
        fetch('/api/dashboard/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error('Error fetching stats:', err));
    }, []);

    const cards = [
        {
            title: 'AI Disease Prediction',
            description: `${stats.totalPredictions} predictions made`,
            icon: Activity,
            gradient: 'from-blue-50 to-blue-100',
            border: 'border-blue-200',
            textColor: 'text-blue-700',
            bgColor: 'bg-blue-500'
        },
        {
            title: 'Book Appointment',
            description: `${stats.upcomingAppointments} upcoming`,
            icon: Calendar,
            gradient: 'from-green-50 to-green-100',
            border: 'border-green-200',
            textColor: 'text-green-700',
            bgColor: 'bg-green-500'
        },
        {
            title: 'My Reminders',
            description: `${stats.activeReminders} active reminders`,
            icon: FileText,
            gradient: 'from-purple-50 to-purple-100',
            border: 'border-purple-200',
            textColor: 'text-purple-700',
            bgColor: 'bg-purple-500'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-stack-lg">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className="bg-surface-container-lowest p-stack-lg rounded-xl border border-outline-variant hover:shadow-sm transition-shadow cursor-pointer"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-on-surface font-headline-sm text-headline-sm mb-stack-xs font-bold">{card.title}</p>
                            <p className="font-label-md text-label-md text-on-surface-variant">{card.description}</p>
                        </div>
                        <div className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center shrink-0">
                            <card.icon className="text-on-primary-container" size={24} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}