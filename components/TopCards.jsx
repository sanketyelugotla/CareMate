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
        <div className="grid grid-cols-3 gap-6 mb-8">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className={`bg-gradient-to-br ${card.gradient} p-6 rounded-xl border ${card.border} hover:shadow-lg transition-shadow cursor-pointer`}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className={`${card.textColor} font-semibold mb-2`}>{card.title}</p>
                            <p className={`text-sm ${card.textColor.replace('700', '600')}`}>{card.description}</p>
                        </div>
                        <div className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                            <card.icon className="text-white" size={20} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}