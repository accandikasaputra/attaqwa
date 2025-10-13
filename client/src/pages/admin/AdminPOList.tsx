import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPOs, type PurchaseOrder } from "@/services/poApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Eye } from "lucide-react";

export default function AdminPOList() {
  const [pos, setPOs] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: "", category: "" });

  useEffect(() => {
    loadPOs();
  }, [filter]);

  const loadPOs = async () => {
    setLoading(true);
    try {
      const response = await getPOs(filter);
      setPOs(response.data || []);
    } catch (error) {
      console.error("Failed to load POs:", error);
      alert("Gagal memuat data PO");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daftar Purchase Order</h1>
        <Link to="/admin/po/new">
          <Button className="flex items-center gap-2">
            <PlusCircle size={18} /> Tambah PO
          </Button>
        </Link>
      </div>

      {/* Filter */}
      <div className="flex gap-4 mb-6">
        <select
          className="border rounded px-3 py-2"
          value={filter.status}
          onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
        >
          <option value="">Semua Status</option>
          <option value="draft">Draft</option>
          <option value="submitted">Dikirim</option>
          <option value="reviewed">Direview</option>
          <option value="approved">Disetujui</option>
          <option value="rejected">Ditolak</option>
        </select>

        <select
          className="border rounded px-3 py-2"
          value={filter.category}
          onChange={(e) =>
            setFilter((f) => ({ ...f, category: e.target.value }))
          }
        >
            <option value="">Semua Kategori</option>
            <option value="material">Material</option>
            <option value="operasional">Operasional</option>
            <option value="tenaga_kerja">Tenaga Kerja</option>
            <option value="lainnya">Lainnya</option>
        </select>
      </div>

      {loading ? (
        <p>Memuat data...</p>
      ) : (
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">No</th>
                <th className="p-3">Nomor PO</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pos.map((po, i) => (
                <tr key={po.id} className="border-t">
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3">{po.poNumber}</td>
                  <td className="p-3">{po.category}</td>
                  <td className="p-3">
                    Rp {po.totalAmount?.toLocaleString("id-ID")}
                  </td>
                  <td className="p-3">
                    <Badge>{po.status}</Badge>
                  </td>
                  <td className="p-3">
                    <Link to={`/admin/po/${po.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye size={16} className="mr-1" />
                        Detail
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {pos.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-gray-500">
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
