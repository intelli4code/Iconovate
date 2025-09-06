
import { Timestamp } from "firebase/firestore";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  service: string;
  description: string;
  duration: string;
  budget: string;
  sourceFiles: string;
  revisions: number;
  createdAt: Timestamp;
  status: 'New' | 'Contacted' | 'Converted' | 'Archived' | 'Declined';
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
}

export interface ProjectRequest {
  id: string;
  clientName: string;
  clientEmail: string;
  brief: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: any; // serverTimestamp
}

export type PaymentStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Payment {
  id: string;
  projectId: string;
  invoiceId: string;
  clientName: string;
  projectName: string;
  amount: number;
  reference: string;
  status: PaymentStatus;
  requestedAt: any;
  reviewedAt?: string;
  reviewedBy?: string;
}

export type ProjectPaymentStatus = 'Unpaid' | 'Pending Confirmation' | 'Paid';
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
  dashboardLayout?: 'classic' | 'modern';
  showOnWebsite?: boolean;
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
  paymentLink?: string;
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
  paymentStatus: ProjectPaymentStatus;
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

export interface PortfolioItem {
  id: string; // doc id
  title: string;
  category: string;
  imageUrl: string;
  imagePath: string; // for supabase deletion
  description: string; // for the card
  content: string; // for the dialog, can be markdown/html
  fileType?: 'image' | 'pdf';
  aspectRatio?: '1:1' | '16:9' | '9:16';
  isFeatured?: boolean;
  createdAt: any;
}

export interface PricingTier {
  id: string;
  name: "Starter" | "Pro" | "Enterprise";
  price: string;
  priceDescription: string;
  description: string;
  features: string[];
  isPopular: boolean;
  order: number;
}

export interface Service {
  id: string;
  icon: string; // lucide icon name
  title: string;
  description: string;
  deliverables?: string[];
  order: number;
}

export interface Testimonial {
    id: string;
    name: string;
    rating: number;
    review: string;
    src: string;
    hint: string;
    order: number;
}

export interface SiteImage {
    id: string; 
    name: string;
    description: string;
    imageUrl: string;
    imagePath: string;
    imageHint: string;
}

export interface FooterLink {
    id: string;
    text: string;
    href: string;
}

export interface FooterColumn {
    id: string;
    title: string;
    links: FooterLink[];
    order: number;
}

export interface SocialLink {
    id: string;
    platform: string;
    url: string;
}

export interface FooterContent {
    description: string;
    columns: FooterColumn[];
    socials: SocialLink[];
}

export interface FeaturePoint {
    id: string;
    icon: string;
    title: string;
    text: string;
    link: string;
    order: number;
}

export interface HomePageContent {
    heroTitle: string;
    heroSubtitle: string;
    featureTitle: string;
    featureSubtitle: string;
}

export interface PageContent {
    home: HomePageContent;
}

export interface SiteStat {
    id: string;
    label: string;
    value: string;
    order: number;
}

export interface SiteContent {
    footer: FooterContent;
    images: { [key: string]: SiteImage };
    pageContent: PageContent;
    stats: SiteStat[];
    theme: string;
    featurePoints: FeaturePoint[];
}
