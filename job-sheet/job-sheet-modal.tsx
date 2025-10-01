import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { JobSheetFormData } from "@/types";
import { generateJobSheetPDF } from "@/lib/pdf-generator";

const jobSheetSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  alternatePhone: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  pinCode: z.string().min(6, "PIN code must be at least 6 digits"),
  productTypeId: z.string().min(1, "Product type is required"),
  brandId: z.string().min(1, "Brand is required"),
  modelId: z.string().optional(),
  modelNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  warrantyStatus: z.enum(['in_warranty', 'out_warranty']),
  jobType: z.enum(['amc', 'demo', 'urgent', 'routine']),
  jobClassification: z.enum(['repair', 'installation', 'repeat_repair']),
  jobMode: z.enum(['indoor', 'outdoor']),
  technicianId: z.string().optional(),
  customerComplaint: z.string().min(1, "Customer complaint is required"),
  reportedIssue: z.string().optional(),
  agentRemarks: z.string().optional(),
  accessoriesReceived: z.string().optional(),
});

interface JobSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditMode?: boolean;
  editingJobSheet?: any;
}

export default function JobSheetModal({ isOpen, onClose, isEditMode = false, editingJobSheet }: JobSheetModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<JobSheetFormData>({
    resolver: zodResolver(jobSheetSchema),
    defaultValues: {
      customerName: "",
      phone: "",
      alternatePhone: "",
      address: "",
      city: "",
      state: "",
      pinCode: "",
      productTypeId: "",
      brandId: "",
      modelId: "",
      modelNumber: "",
      serialNumber: "",
      purchaseDate: "",
      warrantyStatus: 'out_warranty',
      jobType: 'routine',
      jobClassification: 'repair',
      jobMode: 'indoor',
      technicianId: "",
      customerComplaint: "",
      reportedIssue: "",
      agentRemarks: "",
      accessoriesReceived: "",
    },
  });


  // Fetch technicians
  const { data: technicians } = useQuery({
    queryKey: ["/api/technicians"],
  });

  const createJobSheetMutation = useMutation({
    mutationFn: async (data: JobSheetFormData) => {
      // First create customer if not exists
      const customerResponse = await apiRequest("POST", "/api/customers", {
        name: data.customerName,
        phone: data.phone,
        alternatePhone: data.alternatePhone,
        address: data.address,
        city: data.city,
        state: data.state,
        pinCode: data.pinCode,
      });
      
      const customer = await customerResponse.json();
      
      // Then create job sheet
      const jobSheetResponse = await apiRequest("POST", "/api/job-sheets", {
        customerId: customer.id,
        productType: data.productTypeId,
        brand: data.brandId,
        model: data.modelId || "",
        modelNumber: data.modelNumber,
        serialNumber: data.serialNumber,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        warrantyStatus: data.warrantyStatus,
        jobType: data.jobType,
        jobClassification: data.jobClassification,
        jobMode: data.jobMode,
        technicianId: data.technicianId ? parseInt(data.technicianId) : null,
        agentId: 1, // Using default admin user ID
        customerComplaint: data.customerComplaint,
        reportedIssue: data.reportedIssue,
        agentRemarks: data.agentRemarks,
        accessoriesReceived: data.accessoriesReceived,
      });
      
      return await jobSheetResponse.json();
    },
    onSuccess: (jobSheet) => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-sheets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Success",
        description: "Job sheet created successfully",
      });
      
      // Generate PDF
      generateJobSheetPDF({
        ...form.getValues(),
        jobId: jobSheet.jobId,
      });
      
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create job sheet",
        variant: "destructive",
      });
    },
  });

  // Update mutation for editing existing job sheets
  const updateJobSheetMutation = useMutation({
    mutationFn: async (data: JobSheetFormData) => {
      if (!editingJobSheet) throw new Error("No job sheet to update");
      
      // Update customer information first
      const customerResponse = await apiRequest("PATCH", `/api/customers/${editingJobSheet.customer.id}`, {
        name: data.customerName,
        phone: data.phone,
        alternatePhone: data.alternatePhone,
        address: data.address,
        city: data.city,
        state: data.state,
        pinCode: data.pinCode,
      });
      
      // Then update job sheet
      const jobSheetResponse = await apiRequest("PATCH", `/api/job-sheets/${editingJobSheet.id}`, {
        productType: data.productTypeId,
        brand: data.brandId,
        model: data.modelId || "",
        modelNumber: data.modelNumber,
        serialNumber: data.serialNumber,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        warrantyStatus: data.warrantyStatus,
        jobType: data.jobType,
        jobClassification: data.jobClassification,
        jobMode: data.jobMode,
        technicianId: data.technicianId ? parseInt(data.technicianId) : null,
        customerComplaint: data.customerComplaint,
        reportedIssue: data.reportedIssue,
        agentRemarks: data.agentRemarks,
        accessoriesReceived: data.accessoriesReceived,
      });
      
      return await jobSheetResponse.json();
    },
    onSuccess: (jobSheet) => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-sheets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Success",
        description: "Job sheet updated successfully",
      });
      handleClose();
      // Success handler complete
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update job sheet",
        variant: "destructive",
      });
    },
  });

  // Check for customer data from localStorage when modal opens (not in edit mode)
  useEffect(() => {
    if (!isEditMode && isOpen) {
      const customerData = localStorage.getItem('customerData');
      if (customerData) {
        try {
          const data = JSON.parse(customerData);
          form.setValue('customerName', data.customerName || '');
          form.setValue('phone', data.phone || '');
          form.setValue('alternatePhone', data.alternatePhone || '');
          form.setValue('address', data.address || '');
          form.setValue('city', data.city || '');
          form.setValue('state', data.state || '');
          form.setValue('pinCode', data.pinCode || '');
          // Clear the localStorage after using the data
          localStorage.removeItem('customerData');
        } catch (error) {
          console.error('Error parsing customer data from localStorage:', error);
        }
      }
    }
  }, [isOpen, isEditMode, form]);

  // Pre-populate form when editing
  useEffect(() => {
    if (isEditMode && editingJobSheet) {
      const formData = {
        customerName: editingJobSheet.customer?.name || "",
        phone: editingJobSheet.customer?.phone || "",
        alternatePhone: editingJobSheet.customer?.alternatePhone || "",
        address: editingJobSheet.customer?.address || "",
        city: editingJobSheet.customer?.city || "",
        state: editingJobSheet.customer?.state || "",
        pinCode: editingJobSheet.customer?.pinCode || "",
        productTypeId: editingJobSheet.productType || editingJobSheet.productType?.displayName || "",
        brandId: editingJobSheet.brand || editingJobSheet.brand?.displayName || "",
        modelId: editingJobSheet.model || editingJobSheet.model?.displayName || "",
        modelNumber: editingJobSheet.modelNumber || "",
        serialNumber: editingJobSheet.serialNumber || "",
        purchaseDate: editingJobSheet.purchaseDate ? new Date(editingJobSheet.purchaseDate).toISOString().split('T')[0] : "",
        warrantyStatus: editingJobSheet.warrantyStatus || 'out_warranty',
        jobType: editingJobSheet.jobType || 'routine',
        jobClassification: editingJobSheet.jobClassification || 'repair',
        jobMode: editingJobSheet.jobMode || 'indoor',
        technicianId: editingJobSheet.technician?.id?.toString() || "",
        customerComplaint: editingJobSheet.customerComplaint || "",
        reportedIssue: editingJobSheet.reportedIssue || "",
        agentRemarks: editingJobSheet.agentRemarks || "",
        accessoriesReceived: editingJobSheet.accessoriesReceived || "",
      };
      
      form.reset(formData);
    } else {
      form.reset({
        customerName: "",
        phone: "",
        alternatePhone: "",
        address: "",
        city: "",
        state: "",
        pinCode: "",
        productTypeId: "",
        brandId: "",
        modelId: "",
        modelNumber: "",
        serialNumber: "",
        purchaseDate: "",
        warrantyStatus: 'out_warranty',
        jobType: 'routine',
        jobClassification: 'repair',
        jobMode: 'indoor',
        technicianId: "",
        customerComplaint: "",
        reportedIssue: "",
        agentRemarks: "",
        accessoriesReceived: "",
      });
    }
  }, [isEditMode, editingJobSheet, form]);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (data: JobSheetFormData) => {
    if (isEditMode) {
      updateJobSheetMutation.mutate(data);
    } else {
      createJobSheetMutation.mutate(data);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {isEditMode ? "Edit Job Sheet" : "Create Job Sheet"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Information Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerName"
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
                        <Textarea placeholder="Enter customer address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
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
                        <FormLabel>State *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter state" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pinCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PIN Code *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter PIN code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Product Information Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Product Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <FormField
                  control={form.control}
                  name="productTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Type *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product type" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter brand" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="modelId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter model" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="modelNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter model number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serial Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter serial number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="purchaseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Purchase</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="warrantyStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warranty Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="in_warranty">In Warranty</SelectItem>
                          <SelectItem value="out_warranty">Out of Warranty</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Job Details Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Job Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <FormField
                  control={form.control}
                  name="jobType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Job Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="amc">AMC</SelectItem>
                          <SelectItem value="demo">Demo</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="routine">Routine</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jobClassification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Classification *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Classification" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="repair">Repair</SelectItem>
                          <SelectItem value="installation">Installation</SelectItem>
                          <SelectItem value="repeat_repair">Repeat Repair</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jobMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Mode</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="indoor">Indoor</SelectItem>
                          <SelectItem value="outdoor">Outdoor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="technicianId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technician Assigned</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Technician" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(technicians as any[])?.map((technician: any) => (
                            <SelectItem key={technician.id} value={technician.id.toString()}>
                              {technician.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Issue Details Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Issue Details</h3>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="customerComplaint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Complaint *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the customer's complaint..."
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reportedIssue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reported Issue</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Technical details of the reported issue..."
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="agentRemarks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agent Remarks</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Additional remarks by the agent..."
                          rows={2}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accessoriesReceived"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accessories Received</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="List accessories received with the device (e.g., Remote control, Power cable, Manual...)"
                          rows={2}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-primary-600 hover:bg-primary-700"
                disabled={createJobSheetMutation.isPending || updateJobSheetMutation.isPending}
              >
                {isEditMode 
                  ? (updateJobSheetMutation.isPending ? "Updating..." : "Update Job Sheet")
                  : (createJobSheetMutation.isPending ? "Creating..." : "Create & Generate PDF")
                }
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
