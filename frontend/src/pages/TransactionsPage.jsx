import { useEffect, useState } from 'react';
import api from '../api/client';
import SimpleTable from '../components/SimpleTable';

export default function TransactionsPage() {
  const [rows, setRows] = useState([]);
  const refresh = () => api.get('/payments/transactions').then((r) => setRows(r.data));
  useEffect(refresh, []);
  return <div className="space-y-4"><h2 className="text-xl font-semibold">Square / PayPal Sync</h2><button className="bg-green-700 text-white px-3 py-2 rounded" onClick={async()=>{await api.post('/payments/sync');refresh();}}>Sync Transactions</button><SimpleTable rows={rows}/></div>;
}
