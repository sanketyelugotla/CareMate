'use client'

import React, { useEffect, useState } from 'react';
import { jsonFetch } from '@/lib/fetcher';
import DoctorSidebar from '@/components/Dashboard/Doctor/Sidebar';
import AdminSidebar from '@/components/Dashboard/Admin/Sidebar';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        jsonFetch('/api/auth/me')
            .then(data => {
                setUser(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching user:', err);
                setLoading(false);
            });
    }, []);

    // Don't show sidebar for user dashboard pages
    const isUserDashboard = pathname?.startsWith('/dashboard/user');

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    // No sidebar for users or if not on a dashboard page
    if (!user || isUserDashboard || user.role === 'user') {
        return <>{children}</>;
    }

    // Show appropriate sidebar based on role
    return (
        <div className="flex min-h-screen bg-gray-50">
            {user.role === 'doctor' && <DoctorSidebar />}
            {user.role === 'admin' && <AdminSidebar />}
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
