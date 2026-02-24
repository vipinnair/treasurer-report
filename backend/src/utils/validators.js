import { z } from 'zod';

export const sponsorshipSchema = z.object({
  type: z.enum(['Annual', 'Event']),
  sponsorName: z.string().min(2),
  amount: z.coerce.number().positive(),
  event: z.string().optional().default(''),
  paymentMethod: z.string().min(2),
  paymentDate: z.string(),
  status: z.enum(['Paid', 'Pending']),
  notes: z.string().optional().default('')
});

export const incomeSchema = z.object({
  incomeType: z.enum(['Membership', 'Guest Fee', 'Event Entry', 'Other']),
  event: z.string().optional().default(''),
  amount: z.coerce.number().positive(),
  date: z.string(),
  paymentMethod: z.string(),
  notes: z.string().optional().default('')
});

export const expenseSchema = z.object({
  type: z.enum(['General', 'Event']),
  event: z.string().optional().default(''),
  paidByType: z.enum(['Organization', 'Individual']),
  paidByName: z.string().optional().default(''),
  amount: z.coerce.number().positive(),
  category: z.string(),
  date: z.string(),
  notes: z.string().optional().default(''),
  reimbursementStatus: z.enum(['Pending', 'Approved', 'Reimbursed']).default('Pending')
});
