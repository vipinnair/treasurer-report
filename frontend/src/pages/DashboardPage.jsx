import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../api/client';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get('/finance/dashboard').then((r) => setData(r.data)); }, []);
  if (!data) return <p>Loading...</p>;
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Financial Dashboard (Jan-Dec)</h2>
      <div className="grid grid-cols-5 gap-2">{[
        ['Income YTD', data.totalIncome],['Sponsorship YTD', data.totalSponsorship],['Expenses YTD', data.totalExpenses],['Net', data.net],['Outstanding Reimbursements', data.outstandingReimbursements]
      ].map(([label,v]) => <div key={label} className="bg-white p-3 shadow rounded"><p className="text-xs text-slate-500">{label}</p><p className="text-lg font-semibold">${Number(v).toFixed(2)}</p></div>)}</div>
      <div className="bg-white p-4 rounded shadow h-80">
        <ResponsiveContainer width="100%" height="100%"><BarChart data={data.monthly}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="month"/><YAxis/><Tooltip/><Legend/><Bar dataKey="income" fill="#10b981"/><Bar dataKey="expenses" fill="#ef4444"/></BarChart></ResponsiveContainer>
      </div>
    </div>
  );
}
