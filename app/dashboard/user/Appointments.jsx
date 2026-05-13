'use client'

import React, { useState, useEffect } from 'react'
import { Search, Calendar, Clock, DollarSign, Star, Briefcase } from 'lucide-react'
import dayjs from 'dayjs'

export default function Appointments() {
  const [doctors, setDoctors] = useState([])
  const [filteredDoctors, setFilteredDoctors] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [loading, setLoading] = useState(true)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [bookingNotes, setBookingNotes] = useState('')
  const [booking, setBooking] = useState(false)

  const specialties = ['all', 'Cardiologist', 'Dermatologist', 'Neurologist', 'Pediatrician', 'Orthopedic', 'General']

  useEffect(() => {
    fetch('/api/doctors')
      .then(res => res.json())
      .then(data => {
        setDoctors(data)
        setFilteredDoctors(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching doctors:', err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    let filtered = doctors

    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(d => d.doctorProfile?.specialization === selectedSpecialty)
    }

    if (searchTerm) {
      filtered = filtered.filter(d =>
        `${d.name?.first} ${d.name?.last}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.doctorProfile?.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredDoctors(filtered)
  }, [searchTerm, selectedSpecialty, doctors])

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      alert('Please select date and time')
      return
    }

    setBooking(true)

    const startDateTime = dayjs(`${selectedDate} ${selectedTime}`).toISOString()
    const endDateTime = dayjs(`${selectedDate} ${selectedTime}`).add(30, 'minute').toISOString()

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: selectedDoctor._id,
          start: startDateTime,
          end: endDateTime,
          notes: bookingNotes
        })
      })

      if (response.ok) {
        alert('Appointment booked successfully!')
        setSelectedDoctor(null)
        setSelectedDate('')
        setSelectedTime('')
        setBookingNotes('')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to book appointment')
      }
    } catch (err) {
      console.error('Error booking appointment:', err)
      alert('Failed to book appointment')
    } finally {
      setBooking(false)
    }
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 9; hour < 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    return slots
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-4"></div>
        <div className="h-14 w-full bg-muted rounded-xl mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-card rounded-xl shadow-sm p-5 border border-border h-48 bg-muted/50"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h2 className="text-xl font-bold text-foreground mb-4">Book Appointment</h2>

      {/* Search and Filter */}
      <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.04)] p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search by doctor name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border-none bg-muted rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm"
            />
          </div>
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="px-4 py-2 border-none bg-muted rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm"
          >
            {specialties.map(specialty => (
              <option key={specialty} value={specialty}>
                {specialty === 'all' ? 'All Specialties' : specialty}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctors List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDoctors.map(doctor => (
          <div key={doctor._id} className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.06)] p-5 hover:shadow-[0_8px_24px_rgba(20,29,35,0.12)] transition-shadow">
            <div className="flex items-start gap-4 mb-4">
              <img
                src={doctor.avatarUrl || `https://ui-avatars.com/api/?name=${doctor.name?.first}+${doctor.name?.last}&background=005eb8&color=fff&size=64`}
                alt={`Dr. ${doctor.name?.first} ${doctor.name?.last}`}
                className="w-12 h-12 rounded-full object-cover shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-foreground truncate">
                  Dr. {doctor.name?.first} {doctor.name?.last}
                </h3>
                <p className="text-primary text-xs font-medium mb-1 truncate">{doctor.doctorProfile?.specialization || 'General'}</p>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-muted-foreground font-medium">4.9</span>
                  <span className="text-xs text-muted-foreground opacity-75">(127)</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-5 bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Briefcase className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs">{doctor.doctorProfile?.yearsExperience || 0} years exp.</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs">${doctor.doctorProfile?.consultationFee || 50} fee</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-3.5 h-3.5 text-secondary" />
                <span className="text-xs">Available today</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedDoctor(doctor)
                setSelectedDate('')
                setSelectedTime('')
                setBookingNotes('')
              }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              Book Appointment
            </button>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">No doctors found matching your criteria.</p>
        </div>
      )}

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.2)] max-w-sm w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-bold text-foreground mb-1">
              Book with Dr. {selectedDoctor.name?.last}
            </h3>
            <p className="text-xs text-muted-foreground mb-6">Select a date and time for your consultation.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                  <Calendar size={14} className="inline mr-1.5 -mt-0.5" />
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={dayjs().format('YYYY-MM-DD')}
                  className="w-full px-3 py-2 bg-muted border-none rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                  <Clock size={14} className="inline mr-1.5 -mt-0.5" />
                  Time
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 bg-muted border-none rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                >
                  <option value="">Choose time</option>
                  {generateTimeSlots().map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Notes</label>
                <textarea
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-muted border-none rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-sm resize-none"
                  rows={2}
                  placeholder="Any specific concerns..."
                />
              </div>

              <div className="bg-primary/5 p-3 rounded-lg flex justify-between items-center border border-primary/10">
                <span className="text-xs font-semibold text-primary">Consultation Fee</span>
                <span className="text-sm font-bold text-foreground">${selectedDoctor.doctorProfile?.consultationFee || 50}</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedDoctor(null)
                    setSelectedDate('')
                    setSelectedTime('')
                    setBookingNotes('')
                  }}
                  className="flex-1 px-4 py-2 bg-muted text-foreground font-medium rounded-lg hover:bg-muted-foreground/10 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookAppointment}
                  disabled={booking || !selectedDate || !selectedTime}
                  className="flex-[2] px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {booking ? 'Confirming...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}