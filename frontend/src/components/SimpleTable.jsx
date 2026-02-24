export default function SimpleTable({ rows }) {
  if (!rows.length) return <p className="text-slate-500">No records</p>;
  const headers = Object.keys(rows[0]);
  return (
    <div className="overflow-auto bg-white rounded shadow">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-100"> <tr>{headers.map((h) => <th key={h} className="text-left p-2">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r) => <tr key={r.id || JSON.stringify(r)} className="border-t">{headers.map((h) => <td key={h} className="p-2">{r[h]}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
