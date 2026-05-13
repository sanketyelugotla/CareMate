"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Calendar,
    Settings,
    LogOut,
    Activity,
    Stethoscope
} from 'lucide-react';

export default function DoctorSidebar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeTabParam = searchParams?.get('tab') || null
    const [user, setUser] = useState(null);
    // no initial loading flash — render profile section when user is available
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const { jsonFetch } = await import('@/lib/fetcher')
                const data = await jsonFetch('/api/auth/me')
                setUser(data)
            } catch (err) {
                console.error('Error fetching user:', err)
            } finally {
                setLoading(false)
            }
        })()
    }, []);

    const router = useRouter()

    // restore last-open tab for doctors if no tab param is present
    useEffect(() => {
        try {
            const currentTab = searchParams?.get('tab')
            if (!currentTab && typeof window !== 'undefined') {
                const stored = window.localStorage.getItem('doctor_last_tab')
                const allowedTabs = ['dashboard', 'appointments', 'schedule', 'slots', 'profile']
                if (stored && stored !== 'dashboard' && allowedTabs.includes(stored)) {
                    router.replace(`/dashboard/doctor?tab=${stored}`)
                    // show a small toast to indicate we restored the last tab
                    setRestoredTab(stored)
                    setShowRestoreToast(true)
                    setTimeout(() => setShowRestoreToast(false), 3000)
                }
            }
        } catch (err) {
            // ignore
        }
    }, [searchParams, router])

    const [restoredTab, setRestoredTab] = useState(null)
    const [showRestoreToast, setShowRestoreToast] = useState(false)

    const navigation = [
        { id: 'dashboard', name: 'Dashboard', href: '/dashboard/doctor?tab=dashboard', icon: LayoutDashboard },
        { id: 'appointments', name: 'Appointments', href: '/dashboard/doctor?tab=appointments', icon: Calendar },
        { id: 'slots', name: 'Slots', href: '/dashboard/doctor?tab=schedule', icon: Activity },
    ];

    const getInitials = (name) => {
        if (!name) return 'DR';
        const fullName = typeof name === 'string' ? name : `${name.first || ''} ${name.last || ''}`;
        return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getUserName = (user) => {
        if (!user) return 'Doctor';
        if (typeof user.name === 'string') return user.name;
        return `${user.name?.first || ''} ${user.name?.last || ''}`.trim() || 'Doctor';
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
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Stethoscope className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">CareMate</h1>
                        <p className="text-xs text-muted-foreground">Doctor Portal</p>
                    </div>
                </div>
                {showRestoreToast && (
                    <div className="mt-3 p-2 bg-muted text-blue-700 rounded text-sm">
                        Restored last-open tab: <strong className="capitalize">{restoredTab}</strong>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = (activeTabParam === (item.id || 'dashboard')) || (!activeTabParam && item.id === 'dashboard');

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => {
                                try { window.localStorage.setItem('doctor_last_tab', item.id) } catch (e) { }
                            }}
                            className={`flex items-center space-x-3 px-6 py-3 transition-all ${isActive
                                ? 'bg-muted text-primary border-r-4 border-blue-600'
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
                {user ? (
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
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
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
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-accent text-blue-700">
                                Doctor
                            </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            <Link
                                href="/dashboard/doctor?tab=profile"
                                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:bg-background rounded-lg transition-colors"
                            >
                                <Settings size={16} />
                                <span>Profile Settings</span>
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
