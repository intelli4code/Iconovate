
"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import type { Project, TeamMember, Task, ProjectStatus } from "@/types"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  RadialBar,
  RadialBarChart,
  PolarAngleAxis,
  Cell,
  Defs,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { LoadingLink } from "@/components/ui/loading-link"
import { ArrowUpRight, Plus, Video, Play, Pause } from "lucide-react"

interface ModernDashboardProps {
  projects: Project[];
  teamMembers: TeamMember[];
}

const ProjectIcon = ({ type }: { type: ProjectStatus }) => {
    const baseClass = "h-8 w-8 rounded-lg flex items-center justify-center text-white";
    const colors: Record<string, string> = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
    };

    let colorClass;
    let icon;

    switch (type) {
        case 'In Progress':
        case 'Pending Approval':
            colorClass = colors.blue;
            icon = '🔷';
            break;
        case 'Completed':
            colorClass = colors.green;
            icon = '✅';
            break;
        case 'Blocked':
            colorClass = colors.red;
            icon = '⛔';
            break;
        default:
            colorClass = colors.orange;
            icon = '🔶';
    }

    return <div className={`${baseClass} ${colorClass}`}>{icon}</div>;
};


export default function ModernDashboard({ projects, teamMembers }: ModernDashboardProps) {
  const router = useRouter()
  const {
    totalProjects,
    endedProjects,
    runningProjects,
    pendingProjects,
    projectAnalytics,
    overallProgress,
    upcomingTasks
  } = useMemo(() => {
    const totalProjects = projects.length;
    const endedProjects = projects.filter(p => p.status === 'Completed' || p.status === 'Canceled').length;
    const runningProjects = projects.filter(p => p.status === 'In Progress').length;
    const pendingProjects = projects.filter(p => p.status === 'Pending Approval' || p.status === 'Awaiting Brief' || p.status === 'Pending Feedback').length;

    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const projectAnalytics = days.map((day, i) => ({
        name: day,
        tasks: Math.floor(Math.random() * 50) + 10, // Placeholder data
        isToday: i === new Date().getDay(),
    }));
    
    const allTasks = projects.flatMap(p => p.tasks || []);
    const completedTasks = allTasks.filter(t => t.completed).length;
    const overallProgress = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;
    
    const upcomingTasks = allTasks.filter(t => !t.completed)
        .map(t => {
            const project = projects.find(p => p.tasks?.some(pt => pt.id === t.id));
            return {
                ...t,
                dueDate: project?.dueDate,
                status: project?.status as ProjectStatus
            };
        })
        .sort((a, b) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime())
        .slice(0, 5);


    return { totalProjects, endedProjects, runningProjects, pendingProjects, projectAnalytics, overallProgress, upcomingTasks };
  }, [projects]);
  
  const designers = useMemo(() => teamMembers.filter(m => m.role === 'Designer'), [teamMembers]);

  return (
    <div className="space-y-6 bg-slate-50 dark:bg-slate-900/30 p-4 sm:p-6 rounded-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Plan, prioritize, and accomplish your tasks with ease.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/dashboard/export-data')}>Import Data</Button>
            <Button className="bg-[#34a853] hover:bg-[#34a853]/90" onClick={() => router.push('/dashboard/projects')}>
                <Plus className="mr-2 h-4 w-4"/> Add Project
            </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-[#34a853] text-white rounded-2xl shadow-lg">
              <CardHeader>
                  <CardTitle className="text-sm font-normal text-green-100">Total Projects</CardTitle>
                  <Button size="icon" variant="ghost" className="absolute top-4 right-4 h-8 w-8 hover:bg-white/20"><ArrowUpRight/></Button>
              </CardHeader>
              <CardContent>
                  <p className="text-4xl font-bold">{totalProjects}</p>
                  <p className="text-xs text-green-200 mt-2">Increased from last month</p>
              </CardContent>
          </Card>
          <Card className="bg-white dark:bg-card rounded-2xl shadow-sm">
              <CardHeader>
                  <CardTitle className="text-sm font-normal text-muted-foreground">Ended Projects</CardTitle>
                   <Button size="icon" variant="ghost" className="absolute top-4 right-4 h-8 w-8"><ArrowUpRight/></Button>
              </CardHeader>
              <CardContent>
                  <p className="text-4xl font-bold">{endedProjects}</p>
                  <p className="text-xs text-muted-foreground mt-2">Increased from last month</p>
              </CardContent>
          </Card>
           <Card className="bg-white dark:bg-card rounded-2xl shadow-sm">
              <CardHeader>
                  <CardTitle className="text-sm font-normal text-muted-foreground">Running Projects</CardTitle>
                   <Button size="icon" variant="ghost" className="absolute top-4 right-4 h-8 w-8"><ArrowUpRight/></Button>
              </CardHeader>
              <CardContent>
                  <p className="text-4xl font-bold">{runningProjects}</p>
                   <p className="text-xs text-muted-foreground mt-2">Increased from last month</p>
              </CardContent>
          </Card>
           <Card className="bg-white dark:bg-card rounded-2xl shadow-sm">
              <CardHeader>
                  <CardTitle className="text-sm font-normal text-muted-foreground">Pending Projects</CardTitle>
                   <Button size="icon" variant="ghost" className="absolute top-4 right-4 h-8 w-8"><ArrowUpRight/></Button>
              </CardHeader>
              <CardContent>
                  <p className="text-4xl font-bold">{pendingProjects}</p>
                   <p className="text-xs text-muted-foreground mt-2">On Discuss</p>
              </CardContent>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Analytics */}
        <Card className="lg:col-span-2 bg-white dark:bg-card rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Project Analytics</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectAnalytics} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <Defs>
                    <pattern id="pattern-stripe" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <rect width="2" height="4" fill="#a3a3a3" fillOpacity="0.5"></rect>
                    </pattern>
                </Defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(52, 168, 83, 0.1)', radius: 8 }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: '12px',
                  }}
                />
                <Bar dataKey="tasks" radius={8}>
                    {projectAnalytics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.isToday ? '#34a853' : 'url(#pattern-stripe)'} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Reminders */}
        <Card className="bg-white dark:bg-card rounded-2xl shadow-sm">
            <CardHeader>
                <CardTitle>Reminders</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-1">
                    <p className="font-semibold">Meeting with Arc Company</p>
                    <p className="text-sm text-muted-foreground">Time: 02.00 pm - 04.00 pm</p>
                </div>
                <Button className="w-full bg-[#34a853] hover:bg-[#34a853]/90">
                    <Video className="mr-2 h-4 w-4"/> Start Meeting
                </Button>
            </CardContent>
        </Card>
      </div>
      
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Team Collaboration */}
           <Card className="bg-white dark:bg-card rounded-2xl shadow-sm">
               <CardHeader className="flex flex-row justify-between items-center">
                   <CardTitle>Team Collaboration</CardTitle>
                   <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/team')}>
                        <Plus className="mr-2 h-4 w-4"/> Add Member
                    </Button>
               </CardHeader>
               <CardContent className="space-y-4">
                   {designers.slice(0, 4).map((designer, index) => (
                       <div key={designer.id} className="flex items-center gap-4">
                           <Avatar>
                               <AvatarImage src={designer.avatarUrl}/>
                               <AvatarFallback>{designer.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                           </Avatar>
                           <div className="flex-1">
                               <p className="font-semibold">{designer.name}</p>
                               <p className="text-sm text-muted-foreground">Working on a cool project</p>
                           </div>
                           <Badge variant="secondary">In Progress</Badge>
                       </div>
                   ))}
               </CardContent>
           </Card>
           
           {/* Project Progress */}
           <Card className="bg-white dark:bg-card rounded-2xl shadow-sm">
                <CardHeader>
                    <CardTitle>Project Progress</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center">
                    <div className="h-[150px] w-[150px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart 
                                innerRadius="75%" 
                                outerRadius="100%" 
                                data={[{ value: overallProgress }]} 
                                startAngle={90} 
                                endAngle={-270}
                            >
                                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                <RadialBar background dataKey="value" cornerRadius={10} angleAxisId={0}>
                                    <Cell fill="#34a853" />
                                </RadialBar>
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-foreground">
                                    {overallProgress}%
                                </text>
                                 <text x="50%" y="65%" textAnchor="middle" dominantBaseline="middle" className="text-sm fill-muted-foreground">
                                    Project Ended
                                </text>
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </div>
                     <div className="flex gap-4 text-sm text-muted-foreground mt-4">
                        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-500"></span>Completed</div>
                        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-500"></span>In Progress</div>
                        <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-orange-500"></span>Pending</div>
                    </div>
                </CardContent>
           </Card>
           
           {/* Project List */}
            <Card className="bg-white dark:bg-card rounded-2xl shadow-sm">
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>Project</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/projects')}>
                        <Plus className="mr-2 h-4 w-4"/> New
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                   {upcomingTasks.map(task => (
                       <LoadingLink key={task.id} href={`/dashboard/projects/${projects.find(p => p.tasks?.some(pt => pt.id === task.id))?.id}`}>
                           <div className="flex items-center gap-3 hover:bg-muted p-2 rounded-lg">
                               <ProjectIcon type={task.status} />
                               <div className="flex-1">
                                   <p className="font-medium text-sm truncate">{task.text}</p>
                                   <p className="text-xs text-muted-foreground">Due date: {task.dueDate ? task.dueDate : 'N/A'}</p>
                               </div>
                           </div>
                       </LoadingLink>
                   ))}
                </CardContent>
            </Card>

            {/* Time Tracker Placeholder */}
            <div className="lg:col-start-3 bg-gray-800 text-white rounded-2xl p-6 flex flex-col justify-between shadow-sm" style={{gridRow: 'span 1'}}>
                <CardTitle className="text-white">Time Tracker</CardTitle>
                <div className="text-center">
                    <p className="text-5xl font-mono font-bold tracking-tighter">01:24:08</p>
                </div>
                <div className="flex justify-center items-center gap-4">
                    <Button variant="ghost" className="rounded-full h-12 w-12 hover:bg-white/20"><Play className="fill-white"/></Button>
                    <Button variant="ghost" className="rounded-full h-12 w-12 hover:bg-white/20"><Pause className="fill-white"/></Button>
                </div>
            </div>
       </div>
    </div>
  )
}
