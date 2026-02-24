import { google } from 'googleapis';
import { env } from '../config/env.js';

const auth = new google.auth.JWT({
  email: env.googleClientEmail,
  key: env.googlePrivateKey,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
  ]
});

export const sheetsClient = google.sheets({ version: 'v4', auth });
export const driveClient = google.drive({ version: 'v3', auth });
