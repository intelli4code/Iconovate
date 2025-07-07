
export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export type PaymentStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Payment {
  id: string;
  projectId: string;
  clientName: string;
  projectName: string;
  amount: number;
  reference: string;
  status: PaymentStatus;
  requestedAt: any;
  reviewedAt?: string;
  reviewedBy?: string;
}

export type ProjectStatus = 'Awaiting Brief' | 'Pending Approval' | 'In Progress' | 'Pending Feedback' | 'Completed' | 'Blocked' | 'Canceled' | 'Cancellation Requested' | 'Revision Requested';
export type ProjectType = 'Branding' | 'Web Design' | 'UI/UX' | 'Marketing' | 'Other';
export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue';
export type TeamMemberRole = "Admin" | "Designer" | "Viewer";

export interface TeamMember {
  id: string; // The doc ID from firestore
  authUid?: string; // Firebase Auth UID
  name: string;
  email: string;
  role: TeamMemberRole;
  designerKey?: string;
  avatarUrl?: string;
  avatarPath?: string;
  createdAt?: any;
}

export interface Notification {
  id: string;
  text: string;
  timestamp: string;
}

export interface Feedback {
  user: string;
  comment: string;
  timestamp: string;
  file?: {
    name: string;
    url: string;
    path: string;
    size: string;
    fileType: string;
  }
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  loggedTime?: {
    id: string;
    designerId: string;
    designerName: string;
    minutes: number;
    date: string;
  }[];
}

export interface Asset {
  id:string;
  name: string;
  fileType: string;
  size: string;
  url: string;
  path: string;
  createdAt: string;
}

export interface Invoice {
  id: string; // The doc ID from firestore
  projectId: string;
  clientName: string;
  clientAddress: string;
  projectName: string;
  lineItems: {
      description: string;
      quantity: number;
      price: number;
      total: number;
  }[];
  taxRate?: number;
  notes?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  fromName: string;
  fromAddress: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  status: InvoiceStatus;
  createdAt: any;
}

export interface InternalNote {
  id: string;
  authorId: string;
  authorName: string;
  note: string;
  timestamp: string;
}

export interface Project {
  id:string;
  name: string;
  client: string;
  clientEmail?: string;
  status: ProjectStatus;
  dueDate: string;
  team: string[];
  description: string;
  feedback: Feedback[];
  tasks: Task[];
  assets: Asset[];
  expenses?: Expense[];
  notifications: Notification[];
  internalNotes?: InternalNote[];
  createdAt?: any;
  projectType: ProjectType;
  revisionLimit: number;
  revisionsUsed: number;
  rating?: number;
  review?: string;
  briefDescription?: string;
  briefLinks?: string;
  revisionRequestDetails?: string;
  revisionRequestTimestamp?: string;
}
