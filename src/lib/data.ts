
import type { Project } from '@/types';
import { subDays, format } from 'date-fns';

export const mockProjects: Project[] = [
  {
    id: 'proj-001',
    name: 'Aether-Core Rebrand',
    client: 'Aether-Core Dynamics',
    status: 'In Progress',
    dueDate: format(new Date(new Date().setDate(new Date().getDate() + 30)), "yyyy-MM-dd"),
    team: ['Alex', 'Maria'],
    description: 'Complete rebrand for a leading aerospace technology firm. Focus on modernity, precision, and innovation. Deliverables include new logo, brand guidelines, and presentation templates.',
    feedback: [
      { user: 'Client', comment: 'The initial concepts look promising. Can we explore a darker blue for the primary color?', timestamp: subDays(new Date(), 5).toISOString() },
      { user: 'Maria', comment: 'Agreed. I will prepare a revised palette for review.', timestamp: subDays(new Date(), 4).toISOString() },
      { user: 'Client', comment: 'Perfect, that revised palette is exactly what we were looking for. Let\'s proceed with that one.', timestamp: subDays(new Date(), 2).toISOString() },
      { user: 'Alex', comment: 'Great! I\'ve updated the logo concepts with the new palette and they are now ready for presentation.', timestamp: subDays(new Date(), 1).toISOString() }
    ],
    tasks: [],
    assets: [
      { id: 'asset-1-1', name: 'Logo_Final_Transparent.png', fileType: 'PNG', size: '1.2MB', url: '#', path: '', createdAt: new Date().toISOString() },
      { id: 'asset-1-2', name: 'Brand_Guidelines_v1.pdf', fileType: 'PDF', size: '5.4MB', url: '#', path: '', createdAt: new Date().toISOString() },
      { id: 'asset-1-3', name: 'Full_Logo_Pack.zip', fileType: 'ZIP', size: '12.8MB', url: '#', path: '', createdAt: new Date().toISOString() },
    ],
    notifications: [],
    projectType: 'Branding',
    revisionLimit: 3,
    revisionsUsed: 1
  },
  {
    id: 'proj-002',
    name: 'TerraBloom Website UI',
    client: 'TerraBloom Organics',
    status: 'Pending Feedback',
    dueDate: format(new Date(new Date().setDate(new Date().getDate() + 15)), "yyyy-MM-dd"),
    team: ['Sam', 'Chloe'],
    description: 'UI/UX design for a new e-commerce platform for an organic skincare line. The design should feel natural, clean, and trustworthy.',
     feedback: [
      { user: 'Chloe', comment: 'The wireframes are complete and have been sent to the client for review.', timestamp: '2024-08-10T11:00:00Z' },
    ],
    tasks: [],
    assets: [
      { id: 'asset-2-1', name: 'Homepage_Mockup.jpg', fileType: 'JPG', size: '3.1MB', url: '#', path: '', createdAt: new Date().toISOString() },
      { id: 'asset-2-2', name: 'Design_System.pdf', fileType: 'PDF', size: '8.2MB', url: '#', path: '', createdAt: new Date().toISOString() },
    ],
    notifications: [],
    projectType: 'Web Design',
    revisionLimit: 5,
    revisionsUsed: 2
  },
  {
    id: 'proj-003',
    name: 'QuantumLeap Pitch Deck',
    client: 'QuantumLeap Capital',
    status: 'Completed',
    dueDate: '2024-07-20',
    team: ['Alex'],
    description: 'Design a compelling pitch deck for a venture capital firm specializing in deep tech startups. The visual identity should convey authority and forward-thinking.',
     feedback: [
      { user: 'Client', comment: 'The final presentation was a huge success. Thank you!', timestamp: '2024-07-19T10:00:00Z' },
    ],
    tasks: [],
    assets: [
       { id: 'asset-3-1', name: 'Pitch_Deck_Final.pdf', fileType: 'PDF', size: '15.0MB', url: '#', path: '', createdAt: new Date().toISOString() },
    ],
    notifications: [],
    projectType: 'UI/UX',
    revisionLimit: 2,
    revisionsUsed: 1
  },
  {
    id: 'proj-004',
    name: 'Nova Fitness App Logo',
    client: 'Nova Fitness',
    status: 'In Progress',
    dueDate: format(new Date(new Date().setDate(new Date().getDate() + 45)), "yyyy-MM-dd"),
    team: ['Maria'],
    description: 'Logo design for a new mobile fitness application. The brand needs to feel energetic, motivating, and accessible to a wide audience.',
     feedback: [],
     tasks: [],
     assets: [],
     notifications: [],
     projectType: 'Branding',
     revisionLimit: 3,
     revisionsUsed: 0
  },
  {
    id: 'proj-005',
    name: 'Zenith Hotels Brand Guide',
    client: 'Zenith Hotel Group',
    status: 'Blocked',
    dueDate: format(new Date(new Date().setDate(new Date().getDate() + 60)), "yyyy-MM-dd"),
    team: ['Sam'],
    description: 'Create a comprehensive brand identity guide for a luxury hotel chain. Project is currently blocked pending client asset delivery.',
     feedback: [
      { user: 'Sam', comment: 'Still waiting on the high-resolution photography from the client before we can proceed with the guide layout.', timestamp: '2024-08-08T09:12:00Z' },
    ],
    tasks: [],
    assets: [],
    notifications: [],
    projectType: 'Marketing',
    revisionLimit: 2,
    revisionsUsed: 0
  },
];
