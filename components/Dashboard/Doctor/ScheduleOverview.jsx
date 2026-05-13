'use client'

import React from 'react';
import { Calendar, Clock, Coffee } from 'lucide-react';

export default function ScheduleOverview({ onManageClick }) {
    const scheduleTips = [
        {
            title: 'Manage Free Slots',
            description: 'Set your available time slots for appointments',
            icon: Calendar,
            color: 'text-primary',
            bgColor: 'bg-muted'
        },
        {
            title: 'Set Busy Hours',
            description: 'Block time for breaks and personal tasks',
            icon: Coffee,
            color: 'text-orange-500',
            bgColor: 'bg-orange-50'
        },
        {
            title: 'Mark Leave Days',
            description: 'Schedule your vacations and time off',
            icon: Clock,
            color: 'text-green-500',
            bgColor: 'bg-green-50'
        }
    ];

    return (
        <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-foreground">Schedule Management</h3>
                <button
                    onClick={onManageClick}
                    className="text-primary text-sm font-medium hover:underline cursor-pointer"
                >
                    Manage Schedule
                </button>
            </div>
            <div className="space-y-4">
                {scheduleTips.map((tip, idx) => (
                    <div key={idx} className={`flex space-x-3 p-4 ${tip.bgColor} rounded-lg`}>
                        <div className={`${tip.color} mt-1`}>
                            <tip.icon size={20} />
                        </div>
                        <div>
                            <p className="font-semibold text-foreground text-sm">{tip.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{tip.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}