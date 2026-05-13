'use client'

import React, { useEffect, useState } from 'react';
import { UserCheck, Mail, Phone } from 'lucide-react';

function SkeletonRow() {
    return (
        <div className="flex items-center justify-between p-4 bg-background rounded-lg animate-pulse">
            <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-6 bg-muted rounded w-16"></div>
            </div>
        </div>
    );
}

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

    return (
        <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] p-6 border border-border">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-foreground">Recently Registered Doctors</h3>
                <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
            </div>
            <div className="space-y-4">
                {loading ? (
                    <>
                        <SkeletonRow />
                        <SkeletonRow />
                        <SkeletonRow />
                    </>
                ) : doctors.length > 0 ? (
                    doctors.map((doctor) => (
                        <div key={doctor._id} className="flex items-center justify-between p-4 bg-background rounded-lg hover:bg-muted transition-colors border border-border">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <UserCheck size={24} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">{doctor.name}</p>
                                    <div className="flex items-center space-x-3 mt-1">
                                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                            <Mail size={12} />
                                            <span>{doctor.email}</span>
                                        </div>
                                        {doctor.phone && (
                                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                                <Phone size={12} />
                                                <span>{doctor.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                {doctor.specialization && (
                                    <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                                )}
                                {doctor.verified && (
                                    <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                        Verified
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-muted-foreground text-center py-4">No recent doctors</p>
                )}
            </div>
        </div>
    );
}
