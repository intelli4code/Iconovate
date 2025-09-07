

"use client"

import * as React from "react"
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, arrayUnion, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { LoadingLink } from "@/components/ui/loading-link"
import { format } from 'date-fns'
import { sendInvoiceByEmail } from '@/app/actions/send-invoice-action';
import { v4 as uuidv4 } from 'uuid';


import type { Invoice, InvoiceStatus, Notification } from "@/types"
import { useToast } from "@/hooks/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Loader2, PlusCircle, CheckCircle, Clock, Send, Mail, Edit } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog"
import { InvoiceGeneratorForm } from "../invoice-generator-form"
import { Dialog, DialogContent } from "../ui/dialog"

const statusStyles: { [key in InvoiceStatus]: string } = {
  'Draft': 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300 border-gray-300',
  'Sent': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300',
  'Paid': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300',
  'Overdue': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300',
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function InvoiceList() {
  const [invoices, setInvoices] = React.useState<Invoice[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isSending, setIsSending] = React.useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [editingInvoice, setEditingInvoice] = React.useState<Invoice | null>(null);

  const { toast } = useToast()

  React.useEffect(() => {
    setLoading(true)
    const invoicesRef = collection(db, "invoices")
    const q = query(invoicesRef, orderBy("createdAt", "desc"))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const invoicesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt || new Date(), // Fallback for missing timestamps
      })).filter(invoice => invoice.id) as Invoice[]; // Ensure invoice has an ID
      setInvoices(invoicesData)
      setLoading(false)
    }, (error) => {
      console.error("Error fetching invoices: ", error)
      setLoading(false)
      toast({
        variant: "destructive",
        title: "Failed to load invoices",
        description: "Could not fetch invoice data from the database.",
      })
    })

    return () => unsubscribe()
  }, [toast])
  
  const handleUpdateStatus = async (invoiceId: string, status: InvoiceStatus) => {
    const invoiceRef = doc(db, "invoices", invoiceId);
    try {
        await updateDoc(invoiceRef, { status: status });
        toast({
            title: "Invoice Updated",
            description: `Invoice has been marked as ${status}.`,
            action: <CheckCircle className="text-green-500"/>
        });
    } catch (error) {
        console.error("Error updating invoice status:", error);
        toast({ variant: "destructive", title: "Update Failed"});
    }
  }

  const handleSendToClient = async (invoice: Invoice) => {
    const invoiceRef = doc(db, "invoices", invoice.id);
    const projectRef = doc(db, "projects", invoice.projectId);

    const notification: Notification = {
      id: uuidv4(),
      text: `A new invoice (${invoice.invoiceNumber}) has been issued for your project.`,
      timestamp: new Date().toISOString(),
    };

    try {
      await updateDoc(invoiceRef, { status: 'Sent' });
      await updateDoc(projectRef, { notifications: arrayUnion(notification) });
      toast({ title: "Invoice Sent!", description: "The invoice is now visible to the client." });
    } catch (error) {
      console.error("Error sending invoice to client:", error);
      toast({ variant: "destructive", title: "Failed to Send" });
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
     const invoiceRef = doc(db, "invoices", invoiceId);
     try {
        await deleteDoc(invoiceRef);
        toast({ title: "Invoice Deleted" });
     } catch (error) {
        console.error("Error deleting invoice:", error);
        toast({ variant: "destructive", title: "Deletion Failed"});
     }
  }

  const handleSendEmail = async (invoice: Invoice) => {
    setIsSending(invoice.id);
    try {
        if (invoice.status === 'Draft') {
            const invoiceRef = doc(db, "invoices", invoice.id);
            await updateDoc(invoiceRef, { status: 'Sent' });
        }
        
        const result = await sendInvoiceByEmail(invoice);
        
        if (result.success) {
            toast({
                title: "Email Sent!",
                description: result.message,
            });
        } else {
            toast({
                variant: "destructive",
                title: "Send Failed",
                description: result.error,
            });
        }
    } catch (error: any) {
        console.error('Email send error:', error);
        toast({
            variant: "destructive",
            title: "Send Failed",
            description: "An unexpected error occurred while sending the invoice.",
        });
    } finally {
        setIsSending(null);
    }
  };
  
  const handleEditOpen = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsEditDialogOpen(true);
  };

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>All Invoices</CardTitle>
                <CardDescription>A list of all your generated invoices.</CardDescription>
            </div>
            <Button asChild>
                <LoadingLink href="/dashboard/invoice-generator">
                    <PlusCircle className="mr-2"/> Create Invoice
                </LoadingLink>
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead className="hidden sm:table-cell">Due Date</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  <div className="flex justify-center items-center p-4">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading invoices...
                  </div>
                </TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono text-xs">
                    {invoice.invoiceNumber}
                  </TableCell>
                  <TableCell className="font-medium">{invoice.clientName}</TableCell>
                  <TableCell className="hidden sm:table-cell">{format(new Date(invoice.dueDate), 'PP')}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className={statusStyles[invoice.status]}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(invoice.total)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          {isSending === invoice.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => handleEditOpen(invoice)}>
                           <Edit className="mr-2 h-4 w-4"/> Edit Invoice
                        </DropdownMenuItem>
                         {invoice.status === 'Draft' && (
                           <DropdownMenuItem onSelect={() => handleSendToClient(invoice)}>
                             <Send className="mr-2 h-4 w-4" /> Send to Client
                           </DropdownMenuItem>
                         )}
                        <DropdownMenuItem onSelect={() => handleSendEmail(invoice)} disabled={isSending === invoice.id}>
                            <Mail className="mr-2 h-4 w-4"/> Send as Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => handleUpdateStatus(invoice.id, 'Paid')} disabled={invoice.status === 'Paid'}>
                          Mark as Paid
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleUpdateStatus(invoice.id, 'Sent')} disabled={invoice.status === 'Sent'}>
                          Mark as Sent
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleUpdateStatus(invoice.id, 'Overdue')} disabled={invoice.status === 'Overdue'}>
                          Mark as Overdue
                        </DropdownMenuItem>
                         <DropdownMenuSeparator />
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">Delete</DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete this invoice. This action cannot be undone.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteInvoice(invoice.id)} className="bg-destructive hover:bg-destructive/90">Delete Invoice</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

     <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-7xl">
           <InvoiceGeneratorForm 
              editingInvoice={editingInvoice}
              onClose={() => setIsEditDialogOpen(false)}
           />
        </DialogContent>
      </Dialog>
    </>
  )
}
