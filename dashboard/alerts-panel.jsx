import { AlertTriangle, CreditCard, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function AlertsPanel(_a) {
    var _b;
    var metrics = _a.metrics;
    var alerts = [
        {
            title: "".concat((metrics === null || metrics === void 0 ? void 0 : metrics.pendingJobs) || 0, " Overdue Jobs"),
            description: "Jobs pending beyond scheduled time",
            icon: AlertTriangle,
            bgColor: "bg-error-50",
            borderColor: "border-error-200",
            iconColor: "text-error-600",
            textColor: "text-error-800",
            descColor: "text-error-600",
        },
        {
            title: "\u20B9".concat(((_b = metrics === null || metrics === void 0 ? void 0 : metrics.totalDue) === null || _b === void 0 ? void 0 : _b.toLocaleString()) || 0, " Payment Due"),
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
            description: "".concat((metrics === null || metrics === void 0 ? void 0 : metrics.lowStock) || 0, " items below minimum threshold"),
            icon: Package,
            bgColor: "bg-error-50",
            borderColor: "border-error-200",
            iconColor: "text-error-600",
            textColor: "text-error-800",
            descColor: "text-error-600",
        },
    ];
    return (<Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map(function (alert, index) {
            var Icon = alert.icon;
            return (<div key={index} className={"p-4 ".concat(alert.bgColor, " border ").concat(alert.borderColor, " rounded-lg")}>
                <div className="flex items-start">
                  <Icon className={"".concat(alert.iconColor, " mt-1 mr-3 h-4 w-4")}/>
                  <div>
                    <p className={"text-sm font-medium ".concat(alert.textColor)}>{alert.title}</p>
                    <p className={"text-xs ".concat(alert.descColor, " mt-1")}>{alert.description}</p>
                  </div>
                </div>
              </div>);
        })}
        </div>

        <button className="w-full mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium">
          View All Alerts
        </button>
      </CardContent>
    </Card>);
}
