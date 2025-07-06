"use client"

import { useState, useEffect } from "react"
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Project, Invoice } from "@/types"
import { notFound, useParams } from "next/navigation"
import Loading from "@/app/dashboard/loading"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { format } from 'date-fns'

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>()
  const clientName = decodeURIComponent(params.id);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientName) return;
    setLoading(true);

    const projectsQuery = query(
        collection(db, "projects"), 
        where("client", "==", clientName), 
        orderBy("createdAt", "desc")
    );
    const invoicesQuery = query(
        collection(db, "invoices"),
        where("clientName", "==", clientName),
        orderBy("createdAt", "desc")
    );
    
    const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
      setProjects(projectsData);
      if (snapshot.docs.length === 0) {
        setLoading(false);
      }
    });

    const unsubscribeInvoices = onSnapshot(invoicesQuery, (snapshot) => {
      const invoicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Invoice[];
      setInvoices(invoicesData);
      setLoading(false);
    });

    return () => {
      unsubscribeProjects();
      unsubscribeInvoices();
    };
  }, [clientName]);
  
  if (loading) {
    return <Loading />;
  }

  if (!loading && projects.length === 0) {
      notFound();
  }

  const clientEmail = projects[0]?.clientEmail || 'Not Provided';
  
  const totalBilled = invoices.reduce((acc, inv) => acc + inv.total, 0);
  const totalPaid = invoices.filter(inv => inv.status === 'Paid').reduce((acc, inv) => acc + inv.total, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={clientName}
        description={clientEmail}
      />
      
      <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{projects.length}</div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalBilled)}</div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
            </CardContent>
          </Card>
      </div>

      <Card>
          <CardHeader>
              <CardTitle>Projects</CardTitle>
              <CardDescription>All projects associated with {clientName}.</CardDescription>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Project Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Due Date</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {projects.map(project => (
                          <TableRow key={project.id}>
                              <TableCell className="font-medium">
                                 <Link href={`/dashboard/projects/${project.id}`} className="hover:underline">{project.name}</Link>
                              </TableCell>
                              <TableCell><Badge variant="outline">{project.status}</Badge></TableCell>
                              <TableCell className="text-right">{format(new Date(project.dueDate), 'PP')}</TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </CardContent>
      </Card>

      <Card>
          <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>All invoices for {clientName}.</CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Invoice #</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {invoices.map(invoice => (
                          <TableRow key={invoice.id}>
                              <TableCell className="font-mono text-xs">{invoice.invoiceNumber}</TableCell>
                              <TableCell><Badge variant="outline">{invoice.status}</Badge></TableCell>
                              <TableCell>{format(new Date(invoice.dueDate), 'PP')}</TableCell>
                              <TableCell className="text-right">{formatCurrency(invoice.total)}</TableCell>
                          </TableRow>
                      ))}
                       {invoices.length === 0 && (
                          <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground h-24">No invoices found for this client.</TableCell></TableRow>
                       )}
                  </TableBody>
              </Table>
          </CardContent>
      </Card>
    </div>
  )
}
