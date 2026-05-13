'use client'

import React from 'react'
import { Activity, Heart, Weight } from 'lucide-react'
import { useUser } from '@/hooks/use-user'

export default function HealthMetrics() {
    const { user } = useUser()

    const hs = user?.healthStats || user?.profile?.healthStats || {}

    const s = hs.bloodPressure?.systolic
    const d = hs.bloodPressure?.diastolic
    let bpStr = '—'
    if (s !== undefined && s !== null && d !== undefined && d !== null) bpStr = `${s}/${d} mmHg`
    else if (s !== undefined && s !== null) bpStr = `${s} mmHg`
    else if (d !== undefined && d !== null) bpStr = `${d} mmHg`

    const healthMetrics = [
        { label: 'Blood Pressure', value: bpStr, icon: Activity, color: 'text-red-500' },
        { label: 'Heart Rate', value: hs.heartRate?.value ? `${hs.heartRate.value} BPM` : '—', icon: Heart, color: 'text-pink-500' },
        { label: 'BMI', value: hs.bmi?.value ? String(hs.bmi.value) : '—', icon: Activity, color: 'text-primary' },
        { label: 'Weight', value: hs.weight?.value ? `${hs.weight.value} kg` : '—', icon: Weight, color: 'text-purple-500' },
        { label: 'Height', value: hs.height?.value ? `${hs.height.value} cm` : '—', icon: Activity, color: 'text-teal-500' }
    ]

    return (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg">
            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-stack-sm mb-stack-md font-bold">
                <span className="material-symbols-outlined text-secondary" data-icon="vital_signs">vital_signs</span>
                Health Metrics
            </h3>
            <div className="space-y-stack-md">
                {healthMetrics.map((metric, idx) => (
                    <div key={idx} className="flex items-center justify-between p-stack-sm bg-surface border border-outline-variant rounded-lg">
                        <div className="flex items-center space-x-3">
                            <metric.icon size={20} className={metric.color} />
                            <span className="font-label-sm text-label-sm text-on-surface-variant">{metric.label}</span>
                        </div>
                        <span className="font-label-md text-label-md font-bold text-on-surface">{metric.value}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}