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
    tasks: [
        { id: 'task-1-1', text: 'Initial client meeting and brief', completed: true },
        { id: 'task-1-2', text: 'Mood board and initial concepts', completed: true },
        { id: 'task-1-3', text: 'Develop 3 logo directions', completed: false },
        { id: 'task-1-4', text: 'Create brand guideline draft', completed: false },
    ],
    assets: [
      { id: 'asset-1-1', name: 'Logo_Final_Transparent.png', fileType: 'PNG', size: '1.2MB', url: '#' },
      { id: 'asset-1-2', name: 'Brand_Guidelines_v1.pdf', fileType: 'PDF', size: '5.4MB', url: '#' },
      { id: 'asset-1-3', name: 'Full_Logo_Pack.zip', fileType: 'ZIP', size: '12.8MB', url: '#' },
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
    tasks: [
        { id: 'task-2-1', text: 'User research and persona creation', completed: true },
        { id: 'task-2-2', text: 'Create low-fidelity wireframes', completed: true },
        { id: 'task-2-3', text: 'Design high-fidelity mockups', completed: false },
        { id: 'task-2-4', text: 'Prototype key user flows', completed: false },
    ],
    assets: [
      { id: 'asset-2-1', name: 'Homepage_Mockup.jpg', fileType: 'JPG', size: '3.1MB', url: '#' },
      { id: 'asset-2-2', name: 'Design_System.pdf', fileType: 'PDF', size: '8.2MB', url: '#' },
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
    tasks: [
        { id: 'task-3-1', text: 'Finalize presentation content', completed: true },
        { id: 'task-3-2', text: 'Design all presentation slides', completed: true },
        { id: 'task-3-3', text: 'Deliver final deck to client', completed: true },
    ],
    assets: [
       { id: 'asset-3-1', name: 'Pitch_Deck_Final.pdf', fileType: 'PDF', size: '15.0MB', url: '#' },
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
     tasks: [
        { id: 'task-4-1', text: 'Research competitor logos', completed: true },
        { id: 'task-4-2', text: 'Sketch initial concepts', completed: false },
        { id: 'task-4-3', text: 'Digitize top 3 concepts', completed: false },
     ],
     assets: [],
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
    tasks: [
        { id: 'task-5-1', text: 'Define brand voice and tone', completed: true },
        { id: 'task-5-2', text: 'Finalize color palette and typography', completed: true },
        { id: 'task-5-3', text: 'Request assets from client', completed: true },
        { id: 'task-5-4', text: 'Lay out the brand guide document', completed: false },
    ],
    assets: [],
  },
];
