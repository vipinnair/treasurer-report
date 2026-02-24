export default function ReportsPage() {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
  return <div className="space-y-3"><h2 className="text-xl font-semibold">Reports</h2>
    <a className="block text-blue-700 underline" href={`${base}/reports/event/Spring%20Festival/pdf?year=2026`} target="_blank">Download Event Report PDF</a>
    <a className="block text-blue-700 underline" href={`${base}/reports/monthly/2026/5/csv`} target="_blank">Download Monthly CSV</a>
    <a className="block text-blue-700 underline" href={`${base}/reports/annual/2026/pdf`} target="_blank">Download Annual PDF</a>
  </div>;
}
