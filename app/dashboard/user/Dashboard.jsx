import TopCards from '@/components/TopCards';
import Appointments from '@/components/Dashboard/Appointments';
import Predictions from '@/components/Dashboard/Predictions';
import HealthAnalytics from '@/components/Dashboard/HealthAnalytics';
import HealthTips from '@/components/Dashboard/HealthTips';
import HealthMetrics from '@/components/Dashboard/HealthMetrics';

export default function MainDashboard() {
  return (
    <div>
      <TopCards />

      <div className="grid grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="col-span-2 space-y-8">
          <Appointments />
          <Predictions />
          <HealthAnalytics />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <HealthTips />
          <HealthMetrics />
        </div>
      </div>
    </div>
  )
}
