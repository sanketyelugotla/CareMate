'use client'

import React from 'react';
import MainDashboard from '../Dashboard'
import Prediction from '../Prediction'
import Appointments from '../Appointments';
import MyAppointments from '../MyAppointments';
import Profile from '../Profile'

export default function TabPage({ params }: { params: { tab: string } }) {
    const { tab } = params;

    const renderComponent = () => {
        switch (tab) {
            case 'dashboard':
                return <MainDashboard />;
            case 'prediction':
                return <Prediction />;
            case 'appointments':
                return <Appointments />;
            case 'my-appointments':
                return <MyAppointments />;
            case 'profile':
                return <Profile />;
            default:
                return <MainDashboard />;
        }
    };

    return renderComponent();
}
