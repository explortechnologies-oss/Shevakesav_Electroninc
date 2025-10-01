import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Filter, Plus, Eye, Edit, Trash2, FileText, Receipt, DollarSign } from "lucide-react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import JobSheetModal from "@/components/job-sheet/job-sheet-modal";
import { InvoiceModal } from "@/components/invoice/invoice-modal";
import { DInvoiceModal } from "@/components/d-invoice/d-invoice-modal";
import { JobSheetWithDetails } from "@/types";
import { generateJobSheetPDF } from "@/lib/pdf-generator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function JobSheet() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingJobSheet, setEditingJobSheet] = useState<JobSheetWithDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isDInvoiceModalOpen, setIsDInvoiceModalOpen] = useState(false);
  const [selectedJobSheetForInvoice, setSelectedJobSheetForInvoice] = useState<JobSheetWithDetails | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();

  // Check if coming from customer page and auto-open modal
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('from') === 'customer') {
      setIsModalOpen(true);
      // Clear the parameter from URL without page reload
      window.history.replaceState({}, '', '/job-sheet');
    }
  }, [location]);

  const { data: jobSheets, isLoading } = useQuery<JobSheetWithDetails[]>({
    queryKey: ["/api/job-sheets"],
  });

  const handleGenerateAcknowledgment = (job: JobSheetWithDetails) => {
    try {
      console.log("Generating acknowledgment for job:", job);
      
      const pdfData = {
        customerName: job.customer?.name || "Unknown Customer",
        customerPhone: job.customer?.phone || "",
        phone: job.customer?.phone || "",
        alternatePhone: job.customer?.alternatePhone || "",
        customerAddress: job.customer?.address || "Not Available",
        address: job.customer?.address || "Not Available",
        city: job.customer?.city || "",
        state: job.customer?.state || "",
        pinCode: job.customer?.pinCode || "",
        productTypeId: job.productType?.id || "",
        productType: typeof job.productType === 'string'
          ? job.productType
          : job.productType?.displayName || '',
        brandId: job.brand?.id || "",
         brandName: (() => {
    if (!job.brand) return undefined;
    if (typeof job.brand === 'string') return job.brand;
    if (typeof job.brand.displayName === 'string') return job.brand.displayName;
    return undefined;
  })(),
        brand: typeof job.brand === 'string'
    ? job.brand
    : job.brand?.displayName || '',
        modelId: job.model?.id || "",
        modelName: (() => {
  if (!job.model) return undefined;
  if (typeof job.model === 'string') return job.model;
  if (typeof job.model.displayName === 'string') return job.model.displayName;
  return undefined;
})(),
        model: typeof job.model === 'string'
  ? job.model
  : job.model?.displayName || '',
        modelNumber: job.modelNumber || "",
        serialNumber: job.serialNumber || "",
        purchaseDate: job.purchaseDate ? new Date(job.purchaseDate).toLocaleDateString() : "",
        warrantyStatus: (job.warrantyStatus || "out_warranty") as "out_warranty" | "in_warranty",
        jobType: job.jobType as "amc" | "demo" | "urgent" | "routine",
        jobClassification: job.jobClassification as "repair" | "installation" | "repeat_repair",
        jobMode: (job.jobMode || "indoor") as "indoor" | "outdoor",
        technicianId: job.technician?.id || "",
        technicianName: job.technician?.name,
        customerComplaint: job.customerComplaint,
        reportedIssue: job.reportedIssue || "",
        agentRemarks: job.agentRemarks || "",
        accessoriesReceived: job.accessoriesReceived || "",
        jobId: job.jobId,
      };
      
      console.log("PDF data being passed:", pdfData);
      generateJobSheetPDF(pdfData);
      
      toast({
        title: "Acknowledgment Generated",
        description: `Acknowledgment slip for Job ID ${job.jobId} has been generated successfully.`,
      });
    } catch (error) {
      console.error("Error generating acknowledgment:", error);
      toast({
        title: "Error",
        description: `Failed to generate acknowledgment slip: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  };

  const handleEditJobSheet = (job: JobSheetWithDetails) => {
    setEditingJobSheet(job);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleCreateInvoice = (job: JobSheetWithDetails) => {
    setSelectedJobSheetForInvoice(job);
    setIsInvoiceModalOpen(true);
  };

  const handleCreateDInvoice = (job: JobSheetWithDetails) => {
    setSelectedJobSheetForInvoice(job);
    setIsDInvoiceModalOpen(true);
  };

  const handleDeleteJobSheet = async (job: JobSheetWithDetails) => {
    if (!window.confirm(`Are you sure you want to delete job sheet ${job.jobId}?`)) {
      return;
    }

    try {
      await apiRequest("DELETE", `/api/job-sheets/${job.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/job-sheets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Success",
        description: `Job sheet ${job.jobId} has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete job sheet.",
        variant: "destructive",
      });
    }
  };

  const handleBulkPrintAcknowledgments = () => {
    if (!filteredJobSheets || filteredJobSheets.length === 0) {
      toast({
        title: "No Job Sheets",
        description: "No job sheets available to print acknowledgments.",
        variant: "destructive",
      });
      return;
    }

    let successCount = 0;
    filteredJobSheets.forEach((job) => {
      try {
        handleGenerateAcknowledgment(job);
        successCount++;
      } catch (error) {
        console.error(`Failed to generate acknowledgment for Job ID ${job.jobId}:`, error);
      }
    });

    if (successCount > 0) {
      toast({
        title: "Bulk Print Completed",
        description: `Generated ${successCount} acknowledgment slips successfully.`,
      });
    }
  };

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

  const formatJobType = (jobType: string) => {
    return jobType.toUpperCase();
  };

  const formatJobClassification = (classification: string) => {
    return classification.replace('_', ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const filteredJobSheets = jobSheets?.filter(job => {
    const matchesSearch = 
      job.jobId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer?.phone.includes(searchTerm) ||
      job.productType?.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.brand?.displayName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || job.status === statusFilter;

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
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Job Sheets</h1>
        <p className="text-sm text-gray-500">Manage and track all service job sheets</p>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by Job ID, Customer, Phone..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {filteredJobSheets && filteredJobSheets.length > 0 && (
                <Button
                  onClick={handleBulkPrintAcknowledgments}
                  variant="outline"
                  className="border-primary-600 text-primary-600 hover:bg-primary-50"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Print All Acknowledgments
                </Button>
              )}
              <Button
                onClick={() => {
                  setIsEditMode(false);
                  setEditingJobSheet(null);
                  setIsModalOpen(true);
                }}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Job Sheet
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Sheets Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Job Sheets ({filteredJobSheets?.length || 0})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!filteredJobSheets || filteredJobSheets.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== "all" ? "No results found" : "No job sheets yet"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria" 
                  : "Create your first job sheet to get started"
                }
              </p>
              {(!searchTerm && statusFilter === "all") && (
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Job Sheet
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Job Type</TableHead>
                    <TableHead>Classification</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobSheets.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.jobId}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">
                            {job.customer?.name || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {job.customer?.phone || 'No phone'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">
                            {job.productType?.displayName || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {job.brand?.displayName || 'No brand'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{formatJobType(job.jobType)}</TableCell>
                      <TableCell>{formatJobClassification(job.jobClassification)}</TableCell>
                      <TableCell>
                        {job.technician?.name || (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(job.status)}>
                          {formatStatus(job.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleGenerateAcknowledgment(job)}
                            title="Generate Acknowledgment Slip"
                            className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="View Details">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Edit Job Sheet"
                            onClick={() => handleEditJobSheet(job)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Create Invoice"
                            onClick={() => handleCreateInvoice(job)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Receipt className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="Create D-Invoice"
                            onClick={() => handleCreateDInvoice(job)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <DollarSign className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-error-600 hover:text-error-700"
                            title="Delete Job Sheet"
                            onClick={() => handleDeleteJobSheet(job)}
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

      <JobSheetModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setIsEditMode(false);
          setEditingJobSheet(null);
        }}
        isEditMode={isEditMode}
        editingJobSheet={editingJobSheet}
      />

      {/* Invoice Modal */}
      {isInvoiceModalOpen && (
        <InvoiceModal 
          onClose={() => {
            setIsInvoiceModalOpen(false);
            setSelectedJobSheetForInvoice(null);
          }}
          onSuccess={() => {
            setIsInvoiceModalOpen(false);
            setSelectedJobSheetForInvoice(null);
          }}
        />
      )}

      {/* D-Invoice Modal */}
      {isDInvoiceModalOpen && (
        <DInvoiceModal 
          onClose={() => {
            setIsDInvoiceModalOpen(false);
            setSelectedJobSheetForInvoice(null);
          }}
          onSuccess={() => {
            setIsDInvoiceModalOpen(false);
            setSelectedJobSheetForInvoice(null);
          }}
        />
      )}
    </div>
  );
}
