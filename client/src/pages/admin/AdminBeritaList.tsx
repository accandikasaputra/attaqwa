// src/pages/admin/AdminBeritaList.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function AdminBeritaList() {
  const [beritas, setBeritas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/news'); // adapt if your endpoint different
      setBeritas(res.data.data || res.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus berita ini?')) return;
    try {
      await api.delete(`/api/news/${id}`);
      load();
    } catch (err) { console.error(err); alert('Gagal menghapus'); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kelola Berita</h1>
        <Link to="/admin/berita/new" className="bg-emerald-600 text-white px-4 py-2 rounded">Buat Berita</Link>
      </div>

      {loading ? <p>Loading…</p> : (
        <div className="grid gap-4">
          {beritas.map(b => (
            <div key={b.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{b.title}</h3>
                <p className="text-sm text-gray-500">{b.excerpt}</p>
              </div>
              <div className="flex gap-2">
                <Link to={`/admin/berita/${b.id}/edit`} className="px-3 py-2 border rounded">Edit</Link>
                <button onClick={() => handleDelete(b.id)} className="px-3 py-2 bg-red-500 text-white rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
