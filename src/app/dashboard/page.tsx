
"use client"

import { useState, useEffect, useMemo } from "react"
import { collection, onSnapshot, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Project, Invoice, ProjectStatus, ProjectType } from "@/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from "recharts"
import { PageHeader } from "@/components/page-header"
import Link from "next/link"
import { FolderKanban, DollarSign, FolderClock, Star, Info } from "lucide-react"
import { format, getMonth, startOfMonth } from "date-fns"
import Loading from "./loading"

const allStatuses: ProjectStatus[] = ['Awaiting Brief', 'Pending Approval', 'In Progress', 'Pending Feedback', 'Completed', 'Blocked', 'Canceled', 'Cancellation Requested', 'Revision Requested'];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#34a853'];

const allProjectTypes: ProjectType[] = ['Branding', 'Web Design', 'UI/UX', 'Marketing', 'Other'];
const TYPE_COLORS = ['#3498db', '#2ecc71', '#9b59b6', '#f1c40f', '#e74c3c'];


export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const projectsQuery = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const invoicesQuery = query(collection(db, "invoices"));
    
    const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
      setProjects(projectsData);
      setLoading(false);
    });

    const unsubscribeInvoices = onSnapshot(invoicesQuery, (snapshot) => {
      const invoicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Invoice[];
      setInvoices(invoicesData);
    });

    return () => {
      unsubscribeProjects();
      unsubscribeInvoices();
    };
  }, []);

  const { totalSales, totalProjects, activeProjects, averageRating, ratedProjectsCount, recentActivity, salesByMonth, projectStatusData, projectTypeData } = useMemo(() => {
    if (loading) return { totalSales: 0, totalProjects: 0, activeProjects: 0, averageRating: 0, ratedProjectsCount: 0, recentActivity: [], salesByMonth: [], projectStatusData: [], projectTypeData: [] };

    const totalSales = invoices.filter(inv => inv.status === 'Paid').reduce((acc, inv) => acc + inv.total, 0);
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => ['In Progress', 'Pending Feedback', 'Revision Requested'].includes(p.status)).length;
    
    const ratedProjects = projects.filter(p => p.rating && p.rating > 0);
    const averageRating = ratedProjects.length > 0
        ? ratedProjects.reduce((acc, p) => acc + p.rating!, 0) / ratedProjects.length
        : 0;

    const recentActivity = projects
      .flatMap(p => 
        p.notifications?.map(n => ({ ...n, projectName: p.name, projectId: p.id })) || []
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);

    const projectStatusData = allStatuses
        .map(status => ({
            name: status,
            value: projects.filter(p => p.status === status).length
        }))
        .filter(d => d.value > 0);
        
    const projectTypeData = allProjectTypes
        .map(type => ({
            name: type,
            value: projects.filter(p => p.projectType === type).length
        }))
        .filter(d => d.value > 0);

    const monthlySalesData = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - i);
        return {
            name: format(d, 'MMM'),
            sales: 0
        };
    }).reverse();

    invoices.forEach(invoice => {
        if (invoice.status === 'Paid' && invoice.issueDate) {
            try {
                const invoiceDate = new Date(invoice.issueDate);
                const currentYear = new Date().getFullYear();
                
                const monthName = format(invoiceDate, 'MMM');
                const monthIndex = monthlySalesData.findIndex(data => data.name === monthName);

                if (monthIndex !== -1) {
                    monthlySalesData[monthIndex].sales += invoice.total;
                }
            } catch (e) {
                console.error("Invalid invoice issueDate:", invoice.issueDate);
            }
        }
    });

    return { totalSales, totalProjects, activeProjects, averageRating, ratedProjectsCount: ratedProjects.length, recentActivity, salesByMonth: monthlySalesData, projectStatusData, projectTypeData };
  }, [projects, invoices, loading]);


  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <PageHeader title="Dashboard" description="An overview of your projects and finances." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From all paid invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">All-time projects created</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)} / 5.0</div>
            <p className="text-xs text-muted-foreground">From {ratedProjectsCount} client reviews</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 mt-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>The latest updates from your projects.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {recentActivity.length > 0 ? (
                        recentActivity.map(activity => (
                            <div key={activity.id} className="flex items-start gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <Info className="h-4 w-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm">{activity.text}</p>
                                    <p className="text-xs text-muted-foreground">
                                        <Link href={`/dashboard/projects/${activity.projectId}`} className="hover:underline">{activity.projectName}</Link>
                                        {' - '}{format(new Date(activity.timestamp), 'PP')}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-6">No recent activity.</p>
                    )}
                </div>
            </CardContent>
        </Card>
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
            <CardDescription>Sales performance over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(value) => `$${value}`} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                  }}
                />
                <Bar dataKey="sales" fill="hsl(var(--primary))" name="Sales" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
            <CardDescription>A breakdown of all your projects by their current status.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={projectStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {projectStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Project Type Distribution</CardTitle>
                <CardDescription>A breakdown of all your projects by type.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={projectTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                    {projectTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip
                    contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        borderColor: "hsl(var(--border))",
                    }}
                    />
                    <Legend />
                </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>
    </>
  )
}
