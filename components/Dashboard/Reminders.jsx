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
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg">
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-stack-lg">Reminders</h3>
                <p className="text-on-surface-variant font-label-md text-label-md">Loading...</p>
            </div>
        );
    }

    return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg">
            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-stack-sm mb-stack-md font-bold">
                <span className="material-symbols-outlined text-error" data-icon="notifications">notifications</span>
                Reminders
            </h3>
            <div className="space-y-stack-sm">
                {reminders.length > 0 ? (
                    reminders.map((reminder) => (
                        <div key={reminder._id} className="flex items-center space-x-3 p-stack-sm bg-error-container rounded-lg">
                            <span className="text-2xl" role="img" aria-label="pill">💊</span>
                            <div className="flex-1">
                                <p className="font-label-md text-label-md font-bold text-on-error-container">{reminder.medicineName}</p>
                                <p className="font-label-sm text-label-sm text-on-error-container opacity-80">
                                    {reminder.nextSchedule && getTimeDisplay(reminder.nextSchedule)}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-on-surface-variant text-center py-4 font-body-md text-body-md">No upcoming reminders</p>
                )}
            </div>
        </div>
    );
}