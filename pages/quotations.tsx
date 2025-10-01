import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Plus, Search, Eye, Trash2, Download, Check, X, Edit } from "lucide-react";
import { QuotationModal } from "@/components/quotation/quotation-modal";
import { generateQuotationPDF, saveQuotationPDF } from "@/lib/pdf-generator";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Quotation {
  id: number;
  quotationNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  productType?: string;
  brand?: string;
  modelNumber?: string;
  serialNumber?: string;
  serviceCharge?: string | number;
  totalAmount: string | number;
  status: string;
  validityDays: number;
  paymentTerms: string;
  remarks?: string;
  createdAt: string;
  parts: Array<{
    id: number;
    name: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
}

export default function QuotationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const queryClient = useQueryClient();
  const [location] = useLocation();

  // Check if coming from customer page and auto-open modal
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('from') === 'customer') {
      setIsModalOpen(true);
      // Clear the parameter from URL without page reload
      window.history.replaceState({}, '', '/quotations');
    }
  }, [location]);

  const { data: quotations = [], isLoading } = useQuery<Quotation[]>({
    queryKey: ["/api/quotations"],
  });

  const deleteQuotationMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/quotations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotations"] });
      toast({
        title: "Quotation deleted",
        description: "The quotation has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete quotation.",
        variant: "destructive",
      });
    },
  });

  const updateQuotationStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      apiRequest("PATCH", `/api/quotations/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotations"] });
      toast({
        title: "Status updated",
        description: "Quotation status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error("Quotation status update error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update quotation status.",
        variant: "destructive",
      });
    },
  });

  const createJobSheetFromQuotationMutation = useMutation({
    mutationFn: (quotationId: number) => 
      apiRequest("POST", `/api/quotations/${quotationId}/create-job-sheet`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/job-sheets"] });
      toast({
        title: "Job sheet created",
        description: "Job sheet has been created from quotation successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create job sheet from quotation.",
        variant: "destructive",
      });
    },
  });

  // Auto-expire quotations based on validity days
  const checkAndExpireQuotations = () => {
    const now = new Date();
    quotations.forEach(quotation => {
      if (quotation.status === 'pending') {
        const createdDate = new Date(quotation.createdAt);
        const validityDays = quotation.validityDays || 10;
        const expiryDate = new Date(createdDate.getTime() + (validityDays * 24 * 60 * 60 * 1000));
        
        if (now > expiryDate) {
          updateQuotationStatusMutation.mutate({ id: quotation.id, status: 'expired' });
        }
      }
    });
  };

  // Check for expired quotations on component mount and when quotations change
  useEffect(() => {
    if (quotations.length > 0) {
      checkAndExpireQuotations();
    }
  }, [quotations]);

  const filteredQuotations = quotations.filter(quotation =>
    quotation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quotation.customerPhone.includes(searchTerm)
  );

  const handleGeneratePDF = (quotation: Quotation) => {
    try {
      const pdfData = {
        quotationNumber: quotation.quotationNumber,
        customerName: quotation.customerName,
        customerPhone: quotation.customerPhone,
        customerAddress: quotation.customerAddress || "Vijayawada",
        city: quotation.city || "Vijayawada",
        state: quotation.state || "Andhra Pradesh",
        pinCode: quotation.pinCode || "520001",
        productType: quotation.productType || "Electronics",
        brand: quotation.brand || "Panasonic",
        modelNumber: quotation.modelNumber,
        serialNumber: quotation.serialNumber,
        serviceCharge: parseFloat(quotation.serviceCharge?.toString() || "0"),
        parts: (quotation.parts || []).map(part => ({
          name: part.name,
          quantity: part.quantity,
          rate: part.unitPrice,
          amount: part.amount
        })),
        totalAmount: parseFloat(quotation.totalAmount?.toString() || "0"),
        paymentTerms: quotation.paymentTerms || "CASH",
        validityDays: quotation.validityDays || 10,
        remarks: quotation.remarks,
      };

      generateQuotationPDF(pdfData);
      toast({
        title: "PDF Generated",
        description: "Quotation PDF has been generated successfully.",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF.",
        variant: "destructive",
      });
    }
  };

  const handleSavePDF = (quotation: Quotation) => {
    try {
      const pdfData = {
        quotationNumber: quotation.quotationNumber,
        customerName: quotation.customerName,
        customerPhone: quotation.customerPhone,
        customerAddress: quotation.customerAddress || "Vijayawada",
        city: quotation.city || "Vijayawada",
        state: quotation.state || "Andhra Pradesh",
        pinCode: quotation.pinCode || "520001",
        productType: quotation.productType || "Electronics",
        brand: quotation.brand || "Panasonic",
        modelNumber: quotation.modelNumber,
        serialNumber: quotation.serialNumber,
        serviceCharge: parseFloat(quotation.serviceCharge?.toString() || "0"),
        parts: (quotation.parts || []).map(part => ({
          name: part.name,
          quantity: part.quantity,
          rate: part.unitPrice,
          amount: part.amount
        })),
        totalAmount: parseFloat(quotation.totalAmount?.toString() || "0"),
        paymentTerms: quotation.paymentTerms || "CASH",
        validityDays: quotation.validityDays || 10,
        remarks: quotation.remarks,
      };

      // Use the same pattern as job sheet and invoice - call the generator directly
      generateQuotationPDF(pdfData);
      toast({
        title: "PDF Generated",
        description: "Quotation PDF has been generated successfully.",
      });
    } catch (error) {
      console.error("PDF save error:", error);
      toast({
        title: "Error",
        description: "Failed to save PDF.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      expired: "bg-gray-100 text-gray-800",
      converted: "bg-blue-100 text-blue-800",
    };
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || statusColors.pending}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading quotations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quotations</h1>
          <p className="text-muted-foreground">Manage customer quotations and estimates</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
          data-testid="button-new-quotation"
        >
          <Plus className="h-4 w-4" />
          New Quotation
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quotations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-quotations">
              {quotations.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600" data-testid="text-pending-quotations">
              {quotations.filter(q => q.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600" data-testid="text-accepted-quotations">
              {quotations.filter(q => q.status === 'accepted').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-value">
              ₹{quotations.reduce((total, q) => total + parseFloat(q.totalAmount?.toString() || "0"), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search quotations by customer name, number, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
          data-testid="input-search"
        />
      </div>

      {/* Quotations Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Quotations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quotation No.</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotations.map((quotation: Quotation) => (
                <TableRow key={quotation.id}>
                  <TableCell className="font-medium" data-testid={`text-quotation-number-${quotation.id}`}>
                    {quotation.quotationNumber}
                  </TableCell>
                  <TableCell data-testid={`text-customer-name-${quotation.id}`}>
                    {quotation.customerName}
                  </TableCell>
                  <TableCell data-testid={`text-customer-phone-${quotation.id}`}>
                    {quotation.customerPhone}
                  </TableCell>
                  <TableCell data-testid={`text-amount-${quotation.id}`}>
                    ₹{parseFloat(quotation.totalAmount?.toString() || "0").toLocaleString()}
                  </TableCell>
                  <TableCell data-testid={`badge-status-${quotation.id}`}>
                    {getStatusBadge(quotation.status)}
                  </TableCell>
                  <TableCell data-testid={`text-validity-${quotation.id}`}>
                    {quotation.validityDays} days
                  </TableCell>
                  <TableCell data-testid={`text-date-${quotation.id}`}>
                    {new Date(quotation.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSavePDF(quotation)}
                        data-testid={`button-download-${quotation.id}`}
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingQuotation(quotation);
                          setIsModalOpen(true);
                        }}
                        data-testid={`button-edit-${quotation.id}`}
                        title="Edit Quotation"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      {quotation.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => updateQuotationStatusMutation.mutate({ id: quotation.id, status: 'accepted' })}
                            data-testid={`button-accept-${quotation.id}`}
                            title="Accept Quotation"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => updateQuotationStatusMutation.mutate({ id: quotation.id, status: 'rejected' })}
                            data-testid={`button-reject-${quotation.id}`}
                            title="Reject Quotation"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      {quotation.status === 'accepted' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => createJobSheetFromQuotationMutation.mutate(quotation.id)}
                          data-testid={`button-create-job-${quotation.id}`}
                          title="Create Job Sheet"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteQuotationMutation.mutate(quotation.id)}
                        data-testid={`button-delete-${quotation.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredQuotations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No quotations found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quotation Modal */}
      <QuotationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingQuotation(null);
        }}
        editingQuotation={editingQuotation}
      />
    </div>
  );
}