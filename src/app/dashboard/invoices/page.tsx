
"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Invoice } from "@/types";
import { InvoiceList } from "@/components/invoices/invoice-list";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { LoadingLink } from "@/components/ui/loading-link";
import { PlusCircle, Loader2 } from "lucide-react";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const invoicesRef = collection(db, "invoices");
    const q = query(invoicesRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const invoicesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt || new Date(),
      })) as Invoice[];
      setInvoices(invoicesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching invoices: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const draftInvoices = invoices.filter(inv => inv.status === 'Draft');
  const sentInvoices = invoices.filter(inv => ['Sent', 'Paid', 'Overdue'].includes(inv.status));
  const deletedInvoices = invoices.filter(inv => inv.status === 'Deleted');

  return (
    <div className="space-y-8">
      <PageHeader
        title="Invoices"
        description="Manage all your client invoices."
        actions={
          <Button asChild>
            <LoadingLink href="/dashboard/invoice-generator">
              <PlusCircle className="mr-2" /> Create Invoice
            </LoadingLink>
          </Button>
        }
      />
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <InvoiceList
            title="Draft Invoices"
            description="Invoices that are not yet sent to clients."
            invoices={draftInvoices}
          />
          <InvoiceList
            title="Sent Invoices"
            description="Invoices that have been sent to clients for payment."
            invoices={sentInvoices}
          />
          <InvoiceList
            title="Archived Invoices"
            description="Deleted or archived invoices."
            invoices={deletedInvoices}
          />
        </>
      )}
    </div>
  );
}
