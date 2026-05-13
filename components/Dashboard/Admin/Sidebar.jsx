'use client'

import React, { useState, useEffect } from 'react';
import { jsonFetch } from '@/lib/fetcher';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
    const pathname = usePathname();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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

    const navigation = [
        { name: 'Dashboard', href: '/dashboard/admin', icon: 'dashboard', exact: true },
        { name: 'Approve Doctors', href: '/admin/approve-doctors', icon: 'how_to_reg', exact: true },
        { name: 'All Doctors', href: '/doctors', icon: 'stethoscope', exact: true },
        { name: 'Appointments', href: '/appointments', icon: 'calendar_month', exact: true },
        { name: 'Analytics', href: '/analytics', icon: 'monitoring', exact: true },
        { name: 'Settings', href: '/settings', icon: 'settings', exact: true },
    ];

    const getInitials = (name) => {
        if (!name) return 'AD';
        const fullName = typeof name === 'string' ? name : `${name.first || ''} ${name.last || ''}`;
        return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getUserName = (user) => {
        if (!user) return 'Admin';
        if (typeof user.name === 'string') return user.name;
        return `${user.name?.first || ''} ${user.name?.last || ''}`.trim() || 'Admin';
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/';
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container-lowest border-r border-outline-variant flex flex-col font-body-md">
            {/* Logo Section */}
            <div className="p-stack-lg border-b border-outline-variant">
                <div className="flex items-center gap-stack-sm">
                    <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-primary-container" style={{ fontSize: '24px' }}>admin_panel_settings</span>
                    </div>
                    <div>
                        <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">CareMate</h1>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">Admin Portal</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-stack-md overflow-y-auto px-stack-sm">
                {navigation.map((item) => {
                    const isActive = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-stack-md px-stack-md py-stack-sm mb-1 transition-all rounded-lg font-label-md text-label-md ${
                                isActive
                                    ? 'bg-primary text-on-primary font-bold'
                                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                            }`}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile Section */}
            <div className="border-t border-outline-variant">
                {loading ? (
                    <div className="p-stack-md text-center">
                        <p className="font-label-md text-label-md text-on-surface-variant">Loading...</p>
                    </div>
                ) : user ? (
                    <div className="p-stack-md">
                        <div className="flex items-center gap-stack-sm mb-stack-md">
                            <div className="relative">
                                {user.avatarUrl ? (
                                    <img
                                        src={user.avatarUrl}
                                        alt={getUserName(user)}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center">
                                        <span className="text-on-primary-container font-label-lg font-bold">
                                            {getInitials(user.name)}
                                        </span>
                                    </div>
                                )}
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface-container-lowest rounded-full"></span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-label-md text-label-md font-bold text-on-surface truncate">
                                    {getUserName(user)}
                                </p>
                                <p className="font-label-sm text-label-sm text-on-surface-variant truncate">{user.email}</p>
                            </div>
                        </div>

                        {/* Role Badge */}
                        <div className="mb-stack-md">
                            <span className="inline-flex items-center px-stack-sm py-1 rounded font-label-sm text-label-sm font-bold bg-secondary-container text-on-secondary-container">
                                Admin
                            </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-stack-xs">
                            <Link
                                href="/settings"
                                className="w-full flex items-center gap-stack-sm px-stack-sm py-stack-sm font-label-md text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>settings</span>
                                <span>System Settings</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-stack-sm px-stack-sm py-stack-sm font-label-md text-label-md text-error hover:bg-error-container rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </aside>
    );
}
