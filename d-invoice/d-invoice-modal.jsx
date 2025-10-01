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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
var dInvoiceSchema = z.object({
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
var partSchema = z.object({
    name: z.string().min(1, "Part name is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    rate: z.number().min(0, "Rate must be positive"),
});
export function DInvoiceModal(_a) {
    var _this = this;
    var _b, _c, _d, _e;
    var onClose = _a.onClose, onSuccess = _a.onSuccess;
    var _f = useState([]), parts = _f[0], setParts = _f[1];
    var _g = useState(false), jobSheetOpen = _g[0], setJobSheetOpen = _g[1];
    var _h = useState(""), customerState = _h[0], setCustomerState = _h[1];
    var _j = useState(null), customerData = _j[0], setCustomerData = _j[1];
    var toast = useToast().toast;
    var form = useForm({
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
    var _k = useQuery({
        queryKey: ["/api/job-sheets"],
    }).data, jobSheets = _k === void 0 ? [] : _k;
    // Check for customer data from localStorage when modal opens
    useEffect(function () {
        var storedCustomerData = localStorage.getItem('customerData');
        if (storedCustomerData) {
            try {
                var data = JSON.parse(storedCustomerData);
                setCustomerData(data);
                setCustomerState(data.state || "");
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
        var _a, _b;
        if (selectedJobSheet) {
            form.setValue("modelNumber", selectedJobSheet.modelNumber || "");
            form.setValue("serialNumber", selectedJobSheet.serialNumber || "");
            form.setValue("brand", ((_a = selectedJobSheet.brand) === null || _a === void 0 ? void 0 : _a.displayName) || "");
            // Set customer state for GST calculation
            setCustomerState(((_b = selectedJobSheet.customer) === null || _b === void 0 ? void 0 : _b.state) || "");
        }
    }, [selectedJobSheet, form]);
    var addPart = function () {
        var newPart = { name: "", quantity: 1, rate: 0, amount: 0 };
        setParts(__spreadArray(__spreadArray([], parts, true), [newPart], false));
    };
    var removePart = function (index) {
        setParts(parts.filter(function (_, i) { return i !== index; }));
    };
    var updatePart = function (index, field, value) {
        var updatedParts = parts.map(function (part, i) {
            var _a;
            if (i === index) {
                var updated = __assign(__assign({}, part), (_a = {}, _a[field] = value, _a));
                if (field === "quantity" || field === "rate") {
                    updated.amount = updated.quantity * updated.rate;
                }
                return updated;
            }
            return part;
        });
        setParts(updatedParts);
    };
    var calculateTotals = function () {
        var serviceCharge = parseFloat(form.watch("serviceCharge") || "0");
        var discount = parseFloat(form.watch("discount") || "0");
        var partsTotal = parts.reduce(function (sum, part) { return sum + part.amount; }, 0);
        var gstInclusiveTotal = serviceCharge + partsTotal - discount;
        var gstAmount = 0;
        var taxableAmount = gstInclusiveTotal;
        if (form.watch("invoiceType") === "gst") {
            var gstRate = parseFloat(form.watch("gstRate") || "18");
            // Since rates are GST-inclusive, calculate taxable amount
            // Taxable Amount = GST Inclusive Amount / (1 + GST Rate/100)
            taxableAmount = gstInclusiveTotal / (1 + gstRate / 100);
            gstAmount = gstInclusiveTotal - taxableAmount;
        }
        var total = gstInclusiveTotal; // Total remains same as entered rates are GST-inclusive
        return {
            subtotal: taxableAmount.toFixed(2), // This is now the taxable amount (excluding GST)
            gstAmount: gstAmount.toFixed(2),
            total: total.toFixed(2),
            isInterstate: ((customerData === null || customerData === void 0 ? void 0 : customerData.state) && customerData.state.toLowerCase() !== "andhra pradesh") || (customerState && customerState.toLowerCase() !== "andhra pradesh"),
            gstBreakdown: form.watch("invoiceType") === "gst"
                ? (((customerData === null || customerData === void 0 ? void 0 : customerData.state) && customerData.state.toLowerCase() !== "andhra pradesh") || (customerState && customerState.toLowerCase() !== "andhra pradesh")
                    ? { igst: gstAmount.toFixed(2), cgst: "0.00", sgst: "0.00" }
                    : { igst: "0.00", cgst: (gstAmount / 2).toFixed(2), sgst: (gstAmount / 2).toFixed(2) })
                : { igst: "0.00", cgst: "0.00", sgst: "0.00" }
        };
    };
    var totals = calculateTotals();
    var createDInvoiceMutation = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/d-invoices", data)];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.json()];
                }
            });
        }); },
        onSuccess: function () {
            toast({
                title: "Success",
                description: "D-Invoice created successfully",
            });
            onSuccess();
            form.reset();
            setParts([]);
        },
        onError: function () {
            toast({
                title: "Error",
                description: "Failed to create D-invoice",
                variant: "destructive",
            });
        },
    });
    var onSubmit = function (data) { return __awaiter(_this, void 0, void 0, function () {
        var manualJobSheetIds, formData, submitData;
        return __generator(this, function (_a) {
            try {
                manualJobSheetIds = data.manualJobSheetIds, formData = __rest(data, ["manualJobSheetIds"]);
                submitData = __assign(__assign({}, formData), { jobSheetId: data.jobSheetId ? parseInt(data.jobSheetId) : null, subtotal: totals.subtotal, gstAmount: totals.gstAmount, totalAmount: totals.total, parts: parts.map(function (part) { return ({
                        partName: part.name,
                        quantity: part.quantity,
                        unitPrice: part.rate.toString(),
                        amount: part.amount.toString(),
                    }); }), 
                    // Add customer data if available
                    customerData: customerData || null });
                createDInvoiceMutation.mutate(submitData);
            }
            catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to create D-invoice",
                    variant: "destructive",
                });
            }
            return [2 /*return*/];
        });
    }); };
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
        {/* Job Sheet Selection */}
        <FormField control={form.control} name="jobSheetId" render={function (_a) {
            var _b;
            var field = _a.field;
            return (<FormItem className="flex flex-col">
              <FormLabel>Job Sheet</FormLabel>
              <Popover open={jobSheetOpen} onOpenChange={setJobSheetOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                      {field.value
                    ? ((_b = jobSheets.find(function (js) { return js.id.toString() === field.value; })) === null || _b === void 0 ? void 0 : _b.jobId) || "Select job sheet..."
                    : "Select job sheet..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search job sheets..."/>
                    <CommandEmpty>No job sheet found.</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {jobSheets.map(function (js) {
                    var _a, _b, _c;
                    return (<CommandItem value={js.jobId} key={js.id} onSelect={function () {
                            form.setValue("jobSheetId", js.id.toString());
                            setJobSheetOpen(false);
                        }}>
                            <Check className={cn("mr-2 h-4 w-4", js.id.toString() === field.value
                            ? "opacity-100"
                            : "opacity-0")}/>
                            <div className="flex flex-col">
                              <span>{js.jobId}</span>
                              <span className="text-sm text-muted-foreground">
                                {(_a = js.customer) === null || _a === void 0 ? void 0 : _a.name} - {(_b = js.brand) === null || _b === void 0 ? void 0 : _b.displayName} {(_c = js.model) === null || _c === void 0 ? void 0 : _c.displayName}
                              </span>
                            </div>
                          </CommandItem>);
                })}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>);
        }}/>

        {/* Customer and Product Info */}
        {selectedJobSheet && (<Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Customer:</span> {(_b = selectedJobSheet.customer) === null || _b === void 0 ? void 0 : _b.name}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {(_c = selectedJobSheet.customer) === null || _c === void 0 ? void 0 : _c.phone}
                </div>
                <div>
                  <span className="font-medium">Product:</span> {(_d = selectedJobSheet.brand) === null || _d === void 0 ? void 0 : _d.displayName} {(_e = selectedJobSheet.model) === null || _e === void 0 ? void 0 : _e.displayName}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {selectedJobSheet.status}
                </div>
              </div>
            </CardContent>
          </Card>)}

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="invoiceType" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                <FormLabel>Invoice Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select invoice type"/>
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

          <FormField control={form.control} name="paymentMethod" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method"/>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>);
        }}/>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="serviceCharge" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                <FormLabel>Service Charge</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field}/>
                </FormControl>
                <FormMessage />
              </FormItem>);
        }}/>

          <FormField control={form.control} name="discount" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                <FormLabel>Discount</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field}/>
                </FormControl>
                <FormMessage />
              </FormItem>);
        }}/>
        </div>

        {form.watch("invoiceType") === "gst" && (<div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="gstRate" render={function (_a) {
                var field = _a.field;
                return (<FormItem>
                  <FormLabel>GST Rate (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>);
            }}/>

            <FormField control={form.control} name="gstin" render={function (_a) {
                var field = _a.field;
                return (<FormItem>
                  <FormLabel>GSTIN</FormLabel>
                  <FormControl>
                    <Input {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>);
            }}/>
          </div>)}

        <div className="grid grid-cols-3 gap-4">
          <FormField control={form.control} name="modelNumber" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                <FormLabel>Model Number</FormLabel>
                <FormControl>
                  <Input {...field}/>
                </FormControl>
                <FormMessage />
              </FormItem>);
        }}/>

          <FormField control={form.control} name="serialNumber" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                <FormLabel>Serial Number</FormLabel>
                <FormControl>
                  <Input {...field}/>
                </FormControl>
                <FormMessage />
              </FormItem>);
        }}/>

          <FormField control={form.control} name="brand" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input {...field}/>
                </FormControl>
                <FormMessage />
              </FormItem>);
        }}/>
        </div>

        {/* Parts Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Parts</h3>
            <Button type="button" onClick={addPart} size="sm">
              <Plus className="h-4 w-4 mr-2"/>
              Add Part
            </Button>
          </div>

          {parts.length > 0 && (<div className="space-y-4">
              {parts.map(function (part, index) { return (<Card key={index}>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-5 gap-4 items-end">
                      <div className="col-span-2">
                        <label className="text-sm font-medium">Part Name</label>
                        <Input value={part.name} onChange={function (e) { return updatePart(index, "name", e.target.value); }} placeholder="Enter part name"/>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Quantity</label>
                        <Input type="number" min="1" value={part.quantity} onChange={function (e) { return updatePart(index, "quantity", parseInt(e.target.value) || 1); }}/>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Rate</label>
                        <Input type="number" step="0.01" min="0" value={part.rate} onChange={function (e) { return updatePart(index, "rate", parseFloat(e.target.value) || 0); }}/>
                      </div>
                      <div className="flex items-center gap-2">
                        <div>
                          <label className="text-sm font-medium">Amount</label>
                          <div className="text-lg font-medium">₹{part.amount.toFixed(2)}</div>
                        </div>
                        <Button type="button" variant="destructive" size="sm" onClick={function () { return removePart(index); }}>
                          <Trash2 className="h-4 w-4"/>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>); })}
            </div>)}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="workDone" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                <FormLabel>Work Done</FormLabel>
                <FormControl>
                  <Textarea {...field}/>
                </FormControl>
                <FormMessage />
              </FormItem>);
        }}/>

          <FormField control={form.control} name="remarks" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                <FormLabel>Remarks</FormLabel>
                <FormControl>
                  <Textarea {...field}/>
                </FormControl>
                <FormMessage />
              </FormItem>);
        }}/>
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
              {form.watch("invoiceType") === "gst" && (<>
                  {totals.isInterstate ? (<div className="flex justify-between">
                      <span>IGST ({form.watch("gstRate")}%):</span>
                      <span>₹{totals.gstBreakdown.igst}</span>
                    </div>) : (<>
                      <div className="flex justify-between">
                        <span>CGST ({(parseFloat(form.watch("gstRate") || "18") / 2)}%):</span>
                        <span>₹{totals.gstBreakdown.cgst}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SGST ({(parseFloat(form.watch("gstRate") || "18") / 2)}%):</span>
                        <span>₹{totals.gstBreakdown.sgst}</span>
                      </div>
                    </>)}
                </>)}
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
          <Button type="submit" disabled={createDInvoiceMutation.isPending}>
            {createDInvoiceMutation.isPending ? "Creating..." : "Create D-Invoice"}
          </Button>
        </div>
      </form>
    </Form>);
}
