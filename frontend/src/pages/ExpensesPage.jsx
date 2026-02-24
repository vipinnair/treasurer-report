import { useState } from 'react';
import useCrud from '../hooks/useCrud';
import SimpleTable from '../components/SimpleTable';

export default function ExpensesPage() {
  const { rows, create } = useCrud('/finance/expenses');
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ type: 'General', event: '', paidByType: 'Organization', paidByName: '', amount: '', category: 'Admin', date: '', notes: '', reimbursementStatus: 'Pending' });
  const submit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('receipt', file);
    create(fd, true);
  };
  return <section className="space-y-4"><h2 className="text-xl font-semibold">Expenses & Reimbursements</h2>
    <form className="grid grid-cols-3 gap-2 bg-white p-3 rounded shadow" onSubmit={submit}>{Object.keys(form).map((k)=><input key={k} className="border p-2 rounded" placeholder={k} value={form[k]} onChange={(e)=>setForm({...form,[k]:e.target.value})}/>)}<input type="file" onChange={(e)=>setFile(e.target.files[0])}/><button className="bg-slate-900 text-white p-2 rounded">Add Expense</button></form>
    <SimpleTable rows={rows}/></section>;
}
