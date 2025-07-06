
export type ProjectStatus = 'In Progress' | 'Pending Feedback' | 'Completed' | 'Blocked' | 'Canceled' | 'Approved' | 'Cancellation Requested';
export type ProjectType = 'Branding' | 'Web Design' | 'UI/UX' | 'Marketing' | 'Other';

export interface Feedback {
  user: string;
  comment: string;
  timestamp: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface Asset {
  id: string;
  name: string;
  fileType: string;
  size: string;
  url: string;
  path: string;
  createdAt: string;
}

export interface Project {
  id:string;
  name: string;
  client: string;
  status: ProjectStatus;
  dueDate: string;
  team: string[];
  description: string;
  feedback: Feedback[];
  tasks: Task[];
  assets: Asset[];
  createdAt?: any;
  projectType: ProjectType;
  revisionLimit: number;
  revisionsUsed: number;
  rating?: number;
  review?: string;
}
