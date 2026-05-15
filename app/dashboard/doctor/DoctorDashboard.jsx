'use client'

import React, { useState } from 'react';
import DoctorTopCards from '@/components/Dashboard/Doctor/TopCards';
import TodayAppointments from '@/components/Dashboard/Doctor/TodayAppointments';
import UpcomingAppointments from '@/components/Dashboard/Doctor/UpcomingAppointments';
import ScheduleOverview from '@/components/Dashboard/Doctor/ScheduleOverview';
import QuickActions from '@/components/Dashboard/Doctor/QuickActions';
import DoctorSchedule from './DoctorSchedule';
import { Calendar, X } from 'lucide-react';

export default function CompleteDoctorDashboard() {
  const [showSchedulePanel, setShowSchedulePanel] = useState(false);

  return (
    <div className="relative">
      {/* Schedule Panel Toggle Button */}
      <div className="fixed right-8 bottom-8 z-40">
        <button
          onClick={() => setShowSchedulePanel(!showSchedulePanel)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110"
          title="Manage Schedule"
        >
          {showSchedulePanel ? <X size={24} /> : <Calendar size={24} />}
        </button>
      </div>

      {/* Schedule Side Panel */}
      {showSchedulePanel && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-background/30 backdrop-blur-sm z-40"
            onClick={() => setShowSchedulePanel(false)}
          />

          {/* Panel */}
          <div className="fixed right-0 top-0 h-screen w-2/3 bg-card shadow-2xl z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Manage Schedule</h2>
                <button
                  onClick={() => setShowSchedulePanel(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <DoctorSchedule />
            </div>
          </div>
        </>
      )}

      {/* Main Dashboard Content */}
      <div>
        {/* Top Stats Cards */}
        <DoctorTopCards />

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="col-span-2 space-y-8">
            <TodayAppointments />
            <UpcomingAppointments />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            <ScheduleOverview onManageClick={() => setShowSchedulePanel(true)} />
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}
