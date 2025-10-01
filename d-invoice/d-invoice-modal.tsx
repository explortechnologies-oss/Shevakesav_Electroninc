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

const dInvoiceSchema = z.object({
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
});

const partSchema = z.object({
  name: z.string().min(1, "Part name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  rate: z.number().min(0, "Rate must be positive"),
});

interface DInvoiceModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function DInvoiceModal({ onClose, onSuccess }: DInvoiceModalProps) {
  const [parts, setParts] = useState<Array<{ name: string; quantity: number; rate: number; amount: number }>>([]);
  const [jobSheetOpen, setJobSheetOpen] = useState(false);
  const [customerState, setCustomerState] = useState<string>("");
  const [customerData, setCustomerData] = useState<any>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof dInvoiceSchema>>({
    resolver: zodResolver(dInvoiceSchema),
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
        setCustomerState(data.state || "");
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
      // Set customer state for GST calculation
      setCustomerState(selectedJobSheet.customer?.state || "");
    }
  }, [selectedJobSheet, form]);

  const addPart = () => {
    const newPart = { name: "", quantity: 1, rate: 0, amount: 0 };
    setParts([...parts, newPart]);
  };

  const removePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const updatePart = (index: number, field: string, value: any) => {
    const updatedParts = parts.map((part, i) => {
      if (i === index) {
        const updated = { ...part, [field]: value };
        if (field === "quantity" || field === "rate") {
          updated.amount = updated.quantity * updated.rate;
        }
        return updated;
      }
      return part;
    });
    setParts(updatedParts);
  };

  const calculateTotals = () => {
    const serviceCharge = parseFloat(form.watch("serviceCharge") || "0");
    const discount = parseFloat(form.watch("discount") || "0");
    const partsTotal = parts.reduce((sum, part) => sum + part.amount, 0);
    const gstInclusiveTotal = serviceCharge + partsTotal - discount;
    
    let gstAmount = 0;
    let taxableAmount = gstInclusiveTotal;
    
    if (form.watch("invoiceType") === "gst") {
      const gstRate = parseFloat(form.watch("gstRate") || "18");
      // Since rates are GST-inclusive, calculate taxable amount
      // Taxable Amount = GST Inclusive Amount / (1 + GST Rate/100)
      taxableAmount = gstInclusiveTotal / (1 + gstRate / 100);
      gstAmount = gstInclusiveTotal - taxableAmount;
    }
    
    const total = gstInclusiveTotal; // Total remains same as entered rates are GST-inclusive
    
    return {
      subtotal: taxableAmount.toFixed(2), // This is now the taxable amount (excluding GST)
      gstAmount: gstAmount.toFixed(2),
      total: total.toFixed(2),
      isInterstate: (customerData?.state && customerData.state.toLowerCase() !== "andhra pradesh") || (customerState && customerState.toLowerCase() !== "andhra pradesh"),
      gstBreakdown: form.watch("invoiceType") === "gst" 
        ? ((customerData?.state && customerData.state.toLowerCase() !== "andhra pradesh") || (customerState && customerState.toLowerCase() !== "andhra pradesh")
          ? { igst: gstAmount.toFixed(2), cgst: "0.00", sgst: "0.00" }
          : { igst: "0.00", cgst: (gstAmount / 2).toFixed(2), sgst: (gstAmount / 2).toFixed(2) })
        : { igst: "0.00", cgst: "0.00", sgst: "0.00" }
    };
  };

  const totals = calculateTotals();

  const createDInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/d-invoices", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "D-Invoice created successfully",
      });
      onSuccess();
      form.reset();
      setParts([]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create D-invoice",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: z.infer<typeof dInvoiceSchema>) => {
    try {
      const { manualJobSheetIds, ...formData } = data; // Remove unused fields
      const submitData = {
        ...formData,
        jobSheetId: data.jobSheetId ? parseInt(data.jobSheetId) : null,
        subtotal: totals.subtotal,
        gstAmount: totals.gstAmount,
        totalAmount: totals.total,
        parts: parts.map(part => ({
          partName: part.name,
          quantity: part.quantity,
          unitPrice: part.rate.toString(),
          amount: part.amount.toString(),
        })),
        // Add customer data if available
        customerData: customerData || null,
      };

      createDInvoiceMutation.mutate(submitData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create D-invoice",
        variant: "destructive",
      });
    }
  };

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
        {/* Job Sheet Selection */}
        <FormField
          control={form.control}
          name="jobSheetId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Job Sheet</FormLabel>
              <Popover open={jobSheetOpen} onOpenChange={setJobSheetOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? jobSheets.find((js) => js.id.toString() === field.value)
                            ?.jobId || "Select job sheet..."
                        : "Select job sheet..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search job sheets..." />
                    <CommandEmpty>No job sheet found.</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {jobSheets.map((js) => (
                          <CommandItem
                            value={js.jobId}
                            key={js.id}
                            onSelect={() => {
                              form.setValue("jobSheetId", js.id.toString());
                              setJobSheetOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                js.id.toString() === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{js.jobId}</span>
                              <span className="text-sm text-muted-foreground">
                                {js.customer?.name} - {js.brand?.displayName} {js.model?.displayName}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Customer and Product Info */}
        {selectedJobSheet && (
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Customer:</span> {selectedJobSheet.customer?.name}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {selectedJobSheet.customer?.phone}
                </div>
                <div>
                  <span className="font-medium">Product:</span> {selectedJobSheet.brand?.displayName} {selectedJobSheet.model?.displayName}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {selectedJobSheet.status}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="invoiceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select invoice type" />
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

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="serviceCharge"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Charge</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
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
                <FormLabel>Discount</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {form.watch("invoiceType") === "gst" && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="gstRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GST Rate (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="modelNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model Number</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                  <Input {...field} />
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
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Parts Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Parts</h3>
            <Button type="button" onClick={addPart} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Part
            </Button>
          </div>

          {parts.length > 0 && (
            <div className="space-y-4">
              {parts.map((part, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-5 gap-4 items-end">
                      <div className="col-span-2">
                        <label className="text-sm font-medium">Part Name</label>
                        <Input
                          value={part.name}
                          onChange={(e) => updatePart(index, "name", e.target.value)}
                          placeholder="Enter part name"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Quantity</label>
                        <Input
                          type="number"
                          min="1"
                          value={part.quantity}
                          onChange={(e) => updatePart(index, "quantity", parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Rate</label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={part.rate}
                          onChange={(e) => updatePart(index, "rate", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <div>
                          <label className="text-sm font-medium">Amount</label>
                          <div className="text-lg font-medium">₹{part.amount.toFixed(2)}</div>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removePart(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="workDone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work Done</FormLabel>
                <FormControl>
                  <Textarea {...field} />
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
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Totals */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{totals.subtotal}</span>
              </div>
              {form.watch("invoiceType") === "gst" && (
                <>
                  {totals.isInterstate ? (
                    <div className="flex justify-between">
                      <span>IGST ({form.watch("gstRate")}%):</span>
                      <span>₹{totals.gstBreakdown.igst}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span>CGST ({(parseFloat(form.watch("gstRate") || "18") / 2)}%):</span>
                        <span>₹{totals.gstBreakdown.cgst}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SGST ({(parseFloat(form.watch("gstRate") || "18") / 2)}%):</span>
                        <span>₹{totals.gstBreakdown.sgst}</span>
                      </div>
                    </>
                  )}
                </>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>₹{totals.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createDInvoiceMutation.isPending}
          >
            {createDInvoiceMutation.isPending ? "Creating..." : "Create D-Invoice"}
          </Button>
        </div>
      </form>
    </Form>
  );
}