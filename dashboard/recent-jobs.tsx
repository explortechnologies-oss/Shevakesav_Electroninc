import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobSheetWithDetails } from "@/types";

export default function RecentJobs() {
  const { data: jobs, isLoading } = useQuery<JobSheetWithDetails[]>({
    queryKey: ["/api/job-sheets"],
  });

  const getStatusColor = (status: string) => {
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

  const formatStatus = (status: string) => {
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
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentJobs = jobs?.slice(0, 3) || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-gray-900">Recent Jobs</CardTitle>
        <a href="/job-sheet" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          View All
        </a>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No jobs found. Create your first job sheet to get started.</p>
            </div>
          ) : (
            recentJobs.map((job) => {
              const initials = job.customer?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'N/A';
              
              return (
                <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="text-primary-600 font-medium text-sm">{initials}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{job.jobId}</p>
                      <p className="text-sm text-gray-600">
                        {job.customer?.name} - {job.productType?.displayName}
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
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
