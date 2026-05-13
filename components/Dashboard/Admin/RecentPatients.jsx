'use client'

import React, { useEffect, useState } from 'react';

export default function RecentPatients() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard/admin/recent-patients')
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
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg font-body-md text-on-surface">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-stack-lg">Recently Registered Patients</h3>
                <p className="font-label-md text-label-md text-on-surface-variant">Loading...</p>
            </div>
        );
    }

    return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg font-body-md text-on-surface">
            <div className="flex justify-between items-center mb-stack-lg">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Recently Registered Patients</h3>
                <button className="font-label-md text-label-md font-bold text-primary hover:underline">View All</button>
            </div>
            <div className="space-y-stack-sm">
                {patients.length > 0 ? (
                    patients.map((patient) => (
                        <div key={patient._id} className="flex items-center justify-between p-stack-md bg-surface rounded-lg hover:bg-surface-container transition-colors">
                            <div className="flex items-center gap-stack-md">
                                <div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-on-secondary-container" style={{ fontSize: '24px' }}>person</span>
                                </div>
                                <div>
                                    <p className="font-label-lg text-label-lg font-bold text-on-surface">{patient.name}</p>
                                    <div className="flex items-center gap-stack-sm mt-0.5">
                                        <div className="flex items-center gap-stack-xs font-label-sm text-label-sm text-on-surface-variant">
                                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>mail</span>
                                            <span>{patient.email}</span>
                                        </div>
                                        {patient.phone && (
                                            <div className="flex items-center gap-stack-xs font-label-sm text-label-sm text-on-surface-variant">
                                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>phone</span>
                                                <span>{patient.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                {patient.age && <p className="font-label-sm text-label-sm text-on-surface-variant">Age: {patient.age}</p>}
                                {patient.bloodGroup && (
                                    <p className="font-label-sm text-label-sm font-bold text-on-surface-variant mt-0.5">{patient.bloodGroup}</p>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="font-label-md text-label-md text-on-surface-variant text-center py-stack-lg">No recent patients</p>
                )}
            </div>
        </div>
    );
}
