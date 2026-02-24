import { Router } from 'express';
import dayjs from 'dayjs';
import { requireAuth } from '../middleware/auth.js';
import { env } from '../config/env.js';
import { appendRow, listRows, now, SHEETS, uid, updateRowById } from '../services/sheetService.js';

const router = Router();

async function importSquare() {
  const url = env.squareEnvironment === 'production' ? 'https://connect.squareup.com/v2/payments' : 'https://connect.squareupsandbox.com/v2/payments';
  const response = await fetch(url, { headers: { Authorization: `Bearer ${env.squareAccessToken}`, 'Square-Version': '2024-09-18' } });
  const data = await response.json();
  return (data.payments || []).map((p) => ({
    provider: 'Square',
    providerTransactionId: p.id,
    amount: (p.amount_money?.amount || 0) / 100,
    currency: p.amount_money?.currency || 'USD',
    transactionDate: p.created_at,
    payer: p.buyer_email_address || '',
    rawJson: JSON.stringify(p)
  }));
}

async function importPaypal() {
  const auth = Buffer.from(`${env.paypalClientId}:${env.paypalClientSecret}`).toString('base64');
  const tokenResp = await fetch(`${env.paypalBaseUrl}/v1/oauth2/token`, { method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials' });
  const tokenData = await tokenResp.json();
  const start = dayjs().subtract(30, 'day').toISOString();
  const end = dayjs().toISOString();
  const txResp = await fetch(`${env.paypalBaseUrl}/v1/reporting/transactions?start_date=${start}&end_date=${end}&fields=all`, { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
  const txData = await txResp.json();
  return (txData.transaction_details || []).map((t) => ({
    provider: 'PayPal',
    providerTransactionId: t.transaction_info.transaction_id,
    amount: t.transaction_info.transaction_amount.value,
    currency: t.transaction_info.transaction_amount.currency_code,
    transactionDate: t.transaction_info.transaction_initiation_date,
    payer: t.payer_info?.email_address || '',
    rawJson: JSON.stringify(t)
  }));
}

router.post('/sync', requireAuth(['admin', 'treasurer']), async (_req, res) => {
  const existing = await listRows(SHEETS.transactions);
  const seen = new Set(existing.map((r) => `${r.provider}-${r.providerTransactionId}`));

  const imported = [...await importSquare(), ...await importPaypal()];
  const inserted = [];
  for (const tx of imported) {
    const key = `${tx.provider}-${tx.providerTransactionId}`;
    if (seen.has(key)) continue;
    const row = { id: uid(), ...tx, tag: '', importedAt: now() };
    await appendRow(SHEETS.transactions, row);
    inserted.push(row);
  }
  res.json({ imported: inserted.length, records: inserted });
});

router.get('/transactions', requireAuth(), async (_req, res) => res.json(await listRows(SHEETS.transactions)));
router.patch('/transactions/:id/tag', requireAuth(['admin', 'treasurer']), async (req, res) => {
  const records = await listRows(SHEETS.transactions);
  const record = records.find((r) => r.id === req.params.id);
  if (!record) return res.status(404).json({ message: 'Not found' });
  const updated = await updateRowById(SHEETS.transactions, req.params.id, { tag: req.body.tag });
  res.json(updated);
});

export default router;
