'use client'

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Dashboard/Sidebar';

export default function UserDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    // /dashboard/user -> dashboard, /dashboard/user/[tab] -> [tab]
    const activeTab = pathname === '/dashboard/user'
        ? 'dashboard'
        : pathname.split('/').pop() || 'dashboard';

    return (
        <div className="flex h-screen bg-background">
            <Sidebar activeTab={activeTab} />
            <div className="flex-1 overflow-y-auto">
                <div className="p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
