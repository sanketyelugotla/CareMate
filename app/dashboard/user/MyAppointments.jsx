'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, User, FileText, X } from 'lucide-react'
import dayjs from 'dayjs'

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, upcoming, past, cancelled
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = () => {
    setLoading(true)
    fetch('/api/appointments')
      .then(res => res.json())
      .then(async (data) => {
        // Fetch doctor details for each appointment
        const appointmentsWithDoctors = await Promise.all(
          data.map(async (apt) => {
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
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
      completed: 'bg-accent text-blue-700',
      no_show: 'bg-muted text-muted-foreground'
    }
    return badges[status] || badges.pending
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg">
          <p className="text-on-surface-variant font-label-md">Loading appointments...</p>
        </div>
      </div>
    )
  }

  const filteredAppointments = getFilteredAppointments()

  return (
    <div className="max-w-6xl mx-auto font-body-md text-on-surface">
      <div className="flex justify-between items-center mb-stack-lg">
        <h2 className="font-headline-md text-headline-md font-bold text-on-surface">My Appointments</h2>
        <div className="flex space-x-stack-sm">
          {['all', 'upcoming', 'past', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-stack-md py-stack-sm rounded-lg capitalize transition font-label-md text-label-md ${
                filter === f
                  ? 'bg-primary text-on-primary font-bold'
                  : 'bg-surface-variant text-on-surface-variant hover:bg-surface-container-high'
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
              <div key={appointment._id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg hover:bg-surface-container transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-stack-md flex-1">
                    <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center flex-shrink-0">
                      {appointment.doctor?.avatarUrl ? (
                        <img 
                          src={appointment.doctor.avatarUrl} 
                          alt="" 
                          className="w-full h-full rounded-full object-cover" 
                        />
                      ) : (
                        <User size={32} className="text-on-primary-container" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                        {appointment.doctor?.name || 'Doctor'}
                      </h3>
                      <p className="text-primary font-label-md text-label-md font-bold mb-stack-sm">
                        {appointment.doctor?.specialization || 'General'}
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center text-on-surface-variant font-label-md text-label-md">
                          <Calendar size={16} className="mr-stack-sm" />
                          <span>{dayjs(appointment.start).format('MMMM DD, YYYY')}</span>
                        </div>
                        <div className="flex items-center text-on-surface-variant font-label-md text-label-md">
                          <Clock size={16} className="mr-stack-sm" />
                          <span>
                            {dayjs(appointment.start).format('h:mm A')} - {dayjs(appointment.end).format('h:mm A')}
                          </span>
                        </div>
                        {appointment.doctor?.clinicAddress && (
                          <div className="flex items-center text-on-surface-variant font-label-md text-label-md">
                            <MapPin size={16} className="mr-stack-sm" />
                            <span>{appointment.doctor.clinicAddress}</span>
                          </div>
                        )}
                        {appointment.notes && (
                          <div className="flex items-start text-on-surface-variant font-label-md text-label-md mt-stack-xs">
                            <FileText size={16} className="mr-stack-sm mt-0.5" />
                            <span>{appointment.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-stack-sm">
                    <span className={`px-stack-sm py-0.5 rounded font-label-sm text-label-sm font-bold capitalize ${getStatusBadge(appointment.status)}`}>
                      {appointment.status}
                    </span>
                    {canCancel && (
                      <button
                        onClick={() => handleCancelAppointment(appointment._id)}
                        disabled={cancelling === appointment._id}
                        className="flex items-center gap-stack-xs px-stack-sm py-1 text-error hover:bg-error-container rounded transition disabled:opacity-50"
                      >
                        <X size={16} />
                        <span className="font-label-sm text-label-sm font-bold">
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
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-xl text-center">
          <Calendar size={48} className="mx-auto text-on-surface-variant mb-stack-md opacity-50" />
          <p className="text-on-surface-variant font-label-md text-label-md">No appointments found</p>
        </div>
      )}
    </div>
  )
}
