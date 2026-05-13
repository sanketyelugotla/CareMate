"use client"

import { BarChart3, TrendingUp, Activity, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"

function StatSkeletonLoader() {
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="bg-card p-6 animate-pulse">
                    <div className="w-12 h-12 bg-muted rounded-lg mb-4"></div>
                    <div className="h-4 bg-muted rounded w-2/3 mb-3"></div>
                    <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                </Card>
            ))}
        </div>
    )
}

function ChartSkeletonLoader() {
    return (
        <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="bg-card p-8 animate-pulse">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-muted rounded"></div>
                        <div className="h-5 bg-muted rounded w-1/2"></div>
                    </div>
                    <div className="space-y-3">
                        <div className="h-4 bg-muted rounded w-full"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                    </div>
                </Card>
            ))}
        </div>
    )
}

export default function AnalyticsPage() {
    const [stats, setStats] = useState({
        totalDoctors: 0,
        totalPatients: 0,
        totalAppointments: 0,
        pendingApprovals: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin/stats')
            .then((r) => r.json())
            .then((statsData) => {
                setStats(statsData || {})
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
            })
    }, [])

    const analyticsCards = [
        {
            icon: Users,
            title: "Total Doctors",
            value: stats.totalDoctors || "-",
            description: "Registered doctors",
            color: "bg-purple-50 text-purple-600",
        },
        {
            icon: Users,
            title: "Total Patients",
            value: stats.totalPatients || "-",
            description: "Registered patients",
            color: "bg-blue-50 text-blue-600",
        },
        {
            icon: Activity,
            title: "Total Appointments",
            value: stats.totalAppointments || "-",
            description: "System appointments",
            color: "bg-green-50 text-green-600",
        },
        {
            icon: TrendingUp,
            title: "Pending Approvals",
            value: stats.pendingApprovals || "-",
            description: "Awaiting review",
            color: "bg-orange-50 text-orange-600",
        },
    ]

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
                <p className="text-muted-foreground mt-2">View system analytics and reports</p>
            </div>

            {loading ? (
                <>
                    <StatSkeletonLoader />
                    <ChartSkeletonLoader />
                </>
            ) : (
                <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {analyticsCards.map((item, idx) => (
                            <Card key={idx} className="bg-card hover:shadow-lg transition-shadow p-6 border border-border">
                                <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mb-4`}>
                                    <item.icon size={24} />
                                </div>
                                <h3 className="text-sm font-semibold text-muted-foreground mb-1">{item.title}</h3>
                                <p className="text-2xl font-bold text-foreground mb-1">{item.value}</p>
                                <p className="text-xs text-muted-foreground">{item.description}</p>
                            </Card>
                        ))}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="bg-card p-8 border border-border">
                            <div className="flex items-center space-x-3 mb-4">
                                <BarChart3 className="text-purple-600" size={32} />
                                <h3 className="text-lg font-semibold text-foreground">Appointment Trends</h3>
                            </div>
                            <p className="text-muted-foreground text-sm">Appointment booking patterns and trends over time</p>
                            <div className="mt-6 h-48 bg-muted rounded-lg flex items-center justify-center">
                                <p className="text-muted-foreground text-sm">Chart visualization</p>
                            </div>
                        </Card>

                        <Card className="bg-card p-8 border border-border">
                            <div className="flex items-center space-x-3 mb-4">
                                <TrendingUp className="text-green-600" size={32} />
                                <h3 className="text-lg font-semibold text-foreground">User Growth</h3>
                            </div>
                            <p className="text-muted-foreground text-sm">Patient and doctor registration trends</p>
                            <div className="mt-6 h-48 bg-muted rounded-lg flex items-center justify-center">
                                <p className="text-muted-foreground text-sm">Chart visualization</p>
                            </div>
                        </Card>

                        <Card className="bg-card p-8 border border-border">
                            <div className="flex items-center space-x-3 mb-4">
                                <Activity className="text-blue-600" size={32} />
                                <h3 className="text-lg font-semibold text-foreground">System Activity</h3>
                            </div>
                            <p className="text-muted-foreground text-sm">Real-time system activity metrics and statistics</p>
                            <div className="mt-6 h-48 bg-muted rounded-lg flex items-center justify-center">
                                <p className="text-muted-foreground text-sm">Chart visualization</p>
                            </div>
                        </Card>

                        <Card className="bg-card p-8 border border-border">
                            <div className="flex items-center space-x-3 mb-4">
                                <TrendingUp className="text-orange-600" size={32} />
                                <h3 className="text-lg font-semibold text-foreground">Performance</h3>
                            </div>
                            <p className="text-muted-foreground text-sm">System performance and health indicators</p>
                            <div className="mt-6 h-48 bg-muted rounded-lg flex items-center justify-center">
                                <p className="text-muted-foreground text-sm">Chart visualization</p>
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div>
    )
}
