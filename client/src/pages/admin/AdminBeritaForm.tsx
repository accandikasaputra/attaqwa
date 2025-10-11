import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/services/api";

export default function AdminBeritaForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "update-pembangunan",
    status: "draft",
    imageUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    { value: "update-pembangunan", label: "Update Pembangunan" },
    { value: "kegiatan", label: "Kegiatan" },
    { value: "pengumuman", label: "Pengumuman" },
  ];

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const res = await api.get(`/news/${id}`);
          const b = res.data?.data || res.data;

          setForm({
            title: b.title || "",
            excerpt: b.excerpt || "",
            content: b.content || "",
            category: b.category || "update-pembangunan",
            status: b.status || "draft",
            imageUrl: b.imageUrl || "",
          });
        } catch (err) {
          setError("Gagal memuat data berita");
        }
      })();
    }
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (id) {
        await api.patch(`/news/${id}`, form);
      } else {
        await api.post("/news", form);
      }

      navigate("/admin/berita");
    } catch (err: any) {
      console.error(err);
      setError("Gagal menyimpan berita. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-4">
        {id ? "Edit Berita" : "Tambah Berita"}
      </h1>

      {error && (
        <p className="text-red-500 bg-red-50 p-2 rounded mb-4 text-sm">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Judul</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            placeholder="Judul berita"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Ringkasan</label>
          <input
            type="text"
            name="excerpt"
            value={form.excerpt}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            placeholder="Ringkasan singkat"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Isi Berita</label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            className="border p-2 w-full h-64 rounded"
            placeholder="Isi berita lengkap"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Kategori</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">URL Gambar (Opsional)</label>
          <input
            type="text"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            placeholder="https://contoh.com/gambar.jpg"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition"
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
    </div>
  );
}
