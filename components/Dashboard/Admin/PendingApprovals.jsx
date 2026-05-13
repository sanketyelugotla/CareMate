'use client'

import React, { useEffect, useState } from 'react';
import { UserCheck, Mail, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

function SkeletonRow() {
    return (
        <div className="border rounded-lg p-4 animate-pulse">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <div className="w-20 h-8 bg-muted rounded"></div>
                    <div className="w-20 h-8 bg-muted rounded"></div>
                </div>
            </div>
        </div>
    );
}

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

    return (
        <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] p-6 border border-border">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-foreground">Pending Doctor Approvals</h3>
                <Link href="/dashboard/admin/approve-doctors" className="text-blue-600 text-sm font-medium hover:underline">
                    View All
                </Link>
            </div>
            <div className="space-y-4">
                {loading ? (
                    <>
                        <SkeletonRow />
                        <SkeletonRow />
                        <SkeletonRow />
                    </>
                ) : pendingDoctors.length > 0 ? (
                    pendingDoctors.slice(0, 3).map((doctor) => (
                        <div key={doctor._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow border-border">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <UserCheck size={20} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">{doctor.name}</p>
                                        <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                                            <Mail size={12} />
                                            <span>{doctor.email}</span>
                                        </div>
                                        {doctor.specialization && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {doctor.specialization}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleApprove(doctor._id)}
                                        className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-xs font-medium flex items-center space-x-1 transition-colors"
                                    >
                                        <CheckCircle size={14} />
                                        <span>Approve</span>
                                    </button>
                                    <button
                                        onClick={() => handleReject(doctor._id)}
                                        className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-xs font-medium flex items-center space-x-1 transition-colors"
                                    >
                                        <XCircle size={14} />
                                        <span>Reject</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-muted-foreground text-center py-4">No pending doctor approvals</p>
                )}
            </div>
        </div>
    );
}
