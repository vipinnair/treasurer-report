import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const links = [
  ['/', 'Dashboard'],
  ['/income', 'Income'],
  ['/sponsorship', 'Sponsorship'],
  ['/expenses', 'Expenses'],
  ['/transactions', 'Transactions'],
  ['/reports', 'Reports']
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen">
      <header className="bg-slate-900 text-white p-4 flex justify-between">
        <Link to="/" className="font-semibold">Treasurer Portal</Link>
        <div className="flex items-center gap-4"><span>{user?.name}</span><button onClick={logout}>Logout</button></div>
      </header>
      <div className="p-4 flex gap-6">
        <nav className="w-52 bg-white shadow rounded p-2 h-fit">{links.map(([to, label]) => <NavLink key={to} to={to} className="block p-2 rounded hover:bg-slate-100">{label}</NavLink>)}</nav>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
