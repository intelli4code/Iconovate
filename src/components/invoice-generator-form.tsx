"use client";

import { useState } from 'react';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateInvoiceData, type InvoiceGeneratorInput, type InvoiceGeneratorOutput } from '@/ai/flows/invoice-generator';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, FileText, Plus, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Separator } from './ui/separator';

const LineItemSchema = z.object({
  description: z.string().min(1, "Description is required."),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1."),
  price: z.coerce.number().min(0, "Price cannot be negative."),
});

const FormSchema = z.object({
  clientName: z.string().min(2, "Client name is required."),
  clientAddress: z.string().min(5, "Client address is required."),
  projectName: z.string().min(2, "Project name is required."),
  lineItems: z.array(LineItemSchema).min(1, "At least one line item is required."),
  taxRate: z.coerce.number().optional().default(0),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

export function InvoiceGeneratorForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InvoiceGeneratorOutput | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
        lineItems: [{ description: "", quantity: 1, price: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems"
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    setResult(null);
    try {
      const response = await generateInvoiceData(data as InvoiceGeneratorInput);
      setResult(response);
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate the invoice data. Please check your inputs.",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
          <CardDescription>Fill in the details to generate an invoice.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="clientName">Client Name</Label>
              <Input id="clientName" {...register('clientName')} placeholder="e.g., Aether-Core Dynamics" />
              {errors.clientName && <p className="text-sm text-destructive mt-1">{errors.clientName.message}</p>}
            </div>
             <div>
              <Label htmlFor="clientAddress">Client Address</Label>
              <Textarea id="clientAddress" {...register('clientAddress')} placeholder="123 Tech Avenue, Silicon Valley, CA 94043" />
              {errors.clientAddress && <p className="text-sm text-destructive mt-1">{errors.clientAddress.message}</p>}
            </div>
            <div>
              <Label htmlFor="projectName">Project Name</Label>
              <Input id="projectName" {...register('projectName')} placeholder="e.g., Q3 Rebranding" />
              {errors.projectName && <p className="text-sm text-destructive mt-1">{errors.projectName.message}</p>}
            </div>
            
            <Separator />
            
            <div className="space-y-2">
                <Label>Line Items</Label>
                {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-start p-2 border rounded-md">
                        <div className="flex-1">
                          <Textarea {...register(`lineItems.${index}.description`)} placeholder="Description" className="h-10 text-xs" />
                          {errors.lineItems?.[index]?.description && <p className="text-xs text-destructive mt-1">{errors.lineItems[index]?.description?.message}</p>}
                        </div>
                        <div className="w-20">
                          <Input {...register(`lineItems.${index}.quantity`)} type="number" placeholder="Qty" className="text-xs" />
                          {errors.lineItems?.[index]?.quantity && <p className="text-xs text-destructive mt-1">{errors.lineItems[index]?.quantity?.message}</p>}
                        </div>
                         <div className="w-24">
                          <Input {...register(`lineItems.${index}.price`)} type="number" step="0.01" placeholder="Price" className="text-xs" />
                           {errors.lineItems?.[index]?.price && <p className="text-xs text-destructive mt-1">{errors.lineItems[index]?.price?.message}</p>}
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="h-10 w-10 shrink-0" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => append({ description: "", quantity: 1, price: 0 })}>
                    <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
                {errors.lineItems && <p className="text-sm text-destructive mt-1">{errors.lineItems.message}</p>}
            </div>

            <Separator />

            <div>
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input id="taxRate" type="number" {...register('taxRate')} placeholder="e.g., 8.5" />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" {...register('notes')} placeholder="e.g., Thank you for your business!" />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Generate Invoice
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Generated Invoice</CardTitle>
          <CardDescription>Your generated invoice will appear here, ready to be sent.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Calculating totals and generating invoice...</p>
            </div>
          )}
          {result ? (
            <div className="border rounded-lg p-6 space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold font-headline text-primary">INVOICE</h2>
                        <p className="text-muted-foreground">Invoice #: {result.invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="font-bold text-lg">{result.fromName}</h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{result.fromAddress}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label className="font-bold">Bill To</Label>
                        <p>{result.toName}</p>
                        <p className="text-muted-foreground text-sm whitespace-pre-line">{result.toAddress}</p>
                    </div>
                    <div className="text-right">
                        <p><span className="font-bold">Issue Date:</span> {result.issueDate}</p>
                        <p><span className="font-bold">Due Date:</span> {result.dueDate}</p>
                    </div>
                </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.lineItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={3} className="text-right font-bold">Subtotal</TableCell>
                        <TableCell className="text-right">{formatCurrency(result.subtotal)}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={3} className="text-right font-bold">Tax</TableCell>
                        <TableCell className="text-right">{formatCurrency(result.taxAmount)}</TableCell>
                    </TableRow>
                    <TableRow className="text-lg font-bold">
                        <TableCell colSpan={3} className="text-right">Total</TableCell>
                        <TableCell className="text-right">{formatCurrency(result.total)}</TableCell>
                    </TableRow>
                </TableFooter>
              </Table>
              {result.notes && (
                <div>
                    <Label className="font-bold">Notes</Label>
                    <p className="text-sm text-muted-foreground">{result.notes}</p>
                </div>
              )}
            </div>
          ) : !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground bg-secondary/30 rounded-lg p-8">
              <FileText className="h-10 w-10 mb-4" />
              <p>Your invoice preview will be displayed here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
