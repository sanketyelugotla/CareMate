'use client'

import React from 'react';
import { Droplet, Activity } from 'lucide-react';

export default function HealthTips() {
    const healthTips = [
        { title: 'Stay Hydrated', description: 'Drink at least 8 glasses of water daily for optimal health.', icon: Droplet, color: 'text-primary' },
        { title: 'Exercise Regularly', description: '30 minutes of daily exercise can improve your overall health.', icon: Activity, color: 'text-green-500' }
    ];

    return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg">
            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-stack-sm mb-stack-md font-bold">
                <span className="material-symbols-outlined text-primary" data-icon="lightbulb">lightbulb</span>
                Health Tips
            </h3>
            <div className="space-y-stack-md">
                {healthTips.map((tip, idx) => (
                    <div key={idx} className="flex space-x-3 p-stack-md bg-surface border border-outline-variant rounded-lg">
                        <div className={`${tip.color} mt-1`}>
                            <tip.icon size={20} />
                        </div>
                        <div>
                            <p className="font-label-md text-label-md font-bold text-on-surface">{tip.title}</p>
                            <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">{tip.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}