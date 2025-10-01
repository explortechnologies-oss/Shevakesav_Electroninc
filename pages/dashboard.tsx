import { useQuery } from "@tanstack/react-query";
import MetricsCards from "@/components/dashboard/metrics-cards";
import PaymentOverview from "@/components/dashboard/payment-overview";
import AlertsPanel from "@/components/dashboard/alerts-panel";
import RecentJobs from "@/components/dashboard/recent-jobs";
import TechnicianPerformance from "@/components/dashboard/technician-performance";
import StockStatus from "@/components/dashboard/stock-status";
import QuickActions from "@/components/dashboard/quick-actions";
import { DashboardMetrics } from "@/types";

export default function Dashboard() {
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Key Metrics */}
      <MetricsCards metrics={metrics} />

      {/* Payment Overview & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <PaymentOverview metrics={metrics} />
        <AlertsPanel metrics={metrics} />
      </div>

      {/* Recent Jobs & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RecentJobs />
        <TechnicianPerformance />
      </div>

      {/* Stock Status & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StockStatus metrics={metrics} />
        <QuickActions />
      </div>
    </div>
  );
}
