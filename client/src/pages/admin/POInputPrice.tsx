import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getPODetail, inputPrice } from "@/services/poApi";

export default function POInputPrice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({
    queryKey: ["po", id],
    queryFn: () => getPODetail(Number(id)),
  });
  
  const [prices, setPrices] = useState<Record<number, number>>({});
  
  const inputPriceMutation = useMutation({
    mutationFn: (payload: any) => inputPrice(Number(id), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["po", id] });
      toast({
        title: "Berhasil",
        description: "Harga berhasil diinput",
      });
      navigate(`/admin/po/${id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal input harga",
        variant: "destructive",
      });
    },
  });
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  const po = data?.data;
  
  if (!po) {
    return <div>PO tidak ditemukan</div>;
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all prices filled
    const allPricesFilled = po.items.every((item: any) => prices[item.id]);
    
    if (!allPricesFilled) {
      toast({
        title: "Error",
        description: "Semua harga harus diisi",
        variant: "destructive",
      });
      return;
    }
    
    const items = po.items.map((item: any) => ({
      id: item.id,
      quantity: item.quantity,
      unitPrice: prices[item.id],
    }));
    
    inputPriceMutation.mutate({ items });
  };
  
  const totalAmount = po.items.reduce((sum: number, item: any) => {
    const price = prices[item.id];
    if (price) {
      return sum + item.quantity * price;
    }
    return sum;
  }, 0);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(`/admin/po/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Input Harga - {po.poNumber}</h1>
          <p className="text-gray-500">Input harga untuk setiap item</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
            <CardDescription>
              Input harga satuan untuk setiap item
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {po.items?.map((item: any) => (
              <div key={item.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{item.itemName}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} {item.unit}
                    </p>
                    {item.notes && (
                      <p className="text-sm text-gray-500 italic">
                        Note: {item.notes}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Harga Satuan *</Label>
                    <Input
                      type="number"
                      min="0"
                      value={prices[item.id] || ""}
                      onChange={(e) =>
                        setPrices({
                          ...prices,
                          [item.id]: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="Masukkan harga..."
                    />
                  </div>
                  
                  {prices[item.id] && (
                    <div>
                      <Label>Total Harga</Label>
                      <Input
                        value={`Rp ${(item.quantity * prices[item.id]).toLocaleString("id-ID")}`}
                        disabled
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {totalAmount > 0 && (
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
            onClick={() => navigate(`/admin/po/${id}`)}
          >
            Batal
          </Button>
          <Button type="submit" disabled={inputPriceMutation.isPending}>
            {inputPriceMutation.isPending ? "Menyimpan..." : "Simpan Harga"}
          </Button>
        </div>
      </form>
    </div>
  );
}