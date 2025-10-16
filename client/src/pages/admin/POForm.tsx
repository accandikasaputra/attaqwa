import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createPO } from "@/services/poApi";

interface FormItem {
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  notes?: string;
}

export default function POForm() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get user role
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role;
  const isProcurement = userRole === "tim_procurement";

  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<FormItem[]>([
    { itemName: "", quantity: 1, unit: "pcs", unitPrice: undefined, notes: "" },
  ]);

  const createMutation = useMutation({
    mutationFn: createPO,
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Purchase Order berhasil dibuat",
      });
      navigate("/admin/po");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal membuat PO",
        variant: "destructive",
      });
    },
  });

  const addItem = () => {
    setItems([
      ...items,
      { itemName: "", quantity: 1, unit: "pcs", unitPrice: undefined, notes: "" },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof FormItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) {
      toast({
        title: "Error",
        description: "Kategori harus diisi",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Minimal 1 item harus diisi",
        variant: "destructive",
      });
      return;
    }

    const invalidItems = items.some(
      (item) => !item.itemName || item.quantity <= 0
    );

    if (invalidItems) {
      toast({
        title: "Error",
        description: "Semua item harus diisi dengan benar",
        variant: "destructive",
      });
      return;
    }

    if (isProcurement) {
      const missingPrices = items.some((item) => !item.unitPrice || item.unitPrice <= 0);
      if (missingPrices) {
        toast({
          title: "Error",
          description: "Semua harga harus diisi",
          variant: "destructive",
        });
        return;
      }
    }

    createMutation.mutate({
      category,
      notes,
      items: items.map((item) => ({
        itemName: item.itemName,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unitPrice,
        notes: item.notes,
      })),
    });
  };

  const totalAmount = items.reduce((sum, item) => {
    if (item.unitPrice) {
      return sum + item.quantity * item.unitPrice;
    }
    return sum;
  }, 0);

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-1">Buat Purchase Order</h1>
        <p className="text-gray-500 mb-6">Buat purchase order baru</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informasi PO */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi PO</CardTitle>
              <CardDescription>Isi informasi dasar purchase order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Kategori */}
              <div>
                <Label htmlFor="category" className="font-semibold text-gray-900">
                  Kategori <span className="text-red-500">*</span>
                </Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-2 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors bg-white"
                >
                  <option value="">Pilih kategori</option>
                  <option value="material">Material</option>
                  <option value="tenaga_kerja">Tenaga Kerja</option>
                  <option value="operasional">Operasional</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              {/* Catatan */}
              <div>
                <Label htmlFor="notes" className="font-semibold text-gray-900">
                  Catatan
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan tambahan..."
                  rows={3}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>
                {isProcurement
                  ? "Daftar item yang akan dibeli (dengan harga)"
                  : "Daftar item yang akan dibeli (harga akan diinput oleh procurement)"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg space-y-4 relative bg-white"
                >
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="absolute top-3 right-3 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Nama Item *</Label>
                      <Input
                        value={item.itemName}
                        onChange={(e) => updateItem(index, "itemName", e.target.value)}
                        placeholder="Nama item..."
                      />
                    </div>

                    <div>
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", parseInt(e.target.value) || 1)
                        }
                      />
                    </div>

                    {/* Unit Dropdown */}
                    <div>
                      <Label>Unit *</Label>
                      <select
                        value={item.unit}
                        onChange={(e) => updateItem(index, "unit", e.target.value)}
                        className="w-full mt-2 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors bg-white"
                      >
                        <option value="pcs">Pcs</option>
                        <option value="kg">Kg</option>
                        <option value="m">Meter</option>
                        <option value="m2">M²</option>
                        <option value="m3">M³</option>
                        <option value="box">Box</option>
                        <option value="sak">Sak</option>
                        <option value="unit">Unit</option>
                      </select>
                    </div>

                    {/* Harga Satuan */}
                    {isProcurement && (
                      <div>
                        <Label>Harga Satuan *</Label>
                        <Input
                          type="number"
                          min="0"
                          value={item.unitPrice || ""}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "unitPrice",
                              parseFloat(e.target.value) || undefined
                            )
                          }
                          placeholder="Harga per unit..."
                        />
                      </div>
                    )}

                    {/* Total Harga */}
                    {isProcurement && item.unitPrice && (
                      <div>
                        <Label>Total Harga</Label>
                        <Input
                          value={`Rp ${(item.quantity * item.unitPrice).toLocaleString(
                            "id-ID"
                          )}`}
                          disabled
                        />
                      </div>
                    )}
                  </div>

                  {/* Catatan Item */}
                  <div>
                    <Label>Catatan Item</Label>
                    <Input
                      value={item.notes || ""}
                      onChange={(e) => updateItem(index, "notes", e.target.value)}
                      placeholder="Catatan untuk item ini..."
                    />
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addItem}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Item
              </Button>

              {isProcurement && totalAmount > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Keseluruhan:</span>
                    <span className="text-2xl font-bold text-emerald-700">
                      Rp {totalAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate("/admin/po")}
              className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? "Menyimpan..." : "Simpan PO"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
