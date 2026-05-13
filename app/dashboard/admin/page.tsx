'use client'

import React from 'react'
import AdminTopCards from '@/components/Dashboard/Admin/TopCards'
import PendingApprovals from '@/components/Dashboard/Admin/PendingApprovals'
import RecentDoctors from '@/components/Dashboard/Admin/RecentDoctors'
import RecentPatients from '@/components/Dashboard/Admin/RecentPatients'
import RecentAppointments from '@/components/Dashboard/Admin/RecentAppointments'
import QuickActions from '@/components/Dashboard/Admin/QuickActions'

export default function AdminDashboard() {
  return (
    <div>
      {/* Top Stats Cards */}
      <AdminTopCards />

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-8">
        {/* Left Column - 2/3 width */}
        <div className="col-span-2 space-y-8">
          <PendingApprovals />
          <RecentDoctors />
          <RecentPatients />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          <QuickActions />
          <RecentAppointments />
        </div>
      </div>
    </div>
  )
}
