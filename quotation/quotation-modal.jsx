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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus, Calculator } from "lucide-react";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
var quotationSchema = z.object({
    customerName: z.string().min(1, "Customer name is required"),
    customerPhone: z.string().min(10, "Valid phone number is required"),
    customerAddress: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    pinCode: z.string().min(6, "Valid pin code is required"),
    productType: z.string().min(1, "Product type is required"),
    brand: z.string().min(1, "Brand is required"),
    model: z.string().optional(),
    modelNumber: z.string().optional(),
    serialNumber: z.string().optional(),
    serviceCharge: z.number().min(0),
    paymentTerms: z.string().min(1, "Payment terms are required"),
    validityDays: z.number().min(1, "Validity days must be at least 1"),
    remarks: z.string().optional(),
});
export function QuotationModal(_a) {
    var isOpen = _a.isOpen, onClose = _a.onClose, quotationId = _a.quotationId, editingQuotation = _a.editingQuotation;
    var _b = useState([]), parts = _b[0], setParts = _b[1];
    var queryClient = useQueryClient();
    var form = useForm({
        resolver: zodResolver(quotationSchema),
        defaultValues: {
            customerName: "",
            customerPhone: "",
            customerAddress: "",
            city: "Vijayawada",
            state: "Andhra Pradesh",
            pinCode: "",
            productType: "",
            brand: "",
            model: "",
            modelNumber: "",
            serialNumber: "",
            serviceCharge: 0,
            paymentTerms: "CASH",
            validityDays: 10,
            remarks: "",
        },
    });
    var createQuotationMutation = useMutation({
        mutationFn: function (data) { return apiRequest("POST", "/api/quotations", data); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/quotations"] });
            toast({
                title: "Quotation created",
                description: "The quotation has been created successfully.",
            });
            onClose();
            resetForm();
        },
        onError: function (error) {
            console.error("Quotation creation error:", error);
            toast({
                title: "Error",
                description: (error === null || error === void 0 ? void 0 : error.message) || "Failed to create quotation.",
                variant: "destructive",
            });
        },
    });
    var updateQuotationMutation = useMutation({
        mutationFn: function (data) { return apiRequest("PUT", "/api/quotations/".concat(editingQuotation === null || editingQuotation === void 0 ? void 0 : editingQuotation.id), data); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/quotations"] });
            toast({
                title: "Quotation updated",
                description: "The quotation has been updated successfully.",
            });
            onClose();
            resetForm();
        },
        onError: function (error) {
            console.error("Quotation update error:", error);
            toast({
                title: "Error",
                description: (error === null || error === void 0 ? void 0 : error.message) || "Failed to update quotation.",
                variant: "destructive",
            });
        },
    });
    // Load customer data from localStorage when coming from customer page
    useEffect(function () {
        if (isOpen && !editingQuotation) {
            var customerData = localStorage.getItem('customerData');
            if (customerData) {
                try {
                    var data = JSON.parse(customerData);
                    form.setValue('customerName', data.customerName || '');
                    form.setValue('customerPhone', data.customerPhone || '');
                    form.setValue('customerAddress', data.customerAddress || '');
                    form.setValue('city', data.city || 'Vijayawada');
                    form.setValue('state', data.state || 'Andhra Pradesh');
                    form.setValue('pinCode', data.pinCode || '');
                    localStorage.removeItem('customerData');
                }
                catch (error) {
                    console.error('Error parsing customer data:', error);
                }
            }
        }
    }, [isOpen, editingQuotation, form]);
    // Load editing quotation data
    useEffect(function () {
        var _a;
        if (editingQuotation && isOpen) {
            form.setValue('customerName', editingQuotation.customerName || '');
            form.setValue('customerPhone', editingQuotation.customerPhone || '');
            form.setValue('customerAddress', editingQuotation.customerAddress || '');
            form.setValue('city', editingQuotation.city || 'Vijayawada');
            form.setValue('state', editingQuotation.state || 'Andhra Pradesh');
            form.setValue('pinCode', editingQuotation.pinCode || '');
            form.setValue('productType', editingQuotation.productType || '');
            form.setValue('brand', editingQuotation.brand || '');
            form.setValue('model', editingQuotation.model || '');
            form.setValue('modelNumber', editingQuotation.modelNumber || '');
            form.setValue('serialNumber', editingQuotation.serialNumber || '');
            form.setValue('serviceCharge', parseFloat(((_a = editingQuotation.serviceCharge) === null || _a === void 0 ? void 0 : _a.toString()) || '0'));
            form.setValue('paymentTerms', editingQuotation.paymentTerms || 'CASH');
            form.setValue('validityDays', editingQuotation.validityDays || 10);
            form.setValue('remarks', editingQuotation.remarks || '');
            // Set parts
            if (editingQuotation.parts && editingQuotation.parts.length > 0) {
                setParts(editingQuotation.parts.map(function (part) { return ({
                    name: part.name,
                    quantity: part.quantity,
                    unitPrice: part.unitPrice,
                    amount: part.amount
                }); }));
            }
        }
    }, [editingQuotation, isOpen, form]);
    var resetForm = function () {
        form.reset();
        setParts([]);
    };
    var addPart = function () {
        setParts(__spreadArray(__spreadArray([], parts, true), [{ name: "", quantity: 1, unitPrice: 0, amount: 0 }], false));
    };
    var removePart = function (index) {
        setParts(parts.filter(function (_, i) { return i !== index; }));
    };
    var updatePart = function (index, field, value) {
        var _a;
        var updatedParts = __spreadArray([], parts, true);
        updatedParts[index] = __assign(__assign({}, updatedParts[index]), (_a = {}, _a[field] = value, _a));
        // Calculate amount for quantity or unitPrice changes
        if (field === 'quantity' || field === 'unitPrice') {
            updatedParts[index].amount = updatedParts[index].quantity * updatedParts[index].unitPrice;
        }
        setParts(updatedParts);
    };
    var calculateTotal = function () {
        var serviceCharge = form.watch("serviceCharge") || 0;
        var partsTotal = parts.reduce(function (sum, part) { return sum + part.amount; }, 0);
        return serviceCharge + partsTotal;
    };
    var onSubmit = function (data) {
        var totalAmount = calculateTotal();
        console.log("Form submission data:", data);
        console.log("Parts:", parts);
        console.log("Total amount:", totalAmount);
        if (totalAmount === 0) {
            toast({
                title: "Error",
                description: "Please add service charge or parts to create a quotation.",
                variant: "destructive",
            });
            return;
        }
        var quotationData = __assign(__assign({}, data), { totalAmount: totalAmount, parts: parts.filter(function (part) { return part.name && part.quantity > 0 && part.unitPrice > 0; }) });
        console.log("Final quotation data:", quotationData);
        if (editingQuotation) {
            updateQuotationMutation.mutate(quotationData);
        }
        else {
            createQuotationMutation.mutate(quotationData);
        }
    };
    useEffect(function () {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);
    return (<Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingQuotation ? 'Edit Quotation' : 'Create New Quotation'}</DialogTitle>
          <DialogDescription>
            {editingQuotation ? 'Update the quotation details' : 'Create a professional quotation for customer approval'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="customerName" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>Customer Name *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-customer-name"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>

                <FormField control={form.control} name="customerPhone" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-customer-phone"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>

                <FormField control={form.control} name="customerAddress" render={function (_a) {
            var field = _a.field;
            return (<FormItem className="md:col-span-2">
                      <FormLabel>Address *</FormLabel>
                      <FormControl>
                        <Textarea {...field} data-testid="textarea-customer-address"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>

                <FormField control={form.control} name="city" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-city"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>

                <FormField control={form.control} name="state" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>State *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-state"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>

                <FormField control={form.control} name="pinCode" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>Pin Code *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-pin-code"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>
              </CardContent>
            </Card>

            {/* Product Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Product Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="productType" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>Product Type *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product type" {...field} data-testid="input-product-type"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>

                <FormField control={form.control} name="brand" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>Brand *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter brand" {...field} data-testid="input-brand"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>

                <FormField control={form.control} name="modelNumber" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>Model Number</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-model-number"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>

                <FormField control={form.control} name="serialNumber" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>Serial Number</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-serial-number"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>
              </CardContent>
            </Card>

            {/* Service and Parts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5"/>
                  Service Charges & Parts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="serviceCharge" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>Service Charge (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} onChange={function (e) { return field.onChange(parseFloat(e.target.value) || 0); }} data-testid="input-service-charge"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Parts</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addPart} data-testid="button-add-part">
                      <Plus className="h-4 w-4 mr-2"/>
                      Add Part
                    </Button>
                  </div>

                  {parts.map(function (part, index) { return (<div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-4">
                        <Label>Part Name</Label>
                        <Input value={part.name} onChange={function (e) { return updatePart(index, 'name', e.target.value); }} placeholder="Enter part name" data-testid={"input-part-name-".concat(index)}/>
                      </div>
                      <div className="col-span-2">
                        <Label>Qty</Label>
                        <Input type="number" min="1" value={part.quantity} onChange={function (e) { return updatePart(index, 'quantity', parseInt(e.target.value) || 1); }} data-testid={"input-part-quantity-".concat(index)}/>
                      </div>
                      <div className="col-span-2">
                        <Label>Rate (₹)</Label>
                        <Input type="number" min="0" step="0.01" value={part.unitPrice} onChange={function (e) { return updatePart(index, 'unitPrice', parseFloat(e.target.value) || 0); }} data-testid={"input-part-rate-".concat(index)}/>
                      </div>
                      <div className="col-span-2">
                        <Label>Amount (₹)</Label>
                        <Input type="number" value={part.amount.toFixed(2)} readOnly className="bg-gray-50" data-testid={"text-part-amount-".concat(index)}/>
                      </div>
                      <div className="col-span-2">
                        <Button type="button" variant="outline" size="sm" onClick={function () { return removePart(index); }} data-testid={"button-remove-part-".concat(index)}>
                          <Minus className="h-4 w-4"/>
                        </Button>
                      </div>
                    </div>); })}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-lg font-semibold">
                    Total Amount: ₹{calculateTotal().toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quotation Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="paymentTerms" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>Payment Terms *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-payment-terms">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CASH">Cash</SelectItem>
                          <SelectItem value="UPI">UPI</SelectItem>
                          <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                          <SelectItem value="ADVANCE_50">50% Advance</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>);
        }}/>

                <FormField control={form.control} name="validityDays" render={function (_a) {
            var field = _a.field;
            return (<FormItem>
                      <FormLabel>Validity (Days) *</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="365" {...field} onChange={function (e) { return field.onChange(parseInt(e.target.value) || 30); }} data-testid="input-validity-days"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>

                <FormField control={form.control} name="remarks" render={function (_a) {
            var field = _a.field;
            return (<FormItem className="md:col-span-2">
                      <FormLabel>Remarks</FormLabel>
                      <FormControl>
                        <Textarea {...field} data-testid="textarea-remarks"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>);
        }}/>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel">
                Cancel
              </Button>
              <Button type="submit" disabled={createQuotationMutation.isPending || updateQuotationMutation.isPending} data-testid="button-submit-quotation">
                {editingQuotation
            ? (updateQuotationMutation.isPending ? "Updating..." : "Update Quotation")
            : (createQuotationMutation.isPending ? "Creating..." : "Create Quotation")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>);
}
