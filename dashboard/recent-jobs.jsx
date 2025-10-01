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
import { Badge } from "@/components/ui/badge";
export default function RecentJobs() {
    var _a = useQuery({
        queryKey: ["/api/job-sheets"],
    }), jobs = _a.data, isLoading = _a.isLoading;
    var getStatusColor = function (status) {
        switch (status) {
            case 'completed':
                return 'bg-success-100 text-success-800';
            case 'in_progress':
                return 'bg-warning-100 text-warning-800';
            case 'pending':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-error-100 text-error-800';
        }
    };
    var formatStatus = function (status) {
        switch (status) {
            case 'in_progress':
                return 'In Progress';
            case 'completed':
                return 'Completed';
            case 'pending':
                return 'Pending';
            default:
                return status;
        }
    };
    if (isLoading) {
        return (<Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {__spreadArray([], Array(3), true).map(function (_, i) { return (<div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>); })}
          </div>
        </CardContent>
      </Card>);
    }
    var recentJobs = (jobs === null || jobs === void 0 ? void 0 : jobs.slice(0, 3)) || [];
    return (<Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-900">Recent Jobs</CardTitle>
        <a href="/job-sheet" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          View All
        </a>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentJobs.length === 0 ? (<div className="text-center py-8 text-gray-500">
              <p>No jobs found. Create your first job sheet to get started.</p>
            </div>) : (recentJobs.map(function (job) {
            var _a, _b, _c, _d;
            var initials = ((_b = (_a = job.customer) === null || _a === void 0 ? void 0 : _a.name) === null || _b === void 0 ? void 0 : _b.split(' ').map(function (n) { return n[0]; }).join('').toUpperCase()) || 'N/A';
            return (<div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="text-primary-600 font-medium text-sm">{initials}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{job.jobId}</p>
                      <p className="text-sm text-gray-600">
                        {(_c = job.customer) === null || _c === void 0 ? void 0 : _c.name} - {(_d = job.productType) === null || _d === void 0 ? void 0 : _d.displayName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(job.status)}>
                      {formatStatus(job.status)}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>);
        }))}
        </div>
      </CardContent>
    </Card>);
}
