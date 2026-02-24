import dotenv from 'dotenv';

dotenv.config();

const required = ['GOOGLE_CLIENT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_SHEET_ID', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    console.warn(`Missing environment variable: ${key}`);
  }
}

export const env = {
  port: process.env.PORT || 4000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  googleClientEmail: process.env.GOOGLE_CLIENT_EMAIL,
  googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  googleSheetId: process.env.GOOGLE_SHEET_ID,
  googleDriveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
  jwtSecret: process.env.JWT_SECRET || 'local-secret',
  oauthClientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
  oauthClientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  oauthRedirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI,
  squareAccessToken: process.env.SQUARE_ACCESS_TOKEN,
  squareEnvironment: process.env.SQUARE_ENVIRONMENT || 'sandbox',
  paypalClientId: process.env.PAYPAL_CLIENT_ID,
  paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET,
  paypalBaseUrl: process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com'
};
