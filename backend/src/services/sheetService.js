import dayjs from 'dayjs';
import { env } from '../config/env.js';
import { sheetsClient } from './googleClient.js';

export const SHEETS = {
  income: 'Income',
  sponsorship: 'Sponsorship',
  expenses: 'Expenses',
  reimbursements: 'Reimbursements',
  transactions: 'Transactions',
  events: 'Events',
  users: 'Users'
};

const headerMap = {
  [SHEETS.income]: ['id', 'incomeType', 'event', 'amount', 'date', 'paymentMethod', 'notes', 'createdAt'],
  [SHEETS.sponsorship]: ['id', 'type', 'sponsorName', 'amount', 'event', 'paymentMethod', 'paymentDate', 'status', 'notes', 'createdAt'],
  [SHEETS.expenses]: ['id', 'type', 'event', 'paidByType', 'paidByName', 'amount', 'category', 'date', 'notes', 'receiptUrl', 'reimbursementStatus', 'createdAt'],
  [SHEETS.reimbursements]: ['id', 'expenseId', 'boardMember', 'amount', 'status', 'submittedDate', 'approvedDate', 'reimbursedDate', 'notes'],
  [SHEETS.transactions]: ['id', 'provider', 'providerTransactionId', 'amount', 'currency', 'transactionDate', 'payer', 'tag', 'rawJson', 'importedAt'],
  [SHEETS.events]: ['id', 'name', 'startDate', 'endDate', 'notes'],
  [SHEETS.users]: ['email', 'role', 'displayName']
};

const getRange = (sheet) => `${sheet}!A:Z`;

export async function ensureHeaders(sheet) {
  const values = await readSheet(sheet);
  if (!values.length) {
    await sheetsClient.spreadsheets.values.update({
      spreadsheetId: env.googleSheetId,
      range: `${sheet}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [headerMap[sheet]] }
    });
  }
}

export async function readSheet(sheet) {
  const result = await sheetsClient.spreadsheets.values.get({ spreadsheetId: env.googleSheetId, range: getRange(sheet) });
  return result.data.values || [];
}

export async function listRows(sheet) {
  await ensureHeaders(sheet);
  const values = await readSheet(sheet);
  const [header, ...rows] = values;
  return rows.map((row) => Object.fromEntries(header.map((key, i) => [key, row[i] || ''])));
}

export async function appendRow(sheet, payload) {
  await ensureHeaders(sheet);
  const headers = headerMap[sheet];
  const normalized = headers.map((key) => payload[key] ?? '');
  await sheetsClient.spreadsheets.values.append({
    spreadsheetId: env.googleSheetId,
    range: `${sheet}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [normalized] }
  });
  return payload;
}

export async function updateRowById(sheet, id, payload) {
  const values = await readSheet(sheet);
  const [headers, ...rows] = values;
  const index = rows.findIndex((row) => row[0] === id);
  if (index < 0) return null;
  const rowNumber = index + 2;
  const merged = Object.fromEntries(headers.map((key, i) => [key, payload[key] ?? rows[index][i] ?? '']));
  await sheetsClient.spreadsheets.values.update({
    spreadsheetId: env.googleSheetId,
    range: `${sheet}!A${rowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [headers.map((h) => merged[h] ?? '')] }
  });
  return merged;
}

export async function deleteRowById(sheet, id) {
  const values = await readSheet(sheet);
  const [headers, ...rows] = values;
  const keep = rows.filter((row) => row[0] !== id);
  await sheetsClient.spreadsheets.values.clear({ spreadsheetId: env.googleSheetId, range: `${sheet}!A2:Z` });
  if (keep.length) {
    await sheetsClient.spreadsheets.values.update({
      spreadsheetId: env.googleSheetId,
      range: `${sheet}!A2`,
      valueInputOption: 'RAW',
      requestBody: { values: keep.map((row) => headers.map((h, i) => row[i] || '')) }
    });
  }
  return true;
}

export const uid = () => `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
export const now = () => dayjs().format('YYYY-MM-DD HH:mm:ss');
