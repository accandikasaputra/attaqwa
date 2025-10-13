import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPODetail, type PurchaseOrder } from "@/services/poApi";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AdminPOActions from "./AdminPOActions";

export default function AdminPODetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [po, setPO] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);

  // contoh role user (nanti bisa dari context / auth)
  const userRole = "bendahara" as "admin" | "tim_procurement" | "bendahara" | "ketua";

  const loadDetail = async () => {
    try {
      const res = await getPODetail(Number(id));
      setPO(res.data);
    } catch {
      alert("Gagal memuat detail PO");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  if (loading) return <p>Memuat...</p>;
  if (!po) return <p>Data tidak ditemukan</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2"
      >
        <ArrowLeft size={18} /> Kembali
      </Button>

      <h1 className="text-2xl font-bold mb-2">Detail Purchase Order</h1>
      <p className="text-gray-600 mb-4">Nomor PO: {po.poNumber}</p>

      <div className="bg-white border rounded-lg p-4 mb-6">
        <p><strong>Kategori:</strong> {po.category}</p>
        <p><strong>Status:</strong> {po.status}</p>
        <p><strong>Total:</strong> Rp {po.totalAmount?.toLocaleString("id-ID")}</p>
      </div>

      <h2 className="text-lg font-semibold mb-2">Daftar Item</h2>
      <table className="w-full border-collapse border rounded-lg mb-6">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3">Nama Barang</th>
            <th className="p-3">Qty</th>
            <th className="p-3">Satuan</th>
            <th className="p-3">Harga</th>
            <th className="p-3">Total</th>
          </tr>
        </thead>
        <tbody>
          {po.items?.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="p-3">{item.itemName}</td>
              <td className="p-3">{item.quantity}</td>
              <td className="p-3">{item.unit}</td>
              <td className="p-3">
                Rp {item.unitPrice?.toLocaleString("id-ID") || "-"}
              </td>
              <td className="p-3">
                Rp {item.totalPrice?.toLocaleString("id-ID") || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Komponen aksi per role */}
      <AdminPOActions po={po} role={userRole} onActionComplete={loadDetail} />
    </div>
  );
}
