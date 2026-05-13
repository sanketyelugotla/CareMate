import React, { useState } from 'react';
import { jsonFetch } from '@/lib/fetcher';
import { Activity, Calendar, FileText, User, LogOut, Settings, Brain, Bell } from 'lucide-react';
import MainDashboard from './Dashboard';
import Prediction from './Prediction';
import Appointments from './Appointments';
import MyAppointments from './MyAppointments';
import Reports from './Reports';
import Profile from './Profile';

export default function DashboardLayout() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
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
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-card shadow-lg flex flex-col">
                {/* Logo Section */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <Activity className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">CareMate</h1>
                            <p className="text-xs text-muted-foreground">Health Portal</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 py-4 overflow-y-auto">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-all ${activeTab === item.id
                                ? 'bg-muted text-primary border-r-4 border-blue-600'
                                : 'text-muted-foreground hover:bg-background'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.label}</span>
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
                                    onClick={() => setActiveTab('profile')}
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

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <div className="bg-card border-b border-border px-8 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">
                            {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {activeTab === 'dashboard' && "Here's your health overview"}
                            {activeTab === 'prediction' && "Get AI-powered health insights"}
                            {activeTab === 'appointments' && "Schedule with our specialists"}
                            {activeTab === 'my-appointments' && "View and manage your appointments"}
                            {activeTab === 'reports' && "Access your medical records"}
                            {activeTab === 'profile' && "Manage your account settings"}
                        </p>
                    </div>
                    <button className="relative p-2 hover:bg-muted rounded-full transition-colors">
                        <Bell size={24} className="text-muted-foreground" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8">
                    {activeTab === 'dashboard' && <MainDashboard />}
                    {activeTab === 'prediction' && <Prediction />}
                    {activeTab === 'appointments' && <Appointments />}
                    {activeTab === 'my-appointments' && <MyAppointments />}
                    {activeTab === 'reports' && <Reports />}
                    {activeTab === 'profile' && <Profile />}
                </div>
            </div>
        </div>
    );
}