'use client'

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

export default function Reminders() {
    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/reminders')
            .then(res => res.json())
            .then(data => {
                // Get next upcoming reminder for each medicine
                const upcomingReminders = data
                    .filter(r => r.active && r.schedule && r.schedule.length > 0)
                    .map(r => {
                        const nextSchedule = r.schedule
                            .map(s => new Date(s))
                            .filter(d => d > new Date())
                            .sort((a, b) => a - b)[0];
                        return {
                            ...r,
                            nextSchedule
                        };
                    })
                    .filter(r => r.nextSchedule)
                    .slice(0, 5);
                setReminders(upcomingReminders);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching reminders:', err);
                setLoading(false);
            });
    }, []);

    const getTimeDisplay = (date) => {
        const diff = dayjs(date).diff(dayjs(), 'hour');
        if (diff < 24) {
            return `Today • ${dayjs(date).format('h:mm A')}`;
        } else if (diff < 48) {
            return `Tomorrow • ${dayjs(date).format('h:mm A')}`;
        } else {
            return `${dayjs(date).format('MMM DD')} • ${dayjs(date).format('h:mm A')}`;
        }
    };

    if (loading) {
        return (
            <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] p-6 animate-pulse">
                <h3 className="text-lg font-bold text-foreground mb-4">Reminders</h3>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                            <div className="w-8 h-8 bg-muted rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-muted rounded w-24"></div>
                                <div className="h-3 bg-muted rounded w-16"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Reminders</h3>
            <div className="space-y-3">
                {reminders.length > 0 ? (
                    reminders.map((reminder) => (
                        <div key={reminder._id} className="flex items-center space-x-3 p-3 bg-orange-100 rounded-lg">
                            <span className="text-2xl">💊</span>
                            <div className="flex-1">
                                <p className="font-semibold text-foreground text-sm">{reminder.medicineName}</p>
                                <p className="text-xs text-muted-foreground">
                                    {reminder.nextSchedule && getTimeDisplay(reminder.nextSchedule)}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-muted-foreground text-center py-4 text-sm">No upcoming reminders</p>
                )}
            </div>
        </div>
    );
}