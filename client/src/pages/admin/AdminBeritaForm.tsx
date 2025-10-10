import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';


export default function AdminBeritaForm() {
const { id } = useParams();
const navigate = useNavigate();
const [form, setForm] = useState({ title: '', excerpt: '', content: '' });
const [loading, setLoading] = useState(false);


useEffect(() => {
if (id) {
(async () => {
const res = await api.get(`/beritas/${id}`);
const b = res.data?.data || res.data;
setForm({ title: b.title, excerpt: b.excerpt || '', content: b.content || '' });
})();
}
}, [id]);


const handleSubmit = async (e: any) => {
e.preventDefault();
setLoading(true);
try {
if (id) await api.put(`/beritas/${id}`, form);
else await api.post('/beritas', form);
navigate('/admin/berita');
} catch (err) {
alert('Gagal menyimpan');
} finally {
setLoading(false);
}
};


return (
<form onSubmit={handleSubmit} className="space-y-4">
<input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="border p-2 w-full" placeholder="Judul" required />
<input value={form.excerpt} onChange={e=>setForm({...form,excerpt:e.target.value})} className="border p-2 w-full" placeholder="Ringkasan" />
<textarea value={form.content} onChange={e=>setForm({...form,content:e.target.value})} className="border p-2 w-full h-64" placeholder="Isi berita" />
<button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded">{loading ? 'Menyimpan...' : 'Simpan'}</button>
</form>
);
}