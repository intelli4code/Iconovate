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
import { mockProjects } from "@/lib/data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Client {
  name: string;
  projectCount: number;
  activeProjects: number;
}

export function ClientList() {
  const [clients, setClients] = React.useState<Client[]>([]);

  React.useEffect(() => {
    const clientMap = new Map<string, { projectCount: number; activeProjects: number }>();
    mockProjects.forEach(project => {
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
    
    setClients(clientList);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Clients</CardTitle>
        <CardDescription>
          A list of all clients you have worked with.
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
            {clients.map((client) => (
              <TableRow key={client.name}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 hidden sm:flex">
                        <AvatarFallback>{client.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{client.name}</div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {client.projectCount}
                </TableCell>
                <TableCell className="text-right">
                  {client.activeProjects}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
