import { CheckCircle, AlertTriangle, XCircle, Microchip, Plug } from "lucide-react";
import { DashboardMetrics } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StockStatusProps {
  metrics?: DashboardMetrics;
}

export default function StockStatus({ metrics }: StockStatusProps) {
  const stockCategories = [
    {
      title: "Available Stock",
      value: metrics?.availableStock || 0,
      icon: CheckCircle,
      bgColor: "bg-success-50",
      borderColor: "border-success-200",
      iconColor: "text-success-600",
      textColor: "text-success-800",
    },
    {
      title: "Low Stock",
      value: metrics?.lowStock || 0,
      icon: AlertTriangle,
      bgColor: "bg-warning-50",
      borderColor: "border-warning-200",
      iconColor: "text-warning-600",
      textColor: "text-warning-800",
    },
    {
      title: "Out of Stock",
      value: metrics?.outOfStock || 0,
      icon: XCircle,
      bgColor: "bg-error-50",
      borderColor: "border-error-200",
      iconColor: "text-error-600",
      textColor: "text-error-800",
    },
  ];

  const criticalItems = [
    {
      name: "AC Compressor",
      category: "Spare Parts",
      quantity: "2 left",
      reorderLevel: "Min: 5",
      icon: Microchip,
      iconBg: "bg-error-100",
      iconColor: "text-error-600",
      quantityColor: "text-error-600",
    },
    {
      name: "Power Cables",
      category: "Accessories",
      quantity: "8 left",
      reorderLevel: "Min: 20",
      icon: Plug,
      iconBg: "bg-warning-100",
      iconColor: "text-warning-600",
      quantityColor: "text-warning-600",
    },
  ];

  return (
    <div className="lg:col-span-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Stock Status</CardTitle>
          <a href="/inventory" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Manage Inventory
          </a>
        </CardHeader>
        <CardContent>
          {/* Stock Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {stockCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div key={index} className={`p-4 ${category.bgColor} rounded-lg border ${category.borderColor}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${category.textColor}`}>{category.title}</p>
                      <p className={`text-2xl font-bold ${category.iconColor}`}>{category.value}</p>
                    </div>
                    <Icon className={`${category.iconColor} h-5 w-5`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Critical Stock Items */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Critical Stock Items</h4>
            <div className="space-y-3">
              {criticalItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 ${item.iconBg} rounded-lg flex items-center justify-center`}>
                        <Icon className={`${item.iconColor} h-4 w-4`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${item.quantityColor}`}>{item.quantity}</p>
                      <p className="text-xs text-gray-500">{item.reorderLevel}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
