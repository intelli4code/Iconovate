'use server';

/**
 * @fileOverview An AI-powered invoice data generator.
 *
 * - generateInvoiceData - A function that structures and calculates invoice details.
 * - InvoiceGeneratorInput - The input type for the function.
 * - InvoiceGeneratorOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { format } from 'date-fns';

const LineItemSchema = z.object({
  description: z.string().describe('A description of the service or product.'),
  quantity: z.coerce.number().describe('The quantity of the item.'),
  price: z.coerce.number().describe('The price per unit of the item.'),
});

const InvoiceGeneratorInputSchema = z.object({
  clientName: z.string().describe('The name of the client being invoiced.'),
  clientAddress: z.string().describe('The full address of the client.'),
  projectName: z.string().describe('The name of the project this invoice is for.'),
  lineItems: z.array(LineItemSchema).describe('A list of billable items.'),
  taxRate: z.coerce.number().optional().default(0).describe('The tax rate as a percentage (e.g., 5 for 5%).'),
  notes: z.string().optional().describe('Any additional notes for the client.'),
});
export type InvoiceGeneratorInput = z.infer<typeof InvoiceGeneratorInputSchema>;

const InvoiceGeneratorOutputSchema = z.object({
  invoiceNumber: z.string().describe('A unique invoice number.'),
  issueDate: z.string().describe('The date the invoice was issued.'),
  dueDate: z.string().describe('The date the invoice is due.'),
  fromName: z.string().describe('The name of the sender.'),
  fromAddress: z.string().describe('The address of the sender.'),
  toName: z.string().describe('The name of the recipient (client).'),
  toAddress: z.string().describe('The address of the recipient (client).'),
  lineItems: z.array(LineItemSchema.extend({ total: z.number() })).describe('The list of billable items with their calculated totals.'),
  subtotal: z.number().describe('The total amount before tax.'),
  taxAmount: z.number().describe('The calculated tax amount.'),
  total: z.number().describe('The final total amount due.'),
  notes: z.string().optional().describe('Additional notes for the client.'),
});
export type InvoiceGeneratorOutput = z.infer<typeof InvoiceGeneratorOutputSchema>;

export async function generateInvoiceData(input: InvoiceGeneratorInput): Promise<InvoiceGeneratorOutput> {
  return invoiceGeneratorFlow(input);
}

const invoiceGeneratorFlow = ai.defineFlow(
  {
    name: 'invoiceGeneratorFlow',
    inputSchema: InvoiceGeneratorInputSchema,
    outputSchema: InvoiceGeneratorOutputSchema,
  },
  async (input) => {
    const subtotal = input.lineItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
    const taxAmount = subtotal * (input.taxRate / 100);
    const total = subtotal + taxAmount;

    const lineItemsWithTotals = input.lineItems.map(item => ({
        ...item,
        total: item.quantity * item.price
    }));

    const currentDate = new Date();

    return {
      invoiceNumber: `INV-${Date.now()}`,
      issueDate: format(currentDate, 'yyyy-MM-dd'),
      dueDate: format(new Date(currentDate.setDate(currentDate.getDate() + 30)), 'yyyy-MM-dd'),
      fromName: 'BrandBoost AI',
      fromAddress: '123 Creative Lane, Design City, DC 12345',
      toName: input.clientName,
      toAddress: input.clientAddress,
      lineItems: lineItemsWithTotals,
      subtotal,
      taxAmount,
      total,
      notes: input.notes,
    };
  }
);
