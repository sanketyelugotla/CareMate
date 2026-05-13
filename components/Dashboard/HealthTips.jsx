'use client'

import React from 'react';
import { Droplet, Activity } from 'lucide-react';

export default function HealthTips() {
    const healthTips = [
        { title: 'Stay Hydrated', description: 'Drink at least 8 glasses of water daily for optimal health.', icon: Droplet, color: 'text-primary' },
        { title: 'Exercise Regularly', description: '30 minutes of daily exercise can improve your overall health.', icon: Activity, color: 'text-green-500' }
    ];

    return (
        <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Health Tips</h3>
            <div className="space-y-4">
                {healthTips.map((tip, idx) => (
                    <div key={idx} className="flex space-x-3 p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-lg">
                        <div className={`${tip.color} mt-1`}>
                            <tip.icon size={20} />
                        </div>
                        <div>
                            <p className="font-semibold text-foreground text-sm">{tip.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{tip.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}