"use client"

import React, { useEffect, useState } from 'react'
import { UserCheck, Mail, Phone, Badge } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

function SkeletonLoader() {
    return (
        <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="flex space-x-4">
                                <div className="w-12 h-12 bg-muted rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-muted rounded w-3/4"></div>
                                    <div className="h-3 bg-muted rounded w-1/2"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 bg-muted rounded w-full"></div>
                                <div className="h-3 bg-muted rounded w-2/3"></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default function AllDoctorsPage() {
    const [doctors, setDoctors] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin/doctors?page=1&pageSize=50')
            .then(res => res.json())
            .then(data => {
                const docList = Array.isArray(data) ? data : (data?.items || [])
                setDoctors(docList)
                setLoading(false)
            })
            .catch(err => {
                console.error('Error fetching doctors:', err)
                setLoading(false)
            })
    }, [])

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground">All Doctors</h1>
                    <p className="text-muted-foreground mt-2">Manage registered doctors</p>
                </div>
                <SkeletonLoader />
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">All Doctors</h1>
                <p className="text-muted-foreground mt-2">{doctors.length} registered doctors</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.length > 0 ? (
                    doctors.map((doctor: any) => (
                        <Card key={doctor._id} className="bg-card hover:shadow-lg transition-all border border-border overflow-hidden group">
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3 flex-1">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                <UserCheck size={24} className="text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-semibold text-foreground truncate">
                                                    {doctor.name?.first} {doctor.name?.last}
                                                </h3>
                                                {doctor.doctorProfile?.specialization && (
                                                    <p className="text-xs text-muted-foreground mt-1 truncate">
                                                        {doctor.doctorProfile.specialization}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {doctor.isApproved ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold flex-shrink-0">
                                                Approved
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-semibold flex-shrink-0">
                                                Pending
                                            </span>
                                        )}
                                    </div>

                                    {/* Contact Info */}
                                    <div className="space-y-2 border-t border-border pt-4">
                                        {doctor.email && (
                                            <div className="flex items-center space-x-2 text-xs">
                                                <Mail size={14} className="text-blue-500 flex-shrink-0" />
                                                <span className="text-muted-foreground truncate">{doctor.email}</span>
                                            </div>
                                        )}
                                        {doctor.phone && (
                                            <div className="flex items-center space-x-2 text-xs">
                                                <Phone size={14} className="text-green-500 flex-shrink-0" />
                                                <span className="text-muted-foreground">{doctor.phone}</span>
                                            </div>
                                        )}
                                        {doctor.doctorProfile?.licenseNumber && (
                                            <div className="flex items-center space-x-2 text-xs">
                                                <Badge size={14} className="text-purple-500 flex-shrink-0" />
                                                <span className="text-muted-foreground truncate">{doctor.doctorProfile.licenseNumber}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    {doctor.totalAppointments !== undefined && (
                                        <div className="border-t border-border pt-3">
                                            <p className="text-xs text-muted-foreground">
                                                <span className="font-semibold text-foreground">{doctor.totalAppointments}</span> appointments
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-16 bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] border border-border">
                        <UserCheck size={56} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-muted-foreground text-lg font-medium">No doctors found</p>
                        <p className="text-muted-foreground text-sm mt-1">Start by registering new doctors</p>
                    </div>
                )}
            </div>
        </div>
    )
}
