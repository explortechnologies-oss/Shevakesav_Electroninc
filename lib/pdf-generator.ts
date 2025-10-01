import { JobSheetFormData } from "@/types";

// Utility function to convert number to words
function numberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  if (num === 0) return 'Zero';
  
  function convertChunk(n: number): string {
    let result = '';
    
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    } else if (n >= 10) {
      result += teens[n - 10] + ' ';
      return result;
    }
    
    if (n > 0) {
      result += ones[n] + ' ';
    }
    
    return result;
  }

  const crores = Math.floor(num / 10000000);
  const lakhs = Math.floor((num % 10000000) / 100000);
  const thousands = Math.floor((num % 100000) / 1000);
  const remainder = num % 1000;

  let result = '';
  
  if (crores > 0) {
    result += convertChunk(crores) + 'Crore ';
  }
  
  if (lakhs > 0) {
    result += convertChunk(lakhs) + 'Lakh ';
  }
  
  if (thousands > 0) {
    result += convertChunk(thousands) + 'Thousand ';
  }
  
  if (remainder > 0) {
    result += convertChunk(remainder);
  }
  
  return result.trim() + ' Only';
}

interface PDFJobSheetData {
  jobId: string;
  customerName: string;
  customerPhone?: string;
  phone?: string;
  customerAddress?: string;
  address?: string;
  alternatePhone?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  productTypeName?: string;
  productType?: string;
  brandName?: string;
  brand?: string;
  modelName?: string;
  model?: string;
  modelNumber?: string;
  serialNumber?: string;
  warrantyStatus?: string;
  customerComplaint?: string;
  reportedIssue?: string;
  agentRemarks?: string;
  technicianName?: string;
  agentName?: string;
  accessoriesReceived?: string;
}

interface InvoiceData {
  invoiceNumber: string;
  jobId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerState?: string;
  productType: string;
  brand: string;
  model?: string;
  modelNumber?: string;
  serialNumber?: string;
  paymentMethod: string;
  gstin?: string;
  serviceCharge: number;
  parts: { name: string; quantity: number; rate: number; amount: number }[];
  discount: number;
  isGST: boolean;
  gstRate?: number;
  totalBeforeTax: number;
  taxAmount: number;
  totalAmount: number;
  technicianName?: string;
  workDone?: string;
  remarks?: string;
  invoiceDate?: string;
}

interface QuotationData {
  quotationNumber: string;
  jobId?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  city: string;
  state: string;
  pinCode: string;
  productType: string;
  brand: string;
  model?: string;
  modelNumber?: string;
  serialNumber?: string;
  serviceCharge: number;
  parts: { name: string; quantity: number; rate: number; amount: number }[];
  totalAmount: number;
  paymentTerms: string;
  validityDays: number;
  remarks?: string;
}

// Enhanced Job Sheet Acknowledgment PDF - Form Layout Style
export function generateJobSheetPDF(data: PDFJobSheetData) {
  const content = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Job Sheet Acknowledgment - ${data.jobId}</title>
        <style>
          @page {
            size: A4;
            margin: 16mm;
          }
          
          body { 
            font-family: Arial, sans-serif; 
            margin: 0;
            padding: 20px;
            font-size: 13px;
            line-height: 1.2;
          }
          
          .form-container {
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #000;
            padding: 16px;
          }
          
          .header-section {
            text-align: center;
            margin-bottom: 16px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          
          .company-name {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
            color: #000;
          }
          
          .form-title {
            font-size: 16px;
            font-weight: bold;
            margin-top: 8px;
            text-decoration: underline;
          }
          
          .form-row {
            display: flex;
            margin-bottom: 7px;
            gap: 10px;
          }
          
          .form-field {
            flex: 1;
            display: flex;
            align-items: center;
          }
          
          .field-label {
            font-weight: bold;
            background-color: transparent;
            margin-right: 6px;
            font-size: 12px;
            width: 121px;
            flex-shrink: 0;
            display: inline-block;
          }
          
          .field-value {
            flex: 1;
            font-style: normal;
            background-color: transparent;
            border-bottom: 1px solid #000;
            padding: 3px 5px;
            min-height: 14px;
            font-size: 10px;
          }
          
          .filled-value {
            font-weight: normal;
            color: #000;
          }
          
          @media print { 
            @page {
              size: A4;
              margin: 16mm;
            }
            body { 
              margin: 0;
              padding: 20px;
            }
            .form-container {
              border: 2px solid #000;
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="form-container">
          <div class="header-section">
            <div class="company-name">SHIVAKESAV ELECTRONICS</div>
            <div style="font-size: 9px; color: #4472C4; font-weight: bold; margin-bottom: 1px;">Panasonic & JBL Authorized Service Center</div>
            <div style="font-size: 9px; color: #000; margin-bottom: 1px; font-weight: bold;">
              D.No 29-14-62, 2nd Floor, Beside Andhra Hospital, Seshadri Sastri Street, Governorpet, Vijayawada – 2
            </div>
            <div style="font-size: 8px; color: #000; margin-bottom: 1px; font-weight: bold;">
              Ph: 9182193469, 9642365559 | Land: 08664534719 | Email: shivakesavelecronics@gmail.com
            </div>
            <div style="font-size: 8px; color: #666; font-weight: bold; margin-bottom: 2px;">
              GSTIN: 37BYOPS6182A1Z1
            </div>
            <div class="form-title" style="font-weight: bold;">ACKNOWLEDGMENT</div>
          </div>

          <!-- Row 1: Job Number and Date -->
          <div class="form-row">
            <div class="form-field">
              <div class="field-label">JOB NUMBER</div>
              <div class="field-value filled-value">${data.jobId}</div>
            </div>
            <div class="form-field">
              <div class="field-label">DATE</div>
              <div class="field-value">${new Date().toLocaleDateString('en-GB')}</div>
            </div>
          </div>

          <!-- Row 2: Customer Name and Job Ref No -->
          <div class="form-row">
            <div class="form-field">
              <div class="field-label">CUSTOMER NAME</div>
              <div class="field-value filled-value">${data.customerName}</div>
            </div>
            <div class="form-field">
              <div class="field-label">JOB REF. NO</div>
              <div class="field-value">Enter job ref</div>
            </div>
          </div>

          <!-- Row 3: Phone Number and Brand -->
          <div class="form-row">
            <div class="form-field">
              <div class="field-label">PHONE NUMBER</div>
              <div class="field-value filled-value" style="color: #000; font-weight: bold;">${data.customerPhone || data.phone || 'N/A'}</div>
            </div>
            <div class="form-field">
              <div class="field-label">BRAND</div>
              <div class="field-value filled-value">${data.brandName || data.brand || 'Enter brand'}</div>
            </div>
          </div>

          <!-- Row 4: Alternative Phone and Product -->
          <div class="form-row">
            <div class="form-field">
              <div class="field-label">ALTERNATIVE PHONE</div>
              <div class="field-value filled-value">${data.alternatePhone || 'N/A'}</div>
            </div>
            <div class="form-field">
              <div class="field-label">PRODUCT</div>
              <div class="field-value filled-value" style="background-color: white; font-weight: bold; color: #000; border: 1px solid #333;">${data.productTypeName || data.productType || 'Select product'}</div>
            </div>
          </div>

          <!-- Row 5: Address and Model -->
          <div class="form-row">
            <div class="form-field">
              <div class="field-label">ADDRESS</div>
              <div class="field-value filled-value" style="color: #000; font-weight: bold;">${data.customerAddress || data.address || 'Enter address'}</div>
            </div>
            <div class="form-field">
              <div class="field-label">MODEL</div>
              <div class="field-value filled-value">${data.modelName || data.model || data.modelNumber || 'Enter model'}</div>
            </div>
          </div>

          <!-- Row 6: City and Serial No -->
          <div class="form-row">
            <div class="form-field">
              <div class="field-label">CITY</div>
              <div class="field-value filled-value">${data.city || 'Enter city'}</div>
            </div>
            <div class="form-field">
              <div class="field-label">SERIAL NO</div>
              <div class="field-value filled-value">${data.serialNumber || 'Enter serial no'}</div>
            </div>
          </div>

          <!-- Row 7: State and Warranty Status -->
          <div class="form-row">
            <div class="form-field">
              <div class="field-label">STATE</div>
              <div class="field-value filled-value">${data.state || 'Enter state'}</div>
            </div>
            <div class="form-field">
              <div class="field-label">WARRANTY STATUS</div>
              <div class="field-value filled-value">${data.warrantyStatus === 'in_warranty' ? '✓ In Warranty' : '✓ Out of Warranty'}</div>
            </div>
          </div>

          <!-- Row 8: Pin Code and Accessories -->
          <div class="form-row">
            <div class="form-field">
              <div class="field-label">PIN CODE</div>
              <div class="field-value filled-value">${data.pinCode || 'Enter pin code'}</div>
            </div>
            <div class="form-field">
              <div class="field-label">ACCESSORIES RECEIVED</div>
              <div class="field-value filled-value">${data.accessoriesReceived || 'None listed'}</div>
            </div>
          </div>

          <!-- Customer Complaint Section -->
          <div style="margin-top: 8px; margin-bottom: 8px; border: 1px solid #000; padding: 6px;">
            <div style="background-color: transparent; color: #000; padding: 4px 6px; font-weight: bold; font-size: 10px; text-transform: uppercase; display: block; margin-bottom: 4px; width: 100%; text-align: left; height: 15px; line-height: 15px;">CUSTOMER COMPLAINT / REPORTED ISSUE</div>
            <div style="padding: 4px; height: 20px; background-color: transparent; overflow: hidden;">
              <div style="font-weight: normal; color: #000; font-size: 10px; line-height: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${data.customerComplaint}</div>
            </div>
          </div>

          <!-- Technician Information -->
          <div style="margin-top: 5px;">
            <div class="form-row">
              <div class="form-field">
                <div class="field-label">TECHNICIAN</div>
                <div class="field-value filled-value">${data.technicianName || 'To be assigned'}</div>
              </div>
            </div>
          </div>

          <!-- Terms and Conditions -->
          <div style="margin-top: 8px; border-top: 1px solid #ccc; padding-top: 6px; font-size: 12px;">
            <div style="font-weight: bold; margin-bottom: 4px; text-transform: uppercase; font-size: 13px;">TERMS & CONDITIONS:</div>
            <ol style="margin: 0; padding-left: 15px; line-height: 1.0;">
              <li style="margin-bottom: 0px;">The Contents of work order should be verified & a copy is given to customer as a receipt for the equipment.</li>
              <li style="margin-bottom: 0px;">This equipment has been accepted for service/repairs subject to internal verification. Should we find the equipment to have been tampered, misused, components removed, cracked the equipment will be returned without repairs and the same will be returned to customer.</li>
              <li style="margin-bottom: 0px;">This receipt should be produced at the time of collecting the equipment. No deliveries can be made if this receipt is lost. In the event of this receipt being lost, in order to obtain set, customer needs to submit request letter along with an indemnity bond to the Shivakesav Electronics.</li>
              <li style="margin-bottom: 0px;">For any enquiry regarding the status of the set, please quote the Job No. and the date in all cases.</li>
              <li style="margin-bottom: 0px;">Our estimate charges are only approximate based on initial inspection carried out. If during the process of repairs, additional spares are found necessary they will be charged extra. No fresh approval will be taken for such additional spare parts used.</li>
              <li style="margin-bottom: 0px;">Acceptance of the equipment and completion of the job are subject to availability of spares. If the equipment cannot be repaired due to non-availability of spares, the equipment will be returned to the customer after charging the inspection charges.</li>
              <li style="margin-bottom: 0px;">Our responsibility is limited to service of this equipment only. We are not responsible for consequential damages arising from delay in non-repairs of the equipment.</li>
              <li style="margin-bottom: 0px;">While every effort shall be made to take proper care of customer's equipment, the company assumes no responsibility for loss or damage due to theft, fire, flood on any other unforeseen circumstances beyond its control.</li>
              <li style="margin-bottom: 0px;">Accessories are accepted under owner's risk and the company is not responsible for the accessories not recorded in this receipt.</li>
              <li style="margin-bottom: 0px;">Company assumes no responsibility whatsoever if this equipment is not collected within 30 days from the intimation of it getting repaired vide this work order receipt.</li>
              <li style="margin-bottom: 0px;">Replaced parts will be returned only on special request in writing while depositing the product. However, this shall not apply to parts and cases in which discount is given or replaced during warranty period.</li>
              <li style="margin-bottom: 0px;">Standby unit, if given, is at the sole discretion of Shivakesav Electronics and it is obligatory on the customer to return back the unit as and when asked by the Shivakesav Electronics personnel at the time of delivery of customer's unit.</li>
            </ol>
          </div>

          <!-- Signature Section -->
          <div style="margin-top: 2px; display: flex; gap: 10px;">
            <div style="flex: 1; border: 1px solid #000; padding: 6px; min-height: 35px;">
              <div style="font-size: 8px; line-height: 1.1; margin-bottom: 6px;">
                I have reviewed the terms and conditions mentioned above and agree to abide by them.
              </div>
              <div style="text-align: center; margin-top: auto; padding-top: 6px;">
                <div style="font-weight: bold; font-size: 9px; text-transform: uppercase;">
                  CUSTOMER SIGNATURE
                </div>
              </div>
            </div>
            <div style="flex: 1; border: 1px solid #000; padding: 6px; min-height: 35px; position: relative;">
              <div style="text-align: right; font-size: 8px; margin-bottom: 6px;">
                for <strong>SHIVAKESAV ELECTRONICS</strong>
              </div>
              <div style="text-align: center; position: absolute; bottom: 6px; left: 0; right: 0;">
                <div style="font-weight: bold; font-size: 9px; text-transform: uppercase;">
                  AUTHORIZED SIGNATORY
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  printJobSheetPDF(content, `JobSheet_${data.jobId}`);
}

// GST Invoice Generator
export function generateGSTInvoice(data: InvoiceData) {
  const gstRate = data.gstRate || 18;
  // Calculate taxable amount from GST-inclusive total
  const gstInclusiveTotal = data.totalAmount;
  const taxableAmount = gstInclusiveTotal / (1 + gstRate / 100);
  const invDate = data.invoiceDate ? new Date(data.invoiceDate) : new Date();
  const content = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>GST Invoice - ${data.invoiceNumber}</title>
        <style>
          @page {
            size: A4;
            margin: 15mm;
          }
          
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            line-height: 1.2;
            font-size: 12px;
            color: #000;
          }
          
          .invoice-container {
            width: 100%;
            max-width: 190mm; /* Keep inside A4 printable area */
            margin: 0 auto;
            background: white;
            border: 2px solid #000;
            padding: 8px;
            box-sizing: border-box;
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
            padding-bottom: 6px;
            border-bottom: 3px solid #3366cc;
          }
          
          .company-section {
            flex: 1;
          }
          
          .company-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 3px;
            color: #000;
            text-shadow: 0 0 1px #000;
          }
          
          .authorization {
            font-size: 10px;
            font-weight: bold;
            color: #4472C4;
            margin-bottom: 2px;
          }
          
          .company-address {
            font-size: 10px;
            margin: 1px 0;
            line-height: 1.3;
          }
          
          .contact-info {
            font-size: 9px;
            margin: 1px 0;
            font-weight: bold;
            text-shadow: 0 0 0.5px #000;
          }
          
          .tax-invoice-section {
            text-align: right;
            flex-shrink: 0;
          }
          
          .tax-invoice-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
            text-decoration: underline;
          }
          
          .invoice-meta {
            font-size: 11px;
            margin-bottom: 6px;
            gap: 8px;
          }
          
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            gap: 20px;
          }
          
          .bill-to-section, .service-details-section {
            flex: 1;
            padding: 8px;
            border: 1px solid #000;
            background-color: #f8f9fa;
          }
          
          .section-header {
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 5px;
            text-decoration: underline;
            background-color: #f8f9fa;
          }
          
          .customer-info, .service-info {
            font-size: 10px;
            margin: 2px 0;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5px;
            font-size: 10px;
            table-layout: fixed;
          }

          /* Column width plan (SNo, Description, HSN, Tax%, Qty, Rate, Amount) */
.items-table th:nth-child(1),
.items-table td:nth-child(1) { width: 6%; }

.items-table th:nth-child(2),
.items-table td:nth-child(2) { width: 42%; } /* Wider description */

.items-table th:nth-child(3),
.items-table td:nth-child(3) { width: 12%; }

.items-table th:nth-child(4),
.items-table td:nth-child(4) { width: 8%; }

.items-table th:nth-child(5),
.items-table td:nth-child(5) { width: 8%; }

.items-table th:nth-child(6),
.items-table td:nth-child(6) { width: 12%; }

.items-table th:nth-child(7),
.items-table td:nth-child(7) { width: 12%; }

/* Right-align numeric cells (rate/amount already use class="number") */
.items-table td.number { text-align: right; }
          
          .items-table th {
            background-color: #e6f0ff;
            border: 1px solid #000; /* Keep full border on header */
            padding: 4px;
            text-align: center;
            font-weight: bold;
            font-size: 9px;
          }
          
          .items-table td {
            /* Remove horizontal lines; keep only vertical borders */
            border-left: 1px solid #000;
            border-right: 1px solid #000;
            border-top: none;
            border-bottom: none;
            padding: 3px;
            text-align: center;
            font-size: 9px;
          }
          
          .items-table tbody tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          .tax-table {
            border: 1px solid #000;
            padding: 2px;
            text-align: center;
            font-size: 6px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            border-top: 1px solid #000;
            padding-top: 5px;
          }
          
          .tax-table th {
            background-color: #e6f0ff;
            font-weight: bold;
            table-layout: fixed;
          }
          
          .tax-table td {
            word-wrap: break-word;
          }
          
          .footer-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          
          .amount-words {
            flex: 1;
            font-weight: bold;
          }
          
          .total-amount {
            text-align: right;
            font-size: 14px;
            font-weight: bold;
          }
          
          .signature-section {
            margin-top: 20px;
          }
          
          .terms-conditions {
            font-size: 8px;
            margin-top: 10px;
          }
          
          .footer-table {
            border-top: 1px solid #000;
            margin-top: 30px;
            padding-top: 5px;
          }
          
          @media print { 
            body { 
              margin: 0; 
            } 
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Header -->
          <div class="header">
            <div class="company-section">
              <div class="company-name">SHIVAKESAV ELECTRONICS</div>
              <div class="authorization">Panasonic & JBL Authorized Service Center</div>
              <div class="company-address">D.No 29-14-62, 2nd Floor, Beside Andhra Hospital,</div>
              <div class="company-address">Seshadri Sastri Street, Governorpet, Vijayawada – 2</div>
              <div class="contact-info"><strong>Ph: 9182193469, 9642365559 | Land: 08664534719</strong></div>
              <div class="contact-info"><strong>Email: shivakesavelecronics@gmail.com</strong></div>
              <div class="contact-info">GSTIN: 37BYOPS6182A1Z1</div>
              <div class="contact-info">PAN: BYOPS6182A</div>
            </div>
            <div class="tax-invoice-section">
              <div class="tax-invoice-title">TAX INVOICE</div>
              <div class="invoice-meta"><strong>Invoice No:</strong> ${data.invoiceNumber}</div>
              <div class="invoice-meta"><strong>Date:</strong> ${invDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}</div>
              <div class="invoice-meta"><strong>Job ID:</strong> ${data.jobId || 'N/A'}</div>
            </div>
          </div>

          <!-- Invoice Details -->
          <div class="invoice-details">
            <div class="bill-to-section">
              <div class="section-header">Bill To</div>
              <div class="customer-info"><strong>${data.customerName}</strong></div>
              <div class="customer-info"><strong>Phone:</strong> ${data.customerPhone || 'N/A'}</div>
              <div class="customer-info"><strong>Address:</strong> ${data.customerAddress || 'Vijayawada'}</div>
            </div>
            <div class="service-details-section">
              <div class="section-header">Service Details</div>
              <div class="service-info"><strong>Product:</strong> ${data.productType || 'N/A'} - ${data.brand || 'N/A'}</div>
              <div class="service-info"><strong>Model Number:</strong> ${data.modelNumber || 'N/A'}</div>
              <div class="service-info"><strong>Serial Number:</strong> ${data.serialNumber || 'N/A'}</div>
              <div class="service-info"><strong>Payment Method:</strong> ${data.paymentMethod === 'cash' ? 'Cash' : 'Online'}</div>
            </div>
          </div>

          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th>SNo</th>
                <th>Item Description</th>
                <th>HSN</th>
                <th>Tax%</th>
                <th>Qty.</th>
                <th>Rate(Rs.)</th>
                <th>Amount(Rs.)</th>
              </tr>
            </thead>
            <tbody>
              ${data.serviceCharge > 0 ? `
              <tr>
                <td>1</td>
                <td>SERVICE CHARGE${data.workDone ? ` - ${data.workDone}` : ''}</td>
                <td>998715</td>
                <td class="number">${gstRate}.00</td>
                <td class="number">1</td>
                <td class="number">${data.serviceCharge.toFixed(2)}</td>
                <td class="number">${data.serviceCharge.toFixed(2)}</td>
              </tr>` : ''}
              ${data.parts.map((part, index) => `
                <tr>
                  <td>${data.serviceCharge > 0 ? index + 2 : index + 1}</td>
                  <td>${part.name}</td>
                  <td>853710</td>
                  <td class="number">${gstRate}.00</td>
                  <td class="number">${part.quantity}</td>
                  <td class="number">${part.rate.toFixed(2)}</td>
                  <td class="number">${part.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
              ${Array(24 - data.parts.length - (data.serviceCharge > 0 ? 1 : 0)).fill(0).map(() => `
                <tr>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                </tr>
              `).join('')}
              <!-- Bank Details Row - merged into main table -->
              <tr style="font-size: 12px;">
                <td colspan="5" style="padding: 3px; border-left: 1px solid #000; border-right: 1px solid #000; border-top: 1px solid #000; border-bottom: 1px solid #000; vertical-align: middle; text-align: center; font-weight: bold;"><strong>OUR BANK DETAILS:</strong> UNION BANK OF INDIA, A/C: 014511010000133, IFSC: UBIN0801453, Branch: Governerpet, Vijayawada</td>
                <td style="text-align: center; font-weight: bold; padding: 3px; border-left: 1px solid #000; border-right: 1px solid #000; border-top: 1px solid #000; border-bottom: 1px solid #000; vertical-align: middle;"><strong>Total</strong></td>
                <td style="text-align: center; font-weight: bold; padding: 3px; border-right: 1px solid #000; border-top: 1px solid #000; border-bottom: 1px solid #000; vertical-align: middle;"><strong>${data.totalAmount.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
          
          <!-- 16-Column Tax Table -->
          <table class="tax-table tax-table-16" style="width: 100%; border-collapse: collapse; margin-top: 3px; font-size: 6px; min-height: 50px; table-layout: fixed;">
            <thead>
              <tr style="background-color: #e6f0ff; height: 18px;">
                ${(() => { 
                  const state = (data.customerState || "").toLowerCase(); 
                  return state.includes("andhra pradesh") || state.includes("ap") || state === "37-andhra pradesh";
                })() ? `
                <!-- AP Customer: SGST + CGST -->
                <th class="tax-table">ItemGroup</th>
                <th class="tax-table">TAX%</th>
                <th class="tax-table">QTY.</th>
                <th class="tax-table">TAXABLE_AMT</th>
                <th class="tax-table">SGST%</th>
                <th class="tax-table">SGST_AMT.</th>
                <th class="tax-table">CGST%</th>
                <th class="tax-table">CGST_AMT.</th>
                <th class="tax-table">ItemGroup</th>
                <th class="tax-table">TAX%</th>
                <th class="tax-table">QTY.</th>
                <th class="tax-table">TAXABLE_AMT</th>
                <th class="tax-table">SGST%</th>
                <th class="tax-table">SGST_AMT.</th>
                <th class="tax-table">CGST%</th>
                <th class="tax-table">CGST_AMT.</th>
                ` : `
                <!-- Interstate Customer: IGST -->
                <th class="tax-table">ItemGroup</th>
                <th class="tax-table">TAX%</th>
                <th class="tax-table">QTY.</th>
                <th class="tax-table">TAXABLE_AMT</th>
                <th class="tax-table">IGST%</th>
                <th class="tax-table">IGST_AMT.</th>
                <th class="tax-table">-</th>
                <th class="tax-table">-</th>
                <th class="tax-table">ItemGroup</th>
                <th class="tax-table">TAX%</th>
                <th class="tax-table">QTY.</th>
                <th class="tax-table">TAXABLE_AMT</th>
                <th class="tax-table">IGST%</th>
                <th class="tax-table">IGST_AMT.</th>
                <th class="tax-table">-</th>
                <th class="tax-table">-</th>
                `}
              </tr>
            </thead>
            <tbody>
              <tr style="height: 25px;">
                ${(() => { 
                  const state = (data.customerState || "").toLowerCase(); 
                  return state.includes("andhra pradesh") || state.includes("ap") || state === "37-andhra pradesh";
                })() ? `
                <!-- AP Customer: SGST + CGST Data -->
                <td class="tax-table">SERVICE</td>
                <td class="tax-table">${gstRate}.00</td>
                <td class="tax-table">1</td>
                <td class="tax-table">${taxableAmount.toFixed(2)}</td>
                <td class="tax-table">${gstRate/2}.00</td>
                <td class="tax-table">${((gstInclusiveTotal - taxableAmount)/2).toFixed(2)}</td>
                <td class="tax-table">${gstRate/2}.00</td>
                <td class="tax-table">${((gstInclusiveTotal - taxableAmount)/2).toFixed(2)}</td>
                <td class="tax-table">-</td>
                <td class="tax-table">-</td>
                <td class="tax-table">-</td>
                <td class="tax-table">-</td>
                <td class="tax-table">-</td>
                <td class="tax-table">-</td>
                <td class="tax-table">-</td>
                <td class="tax-table">-</td>
                ` : `
                <!-- Interstate Customer: IGST Data -->
                <td class="tax-table">SERVICE</td>
                <td class="tax-table">${gstRate}.00</td>
                <td class="tax-table">1</td>
                <td class="tax-table">${taxableAmount.toFixed(2)}</td>
                <td class="tax-table">${gstRate}.00</td>
                <td class="tax-table">${(gstInclusiveTotal - taxableAmount).toFixed(2)}</td>
                <td class="tax-table">-</td>
                <td class="tax-table">-</td>
                <td class="tax-table">-</td>
                <td class="tax-table">-</td>
                <td class="tax-table">-</td>
                <td class="tax-table">-</td>
                <td class="tax-table">-</td>
                <td class="tax-table">-</td>
                `}
              </tr>
            </tbody>
          </table>

          <!-- Sale Description Table -->
          <table style="width: 100%; border-collapse: collapse; margin-top: 3px; font-size: 12px;">
            <thead>
              <tr style="background-color: #e6f0ff;">
                <th style="border: 1px solid #000; padding: 3px; text-align: center; font-weight: bold;">SALE DESCRIPTION</th>
                <th style="border: 1px solid #000; padding: 3px; text-align: center; font-weight: bold;">TAX%</th>
                <th style="border: 1px solid #000; padding: 3px; text-align: center; font-weight: bold;">TAXABLE_AMOUNT</th>
                ${(() => { 
                  const state = (data.customerState || "").toLowerCase(); 
                  return state.includes("andhra pradesh") || state.includes("ap") || state === "37-andhra pradesh";
                })() ? `
                <th style="border: 1px solid #000; padding: 3px; text-align: center; font-weight: bold;">SGST%</th>
                <th style="border: 1px solid #000; padding: 3px; text-align: center; font-weight: bold;">SGST_AMOUNT</th>
                <th style="border: 1px solid #000; padding: 3px; text-align: center; font-weight: bold;">CGST%</th>
                <th style="border: 1px solid #000; padding: 3px; text-align: center; font-weight: bold;">CGST_AMOUNT</th>
                ` : `
                <th style="border: 1px solid #000; padding: 3px; text-align: center; font-weight: bold;">IGST%</th>
                <th style="border: 1px solid #000; padding: 3px; text-align: center; font-weight: bold;">IGST_AMOUNT</th>
                <th style="border: 1px solid #000; padding: 3px; text-align: center; font-weight: bold;">-</th>
                <th style="border: 1px solid #000; padding: 3px; text-align: center; font-weight: bold;">-</th>
                `}
                <th style="border: 1px solid #000; padding: 3px; text-align: center; font-weight: bold;">TOTAL_AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #000; padding: 4px;">${gstRate}% TAXABLE SALES</td>
                <td style="border: 1px solid #000; padding: 4px; text-align: center;">${gstRate}.00</td>
                <td style="border: 1px solid #000; padding: 4px; text-align: right;">${taxableAmount.toFixed(2)}</td>
                ${(() => { 
                  const state = (data.customerState || "").toLowerCase(); 
                  return state.includes("andhra pradesh") || state.includes("ap") || state === "37-andhra pradesh";
                })() ? `
                <td style="border: 1px solid #000; padding: 4px; text-align: center;">${gstRate/2}.00</td>
                <td style="border: 1px solid #000; padding: 4px; text-align: right;">${((gstInclusiveTotal - taxableAmount)/2).toFixed(2)}</td>
                <td style="border: 1px solid #000; padding: 4px; text-align: center;">${gstRate/2}.00</td>
                <td style="border: 1px solid #000; padding: 4px; text-align: right;">${((gstInclusiveTotal - taxableAmount)/2).toFixed(2)}</td>
                ` : `
                <td style="border: 1px solid #000; padding: 4px; text-align: center;">${gstRate}.00</td>
                <td style="border: 1px solid #000; padding: 4px; text-align: right;">${(gstInclusiveTotal - taxableAmount).toFixed(2)}</td>
                <td style="border: 1px solid #000; padding: 4px; text-align: center;">-</td>
                <td style="border: 1px solid #000; padding: 4px; text-align: center;">-</td>
                `}
                <td style="border: 1px solid #000; padding: 4px; text-align: right;">${gstInclusiveTotal.toFixed(2)}</td>
              </tr>
              <tr style="font-weight: bold;">
                <td style="border: 1px solid #000; padding: 4px;">TOTAL</td>
                <td style="border: 1px solid #000; padding: 4px;"></td>
                <td style="border: 1px solid #000; padding: 4px; text-align: right;">${taxableAmount.toFixed(2)}</td>
                ${(() => { 
                  const state = (data.customerState || "").toLowerCase(); 
                  return state.includes("andhra pradesh") || state.includes("ap") || state === "37-andhra pradesh";
                })() ? `
                <td style="border: 1px solid #000; padding: 4px;"></td>
                <td style="border: 1px solid #000; padding: 4px; text-align: right;">${((gstInclusiveTotal - taxableAmount)/2).toFixed(2)}</td>
                <td style="border: 1px solid #000; padding: 4px;"></td>
                <td style="border: 1px solid #000; padding: 4px; text-align: right;">${((gstInclusiveTotal - taxableAmount)/2).toFixed(2)}</td>
                ` : `
                <td style="border: 1px solid #000; padding: 4px;"></td>
                <td style="border: 1px solid #000; padding: 4px; text-align: right;">${(gstInclusiveTotal - taxableAmount).toFixed(2)}</td>
                <td style="border: 1px solid #000; padding: 4px;">-</td>
                <td style="border: 1px solid #000; padding: 4px;">-</td>
                `}
                <td style="border: 1px solid #000; padding: 4px; text-align: right;">${gstInclusiveTotal.toFixed(2)}</td>
              </tr>
              <!-- Amount in Words Row - merged into Sale Description table -->
              <tr>
                ${(() => { 
                  const state = (data.customerState || "").toLowerCase(); 
                  return state.includes("andhra pradesh") || state.includes("ap") || state === "37-andhra pradesh";
                })() ? `
                <td colspan="6" style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold; background-color: #f5f5f5; font-size: 12px;">
                  Rupees ${numberToWords(Math.round(data.totalAmount))} only
                </td>
                <td style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold; font-size: 12px; background-color: #f5f5f5;">
                  Bill Amount
                </td>
                <td style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold; font-size: 15px;">
                  ${data.totalAmount.toFixed(2)}
                </td>
                ` : `
                <td colspan="6" style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold; background-color: #f5f5f5; font-size: 12px;">
                  Rupees ${numberToWords(Math.round(data.totalAmount))} only
                </td>
                <td style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold; font-size: 12px; background-color: #f5f5f5;">
                  Bill Amount
                </td>
                <td style="border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold; font-size: 15px;">
                  ${data.totalAmount.toFixed(2)}
                </td>
                `}
              </tr>
            </tbody>
          </table>

          <!-- Footer Section with Signature Areas -->
          <table style="width: 100%; border-collapse: collapse; margin-top: 1px; font-size: 8px;">
            <tr>
              <td style="border: 1px solid #000; padding: 6px; line-height: 1.2; vertical-align: top;">
                <div style="font-weight: bold; margin-bottom: 5px;">RECEIVED IN GOOD CONDITION</div>
                <div style="margin-top: 10px;">
                  <div style="font-weight: bold;">GOODS RECEIVED BY</div>
                  <div style="margin-top: 8px; border-bottom: 1px solid #000; width: 60%;"></div>
                </div>
              </td>
              <td style="border: 1px solid #000; padding: 6px; line-height: 1.2; vertical-align: top; text-align: right;">
                <div style="margin-bottom: 10px;">
                  <div>for SHIVAKESAV ELECTRONICS</div>
                </div>
                <div style="margin-top: 15px;">
                  <div style="border-bottom: 1px solid #000; width: 60%; margin-left: auto; margin-bottom: 3px;"></div>
                  <div style="font-weight: bold;">AUTHORIZED SIGNATORY</div>
                </div>
              </td>
            </tr>
          </table>

          <!-- Terms and Conditions -->
          <table style="width: 100%; border-collapse: collapse; font-size: 7px;">
            <tr>
              <td style="border: 1px solid #000; padding: 5px;">
                <strong>E.& O.E</strong> &nbsp;&nbsp;&nbsp;&nbsp;
                1) Goods once sold cannot be taken back. 2) All disputes subject to Vijayawada Jurisdiction only. 3) For Cash Invoices No Receipt is required.
              </td>
            </tr>
          </table>
        </div>
      </body>
    </html>
  `;

  printInvoicePDF(content, `GST_Invoice_${data.invoiceNumber}`);
}

// Non-GST Invoice Generator (simplified version of GST format)
export function generateNonGSTInvoice(data: InvoiceData) {
  const invDate = data.invoiceDate ? new Date(data.invoiceDate) : new Date();
  const content = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice - ${data.invoiceNumber}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; line-height: 1.2; font-size: 12px; color: #000; }
          .invoice-container { width: 100%; max-width: 190mm; background: white; border: 2px solid #000; padding: 8px; box-sizing: border-box; }
          .header { text-align: center; margin-bottom: 15px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .company-name { font-size: 20px; font-weight: bold; margin-bottom: 5px; color: #000; }
          .company-address { font-size: 11px; margin: 2px 0; line-height: 1.3; }
          .authorization { font-size: 11px; font-weight: bold; color: #4472C4; margin: 3px 0; }
          .contact-info { font-size: 10px; margin: 2px 0; font-weight: bold; }
          .invoice-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 8px; border: 1px solid #000; background-color: #f8f9fa; }
          .invoice-details { display: flex; justify-content: space-between; margin-bottom: 15px; gap: 20px; }
          .customer-section { flex: 1; padding: 8px; border: 1px solid #000; }
          .payment-section { flex: 1; padding: 8px; border: 1px solid #000; }
          .customer-info { font-size: 11px; margin: 3px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 5px; font-size: 11px; table-layout: fixed; }
          .items-table th:nth-child(1),
.items-table td:nth-child(1) { width: 6%; }

.items-table th:nth-child(2),
.items-table td:nth-child(2) { width: 42%; } /* Wider description */

.items-table th:nth-child(3),
.items-table td:nth-child(3) { width: 12%; }

.items-table th:nth-child(4),
.items-table td:nth-child(4) { width: 8%; }

.items-table th:nth-child(5),
.items-table td:nth-child(5) { width: 8%; }

.items-table th:nth-child(6),
.items-table td:nth-child(6) { width: 12%; }

.items-table th:nth-child(7),
.items-table td:nth-child(7) { width: 12%; }

.items-table td {
  /* Remove horizontal lines; keep only vertical borders */
  border-left: 1px solid #000;
  border-right: 1px solid #000;
  border-top: none;
  border-bottom: none;
  padding: 3px;
  text-align: center;
  font-size: 9px;
}

          .items-table th { background-color: #f0f0f0; border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; }
          .items-table td { border: 1px solid #000; padding: 4px; text-align: center; }
          .items-table td.number { text-align: right; }
          .bank-details { border: 1px solid #000; padding: 6px; font-size: 11px; margin-bottom: 8px; background: #f8f9fa; }
          .total-section { display: flex; justify-content: space-between; align-items: center; text-align: right; margin-top: 10px; font-size: 12px; font-weight: bold; border-top: 1px solid #000; padding-top: 5px; }
          .amount-words { font-weight: bold; font-size: 11px; }
          .grand-total { font-size: 14px; font-weight: bold; }
          .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px; }
          .terms { font-size: 9px; max-width: 60%; }
          .signature { text-align: right; max-width: 35%; }
          .signature-line { margin-top: 15px; border-top: 1px solid #000; padding-top: 5px; font-weight: bold; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Header -->
          <div class="header">
            <div class="company-name">SHIVAKESAV ELECTRONICS</div>
            <div class="company-address">D.No 29-14-62, 2nd Floor, Beside Andhra Hospital, Seshadri Sastri Street, Governorpet, Vijayawada – 2</div>
            <div class="authorization">PANASONIC & JBL AUTHORIZED SERVICE CENTER</div>
            <div class="contact-info">PHONES: 9182193469, 9642365559 | Land: 08664534719 | Email: shivakesavelecronics@gmail.com</div>
          </div>

          <!-- Invoice Header -->
          <div class="invoice-header">
            <span>GSTIN: 37BYOPS6182A1Z1</span>
            <span>INVOICE</span>
            <span>PAN: BYOPS6182A</span>
          </div>

          <!-- Invoice Details -->
          <div class="invoice-details">
            <div class="customer-section">
              <div style="font-weight: bold;">BILL NO: ${data.invoiceNumber}</div>
              <div class="customer-info"><strong>${data.customerName}</strong></div>
              <div class="customer-info">${data.customerAddress}</div>
              <div class="customer-info">PHONE NO: ${data.customerPhone}</div>
              <div class="customer-info">STATE: ${data.customerAddress || '37-ANDHRA PRADESH'}</div>
            </div>
            <div class="payment-section">
              <div>DATE: ${invDate.toLocaleDateString('en-GB')}</div>
              <div>PAYMENT MODE: ${data.paymentMethod === 'cash' ? 'CASH' : 'ONLINE'}</div>
              ${data.technicianName ? `<div>TECHNICIAN: ${data.technicianName}</div>` : '<div>TECHNICIAN: </div>'}
              <div>TRANSPORT: </div>
              <div>PACKED BY: </div>
              <div>Jobcard Details: ${data.jobId}</div>
            </div>
          </div>

          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th>SNo</th>
                <th>Item Description</th>
                <th>Qty.</th>
                <th>Rate(Rs.)</th>
                <th>Amount(Rs.)</th>
              </tr>
            </thead>
            <tbody>
              ${data.serviceCharge > 0 ? `
              <tr>
                <td>1</td>
                <td>SERVICE CHARGE${data.workDone ? ` - ${data.workDone}` : ''}</td>
                <td class="number">1</td>
                <td class="number">${data.serviceCharge.toFixed(2)}</td>
                <td class="number">${data.serviceCharge.toFixed(2)}</td>
              </tr>` : ''}
              ${data.parts.map((part, index) => `
                <tr>
                  <td>${data.serviceCharge > 0 ? index + 2 : index + 1}</td>
                  <td>${part.name}</td>
                  <td class="number">${part.quantity}</td>
                  <td class="number">${part.rate.toFixed(2)}</td>
                  <td class="number">${part.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
              ${Array(24  - data.parts.length - (data.serviceCharge > 0 ? 1 : 0)).fill(0).map(() => `
                <tr>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Bank Details -->
          <div class="bank-details">
            <strong>OUR BANK DETAILS:</strong> UNION BANK OF INDIA, A/c. no: 014511010000133, IFSC: UBIN0801453, Governerpet, Vijayawada
            <div style="float: right; font-weight: bold;">Total: ${data.totalAmount.toFixed(2)}</div>
          </div>

          <!-- Total Section -->
          <div class="total-section">
            <div class="amount-words">
              Rupees ${numberToWords(Math.round(data.totalAmount))} only
            </div>
            <div class="grand-total">
              Bill Amount: ${data.totalAmount.toFixed(2)}
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="terms">
              <div><strong>RECEIVED IN GOOD CONDITION</strong></div>
              <div style="margin-top: 10px;"><strong>GOODS RECEIVED BY</strong></div>
              <div style="margin-top: 15px;">
                <strong>E.& O.E</strong> &nbsp;&nbsp;&nbsp;&nbsp;
                1) Goods once sold cannot be taken back. 2) All disputes subject to Vijayawada Jurisdiction only. 3) For Cash Invoices No Receipt is required.
              </div>
            </div>
            <div class="signature">
              <div>for SHIVAKESAV ELECTRONICS</div>
              <div class="signature-line">AUTHORIZED SIGNATORY</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  printInvoicePDF(content, `Invoice_${data.invoiceNumber}`);
}

// Function to print quotation PDF
function printQuotationPDF(content: string, filename: string) {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    let printTriggered = false;
    printWindow.onload = () => {
      if (!printTriggered) {
        printTriggered = true;
        
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          
          setTimeout(() => {
            if (confirm('Close print window?')) {
              printWindow.close();
            }
          }, 1000);
        }, 500);
      }
    };
    
    setTimeout(() => {
      if (!printTriggered) {
        printTriggered = true;
        printWindow.focus();
        printWindow.print();
      }
    }, 1000);
  } else {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('Print window blocked. Downloaded HTML file instead. Open the file and use Ctrl+P to print as PDF.');
  }
}

// Quotation PDF Generator
export function generateQuotationPDF(data: QuotationData) {
  const content = generateQuotationHTML(data);
  printQuotationPDF(content, `Quotation_${data.quotationNumber}`);
}

// Function to save quotation as PDF file - same pattern as job sheet and invoice
export function saveQuotationPDF(data: any) {
  // Use the same approach as generateQuotationPDF - just call it directly
  generateQuotationPDF(data);
}

// Helper function to generate quotation HTML content
function generateQuotationHTML(data: any): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quotation - ${data.quotationNumber}</title>
        <style>
          @page {
            size: A4;
            margin: 12mm;
          }
          
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            line-height: 1.2;
            font-size: 13px;
            color: #000;
          }
          
          .quotation-container {
            width: 100%;
            background: white;
            border: 2px solid #000;
            padding: 8px;
            box-sizing: border-box;
            max-width: 186mm;
            min-height: 273mm;
          }
          
          .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          
          .quotation-title {
            font-size: 16px;
            font-weight: bold;
            margin: 0 0 8px 0;
            text-decoration: underline;
          }
          
          .company-name {
            font-size: 20px;
            font-weight: bold;
            margin: 5px 0;
            color: #000;
          }
          
          .authorization {
            font-size: 11px;
            font-weight: bold;
            margin: 3px 0;
          }
          
          .company-address {
            font-size: 11px;
            margin: 2px 0;
            line-height: 1.3;
          }
          
          .contact-info {
            font-size: 11px;
            margin: 2px 0;
          }
          
          .quotation-meta {
            display: flex;
            justify-content: space-between;
            margin: 15px 0;
            font-size: 13px;
          }
          
          .customer-section {
            width: 60%;
          }
          
          .quotation-details {
            width: 35%;
            text-align: right;
          }
          
          .customer-info {
            margin: 2px 0;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 12px;
          }
          
          .items-table th {
            background-color: #f0f0f0;
            border: 1px solid #000;
            padding: 6px;
            text-align: left;
            font-weight: bold;
          }
          
          .items-table td {
            border-left: 1px solid #000;
            border-right: 1px solid #000;
            padding: 6px;
            text-align: left;
            border-top: none;
            border-bottom: none;
          }
          
          .items-table td:nth-child(2),
          .items-table td:nth-child(3),
          .items-table td:nth-child(4) {
            text-align: center;
          }
          
          .items-table td:nth-child(5) {
            text-align: right;
          }
          
          .total-amount {
            text-align: right;
            margin: 10px 0;
            font-size: 12px;
          }
          
          .amount-words {
            margin: 10px 0;
            font-size: 11px;
            font-weight: bold;
          }
          
          .validity-terms {
            margin: 15px 0;
            font-size: 11px;
            text-align: center;
          }
          
          .footer-section {
            margin-top: 20px;
            font-size: 11px;
          }
          
          .bank-signature-box {
            border: 1px solid #000;
            padding: 8px;
            box-sizing: border-box;
            display: flex;
            justify-content: space-between;
            min-height: 80px;
          }
          
          .bank-details {
            width: 60%;
            border-right: 1px solid #000;
            padding-right: 8px;
          }
          
          .signature-section {
            width: 35%;
            text-align: right;
            position: relative;
            padding-left: 8px;
          }
          
          .validity-box {
            border: 1px solid #000;
            padding: 8px;
            text-align: center;
            margin-bottom: 15px;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="quotation-container">
          <!-- Header -->
          <div class="header">
            <div class="quotation-title">QUOTATION</div>
            <div class="company-name">SHIVAKESAV ELECTRONICS</div>
            <div class="authorization">AUTHORIZED SERVICE CENTER FOR PANASONIC & JBL</div>
            <div class="company-address">D.No 29-14-62, 2nd Floor, Beside Andhra Hospital, Seshadri Sastri Street, Governorpet, Vijayawada – 2</div>
            <div class="contact-info"><strong>PHONES: 9182193469, 9642365559 | Email: shivakesavelecronics@gmail.com</strong></div>
          </div>

          <!-- Quotation Meta -->
          <div class="quotation-meta">
            <div class="customer-section">
              <div class="customer-info"><strong>Customer Name:</strong> ${data.customerName || ''}</div>
              <div class="customer-info"><strong>Phone:</strong> ${data.customerPhone || ''}</div>
              <div class="customer-info"><strong>Address:</strong> ${data.customerAddress || ''}</div>
              <div class="customer-info"><strong>City:</strong> ${data.city || ''}, <strong>State:</strong> ${data.state || ''}, <strong>Pin Code:</strong> ${data.pinCode || ''}</div>
            </div>
            <div class="quotation-details">
              <div><strong>Quotation No:</strong> ${data.quotationNumber}</div>
              <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
              <div><strong>Valid for:</strong> ${data.validityDays || 10} days</div>
            </div>
          </div>

          <!-- Product Details Section -->
          <div class="product-details" style="margin: 10px 0; font-size: 11px;">
            <div style="display: flex; gap: 20px;">
              <div><strong>Product:</strong> ${data.productType || ''}</div>
              <div><strong>Model:</strong> ${data.modelNumber || ''}</div>
              <div><strong>Serial Number:</strong> ${data.serialNumber || ''}</div>
            </div>
          </div>

          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 8%;">S.No</th>
                <th style="width: 52%;">Description of Goods</th>
                <th style="width: 10%;">Qty</th>
                <th style="width: 15%;">Rate</th>
                <th style="width: 15%;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${data.serviceCharge > 0 ? `
                <tr>
                  <td>1</td>
                  <td>Service Charge</td>
                  <td style="text-align: center;">1</td>
                  <td style="text-align: right;">₹${parseFloat(data.serviceCharge).toFixed(2)}</td>
                  <td style="text-align: right;">₹${parseFloat(data.serviceCharge).toFixed(2)}</td>
                </tr>
              ` : ''}
              ${(data.parts || []).map((part: any, index: number) => `
                <tr>
                  <td>${data.serviceCharge > 0 ? index + 2 : index + 1}</td>
                  <td>${part.name || part.description || ''}</td>
                  <td style="text-align: center;">${part.quantity || 1}</td>
                  <td style="text-align: right;">₹${parseFloat(part.unitPrice || part.rate || 0).toFixed(2)}</td>
                  <td style="text-align: right;">₹${parseFloat(part.amount || (part.quantity * part.unitPrice) || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
              ${Array(21 - (data.parts?.length || 0) - (data.serviceCharge > 0 ? 1 : 0)).fill('').map(() => `
                <tr>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                </tr>
              `).join('')}
              <tr style="border-top: 2px solid #000; border-bottom: 2px solid #000;">
                <td colspan="3" style="text-align: left; font-weight: bold; padding: 8px;">
                  Amount in Words: ${numberToWords(Math.round(parseFloat(data.totalAmount || 0)))}
                </td>
                <td style="text-align: right; font-weight: bold;">Net Amount:</td>
                <td style="text-align: right; font-weight: bold;">₹${parseFloat(data.totalAmount || 0).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <!-- Footer Section -->
          <div class="footer-section">
            <!-- Validity Box -->
            <div class="validity-box">
              <strong>This quotation is valid for ${data.validityDays || 10} days from the date of issue</strong>
            </div>

            <!-- Combined Bank Details and Signature Box -->
            <div class="bank-signature-box">
              <div class="bank-details">
                <strong>OUR BANK DETAILS:</strong><br>
                UNION BANK OF INDIA<br>
                A/c. no: 014511010000133<br>
                IFSC: UBIN0801453<br>
                Branch: Governorpet, Vijayawada
              </div>
              <div class="signature-section">
                <div style="margin-bottom: 20px;">for SHIVAKESAV ELECTRONICS</div>
                <div style="position: absolute; bottom: 8px; right: 8px; left: 8px; text-align: center;">
                  <div style="border-top: 1px solid #000; padding-top: 5px;">
                    <strong>AUTHORIZED SIGNATORY</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </body>
    </html>
  `;
}

// Function to print invoices
function printInvoice(content: string, filename: string) {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  
  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();
    
    let printTriggered = false;
    
    printWindow.onload = () => {
      if (!printTriggered) {
        printTriggered = true;
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          
          setTimeout(() => {
            if (confirm('Close print window?')) {
              printWindow.close();
            }
          }, 1000);
        }, 500);
      }
    };
    
    setTimeout(() => {
      if (!printTriggered) {
        printTriggered = true;
        printWindow.focus();
        printWindow.print();
      }
    }, 1000);
  } else {
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('Print window blocked. Downloaded HTML file instead. Open the file and use Ctrl+P to print as PDF.');
  }
}

// Function to print job sheet PDF (restored)
function printJobSheetPDF(content: string, filename: string) {
  // Reuse generic invoice print logic
  printInvoice(content, filename);
}

// Function to print invoice PDF (restored)
function printInvoicePDF(content: string, filename: string) {
  // Reuse generic invoice print logic
  printInvoice(content, filename);
}
