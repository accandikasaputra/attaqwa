import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { getPODetail, reviewBendahara } from "@/services/poApi";

export default function POReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  
  const query = useQuery({
    queryKey: ["po", id],
    queryFn: () => getPODetail(Number(id)),
    });

    const { data, isLoading, isSuccess } = query;

    // Jalankan efek samping ketika data berhasil dimuat
    useEffect(() => {
    if (isSuccess && data?.data?.items) {
        const allItemIds = data.data.items.map((item: any) => item.id);
        setSelectedItems(allItemIds);
    }
    }, [isSuccess, data]);

  
  const reviewMutation = useMutation({
    mutationFn: (payload: any) => reviewBendahara(Number(id), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["po", id] });
      queryClient.invalidateQueries({ queryKey: ["pos"] });
      toast({
        title: "Berhasil",
        description: "PO berhasil direview",
      });
      navigate("/admin/po");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal review PO",
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
  
  const toggleItem = (itemId: number) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };
  
  const selectedTotal = po.items
    .filter((item: any) => selectedItems.includes(item.id))
    .reduce((sum: number, item: any) => sum + Number(item.totalPrice), 0);
  
  const handleApprove = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Error",
        description: "Minimal 1 item harus dipilih",
        variant: "destructive",
      });
      return;
    }
    
    reviewMutation.mutate({
      action: "approve",
      selectedItems,
    });
  };
  
  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Alasan penolakan harus diisi",
        variant: "destructive",
      });
      return;
    }
    
    reviewMutation.mutate({
      action: "reject",
      rejectionReason,
    });
    
    setShowRejectDialog(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/admin/po")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Review PO - {po.poNumber}</h1>
          <p className="text-gray-500">Pilih item yang akan dibeli</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Informasi PO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">PO Number</p>
              <p className="font-medium">{po.poNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Kategori</p>
              <p className="font-medium">{po.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Original</p>
              <p className="font-medium">
                Rp {Number(po.totalAmount).toLocaleString("id-ID")}
              </p>
            </div>
          </div>
          
          {po.notes && (
            <div>
              <p className="text-sm text-gray-500">Catatan</p>
              <p>{po.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Pilih Items</CardTitle>
          <CardDescription>
            Centang item yang akan dibeli. Item yang tidak dicentang tidak akan diproses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Nama Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Harga Satuan</TableHead>
                <TableHead>Total Harga</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {po.items?.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={() => toggleItem(item.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{item.itemName}</TableCell>
                  <TableCell>
                    {item.quantity} {item.unit}
                  </TableCell>
                  <TableCell>
                    Rp {Number(item.unitPrice).toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>
                    Rp {Number(item.totalPrice).toLocaleString("id-ID")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">
                  {selectedItems.length} dari {po.items.length} item dipilih
                </p>
                <p className="font-semibold">Total yang akan diproses:</p>
              </div>
              <span className="text-2xl font-bold">
                Rp {selectedTotal.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
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
        <Button
          type="button"
          variant="destructive"
          onClick={() => setShowRejectDialog(true)}
        >
          Tolak
        </Button>
        <Button
          type="button"
          onClick={handleApprove}
          disabled={reviewMutation.isPending}
        >
          {reviewMutation.isPending ? "Memproses..." : "Approve"}
        </Button>
      </div>
      
      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tolak Purchase Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Berikan alasan penolakan PO ini
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label>Alasan Penolakan *</Label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Jelaskan alasan penolakan..."
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700"
            >
              Tolak PO
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}