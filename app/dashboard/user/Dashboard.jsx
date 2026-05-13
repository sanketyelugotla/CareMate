import TopCards from '@/components/TopCards';
import Appointments from '@/components/Dashboard/Appointments';
import Predictions from '@/components/Dashboard/Predictions';
import HealthAnalytics from '@/components/Dashboard/HealthAnalytics';
import HealthTips from '@/components/Dashboard/HealthTips';
import HealthMetrics from '@/components/Dashboard/HealthMetrics';
import Reminders from '@/components/Dashboard/Reminders';

export default function MainDashboard() {
  return (
    <div className="font-body-md text-on-surface">
        <div className="flex justify-between items-end mb-stack-lg">
            <div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Patient Overview</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Your Health at a Glance</p>
            </div>
        </div>

        <TopCards />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {/* Left Column */}
            <div className="col-span-1 lg:col-span-8 flex flex-col gap-gutter">
                <Appointments />
                <Predictions />
                <HealthAnalytics />
            </div>

            {/* Right Column */}
            <div className="col-span-1 lg:col-span-4 flex flex-col gap-gutter">
                <HealthTips />
                <HealthMetrics />
                <Reminders />
            </div>
        </div>
    </div>
  )
}
