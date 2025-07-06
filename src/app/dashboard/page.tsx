
"use client"

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
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Activity, Users, DollarSign, ListTodo, ShoppingCart, Eye, TrendingDown, TrendingUp } from "lucide-react"
import Image from "next/image"

const barChartData = [
  { month: "Jan", sales: 120, views: 80 },
  { month: "Feb", sales: 180, views: 120 },
  { month: "Mar", sales: 220, views: 150 },
  { month: "Apr", sales: 150, views: 100 },
  { month: "May", sales: 250, views: 180 },
  { month: "Jun", sales: 210, views: 160 },
];

const pieChartData = [
  { name: 'Sales', value: 68, color: '#8884d8' },
  { name: 'Product', value: 25, color: '#82ca9d' },
  { name: 'Income', value: 14, color: '#ffc658' },
];

export default function Dashboard() {

  return (
    <>
      <div className="flex items-center justify-between">
        <PageHeader title="Dashboard" description="Welcome to your BrandBoost AI dashboard." />
        <Button>Settings</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Congratulations Alex!</CardTitle>
            <CardDescription>You are the best seller this month.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold text-primary">$168.5K</div>
              <p className="text-xs text-muted-foreground mt-1">58% of sales target</p>
              <Button className="mt-4">View Details</Button>
            </div>
            <Image src="https://placehold.co/150x150.png" alt="Trophy" width={120} height={120} data-ai-hint="gift box" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">248K</div>
            <p className="text-xs text-green-500 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> +24%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$47.6K</div>
            <p className="text-xs text-green-500 flex items-center">
               <TrendingUp className="h-3 w-3 mr-1" /> +14%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">189K</div>
             <p className="text-xs text-red-500 flex items-center">
              <TrendingDown className="h-3 w-3 mr-1" /> -35%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.6%</div>
            <p className="text-xs text-green-500 flex items-center">
               <TrendingUp className="h-3 w-3 mr-1" /> +18%
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 mt-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" label>
                  {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Sales & Views</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                  }}
                />
                <Legend />
                <Bar dataKey="sales" fill="hsl(var(--primary))" name="Sales" radius={[4, 4, 0, 0]} />
                <Bar dataKey="views" fill="hsl(var(--primary) / 0.5)" name="Views" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
