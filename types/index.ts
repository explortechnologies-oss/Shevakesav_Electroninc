export interface DashboardMetrics {
  activeJobs: number;
  completedToday: number;
  pendingJobs: number;
  todayRevenue: number;
  totalCollected: number;
  totalDue: number;
  availableStock: number;
  lowStock: number;
  outOfStock: number;
}

export interface JobSheetWithDetails {
  id: string;
  jobId: string;
  status: string;
  jobType: string;
  jobClassification: string;
  jobMode: string;
  warrantyStatus: string;
  modelNumber?: string;
  serialNumber?: string;
  purchaseDate?: string;
  customerComplaint: string;
  reportedIssue?: string;
  agentRemarks?: string;
  accessoriesReceived?: string;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    alternatePhone?: string;
    address: string;
    city?: string;
    state?: string;
    pinCode?: string;
  };
  technician?: {
    id: string;
    name: string;
  };
  productType: {
    id: string;
    displayName: string;
  };
  brand: {
    id: string;
    displayName: string;
  };
  model?: {
    id: string;
    displayName: string;
  };
}

export interface JobSheetFormData {
  customerName: string;
  phone: string;
  alternatePhone?: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  productTypeId: string;
  brandId: string;
  modelId?: string;
  modelNumber?: string;
  serialNumber?: string;
  purchaseDate?: string;
  warrantyStatus: 'in_warranty' | 'out_warranty';
  jobType: 'amc' | 'demo' | 'urgent' | 'routine';
  jobClassification: 'repair' | 'installation' | 'repeat_repair';
  jobMode: 'indoor' | 'outdoor';
  technicianId?: string;
  customerComplaint: string;
  reportedIssue?: string;
  agentRemarks?: string;
  accessoriesReceived?: string;
  jobId?: string;
}
