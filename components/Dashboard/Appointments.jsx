'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

export default function Appointments() {
    const router = useRouter();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard/upcoming-appointments')
            .then(res => res.json())
            .then(data => {
                setAppointments(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching appointments:', err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] p-6 animate-pulse">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-6 bg-muted rounded w-48"></div>
                    <div className="h-4 bg-muted rounded w-16"></div>
                </div>
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-muted rounded-full"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-muted rounded w-32"></div>
                                    <div className="h-3 bg-muted rounded w-24"></div>
                                </div>
                            </div>
                            <div className="text-right space-y-2">
                                <div className="h-4 bg-muted rounded w-24 ml-auto"></div>
                                <div className="h-3 bg-muted rounded w-16 ml-auto"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-foreground">Upcoming Appointments</h3>
                <button
                    className="text-primary text-sm font-medium hover:underline"
                    onClick={() => router.push('/dashboard/user/my-appointments')}
                >
                    View All
                </button>
            </div>
            <div className="space-y-4">
                {appointments.length > 0 ? (
                    appointments.map((apt) => (
                        <div key={apt._id} className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-accent transition-colors">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-2xl">
                                    {apt.doctor?.avatarUrl ? (
                                        <img src={apt.doctor.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        '👨‍⚕️'
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">{apt.doctor?.name || 'Doctor'}</p>
                                    <p className="text-sm text-muted-foreground">{apt.doctor?.specialization || 'General'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-foreground">{dayjs(apt.start).format('MMM DD, YYYY')}</p>
                                <p className="text-sm text-muted-foreground">{dayjs(apt.start).format('h:mm A')}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-muted-foreground text-center py-4">No upcoming appointments</p>
                )}
            </div>
        </div>
    );
}