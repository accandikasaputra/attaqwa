import { useEffect, useState } from 'react';
import api from '../../services/api';


export default function AdminCashflowList() {
const [items, setItems] = useState<any[]>([]);
const [loading, setLoading] = useState(true);


const load = async () => {
setLoading(true);
try {
const res = await api.get('/cash-flows');
setItems(res.data?.data || res.data);
} catch (err) {
console.error(err);
} finally {
setLoading(false);
}
};


useEffect(() => {
load();
}, []);


const togglePublish = async (id: number, publish: boolean) => {
try {
if (publish) await api.post(`/cash-flows/${id}/publish`);
else await api.post(`/cash-flows/${id}/unpublish`);
load();
} catch (err) {
alert('Gagal mengubah status');
}
};


return (
<div>
<h1 className="text-2xl font-bold mb-6">Kelola Donasi</h1>
{loading ? <p>Loading...</p> : (
<div className="space-y-3">
{items.map((i) => (
<div key={i.id} className="bg-white p-4 rounded shadow flex justify-between">
<div>
<div className="font-semibold">{i.category} - {i.description}</div>
<div className="text-sm text-gray-500">{i.transaction_date}</div>
</div>
<div>
{i.is_published ? (
<button onClick={()=>togglePublish(i.id,false)} className="px-3 py-1 bg-yellow-500 rounded">Unpublish</button>
) : (
<button onClick={()=>togglePublish(i.id,true)} className="px-3 py-1 bg-emerald-600 text-white rounded">Publish</button>
)}
</div>
</div>
))}
</div>
)}
</div>
);
}