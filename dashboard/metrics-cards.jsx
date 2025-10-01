import { TrendingUp, CheckCircle, Clock, DollarSign } from "lucide-react";
export default function MetricsCards(_a) {
    var _b;
    var metrics = _a.metrics;
    var cards = [
        {
            title: "Active Jobs",
            value: (metrics === null || metrics === void 0 ? void 0 : metrics.activeJobs) || 0,
            change: "+12% from yesterday",
            changeType: "positive",
            icon: TrendingUp,
            iconBg: "bg-primary-100",
            iconColor: "text-primary-600",
        },
        {
            title: "Completed Today",
            value: (metrics === null || metrics === void 0 ? void 0 : metrics.completedToday) || 0,
            change: "+8% from yesterday",
            changeType: "positive",
            icon: CheckCircle,
            iconBg: "bg-success-100",
            iconColor: "text-success-600",
        },
        {
            title: "Pending Jobs",
            value: (metrics === null || metrics === void 0 ? void 0 : metrics.pendingJobs) || 0,
            change: "3 overdue",
            changeType: "warning",
            icon: Clock,
            iconBg: "bg-warning-100",
            iconColor: "text-warning-600",
        },
        {
            title: "Today's Revenue",
            value: "\u20B9".concat(((_b = metrics === null || metrics === void 0 ? void 0 : metrics.todayRevenue) === null || _b === void 0 ? void 0 : _b.toLocaleString()) || 0),
            change: "+15% from yesterday",
            changeType: "positive",
            icon: DollarSign,
            iconBg: "bg-accent-100",
            iconColor: "text-accent-600",
        },
    ];
    return (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map(function (card, index) {
            var Icon = card.icon;
            return (<div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                <p className={"text-sm mt-1 ".concat(card.changeType === 'positive' ? 'text-success-600' :
                    card.changeType === 'warning' ? 'text-warning-600' : 'text-gray-500')}>
                  {card.changeType === 'positive' && <TrendingUp className="inline h-3 w-3 mr-1"/>}
                  {card.changeType === 'warning' && <Clock className="inline h-3 w-3 mr-1"/>}
                  {card.change}
                </p>
              </div>
              <div className={"w-12 h-12 ".concat(card.iconBg, " rounded-lg flex items-center justify-center")}>
                <Icon className={"".concat(card.iconColor, " h-6 w-6")}/>
              </div>
            </div>
          </div>);
        })}
    </div>);
}
