'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, User, FileText, X } from 'lucide-react'
import dayjs from 'dayjs'

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('upcoming') // default to upcoming
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = () => {
    setLoading(true)
    fetch('/api/appointments')
      .then(res => res.json())
      .then(async (data) => {
        const items = data.items || data;
        if (!Array.isArray(items)) {
          setAppointments([]);
          setLoading(false);
          return;
        }
        // Fetch doctor details for each appointment
        const appointmentsWithDoctors = await Promise.all(
          items.map(async (apt) => {
            const doctorRes = await fetch(`/api/doctors?_id=${apt.doctorId}`)
            const doctors = await doctorRes.json()
            const doctor = doctors[0]
            return {
              ...apt,
              doctor: doctor ? {
                name: `${doctor.name.first} ${doctor.name.last}`,
                specialization: doctor.doctorProfile?.specialization || 'General',
                avatarUrl: doctor.avatarUrl,
                clinicAddress: doctor.doctorProfile?.clinicAddress
              } : null
            }
          })
        )
        setAppointments(appointmentsWithDoctors)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching appointments:', err)
        setLoading(false)
      })
  }

  const handleCancelAppointment = async (appointmentId) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return

    setCancelling(appointmentId)
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      })

      if (response.ok) {
        alert('Appointment cancelled successfully')
        fetchAppointments() // Refresh list
      } else {
        alert('Failed to cancel appointment')
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err)
      alert('Failed to cancel appointment')
    } finally {
      setCancelling(null)
    }
  }

  const getFilteredAppointments = () => {
    const now = new Date()
    switch (filter) {
      case 'upcoming':
        return appointments.filter(a => new Date(a.start) >= now && a.status !== 'cancelled')
      case 'past':
        return appointments.filter(a => new Date(a.start) < now || a.status === 'completed')
      case 'cancelled':
        return appointments.filter(a => a.status === 'cancelled')
      default:
        return appointments
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      cancelled: 'bg-red-50 text-red-600 border-red-100',
      completed: 'bg-blue-50 text-blue-700 border-blue-200',
      no_show: 'bg-gray-100 text-gray-600 border-gray-200'
    }
    return badges[status] || badges.pending
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 animate-pulse">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="h-7 w-48 bg-muted rounded-md"></div>
          <div className="flex space-x-2 bg-muted p-1 rounded-xl">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-8 w-20 bg-muted-foreground/20 rounded-lg"></div>)}
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.04)] p-5 border border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-14 h-14 bg-muted rounded-full shrink-0"></div>
                  <div className="flex-1 w-full">
                    <div className="h-5 bg-muted rounded w-48 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-24 mb-4"></div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                      <div className="h-3 bg-muted rounded w-28"></div>
                      <div className="h-3 bg-muted rounded w-32"></div>
                      <div className="h-3 bg-muted rounded w-40"></div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3">
                  <div className="h-6 w-20 bg-muted rounded-md"></div>
                  <div className="h-7 w-20 bg-muted rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const filteredAppointments = getFilteredAppointments()

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-foreground">My Appointments</h2>
        <div className="flex flex-wrap space-x-2 bg-muted p-1 rounded-xl">
          {['all', 'upcoming', 'past', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filteredAppointments.length > 0 ? (
        <div className="space-y-4">
          {filteredAppointments.map(appointment => {
            const isPast = new Date(appointment.start) < new Date()
            const canCancel = !isPast && appointment.status !== 'cancelled' && appointment.status !== 'completed'

            return (
              <div key={appointment._id} className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.04)] p-5 hover:shadow-[0_8px_24px_rgba(20,29,35,0.08)] border border-border/50 transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center flex-shrink-0 border border-border">
                      {appointment.doctor?.avatarUrl ? (
                        <img 
                          src={appointment.doctor.avatarUrl} 
                          alt="" 
                          className="w-full h-full rounded-full object-cover" 
                        />
                      ) : (
                        <User size={24} className="text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-foreground truncate">
                        Dr. {appointment.doctor?.name || 'Doctor'}
                      </h3>
                      <p className="text-primary text-xs font-semibold mb-3">
                        {appointment.doctor?.specialization || 'General'}
                      </p>
                      
                      <div className="flex flex-wrap gap-x-6 gap-y-2">
                        <div className="flex items-center text-muted-foreground text-xs font-medium">
                          <Calendar size={14} className="mr-1.5 text-primary/70" />
                          <span>{dayjs(appointment.start).format('MMM DD, YYYY')}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground text-xs font-medium">
                          <Clock size={14} className="mr-1.5 text-primary/70" />
                          <span>
                            {dayjs(appointment.start).format('h:mm A')} - {dayjs(appointment.end).format('h:mm A')}
                          </span>
                        </div>
                        {appointment.doctor?.clinicAddress && (
                          <div className="flex items-center text-muted-foreground text-xs font-medium">
                            <MapPin size={14} className="mr-1.5 text-primary/70" />
                            <span className="truncate max-w-[200px]">{appointment.doctor.clinicAddress}</span>
                          </div>
                        )}
                      </div>

                      {appointment.notes && (
                        <div className="flex items-start text-muted-foreground text-xs mt-3 bg-muted/30 p-2.5 rounded-lg border border-border/50">
                          <FileText size={14} className="mr-2 mt-0.5 shrink-0 text-primary/50" />
                          <span>{appointment.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 border-t sm:border-t-0 border-border/50 pt-4 sm:pt-0">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border ${getStatusBadge(appointment.status)}`}>
                      {appointment.status.replace('_', ' ')}
                    </span>
                    {canCancel && (
                      <button
                        onClick={() => handleCancelAppointment(appointment._id)}
                        disabled={cancelling === appointment._id}
                        className="flex items-center space-x-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 text-xs font-medium"
                      >
                        <X size={14} />
                        <span>
                          {cancelling === appointment._id ? 'Cancelling...' : 'Cancel'}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.04)] border border-border p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar size={24} className="text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground mb-1">No appointments found</p>
          <p className="text-xs text-muted-foreground">You don't have any {filter === 'all' ? '' : filter} appointments at the moment.</p>
        </div>
      )}
    </div>
  )
}
