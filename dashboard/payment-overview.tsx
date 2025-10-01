import { DashboardMetrics } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaymentOverviewProps {
  metrics?: DashboardMetrics;
}

export default function PaymentOverview({ metrics }: PaymentOverviewProps) {
  return (
    <div className="lg:col-span-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Payment Overview</CardTitle>
          <Select defaultValue="7days">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="3months">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Collected</p>
              <p className="text-2xl font-bold text-success-600">
                ₹{metrics?.totalCollected?.toLocaleString() || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Due</p>
              <p className="text-2xl font-bold text-warning-600">
                ₹{metrics?.totalDue?.toLocaleString() || 0}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Profit</p>
              <p className="text-2xl font-bold text-primary-600">
                ₹{((metrics?.totalCollected || 0) - (metrics?.totalDue || 0)).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Payment Trend Chart</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
