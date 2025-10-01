import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Eye, FileText, Download, Trash2 } from "lucide-react";
import { DInvoiceModal } from "@/components/d-invoice/d-invoice-modal";
import { generateGSTInvoice, generateNonGSTInvoice } from "@/lib/pdf-generator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function DInvoicesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDInvoice, setSelectedDInvoice] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();

  // Check if coming from customer page and auto-open modal
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('from') === 'customer') {
      setIsCreateModalOpen(true);
      // Clear the parameter from URL without page reload
      window.history.replaceState({}, '', '/d-invoices');
    }
  }, [location]);

  const { data: dInvoices = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/d-invoices"],
  });

  const deleteDInvoiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/d-invoices/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/d-invoices"] });
      toast({
        title: "Success",
        description: "D-Invoice deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete D-invoice",
        variant: "destructive",
      });
    },
  });

  const handleGeneratePDF = async (dInvoice: any) => {
    try {
      const subtotal = parseFloat(dInvoice.invoice.subtotal || "0");
      const gstAmount = parseFloat(dInvoice.invoice.gstAmount || "0");
      const totalAmount = parseFloat(dInvoice.invoice.totalAmount || "0");
      
      const dInvoiceData = {
        invoiceNumber: dInvoice.invoice.invoiceNumber,
        jobId: dInvoice.jobSheet?.jobId || "N/A",
        customerName: dInvoice.customer?.name || "Unknown Customer",
        customerPhone: dInvoice.customer?.phone || "",
        customerAddress: dInvoice.customer?.address || "",
        customerCity: dInvoice.customer?.city || "",
        customerState: dInvoice.customer?.state || "37-ANDHRA PRADESH",
        customerPincode: dInvoice.customer?.pincode || "",
        productType: dInvoice.productType?.displayName || "Unknown",
        brand: dInvoice.invoice.brand || dInvoice.brand?.displayName || "Unknown",
        model: dInvoice.model?.displayName || "",
        modelNumber: dInvoice.invoice.modelNumber || "",
        serialNumber: dInvoice.invoice.serialNumber || dInvoice.jobSheet?.serialNumber || "",
        paymentMethod: dInvoice.invoice.paymentMethod || "cash",
        gstin: dInvoice.invoice.gstin || "",
        serviceCharge: parseFloat(dInvoice.invoice.serviceCharge || "0"),
        parts: dInvoice.parts?.map((part: any) => ({
          name: part.partName,
          quantity: part.quantity,
          rate: parseFloat(part.unitPrice || "0"),
          amount: parseFloat(part.amount || "0"),
        })) || [],
        discount: parseFloat(dInvoice.invoice.discount || "0"),
        // Required fields for PDF generator - for GST-inclusive calculations
        isGST: dInvoice.invoice.invoiceType === "gst",
        gstRate: parseFloat(dInvoice.invoice.gstRate || "18"),
        totalBeforeTax: subtotal, // This is the taxable amount (excluding GST)
        taxAmount: gstAmount, // This is the GST amount
        totalAmount: totalAmount, // This is the GST-inclusive total amount
        workDone: dInvoice.invoice.workDone || "",
        remarks: dInvoice.invoice.remarks || "",
        invoiceDate: new Date(dInvoice.invoice.invoiceDate),
      };

      if (dInvoice.invoice.invoiceType === "gst") {
        await generateGSTInvoice(dInvoiceData);
      } else {
        await generateNonGSTInvoice(dInvoiceData);
      }

      toast({
        title: "Success",
        description: "D-Invoice PDF generated successfully",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `₹${num.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading D-invoices...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="page-d-invoices">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">D-Invoices</h1>
          <p className="text-muted-foreground">
            Manage D-invoices for completed jobs
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-d-invoice">
              <Plus className="h-4 w-4 mr-2" />
              Create D-Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New D-Invoice</DialogTitle>
            </DialogHeader>
            <DInvoiceModal
              onClose={() => setIsCreateModalOpen(false)}
              onSuccess={() => {
                setIsCreateModalOpen(false);
                queryClient.invalidateQueries({ queryKey: ["/api/d-invoices"] });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All D-Invoices</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" data-testid="badge-total-count">
              Total: {dInvoices.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {dInvoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No D-invoices found</h3>
              <p className="text-gray-600 mb-4">Create your first D-invoice to get started</p>
              <Button onClick={() => setIsCreateModalOpen(true)} data-testid="button-create-first-d-invoice">
                <Plus className="h-4 w-4 mr-2" />
                Create D-Invoice
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead data-testid="header-invoice-number">D-Invoice #</TableHead>
                    <TableHead data-testid="header-job-id">Job ID</TableHead>
                    <TableHead data-testid="header-customer">Customer</TableHead>
                    <TableHead data-testid="header-product">Product</TableHead>
                    <TableHead data-testid="header-type">Type</TableHead>
                    <TableHead data-testid="header-amount">Amount</TableHead>
                    <TableHead data-testid="header-payment">Payment</TableHead>
                    <TableHead data-testid="header-date">Date</TableHead>
                    <TableHead data-testid="header-actions">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dInvoices.map((dInvoiceItem: any) => (
                    <TableRow key={dInvoiceItem.invoice.id} data-testid={`row-d-invoice-${dInvoiceItem.invoice.id}`}>
                      <TableCell className="font-medium" data-testid={`text-invoice-number-${dInvoiceItem.invoice.id}`}>
                        {dInvoiceItem.invoice.invoiceNumber}
                      </TableCell>
                      <TableCell data-testid={`text-job-id-${dInvoiceItem.invoice.id}`}>
                        {dInvoiceItem.jobSheet?.jobId || "N/A"}
                      </TableCell>
                      <TableCell data-testid={`text-customer-${dInvoiceItem.invoice.id}`}>
                        <div>
                          <div className="font-medium">
                            {dInvoiceItem.customer?.name || "Unknown Customer"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {dInvoiceItem.customer?.phone || ""}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell data-testid={`text-product-${dInvoiceItem.invoice.id}`}>
                        <div>
                          <div className="font-medium">
                            {dInvoiceItem.brand?.displayName || dInvoiceItem.invoice.brand || "Unknown"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {dInvoiceItem.model?.displayName || ""}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell data-testid={`badge-type-${dInvoiceItem.invoice.id}`}>
                        <Badge variant={dInvoiceItem.invoice.invoiceType === "gst" ? "default" : "secondary"}>
                          {dInvoiceItem.invoice.invoiceType === "gst" ? "GST" : "Non-GST"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium" data-testid={`text-amount-${dInvoiceItem.invoice.id}`}>
                        {formatCurrency(dInvoiceItem.invoice.totalAmount)}
                      </TableCell>
                      <TableCell data-testid={`text-payment-${dInvoiceItem.invoice.id}`}>
                        <Badge variant="outline">
                          {dInvoiceItem.invoice.paymentMethod?.toUpperCase() || "CASH"}
                        </Badge>
                      </TableCell>
                      <TableCell data-testid={`text-date-${dInvoiceItem.invoice.id}`}>
                        {new Date(dInvoiceItem.invoice.invoiceDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDInvoice({ ...dInvoiceItem, mode: "view" })}
                            data-testid={`button-view-${dInvoiceItem.invoice.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGeneratePDF(dInvoiceItem)}
                            data-testid={`button-pdf-${dInvoiceItem.invoice.id}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteDInvoiceMutation.mutate(dInvoiceItem.invoice.id.toString())}
                            disabled={deleteDInvoiceMutation.isPending}
                            data-testid={`button-delete-${dInvoiceItem.invoice.id}`}
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

      {/* View D-Invoice Modal */}
      <Dialog open={!!selectedDInvoice} onOpenChange={(open) => !open && setSelectedDInvoice(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View D-Invoice</DialogTitle>
          </DialogHeader>
          {selectedDInvoice && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><strong>Invoice Number:</strong> {selectedDInvoice.invoice.invoiceNumber}</div>
                <div><strong>Job ID:</strong> {selectedDInvoice.jobSheet?.jobId || "N/A"}</div>
                <div><strong>Customer:</strong> {selectedDInvoice.customer?.name || "Unknown"}</div>
                <div><strong>Phone:</strong> {selectedDInvoice.customer?.phone || ""}</div>
                <div><strong>Product:</strong> {selectedDInvoice.brand?.displayName} {selectedDInvoice.model?.displayName}</div>
                <div><strong>Payment Method:</strong> {selectedDInvoice.invoice.paymentMethod?.toUpperCase()}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><strong>Service Charge:</strong> {formatCurrency(selectedDInvoice.invoice.serviceCharge)}</div>
                <div><strong>Discount:</strong> {formatCurrency(selectedDInvoice.invoice.discount || "0")}</div>
                <div><strong>Total Amount:</strong> {formatCurrency(selectedDInvoice.invoice.totalAmount)}</div>
              </div>
              {selectedDInvoice.parts && selectedDInvoice.parts.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Parts:</h4>
                  <div className="space-y-2">
                    {selectedDInvoice.parts.map((part: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <span>{part.partName} (Qty: {part.quantity})</span>
                        <span>{formatCurrency(part.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedDInvoice.invoice.workDone && (
                <div><strong>Work Done:</strong> {selectedDInvoice.invoice.workDone}</div>
              )}
              {selectedDInvoice.invoice.remarks && (
                <div><strong>Remarks:</strong> {selectedDInvoice.invoice.remarks}</div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}