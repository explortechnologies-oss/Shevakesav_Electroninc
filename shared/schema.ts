import { mysqlTable, varchar, text, int, serial, date, datetime, decimal, double, tinyint } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default('admin'),
});

// Customers table
export const customers = mysqlTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  alternatePhone: varchar("alternate_phone", { length: 20 }),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  pinCode: varchar("pin_code", { length: 10 }),
  createdAt: datetime("created_at").default('CURRENT_TIMESTAMP'),
});

// Technicians table
export const technicians = mysqlTable("technicians", {
  id: serial("id").primaryKey(),
  employeeId: varchar("employee_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default('technician'),
  joiningDate: date("joining_date").notNull(),
  baseSalary: decimal("base_salary", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 20 }).default('active'),
  createdAt: datetime("created_at").default('CURRENT_TIMESTAMP'),
});

// Product categories and models
export const productTypes = mysqlTable("product_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
});

export const brands = mysqlTable("brands", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
});

export const models = mysqlTable("models", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  brandId: int("brand_id").references(() => brands.id),
});

// Job sheets table
export const jobSheets = mysqlTable("job_sheets", {
  id: serial("id").primaryKey(),
  jobId: varchar("job_id", { length: 50 }).notNull().unique(),
  customerId: int("customer_id").references(() => customers.id),
  productTypeId: int("product_type_id").references(() => productTypes.id),
  brandId: int("brand_id").references(() => brands.id),
  modelId: int("model_id").references(() => models.id),
  productType: varchar("product_type", { length: 100 }),
  brand: varchar("brand", { length: 100 }),
  model: varchar("model", { length: 100 }),
  modelNumber: varchar("model_number", { length: 100 }),
  serialNumber: varchar("serial_number", { length: 100 }),
  purchaseDate: date("purchase_date"),
  warrantyStatus: varchar("warranty_status", { length: 20 }).default('out_warranty'),
  jobType: varchar("job_type", { length: 20 }).notNull(),
  jobClassification: varchar("job_classification", { length: 30 }).notNull(),
  jobMode: varchar("job_mode", { length: 20 }).default('indoor'),
  technicianId: int("technician_id").references(() => technicians.id),
  agentId: int("agent_id").references(() => users.id),
  customerComplaint: text("customer_complaint").notNull(),
  reportedIssue: text("reported_issue"),
  agentRemarks: text("agent_remarks"),
  accessoriesReceived: text("accessories_received"),
  jobStartDateTime: datetime("job_start_date_time"),
  status: varchar("status", { length: 20 }).default('pending'),
  createdAt: datetime("created_at").default('CURRENT_TIMESTAMP'),
  updatedAt: datetime("updated_at").default('CURRENT_TIMESTAMP'),
});

// Inventory table
export const inventory = mysqlTable("inventory", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  quantity: int("quantity").notNull().default(0),
  minQuantity: int("min_quantity").notNull().default(5),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  createdAt: datetime("created_at").default('CURRENT_TIMESTAMP'),
});

// Payments table
export const payments = mysqlTable("payments", {
  id: serial("id").primaryKey(),
  jobSheetId: int("job_sheet_id").references(() => jobSheets.id),
  clientAmount: decimal("client_amount", { precision: 10, scale: 2 }).notNull(),
  internalAmount: decimal("internal_amount", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default('0'),
  advancePaid: decimal("advance_paid", { precision: 10, scale: 2 }).default('0'),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull(),
  paymentMode: varchar("payment_mode", { length: 50 }),
  status: varchar("status", { length: 20 }).default('pending'),
  createdAt: datetime("created_at").default('CURRENT_TIMESTAMP'),
});

// Invoices table
export const invoices = mysqlTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  // Make jobSheetId nullable so invoices can be created without a Job Sheet
  jobSheetId: int("job_sheet_id").references(() => jobSheets.id),
  invoiceType: varchar("invoice_type", { length: 20 }).notNull(),
  serviceCharge: decimal("service_charge", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default('0'),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  gstRate: decimal("gst_rate", { precision: 5, scale: 2 }).default('18'),
  gstAmount: decimal("gst_amount", { precision: 10, scale: 2 }).default('0'),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).default('cash'),
  modelNumber: varchar("model_number", { length: 100 }),
  serialNumber: varchar("serial_number", { length: 100 }),
  brand: varchar("brand", { length: 100 }),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }).notNull(),
  customerAddress: text("customer_address").notNull(),
  totalBeforeTax: decimal("total_before_tax", { precision: 12, scale: 2 }).notNull(),
  productType: varchar("product_type", { length: 100 }).notNull(),
  gstin: varchar("gstin", { length: 20 }),
  workDone: text("work_done"),
  remarks: text("remarks"),
  invoiceDate: datetime("invoice_date").default('CURRENT_TIMESTAMP'),
  createdAt: datetime("created_at").default('CURRENT_TIMESTAMP'),
});

// Invoice Parts table
export const invoiceParts = mysqlTable("invoice_parts", {
  id: serial("id").primaryKey(),
  invoiceId: int("invoice_id").notNull().references(() => invoices.id),
  partName: varchar("part_name", { length: 255 }).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
});

// D-Invoices table
export const dInvoices = mysqlTable("d_invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  jobSheetId: int("job_sheet_id").notNull().references(() => jobSheets.id),
  invoiceType: varchar("invoice_type", { length: 20 }).notNull(),
  serviceCharge: decimal("service_charge", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default('0'),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  gstRate: decimal("gst_rate", { precision: 5, scale: 2 }).default('18'),
  gstAmount: decimal("gst_amount", { precision: 10, scale: 2 }).default('0'),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).default('cash'),
  modelNumber: varchar("model_number", { length: 100 }),
  serialNumber: varchar("serial_number", { length: 100 }),
  brand: varchar("brand", { length: 100 }),
  gstin: varchar("gstin", { length: 20 }),
  workDone: text("work_done"),
  remarks: text("remarks"),
  invoiceDate: datetime("invoice_date").default('CURRENT_TIMESTAMP'),
  createdAt: datetime("created_at").default('CURRENT_TIMESTAMP'),
});

// D-Invoice Parts table
export const dInvoiceParts = mysqlTable("d_invoice_parts", {
  id: serial("id").primaryKey(),
  invoiceId: int("invoice_id").notNull().references(() => dInvoices.id),
  partName: varchar("part_name", { length: 255 }).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
});

// Quotations table
export const quotations = mysqlTable("quotations", {
  id: serial("id").primaryKey(),
  quotationNumber: varchar("quotation_number", { length: 50 }).notNull().unique(),
  jobSheetId: int("job_sheet_id").references(() => jobSheets.id),
  customerId: int("customer_id").references(() => customers.id),
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
  serviceCharge: decimal("service_charge", { precision: 10, scale: 2 }).default('0'),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentTerms: varchar("payment_terms", { length: 100 }).default('CASH'),
  validityDays: int("validity_days").default(10),
  status: varchar("status", { length: 20 }).default('pending'),
  remarks: text("remarks"),
  createdAt: datetime("created_at").default('CURRENT_TIMESTAMP'),
  updatedAt: datetime("updated_at").default('CURRENT_TIMESTAMP'),
});

// Quotation parts table
export const quotationParts = mysqlTable("quotation_parts", {
  id: serial("id").primaryKey(),
  quotationId: int("quotation_id").references(() => quotations.id),
  partName: varchar("part_name", { length: 255 }),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
});

// Relations (unchanged, just update table references if needed)
export const customersRelations = relations(customers, ({ many }) => ({
  jobSheets: many(jobSheets),
}));

export const techniciansRelations = relations(technicians, ({ many }) => ({
  jobSheets: many(jobSheets),
}));

export const usersRelations = relations(users, ({ many }) => ({
  jobSheets: many(jobSheets),
}));

export const productTypesRelations = relations(productTypes, ({ many }) => ({
  jobSheets: many(jobSheets),
}));

export const brandsRelations = relations(brands, ({ many }) => ({
  models: many(models),
  jobSheets: many(jobSheets),
}));

export const modelsRelations = relations(models, ({ one, many }) => ({
  brand: one(brands, {
    fields: [models.brandId],
    references: [brands.id],
  }),
  jobSheets: many(jobSheets),
}));

export const jobSheetsRelations = relations(jobSheets, ({ one, many }) => ({
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
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  jobSheet: one(jobSheets, {
    fields: [payments.jobSheetId],
    references: [jobSheets.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  jobSheet: one(jobSheets, {
    fields: [invoices.jobSheetId],
    references: [jobSheets.id],
  }),
  invoiceParts: many(invoiceParts),
}));

export const invoicePartsRelations = relations(invoiceParts, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceParts.invoiceId],
    references: [invoices.id],
  }),
}));

export const dInvoicesRelations = relations(dInvoices, ({ one, many }) => ({
  jobSheet: one(jobSheets, {
    fields: [dInvoices.jobSheetId],
    references: [jobSheets.id],
  }),
  dInvoiceParts: many(dInvoiceParts),
}));

export const dInvoicePartsRelations = relations(dInvoiceParts, ({ one }) => ({
  dInvoice: one(dInvoices, {
    fields: [dInvoiceParts.invoiceId],
    references: [dInvoices.id],
  }),
}));

export const quotationsRelations = relations(quotations, ({ one, many }) => ({
  jobSheet: one(jobSheets, {
    fields: [quotations.jobSheetId],
    references: [jobSheets.id],
  }),
  customer: one(customers, {
    fields: [quotations.customerId],
    references: [customers.id],
  }),
  quotationParts: many(quotationParts),
}));

export const quotationPartsRelations = relations(quotationParts, ({ one }) => ({
  quotation: one(quotations, {
    fields: [quotationParts.quotationId],
    references: [quotations.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export const insertTechnicianSchema = createInsertSchema(technicians)
  .omit({ id: true, createdAt: true })
  .extend({
    joiningDate: z.string().min(1), // Accepts 'YYYY-MM-DD' string
  });
export const insertProductTypeSchema = createInsertSchema(productTypes).omit({ id: true });
export const insertBrandSchema = createInsertSchema(brands).omit({ id: true });
export const insertModelSchema = createInsertSchema(models).omit({ id: true });
export const insertJobSheetSchema = createInsertSchema(jobSheets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true, createdAt: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true, invoiceNumber: true });
export const insertInvoicePartSchema = createInsertSchema(invoiceParts).omit({ id: true });
export const insertDInvoiceSchema = createInsertSchema(dInvoices).omit({ id: true, createdAt: true, invoiceNumber: true });
export const insertDInvoicePartSchema = createInsertSchema(dInvoiceParts).omit({ id: true });
export const insertQuotationSchema = createInsertSchema(quotations).omit({ id: true, createdAt: true, updatedAt: true, quotationNumber: true }).extend({
  serviceCharge: z.number().min(0),
  totalAmount: z.number().min(0),
  validityDays: z.number().min(1),
});
export const insertQuotationPartSchema = createInsertSchema(quotationParts).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Technician = typeof technicians.$inferSelect;
export type InsertTechnician = z.infer<typeof insertTechnicianSchema>;
export type ProductType = typeof productTypes.$inferSelect;
export type InsertProductType = z.infer<typeof insertProductTypeSchema>;
export type Brand = typeof brands.$inferSelect;
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type Model = typeof models.$inferSelect;
export type InsertModel = z.infer<typeof insertModelSchema>;
export type JobSheet = typeof jobSheets.$inferSelect;
export type InsertJobSheet = z.infer<typeof insertJobSheetSchema>;
export type InventoryItem = typeof inventory.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventorySchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InvoicePart = typeof invoiceParts.$inferSelect;
export type InsertInvoicePart = z.infer<typeof insertInvoicePartSchema>;
export type DInvoice = typeof dInvoices.$inferSelect;
export type InsertDInvoice = z.infer<typeof insertDInvoiceSchema>;
export type DInvoicePart = typeof dInvoiceParts.$inferSelect;
export type InsertDInvoicePart = z.infer<typeof insertDInvoicePartSchema>;
export type Quotation = typeof quotations.$inferSelect;
export type InsertQuotation = z.infer<typeof insertQuotationSchema>;
export type QuotationPart = typeof quotationParts.$inferSelect;
export type InsertQuotationPart = z.infer<typeof insertQuotationPartSchema>;