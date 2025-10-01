import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Eye, Edit, Trash2, Phone, MapPin, FileText, Receipt, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Customer } from "@shared/schema";
import { useLocation } from "wouter";

const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
  alternatePhone: z.string().optional().or(z.literal("")),
  address: z.string().min(1, "Address is required"),
  city: z.string().optional(),
  state: z.string().optional(),
  pinCode: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

export default function Customers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: customers, isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      phone: "",
      alternatePhone: "",
      address: "",
      city: "",
      state: "",
      pinCode: "",
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      console.log("Creating customer with data:", data);
      
      const response = await apiRequest("POST", "/api/customers", data);
      
      console.log("Response status:", response.status, response.ok);
      
      const result = await response.json();
      console.log("Customer created successfully:", result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Success",
        description: "Customer created successfully",
      });
      handleCloseModal();
    },
    onError: (error: any) => {
      console.error("Customer creation error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create customer",
        variant: "destructive",
      });
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CustomerFormData }) => {
      const response = await apiRequest("PATCH", `/api/customers/${id}`, data);
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Success",
        description: "Customer updated successfully",
      });
      handleCloseModal();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update customer",
        variant: "destructive",
      });
    },
  });

  const handleDeleteCustomer = async (customer: Customer) => {
    if (!window.confirm(`Are you sure you want to delete ${customer.name}?`)) {
      return;
    }

    try {
      await apiRequest("DELETE", `/api/customers/${customer.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Success",
        description: `${customer.name} has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete customer.",
        variant: "destructive",
      });
    }
  };

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      form.reset({
        name: customer.name,
        phone: customer.phone,
        alternatePhone: customer.alternatePhone || "",
        address: customer.address,
        city: customer.city || "",
        state: customer.state || "",
        pinCode: customer.pinCode || "",
      });
    } else {
      setEditingCustomer(null);
      form.reset();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    form.reset();
  };

  // Navigation handlers for creating documents from customer data
  const handleCreateJobSheet = (customer: Customer) => {
    // Store customer data in localStorage for the job sheet form
    localStorage.setItem('customerData', JSON.stringify({
      customerId: customer.id,
      customerName: customer.name,
      phone: customer.phone,
      alternatePhone: customer.alternatePhone,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      pinCode: customer.pinCode
    }));
    setLocation("/job-sheet?from=customer");
  };

  const handleCreateInvoice = (customer: Customer) => {
    localStorage.setItem('customerData', JSON.stringify({
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      city: customer.city,
      state: customer.state,
      pinCode: customer.pinCode
    }));
    setLocation("/invoices?from=customer");
  };

  const handleCreateDInvoice = (customer: Customer) => {
    localStorage.setItem('customerData', JSON.stringify({
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      city: customer.city,
      state: customer.state,
      pinCode: customer.pinCode
    }));
    setLocation("/d-invoices?from=customer");
  };

  const handleCreateQuotation = (customer: Customer) => {
    localStorage.setItem('customerData', JSON.stringify({
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      city: customer.city,
      state: customer.state,
      pinCode: customer.pinCode
    }));
    setLocation("/quotations?from=customer");
  };

  const onSubmit = (data: CustomerFormData) => {
    if (editingCustomer) {
      updateCustomerMutation.mutate({ id: String(editingCustomer.id), data });
    } else {
      createCustomerMutation.mutate(data);
    }
  };

  const filteredCustomers = customers?.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Customers</h1>
        <p className="text-sm text-gray-500">Manage customer information and contact details</p>
      </div>

      {/* Search and Actions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search customers by name, phone, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button
              onClick={() => handleOpenModal()}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Customers ({filteredCustomers?.length || 0})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!filteredCustomers || filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? "No customers found" : "No customers yet"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? "Try adjusting your search criteria" 
                  : "Add your first customer to get started"
                }
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => handleOpenModal()}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Primary Phone</TableHead>
                    <TableHead>Alternate Phone</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>PIN Code</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-medium text-sm">
                              {customer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{customer.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{customer.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.alternatePhone ? (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span>{customer.alternatePhone}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Not provided</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start space-x-2 max-w-xs">
                          <MapPin className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-900">{customer.address}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-gray-900">{customer.city || <span className="text-gray-500 italic">Not provided</span>}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-gray-900">{customer.state || <span className="text-gray-500 italic">Not provided</span>}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-gray-900">{customer.pinCode || <span className="text-gray-500 italic">Not provided</span>}</span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(customer.createdAt!).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Plus className="h-4 w-4" />
                                <span className="sr-only">Create from customer</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleCreateJobSheet(customer)}
                                className="flex items-center gap-2"
                              >
                                <FileText className="h-4 w-4" />
                                Create Job Sheet
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleCreateInvoice(customer)}
                                className="flex items-center gap-2"
                              >
                                <Receipt className="h-4 w-4" />
                                Create Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleCreateDInvoice(customer)}
                                className="flex items-center gap-2"
                              >
                                <FileText className="h-4 w-4" />
                                Create D-Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleCreateQuotation(customer)}
                                className="flex items-center gap-2"
                              >
                                <Calculator className="h-4 w-4" />
                                Create Quotation
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleOpenModal(customer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-error-600 hover:text-error-700"
                            onClick={() => handleDeleteCustomer(customer)}
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

      {/* Customer Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCustomer ? "Edit Customer" : "Add New Customer"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter customer name" {...field} />
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
                    <FormLabel>Primary Phone *</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="alternatePhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alternate Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Enter alternate phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter customer address" 
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter state" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="pinCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIN Code</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Enter PIN code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary-600 hover:bg-primary-700"
                  disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}
                >
                  {createCustomerMutation.isPending || updateCustomerMutation.isPending 
                    ? "Saving..." 
                    : editingCustomer ? "Update Customer" : "Add Customer"
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
