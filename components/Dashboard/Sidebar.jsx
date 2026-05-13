import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jsonFetch } from '@/lib/fetcher';
import { Activity, Calendar, FileText, User, LogOut, ChevronDown, Settings, Brain } from 'lucide-react';

export default function Sidebar({ activeTab }) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
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

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/';
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    const handleTabChange = (tabId) => {
        if (tabId === 'dashboard') {
            router.push('/dashboard/user');
        } else {
            router.push(`/dashboard/user/${tabId}`);
        }
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Activity },
        { id: 'prediction', label: 'AI Prediction', icon: Brain },
        { id: 'appointments', label: 'Book Appointment', icon: Calendar },
        { id: 'my-appointments', label: 'My Appointments', icon: FileText },
    ];

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getRoleBadge = (role) => {
        const badges = {
            admin: { label: 'Admin', color: 'bg-purple-100 text-purple-700' },
            doctor: { label: 'Doctor', color: 'bg-accent text-blue-700' },
            user: { label: 'Patient', color: 'bg-green-100 text-green-700' }
        };
        return badges[role] || badges.user;
    };

    if (loading) {
        return (
            <div className="w-64 bg-card shadow-lg flex flex-col h-full animate-pulse">
                <div className="p-6 border-b border-gray-100 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-24"></div>
                        <div className="h-3 bg-muted rounded w-16"></div>
                    </div>
                </div>
                <div className="flex-1 py-4 space-y-2 px-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-10 bg-muted rounded-lg w-full"></div>
                    ))}
                </div>
                <div className="border-t border-gray-100 p-4">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-muted"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-20"></div>
                            <div className="h-3 bg-muted rounded w-24"></div>
                        </div>
                    </div>
                    <div className="h-6 w-16 bg-muted rounded-full mb-3"></div>
                    <div className="space-y-2">
                        <div className="h-8 bg-muted rounded w-full"></div>
                        <div className="h-8 bg-muted rounded w-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-64 bg-card shadow-lg flex flex-col h-full">
            {/* Logo Section */}
            <div
                className="p-6 border-b border-gray-100 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => window.location.href = '/'}
            >
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Activity className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">CareMate</h1>
                        <p className="text-xs text-muted-foreground">Patient Portal</p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 py-4 overflow-y-auto">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleTabChange(item.id)}
                        className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-all ${activeTab === item.id
                            ? 'bg-muted text-primary border-r-4 border-blue-600'
                            : 'text-muted-foreground hover:bg-background'
                            }`}
                    >
                        <item.icon size={18} />
                        <span className="font-medium text-sm">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Profile Section */}
            <div className="border-t border-gray-100">
                {user && (
                    <div className="p-4">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="relative">
                                {user.avatarUrl ? (
                                    <img
                                        src={user.avatarUrl}
                                        alt={user.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">
                                            {getInitials(user.name)}
                                        </span>
                                    </div>
                                )}
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">
                                    {user.name}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                        </div>

                        {/* Role Badge */}
                        <div className="mb-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getRoleBadge(user.role).color}`}>
                                {getRoleBadge(user.role).label}
                            </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            <button
                                onClick={() => handleTabChange('profile')}
                                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:bg-background rounded-lg transition-colors"
                            >
                                <Settings size={16} />
                                <span>Profile Settings</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <LogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}