'use client'

import React from 'react';

export default function HealthAnalytics() {
    const appointmentData = [4, 3, 5, 3, 4, 3];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg">
            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-stack-sm mb-stack-lg font-bold">
                <span className="material-symbols-outlined text-secondary" data-icon="monitoring">monitoring</span>
                Health Analytics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
                {/* Appointments Chart */}
                <div className="bg-surface p-stack-md rounded-lg border border-outline-variant">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-label-md text-label-md text-on-surface font-bold">Appointments per Month</h4>
                    </div>
                    <div className="flex items-end justify-between h-40 space-x-2">
                        {appointmentData.map((value, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center">
                                <div className="w-full bg-surface-variant rounded-t hover:bg-primary transition-colors" style={{ height: `${value * 20}%` }}></div>
                                <span className="font-label-sm text-label-sm text-on-surface-variant mt-2">{months[idx]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Consultations Pie */}
                <div className="bg-surface p-stack-md rounded-lg border border-outline-variant">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-label-md text-label-md text-on-surface font-bold">Consultations by Specialty</h4>
                    </div>
                    <div className="flex items-center justify-center h-40">
                        <div className="relative w-32 h-32">
                            <svg viewBox="0 0 100 100" className="transform -rotate-90">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#00478d" strokeWidth="20" strokeDasharray="75.4 251.2" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#ba1a1a" strokeWidth="20" strokeDasharray="62.8 251.2" strokeDashoffset="-75.4" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#006a63" strokeWidth="20" strokeDasharray="50.3 251.2" strokeDashoffset="-138.2" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#79f3e7" strokeWidth="20" strokeDasharray="62.8 251.2" strokeDashoffset="-188.5" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between font-label-sm text-label-sm">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-primary rounded"></div>
                                <span className="text-on-surface-variant">General</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between font-label-sm text-label-sm">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-error rounded"></div>
                                <span className="text-on-surface-variant">Cardiology</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between font-label-sm text-label-sm">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-secondary rounded"></div>
                                <span className="text-on-surface-variant">Dermatology</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}