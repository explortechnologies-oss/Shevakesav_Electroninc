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
import { InvoiceModal } from "@/components/invoice/invoice-modal";
import { generateGSTInvoice, generateNonGSTInvoice } from "@/lib/pdf-generator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function InvoicesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location] = useLocation();

  // Check if coming from customer page and auto-open modal
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('from') === 'customer') {
      setIsCreateModalOpen(true);
      // Clear the parameter from URL without page reload
      window.history.replaceState({}, '', '/invoices');
    }
  }, [location]);

  const { data: invoices = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/invoices"],
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/invoices/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      });
    },
  });

  const handleGeneratePDF = async (invoice: any) => {
    try {
      const invoiceData = {
        invoiceNumber: invoice.invoice.invoiceNumber,
        jobId: invoice.jobSheet?.jobId || "N/A",
        customerName: invoice.customer?.name || "Unknown Customer",
        customerPhone: invoice.customer?.phone || "",
        customerAddress: invoice.customer?.address || "",
        customerState: invoice.customer?.state || "37-ANDHRA PRADESH",
        productType: invoice.productType?.displayName || "Unknown",
        brand: invoice.invoice.brand || invoice.brand?.displayName || "Unknown",
        model: invoice.model?.displayName || "",
        modelNumber: invoice.invoice.modelNumber || "",
        serialNumber: invoice.invoice.serialNumber || invoice.jobSheet?.serialNumber || "",
        paymentMethod: invoice.invoice.paymentMethod || "cash",
        gstin: invoice.invoice.gstin || "",
        serviceCharge: parseFloat(invoice.invoice.serviceCharge || "0"),
        parts: invoice.parts?.map((part: any) => ({
          name: part.partName,
          quantity: part.quantity,
          rate: parseFloat(part.unitPrice || "0"),
          amount: parseFloat(part.amount || "0"),
        })) || [],
        discount: parseFloat(invoice.invoice.discount || "0"),
        isGST: invoice.invoice.invoiceType === "gst",
        gstRate: parseFloat(invoice.invoice.gstRate || "18"),
        // For GST-inclusive calculations: stored subtotal is taxable amount, totalAmount is GST-inclusive
        totalBeforeTax: parseFloat(invoice.invoice.subtotal || "0"), // This is taxable amount
        taxAmount: parseFloat(invoice.invoice.gstAmount || "0"),
        totalAmount: parseFloat(invoice.invoice.totalAmount || "0"), // This is GST-inclusive total
        technicianName: invoice.technician?.name || "",
        workDone: invoice.invoice.workDone || "",
        remarks: invoice.invoice.remarks || "",
      };

      if (invoice.invoice.invoiceType === "gst") {
        generateGSTInvoice(invoiceData);
      } else {
        generateNonGSTInvoice(invoiceData);
      }

      toast({
        title: "Success",
        description: "Invoice PDF generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInvoice = (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      deleteInvoiceMutation.mutate(id);
    }
  };

  const getStatusBadge = (type: string) => {
    return type === "gst" ? (
      <Badge variant="default">GST</Badge>
    ) : (
      <Badge variant="secondary">Non-GST</Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">Manage and generate invoices for completed jobs</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            <InvoiceModal
              onClose={() => setIsCreateModalOpen(false)}
              onSuccess={() => {
                setIsCreateModalOpen(false);
                queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
              <p className="text-gray-600 mb-4">Create your first invoice to get started</p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice: any) => (
                  <TableRow key={invoice.invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.customer?.name || "Unknown"}</div>
                        <div className="text-sm text-gray-600">{invoice.customer?.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{invoice.jobSheet?.jobId || "N/A"}</TableCell>
                    <TableCell>{getStatusBadge(invoice.invoice.invoiceType)}</TableCell>
                    <TableCell className="font-medium">
                      ₹{parseFloat(invoice.invoice.totalAmount || "0").toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.invoice.invoiceDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGeneratePDF(invoice)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedInvoice(invoice)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteInvoice(invoice.invoice.id)}
                          disabled={deleteInvoiceMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invoice Details - {selectedInvoice.invoice.invoiceNumber}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Customer Information</h4>
                  <p>{selectedInvoice.customer?.name}</p>
                  <p>{selectedInvoice.customer?.phone}</p>
                  <p className="text-sm text-gray-600">{selectedInvoice.customer?.address}</p>
                </div>
                <div>
                  <h4 className="font-medium">Invoice Information</h4>
                  <p>Type: {getStatusBadge(selectedInvoice.invoice.invoiceType)}</p>
                  <p>Date: {new Date(selectedInvoice.invoice.invoiceDate).toLocaleDateString()}</p>
                  <p>Job ID: {selectedInvoice.jobSheet?.jobId}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Charges</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span>Service Charge:</span>
                    <span>₹{parseFloat(selectedInvoice.invoice.serviceCharge || "0").toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{parseFloat(selectedInvoice.invoice.subtotal || "0").toFixed(2)}</span>
                  </div>
                  {selectedInvoice.invoice.invoiceType === "gst" && (
                    <div className="flex justify-between">
                      <span>GST ({selectedInvoice.invoice.gstRate}%):</span>
                      <span>₹{parseFloat(selectedInvoice.invoice.gstAmount || "0").toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total Amount:</span>
                    <span>₹{parseFloat(selectedInvoice.invoice.totalAmount || "0").toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {selectedInvoice.invoice.workDone && (
                <div>
                  <h4 className="font-medium">Work Done</h4>
                  <p className="text-sm text-gray-600">{selectedInvoice.invoice.workDone}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={() => handleGeneratePDF(selectedInvoice)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}