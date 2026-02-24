# Nonprofit Treasurer Web Application

Complete open-source treasurer system using React + Tailwind, Node.js + Express, Google Sheets (database), Google Drive (receipts), Google OAuth, Square + PayPal read-only sync, and PDF/CSV reporting.

## 1) Architecture Overview

- **Frontend (React + Vite + Tailwind)**: dashboard, data entry modules, transaction sync UI, report download UI.
- **Backend (Express)**: authenticated APIs, validation, Google integrations, payment sync, reporting exports.
- **Database**: Google Sheets (separate tabs per module).
- **File Storage**: Google Drive folder for receipt uploads.
- **Auth**: Google OAuth in frontend, ID token verification on backend, app JWT issuance.
- **RBAC**: role looked up from `Users` Google Sheet tab (`admin`, `treasurer`, `view`).
- **Hosting**: free tiers supported (Frontend: Vercel/Render static, Backend: Render/Railway).

## 2) Folder Structure

```text
backend/
  src/
    config/env.js
    middleware/auth.js
    routes/{authRoutes,financeRoutes,paymentRoutes,reportRoutes}.js
    services/{googleClient,sheetService,driveService}.js
    utils/validators.js
    server.js
frontend/
  src/
    api/client.js
    contexts/AuthContext.jsx
    components/{Layout,SimpleTable}.jsx
    hooks/useCrud.js
    pages/*.jsx
    App.jsx
    main.jsx
```

## 3) Google Sheets Schema (Tabs + Columns)

Create one spreadsheet and tabs below.

- `Income`: `id, incomeType, event, amount, date, paymentMethod, notes, createdAt`
- `Sponsorship`: `id, type, sponsorName, amount, event, paymentMethod, paymentDate, status, notes, createdAt`
- `Expenses`: `id, type, event, paidByType, paidByName, amount, category, date, notes, receiptUrl, reimbursementStatus, createdAt`
- `Reimbursements`: `id, expenseId, boardMember, amount, status, submittedDate, approvedDate, reimbursedDate, notes`
- `Transactions`: `id, provider, providerTransactionId, amount, currency, transactionDate, payer, tag, rawJson, importedAt`
- `Events`: `id, name, startDate, endDate, notes`
- `Users`: `email, role, displayName`

### Data validation logic
- `Sponsorship.type`: `Annual|Event`
- `Sponsorship.status`: `Paid|Pending`
- `Expense.type`: `General|Event`
- `Expense.paidByType`: `Organization|Individual`
- `Expense.reimbursementStatus`: `Pending|Approved|Reimbursed`
- `Income.incomeType`: `Membership|Guest Fee|Event Entry|Other`

## 4) API Endpoints

### Auth
- `POST /api/auth/google` body `{ idToken }`

### Finance
- `GET/POST/PUT/DELETE /api/finance/income`
- `GET/POST/PUT/DELETE /api/finance/sponsorship`
- `GET/POST/PUT /api/finance/expenses`
- `GET /api/finance/reimbursements?event=`
- `PATCH /api/finance/reimbursements/:id/status`
- `GET /api/finance/dashboard?start=YYYY-MM-DD&end=YYYY-MM-DD&event=...`

### Payments
- `POST /api/payments/sync`
- `GET /api/payments/transactions`
- `PATCH /api/payments/transactions/:id/tag`

### Reports
- `GET /api/reports/event/:eventName/pdf?year=YYYY`
- `GET /api/reports/monthly/:year/:month/csv`
- `GET /api/reports/annual/:year/pdf`

## 5) Setup Instructions (Step-by-step)

1. **Google Cloud setup**
   - Enable APIs: Google Sheets API + Google Drive API.
   - Create service account and JSON key.
   - Share the target spreadsheet and Drive folder with service account email.
   - Create OAuth web app credentials for frontend login.

2. **Square setup (read-only)**
   - Create app in Square Developer dashboard.
   - Use sandbox token for `SQUARE_ACCESS_TOKEN`.

3. **PayPal setup (read-only)**
   - Create REST app in PayPal Developer dashboard.
   - Use sandbox client + secret.

4. **Configure environment**
   - Copy `.env.example` to `.env` in project root.
   - Export frontend vars to `frontend/.env` if deploying separately.

5. **Install & run**
   ```bash
   npm install
   npm run dev
   ```

6. **Open app**
   - Frontend: `http://localhost:5173`
   - Backend health: `http://localhost:4000/health`

## 6) Deployment (Free tier)

### Option A: Render
- Backend as Web Service (`backend` start: `npm run start -w backend`)
- Frontend as Static Site (`npm run build -w frontend`, publish `frontend/dist`)

### Option B: Railway
- Deploy monorepo, configure backend service with start command above.
- Deploy frontend via Vercel/Netlify static build.

### Option C: Vercel + Render
- Frontend on Vercel (`frontend` root)
- Backend on Render, set `VITE_API_URL` to Render backend URL.

## 7) Security Notes

- Keep `.env` secret; never commit private keys.
- JWT secret must be long/random in production.
- OAuth verification is done server-side before app token issuance.
- Role permissions enforced via middleware.
- Payments sync is read-only; no write-back to providers.

## 8) Financial Year Logic

- Dashboard/reporting defaults to Jan 1 through Dec 31 for selected year.
- Date filtering supports explicit custom ranges and event filtering.

## 9) Feature Coverage Mapping

- Sponsorship CRUD with status/date/event.
- Income manual entries with category/method/date.
- Expense + receipt upload to Drive + reimbursement tracking.
- Consolidated dashboard totals + monthly chart + event summary.
- Square + PayPal transaction import + dedupe + tagging.
- Event/monthly/annual exports in PDF/CSV.

