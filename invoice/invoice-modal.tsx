import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

const invoiceSchema = z.object({
  jobSheetId: z.string().optional(),
  manualJobSheetIds: z.string().optional(),
  invoiceType: z.enum(["gst", "non_gst"]),
  serviceCharge: z.string().min(1, "Service charge is required"),
  discount: z.string().default("0"),
  gstRate: z.string().default("18"),
  paymentMethod: z.enum(["cash", "online"]),
  modelNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  brand: z.string().optional(),
  gstin: z.string().optional(),
  workDone: z.string().optional(),
  remarks: z.string().optional(),
  // Allow manual product type when not using a Job Sheet
  productType: z.string().optional(),
  // New optional fields for manual customer entry when no context is present
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
});

const partSchema = z.object({
  name: z.string().min(1, "Part name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  rate: z.number().min(0, "Rate must be positive"),
});

interface InvoiceModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function InvoiceModal({ onClose, onSuccess }: InvoiceModalProps) {
  const [parts, setParts] = useState<Array<{ name: string; quantity: number; rate: number; amount: number }>>([]);
  const [jobSheetOpen, setJobSheetOpen] = useState(false);
  const [customerData, setCustomerData] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof invoiceSchema>>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      jobSheetId: "",
      invoiceType: "gst",
      serviceCharge: "",
      discount: "0",
      gstRate: "18",
      paymentMethod: "cash",
      modelNumber: "",
      serialNumber: "",
      brand: "",
      gstin: "",
      workDone: "",
      remarks: "",
    },
  });

  const { data: jobSheets = [] } = useQuery({
    queryKey: ["/api/job-sheets"],
  }) as { data: any[] };

  // Check for customer data from localStorage when modal opens
  useEffect(() => {
    const storedCustomerData = localStorage.getItem('customerData');
    if (storedCustomerData) {
      try {
        const data = JSON.parse(storedCustomerData);
        setCustomerData(data);
        // Clear the localStorage after using the data
        localStorage.removeItem('customerData');
      } catch (error) {
        console.error('Error parsing customer data from localStorage:', error);
      }
    }
  }, []);

  // Watch for job sheet selection to auto-populate fields
  const selectedJobSheetId = form.watch("jobSheetId");
  const selectedJobSheet = jobSheets.find((js: any) => js.id.toString() === selectedJobSheetId);

  // Auto-populate fields when job sheet is selected
  useEffect(() => {
    if (selectedJobSheet) {
      form.setValue("modelNumber", selectedJobSheet.modelNumber || "");
      form.setValue("serialNumber", selectedJobSheet.serialNumber || "");
      form.setValue("brand", selectedJobSheet.brand?.displayName || "");
    }
  }, [selectedJobSheet, form]);

  const createInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/invoices", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Invoice created successfully",
      });
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Invoice mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice",
        variant: "destructive",
      });
    },
  });

  const addPart = () => {
    setParts([...parts, { name: "", quantity: 1, rate: 0, amount: 0 }]);
  };

  const updatePart = (index: number, field: string, value: string | number) => {
    const updatedParts = [...parts];
    (updatedParts[index] as any)[field] = value;
    
    if (field === "quantity" || field === "rate") {
      updatedParts[index].amount = updatedParts[index].quantity * updatedParts[index].rate;
    }
    
    setParts(updatedParts);
  };

  const removePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const serviceCharge = parseFloat(form.watch("serviceCharge") || "0");
    const discount = parseFloat(form.watch("discount") || "0");
    const partsTotal = parts.reduce((sum, part) => sum + part.amount, 0);
    const gstInclusiveTotal = serviceCharge + partsTotal - discount;
    
    const invoiceType = form.watch("invoiceType");
    const gstRate = parseFloat(form.watch("gstRate") || "18");
    
    let gstAmount = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;
    let taxableAmount = gstInclusiveTotal;
    
    if (invoiceType === "gst") {
      // Since rates are GST-inclusive, calculate taxable amount
      // Taxable Amount = GST Inclusive Amount / (1 + GST Rate/100)
      taxableAmount = gstInclusiveTotal / (1 + gstRate / 100);
      gstAmount = gstInclusiveTotal - taxableAmount;
      
      // Check if customer is from Andhra Pradesh - use customerData if available, otherwise selectedJobSheet
      const customerState = customerData?.state?.toLowerCase() || selectedJobSheet?.customer?.state?.toLowerCase();
      const isAndhraPradesh = customerState === 'andhra pradesh' || customerState === 'ap';
      
      if (isAndhraPradesh) {
        // For Andhra Pradesh: CGST + SGST (split GST amount equally)
        cgstAmount = gstAmount / 2;
        sgstAmount = gstAmount / 2;
      } else {
        // For other states: IGST
        igstAmount = gstAmount;
      }
    }
    
    const totalAmount = gstInclusiveTotal; // Total remains same as entered rates are GST-inclusive

    return { 
      subtotal: taxableAmount, // This is now the taxable amount (excluding GST)
      gstAmount, 
      cgstAmount, 
      sgstAmount, 
      igstAmount, 
      totalAmount 
    };
  };

  const onSubmit = (data: z.infer<typeof invoiceSchema>) => {
    const { subtotal, gstAmount, cgstAmount, sgstAmount, igstAmount, totalAmount } = calculateTotals();

    // Normalize jobSheetId to a number or null (server getJobSheet expects numeric id)
    const jobSheetIdNumeric = data.jobSheetId && !isNaN(parseInt(data.jobSheetId))
      ? parseInt(data.jobSheetId)
      : null;

    const invoiceData: any = {
      ...data,
      jobSheetId: jobSheetIdNumeric,
      serviceCharge: data.serviceCharge,
      discount: data.discount,
      subtotal: subtotal.toString(),
      gstAmount: gstAmount.toString(),
      totalAmount: totalAmount.toString(),
      parts: parts.filter(part => part.name && part.quantity > 0),
      // Add customer data if available (kept for reference in UI)
      customerData: customerData || null,
    };

    // When we have a selected job sheet, include its customerId to help server backfill
    if (selectedJobSheet?.customer?.id) {
      invoiceData.customerId = selectedJobSheet.customer.id;
    } else if ((customerData as any)?.customerId) {
      invoiceData.customerId = (customerData as any).customerId;
    }

    // If neither customerData nor selected job sheet provided details, use manual entries from the form
    if (!invoiceData.customerName && data.customerName) {
      invoiceData.customerName = data.customerName.trim();
    }
    if (!invoiceData.customerPhone && data.customerPhone) {
      invoiceData.customerPhone = data.customerPhone.trim();
    }
    if (!invoiceData.customerAddress && data.customerAddress) {
      invoiceData.customerAddress = data.customerAddress.trim();
    }

    // Provide productType when available (helps PDF rendering and server schema)
    if ((selectedJobSheet as any)?.productType) {
      invoiceData.productType = (selectedJobSheet as any).productType;
    } else if (data.productType) {
      invoiceData.productType = data.productType.trim();
    }

    // Inject required customer fields expected by the server
    if (customerData) {
      invoiceData.customerName = customerData.customerName?.trim();
      invoiceData.customerPhone = customerData.customerPhone?.trim();
      invoiceData.customerAddress = customerData.customerAddress?.trim();
      // Optional helper fields
      invoiceData.customerState = customerData.state;
      invoiceData.city = customerData.city;
      invoiceData.pinCode = customerData.pinCode;
    } else if (selectedJobSheet) {
      // Include customerId if present (either flattened or nested)
      if ((selectedJobSheet as any).customerId) {
        invoiceData.customerId = (selectedJobSheet as any).customerId;
      } else if (selectedJobSheet.customer?.id) {
        invoiceData.customerId = selectedJobSheet.customer.id;
      }
      // Prefer flattened fields if available, otherwise nested
      invoiceData.customerName = (selectedJobSheet as any).customerName?.trim() || selectedJobSheet.customer?.name?.trim();
      invoiceData.customerPhone = (selectedJobSheet as any).customerPhone?.trim() || selectedJobSheet.customer?.phone?.trim();
      invoiceData.customerAddress = (selectedJobSheet as any).customerAddress?.trim() || selectedJobSheet.customer?.address?.trim();
      invoiceData.customerState = (selectedJobSheet as any).customerState || selectedJobSheet.customer?.state;
    }

    const isCustomerInfoReady = !!(invoiceData.customerName && invoiceData.customerPhone);
    const needsManualProductType = !jobSheetIdNumeric;
    if (needsManualProductType && !invoiceData.productType) {
      toast({
        title: "Missing product type",
        description: "Please enter Product Type when creating an invoice without a Job Sheet.",
        variant: "destructive",
      });
      return;
    }
    if (!isCustomerInfoReady) {
      toast({
        title: "Missing customer info",
        description: "Enter customer name and phone, or select a Job Sheet, or open from a Customer record.",
        variant: "destructive",
      });
      console.warn('Invoice submit blocked: missing customer fields', {
        hasCustomerData: !!customerData,
        selectedJobSheetId: selectedJobSheet?.id,
        derivedCustomerName: invoiceData.customerName,
        derivedCustomerPhone: invoiceData.customerPhone,
      });
      return;
    }

    // Debug: log final payload to verify on server side
    console.log('Invoice payload:', invoiceData);

    createInvoiceMutation.mutate(invoiceData);
  };

  const { subtotal, gstAmount, cgstAmount, sgstAmount, igstAmount, totalAmount } = calculateTotals();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Info Display - when coming from customer section */}
        {customerData && (
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">Customer:</span> <span className="text-gray-900 font-medium">{customerData.customerName}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Phone:</span> <span className="text-gray-900 font-medium">{customerData.customerPhone}</span>
                </div>
                <div className="col-span-2">
                  <span className="font-semibold text-gray-700">Address:</span> <span className="text-gray-900 font-medium">{customerData.customerAddress}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">City:</span> <span className="text-gray-900 font-medium">{customerData.city}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">State:</span> <span className="text-gray-900 font-medium">{customerData.state}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">PIN Code:</span> <span className="text-gray-900 font-medium">{customerData.pinCode}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customer details (manual) when NOT coming from customer and before job sheet selection */}
        {!customerData && !selectedJobSheet && (
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent>
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
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Phone *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerAddress"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Job Sheet Selection - only show if not coming from customer */}
        {!customerData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="jobSheetId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Job Sheet *</FormLabel>
                <Popover open={jobSheetOpen} onOpenChange={setJobSheetOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={jobSheetOpen}
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value
                          ? jobSheets.find(
                              (jobSheet: any) => jobSheet.id.toString() === field.value
                            )
                            ? `${jobSheets.find((js: any) => js.id.toString() === field.value)?.jobId} - ${jobSheets.find((js: any) => js.id.toString() === field.value)?.customer?.name}`
                            : field.value
                          : "Select or type job sheet..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput 
                        placeholder="Search or type job sheet..." 
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                      />
                      <CommandList>
                        <CommandEmpty>No job sheet found. Keep typing to enter manually.</CommandEmpty>
                        <CommandGroup>
                          {jobSheets.filter((js: any) => js.status === 'pending').map((jobSheet: any) => (
                            <CommandItem
                              key={jobSheet.id}
                              value={jobSheet.id.toString()}
                              onSelect={(currentValue) => {
                                field.onChange(currentValue);
                                setJobSheetOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === jobSheet.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {jobSheet.jobId} - {jobSheet.customer?.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="invoiceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="gst">GST Invoice</SelectItem>
                    <SelectItem value="non_gst">Non-GST Invoice</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>
        )}

        {/* Service Details Section */}
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="online">Online (UPI/Card)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Product Type — always visible. If Job Sheet is selected, show disabled with value from Job Sheet; else, allow manual entry. */}
              {selectedJobSheet ? (
                <FormItem>
                  <FormLabel>Product Type</FormLabel>
                  <FormControl>
                    <Input value={selectedJobSheet.productType || ""} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              ) : (
                <FormField
                  control={form.control}
                  name="productType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Type</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product type (e.g., TV, Washing Machine, AC)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter brand name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gstin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GSTIN</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter GSTIN number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="serviceCharge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Charge (₹) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount (₹)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch("invoiceType") === "gst" && (
            <FormField
              control={form.control}
              name="gstRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GST Rate (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="18.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Parts & Materials</CardTitle>
              <Button type="button" variant="outline" onClick={addPart}>
                <Plus className="h-4 w-4 mr-2" />
                Add Part
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {parts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No parts added</p>
            ) : (
              <div className="space-y-3">
                {parts.map((part, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        placeholder="Part name"
                        value={part.name}
                        onChange={(e) => updatePart(index, "name", e.target.value)}
                      />
                    </div>
                    <div className="w-20">
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={part.quantity}
                        onChange={(e) => updatePart(index, "quantity", parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Rate"
                        value={part.rate}
                        onChange={(e) => updatePart(index, "rate", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        value={`₹${part.amount.toFixed(2)}`}
                        disabled
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removePart(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="workDone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work Done</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the work performed..."
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
            name="remarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Remarks</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Additional remarks..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {form.watch("invoiceType") === "gst" && (
                <>
                  {(customerData?.state?.toLowerCase() === 'andhra pradesh' || customerData?.state?.toLowerCase() === 'ap') || (selectedJobSheet?.customer?.state?.toLowerCase() === 'andhra pradesh' || selectedJobSheet?.customer?.state?.toLowerCase() === 'ap') ? (
                    <>
                      <div className="flex justify-between">
                        <span>CGST ({(parseFloat(form.watch("gstRate") || "18") / 2).toFixed(1)}%):</span>
                        <span>₹{cgstAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SGST ({(parseFloat(form.watch("gstRate") || "18") / 2).toFixed(1)}%):</span>
                        <span>₹{sgstAmount.toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span>IGST ({form.watch("gstRate")}%):</span>
                      <span>₹{igstAmount.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total Amount:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            disabled={createInvoiceMutation.isPending || !!(customerData?.customerName && customerData?.customerPhone) === false}
          >
            {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}