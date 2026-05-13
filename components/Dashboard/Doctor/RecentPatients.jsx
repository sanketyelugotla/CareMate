'use client'

import React, { useEffect, useState } from 'react';
import { User, Mail, Phone } from 'lucide-react';

export default function RecentPatients() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard/doctor/recent-patients')
            .then(res => res.json())
            .then(data => {
                setPatients(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching patients:', err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] p-6">
                <h3 className="text-lg font-bold text-foreground mb-6">Recent Patients</h3>
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    return (
        <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-foreground">Recent Patients</h3>
                <button className="text-primary text-sm font-medium hover:underline">View All</button>
            </div>
            <div className="space-y-4">
                {patients.length > 0 ? (
                    patients.map((patient) => (
                        <div key={patient._id} className="flex items-center justify-between p-4 bg-background rounded-lg hover:bg-muted transition-colors">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                                    <User size={24} className="text-primary" />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">{patient.name}</p>
                                    <div className="flex items-center space-x-3 mt-1">
                                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                            <Mail size={12} />
                                            <span>{patient.email}</span>
                                        </div>
                                        {patient.phone && (
                                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                                <Phone size={12} />
                                                <span>{patient.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                {patient.age && <p className="text-sm text-muted-foreground">Age: {patient.age}</p>}
                                {patient.bloodGroup && (
                                    <p className="text-xs text-muted-foreground mt-1">{patient.bloodGroup}</p>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-muted-foreground text-center py-4">No recent patients</p>
                )}
            </div>
        </div>
    );
}
