import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getPODetail, approveKetua } from "@/services/poApi";

export default function POApprove() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  
  const { data, isLoading } = useQuery({
    queryKey: ["po", id],
    queryFn: () => getPODetail(Number(id)),
  });
  
  const approveMutation = useMutation({
    mutationFn: (payload: any) => approveKetua(Number(id), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["po", id] });
      queryClient.invalidateQueries({ queryKey: ["pos"] });
      toast({
        title: "Berhasil",
        description: "PO berhasil diproses",
      });
      navigate("/admin/po");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal memproses PO",
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
  
  const selectedItems = po.items?.filter((item: any) => item.isSelectedByBendahara);
  const selectedTotal = selectedItems?.reduce(
    (sum: number, item: any) => sum + Number(item.totalPrice),
    0
  );
  
  const handleApprove = () => {
    approveMutation.mutate({
      action: "approve",
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
    
    approveMutation.mutate({
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
          <h1 className="text-3xl font-bold">Final Approval - {po.poNumber}</h1>
          <p className="text-gray-500">Review dan approve PO yang telah di-review bendahara</p>
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
              <p className="font-medium capitalize">{po.category.replace("_", " ")}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge variant="default">Approved by Bendahara</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Reviewed At</p>
              <p className="font-medium">
                {po.reviewedByBendaharaAt
                  ? new Date(po.reviewedByBendaharaAt).toLocaleDateString("id-ID")
                  : "-"}
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
          <CardTitle>Items yang Dipilih Bendahara</CardTitle>
          <CardDescription>
            Berikut adalah item yang telah dipilih oleh bendahara untuk diproses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Harga Satuan</TableHead>
                <TableHead>Total Harga</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {po.items?.map((item: any) => (
                <TableRow
                  key={item.id}
                  className={!item.isSelectedByBendahara ? "opacity-50" : ""}
                >
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
                  <TableCell>
                    {item.isSelectedByBendahara ? (
                      <Badge variant="default">Dipilih</Badge>
                    ) : (
                      <Badge variant="secondary">Tidak Dipilih</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">
                  {selectedItems?.length} dari {po.items.length} item dipilih
                </p>
                <p className="font-semibold text-gray-800">
                  Total yang akan disetujui:
                </p>
              </div>
              <span className="text-2xl font-bold text-blue-900">
                Rp {selectedTotal?.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-yellow-50">
        <CardHeader>
          <CardTitle>Perhatian</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700">
            Dengan meng-approve PO ini, transaksi akan otomatis masuk ke cash flow
            dengan status "Approved" dan dana akan dicairkan sesuai dengan item yang
            telah dipilih bendahara.
          </p>
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
          disabled={approveMutation.isPending}
        >
          {approveMutation.isPending ? "Memproses..." : "Approve PO"}
        </Button>
      </div>
      
      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tolak Purchase Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Berikan alasan penolakan PO ini. Transaksi di cash flow juga akan ditolak.
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