import { useState } from 'react';
import useCrud from '../hooks/useCrud';
import SimpleTable from '../components/SimpleTable';

export default function SponsorshipPage() {
  const { rows, create } = useCrud('/finance/sponsorship');
  const [form, setForm] = useState({ type: 'Annual', sponsorName: '', amount: '', event: '', paymentMethod: '', paymentDate: '', status: 'Pending', notes: '' });
  return <section className="space-y-4"><h2 className="text-xl font-semibold">Sponsorship Module</h2>
    <form className="grid grid-cols-3 gap-2 bg-white p-3 rounded shadow" onSubmit={(e)=>{e.preventDefault();create(form);}}>{Object.keys(form).map((k)=><input key={k} className="border p-2 rounded" placeholder={k} value={form[k]} onChange={(e)=>setForm({...form,[k]:e.target.value})}/>)}<button className="bg-slate-900 text-white p-2 rounded">Add Sponsorship</button></form>
    <SimpleTable rows={rows}/></section>;
}
