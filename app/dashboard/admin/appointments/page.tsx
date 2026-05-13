"use client"

import React, { useEffect, useState } from 'react'
import { Calendar, Clock, Filter } from 'lucide-react'
import { Card } from '@/components/ui/card'
import dayjs from 'dayjs'

function SkeletonLoader() {
    return (
        <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="bg-card p-6 animate-pulse">
                    <div className="space-y-3">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="flex justify-between">
                            <div className="h-4 bg-muted rounded w-1/3"></div>
                            <div className="h-6 bg-muted rounded w-1/4"></div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('upcoming')

    useEffect(() => {
        fetch('/api/appointments')
            .then(res => res.json())
            .then(data => {
                const appointmentsArray = Array.isArray(data) ? data : (data?.items || [])
                setAppointments(appointmentsArray)
                setLoading(false)
            })
            .catch(err => {
                console.error('Error fetching appointments:', err)
                setLoading(false)
            })
    }, [])

    const getStatusBadge = (status: string) => {
        const badges: any = {
            confirmed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmed' },
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
            cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
            completed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed' }
        }
        const badge = badges[status] || badges.pending
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        )
    }

    const filterAppointments = (apt: any) => {
        const now = dayjs()
        const aptDate = dayjs(apt.start)

        if (filter === 'upcoming') return aptDate.isAfter(now)
        if (filter === 'past') return aptDate.isBefore(now) || aptDate.isSame(now)
        if (filter === 'all') return true
        return true
    }

    const filteredAppointments = appointments.filter(filterAppointments)
        .sort((a: any, b: any) => {
            if (filter === 'upcoming') {
                return new Date(a.start).getTime() - new Date(b.start).getTime()
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })

    const filterOptions = [
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'past', label: 'Past' },
        { value: 'all', label: 'All' }
    ]

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
                    <p className="text-muted-foreground mt-1">{filteredAppointments.length} appointments</p>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex items-center space-x-3 flex-wrap gap-2">
                <Filter size={20} className="text-muted-foreground" />
                <div className="flex space-x-2 flex-wrap gap-2">
                    {filterOptions.map(option => (
                        <button
                            key={option.value}
                            onClick={() => setFilter(option.value)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${filter === option.value
                                ? 'bg-blue-600 text-white'
                                : 'bg-background border border-border text-foreground hover:bg-muted'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <SkeletonLoader />
            ) : (
                <div className="grid gap-4">
                    {filteredAppointments.length > 0 ? (
                        filteredAppointments.map((apt: any) => (
                            <Card key={apt._id} className="bg-card hover:shadow-lg transition-shadow p-6 border border-border">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <Calendar size={18} className="text-blue-500 flex-shrink-0" />
                                            <p className="font-semibold text-foreground">
                                                {dayjs(apt.start).format('ddd, MMM DD, YYYY')}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2 mb-2 text-sm text-muted-foreground">
                                            <Clock size={16} className="flex-shrink-0" />
                                            <span>{dayjs(apt.start).format('h:mm A')} - {dayjs(apt.end).format('h:mm A')}</span>
                                        </div>
                                        {apt.patient && (
                                            <p className="text-sm text-muted-foreground mb-1">
                                                <span className="font-medium">Patient:</span> {typeof apt.patient === 'object' ? apt.patient.name : apt.patient}
                                            </p>
                                        )}
                                        {apt.notes && (
                                            <p className="text-sm text-muted-foreground border-l-2 border-blue-200 pl-3">
                                                {apt.notes}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex-shrink-0">
                                        {getStatusBadge(apt.status || 'pending')}
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] p-8 text-center border border-border">
                            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-muted-foreground">
                                {filter === 'all' ? 'No appointments found' : `No ${filter} appointments found`}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
