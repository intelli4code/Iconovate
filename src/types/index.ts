export type ProjectStatus = 'In Progress' | 'Pending Feedback' | 'Completed' | 'Blocked' | 'Canceled' | 'Approved';

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
  fileType: 'PDF' | 'ZIP' | 'PNG' | 'SVG' | 'JPG';
  size: string;
  url: string; // a mock url for download
}

export interface Project {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  dueDate: string;
  team: string[];
  description: string;
  feedback: Feedback[];
  tasks: Task[];
  assets: Asset[];
}
