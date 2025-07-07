"use client"

import * as React from "react"
import { collection, onSnapshot, query, orderBy, doc, updateDoc, writeBatch } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { format } from 'date-fns'

import type { Payment, PaymentStatus } from "@/types"
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
import { Loader2, CheckCircle, XCircle } from "lucide-react"

const statusStyles: { [key in PaymentStatus]: string } = {
  'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-300',
  'Approved': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-300',
  'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-300',
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function PaymentList() {
  const [payments, setPayments] = React.useState<Payment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const { toast } = useToast()

  React.useEffect(() => {
    setLoading(true)
    const paymentsRef = collection(db, "payments")
    const q = query(paymentsRef, orderBy("requestedAt", "desc"))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const paymentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Payment[]
      setPayments(paymentsData)
      setLoading(false)
    }, (error) => {
      console.error("Error fetching payments: ", error)
      setLoading(false)
      toast({
        variant: "destructive",
        title: "Failed to load payments",
        description: "Could not fetch payment data from the database.",
      })
    })

    return () => unsubscribe()
  }, [toast])
  
  const handleUpdateStatus = async (payment: Payment, newStatus: PaymentStatus) => {
    setUpdatingId(payment.id);
    const batch = writeBatch(db);

    const paymentRef = doc(db, "payments", payment.id);
    batch.update(paymentRef, { status: newStatus, reviewedAt: new Date().toISOString() });

    if (newStatus === 'Approved') {
        const invoiceRef = doc(db, "invoices", payment.invoiceId);
        batch.update(invoiceRef, { status: 'Paid' });

        const projectRef = doc(db, "projects", payment.projectId);
        batch.update(projectRef, { paymentStatus: 'Paid' });
    }
    
    try {
        await batch.commit();
        toast({
            title: `Payment ${newStatus}`,
            description: `The payment has been marked as ${newStatus}.`,
            action: <CheckCircle className="text-green-500"/>
        });
    } catch (error) {
        console.error("Error updating payment status:", error);
        toast({ variant: "destructive", title: "Update Failed"});
    } finally {
        setUpdatingId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Payment Requests</CardTitle>
        <CardDescription>A list of all payment notifications from clients.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead className="hidden sm:table-cell">Project</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  <div className="flex justify-center items-center p-4">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading payments...
                  </div>
                </TableCell>
              </TableRow>
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No payment requests found.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.clientName}</TableCell>
                   <TableCell className="hidden sm:table-cell">{payment.projectName}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className={statusStyles[payment.status]}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{payment.reference}</TableCell>
                  <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell className="text-right">
                    {updatingId === payment.id ? (
                        <Loader2 className="h-4 w-4 animate-spin ml-auto"/>
                    ) : payment.status === 'Pending' ? (
                        <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(payment, 'Approved')}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />Approve
                            </Button>
                             <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(payment, 'Rejected')}>
                                <XCircle className="mr-2 h-4 w-4 text-red-500" />Reject
                            </Button>
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground">{payment.reviewedAt ? `Reviewed ${format(new Date(payment.reviewedAt), 'PP')}` : 'Reviewed'}</p>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
