import { pgTable, text, varchar, integer, timestamp, numeric, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
// Users table
export var users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 255 }).notNull().unique(),
    password: text("password").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    role: varchar("role", { length: 50 }).notNull().default('admin'),
});
// Customers table
export var customers = pgTable("customers", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    alternatePhone: varchar("alternate_phone", { length: 20 }),
    address: text("address").notNull(),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 100 }),
    pinCode: varchar("pin_code", { length: 10 }),
    createdAt: timestamp("created_at").defaultNow(),
});
// Technicians table
export var technicians = pgTable("technicians", {
    id: serial("id").primaryKey(),
    employeeId: varchar("employee_id", { length: 50 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    role: varchar("role", { length: 50 }).notNull().default('technician'),
    joiningDate: timestamp("joining_date").notNull(),
    baseSalary: numeric("base_salary", { precision: 10, scale: 2 }),
    status: varchar("status", { length: 20 }).default('active'),
    createdAt: timestamp("created_at").defaultNow(),
});
// Product categories and models
export var productTypes = pgTable("product_types", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    displayName: varchar("display_name", { length: 255 }).notNull(),
});
export var brands = pgTable("brands", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    displayName: varchar("display_name", { length: 255 }).notNull(),
});
export var models = pgTable("models", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    displayName: varchar("display_name", { length: 255 }).notNull(),
    brandId: integer("brand_id").references(function () { return brands.id; }),
});
// Job sheets table
export var jobSheets = pgTable("job_sheets", {
    id: serial("id").primaryKey(),
    jobId: varchar("job_id", { length: 50 }).notNull().unique(),
    customerId: integer("customer_id").references(function () { return customers.id; }),
    productTypeId: integer("product_type_id").references(function () { return productTypes.id; }),
    brandId: integer("brand_id").references(function () { return brands.id; }),
    modelId: integer("model_id").references(function () { return models.id; }),
    productType: varchar("product_type", { length: 100 }),
    brand: varchar("brand", { length: 100 }),
    model: varchar("model", { length: 100 }),
    modelNumber: varchar("model_number", { length: 100 }),
    serialNumber: varchar("serial_number", { length: 100 }),
    purchaseDate: timestamp("purchase_date"),
    warrantyStatus: varchar("warranty_status", { length: 20 }).default('out_warranty'),
    jobType: varchar("job_type", { length: 20 }).notNull(),
    jobClassification: varchar("job_classification", { length: 30 }).notNull(),
    jobMode: varchar("job_mode", { length: 20 }).default('indoor'),
    technicianId: integer("technician_id").references(function () { return technicians.id; }),
    agentId: integer("agent_id").references(function () { return users.id; }),
    customerComplaint: text("customer_complaint").notNull(),
    reportedIssue: text("reported_issue"),
    agentRemarks: text("agent_remarks"),
    accessoriesReceived: text("accessories_received"),
    jobStartDateTime: timestamp("job_start_date_time"),
    status: varchar("status", { length: 20 }).default('pending'),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
// Inventory table
export var inventory = pgTable("inventory", {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    category: varchar("category", { length: 50 }).notNull(), // 'accessories', 'spares', 'devices'
    quantity: integer("quantity").notNull().default(0),
    minQuantity: integer("min_quantity").notNull().default(5),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }),
    createdAt: timestamp("created_at").defaultNow(),
});
// Payments table
export var payments = pgTable("payments", {
    id: serial("id").primaryKey(),
    jobSheetId: integer("job_sheet_id").references(function () { return jobSheets.id; }),
    clientAmount: numeric("client_amount", { precision: 10, scale: 2 }).notNull(),
    internalAmount: numeric("internal_amount", { precision: 10, scale: 2 }).notNull(),
    discount: numeric("discount", { precision: 10, scale: 2 }).default('0'),
    advancePaid: numeric("advance_paid", { precision: 10, scale: 2 }).default('0'),
    balance: numeric("balance", { precision: 10, scale: 2 }).notNull(),
    paymentMode: varchar("payment_mode", { length: 50 }),
    status: varchar("status", { length: 20 }).default('pending'),
    createdAt: timestamp("created_at").defaultNow(),
});
// Invoices table
export var invoices = pgTable("invoices", {
    id: serial("id").primaryKey(),
    invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
    jobSheetId: integer("job_sheet_id").notNull().references(function () { return jobSheets.id; }),
    invoiceType: varchar("invoice_type", { length: 20 }).notNull(),
    serviceCharge: numeric("service_charge", { precision: 10, scale: 2 }).notNull(),
    discount: numeric("discount", { precision: 10, scale: 2 }).default('0'),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
    gstRate: numeric("gst_rate", { precision: 5, scale: 2 }).default('18'),
    gstAmount: numeric("gst_amount", { precision: 10, scale: 2 }).default('0'),
    totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
    paymentMethod: varchar("payment_method", { length: 50 }).default('cash'),
    modelNumber: varchar("model_number", { length: 100 }),
    serialNumber: varchar("serial_number", { length: 100 }),
    brand: varchar("brand", { length: 100 }),
    gstin: varchar("gstin", { length: 20 }),
    workDone: text("work_done"),
    remarks: text("remarks"),
    invoiceDate: timestamp("invoice_date").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
});
// Invoice Parts table for tracking parts used
export var invoiceParts = pgTable("invoice_parts", {
    id: serial("id").primaryKey(),
    invoiceId: integer("invoice_id").notNull().references(function () { return invoices.id; }),
    partName: varchar("part_name", { length: 255 }).notNull(),
    quantity: integer("quantity").notNull(),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
});
// D-Invoices table - identical structure to invoices
export var dInvoices = pgTable("d_invoices", {
    id: serial("id").primaryKey(),
    invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
    jobSheetId: integer("job_sheet_id").notNull().references(function () { return jobSheets.id; }),
    invoiceType: varchar("invoice_type", { length: 20 }).notNull(),
    serviceCharge: numeric("service_charge", { precision: 10, scale: 2 }).notNull(),
    discount: numeric("discount", { precision: 10, scale: 2 }).default('0'),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
    gstRate: numeric("gst_rate", { precision: 5, scale: 2 }).default('18'),
    gstAmount: numeric("gst_amount", { precision: 10, scale: 2 }).default('0'),
    totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
    paymentMethod: varchar("payment_method", { length: 50 }).default('cash'),
    modelNumber: varchar("model_number", { length: 100 }),
    serialNumber: varchar("serial_number", { length: 100 }),
    brand: varchar("brand", { length: 100 }),
    gstin: varchar("gstin", { length: 20 }),
    workDone: text("work_done"),
    remarks: text("remarks"),
    invoiceDate: timestamp("invoice_date").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
});
// D-Invoice Parts table for tracking parts used in D-Invoices
export var dInvoiceParts = pgTable("d_invoice_parts", {
    id: serial("id").primaryKey(),
    invoiceId: integer("invoice_id").notNull().references(function () { return dInvoices.id; }),
    partName: varchar("part_name", { length: 255 }).notNull(),
    quantity: integer("quantity").notNull(),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
});
// Quotations table
export var quotations = pgTable("quotations", {
    id: serial("id").primaryKey(),
    quotationNumber: varchar("quotation_number", { length: 50 }).notNull().unique(),
    jobSheetId: integer("job_sheet_id").references(function () { return jobSheets.id; }),
    customerId: integer("customer_id").references(function () { return customers.id; }),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
    customerAddress: text("customer_address").notNull(),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 100 }),
    pinCode: varchar("pin_code", { length: 10 }),
    productType: varchar("product_type", { length: 100 }),
    brand: varchar("brand", { length: 100 }),
    model: varchar("model", { length: 100 }),
    modelNumber: varchar("model_number", { length: 100 }),
    serialNumber: varchar("serial_number", { length: 100 }),
    serviceCharge: numeric("service_charge", { precision: 10, scale: 2 }).default('0'),
    totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
    paymentTerms: varchar("payment_terms", { length: 100 }).default('CASH'),
    validityDays: integer("validity_days").default(10),
    status: varchar("status", { length: 20 }).default('pending'), // pending, accepted, rejected, expired, converted
    remarks: text("remarks"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
// Quotation parts table
export var quotationParts = pgTable("quotation_parts", {
    id: serial("id").primaryKey(),
    quotationId: integer("quotation_id").references(function () { return quotations.id; }),
    name: varchar("name", { length: 255 }).notNull(),
    quantity: integer("quantity").notNull(),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
});
// Relations
export var customersRelations = relations(customers, function (_a) {
    var many = _a.many;
    return ({
        jobSheets: many(jobSheets),
    });
});
export var techniciansRelations = relations(technicians, function (_a) {
    var many = _a.many;
    return ({
        jobSheets: many(jobSheets),
    });
});
export var usersRelations = relations(users, function (_a) {
    var many = _a.many;
    return ({
        jobSheets: many(jobSheets),
    });
});
export var productTypesRelations = relations(productTypes, function (_a) {
    var many = _a.many;
    return ({
        jobSheets: many(jobSheets),
    });
});
export var brandsRelations = relations(brands, function (_a) {
    var many = _a.many;
    return ({
        models: many(models),
        jobSheets: many(jobSheets),
    });
});
export var modelsRelations = relations(models, function (_a) {
    var one = _a.one, many = _a.many;
    return ({
        brand: one(brands, {
            fields: [models.brandId],
            references: [brands.id],
        }),
        jobSheets: many(jobSheets),
    });
});
export var jobSheetsRelations = relations(jobSheets, function (_a) {
    var one = _a.one, many = _a.many;
    return ({
        customer: one(customers, {
            fields: [jobSheets.customerId],
            references: [customers.id],
        }),
        productType: one(productTypes, {
            fields: [jobSheets.productTypeId],
            references: [productTypes.id],
        }),
        brand: one(brands, {
            fields: [jobSheets.brandId],
            references: [brands.id],
        }),
        model: one(models, {
            fields: [jobSheets.modelId],
            references: [models.id],
        }),
        technician: one(technicians, {
            fields: [jobSheets.technicianId],
            references: [technicians.id],
        }),
        agent: one(users, {
            fields: [jobSheets.agentId],
            references: [users.id],
        }),
        payments: many(payments),
        invoices: many(invoices),
        dInvoices: many(dInvoices),
    });
});
export var paymentsRelations = relations(payments, function (_a) {
    var one = _a.one;
    return ({
        jobSheet: one(jobSheets, {
            fields: [payments.jobSheetId],
            references: [jobSheets.id],
        }),
    });
});
export var invoicesRelations = relations(invoices, function (_a) {
    var one = _a.one, many = _a.many;
    return ({
        jobSheet: one(jobSheets, {
            fields: [invoices.jobSheetId],
            references: [jobSheets.id],
        }),
        invoiceParts: many(invoiceParts),
    });
});
export var invoicePartsRelations = relations(invoiceParts, function (_a) {
    var one = _a.one;
    return ({
        invoice: one(invoices, {
            fields: [invoiceParts.invoiceId],
            references: [invoices.id],
        }),
    });
});
export var dInvoicesRelations = relations(dInvoices, function (_a) {
    var one = _a.one, many = _a.many;
    return ({
        jobSheet: one(jobSheets, {
            fields: [dInvoices.jobSheetId],
            references: [jobSheets.id],
        }),
        dInvoiceParts: many(dInvoiceParts),
    });
});
export var dInvoicePartsRelations = relations(dInvoiceParts, function (_a) {
    var one = _a.one;
    return ({
        dInvoice: one(dInvoices, {
            fields: [dInvoiceParts.invoiceId],
            references: [dInvoices.id],
        }),
    });
});
export var quotationsRelations = relations(quotations, function (_a) {
    var one = _a.one, many = _a.many;
    return ({
        jobSheet: one(jobSheets, {
            fields: [quotations.jobSheetId],
            references: [jobSheets.id],
        }),
        customer: one(customers, {
            fields: [quotations.customerId],
            references: [customers.id],
        }),
        quotationParts: many(quotationParts),
    });
});
export var quotationPartsRelations = relations(quotationParts, function (_a) {
    var one = _a.one;
    return ({
        quotation: one(quotations, {
            fields: [quotationParts.quotationId],
            references: [quotations.id],
        }),
    });
});
// Insert schemas
export var insertUserSchema = createInsertSchema(users).omit({ id: true });
export var insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export var insertTechnicianSchema = createInsertSchema(technicians).omit({ id: true, createdAt: true });
export var insertProductTypeSchema = createInsertSchema(productTypes).omit({ id: true });
export var insertBrandSchema = createInsertSchema(brands).omit({ id: true });
export var insertModelSchema = createInsertSchema(models).omit({ id: true });
export var insertJobSheetSchema = createInsertSchema(jobSheets).omit({ id: true, createdAt: true, updatedAt: true });
export var insertInventorySchema = createInsertSchema(inventory).omit({ id: true, createdAt: true });
export var insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export var insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true, invoiceNumber: true });
export var insertInvoicePartSchema = createInsertSchema(invoiceParts).omit({ id: true });
export var insertDInvoiceSchema = createInsertSchema(dInvoices).omit({ id: true, createdAt: true, invoiceNumber: true });
export var insertDInvoicePartSchema = createInsertSchema(dInvoiceParts).omit({ id: true });
export var insertQuotationSchema = createInsertSchema(quotations).omit({ id: true, createdAt: true, updatedAt: true, quotationNumber: true }).extend({
    serviceCharge: z.number().min(0),
    totalAmount: z.number().min(0),
    validityDays: z.number().min(1),
});
export var insertQuotationPartSchema = createInsertSchema(quotationParts).omit({ id: true });
