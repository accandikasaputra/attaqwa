import { useEffect, useState } from 'react';
import api from '../../services/api';


export default function AdminDashboard() {
const [summary, setSummary] = useState<any>(null);


useEffect(() => {
async function load() {
try {
const res = await api.get('/cash-flows/summary');
setSummary(res.data?.data || res.data);
} catch (err) {
console.error(err);
}
}
load();
}, []);


return (
<div>
<h1 className="text-2xl font-bold mb-6">Dashboard</h1>
<div className="grid grid-cols-3 gap-4">
<div className="bg-white p-4 rounded shadow">
<h3 className="text-sm text-gray-500">Total Pemasukan</h3>
<p className="text-xl font-bold">{summary?.total_pemasukan || '—'}</p>
</div>
<div className="bg-white p-4 rounded shadow">
<h3 className="text-sm text-gray-500">Total Pengeluaran</h3>
<p className="text-xl font-bold">{summary?.total_pengeluaran || '—'}</p>
</div>
<div className="bg-white p-4 rounded shadow">
<h3 className="text-sm text-gray-500">Saldo</h3>
<p className="text-xl font-bold">{summary?.saldo || '—'}</p>
</div>
</div>
</div>
);
}