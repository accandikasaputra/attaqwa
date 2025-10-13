import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    
    // Validation
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
    
    // If tim_procurement, validate prices
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Buat Purchase Order</h1>
        <p className="text-gray-500">Buat purchase order baru</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi PO</CardTitle>
            <CardDescription>
              Isi informasi dasar purchase order
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="category">Kategori *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="tenaga_kerja">Tenaga Kerja</SelectItem>
                  <SelectItem value="operasional">Operasional</SelectItem>
                  <SelectItem value="lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan tambahan..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
        
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
                className="p-4 border rounded-lg space-y-4 relative"
              >
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="absolute top-2 right-2"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nama Item *</Label>
                    <Input
                      value={item.itemName}
                      onChange={(e) =>
                        updateItem(index, "itemName", e.target.value)
                      }
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
                  
                  <div>
                    <Label>Unit *</Label>
                    <Select
                      value={item.unit}
                      onValueChange={(value) => updateItem(index, "unit", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pcs">Pcs</SelectItem>
                        <SelectItem value="kg">Kg</SelectItem>
                        <SelectItem value="m">Meter</SelectItem>
                        <SelectItem value="m2">M²</SelectItem>
                        <SelectItem value="m3">M³</SelectItem>
                        <SelectItem value="box">Box</SelectItem>
                        <SelectItem value="sak">Sak</SelectItem>
                        <SelectItem value="unit">Unit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
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
                  
                  {isProcurement && item.unitPrice && (
                    <div>
                      <Label>Total Harga</Label>
                      <Input
                        value={`Rp ${(item.quantity * item.unitPrice).toLocaleString("id-ID")}`}
                        disabled
                      />
                    </div>
                  )}
                </div>
                
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
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Keseluruhan:</span>
                  <span className="text-2xl font-bold">
                    Rp {totalAmount.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/po")}
          >
            Batal
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Menyimpan..." : "Simpan PO"}
          </Button>
        </div>
      </form>
    </div>
  );
}