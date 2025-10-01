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
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { generateJobSheetPDF } from "@/lib/pdf-generator";
var jobSheetSchema = z.object({
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
export default function JobSheetModal(_a) {
    var _this = this;
    var isOpen = _a.isOpen, onClose = _a.onClose, _b = _a.isEditMode, isEditMode = _b === void 0 ? false : _b, editingJobSheet = _a.editingJobSheet;
    var toast = useToast().toast;
    var queryClient = useQueryClient();
    var form = useForm({
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
    var technicians = useQuery({
        queryKey: ["/api/technicians"],
    }).data;
    var createJobSheetMutation = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var customerResponse, customer, jobSheetResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/customers", {
                            name: data.customerName,
                            phone: data.phone,
                            alternatePhone: data.alternatePhone,
                            address: data.address,
                            city: data.city,
                            state: data.state,
                            pinCode: data.pinCode,
                        })];
                    case 1:
                        customerResponse = _a.sent();
                        return [4 /*yield*/, customerResponse.json()];
                    case 2:
                        customer = _a.sent();
                        return [4 /*yield*/, apiRequest("POST", "/api/job-sheets", {
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
                            })];
                    case 3:
                        jobSheetResponse = _a.sent();
                        return [4 /*yield*/, jobSheetResponse.json()];
                    case 4: return [2 /*return*/, _a.sent()];
                }
            });
        }); },
        onSuccess: function (jobSheet) {
            queryClient.invalidateQueries({ queryKey: ["/api/job-sheets"] });
            queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
            toast({
                title: "Success",
                description: "Job sheet created successfully",
            });
            // Generate PDF
            generateJobSheetPDF(__assign(__assign({}, form.getValues()), { jobId: jobSheet.jobId }));
            handleClose();
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: "Failed to create job sheet",
                variant: "destructive",
            });
        },
    });
    // Update mutation for editing existing job sheets
    var updateJobSheetMutation = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            var customerResponse, jobSheetResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!editingJobSheet)
                            throw new Error("No job sheet to update");
                        return [4 /*yield*/, apiRequest("PATCH", "/api/customers/".concat(editingJobSheet.customer.id), {
                                name: data.customerName,
                                phone: data.phone,
                                alternatePhone: data.alternatePhone,
                                address: data.address,
                                city: data.city,
                                state: data.state,
                                pinCode: data.pinCode,
                            })];
                    case 1:
                        customerResponse = _a.sent();
                        return [4 /*yield*/, apiRequest("PATCH", "/api/job-sheets/".concat(editingJobSheet.id), {
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
                            })];
                    case 2:
                        jobSheetResponse = _a.sent();
                        return [4 /*yield*/, jobSheetResponse.json()];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        }); },
        onSuccess: function (jobSheet) {
            queryClient.invalidateQueries({ queryKey: ["/api/job-sheets"] });
            queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
            toast({
                title: "Success",
                description: "Job sheet updated successfully",
            });
            handleClose();
            // Success handler complete
        },
        onError: function (error) {
            toast({
                title: "Error",
                description: "Failed to update job sheet",
                variant: "destructive",
            });
        },
    });
    // Check for customer data from localStorage when modal opens (not in edit mode)
    useEffect(function () {
        if (!isEditMode && isOpen) {
            var customerData = localStorage.getItem('customerData');
            if (customerData) {
                try {
                    var data = JSON.parse(customerData);
                    form.setValue('customerName', data.customerName || '');
                    form.setValue('phone', data.phone || '');
                    form.setValue('alternatePhone', data.alternatePhone || '');
                    form.setValue('address', data.address || '');
                    form.setValue('city', data.city || '');
                    form.setValue('state', data.state || '');
                    form.setValue('pinCode', data.pinCode || '');
                    // Clear the localStorage after using the data
                    localStorage.removeItem('customerData');
                }
                catch (error) {
                    console.error('Error parsing customer data from localStorage:', error);
                }
            }
        }
    }, [isOpen, isEditMode, form]);
    // Pre-populate form when editing
    useEffect(function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        if (isEditMode && editingJobSheet) {
            var formData = {
                customerName: ((_a = editingJobSheet.customer) === null || _a === void 0 ? void 0 : _a.name) || "",
                phone: ((_b = editingJobSheet.customer) === null || _b === void 0 ? void 0 : _b.phone) || "",
                alternatePhone: ((_c = editingJobSheet.customer) === null || _c === void 0 ? void 0 : _c.alternatePhone) || "",
                address: ((_d = editingJobSheet.customer) === null || _d === void 0 ? void 0 : _d.address) || "",
                city: ((_e = editingJobSheet.customer) === null || _e === void 0 ? void 0 : _e.city) || "",
                state: ((_f = editingJobSheet.customer) === null || _f === void 0 ? void 0 : _f.state) || "",
                pinCode: ((_g = editingJobSheet.customer) === null || _g === void 0 ? void 0 : _g.pinCode) || "",
                productTypeId: editingJobSheet.productType || ((_h = editingJobSheet.productType) === null || _h === void 0 ? void 0 : _h.displayName) || "",
                brandId: editingJobSheet.brand || ((_j = editingJobSheet.brand) === null || _j === void 0 ? void 0 : _j.displayName) || "",
                modelId: editingJobSheet.model || ((_k = editingJobSheet.model) === null || _k === void 0 ? void 0 : _k.displayName) || "",
                modelNumber: editingJobSheet.modelNumber || "",
                serialNumber: editingJobSheet.serialNumber || "",
                purchaseDate: editingJobSheet.purchaseDate ? new Date(editingJobSheet.purchaseDate).toISOString().split('T')[0] : "",
                warrantyStatus: editingJobSheet.warrantyStatus || 'out_warranty',
                jobType: editingJobSheet.jobType || 'routine',
                jobClassification: editingJobSheet.jobClassification || 'repair',
                jobMode: editingJobSheet.jobMode || 'indoor',
                technicianId: ((_m = (_l = editingJobSheet.technician) === null || _l === void 0 ? void 0 : _l.id) === null || _m === void 0 ? void 0 : _m.toString()) || "",
                customerComplaint: editingJobSheet.customerComplaint || "",
                reportedIssue: editingJobSheet.reportedIssue || "",
                agentRemarks: editingJobSheet.agentRemarks || "",
                accessoriesReceived: editingJobSheet.accessoriesReceived || "",
            };
            form.reset(formData);
        }
        else {
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
    var handleClose = function () {
        form.reset();
        onClose();
    };
    var onSubmit = function (data) {
        if (isEditMode) {
            updateJobSheetMutation.mutate(data);
        }
        else {
            createJobSheetMutation.mutate(data);
        }
    };
    return (<Dialog open={isOpen} onOpenChange={handleClose}>
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
                <FormField control={form.control} name="customerName" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>Customer Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter customer name" {...field}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>
                <FormField control={form.control} name="phone" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="Enter phone number" {...field}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>
                <FormField control={form.control} name="alternatePhone" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>Alternate Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="Enter alternate phone" {...field}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>
                <FormField control={form.control} name="address" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>Address *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter customer address" {...field}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="city" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter city" {...field}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>);
        }}/>
                  <FormField control={form.control} name="state" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                        <FormLabel>State *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter state" {...field}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>);
        }}/>
                  <FormField control={form.control} name="pinCode" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                        <FormLabel>PIN Code *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter PIN code" {...field}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>);
        }}/>
                </div>
              </div>
            </div>

            {/* Product Information Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Product Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <FormField control={form.control} name="productTypeId" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>Product Type *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product type" {...field}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>
                <FormField control={form.control} name="brandId" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>Brand *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter brand" {...field}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>
                <FormField control={form.control} name="modelId" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter model" {...field}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <FormField control={form.control} name="purchaseDate" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>Date of Purchase</FormLabel>
                      <FormControl>
                        <Input type="date" {...field}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>
                <FormField control={form.control} name="warrantyStatus" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
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
                    </FormItem>);
        }}/>
              </div>
            </div>

            {/* Job Details Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Job Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <FormField control={form.control} name="jobType" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>Job Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Job Type"/>
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
                    </FormItem>);
        }}/>
                <FormField control={form.control} name="jobClassification" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>Job Classification *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Classification"/>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="repair">Repair</SelectItem>
                          <SelectItem value="installation">Installation</SelectItem>
                          <SelectItem value="repeat_repair">Repeat Repair</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>);
        }}/>
                <FormField control={form.control} name="jobMode" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
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
                    </FormItem>);
        }}/>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="technicianId" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>Technician Assigned</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Technician"/>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {technicians === null || technicians === void 0 ? void 0 : technicians.map(function (technician) { return (<SelectItem key={technician.id} value={technician.id.toString()}>
                              {technician.name}
                            </SelectItem>); })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>);
        }}/>
              </div>
            </div>

            {/* Issue Details Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Issue Details</h3>
              <div className="grid grid-cols-1 gap-4">
                <FormField control={form.control} name="customerComplaint" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>Customer Complaint *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe the customer's complaint..." rows={3} {...field}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>
                <FormField control={form.control} name="reportedIssue" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>Reported Issue</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Technical details of the reported issue..." rows={3} {...field}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>
                <FormField control={form.control} name="agentRemarks" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>Agent Remarks</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional remarks by the agent..." rows={2} {...field}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>
                <FormField control={form.control} name="accessoriesReceived" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>Accessories Received</FormLabel>
                      <FormControl>
                        <Textarea placeholder="List accessories received with the device (e.g., Remote control, Power cable, Manual...)" rows={2} {...field}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary-600 hover:bg-primary-700" disabled={createJobSheetMutation.isPending || updateJobSheetMutation.isPending}>
                {isEditMode
            ? (updateJobSheetMutation.isPending ? "Updating..." : "Update Job Sheet")
            : (createJobSheetMutation.isPending ? "Creating..." : "Create & Generate PDF")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>);
}
