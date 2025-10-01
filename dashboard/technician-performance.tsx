import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star } from "lucide-react";

export default function TechnicianPerformance() {
  const { data: technicians, isLoading } = useQuery({
    queryKey: ["/api/technicians"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Technicians</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const topTechnicians = (technicians as any[])?.slice(0, 3) || [];

  return (
    <Card>
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
          {topTechnicians.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No technicians found. Add technicians to track performance.</p>
            </div>
          ) : (
            topTechnicians.map((technician, index) => {
              const initials = technician.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'T';
              const rating = 4.5 + (index * 0.1); // Mock rating
              const jobCount = Math.floor(Math.random() * 20) + 10; // Mock job count
              
              return (
                <div key={technician.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${index === 0 ? 'bg-primary-600' : index === 1 ? 'bg-secondary-600' : 'bg-success-600'} rounded-full flex items-center justify-center`}>
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
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3 w-3 ${i < Math.floor(rating) ? 'fill-current' : ''}`} 
                        />
                      ))}
                    </div>
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
