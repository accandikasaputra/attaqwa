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
import { getDonationDetail, reviewDonation } from "@/services/donationApi";

export default function DonationReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  
  const { data, isLoading } = useQuery({
    queryKey: ["donation", id],
    queryFn: () => getDonationDetail(Number(id)),
  });
  
  const reviewMutation = useMutation({
    mutationFn: (payload: any) => reviewDonation(Number(id), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donation", id] });
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      toast({
        title: "Berhasil",
        description: "Donasi berhasil direview",
      });
      navigate("/admin/donations");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal review donasi",
        variant: "destructive",
      });
    },
  });
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  const donation = data?.data;
  
  if (!donation) {
    return <div>Donasi tidak ditemukan</div>;
  }
  
  const handleApprove = () => {
    reviewMutation.mutate({ action: "approve" });
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
  
  const donorDisplay = donation.showName 
    ? `Bapak/Ibu ${donation.donorName}`
    : "Hamba Allah";
  const typeLabel = donation.donationType === "iuran" ? "Iuran" : "Donasi";
  const cashFlowPreview = `${typeLabel} dari ${donorDisplay}`;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/admin/donations")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Review Donasi</h1>
          <p className="text-gray-500">Review donasi dari tim pendanaan</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Informasi Donasi</CardTitle>
          <CardDescription>
            Verifikasi data donasi sebelum diteruskan ke ketua
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Nama Donatur</p>
              <p className="font-medium">{donation.donorName}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Tipe</p>
              <Badge variant="outline">
                {donation.donorType === "warga" ? "Warga" : "Luar Warga"}
              </Badge>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Jenis</p>
              <Badge variant="outline">
                {donation.donationType === "sumbangan" ? "Sumbangan" : "Iuran"}
              </Badge>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Jumlah</p>
              <p className="font-medium text-xl">
                Rp {Number(donation.amount).toLocaleString("id-ID")}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Tanggal</p>
              <p className="font-medium">
                {new Date(donation.donationDate).toLocaleDateString("id-ID")}
              </p>
            </div>
            
            {donation.paymentMethod && (
              <div>
                <p className="text-sm text-gray-500">Metode Pembayaran</p>
                <p className="font-medium">{donation.paymentMethod}</p>
              </div>
            )}
          </div>
          
          {donation.notes && (
            <div>
              <p className="text-sm text-gray-500">Catatan</p>
              <p className="font-medium">{donation.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle>Preview Cash Flow</CardTitle>
          <CardDescription>
            Tampilan yang akan muncul di cash flow setelah diapprove ketua
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Keterangan</p>
                <p className="font-medium text-lg">{cashFlowPreview}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Jumlah</p>
                <p className="font-bold text-green-600 text-xl">
                  + Rp {Number(donation.amount).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
            <div className="mt-2">
              <Badge variant={donation.showName ? "default" : "secondary"}>
                {donation.showName ? "Show Name" : "Hamba Allah"}
              </Badge>
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
            Dengan meng-approve donasi ini, data akan diteruskan ke ketua untuk
            approval final. Setelah ketua approve, donasi akan masuk ke cash flow.
          </p>
        </CardContent>
      </Card>
      
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/admin/donations")}
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
            <AlertDialogTitle>Tolak Donasi?</AlertDialogTitle>
            <AlertDialogDescription>
              Berikan alasan penolakan donasi ini
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
              Tolak Donasi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}