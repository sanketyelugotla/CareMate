'use client'

import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Clock, User, CheckCircle, XCircle } from 'lucide-react';

export default function TodayAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = () => {
        fetch('/api/dashboard/doctor/today-appointments')
            .then(res => res.json())
            .then(data => {
                // Ensure completed appointments are not listed as today's active appointments
                setAppointments((data || []).filter(a => a.status !== 'completed'));
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching appointments:', err);
                setLoading(false);
            });
    };

    const handleUpdateStatus = async (appointmentId, newStatus) => {
        try {
            const response = await fetch(`/api/appointments/${appointmentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                fetchAppointments();
            } else {
                alert('Failed to update appointment status');
            }
        } catch (err) {
            console.error('Error updating appointment:', err);
            alert('Failed to update appointment status');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            confirmed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmed' },
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
            cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
            completed: { bg: 'bg-accent', text: 'text-blue-700', label: 'Completed' }
        };
        const badge = badges[status] || badges.pending;
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] p-6">
                <h3 className="text-lg font-bold text-foreground mb-6">Today's Appointments</h3>
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-foreground">Today's Appointments</h3>
                <span className="text-sm text-muted-foreground">{appointments.length} total</span>
            </div>
            <div className="space-y-4">
                {appointments.length > 0 ? (
                    appointments.map((apt) => (
                        <div key={apt._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                                        <User size={20} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">{apt.patient?.name || 'Patient'}</p>
                                        <p className="text-sm text-muted-foreground">{apt.patient?.email}</p>
                                    </div>
                                </div>
                                {getStatusBadge(apt.status)}
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-2 text-muted-foreground">
                                    <Clock size={16} />
                                    <span>{dayjs(apt.start).format('h:mm A')} - {dayjs(apt.end).format('h:mm A')}</span>
                                </div>
                                {apt.status === 'confirmed' && (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleUpdateStatus(apt._id, 'completed')}
                                            className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-xs font-medium flex items-center space-x-1"
                                        >
                                            <CheckCircle size={14} />
                                            <span>Complete</span>
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(apt._id, 'cancelled')}
                                            className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-xs font-medium flex items-center space-x-1"
                                        >
                                            <XCircle size={14} />
                                            <span>Cancel</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-muted-foreground text-center py-8">No appointments scheduled for today</p>
                )}
            </div>
        </div>
    );
}
