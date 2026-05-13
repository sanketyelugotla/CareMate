'use client'

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

export default function Appointments() {
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
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg">
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-stack-lg">Upcoming Appointments</h3>
                <p className="text-on-surface-variant font-label-md text-label-md">Loading...</p>
            </div>
        );
    }

    return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg">
            <div className="flex justify-between items-center mb-stack-lg">
                <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-stack-sm font-bold">
                    <span className="material-symbols-outlined text-primary" data-icon="calendar_today" style={{fontVariationSettings: "'FILL' 1"}}>calendar_today</span>
                    Upcoming Appointments
                </h3>
                <button className="text-primary font-label-md text-label-md hover:underline">View All</button>
            </div>
            <div className="space-y-stack-md">
                {appointments.length > 0 ? (
                    appointments.map((apt) => (
                        <div key={apt._id} className="flex items-center justify-between p-stack-md bg-surface border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center text-2xl shrink-0">
                                    {apt.doctor?.avatarUrl ? (
                                        <img src={apt.doctor.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-on-primary-container">person</span>
                                    )}
                                </div>
                                <div>
                                    <p className="font-label-md text-label-md font-bold text-on-surface">{apt.doctor?.name || 'Doctor'}</p>
                                    <p className="font-label-sm text-label-sm text-primary">{apt.doctor?.specialization || 'General'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-body-md text-body-md font-bold text-on-surface">{dayjs(apt.start).format('MMM DD, YYYY')}</p>
                                <p className="font-label-sm text-label-sm text-on-surface-variant">{dayjs(apt.start).format('h:mm A')}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-on-surface-variant text-center py-4 font-body-md text-body-md">No upcoming appointments</p>
                )}
            </div>
        </div>
    );
}