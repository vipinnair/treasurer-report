import { Router } from 'express';
import dayjs from 'dayjs';
import PDFDocument from 'pdfkit';
import { stringify } from 'csv-stringify/sync';
import { requireAuth } from '../middleware/auth.js';
import { listRows, SHEETS } from '../services/sheetService.js';

const router = Router();

function withinYear(date, year) {
  return dayjs(date).year() === Number(year);
}

async function gather(year) {
  const income = (await listRows(SHEETS.income)).filter((r) => withinYear(r.date, year));
  const sponsorship = (await listRows(SHEETS.sponsorship)).filter((r) => withinYear(r.paymentDate, year));
  const expenses = (await listRows(SHEETS.expenses)).filter((r) => withinYear(r.date, year));
  return { income, sponsorship, expenses };
}

router.get('/event/:eventName/pdf', requireAuth(), async (req, res) => {
  const { year = dayjs().year() } = req.query;
  const eventName = req.params.eventName;
  const { income, sponsorship, expenses } = await gather(year);
  const i = income.filter((r) => r.event === eventName);
  const s = sponsorship.filter((r) => r.event === eventName);
  const e = expenses.filter((r) => r.event === eventName);
  const sum = (rows) => rows.reduce((a, r) => a + Number(r.amount || 0), 0);

  res.setHeader('Content-Type', 'application/pdf');
  const doc = new PDFDocument();
  doc.pipe(res);
  doc.fontSize(18).text(`Event Report: ${eventName} (${year})`);
  doc.moveDown();
  doc.fontSize(12).text(`Event Income: $${sum(i).toFixed(2)}`);
  doc.text(`Event Sponsorship: $${sum(s).toFixed(2)}`);
  doc.text(`Event Expenses: $${sum(e).toFixed(2)}`);
  doc.text(`Net Result: $${(sum(i) + sum(s) - sum(e)).toFixed(2)}`);
  doc.end();
});

router.get('/monthly/:year/:month/csv', requireAuth(), async (req, res) => {
  const { year, month } = req.params;
  const { income, sponsorship, expenses } = await gather(year);
  const inMonth = (date) => dayjs(date).month() + 1 === Number(month);
  const lines = [
    ...income.filter((r) => inMonth(r.date)).map((r) => ({ type: 'income', category: r.incomeType, amount: r.amount, date: r.date })),
    ...sponsorship.filter((r) => inMonth(r.paymentDate)).map((r) => ({ type: 'sponsorship', category: r.type, amount: r.amount, date: r.paymentDate })),
    ...expenses.filter((r) => inMonth(r.date)).map((r) => ({ type: 'expense', category: r.category, amount: r.amount, date: r.date }))
  ];
  const csv = stringify(lines, { header: true });
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=monthly-report-${year}-${month}.csv`);
  res.send(csv);
});

router.get('/annual/:year/pdf', requireAuth(), async (req, res) => {
  const { year } = req.params;
  const { income, sponsorship, expenses } = await gather(year);
  const sum = (rows) => rows.reduce((a, r) => a + Number(r.amount || 0), 0);

  res.setHeader('Content-Type', 'application/pdf');
  const doc = new PDFDocument();
  doc.pipe(res);
  doc.fontSize(18).text(`Annual Treasurer Report (${year})`);
  doc.moveDown();
  doc.fontSize(12).text(`Full-year Income: $${sum(income).toFixed(2)}`);
  doc.text(`Full-year Sponsorship: $${sum(sponsorship).toFixed(2)}`);
  doc.text(`Full-year Expenses: $${sum(expenses).toFixed(2)}`);
  doc.text(`Surplus/Deficit: $${(sum(income) + sum(sponsorship) - sum(expenses)).toFixed(2)}`);
  doc.end();
});

export default router;
