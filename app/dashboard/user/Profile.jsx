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
      <div className="min-h-screen bg-surface p-stack-lg font-body-md text-on-surface">
        <div className="max-w-7xl mx-auto">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-xl">
            <p className="text-on-surface-variant font-label-md">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface p-stack-lg font-body-md text-on-surface">
        <div className="max-w-7xl mx-auto">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-xl">
            <p className="text-error font-label-md">Failed to load user data</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface p-stack-lg font-body-md text-on-surface">
      {/* Simple toast */}
      {toast.visible && (
        <div className={`fixed top-6 right-6 z-50 px-stack-md py-stack-sm rounded shadow-lg ${toast.type === 'success' ? 'bg-primary text-on-primary font-bold' : toast.type === 'error' ? 'bg-error text-on-error font-bold' : 'bg-surface-variant text-on-surface-variant font-bold'}`}>
          {toast.message}
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg mb-stack-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-stack-md">
              <div className="relative">
                <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-on-primary-container" />
                </div>
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <h1 className="font-headline-md text-headline-md font-bold text-on-surface">{getUserName(user)}</h1>
                <p className="font-label-md text-label-md text-on-surface-variant">{getUserName(user)}</p>
              </div>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-stack-sm px-stack-md py-stack-sm bg-primary text-on-primary rounded-lg font-label-md font-bold transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-gutter">
            {/* Personal Information */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg">
              <div className="flex items-center gap-stack-sm mb-stack-lg">
                <span className="material-symbols-outlined text-primary" data-icon="person">person</span>
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Personal Information</h2>
              </div>

              {!editing ? (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Full Name</label>
                    <div className="px-4 py-2 bg-background rounded-lg text-foreground">
                      {getUserName(user)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Date of Birth</label>
                    <div className="px-4 py-2 bg-background rounded-lg text-foreground">
                      {formData.dateOfBirth || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Gender</label>
                    <div className="px-4 py-2 bg-background rounded-lg text-foreground capitalize">
                      {formData.gender}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Blood Group</label>
                    <div className="px-4 py-2 bg-background rounded-lg text-foreground">
                      {formData.bloodGroup || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Phone Number</label>
                    <div className="px-4 py-2 bg-background rounded-lg text-foreground">
                      {formData.phone || 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Email Address</label>
                    <div className="px-4 py-2 bg-background rounded-lg text-foreground">
                      {user.email}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Weight</label>
                    <div className="px-4 py-2 bg-background rounded-lg text-foreground">
                      {healthStats.weight?.value ? `${healthStats.weight.value} kg` : 'Not provided'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Height</label>
                    <div className="px-4 py-2 bg-background rounded-lg text-foreground">
                      {healthStats.height?.value ? `${healthStats.height.value} cm` : 'Not provided'}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm text-muted-foreground mb-1 block">Blood Pressure</label>
                    <div className="px-4 py-2 bg-background rounded-lg text-foreground">
                      {(healthStats.bloodPressure?.systolic !== undefined && healthStats.bloodPressure?.diastolic !== undefined)
                        ? `${healthStats.bloodPressure.systolic}/${healthStats.bloodPressure.diastolic} mmHg`
                        : (healthStats.bloodPressure?.systolic !== undefined ? `${healthStats.bloodPressure.systolic} mmHg` : (healthStats.bloodPressure?.diastolic !== undefined ? `${healthStats.bloodPressure.diastolic} mmHg` : 'Not provided'))}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm text-muted-foreground mb-1 block">Address</label>
                    <div className="px-4 py-2 bg-background rounded-lg text-foreground">
                      {formData.address || 'Not provided'}
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">First Name</label>
                      <input
                        type="text"
                        value={formData.firstName || ''}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName || ''}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Last name"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Date of Birth</label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Blood Group</label>
                      <input
                        type="text"
                        value={formData.bloodGroup}
                        onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., A+, O-, B+"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-muted-foreground mb-2">Address</label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your address"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="px-6 py-2 bg-gray-200 text-foreground rounded-lg hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Medical Information */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg">
              <div className="flex items-center gap-stack-sm mb-stack-lg">
                <span className="material-symbols-outlined text-secondary" data-icon="medical_information">medical_information</span>
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Medical Information</h2>
              </div>

              <div className="space-y-4">
                {/* Allergies */}
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Allergies</h3>
                    <p className="text-sm text-muted-foreground">
                      {formData.allergies.length > 0 ? formData.allergies.join(', ') : 'No known allergies'}
                    </p>
                  </div>
                </div>

                {/* Chronic Conditions */}
                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-100">
                  <Activity className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Chronic Conditions</h3>
                    <p className="text-sm text-muted-foreground">
                      {formData.conditions.length > 0 ? formData.conditions.join(', ') : 'No chronic conditions'}
                    </p>
                  </div>
                </div>

                {/* Current Medications */}
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg border border-blue-100">
                  <Pill className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Current Medications</h3>
                    <p className="text-sm text-muted-foreground">
                      {formData.medications.length > 0 ? formData.medications.join(', ') : 'No current medications'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-gutter">
            {/* Health Statistics */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg">
              <div className="flex items-center gap-stack-sm mb-stack-md">
                <span className="material-symbols-outlined text-error" data-icon="monitor_heart">monitor_heart</span>
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Health Statistics</h2>
              </div>

              <div className="space-y-stack-md">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">BMI</p>
                    <p className="text-lg font-bold text-foreground">
                      {healthStats.bmi.value || '—'}{' '}
                      <span className="text-sm text-green-600 font-normal">
                        ({healthStats.bmi.status || '—'})
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Heart className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Heart Rate</p>
                    <p className="text-lg font-bold text-foreground">
                      {healthStats.heartRate.value || '—'} <span className="text-sm text-muted-foreground">bpm</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Blood Pressure</p>
                    <p className="text-lg font-bold text-foreground">
                      {(healthStats.bloodPressure.systolic || healthStats.bloodPressure.diastolic) ? `${healthStats.bloodPressure.systolic || '—'}/${healthStats.bloodPressure.diastolic || '—'}` : '—'} <span className="text-sm text-muted-foreground">mmHg</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Weight</p>
                    <p className="text-lg font-bold text-foreground">
                      {healthStats.weight?.value ? `${healthStats.weight.value} kg` : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Height</p>
                    <p className="text-lg font-bold text-foreground">
                      {healthStats.height?.value ? `${healthStats.height.value} cm` : '—'}
                    </p>
                  </div>
                </div>
                {/* Editable controls in edit mode */}
                {editing && (
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold text-foreground mb-3">Edit Health Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">Height (cm)</label>
                        <input type="number" value={healthStats.height.value || ''} onChange={(e) => setHealthStats({ ...healthStats, height: { value: e.target.value ? Number(e.target.value) : undefined } })} className="w-full px-3 py-2 border rounded" placeholder="e.g. 175" />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Weight (kg)</label>
                        <input type="number" value={healthStats.weight.value || ''} onChange={(e) => setHealthStats({ ...healthStats, weight: { value: e.target.value ? Number(e.target.value) : undefined } })} className="w-full px-3 py-2 border rounded" placeholder="e.g. 72" />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Heart Rate (bpm)</label>
                        <input type="number" value={healthStats.heartRate.value || ''} onChange={(e) => setHealthStats({ ...healthStats, heartRate: { value: Number(e.target.value) } })} className="w-full px-3 py-2 border rounded" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-sm text-muted-foreground">Blood Pressure (mmHg)</label>
                        <div className="grid grid-cols-2 gap-2">
                          <input type="number" value={healthStats.bloodPressure.systolic || ''} onChange={(e) => setHealthStats({ ...healthStats, bloodPressure: { ...healthStats.bloodPressure, systolic: Number(e.target.value) } })} className="w-full px-3 py-2 border rounded" placeholder="Systolic" />
                          <input type="number" value={healthStats.bloodPressure.diastolic || ''} onChange={(e) => setHealthStats({ ...healthStats, bloodPressure: { ...healthStats.bloodPressure, diastolic: Number(e.target.value) } })} className="w-full px-3 py-2 border rounded" placeholder="Diastolic" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Appointments & Reports */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-stack-lg">
              <div className="flex items-center gap-stack-sm mb-stack-md">
                <span className="material-symbols-outlined text-primary" data-icon="calendar_month">calendar_month</span>
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Appointments & Reports</h2>
              </div>

              <div className="space-y-3 mb-4">
                <div className="p-3 border-l-4 border-green-500 bg-green-50 rounded">
                  <p className="text-xs text-green-700 font-semibold mb-1">
                    Upcoming: {appointments.upcoming.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {appointments.upcoming.doctor} - {appointments.upcoming.date} @ {appointments.upcoming.time}
                  </p>
                </div>

                <div className="p-3 border-l-4 border-gray-300 bg-background rounded">
                  <p className="text-xs text-muted-foreground font-semibold mb-1">
                    Recent: {appointments.recent.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {appointments.recent.doctor} - {appointments.recent.date}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="font-semibold text-foreground mb-3 text-sm">Medical Reports</h3>
                <div className="space-y-2">
                  {medicalReports.map((report, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary cursor-pointer">
                      <FileText className="w-4 h-4" />
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