-- MySQL Database Setup for SHIVAKESHAVA ELECTRONICS Service Management System
-- Run this script to create the database and tables for local development

CREATE DATABASE IF NOT EXISTS shivakesav_electronics;
USE shivakesav_electronics;

-- Baseline schema aligned with shared/schema.ts
-- Creates database and tables used by the app

-- Users (app expects: username, password, name, role)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin'
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  alternate_phone VARCHAR(20),
  address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(100),
  pin_code VARCHAR(10),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Technicians
CREATE TABLE IF NOT EXISTS technicians (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'technician',
  joining_date DATE NOT NULL,
  base_salary DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Product Types
CREATE TABLE IF NOT EXISTS product_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL
);

-- Brands
CREATE TABLE IF NOT EXISTS brands (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(255) NOT NULL
);

-- Models
CREATE TABLE IF NOT EXISTS models (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  brand_id INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_models_brand FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE,
  UNIQUE KEY unique_model_brand (name, brand_id)
);

-- Job Sheets
CREATE TABLE IF NOT EXISTS job_sheets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id VARCHAR(50) NOT NULL UNIQUE,
  customer_id INT,
  product_type_id INT,
  brand_id INT,
  model_id INT,
  product_type VARCHAR(100),
  brand VARCHAR(100),
  model VARCHAR(100),
  model_number VARCHAR(100),
  serial_number VARCHAR(100),
  purchase_date DATE,
  warranty_status VARCHAR(20) DEFAULT 'out_warranty',
  job_type VARCHAR(20) NOT NULL,
  job_classification VARCHAR(30) NOT NULL,
  job_mode VARCHAR(20) DEFAULT 'indoor',
  technician_id INT,
  agent_id INT,
  customer_complaint TEXT NOT NULL,
  reported_issue TEXT,
  agent_remarks TEXT,
  accessories_received TEXT,
  job_start_date_time DATETIME,
  status VARCHAR(20) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_jobs_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
  CONSTRAINT fk_jobs_product_type FOREIGN KEY (product_type_id) REFERENCES product_types(id),
  CONSTRAINT fk_jobs_brand FOREIGN KEY (brand_id) REFERENCES brands(id),
  CONSTRAINT fk_jobs_model FOREIGN KEY (model_id) REFERENCES models(id),
  CONSTRAINT fk_jobs_technician FOREIGN KEY (technician_id) REFERENCES technicians(id),
  CONSTRAINT fk_jobs_agent FOREIGN KEY (agent_id) REFERENCES users(id)
);

-- Inventory (app expects name, category, min_quantity, unit_price)
CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  min_quantity INT NOT NULL DEFAULT 5,
  unit_price DECIMAL(10,2),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Invoices (app uses many totals and meta fields)
CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  job_sheet_id INT,
  invoice_type VARCHAR(20) NOT NULL,
  service_charge DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT '0',
  subtotal DECIMAL(10,2) NOT NULL,
  gst_rate DECIMAL(5,2) DEFAULT '18',
  gst_amount DECIMAL(10,2) DEFAULT '0',
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'cash',
  model_number VARCHAR(100),
  serial_number VARCHAR(100),
  brand VARCHAR(100),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_address TEXT NOT NULL,
  total_before_tax DECIMAL(12,2) NOT NULL,
  product_type VARCHAR(100) NOT NULL,
  gstin VARCHAR(20),
  work_done TEXT,
  remarks TEXT,
  invoice_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoices_job FOREIGN KEY (job_sheet_id) REFERENCES job_sheets(id) ON DELETE SET NULL
);

-- Invoice Parts
CREATE TABLE IF NOT EXISTS invoice_parts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  part_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_invoice_parts_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- D-Invoices
CREATE TABLE IF NOT EXISTS d_invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  job_sheet_id INT NOT NULL,
  invoice_type VARCHAR(20) NOT NULL,
  service_charge DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT '0',
  subtotal DECIMAL(10,2) NOT NULL,
  gst_rate DECIMAL(5,2) DEFAULT '18',
  gst_amount DECIMAL(10,2) DEFAULT '0',
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'cash',
  model_number VARCHAR(100),
  serial_number VARCHAR(100),
  brand VARCHAR(100),
  gstin VARCHAR(20),
  work_done TEXT,
  remarks TEXT,
  invoice_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_dinvoices_job FOREIGN KEY (job_sheet_id) REFERENCES job_sheets(id)
);

-- D-Invoice Parts
CREATE TABLE IF NOT EXISTS d_invoice_parts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NOT NULL,
  part_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_dinvoice_parts_invoice FOREIGN KEY (invoice_id) REFERENCES d_invoices(id) ON DELETE CASCADE
);

-- Quotations
CREATE TABLE IF NOT EXISTS quotations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quotation_number VARCHAR(50) NOT NULL UNIQUE,
  job_sheet_id INT,
  customer_id INT,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(100),
  pin_code VARCHAR(10),
  product_type VARCHAR(100),
  brand VARCHAR(100),
  model VARCHAR(100),
  model_number VARCHAR(100),
  serial_number VARCHAR(100),
  service_charge DECIMAL(10,2) DEFAULT '0',
  total_amount DECIMAL(10,2) NOT NULL,
  payment_terms VARCHAR(100) DEFAULT 'CASH',
  validity_days INT DEFAULT 10,
  status VARCHAR(20) DEFAULT 'pending',
  remarks TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_quotes_job FOREIGN KEY (job_sheet_id) REFERENCES job_sheets(id) ON DELETE SET NULL,
  CONSTRAINT fk_quotes_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Quotation Parts
CREATE TABLE IF NOT EXISTS quotation_parts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quotation_id INT,
  part_name VARCHAR(255),
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  rate DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_qparts_quote FOREIGN KEY (quotation_id) REFERENCES quotations(id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_sheet_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('cash', 'card', 'upi', 'bank_transfer') DEFAULT 'cash',
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_sheet_id) REFERENCES job_sheets(id) ON DELETE CASCADE
);

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO users (username, password, name, role) VALUES 
('admin', 'admin123', 'Admin User', 'admin');

-- Insert sample technicians
INSERT IGNORE INTO technicians (employee_id, name, phone, role, joining_date, base_salary, status) VALUES 
('TECH001', 'Ravi Kumar', '9876543210', 'technician', '2020-01-01', 20000.00, 'active'),
('TECH002', 'Suresh Reddy', '9876543211', 'technician', '2020-01-01', 20000.00, 'active'),
('TECH003', 'Mahesh Singh', '9876543212', 'technician', '2020-01-01', 20000.00, 'active');

-- Insert sample product types
INSERT IGNORE INTO product_types (name, display_name) VALUES 
('television', 'Television'),
('washing_machine', 'Washing Machine'),
('refrigerator', 'Refrigerator'),
('ac', 'Air Conditioner'),
('microwave', 'Microwave Oven');

-- Insert sample brands
INSERT IGNORE INTO brands (name, display_name) VALUES 
('lg', 'LG'),
('samsung', 'Samsung'),
('panasonic', 'Panasonic'),
('sony', 'Sony'),
('whirlpool', 'Whirlpool');

COMMIT;