'use client'

import React, { useState, useEffect } from 'react';
import { jsonFetch } from '@/lib/fetcher';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    UserCheck,
    Users,
    Calendar,
    BarChart3,
    Settings,
    LogOut,
    Shield
} from 'lucide-react';

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
        { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard, exact: true },
        { name: 'Approve Doctors', href: '/dashboard/admin/approve-doctors', icon: UserCheck, exact: true },
        { name: 'All Doctors', href: '/dashboard/admin/all-doctors', icon: Users, exact: true },
        { name: 'Appointments', href: '/dashboard/admin/appointments', icon: Calendar, exact: true },
        { name: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3, exact: true },
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
        <aside className="fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col">
            {/* Logo Section */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Shield className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">CareMate</h1>
                        <p className="text-xs text-muted-foreground">Admin Portal</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center space-x-3 px-6 py-3 transition-all ${isActive
                                ? 'bg-purple-50 text-purple-600 border-r-4 border-purple-600'
                                : 'text-muted-foreground hover:bg-background'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium text-sm">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile Section */}
            <div className="border-t border-gray-100">
                {loading ? (
                    <div className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">Loading...</p>
                    </div>
                ) : user ? (
                    <div className="p-4">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="relative">
                                {user.avatarUrl ? (
                                    <img
                                        src={user.avatarUrl}
                                        alt={getUserName(user)}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">
                                            {getInitials(user.name)}
                                        </span>
                                    </div>
                                )}
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">
                                    {getUserName(user)}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                        </div>

                        {/* Role Badge */}
                        <div className="mb-3">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                Admin
                            </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            <Link
                                href="/dashboard/admin/settings"
                                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:bg-background rounded-lg transition-colors"
                            >
                                <Settings size={16} />
                                <span>Settings</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <LogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </aside>
    );
}
