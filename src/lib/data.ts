import type { Project } from '@/types';

export const mockProjects: Project[] = [
  {
    id: 'proj-001',
    name: 'Aether-Core Rebrand',
    client: 'Aether-Core Dynamics',
    status: 'In Progress',
    dueDate: '2024-09-15',
    team: ['Alex', 'Maria'],
    description: 'Complete rebrand for a leading aerospace technology firm. Focus on modernity, precision, and innovation. Deliverables include new logo, brand guidelines, and presentation templates.',
    feedback: [
      { user: 'Client', comment: 'The initial concepts look promising. Can we explore a darker blue for the primary color?', timestamp: '2024-08-05T14:30:00Z' },
      { user: 'Maria', comment: 'Agreed. I will prepare a revised palette for review.', timestamp: '2024-08-05T16:00:00Z' },
    ],
  },
  {
    id: 'proj-002',
    name: 'TerraBloom Website UI',
    client: 'TerraBloom Organics',
    status: 'Pending Feedback',
    dueDate: '2024-08-30',
    team: ['Sam', 'Chloe'],
    description: 'UI/UX design for a new e-commerce platform for an organic skincare line. The design should feel natural, clean, and trustworthy.',
     feedback: [
      { user: 'Chloe', comment: 'The wireframes are complete and have been sent to the client for review.', timestamp: '2024-08-10T11:00:00Z' },
    ],
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
  },
  {
    id: 'proj-004',
    name: 'Nova Fitness App Logo',
    client: 'Nova Fitness',
    status: 'In Progress',
    dueDate: '2024-09-25',
    team: ['Maria'],
    description: 'Logo design for a new mobile fitness application. The brand needs to feel energetic, motivating, and accessible to a wide audience.',
     feedback: [],
  },
  {
    id: 'proj-005',
    name: 'Zenith Hotels Brand Guide',
    client: 'Zenith Hotel Group',
    status: 'Blocked',
    dueDate: '2024-10-10',
    team: ['Sam'],
    description: 'Create a comprehensive brand identity guide for a luxury hotel chain. Project is currently blocked pending client asset delivery.',
     feedback: [
      { user: 'Sam', comment: 'Still waiting on the high-resolution photography from the client before we can proceed with the guide layout.', timestamp: '2024-08-08T09:12:00Z' },
    ],
  },
];
