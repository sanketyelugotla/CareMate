'use client'

import React, { useEffect, useState } from 'react';
import { Users, UserCheck, Calendar, TrendingUp } from 'lucide-react';

function SkeletonCard() {
    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 animate-pulse">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
            </div>
        </div>
    );
}

export default function AdminTopCards() {
    const [stats, setStats] = useState({
        totalDoctors: 0,
        totalPatients: 0,
        totalAppointments: 0,
        pendingApprovals: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard/admin/stats')
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching stats:', err);
                setLoading(false);
            });
    }, []);

    const cards = [
        {
            title: 'Total Doctors',
            description: `${stats.totalDoctors} registered`,
            icon: UserCheck,
            gradient: 'from-blue-50 to-blue-100',
            border: 'border-blue-200',
            textColor: 'text-blue-700',
            bgColor: 'bg-blue-500'
        },
        {
            title: 'Total Patients',
            description: `${stats.totalPatients} users`,
            icon: Users,
            gradient: 'from-green-50 to-green-100',
            border: 'border-green-200',
            textColor: 'text-green-700',
            bgColor: 'bg-green-500'
        },
        {
            title: 'Appointments (30d)',
            description: `${stats.totalAppointments} bookings`,
            icon: Calendar,
            gradient: 'from-purple-50 to-purple-100',
            border: 'border-purple-200',
            textColor: 'text-purple-700',
            bgColor: 'bg-purple-500'
        },
        {
            title: 'Pending Approvals',
            description: `${stats.pendingApprovals} doctors`,
            icon: TrendingUp,
            gradient: 'from-orange-50 to-orange-100',
            border: 'border-orange-200',
            textColor: 'text-orange-700',
            bgColor: 'bg-orange-500'
        }
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-4 gap-6 mb-8">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </div>
        );
    }

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
