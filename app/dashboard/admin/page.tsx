'use client'

import React from 'react'
import AdminTopCards from '@/components/Dashboard/Admin/TopCards'
import PendingApprovals from '@/components/Dashboard/Admin/PendingApprovals'
import RecentDoctors from '@/components/Dashboard/Admin/RecentDoctors'
import RecentPatients from '@/components/Dashboard/Admin/RecentPatients'
import RecentAppointments from '@/components/Dashboard/Admin/RecentAppointments'
import QuickActions from '@/components/Dashboard/Admin/QuickActions'
import AdminSidebar from '@/components/Dashboard/Admin/Sidebar'

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-surface font-body-md text-on-surface">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-stack-xl">
        <div>
          <div className="mb-stack-lg">
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Admin Command Center</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Platform Management & Moderation</p>
          </div>

          {/* Top Stats Cards */}
          <AdminTopCards />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {/* Left Column */}
            <div className="col-span-1 lg:col-span-8 flex flex-col gap-gutter">
              <PendingApprovals />
              <RecentDoctors />
              <RecentPatients />
            </div>

            {/* Right Column */}
            <div className="col-span-1 lg:col-span-4 flex flex-col gap-gutter">
              <QuickActions />
              <RecentAppointments />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
