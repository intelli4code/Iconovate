export type ProjectStatus = 'In Progress' | 'Pending Feedback' | 'Completed' | 'Blocked' | 'Canceled';

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
}
