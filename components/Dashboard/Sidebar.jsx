import React, { useState, useEffect } from 'react';
import { jsonFetch } from '@/lib/fetcher';
import { Activity, Calendar, FileText, User, LogOut, ChevronDown, Settings, Brain } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
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

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Activity },
        { id: 'prediction', label: 'AI Prediction', icon: Brain },
        { id: 'appointments', label: 'Book Appointment', icon: Calendar },
        { id: 'my-appointments', label: 'My Appointments', icon: FileText },
        { id: 'reports', label: 'Medical Reports', icon: FileText },
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
            <div className="w-64 bg-surface-container-low border-r border-outline-variant h-screen flex items-center justify-center">
                <p className="text-on-surface-variant font-label-md">Loading...</p>
            </div>
        );
    }

    return (
        <aside className="flex flex-col h-screen py-stack-lg px-stack-md sticky left-0 top-0 overflow-y-auto w-64 bg-surface-container-low border-r border-outline-variant">
            {/* Logo Section */}
            <div className="mb-stack-xl">
                <h1 className="font-headline-sm text-headline-sm font-extrabold text-primary">CareMate Portal</h1>
                <p className="font-label-md text-label-md text-on-surface-variant opacity-70">Patient Command</p>
            </div>

            {/* Navigation Menu */}
            <nav className="flex flex-col gap-stack-sm flex-grow">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex items-center gap-stack-md py-stack-sm px-stack-md rounded-lg transition-all ${
                            activeTab === item.id
                                ? 'bg-primary-container text-on-primary-container font-bold scale-[0.98]'
                                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                        }`}
                    >
                        <item.icon size={20} />
                        <span className="font-label-md text-label-md">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Profile Section */}
            <div className="mt-auto pt-stack-xl flex flex-col gap-stack-md border-t border-outline-variant">
                {user && (
                    <>
                        <div className="flex items-center gap-stack-md p-stack-sm rounded-lg bg-surface-container">
                            {user.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center">
                                    <span className="text-on-primary-container font-bold text-sm">
                                        {getInitials(user.name)}
                                    </span>
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="font-label-md text-label-md font-bold truncate">
                                    {user.name}
                                </p>
                                <p className="font-label-sm text-label-sm text-on-surface-variant truncate">
                                    {getRoleBadge(user.role).label}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-stack-xs">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className="w-full flex items-center gap-stack-md py-stack-sm px-stack-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all rounded-lg"
                            >
                                <Settings size={18} />
                                <span className="font-label-md text-label-md">Profile Settings</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full bg-error text-on-error font-label-md text-label-md py-stack-sm rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                            >
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </aside>
    );
}