'use client'

import React, { useEffect, useState } from 'react';

export default function RecentDoctors() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard/admin/recent-doctors')
            .then(res => res.json())
            .then(data => {
                setDoctors(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching doctors:', err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg font-body-md text-on-surface">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-stack-lg">Recently Registered Doctors</h3>
                <p className="font-label-md text-label-md text-on-surface-variant">Loading...</p>
            </div>
        );
    }

    return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg font-body-md text-on-surface">
            <div className="flex justify-between items-center mb-stack-lg">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Recently Registered Doctors</h3>
                <button className="font-label-md text-label-md font-bold text-primary hover:underline">View All</button>
            </div>
            <div className="space-y-stack-sm">
                {doctors.length > 0 ? (
                    doctors.map((doctor) => (
                        <div key={doctor._id} className="flex items-center justify-between p-stack-md bg-surface rounded-lg hover:bg-surface-container transition-colors">
                            <div className="flex items-center gap-stack-md">
                                <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-on-primary-container" style={{ fontSize: '24px' }}>how_to_reg</span>
                                </div>
                                <div>
                                    <p className="font-label-lg text-label-lg font-bold text-on-surface">{doctor.name}</p>
                                    <div className="flex items-center gap-stack-sm mt-0.5">
                                        <div className="flex items-center gap-stack-xs font-label-sm text-label-sm text-on-surface-variant">
                                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>mail</span>
                                            <span>{doctor.email}</span>
                                        </div>
                                        {doctor.phone && (
                                            <div className="flex items-center gap-stack-xs font-label-sm text-label-sm text-on-surface-variant">
                                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>phone</span>
                                                <span>{doctor.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                {doctor.specialization && (
                                    <p className="font-label-sm text-label-sm text-on-surface-variant">{doctor.specialization}</p>
                                )}
                                {doctor.verified && (
                                    <span className="inline-block mt-stack-xs px-stack-sm py-1 bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-bold rounded-full">
                                        Verified
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="font-label-md text-label-md text-on-surface-variant text-center py-stack-lg">No recent doctors</p>
                )}
            </div>
        </div>
    );
}
