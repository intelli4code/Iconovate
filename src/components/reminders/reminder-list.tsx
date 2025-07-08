
"use client"

import { useState, useEffect, useMemo } from "react"
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Project, Invoice } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, FolderClock, ReceiptText } from "lucide-react"
import { differenceInDays, format, isAfter, isBefore, addDays, parseISO } from 'date-fns'
import { LoadingLink } from "@/components/ui/loading-link"

export function ReminderList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const projectsQuery = query(
        collection(db, "projects"),
        where("status", "in", ["In Progress", "Pending Feedback"])
    );
    const invoicesQuery = query(
        collection(db, "invoices"),
        where("status", "in", ["Sent", "Overdue"])
    );

    const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[]);
    }, (error) => {
      toast({ variant: "destructive", title: "Failed to load projects." });
      console.error(error);
    });

    const unsubscribeInvoices = onSnapshot(invoicesQuery, (snapshot) => {
      setInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Invoice[]);
    }, (error) => {
      toast({ variant: "destructive", title: "Failed to load invoices." });
      console.error(error);
    });
    
    // A simple way to set loading to false after both have had a chance to load
    const timer = setTimeout(() => setLoading(false), 1500);

    return () => {
      unsubscribeProjects();
      unsubscribeInvoices();
      clearTimeout(timer);
    };
  }, [toast]);

  const upcomingProjects = useMemo(() => {
    const today = new Date();
    const futureDate = addDays(today, 14);
    return projects
      .filter(p => {
        const dueDate = parseISO(p.dueDate);
        return isAfter(dueDate, today) && isBefore(dueDate, futureDate);
      })
      .sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime());
  }, [projects]);

  const upcomingInvoices = useMemo(() => {
    const today = new Date();
    const futureDate = addDays(today, 14);
    return invoices
      .filter(i => {
        const dueDate = parseISO(i.dueDate);
        return isAfter(dueDate, today) && isBefore(dueDate, futureDate);
      })
      .sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime());
  }, [invoices]);


  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FolderClock className="h-5 w-5 text-primary" />
                    Upcoming Project Deadlines
                </CardTitle>
                <CardDescription>Projects due within the next 14 days.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {upcomingProjects.length > 0 ? (
                        upcomingProjects.map(project => (
                             <div key={project.id} className="flex items-center">
                                <div className="flex-1">
                                    <LoadingLink href={`/dashboard/projects/${project.id}`} className="font-medium hover:underline">
                                        {project.name}
                                    </LoadingLink>
                                    <p className="text-sm text-muted-foreground">
                                        Client: {project.client}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">{format(parseISO(project.dueDate), 'PP')}</p>
                                    <p className="text-sm text-muted-foreground">{differenceInDays(parseISO(project.dueDate), new Date())} days</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-6">No upcoming project deadlines.</p>
                    )}
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ReceiptText className="h-5 w-5 text-primary" />
                    Upcoming Invoice Payments
                </CardTitle>
                <CardDescription>Invoices due within the next 14 days.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="space-y-4">
                    {upcomingInvoices.length > 0 ? (
                        upcomingInvoices.map(invoice => (
                             <div key={invoice.id} className="flex items-center">
                                <div className="flex-1">
                                    <p className="font-medium">
                                        Invoice {invoice.invoiceNumber}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Client: {invoice.clientName}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">{format(parseISO(invoice.dueDate), 'PP')}</p>
                                    <p className="text-sm text-muted-foreground">{differenceInDays(parseISO(invoice.dueDate), new Date())} days</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-6">No upcoming invoice due dates.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    </div>
  )
}
