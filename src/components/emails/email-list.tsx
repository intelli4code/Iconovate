
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
import { db } from "@/lib/firebase"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import type { Project } from "@/types"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface EmailEntry {
  id: string;
  clientName: string;
  clientEmail: string;
  projectName: string;
}

export function EmailList() {
  const [emails, setEmails] = React.useState<EmailEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    setLoading(true);
    const projectsRef = collection(db, "projects");
    const q = query(projectsRef, where("clientEmail", "!=", ""));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const emailData = querySnapshot.docs.map(doc => {
        const project = doc.data() as Project;
        return {
          id: doc.id,
          clientName: project.client,
          clientEmail: project.clientEmail || "",
          projectName: project.name,
        }
      }).filter(p => p.clientEmail); 
      
      setEmails(emailData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching emails: ", error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Failed to load emails",
        description: "Could not fetch data from the database.",
      });
    });

    return () => unsubscribe();
  }, [toast]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Email copied to clipboard!",
      description: `${text}`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Emails</CardTitle>
        <CardDescription>
          Emails are collected when clients submit them in their portal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client Name</TableHead>
              <TableHead>Email Address</TableHead>
              <TableHead className="hidden sm:table-cell">Project</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  <div className="flex justify-center items-center p-4">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading emails...
                  </div>
                </TableCell>
              </TableRow>
            ) : emails.length === 0 ? (
              <TableRow>
                 <TableCell colSpan={4} className="text-center h-24">
                    No client emails have been collected yet.
                  </TableCell>
              </TableRow>
            ) : (
              emails.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.clientName}</TableCell>
                  <TableCell>{entry.clientEmail}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Link href={`/dashboard/projects/${entry.id}`} className="hover:underline">
                      {entry.projectName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(entry.clientEmail)}>
                        <Copy className="h-4 w-4" />
                    </Button>
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
