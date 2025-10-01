var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger, } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
var invoiceSchema = z.object({
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
    // Manual product type when creating from Customer (no Job Sheet)
    productType: z.string().optional(),
});
export function InvoiceModal(_a) {
    var _this = this;
    var _b, _c, _d, _e, _f, _g;
    var onClose = _a.onClose, onSuccess = _a.onSuccess;
    var _h = useState([]), parts = _h[0], setParts = _h[1];
    var _j = useState(false), jobSheetOpen = _j[0], setJobSheetOpen = _j[1];
    var _k = useState(null), customerData = _k[0], setCustomerData = _k[1];
    var toast = useToast().toast;
    var form = useForm({
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
    var _l = useQuery({
        queryKey: ["/api/job-sheets"],
    }).data, jobSheets = _l === void 0 ? [] : _l;
    // Check for customer data from localStorage when modal opens
    useEffect(function () {
        var storedCustomerData = localStorage.getItem('customerData');
        if (storedCustomerData) {
            try {
                var data = JSON.parse(storedCustomerData);
                setCustomerData(data);
                // Clear the localStorage after using the data
                localStorage.removeItem('customerData');
            }
            catch (error) {
                console.error('Error parsing customer data from localStorage:', error);
            }
        }
    }, []);
    // Watch for job sheet selection to auto-populate fields
    var selectedJobSheetId = form.watch("jobSheetId");
    var selectedJobSheet = jobSheets.find(function (js) { return js.id.toString() === selectedJobSheetId; });
    // Auto-populate fields when job sheet is selected
    useEffect(function () {
        var _a;
        if (selectedJobSheet) {
            form.setValue("modelNumber", selectedJobSheet.modelNumber || "");
            form.setValue("serialNumber", selectedJobSheet.serialNumber || "");
            form.setValue("brand", ((_a = selectedJobSheet.brand) === null || _a === void 0 ? void 0 : _a.displayName) || "");
        }
    }, [selectedJobSheet, form]);
    var createInvoiceMutation = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/invoices", data)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            toast({
                title: "Success",
                description: "Invoice created successfully",
            });
            onSuccess();
        },
        onError: function (error) {
            console.error('Invoice mutation error:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to create invoice",
                variant: "destructive",
            });
        },
    });
    var addPart = function () {
        setParts(__spreadArray(__spreadArray([], parts, true), [{ name: "", quantity: 1, rate: 0, amount: 0 }], false));
    };
    var updatePart = function (index, field, value) {
        var updatedParts = __spreadArray([], parts, true);
        updatedParts[index][field] = value;
        if (field === "quantity" || field === "rate") {
            updatedParts[index].amount = updatedParts[index].quantity * updatedParts[index].rate;
        }
        setParts(updatedParts);
    };
    var removePart = function (index) {
        setParts(parts.filter(function (_, i) { return i !== index; }));
    };
    var calculateTotals = function () {
        var _a, _b, _c;
        var serviceCharge = parseFloat(form.watch("serviceCharge") || "0");
        var discount = parseFloat(form.watch("discount") || "0");
        var partsTotal = parts.reduce(function (sum, part) { return sum + part.amount; }, 0);
        var gstInclusiveTotal = serviceCharge + partsTotal - discount;
        var invoiceType = form.watch("invoiceType");
        var gstRate = parseFloat(form.watch("gstRate") || "18");
        var gstAmount = 0;
        var cgstAmount = 0;
        var sgstAmount = 0;
        var igstAmount = 0;
        var taxableAmount = gstInclusiveTotal;
        if (invoiceType === "gst") {
            // Since rates are GST-inclusive, calculate taxable amount
            // Taxable Amount = GST Inclusive Amount / (1 + GST Rate/100)
            taxableAmount = gstInclusiveTotal / (1 + gstRate / 100);
            gstAmount = gstInclusiveTotal - taxableAmount;
            // Check if customer is from Andhra Pradesh - use customerData if available, otherwise selectedJobSheet
            var customerState = ((_a = customerData === null || customerData === void 0 ? void 0 : customerData.state) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || ((_c = (_b = selectedJobSheet === null || selectedJobSheet === void 0 ? void 0 : selectedJobSheet.customer) === null || _b === void 0 ? void 0 : _b.state) === null || _c === void 0 ? void 0 : _c.toLowerCase());
            var isAndhraPradesh = customerState === 'andhra pradesh' || customerState === 'ap';
            if (isAndhraPradesh) {
                // For Andhra Pradesh: CGST + SGST (split GST amount equally)
                cgstAmount = gstAmount / 2;
                sgstAmount = gstAmount / 2;
            }
            else {
                // For other states: IGST
                igstAmount = gstAmount;
            }
        }
        var totalAmount = gstInclusiveTotal; // Total remains same as entered rates are GST-inclusive
        return {
            subtotal: taxableAmount, // This is now the taxable amount (excluding GST)
            gstAmount: gstAmount,
            cgstAmount: cgstAmount,
            sgstAmount: sgstAmount,
            igstAmount: igstAmount,
            totalAmount: totalAmount
        };
    };
    var onSubmit = function (data) {
        var _a = calculateTotals(), subtotal = _a.subtotal, gstAmount = _a.gstAmount, cgstAmount = _a.cgstAmount, sgstAmount = _a.sgstAmount, igstAmount = _a.igstAmount, totalAmount = _a.totalAmount;
        var jobSheetIdNumeric = data.jobSheetId && !isNaN(parseInt(data.jobSheetId)) ? parseInt(data.jobSheetId) : null;
        var invoiceData = __assign(__assign({}, data), { jobSheetId: jobSheetIdNumeric, serviceCharge: data.serviceCharge, discount: data.discount, subtotal: subtotal.toString(), gstAmount: gstAmount.toString(), totalAmount: totalAmount.toString(), parts: parts.filter(function (part) { return part.name && part.quantity > 0; }), 
            // Add customer data if available
            customerData: customerData || null });
        // Supply productType: from job sheet when selected, else from manual field
        if (selectedJobSheet && selectedJobSheet.productType) {
            invoiceData.productType = selectedJobSheet.productType;
        }
        else if (data.productType) {
            invoiceData.productType = data.productType.trim();
        }
        // Guard: when no Job Sheet, productType is required
        if (!jobSheetIdNumeric && !invoiceData.productType) {
            toast({
                title: "Missing product type",
                description: "Please enter Product Type when creating an invoice without a Job Sheet.",
                variant: "destructive",
            });
            return;
        }
        createInvoiceMutation.mutate(invoiceData);
    };
    var _m = calculateTotals(), subtotal = _m.subtotal, gstAmount = _m.gstAmount, cgstAmount = _m.cgstAmount, sgstAmount = _m.sgstAmount, igstAmount = _m.igstAmount, totalAmount = _m.totalAmount;
    return (<Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Info Display - when coming from customer section */}
        {customerData && (<Card>
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
          </Card>)}

        {/* Job Sheet Selection - only show if not coming from customer */}
        {!customerData && (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="jobSheetId" render={function (_a) {
                var _b, _c, _d;
                var field = _a.field;
                return (<FormItem className="flex flex-col">
                  <FormLabel>Job Sheet *</FormLabel>
                <Popover open={jobSheetOpen} onOpenChange={setJobSheetOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline" role="combobox" aria-expanded={jobSheetOpen} className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                        {field.value
                        ? jobSheets.find(function (jobSheet) { return jobSheet.id.toString() === field.value; })
                            ? "".concat((_b = jobSheets.find(function (js) { return js.id.toString() === field.value; })) === null || _b === void 0 ? void 0 : _b.jobId, " - ").concat((_d = (_c = jobSheets.find(function (js) { return js.id.toString() === field.value; })) === null || _c === void 0 ? void 0 : _c.customer) === null || _d === void 0 ? void 0 : _d.name)
                            : field.value
                        : "Select or type job sheet..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search or type job sheet..." value={field.value} onValueChange={function (value) {
                        field.onChange(value);
                    }}/>
                      <CommandList>
                        <CommandEmpty>No job sheet found. Keep typing to enter manually.</CommandEmpty>
                        <CommandGroup>
                          {jobSheets.filter(function (js) { return js.status === 'pending'; }).map(function (jobSheet) {
                        var _a;
                        return (<CommandItem key={jobSheet.id} value={jobSheet.id.toString()} onSelect={function (currentValue) {
                                field.onChange(currentValue);
                                setJobSheetOpen(false);
                            }}>
                              <Check className={cn("mr-2 h-4 w-4", field.value === jobSheet.id.toString()
                                ? "opacity-100"
                                : "opacity-0")}/>
                              {jobSheet.jobId} - {(_a = jobSheet.customer) === null || _a === void 0 ? void 0 : _a.name}
                            </CommandItem>);
                    })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>);
            }}/>

          <FormField control={form.control} name="invoiceType" render={function (_a) {
                var field = _a.field;
                return (<FormItem>
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
              </FormItem>);
            }}/>
          </div>)}

        {/* Service Details Section */}
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField control={form.control} name="paymentMethod" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
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
                  </FormItem>);
        }}/>

              {/* Product Type — always visible. If Job Sheet is selected, show disabled with value from Job Sheet; else, allow manual entry. */}
              {selectedJobSheet ? (
                <FormItem>
                  <FormLabel>Product Type</FormLabel>
                  <FormControl>
                    <Input value={(selectedJobSheet && selectedJobSheet.productType) || ""} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              ) : (
                <FormField
                  control={form.control}
                  name="productType"
                  render={function ({ field }) {
                    return (
                      <FormItem>
                        <FormLabel>Product Type</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product type (e.g., TV, Washing Machine, AC)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              )}

              <FormField control={form.control} name="modelNumber" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                    <FormLabel>Model Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter model number" {...field}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>);
        }}/>

              <FormField control={form.control} name="serialNumber" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                    <FormLabel>Serial Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter serial number" {...field}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>);
        }}/>

              <FormField control={form.control} name="brand" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter brand name" {...field}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>);
        }}/>

              <FormField control={form.control} name="gstin" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                    <FormLabel>GSTIN</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter GSTIN number" {...field}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>);
        }}/>

            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="serviceCharge" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                <FormLabel>Service Charge (₹) *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field}/>
                </FormControl>
                <FormMessage />
              </FormItem>);
        }}/>

          <FormField control={form.control} name="discount" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                <FormLabel>Discount (₹)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field}/>
                </FormControl>
                <FormMessage />
              </FormItem>);
        }}/>

          {form.watch("invoiceType") === "gst" && (<FormField control={form.control} name="gstRate" render={function (_a) {
                var field = _a.field;
                return (<FormItem>
                  <FormLabel>GST Rate (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="18.00" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>);
            }}/>)}
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Parts & Materials</CardTitle>
              <Button type="button" variant="outline" onClick={addPart}>
                <Plus className="h-4 w-4 mr-2"/>
                Add Part
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {parts.length === 0 ? (<p className="text-gray-500 text-center py-4">No parts added</p>) : (<div className="space-y-3">
                {parts.map(function (part, index) { return (<div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input placeholder="Part name" value={part.name} onChange={function (e) { return updatePart(index, "name", e.target.value); }}/>
                    </div>
                    <div className="w-20">
                      <Input type="number" placeholder="Qty" value={part.quantity} onChange={function (e) { return updatePart(index, "quantity", parseInt(e.target.value) || 0); }}/>
                    </div>
                    <div className="w-24">
                      <Input type="number" step="0.01" placeholder="Rate" value={part.rate} onChange={function (e) { return updatePart(index, "rate", parseFloat(e.target.value) || 0); }}/>
                    </div>
                    <div className="w-24">
                      <Input value={"\u20B9".concat(part.amount.toFixed(2))} disabled/>
                    </div>
                    <Button type="button" variant="outline" size="icon" onClick={function () { return removePart(index); }}>
                      <Trash2 className="h-4 w-4"/>
                    </Button>
                  </div>); })}
              </div>)}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="workDone" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                <FormLabel>Work Done</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe the work performed..." rows={3} {...field}/>
                </FormControl>
                <FormMessage />
              </FormItem>);
        }}/>

          <FormField control={form.control} name="remarks" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                <FormLabel>Remarks</FormLabel>
                <FormControl>
                  <Textarea placeholder="Additional remarks..." rows={3} {...field}/>
                </FormControl>
                <FormMessage />
              </FormItem>);
        }}/>
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
              {form.watch("invoiceType") === "gst" && (<>
                  {(((_b = customerData === null || customerData === void 0 ? void 0 : customerData.state) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === 'andhra pradesh' || ((_c = customerData === null || customerData === void 0 ? void 0 : customerData.state) === null || _c === void 0 ? void 0 : _c.toLowerCase()) === 'ap') || (((_e = (_d = selectedJobSheet === null || selectedJobSheet === void 0 ? void 0 : selectedJobSheet.customer) === null || _d === void 0 ? void 0 : _d.state) === null || _e === void 0 ? void 0 : _e.toLowerCase()) === 'andhra pradesh' || ((_g = (_f = selectedJobSheet === null || selectedJobSheet === void 0 ? void 0 : selectedJobSheet.customer) === null || _f === void 0 ? void 0 : _f.state) === null || _g === void 0 ? void 0 : _g.toLowerCase()) === 'ap') ? (<>
                      <div className="flex justify-between">
                        <span>CGST ({(parseFloat(form.watch("gstRate") || "18") / 2).toFixed(1)}%):</span>
                        <span>₹{cgstAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SGST ({(parseFloat(form.watch("gstRate") || "18") / 2).toFixed(1)}%):</span>
                        <span>₹{sgstAmount.toFixed(2)}</span>
                      </div>
                    </>) : (<div className="flex justify-between">
                      <span>IGST ({form.watch("gstRate")}%):</span>
                      <span>₹{igstAmount.toFixed(2)}</span>
                    </div>)}
                </>)}
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total Amount:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={createInvoiceMutation.isPending}>
            {createInvoiceMutation.isPending ? "Creating..." : "Create Invoice"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>);
}
