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
        <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Health Metrics</h3>
            <div className="space-y-4">
                {healthMetrics.map((metric, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-background rounded-lg">
                        <div className="flex items-center space-x-3">
                            <metric.icon size={20} className={metric.color} />
                            <span className="text-sm text-muted-foreground">{metric.label}</span>
                        </div>
                        <span className="font-bold text-foreground">{metric.value}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}