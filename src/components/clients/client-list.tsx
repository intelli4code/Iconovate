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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query } from "firebase/firestore"
import type { Project } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { LoadingLink } from "@/components/ui/loading-link"

interface Client {
  name: string;
  projectCount: number;
  activeProjects: number;
}

export function ClientList() {
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    setLoading(true);
    const projectsRef = collection(db, "projects");
    const q = query(projectsRef);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const projectsData = querySnapshot.docs.map(doc => doc.data()) as Project[];
      
      const clientMap = new Map<string, { projectCount: number; activeProjects: number }>();
      projectsData.forEach(project => {
        if (!project.client) return; // Guard against projects without a client
        
        if (!clientMap.has(project.client)) {
          clientMap.set(project.client, { projectCount: 0, activeProjects: 0 });
        }
        
        const clientData = clientMap.get(project.client)!;
        clientData.projectCount++;
        if (project.status === 'In Progress' || project.status === 'Pending Feedback') {
          clientData.activeProjects++;
        }
      });

      const clientList: Client[] = Array.from(clientMap.entries()).map(([name, data]) => ({
        name,
        ...data,
      }));
      
      setClients(clientList.sort((a, b) => b.projectCount - a.projectCount)); // Sort by project count
      setLoading(false);
    }, (error) => {
      console.error("Error fetching projects for client list: ", error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Failed to load clients",
        description: "Could not fetch data from the database.",
      });
    });

    return () => unsubscribe();
  }, [toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Clients</CardTitle>
        <CardDescription>
          A list of all clients you have worked with, based on your projects.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client Name</TableHead>
              <TableHead className="hidden sm:table-cell">Total Projects</TableHead>
              <TableHead className="text-right">Active Projects</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  <div className="flex justify-center items-center p-4">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading clients...
                  </div>
                </TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                 <TableCell colSpan={3} className="text-center h-24">
                    No clients found. Add a project to see clients here.
                  </TableCell>
              </TableRow>
            ) : (
              clients.map((client) => (
                <TableRow key={client.name}>
                  <TableCell>
                    <LoadingLink href={`/dashboard/clients/${encodeURIComponent(client.name)}`} className="flex items-center gap-3 group">
                      <Avatar className="h-9 w-9 hidden sm:flex">
                          <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium group-hover:underline">{client.name}</div>
                    </LoadingLink>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {client.projectCount}
                  </TableCell>
                  <TableCell className="text-right">
                    {client.activeProjects}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
