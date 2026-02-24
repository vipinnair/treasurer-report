import { Router } from 'express';
import dayjs from 'dayjs';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { uploadReceipt } from '../services/driveService.js';
import { appendRow, deleteRowById, listRows, now, SHEETS, uid, updateRowById } from '../services/sheetService.js';
import { expenseSchema, incomeSchema, sponsorshipSchema } from '../utils/validators.js';

const router = Router();
const upload = multer();

function crud(sheet, schema) {
  router.get(`/${sheet}`, requireAuth(), async (_req, res) => res.json(await listRows(SHEETS[sheet])));

  router.post(`/${sheet}`, requireAuth(['admin', 'treasurer']), async (req, res) => {
    const data = schema.parse(req.body);
    const record = { id: uid(), ...data, amount: String(data.amount), createdAt: now() };
    await appendRow(SHEETS[sheet], record);
    res.status(201).json(record);
  });

  router.put(`/${sheet}/:id`, requireAuth(['admin', 'treasurer']), async (req, res) => {
    const data = schema.partial().parse(req.body);
    const updated = await updateRowById(SHEETS[sheet], req.params.id, data);
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  });

  router.delete(`/${sheet}/:id`, requireAuth(['admin', 'treasurer']), async (req, res) => {
    await deleteRowById(SHEETS[sheet], req.params.id);
    res.json({ success: true });
  });
}

crud('income', incomeSchema);
crud('sponsorship', sponsorshipSchema);

router.get('/expenses', requireAuth(), async (_req, res) => res.json(await listRows(SHEETS.expenses)));
router.post('/expenses', requireAuth(['admin', 'treasurer']), upload.single('receipt'), async (req, res) => {
  const data = expenseSchema.parse(req.body);
  let receiptUrl = '';
  if (req.file) receiptUrl = await uploadReceipt(req.file);
  const expense = { id: uid(), ...data, amount: String(data.amount), receiptUrl, createdAt: now() };
  await appendRow(SHEETS.expenses, expense);

  if (expense.paidByType === 'Individual') {
    await appendRow(SHEETS.reimbursements, {
      id: uid(),
      expenseId: expense.id,
      boardMember: expense.paidByName,
      amount: expense.amount,
      status: expense.reimbursementStatus,
      submittedDate: expense.date,
      approvedDate: '',
      reimbursedDate: '',
      notes: expense.notes
    });
  }
  res.status(201).json(expense);
});

router.put('/expenses/:id', requireAuth(['admin', 'treasurer']), async (req, res) => {
  const data = expenseSchema.partial().parse(req.body);
  const updated = await updateRowById(SHEETS.expenses, req.params.id, data);
  if (!updated) return res.status(404).json({ message: 'Not found' });
  res.json(updated);
});

router.get('/reimbursements', requireAuth(), async (req, res) => {
  const records = await listRows(SHEETS.reimbursements);
  const { event } = req.query;
  if (!event) return res.json(records);
  const expenses = await listRows(SHEETS.expenses);
  const filtered = records.filter((r) => expenses.find((e) => e.id === r.expenseId && e.event === event));
  res.json(filtered);
});

router.patch('/reimbursements/:id/status', requireAuth(['admin', 'treasurer']), async (req, res) => {
  const status = req.body.status;
  const updates = { status };
  if (status === 'Approved') updates.approvedDate = dayjs().format('YYYY-MM-DD');
  if (status === 'Reimbursed') updates.reimbursedDate = dayjs().format('YYYY-MM-DD');
  const updated = await updateRowById(SHEETS.reimbursements, req.params.id, updates);
  res.json(updated);
});

router.get('/dashboard', requireAuth(), async (req, res) => {
  const yearStart = dayjs(req.query.start || dayjs().startOf('year'));
  const yearEnd = dayjs(req.query.end || dayjs().endOf('year'));
  const eventFilter = req.query.event;

  const income = await listRows(SHEETS.income);
  const sponsorship = await listRows(SHEETS.sponsorship);
  const expenses = await listRows(SHEETS.expenses);
  const reimbursements = await listRows(SHEETS.reimbursements);

  const inRange = (d) => dayjs(d).isAfter(yearStart.subtract(1, 'day')) && dayjs(d).isBefore(yearEnd.add(1, 'day'));
  const eventMatch = (row) => !eventFilter || row.event === eventFilter;
  const sum = (rows) => rows.reduce((acc, row) => acc + Number(row.amount || 0), 0);

  const incomeRows = income.filter((r) => inRange(r.date) && eventMatch(r));
  const sponsorshipRows = sponsorship.filter((r) => inRange(r.paymentDate) && eventMatch(r));
  const expenseRows = expenses.filter((r) => inRange(r.date) && eventMatch(r));

  const monthly = [...Array(12)].map((_, i) => {
    const month = i + 1;
    return {
      month,
      income: sum(incomeRows.filter((r) => dayjs(r.date).month() + 1 === month)) + sum(sponsorshipRows.filter((r) => dayjs(r.paymentDate).month() + 1 === month)),
      expenses: sum(expenseRows.filter((r) => dayjs(r.date).month() + 1 === month))
    };
  });

  const events = [...new Set([...incomeRows.map((r) => r.event), ...sponsorshipRows.map((r) => r.event), ...expenseRows.map((r) => r.event)].filter(Boolean))];
  const eventSummary = events.map((event) => ({
    event,
    income: sum(incomeRows.filter((r) => r.event === event)),
    sponsorship: sum(sponsorshipRows.filter((r) => r.event === event)),
    expenses: sum(expenseRows.filter((r) => r.event === event))
  }));

  const outstanding = reimbursements.filter((r) => r.status !== 'Reimbursed').reduce((acc, r) => acc + Number(r.amount || 0), 0);

  const totalIncome = sum(incomeRows);
  const totalSponsorship = sum(sponsorshipRows);
  const totalExpenses = sum(expenseRows);

  res.json({
    totalIncome,
    totalSponsorship,
    totalExpenses,
    net: totalIncome + totalSponsorship - totalExpenses,
    outstandingReimbursements: outstanding,
    monthly,
    eventSummary
  });
});

export default router;
