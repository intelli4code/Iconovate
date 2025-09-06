
"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query } from "firebase/firestore"
import type { Project, Invoice } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { Loader2, DollarSign, FolderKanban, Star } from "lucide-react"
import { LoadingLink } from "@/components/ui/loading-link"
import { Badge } from "../ui/badge"

interface Client {
  name: string;
  avatar: string;
  projectCount: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  averageRating: number;
  projects: Project[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}


export function ClientList() {
  const [clients, setClients] = React.useState<Client[]>([]);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedClient, setSelectedClient] = React.useState<Client | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setLoading(true);
    const projectsQuery = query(collection(db, "projects"));
    const invoicesQuery = query(collection(db, "invoices"));

    const unsubscribeProjects = onSnapshot(projectsQuery, (projectSnapshot) => {
        const projectsData = projectSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
        
        const unsubscribeInvoices = onSnapshot(invoicesQuery, (invoiceSnapshot) => {
            const invoicesData = invoiceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Invoice[];
            setInvoices(invoicesData);

            const clientMap = new Map<string, Client>();
            
            projectsData.forEach(project => {
                if (!project.client) return;
                if (!clientMap.has(project.client)) {
                    clientMap.set(project.client, {
                        name: project.client,
                        avatar: '', // Placeholder
                        projectCount: 0,
                        activeProjects: 0,
                        completedProjects: 0,
                        totalRevenue: 0,
                        averageRating: 0,
                        projects: []
                    });
                }

                const clientData = clientMap.get(project.client)!;
                clientData.projectCount++;
                clientData.projects.push(project);

                if (project.status === 'Completed') {
                    clientData.completedProjects++;
                } else if (project.status !== 'Canceled') {
                    clientData.activeProjects++;
                }
            });
            
            invoicesData.forEach(invoice => {
                if (invoice.status === 'Paid' && clientMap.has(invoice.clientName)) {
                    const clientData = clientMap.get(invoice.clientName)!;
                    clientData.totalRevenue += invoice.total;
                }
            });

            clientMap.forEach(client => {
                const ratedProjects = client.projects.filter(p => p.status === 'Completed' && p.rating && p.rating > 0);
                if (ratedProjects.length > 0) {
                    client.averageRating = ratedProjects.reduce((acc, p) => acc + p.rating!, 0) / ratedProjects.length;
                }
            });

            const clientList: Client[] = Array.from(clientMap.values());
            setClients(clientList.sort((a, b) => b.projectCount - a.projectCount));
            setLoading(false);
        });

        return () => unsubscribeInvoices();
    }, (error) => {
        console.error("Error fetching projects for client list: ", error);
        setLoading(false);
        toast({
            variant: "destructive",
            title: "Failed to load clients",
            description: "Could not fetch data from the database.",
        });
    });

    return () => unsubscribeProjects();
  }, [toast]);
  
  const handleCardClick = (client: Client) => {
    setSelectedClient(client);
    setIsDialogOpen(true);
  }

  if (loading) {
      return (
        <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
  }

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clients.length === 0 ? (
        <p className="col-span-full text-center text-muted-foreground p-8">
            No clients found. Add a project to see clients here.
        </p>
      ) : (
        clients.map((client) => (
          <Card key={client.name} className="cursor-pointer hover:shadow-lg transition-shadow" onDoubleClick={() => handleCardClick(client)}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle>{client.name}</CardTitle>
                        <CardDescription>{client.projectCount} Projects</CardDescription>
                    </div>
                    <Avatar>
                        <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Active Projects</span>
                    <span className="font-semibold">{client.activeProjects}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-semibold">{client.completedProjects}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold pt-2 border-t">
                    <span className="text-muted-foreground flex items-center gap-2"><DollarSign className="h-4 w-4"/> Total Revenue</span>
                    <span className="text-primary">{formatCurrency(client.totalRevenue)}</span>
                </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>

    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>{selectedClient?.name}</DialogTitle>
                <DialogDescription>A complete overview of the client's history.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-4 py-4 text-center">
                <div className="p-4 bg-muted rounded-lg">
                    <FolderKanban className="h-6 w-6 mx-auto mb-2 text-primary"/>
                    <p className="text-2xl font-bold">{selectedClient?.projectCount}</p>
                    <p className="text-xs text-muted-foreground">Total Projects</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                    <Star className="h-6 w-6 mx-auto mb-2 text-primary"/>
                    <p className="text-2xl font-bold">{selectedClient?.averageRating.toFixed(1) || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">Avg. Rating</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                    <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary"/>
                    <p className="text-2xl font-bold">{formatCurrency(selectedClient?.totalRevenue || 0)}</p>
                    <p className="text-xs text-muted-foreground">Total Revenue</p>
                </div>
            </div>
            <div className="space-y-4 max-h-[40vh] overflow-y-auto">
                <div>
                    <h3 className="font-semibold mb-2">Active Projects ({selectedClient?.activeProjects})</h3>
                    <div className="space-y-2">
                        {selectedClient?.projects.filter(p => p.status !== 'Completed' && p.status !== 'Canceled').map(p => (
                            <LoadingLink href={`/dashboard/projects/${p.id}`} key={p.id} className="block p-2 border rounded-md hover:bg-secondary">
                                <div className="flex justify-between items-center">
                                    <p className="font-medium">{p.name}</p>
                                    <Badge variant="secondary">{p.status}</Badge>
                                </div>
                            </LoadingLink>
                        ))}
                    </div>
                </div>
                 <div>
                    <h3 className="font-semibold mb-2">Completed Projects ({selectedClient?.completedProjects})</h3>
                    <div className="space-y-2">
                         {selectedClient?.projects.filter(p => p.status === 'Completed').map(p => (
                             <LoadingLink href={`/dashboard/projects/${p.id}`} key={p.id} className="block p-2 border rounded-md hover:bg-secondary">
                                <p className="font-medium">{p.name}</p>
                            </LoadingLink>
                         ))}
                    </div>
                </div>
            </div>
        </DialogContent>
    </Dialog>
    </>
  );
}
