var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star } from "lucide-react";
export default function TechnicianPerformance() {
    var _a = useQuery({
        queryKey: ["/api/technicians"],
    }), technicians = _a.data, isLoading = _a.isLoading;
    if (isLoading) {
        return (<Card>
        <CardHeader>
          <CardTitle>Top Technicians</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {__spreadArray([], Array(3), true).map(function (_, i) { return (<div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded-lg"></div>
              </div>); })}
          </div>
        </CardContent>
      </Card>);
    }
    var topTechnicians = (technicians === null || technicians === void 0 ? void 0 : technicians.slice(0, 3)) || [];
    return (<Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-900">Top Technicians</CardTitle>
        <Select defaultValue="week">
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="lastmonth">Last Month</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topTechnicians.length === 0 ? (<div className="text-center py-8 text-gray-500">
              <p>No technicians found. Add technicians to track performance.</p>
            </div>) : (topTechnicians.map(function (technician, index) {
            var _a;
            var initials = ((_a = technician.name) === null || _a === void 0 ? void 0 : _a.split(' ').map(function (n) { return n[0]; }).join('').toUpperCase()) || 'T';
            var rating = 4.5 + (index * 0.1); // Mock rating
            var jobCount = Math.floor(Math.random() * 20) + 10; // Mock job count
            return (<div key={technician.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={"w-10 h-10 ".concat(index === 0 ? 'bg-primary-600' : index === 1 ? 'bg-secondary-600' : 'bg-success-600', " rounded-full flex items-center justify-center")}>
                      <span className="text-white font-medium text-sm">{initials}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{technician.name}</p>
                      <p className="text-sm text-gray-600">{jobCount} jobs completed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{rating.toFixed(1)}</p>
                    <div className="flex text-yellow-400">
                      {__spreadArray([], Array(5), true).map(function (_, i) { return (<Star key={i} className={"h-3 w-3 ".concat(i < Math.floor(rating) ? 'fill-current' : '')}/>); })}
                    </div>
                  </div>
                </div>);
        }))}
        </div>
      </CardContent>
    </Card>);
}
