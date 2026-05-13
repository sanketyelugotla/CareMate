'use client'

import React, { useState, useEffect } from 'react'
import { jsonFetch } from '@/lib/fetcher'
import { User, Mail, Phone, MapPin, Calendar, Droplet, Edit, Heart, Activity, FileText, AlertCircle, Pill, Shield } from 'lucide-react'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    address: '',
    bloodGroup: '',
    phone: '',
    dateOfBirth: '',
    allergies: [],
    conditions: [],
    medications: []
  })

  // Mock health stats - replace with real data from backend
  const [healthStats, setHealthStats] = useState({
    bmi: { value: undefined, status: '' },
    heartRate: { value: undefined },
    bloodPressure: { systolic: undefined, diastolic: undefined },
    weight: { value: undefined },
    height: { value: undefined }
  })

  // Mock appointments - replace with real data from backend
  const [appointments, setAppointments] = useState({
    upcoming: {
      title: 'Annual Check-up',
      doctor: 'Dr. Emily Carter',
      date: '2025-11-10',
      time: '9:00 AM'
    },
    recent: {
      title: 'Dental Cleaning',
      doctor: 'Dr. Alan Grant',
      date: '2025-06-22'
    }
  })

  const [medicalReports, setMedicalReports] = useState([
    { name: 'Blood Test Results', date: 'Oct 2025' },
    { name: 'X-Ray Scan', date: 'Aug 2025' }
  ])

  useEffect(() => {
    // Get current user info
    jsonFetch('/api/auth/me')
      .then(async (authData) => {
        if (!authData?.id) {
          setLoading(false)
          return
        }
        // fetch full user record to get name object and profile
        const res = await fetch(`/api/users/${authData.id}`, { credentials: 'include' })
        const full = await res.json()
        // normalize to include id (auth/me uses id, full doc has _id)
        setUser({ ...full, id: full._id ? String(full._id) : full.id })
        // load health stats if present
        const hs = full.healthStats || full.profile?.healthStats
        if (hs) {
          // support both old and new shapes: bloodPressure as string '120/80' or object { systolic, diastolic }
          let bp = { systolic: undefined, diastolic: undefined }
          if (hs.bloodPressure) {
            if (typeof hs.bloodPressure === 'string') {
              const parts = hs.bloodPressure.split('/').map(p => parseInt(p, 10))
              bp.systolic = Number.isFinite(parts[0]) ? parts[0] : undefined
              bp.diastolic = Number.isFinite(parts[1]) ? parts[1] : undefined
            } else if (typeof hs.bloodPressure === 'object') {
              // preferred: numeric fields
              const s = hs.bloodPressure.systolic !== undefined && hs.bloodPressure.systolic !== null ? Number(hs.bloodPressure.systolic) : undefined
              const d = hs.bloodPressure.diastolic !== undefined && hs.bloodPressure.diastolic !== null ? Number(hs.bloodPressure.diastolic) : undefined
              if (s !== undefined || d !== undefined) {
                bp.systolic = Number.isFinite(s) ? s : undefined
                bp.diastolic = Number.isFinite(d) ? d : undefined
              } else if (hs.bloodPressure.value && typeof hs.bloodPressure.value === 'string') {
                const parts = hs.bloodPressure.value.split('/').map(p => parseInt(p, 10))
                bp.systolic = Number.isFinite(parts[0]) ? parts[0] : undefined
                bp.diastolic = Number.isFinite(parts[1]) ? parts[1] : undefined
              }
            }
          }
          setHealthStats({
            bmi: { value: hs.bmi?.value !== undefined ? hs.bmi.value : undefined, status: hs.bmi?.status || '' },
            heartRate: { value: hs.heartRate?.value !== undefined ? hs.heartRate.value : undefined },
            bloodPressure: { systolic: typeof bp.systolic === 'number' ? bp.systolic : undefined, diastolic: typeof bp.diastolic === 'number' ? bp.diastolic : undefined },
            weight: { value: hs.weight?.value !== undefined ? hs.weight.value : undefined },
            height: { value: hs.height?.value !== undefined ? hs.height.value : undefined }
          })
        }
        if (full.profile) {
          setFormData({
            ...formData,
            age: full.profile.age || '',
            gender: full.profile.gender || 'male',
            address: full.profile.address || '',
            bloodGroup: full.profile.bloodGroup || '',
            phone: full.phone || '',
            dateOfBirth: full.profile.dateOfBirth || '',
            allergies: full.profile.allergies || [],
            conditions: full.profile.conditions || [],
            medications: full.profile.medications || [],
            firstName: full.name?.first || '',
            lastName: full.name?.last || ''
          })
        } else {
          setFormData({
            ...formData,
            phone: full.phone || '',
            firstName: full.name?.first || '',
            lastName: full.name?.last || ''
          })
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching user:', err)
        setLoading(false)
      })
  }, [])

  const getUserName = (userObj) => {
    if (!userObj) return 'User'
    // auth/me returns name as string in some places, or { first, last } in others
    if (typeof userObj.name === 'string') return userObj.name
    const first = userObj.name?.first || ''
    const last = userObj.name?.last || ''
    const combined = `${first} ${last}`.trim()
    return combined || userObj.email || 'User'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    // Client-side validation for name
    const first = (formData.firstName || '').trim()
    const last = (formData.lastName || '').trim()
    if (!first || !last) {
      setToast({ message: 'Please provide both first and last name.', type: 'error', visible: true })
      setTimeout(() => setToast({ message: '', type: 'error', visible: false }), 3500)
      return
    }

    try {
      // compute BMI from height(cm) and weight(kg) if provided
      const weightVal = healthStats.weight?.value ? Number(healthStats.weight.value) : undefined
      const heightVal = healthStats.height?.value ? Number(healthStats.height.value) : undefined
      let bmiVal = healthStats.bmi?.value ? Number(healthStats.bmi.value) : undefined
      let bmiStatus = healthStats.bmi?.status || undefined
      if (weightVal && heightVal) {
        const meters = heightVal / 100
        if (meters > 0) {
          bmiVal = Number((weightVal / (meters * meters)).toFixed(1))
          if (bmiVal < 18.5) bmiStatus = 'Underweight'
          else if (bmiVal < 25) bmiStatus = 'Normal'
          else if (bmiVal < 30) bmiStatus = 'Overweight'
          else bmiStatus = 'Obese'
        }
      }

      const payload = {
        name: {
          first: formData.firstName || undefined,
          last: formData.lastName || undefined
        },
        profile: {
          age: parseInt(formData.age) || undefined,
          gender: formData.gender,
          address: formData.address,
          bloodGroup: formData.bloodGroup,
          dateOfBirth: formData.dateOfBirth,
          allergies: formData.allergies,
          conditions: formData.conditions,
          medications: formData.medications
        },
        phone: formData.phone,
        healthStats: {
          bmi: { value: bmiVal || undefined, status: bmiStatus || undefined },
          heartRate: { value: Number(healthStats.heartRate?.value) || undefined },
          bloodPressure: { systolic: Number(healthStats.bloodPressure?.systolic) || undefined, diastolic: Number(healthStats.bloodPressure?.diastolic) || undefined },
          weight: { value: weightVal || undefined },
          height: { value: heightVal || undefined }
        }
      }
      console.log('[Profile.jsx] Sending PUT payload:', payload)
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setToast({ message: 'Profile updated successfully!', type: 'success', visible: true })
        setEditing(false)
        // Refresh full user document
        try {
          const authData = await (await import('@/lib/fetcher')).jsonFetch('/api/auth/me')
          if (authData?.id) {
            const full = await fetch(`/api/users/${authData.id}`).then(r => r.json())
            setUser({ ...full, id: full._id ? String(full._id) : authData.id })
          }
        } catch (e) {
          // fallback: leave user as-is
        }
        setTimeout(() => setToast({ message: '', type: 'success', visible: false }), 3000)
      } else {
        setToast({ message: 'Failed to update profile', type: 'error', visible: true })
        setTimeout(() => setToast({ message: '', type: 'error', visible: false }), 3500)
      }
    } catch (err) {
      console.error('Error updating profile:', err)
      setToast({ message: 'Failed to update profile', type: 'error', visible: true })
      setTimeout(() => setToast({ message: '', type: 'error', visible: false }), 3500)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 animate-pulse">
        <div className="max-w-7xl mx-auto">
          {/* Header Card Skeleton */}
          <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.04)] border border-border/50 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-muted rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-muted rounded w-48"></div>
                  <div className="h-4 bg-muted rounded w-32"></div>
                </div>
              </div>
              <div className="h-10 w-28 bg-muted rounded-lg"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information Skeleton */}
              <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.04)] border border-border/50 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-5 h-5 bg-muted rounded-full"></div>
                  <div className="h-6 w-48 bg-muted rounded"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i}>
                      <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                      <div className="h-10 bg-muted/50 rounded-lg w-full"></div>
                    </div>
                  ))}
                  <div className="col-span-2">
                    <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                    <div className="h-10 bg-muted/50 rounded-lg w-full"></div>
                  </div>
                  <div className="col-span-2">
                    <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                    <div className="h-10 bg-muted/50 rounded-lg w-full"></div>
                  </div>
                </div>
              </div>

              {/* Medical Information Skeleton */}
              <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.04)] border border-border/50 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-5 h-5 bg-muted rounded-full"></div>
                  <div className="h-6 w-48 bg-muted rounded"></div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg border border-border/50">
                      <div className="w-5 h-5 bg-muted rounded-full mt-0.5"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-muted rounded w-32 mb-1"></div>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="space-y-6">
              {/* Health Statistics Skeleton */}
              <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.04)] border border-border/50 p-6">
                <div className="h-6 w-40 bg-muted rounded mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-10 h-10 bg-muted rounded-lg shrink-0"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-muted rounded w-20"></div>
                        <div className="h-5 bg-muted rounded w-24"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Appointments & Reports Skeleton */}
              <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.04)] border border-border/50 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 bg-muted rounded-full"></div>
                  <div className="h-6 w-48 bg-muted rounded"></div>
                </div>
                <div className="space-y-3 mb-4">
                  {[1, 2].map(i => (
                    <div key={i} className="p-3 bg-muted/30 rounded border-l-4 border-muted">
                      <div className="h-3 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="h-4 bg-muted rounded w-32 mb-3"></div>
                  <div className="space-y-2">
                    {[1, 2].map(i => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-muted rounded shrink-0"></div>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] p-8">
            <p className="text-red-500">Failed to load user data</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Simple toast */}
      {toast.visible && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow-lg ${toast.type === 'success' ? 'bg-green-500 text-white' : toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-gray-800 text-white'}`}>
          {toast.message}
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
        <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] border-border p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h1 className="text-base font-semibold text-foreground">{getUserName(user)}</h1>
                <p className="text-xs text-muted-foreground">{getUserName(user)}</p>
              </div>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-muted0 hover:bg-blue-600 text-white text-sm rounded-lg font-medium transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] border-border p-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Personal Information</h2>
              </div>

              {!editing ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
                    <div className="px-3 py-1.5 bg-background rounded-lg text-sm text-foreground">
                      {getUserName(user)}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Date of Birth</label>
                    <div className="px-3 py-1.5 bg-background rounded-lg text-sm text-foreground">
                      {formData.dateOfBirth || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Gender</label>
                    <div className="px-3 py-1.5 bg-background rounded-lg text-sm text-foreground capitalize">
                      {formData.gender}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Blood Group</label>
                    <div className="px-3 py-1.5 bg-background rounded-lg text-sm text-foreground">
                      {formData.bloodGroup || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Phone Number</label>
                    <div className="px-3 py-1.5 bg-background rounded-lg text-sm text-foreground">
                      {formData.phone || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Email Address</label>
                    <div className="px-3 py-1.5 bg-background rounded-lg text-sm text-foreground">
                      {user.email}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Weight</label>
                    <div className="px-3 py-1.5 bg-background rounded-lg text-sm text-foreground">
                      {healthStats.weight?.value ? `${healthStats.weight.value} kg` : 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Height</label>
                    <div className="px-3 py-1.5 bg-background rounded-lg text-sm text-foreground">
                      {healthStats.height?.value ? `${healthStats.height.value} cm` : 'Not provided'}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 block">Blood Pressure</label>
                    <div className="px-3 py-1.5 bg-background rounded-lg text-sm text-foreground">
                      {(healthStats.bloodPressure?.systolic !== undefined && healthStats.bloodPressure?.diastolic !== undefined)
                        ? `${healthStats.bloodPressure.systolic}/${healthStats.bloodPressure.diastolic} mmHg`
                        : (healthStats.bloodPressure?.systolic !== undefined ? `${healthStats.bloodPressure.systolic} mmHg` : (healthStats.bloodPressure?.diastolic !== undefined ? `${healthStats.bloodPressure.diastolic} mmHg` : 'Not provided'))}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-muted-foreground mb-1 block">Address</label>
                    <div className="px-3 py-1.5 bg-background rounded-lg text-sm text-foreground">
                      {formData.address || 'Not provided'}
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">First Name</label>
                      <input
                        type="text"
                        value={formData.firstName || ''}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName || ''}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Blood Group</label>
                      <input
                        type="text"
                        value={formData.bloodGroup}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="e.g., A+, O-, B+"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Address</label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Enter your address"
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-3">
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-4 py-1.5 bg-gray-200 text-foreground text-sm rounded-lg hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Medical Information */}
            <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] border-border p-4">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-green-600" />
                <h2 className="text-sm font-semibold text-foreground">Medical Information</h2>
              </div>

              <div className="space-y-4">
                {/* Allergies */}
                <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-100">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-foreground mb-0.5">Allergies</h3>
                    <p className="text-xs text-muted-foreground">
                      {formData.allergies.length > 0 ? formData.allergies.join(', ') : 'No known allergies'}
                    </p>
                  </div>
                </div>

                {/* Chronic Conditions */}
                <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <Activity className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-foreground mb-0.5">Chronic Conditions</h3>
                    <p className="text-xs text-muted-foreground">
                      {formData.conditions.length > 0 ? formData.conditions.join(', ') : 'No chronic conditions'}
                    </p>
                  </div>
                </div>

                {/* Current Medications */}
                <div className="flex items-start gap-2 p-3 bg-muted rounded-lg border border-blue-100">
                  <Pill className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-foreground mb-0.5">Current Medications</h3>
                    <p className="text-xs text-muted-foreground">
                      {formData.medications.length > 0 ? formData.medications.join(', ') : 'No current medications'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Health Statistics */}
            <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] border-border p-4">
              <h2 className="text-sm font-semibold text-foreground mb-3">Health Statistics</h2>

              <div className="space-y-3">
                <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">BMI</p>
                    <p className="text-sm font-semibold text-foreground">
                      {healthStats.bmi.value || '—'}{' '}
                      <span className="text-xs text-green-600 font-normal">
                        ({healthStats.bmi.status || '—'})
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <Heart className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Heart Rate</p>
                    <p className="text-sm font-semibold text-foreground">
                      {healthStats.heartRate.value || '—'} <span className="text-xs text-muted-foreground">bpm</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Blood Pressure</p>
                    <p className="text-sm font-semibold text-foreground">
                      {(healthStats.bloodPressure.systolic || healthStats.bloodPressure.diastolic) ? `${healthStats.bloodPressure.systolic || '—'}/${healthStats.bloodPressure.diastolic || '—'}` : '—'} <span className="text-xs text-muted-foreground">mmHg</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-background rounded-lg">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Weight</p>
                    <p className="text-sm font-semibold text-foreground">
                      {healthStats.weight?.value ? `${healthStats.weight.value} kg` : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-background rounded-lg">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Height</p>
                    <p className="text-sm font-semibold text-foreground">
                      {healthStats.height?.value ? `${healthStats.height.value} cm` : '—'}
                    </p>
                  </div>
                </div>
                {/* Editable controls in edit mode */}
                {editing && (
                  <div className="pt-3 border-t">
                    <h3 className="text-sm font-medium text-foreground mb-2">Edit Health Statistics</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Height (cm)</label>
                        <input type="number" value={healthStats.height.value || ''} onChange={(e) => setHealthStats({ ...healthStats, height: { value: e.target.value ? Number(e.target.value) : undefined } })} className="w-full px-2 py-1 border rounded text-sm" placeholder="e.g. 175" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Weight (kg)</label>
                        <input type="number" value={healthStats.weight.value || ''} onChange={(e) => setHealthStats({ ...healthStats, weight: { value: e.target.value ? Number(e.target.value) : undefined } })} className="w-full px-2 py-1 border rounded text-sm" placeholder="e.g. 72" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Heart Rate (bpm)</label>
                        <input type="number" value={healthStats.heartRate.value || ''} onChange={(e) => setHealthStats({ ...healthStats, heartRate: { value: Number(e.target.value) } })} className="w-full px-2 py-1 border rounded text-sm" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-muted-foreground">Blood Pressure (mmHg)</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="number" value={healthStats.bloodPressure.systolic || ''} onChange={(e) => setHealthStats({ ...healthStats, bloodPressure: { ...healthStats.bloodPressure, systolic: Number(e.target.value) } })} className="w-full px-2 py-1 border rounded text-sm" placeholder="Systolic" />
                          <input type="number" value={healthStats.bloodPressure.diastolic || ''} onChange={(e) => setHealthStats({ ...healthStats, bloodPressure: { ...healthStats.bloodPressure, diastolic: Number(e.target.value) } })} className="w-full px-2 py-1 border rounded text-sm" placeholder="Diastolic" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Appointments & Reports */}
            <div className="bg-card rounded-xl shadow-[0_4px_12px_rgba(20,29,35,0.08)] border-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-teal-600" />
                <h2 className="text-sm font-semibold text-foreground">Appointments & Reports</h2>
              </div>

              <div className="space-y-2 mb-3">
                <div className="p-2 border-l-4 border-green-500 bg-green-50 rounded">
                  <p className="text-xs text-green-700 font-medium mb-0.5">
                    Upcoming: {appointments.upcoming.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {appointments.upcoming.doctor} - {appointments.upcoming.date} @ {appointments.upcoming.time}
                  </p>
                </div>

                <div className="p-2 border-l-4 border-gray-300 bg-background rounded">
                  <p className="text-xs text-muted-foreground font-medium mb-0.5">
                    Recent: {appointments.recent.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {appointments.recent.doctor} - {appointments.recent.date}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <h3 className="text-sm font-medium text-foreground mb-2">Medical Reports</h3>
                <div className="space-y-1">
                  {medicalReports.map((report, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary cursor-pointer">
                      <FileText className="w-3 h-3" />
                      <span className="flex-1">{report.name}</span>
                      <span className="text-xs text-muted-foreground">- {report.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}