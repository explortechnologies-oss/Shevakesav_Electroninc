import { AlertTriangle, CreditCard, Package } from "lucide-react";
import { DashboardMetrics } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AlertsPanelProps {
  metrics?: DashboardMetrics;
}

export default function AlertsPanel({ metrics }: AlertsPanelProps) {
  const alerts = [
    {
      title: `${metrics?.pendingJobs || 0} Overdue Jobs`,
      description: "Jobs pending beyond scheduled time",
      icon: AlertTriangle,
      bgColor: "bg-error-50",
      borderColor: "border-error-200",
      iconColor: "text-error-600",
      textColor: "text-error-800",
      descColor: "text-error-600",
    },
    {
      title: `₹${metrics?.totalDue?.toLocaleString() || 0} Payment Due`,
      description: "From customers this week",
      icon: CreditCard,
      bgColor: "bg-warning-50",
      borderColor: "border-warning-200",
      iconColor: "text-warning-600",
      textColor: "text-warning-800",
      descColor: "text-warning-600",
    },
    {
      title: "Low Stock Items",
      description: `${metrics?.lowStock || 0} items below minimum threshold`,
      icon: Package,
      bgColor: "bg-error-50",
      borderColor: "border-error-200",
      iconColor: "text-error-600",
      textColor: "text-error-800",
      descColor: "text-error-600",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert, index) => {
            const Icon = alert.icon;
            return (
              <div key={index} className={`p-4 ${alert.bgColor} border ${alert.borderColor} rounded-lg`}>
                <div className="flex items-start">
                  <Icon className={`${alert.iconColor} mt-1 mr-3 h-4 w-4`} />
                  <div>
                    <p className={`text-sm font-medium ${alert.textColor}`}>{alert.title}</p>
                    <p className={`text-xs ${alert.descColor} mt-1`}>{alert.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button className="w-full mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium">
          View All Alerts
        </button>
      </CardContent>
    </Card>
  );
}
