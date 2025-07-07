"use client";

import { useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { Project, Invoice, TeamMember, Payment } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DownloadCloud, Loader2 } from "lucide-react";

type ExportType = 'projects' | 'invoices' | 'clients' | 'payments' | 'team';

export function ExportDataCards() {
  const [loading, setLoading] = useState<ExportType | null>(null);
  const { toast } = useToast();

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        if (typeof value === 'string') {
          return `"${value.replace(/"/g, '""')}"`;
        }
        if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
  };

  const downloadCSV = (csvString: string, filename: string) => {
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  const handleExport = async (type: ExportType) => {
    setLoading(type);
    try {
      let data: any[] = [];
      let filename = `${type}.csv`;
      
      switch (type) {
        case 'projects':
          const projectsSnapshot = await getDocs(collection(db, 'projects'));
          data = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          break;
        case 'invoices':
          const invoicesSnapshot = await getDocs(collection(db, 'invoices'));
          data = invoicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          break;
        case 'clients':
            const projectsForClients = await getDocs(collection(db, 'projects'));
            const clientMap = new Map();
            projectsForClients.forEach(doc => {
                const project = doc.data() as Project;
                if (!clientMap.has(project.client)) {
                    clientMap.set(project.client, {
                        name: project.client,
                        email: project.clientEmail || 'N/A',
                        project_count: 0
                    });
                }
                const clientData = clientMap.get(project.client);
                clientData.project_count += 1;
                if (project.clientEmail) {
                    clientData.email = project.clientEmail;
                }
            });
            data = Array.from(clientMap.values());
            break;
        case 'payments':
            const paymentsSnapshot = await getDocs(collection(db, 'payments'));
            data = paymentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            break;
        case 'team':
            const teamSnapshot = await getDocs(collection(db, 'teamMembers'));
            data = teamSnapshot.docs.map(doc => {
                const { designerKey, ...rest } = doc.data(); // Exclude sensitive keys
                return { id: doc.id, ...rest };
            });
            break;
      }
      
      if (data.length === 0) {
          toast({ title: "No Data", description: `There is no data to export for ${type}.` });
          return;
      }
      
      const csvData = convertToCSV(data);
      downloadCSV(csvData, filename);
      toast({ title: "Export Successful", description: `${filename} has been downloaded.` });

    } catch (error) {
      console.error(`Error exporting ${type}:`, error);
      toast({ variant: 'destructive', title: 'Export Failed', description: 'Could not fetch data for export.' });
    } finally {
      setLoading(null);
    }
  };

  const exportOptions: { type: ExportType, title: string, description: string }[] = [
    { type: 'projects', title: 'Projects', description: 'Export all project data, including tasks and status.' },
    { type: 'clients', title: 'Clients', description: 'Export a list of all clients and their contact info.' },
    { type: 'invoices', title: 'Invoices', description: 'Export all invoice data, including line items and totals.' },
    { type: 'payments', title: 'Payments', description: 'Export all payment confirmation records.' },
    { type: 'team', title: 'Team Members', description: 'Export a list of your team members and their roles.' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exportOptions.map(option => (
        <Card key={option.type}>
          <CardHeader>
            <CardTitle>{option.title}</CardTitle>
            <CardDescription>{option.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => handleExport(option.type)} disabled={!!loading} className="w-full">
              {loading === option.type ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <DownloadCloud className="mr-2 h-4 w-4" />
              )}
              Export {option.title}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
