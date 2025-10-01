-- Migration 0001: align live DB toward shared/schema.ts without data loss
-- Strategy: add missing columns, adjust types where safe, add FKs and indexes.
-- We avoid dropping/renaming destructive changes. Old columns remain; app will use the new ones.

USE shivakesav_electronics;

-- USERS: add required columns used by app
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS `password` TEXT NULL AFTER `username`,
  ADD COLUMN IF NOT EXISTS `name` VARCHAR(255) NULL AFTER `password`,
  ADD COLUMN IF NOT EXISTS `role` VARCHAR(50) NOT NULL DEFAULT 'admin' AFTER `name`;

-- Backfill name/password if possible (copy password_hash into password)
UPDATE users SET `password` = COALESCE(`password`, `password_hash`) WHERE `password` IS NULL AND EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='users' AND COLUMN_NAME='password_hash');
UPDATE users SET `name` = COALESCE(`name`, `username`) WHERE `name` IS NULL OR `name`='';

-- CUSTOMERS: ensure created_at exists and is DATETIME
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP;

-- TECHNICIANS: add missing app fields if absent
ALTER TABLE technicians
  ADD COLUMN IF NOT EXISTS `role` VARCHAR(50) NOT NULL DEFAULT 'technician',
  ADD COLUMN IF NOT EXISTS `joining_date` DATE NULL,
  ADD COLUMN IF NOT EXISTS `base_salary` DECIMAL(10,2) NULL,
  ADD COLUMN IF NOT EXISTS `status` VARCHAR(20) NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP;

-- PRODUCT TYPES/BRANDS: uniqueness handled in schema; add constraints if missing
ALTER TABLE product_types
  ADD UNIQUE KEY `uq_product_types_name` (`name`);
ALTER TABLE brands
  ADD UNIQUE KEY `uq_brands_name` (`name`);

-- MODELS: ensure FK + unique (name, brand_id)
ALTER TABLE models
  ADD COLUMN IF NOT EXISTS `brand_id` INT NULL,
  ADD COLUMN IF NOT EXISTS `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  ADD CONSTRAINT `fk_models_brand` FOREIGN KEY (`brand_id`) REFERENCES brands(`id`) ON DELETE CASCADE,
  ADD UNIQUE KEY `unique_model_brand` (`name`, `brand_id`);

-- JOB_SHEETS: add id references and varchar types expected by app
ALTER TABLE job_sheets
  ADD COLUMN IF NOT EXISTS `product_type_id` INT NULL,
  ADD COLUMN IF NOT EXISTS `brand_id` INT NULL,
  ADD COLUMN IF NOT EXISTS `model_id` INT NULL,
  ADD COLUMN IF NOT EXISTS `agent_id` INT NULL,
  MODIFY COLUMN `product_type` VARCHAR(100) NULL,
  MODIFY COLUMN `brand` VARCHAR(100) NULL,
  MODIFY COLUMN `model` VARCHAR(100) NULL,
  MODIFY COLUMN `model_number` VARCHAR(100) NULL,
  MODIFY COLUMN `serial_number` VARCHAR(100) NULL,
  MODIFY COLUMN `warranty_status` VARCHAR(20) NULL DEFAULT 'out_warranty',
  MODIFY COLUMN `job_type` VARCHAR(20) NULL,
  MODIFY COLUMN `job_classification` VARCHAR(30) NULL,
  MODIFY COLUMN `job_mode` VARCHAR(20) NULL DEFAULT 'indoor',
  ADD COLUMN IF NOT EXISTS `customer_complaint` TEXT NULL,
  ADD COLUMN IF NOT EXISTS `reported_issue` TEXT NULL,
  ADD COLUMN IF NOT EXISTS `agent_remarks` TEXT NULL,
  ADD COLUMN IF NOT EXISTS `accessories_received` TEXT NULL,
  ADD COLUMN IF NOT EXISTS `job_start_date_time` DATETIME NULL,
  ADD COLUMN IF NOT EXISTS `status` VARCHAR(20) NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  ADD CONSTRAINT `fk_jobs_customer` FOREIGN KEY (`customer_id`) REFERENCES customers(`id`),
  ADD CONSTRAINT `fk_jobs_product_type` FOREIGN KEY (`product_type_id`) REFERENCES product_types(`id`),
  ADD CONSTRAINT `fk_jobs_brand` FOREIGN KEY (`brand_id`) REFERENCES brands(`id`),
  ADD CONSTRAINT `fk_jobs_model` FOREIGN KEY (`model_id`) REFERENCES models(`id`),
  ADD CONSTRAINT `fk_jobs_agent` FOREIGN KEY (`agent_id`) REFERENCES users(`id`);

-- INVENTORY: add app columns; keep old part_* columns for compatibility
ALTER TABLE inventory
  ADD COLUMN IF NOT EXISTS `name` VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS `category` VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS `min_quantity` INT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS `unit_price` DECIMAL(10,2) NULL,
  ADD COLUMN IF NOT EXISTS `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill inventory.name from part_name if present
UPDATE inventory SET `name` = COALESCE(`name`, `part_name`) WHERE `name` IS NULL AND EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='inventory' AND COLUMN_NAME='part_name');

-- INVOICES: add app columns, keep existing
ALTER TABLE invoices
  ADD COLUMN IF NOT EXISTS `invoice_type` VARCHAR(20) NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS `service_charge` DECIMAL(10,2) NULL,
  ADD COLUMN IF NOT EXISTS `discount` DECIMAL(10,2) NULL DEFAULT '0',
  ADD COLUMN IF NOT EXISTS `subtotal` DECIMAL(10,2) NULL,
  ADD COLUMN IF NOT EXISTS `gst_rate` DECIMAL(5,2) NULL DEFAULT '18',
  ADD COLUMN IF NOT EXISTS `gst_amount` DECIMAL(10,2) NULL DEFAULT '0',
  ADD COLUMN IF NOT EXISTS `total_amount` DECIMAL(10,2) NULL,
  MODIFY COLUMN `payment_method` VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS `model_number` VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS `serial_number` VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS `brand` VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS `total_before_tax` DECIMAL(12,2) NULL,
  ADD COLUMN IF NOT EXISTS `product_type` VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS `gstin` VARCHAR(20) NULL,
  ADD COLUMN IF NOT EXISTS `work_done` TEXT NULL,
  ADD COLUMN IF NOT EXISTS `remarks` TEXT NULL,
  ADD COLUMN IF NOT EXISTS `invoice_date` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  ADD CONSTRAINT `fk_invoices_job` FOREIGN KEY (`job_sheet_id`) REFERENCES job_sheets(`id`) ON DELETE SET NULL;

-- INVOICE PARTS: ensure needed columns
ALTER TABLE invoice_parts
  ADD COLUMN IF NOT EXISTS `unit_price` DECIMAL(10,2) NULL,
  ADD COLUMN IF NOT EXISTS `amount` DECIMAL(10,2) NULL,
  ADD CONSTRAINT `fk_invoice_parts_invoice` FOREIGN KEY (`invoice_id`) REFERENCES invoices(`id`) ON DELETE CASCADE;

-- D_INVOICES
ALTER TABLE d_invoices
  ADD COLUMN IF NOT EXISTS `invoice_type` VARCHAR(20) NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS `service_charge` DECIMAL(10,2) NULL,
  ADD COLUMN IF NOT EXISTS `discount` DECIMAL(10,2) NULL DEFAULT '0',
  ADD COLUMN IF NOT EXISTS `subtotal` DECIMAL(10,2) NULL,
  ADD COLUMN IF NOT EXISTS `gst_rate` DECIMAL(5,2) NULL DEFAULT '18',
  ADD COLUMN IF NOT EXISTS `gst_amount` DECIMAL(10,2) NULL DEFAULT '0',
  ADD COLUMN IF NOT EXISTS `total_amount` DECIMAL(10,2) NULL,
  ADD COLUMN IF NOT EXISTS `payment_method` VARCHAR(50) NULL DEFAULT 'cash',
  ADD COLUMN IF NOT EXISTS `model_number` VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS `serial_number` VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS `brand` VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS `gstin` VARCHAR(20) NULL,
  ADD COLUMN IF NOT EXISTS `work_done` TEXT NULL,
  ADD COLUMN IF NOT EXISTS `remarks` TEXT NULL,
  ADD COLUMN IF NOT EXISTS `invoice_date` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP;

-- D_INVOICE_PARTS: add standard columns; create invoice_id if only d_invoice_id exists
ALTER TABLE d_invoice_parts
  ADD COLUMN IF NOT EXISTS `invoice_id` INT NULL,
  ADD COLUMN IF NOT EXISTS `unit_price` DECIMAL(10,2) NULL,
  ADD COLUMN IF NOT EXISTS `amount` DECIMAL(10,2) NULL;

-- Backfill new invoice_id from legacy d_invoice_id if present
UPDATE d_invoice_parts SET `invoice_id` = COALESCE(`invoice_id`, `d_invoice_id`) WHERE `invoice_id` IS NULL AND EXISTS(SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='d_invoice_parts' AND COLUMN_NAME='d_invoice_id');

ALTER TABLE d_invoice_parts
  ADD CONSTRAINT `fk_dinvoice_parts_invoice` FOREIGN KEY (`invoice_id`) REFERENCES d_invoices(`id`) ON DELETE CASCADE;

-- QUOTATIONS: add/align columns
ALTER TABLE quotations
  ADD COLUMN IF NOT EXISTS `customer_id` INT NULL,
  ADD COLUMN IF NOT EXISTS `city` VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS `state` VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS `pin_code` VARCHAR(10) NULL,
  ADD COLUMN IF NOT EXISTS `product_type` VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS `brand` VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS `model` VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS `model_number` VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS `serial_number` VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS `service_charge` DECIMAL(10,2) NULL DEFAULT '0',
  ADD COLUMN IF NOT EXISTS `payment_terms` VARCHAR(100) NULL DEFAULT 'CASH',
  ADD COLUMN IF NOT EXISTS `validity_days` INT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS `status` VARCHAR(20) NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS `remarks` TEXT NULL,
  ADD COLUMN IF NOT EXISTS `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS `updated_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  ADD CONSTRAINT `fk_quotes_job` FOREIGN KEY (`job_sheet_id`) REFERENCES job_sheets(`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_quotes_customer` FOREIGN KEY (`customer_id`) REFERENCES customers(`id`);

-- QUOTATION_PARTS: add unit_price, amount, rate, FK
ALTER TABLE quotation_parts
  ADD COLUMN IF NOT EXISTS `part_name` VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS `unit_price` DECIMAL(10,2) NULL,
  ADD COLUMN IF NOT EXISTS `amount` DECIMAL(10,2) NULL,
  ADD COLUMN IF NOT EXISTS `rate` DECIMAL(10,2) NULL,
  ADD CONSTRAINT `fk_qparts_quote` FOREIGN KEY (`quotation_id`) REFERENCES quotations(`id`);

-- PAYMENTS: create new columns used by app; keep old
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS `client_amount` DECIMAL(10,2) NULL,
  ADD COLUMN IF NOT EXISTS `internal_amount` DECIMAL(10,2) NULL,
  ADD COLUMN IF NOT EXISTS `discount` DECIMAL(10,2) NULL DEFAULT '0',
  ADD COLUMN IF NOT EXISTS `advance_paid` DECIMAL(10,2) NULL DEFAULT '0',
  ADD COLUMN IF NOT EXISTS `balance` DECIMAL(10,2) NULL,
  ADD COLUMN IF NOT EXISTS `payment_mode` VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS `status` VARCHAR(20) NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS `created_at` DATETIME NULL DEFAULT CURRENT_TIMESTAMP;
