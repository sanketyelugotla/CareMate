'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PendingApprovals() {
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingDoctors();
    }, []);

    const fetchPendingDoctors = () => {
        fetch('/api/dashboard/admin/pending-approvals')
            .then(res => res.json())
            .then(data => {
                setPendingDoctors(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching pending approvals:', err);
                setLoading(false);
            });
    };

    const handleApprove = async (doctorId) => {
        try {
            const response = await fetch(`/api/admin/approve-doctor/${doctorId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approved: true })
            });

            if (response.ok) {
                fetchPendingDoctors();
            } else {
                alert('Failed to approve doctor');
            }
        } catch (err) {
            console.error('Error approving doctor:', err);
            alert('Failed to approve doctor');
        }
    };

    const handleReject = async (doctorId) => {
        if (!confirm('Are you sure you want to reject this doctor?')) return;

        try {
            const response = await fetch(`/api/admin/approve-doctor/${doctorId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approved: false })
            });

            if (response.ok) {
                fetchPendingDoctors();
            } else {
                alert('Failed to reject doctor');
            }
        } catch (err) {
            console.error('Error rejecting doctor:', err);
            alert('Failed to reject doctor');
        }
    };

    if (loading) {
        return (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg font-body-md text-on-surface">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-stack-lg">Pending Doctor Approvals</h3>
                <p className="font-label-md text-label-md text-on-surface-variant">Loading...</p>
            </div>
        );
    }

    return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg font-body-md text-on-surface">
            <div className="flex justify-between items-center mb-stack-lg">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Pending Doctor Approvals</h3>
                <Link href="/admin/approve-doctors" className="font-label-md text-label-md font-bold text-primary hover:underline">
                    View All
                </Link>
            </div>
            <div className="space-y-stack-md">
                {pendingDoctors.length > 0 ? (
                    pendingDoctors.map((doctor) => (
                        <div key={doctor._id} className="border border-outline-variant bg-surface rounded-lg p-stack-md hover:bg-surface-container transition-colors">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-stack-md">
                                    <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-on-primary-container" style={{ fontSize: '20px' }}>how_to_reg</span>
                                    </div>
                                    <div>
                                        <p className="font-label-lg text-label-lg font-bold text-on-surface">{doctor.name}</p>
                                        <div className="flex items-center gap-stack-xs font-label-sm text-label-sm text-on-surface-variant mt-0.5">
                                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>mail</span>
                                            <span>{doctor.email}</span>
                                        </div>
                                        {doctor.specialization && (
                                            <p className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
                                                Specialization: {doctor.specialization}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-stack-sm">
                                    <button
                                        onClick={() => handleApprove(doctor._id)}
                                        className="px-stack-sm py-1 bg-secondary-container text-on-secondary-container rounded-md hover:opacity-80 font-label-sm text-label-sm font-bold flex items-center gap-stack-xs transition-opacity"
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
                                        <span>Approve</span>
                                    </button>
                                    <button
                                        onClick={() => handleReject(doctor._id)}
                                        className="px-stack-sm py-1 bg-error-container text-on-error-container rounded-md hover:opacity-80 font-label-sm text-label-sm font-bold flex items-center gap-stack-xs transition-opacity"
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>cancel</span>
                                        <span>Reject</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="font-label-md text-label-md text-on-surface-variant text-center py-stack-xl">No pending approvals</p>
                )}
            </div>
        </div>
    );
}
