'use client'

import React, { useEffect, useState } from 'react';
import { Calendar, Users, CheckCircle, TrendingUp } from 'lucide-react';

export default function DoctorTopCards() {
    const [stats, setStats] = useState({
        todayAppointments: 0,
        totalPatients: 0,
        completedToday: 0,
        upcomingAppointments: 0
    });

    useEffect(() => {
        fetch('/api/dashboard/doctor/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error('Error fetching stats:', err));
    }, []);

    const cards = [
        {
            title: "Today's Appointments",
            description: `${stats.todayAppointments} scheduled`,
            icon: Calendar,
            gradient: 'from-blue-50 to-blue-100',
            border: 'border-blue-200',
            textColor: 'text-blue-700',
            bgColor: 'bg-muted0'
        },
        {
            title: 'Total Patients',
            description: `${stats.totalPatients} patients`,
            icon: Users,
            gradient: 'from-green-50 to-green-100',
            border: 'border-green-200',
            textColor: 'text-green-700',
            bgColor: 'bg-green-500'
        },
        {
            title: 'Completed Today',
            description: `${stats.completedToday} appointments`,
            icon: CheckCircle,
            gradient: 'from-purple-50 to-purple-100',
            border: 'border-purple-200',
            textColor: 'text-purple-700',
            bgColor: 'bg-purple-500'
        },
        {
            title: 'Upcoming',
            description: `${stats.upcomingAppointments} scheduled`,
            icon: TrendingUp,
            gradient: 'from-orange-50 to-orange-100',
            border: 'border-orange-200',
            textColor: 'text-orange-700',
            bgColor: 'bg-orange-500'
        }
    ];

    return (
        <div className="grid grid-cols-4 gap-6 mb-8">
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
