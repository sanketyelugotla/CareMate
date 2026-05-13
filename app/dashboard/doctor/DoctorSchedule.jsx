'use client'

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, Edit, X, CheckCircle, AlertCircle } from 'lucide-react';
import dayjs from 'dayjs';

export default function DoctorScheduleDashboard() {
    const [activeTab, setActiveTab] = useState('free-slots');
    const [freeSlots, setFreeSlots] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [busyHours, setBusyHours] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [showSlotModal, setShowSlotModal] = useState(false);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [showBusyModal, setShowBusyModal] = useState(false);

    // Form states
    const [slotForm, setSlotForm] = useState({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        slotDurationMins: 30
    });

    const [leaveForm, setLeaveForm] = useState({
        startDate: '',
        endDate: '',
        leaveType: 'personal',
        reason: ''
    });

    const [busyForm, setBusyForm] = useState({
        date: dayjs().format('YYYY-MM-DD'),
        startTime: '13:00',
        endTime: '14:00',
        isRecurring: false,
        dayOfWeek: 1,
        reason: ''
    });

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const leaveTypes = ['vacation', 'sick', 'emergency', 'personal', 'conference', 'other'];

    useEffect(() => {
        loadScheduleData();
    }, []);

    const loadScheduleData = async () => {
        setLoading(true);
        try {
            const [slotsRes, leavesRes, busyRes] = await Promise.all([
                fetch('/api/doctors/schedule/free-slots', { credentials: 'include' }),
                fetch('/api/doctors/schedule/leave', { credentials: 'include' }),
                fetch('/api/doctors/schedule/busy-hours', { credentials: 'include' })
            ]);

            if (slotsRes.ok) setFreeSlots(await slotsRes.json());
            if (leavesRes.ok) setLeaves(await leavesRes.json());
            if (busyRes.ok) setBusyHours(await busyRes.json());
        } catch (err) {
            console.error('Error loading schedule:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSlot = async () => {
        try {
            const res = await fetch('/api/doctors/schedule/free-slots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(slotForm)
            });

            if (res.ok) {
                await loadScheduleData();
                setShowSlotModal(false);
                setSlotForm({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00', slotDurationMins: 30 });
            }
        } catch (err) {
            console.error('Error adding slot:', err);
            alert('Failed to add slot');
        }
    };

    const handleDeleteSlot = async (id) => {
        if (!confirm('Delete this slot?')) return;
        try {
            const res = await fetch(`/api/doctors/schedule/free-slots?id=${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) loadScheduleData();
        } catch (err) {
            console.error('Error deleting slot:', err);
        }
    };

    const handleAddLeave = async () => {
        if (!leaveForm.startDate || !leaveForm.endDate) {
            alert('Please select start and end dates');
            return;
        }

        try {
            const res = await fetch('/api/doctors/schedule/leave', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(leaveForm)
            });

            if (res.ok) {
                await loadScheduleData();
                setShowLeaveModal(false);
                setLeaveForm({ startDate: '', endDate: '', leaveType: 'personal', reason: '' });
            }
        } catch (err) {
            console.error('Error adding leave:', err);
            alert('Failed to add leave');
        }
    };

    const handleDeleteLeave = async (id) => {
        if (!confirm('Delete this leave?')) return;
        try {
            const res = await fetch(`/api/doctors/schedule/leave?id=${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) loadScheduleData();
        } catch (err) {
            console.error('Error deleting leave:', err);
        }
    };

    const handleAddBusyHour = async () => {
        try {
            const res = await fetch('/api/doctors/schedule/busy-hours', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(busyForm)
            });

            if (res.ok) {
                await loadScheduleData();
                setShowBusyModal(false);
                setBusyForm({
                    date: dayjs().format('YYYY-MM-DD'),
                    startTime: '13:00',
                    endTime: '14:00',
                    isRecurring: false,
                    dayOfWeek: 1,
                    reason: ''
                });
            }
        } catch (err) {
            console.error('Error adding busy hour:', err);
            alert('Failed to add busy hour');
        }
    };

    const handleDeleteBusyHour = async (id) => {
        if (!confirm('Delete this busy hour?')) return;
        try {
            const res = await fetch(`/api/doctors/schedule/busy-hours?id=${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) loadScheduleData();
        } catch (err) {
            console.error('Error deleting busy hour:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading schedule...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-3xl font-bold text-foreground mb-2">My Schedule</h2>
                <p className="text-muted-foreground">Manage your availability, leaves, and busy hours</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 mb-6 border-b border-border">
                <button
                    onClick={() => setActiveTab('free-slots')}
                    className={`px-6 py-3 font-medium transition-colors ${activeTab === 'free-slots'
                        ? 'text-primary border-b-2 border-blue-600'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Free Slots
                </button>
                <button
                    onClick={() => setActiveTab('leaves')}
                    className={`px-6 py-3 font-medium transition-colors ${activeTab === 'leaves'
                        ? 'text-primary border-b-2 border-blue-600'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Leaves
                </button>
                <button
                    onClick={() => setActiveTab('busy-hours')}
                    className={`px-6 py-3 font-medium transition-colors ${activeTab === 'busy-hours'
                        ? 'text-primary border-b-2 border-blue-600'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Busy Hours
                </button>
            </div>

            {/* Free Slots Tab */}
            {activeTab === 'free-slots' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-foreground">Weekly Availability</h3>
                        <button
                            onClick={() => setShowSlotModal(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Plus size={20} />
                            <span>Add Slot</span>
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {days.map((day, idx) => {
                            const daySlots = freeSlots.filter(s => s.dayOfWeek === idx);
                            return (
                                <div key={idx} className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] p-6">
                                    <h4 className="font-bold text-foreground mb-3">{day}</h4>
                                    {daySlots.length === 0 ? (
                                        <p className="text-muted-foreground text-sm">No slots configured</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {daySlots.map(slot => (
                                                <div key={slot._id} className="flex items-center justify-between bg-muted p-3 rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <Clock className="text-primary" size={18} />
                                                        <span className="font-medium text-foreground">
                                                            {slot.startTime} - {slot.endTime}
                                                        </span>
                                                        <span className="text-sm text-muted-foreground">
                                                            ({slot.slotDurationMins} min slots)
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteSlot(slot._id)}
                                                        className="text-red-600 hover:text-red-700 p-1"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Leaves Tab */}
            {activeTab === 'leaves' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-foreground">My Leaves</h3>
                        <button
                            onClick={() => setShowLeaveModal(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Plus size={20} />
                            <span>Add Leave</span>
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {leaves.length === 0 ? (
                            <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] p-12 text-center">
                                <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-muted-foreground">No leaves scheduled</p>
                            </div>
                        ) : (
                            leaves.map(leave => (
                                <div key={leave._id} className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold capitalize">
                                                    {leave.leaveType}
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    {dayjs(leave.startDate).format('MMM DD, YYYY')} - {dayjs(leave.endDate).format('MMM DD, YYYY')}
                                                </span>
                                            </div>
                                            {leave.reason && (
                                                <p className="text-muted-foreground text-sm">{leave.reason}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteLeave(leave._id)}
                                            className="text-red-600 hover:text-red-700 p-1"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Busy Hours Tab */}
            {activeTab === 'busy-hours' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-foreground">Busy Hours</h3>
                        <button
                            onClick={() => setShowBusyModal(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Plus size={20} />
                            <span>Add Busy Hour</span>
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {busyHours.length === 0 ? (
                            <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] p-12 text-center">
                                <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-muted-foreground">No busy hours set</p>
                            </div>
                        ) : (
                            busyHours.map(busy => (
                                <div key={busy._id} className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                {busy.isRecurring ? (
                                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                                                        Recurring - {days[busy.dayOfWeek]}
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                                                        {dayjs(busy.date).format('MMM DD, YYYY')}
                                                    </span>
                                                )}
                                                <span className="text-sm text-muted-foreground">
                                                    {busy.startTime} - {busy.endTime}
                                                </span>
                                            </div>
                                            {busy.reason && (
                                                <p className="text-muted-foreground text-sm">{busy.reason}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteBusyHour(busy._id)}
                                            className="text-red-600 hover:text-red-700 p-1"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Add Slot Modal */}
            {showSlotModal && (
                <div className="fixed inset-0 bg-background/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl shadow-[0_12px_32px_rgba(20,29,35,0.12)] max-w-3xl w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-foreground">Add Free Slot</h3>
                            <button onClick={() => setShowSlotModal(false)} className="text-muted-foreground hover:text-muted-foreground">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">Day of Week</label>
                                <select
                                    value={slotForm.dayOfWeek}
                                    onChange={(e) => setSlotForm({ ...slotForm, dayOfWeek: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {days.map((day, idx) => (
                                        <option key={idx} value={idx}>{day}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">Start Time</label>
                                    <input
                                        type="time"
                                        value={slotForm.startTime}
                                        onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">End Time</label>
                                    <input
                                        type="time"
                                        value={slotForm.endTime}
                                        onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">Slot Duration (minutes)</label>
                                <input
                                    type="number"
                                    value={slotForm.slotDurationMins}
                                    onChange={(e) => setSlotForm({ ...slotForm, slotDurationMins: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    min="15"
                                    step="15"
                                />
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={handleAddSlot}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Add Slot
                                </button>
                                <button
                                    onClick={() => setShowSlotModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-foreground rounded-lg hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Leave Modal */}
            {showLeaveModal && (
                <div className="fixed inset-0 bg-background/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl shadow-[0_12px_32px_rgba(20,29,35,0.12)] max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-foreground">Add Leave</h3>
                            <button onClick={() => setShowLeaveModal(false)} className="text-muted-foreground hover:text-muted-foreground">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={leaveForm.startDate}
                                        onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                                        min={dayjs().format('YYYY-MM-DD')}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">End Date</label>
                                    <input
                                        type="date"
                                        value={leaveForm.endDate}
                                        onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                                        min={leaveForm.startDate || dayjs().format('YYYY-MM-DD')}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">Leave Type</label>
                                <select
                                    value={leaveForm.leaveType}
                                    onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {leaveTypes.map(type => (
                                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">Reason (Optional)</label>
                                <textarea
                                    value={leaveForm.reason}
                                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    placeholder="Brief reason for leave..."
                                />
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={handleAddLeave}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Add Leave
                                </button>
                                <button
                                    onClick={() => setShowLeaveModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-foreground rounded-lg hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Busy Hour Modal */}
            {showBusyModal && (
                <div className="fixed inset-0 bg-background/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl shadow-[0_12px_32px_rgba(20,29,35,0.12)] max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-foreground">Add Busy Hour</h3>
                            <button onClick={() => setShowBusyModal(false)} className="text-muted-foreground hover:text-muted-foreground">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-2 mb-4">
                                <input
                                    type="checkbox"
                                    id="recurring"
                                    checked={busyForm.isRecurring}
                                    onChange={(e) => setBusyForm({ ...busyForm, isRecurring: e.target.checked })}
                                    className="w-4 h-4 text-primary rounded"
                                />
                                <label htmlFor="recurring" className="text-sm font-medium text-muted-foreground">
                                    Recurring Weekly (e.g., lunch break every Monday)
                                </label>
                            </div>

                            {busyForm.isRecurring ? (
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">Day of Week</label>
                                    <select
                                        value={busyForm.dayOfWeek}
                                        onChange={(e) => setBusyForm({ ...busyForm, dayOfWeek: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {days.map((day, idx) => (
                                            <option key={idx} value={idx}>{day}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">Date</label>
                                    <input
                                        type="date"
                                        value={busyForm.date}
                                        onChange={(e) => setBusyForm({ ...busyForm, date: e.target.value })}
                                        min={dayjs().format('YYYY-MM-DD')}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">Start Time</label>
                                    <input
                                        type="time"
                                        value={busyForm.startTime}
                                        onChange={(e) => setBusyForm({ ...busyForm, startTime: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-2">End Time</label>
                                    <input
                                        type="time"
                                        value={busyForm.endTime}
                                        onChange={(e) => setBusyForm({ ...busyForm, endTime: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">Reason (Optional)</label>
                                <input
                                    type="text"
                                    value={busyForm.reason}
                                    onChange={(e) => setBusyForm({ ...busyForm, reason: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Lunch break, Surgery, Meeting"
                                />
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={handleAddBusyHour}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Add Busy Hour
                                </button>
                                <button
                                    onClick={() => setShowBusyModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-foreground rounded-lg hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}