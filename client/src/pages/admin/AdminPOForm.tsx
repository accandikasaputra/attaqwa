import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPO } from "@/services/poApi";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminPOForm() {
  const navigate = useNavigate();

  const [category, setCategory] = useState("pembangunan");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([
    { itemName: "", quantity: 1, unit: "", unitPrice: 0 },
  ]);

  const handleAddItem = () => {
    setItems([...items, { itemName: "", quantity: 1, unit: "", unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleChangeItem = (index: number, field: string, value: string | number) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { category, notes, items };
      await createPO(payload);
      alert("PO berhasil dibuat");
      navigate("/admin/po");
    } catch (error) {
      console.error(error);
      alert("Gagal membuat PO");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Buat Purchase Order</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-1 font-semibold">Kategori</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="material">Material</option>
            <option value="operasional">Operasional</option>
            <option value="tenaga_kerja">Tenaga Kerja</option>
            <option value="lainnya">Lainnya</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Catatan</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Items */}
        <div>
          <label className="block mb-2 font-semibold">Daftar Barang</label>
          {items.map((item, i) => (
            <div key={i} className="flex gap-3 mb-3">
              <input
                type="text"
                placeholder="Nama Barang"
                value={item.itemName}
                onChange={(e) => handleChangeItem(i, "itemName", e.target.value)}
                className="border p-2 flex-1 rounded"
              />
              <input
                type="number"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) =>
                  handleChangeItem(i, "quantity", Number(e.target.value))
                }
                className="border p-2 w-20 rounded"
              />
              <input
                type="text"
                placeholder="Satuan"
                value={item.unit}
                onChange={(e) => handleChangeItem(i, "unit", e.target.value)}
                className="border p-2 w-24 rounded"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleRemoveItem(i)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
          <Button type="button" onClick={handleAddItem} className="flex items-center gap-2">
            <Plus size={16} /> Tambah Item
          </Button>
        </div>

        <Button type="submit" className="w-full">
          Simpan Purchase Order
        </Button>
      </form>
    </div>
  );
}
