import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FileEdit, Send, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import { getPODetail, submitPO } from "@/services/poApi";

const statusMap: Record<string, { label: string; variant: any }> = {
  draft: { label: "Draft", variant: "secondary" },
  pending_review: { label: "Pending Review", variant: "default" },
  approved_bendahara: { label: "Approved Bendahara", variant: "default" },
  approved_ketua: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
};

const categoryMap: Record<string, string> = {
  material: "Material",
  tenaga_kerja: "Tenaga Kerja",
  operasional: "Operasional",
  lainnya: "Lainnya",
};

export default function PODetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role;
  
  const { data, isLoading } = useQuery({
    queryKey: ["po", id],
    queryFn: () => getPODetail(Number(id)),
  });
  
  const submitMutation = useMutation({
    mutationFn: submitPO,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["po", id] });
      toast({
        title: "Berhasil",
        description: "PO berhasil di-submit untuk review",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal submit PO",
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
  
  const canInputPrice =
    userRole === "tim_procurement" &&
    po.createdByRole === "tim_konstruksi" &&
    po.status === "draft";
    
  const canSubmit =
    userRole === "tim_procurement" &&
    po.status === "draft" &&
    po.items?.every((item: any) => item.unitPrice);
    
  const canReview = userRole === "bendahara" && po.status === "pending_review";
  const canApprove = userRole === "ketua" && po.status === "approved_bendahara";
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/po")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{po.poNumber}</h1>
            <p className="text-gray-500">Detail Purchase Order</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {canInputPrice && (
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/po/${id}/input-price`)}
            >
              <FileEdit className="mr-2 h-4 w-4" />
              Input Harga
            </Button>
          )}
          
          {canSubmit && (
            <Button onClick={() => submitMutation.mutate(Number(id))}>
              <Send className="mr-2 h-4 w-4" />
              Submit untuk Review
            </Button>
          )}
          
          {canReview && (
            <Button onClick={() => navigate(`/admin/po/${id}/review`)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Review
            </Button>
          )}
          
          {canApprove && (
            <Button onClick={() => navigate(`/admin/po/${id}/approve`)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
          )}
        </div>
      </div>
      
      {/* PO Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi PO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge variant={statusMap[po.status]?.variant}>
                {statusMap[po.status]?.label}
              </Badge>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Kategori</p>
              <p className="font-medium">{categoryMap[po.category]}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-medium text-lg">
                Rp {Number(po.totalAmount).toLocaleString("id-ID")}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Dibuat Oleh</p>
              <p className="font-medium capitalize">
                {po.createdByRole.replace("_", " ")}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Tanggal Dibuat</p>
              <p className="font-medium">
                {new Date(po.createdAt).toLocaleDateString("id-ID")}
              </p>
            </div>
          </div>
          
          {po.notes && (
            <div>
              <p className="text-sm text-gray-500">Catatan</p>
              <p className="font-medium">{po.notes}</p>
            </div>
          )}
          
          {po.rejectionReason && (
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-600 font-medium">Alasan Penolakan</p>
              <p className="text-red-800">{po.rejectionReason}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
          <CardDescription>Daftar item dalam PO ini</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Harga Satuan</TableHead>
                <TableHead>Total Harga</TableHead>
                {po.status !== "draft" && <TableHead>Status</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {po.items?.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.itemName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>
                    {item.unitPrice
                      ? `Rp ${Number(item.unitPrice).toLocaleString("id-ID")}`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {item.totalPrice
                      ? `Rp ${Number(item.totalPrice).toLocaleString("id-ID")}`
                      : "-"}
                  </TableCell>
                  {po.status !== "draft" && (
                    <TableCell>
                      {item.isSelectedByBendahara ? (
                        <Badge variant="default">Dipilih</Badge>
                      ) : (
                        <Badge variant="secondary">Tidak Dipilih</Badge>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}