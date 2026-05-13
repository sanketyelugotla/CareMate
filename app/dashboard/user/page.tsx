'use client'

import React, { useState } from 'react';
import Sidebar from '@/components/Dashboard/Sidebar';
import MainDashboard from './Dashboard'
import Prediction from './Prediction'
import Appointments from './Appointments';
import MyAppointments from './MyAppointments';
import Reports from './Reports'
import Profile from './Profile'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 overflow-y-auto">

        <div className="p-8">
          {activeTab === 'dashboard' && <MainDashboard />}
          {activeTab === 'prediction' && <Prediction />}
          {activeTab === 'appointments' && <Appointments />}
          {activeTab === 'my-appointments' && <MyAppointments />}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'profile' && <Profile />}
        </div>
      </div>
    </div>
  );
}