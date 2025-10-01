import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Eye, Edit, Trash2, Phone, Calendar, DollarSign, UserCheck, UserX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Technician } from "@shared/schema";

const technicianSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  name: z.string().min(1, "Technician name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  role: z.string().default("technician"),
  joiningDate: z.string().min(1, "Joining date is required"),
  baseSalary: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

type TechnicianFormData = z.infer<typeof technicianSchema>;

export default function Technicians() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: technicians, isLoading } = useQuery<Technician[]>({
    queryKey: ["/api/technicians"],
  });

  const form = useForm<TechnicianFormData>({
    resolver: zodResolver(technicianSchema),
    defaultValues: {
      employeeId: "",
      name: "",
      phone: "",
      role: "technician",
      joiningDate: "",
      baseSalary: "",
      status: "active",
    },
  });

  const createTechnicianMutation = useMutation({
    mutationFn: async (data: TechnicianFormData) => {
      const payload = {
        ...data,
        joiningDate: new Date(data.joiningDate),
        baseSalary: data.baseSalary || null,
      };
      const response = await apiRequest("POST", "/api/technicians", payload);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/technicians"] });
      toast({
        title: "Success",
        description: "Technician added successfully",
      });
      handleCloseModal();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add technician",
        variant: "destructive",
      });
    },
  });

  const updateTechnicianMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TechnicianFormData }) => {
      const payload = {
        ...data,
        joiningDate: new Date(data.joiningDate),
        baseSalary: data.baseSalary || null,
      };
      const response = await apiRequest("PATCH", `/api/technicians/${id}`, payload);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/technicians"] });
      toast({
        title: "Success",
        description: "Technician updated successfully",
      });
      handleCloseModal();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update technician",
        variant: "destructive",
      });
    },
  });

  const handleDeleteTechnician = async (technician: Technician) => {
    if (!window.confirm(`Are you sure you want to delete technician ${technician.name}?`)) {
      return;
    }

    try {
      await apiRequest("DELETE", `/api/technicians/${technician.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/technicians"] });
      toast({
        title: "Success",
        description: `${technician.name} has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete technician.",
        variant: "destructive",
      });
    }
  };

  const handleOpenModal = (technician?: Technician) => {
    if (technician) {
      setEditingTechnician(technician);
      form.reset({
        employeeId: technician.employeeId,
        name: technician.name,
        phone: technician.phone,
        role: technician.role,
        joiningDate: new Date(technician.joiningDate).toISOString().split('T')[0],
        baseSalary: technician.baseSalary ? technician.baseSalary.toString() : "",
        status: (technician.status as "active" | "inactive") || "active",
      });
    } else {
      setEditingTechnician(null);
      form.reset();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTechnician(null);
    form.reset();
  };

  const onSubmit = (data: TechnicianFormData) => {
    if (editingTechnician) {
      updateTechnicianMutation.mutate({ id: editingTechnician.id.toString(), data });
    } else {
      createTechnicianMutation.mutate(data);
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-success-100 text-success-800'
      : 'bg-error-100 text-error-800';
  };

  const filteredTechnicians = technicians?.filter(technician => {
    const matchesSearch = 
      technician.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      technician.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      technician.phone.includes(searchTerm);

    const matchesStatus = statusFilter === "all" || technician.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Technicians</h1>
        <p className="text-sm text-gray-500">Manage technician information and performance</p>
      </div>

      {/* Search and Actions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, employee ID, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => handleOpenModal()}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Technician
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Technicians Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Technicians ({filteredTechnicians?.length || 0})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!filteredTechnicians || filteredTechnicians.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== "all" ? "No technicians found" : "No technicians yet"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria" 
                  : "Add your first technician to get started"
                }
              </p>
              {(!searchTerm && statusFilter === "all") && (
                <Button
                  onClick={() => handleOpenModal()}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Technician
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Technician</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joining Date</TableHead>
                    <TableHead>Base Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTechnicians.map((technician) => (
                    <TableRow key={technician.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-medium text-sm">
                              {technician.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{technician.name}</p>
                            <p className="text-sm text-gray-500">{technician.role}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{technician.employeeId}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{technician.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{technician.role}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {new Date(technician.joiningDate).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {technician.baseSalary ? (
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span>₹{technician.baseSalary.toLocaleString()}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(technician.status || 'active')}>
                          <div className="flex items-center space-x-1">
                            {technician.status === 'active' ? (
                              <UserCheck className="h-3 w-3" />
                            ) : (
                              <UserX className="h-3 w-3" />
                            )}
                            <span className="capitalize">{technician.status || 'active'}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleOpenModal(technician)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-error-600 hover:text-error-700"
                            onClick={() => handleDeleteTechnician(technician)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Technician Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTechnician ? "Edit Technician" : "Add New Technician"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee ID *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter employee ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter technician name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="technician">Technician</SelectItem>
                          <SelectItem value="senior_technician">Senior Technician</SelectItem>
                          <SelectItem value="supervisor">Supervisor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="joiningDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Joining Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="baseSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Salary</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Enter base salary" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary-600 hover:bg-primary-700"
                  disabled={createTechnicianMutation.isPending || updateTechnicianMutation.isPending}
                >
                  {createTechnicianMutation.isPending || updateTechnicianMutation.isPending 
                    ? "Saving..." 
                    : editingTechnician ? "Update Technician" : "Add Technician"
                  }
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
