import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send, CheckCircle, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getDonationDetail, submitDonation } from "@/services/donationApi";

const statusMap: Record<string, { label: string; variant: any }> = {
  draft: { label: "Draft", variant: "secondary" },
  pending_review: { label: "Pending Review", variant: "default" },
  approved_bendahara: { label: "Waiting Ketua", variant: "default" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
};

export default function DonationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role;
  
  const { data, isLoading } = useQuery({
    queryKey: ["donation", id],
    queryFn: () => getDonationDetail(Number(id)),
  });
  
  const submitMutation = useMutation({
    mutationFn: submitDonation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donation", id] });
      toast({
        title: "Berhasil",
        description: "Donasi berhasil di-submit",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal submit donasi",
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
  
  const canEdit = donation.status === "draft" && donation.createdBy === user.id;
  const canSubmit = donation.status === "draft" && donation.createdBy === user.id;
  const canReview = userRole === "bendahara" && donation.status === "pending_review";
  const canApprove = userRole === "ketua" && donation.status === "approved_bendahara";
  
  // Preview cash flow description
  const donorDisplay = donation.showName 
    ? `Bapak/Ibu ${donation.donorName}`
    : "Hamba Allah";
  const typeLabel = donation.donationType === "iuran" ? "Iuran" : "Donasi";
  const cashFlowPreview = `${typeLabel} dari ${donorDisplay}`;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/admin/donations")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Detail Donasi</h1>
            <p className="text-gray-500">Informasi lengkap donasi</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {canEdit && (
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/donations/${id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          
          {canSubmit && (
            <Button onClick={() => submitMutation.mutate(Number(id))}>
              <Send className="mr-2 h-4 w-4" />
              Submit
            </Button>
          )}
          
          {canReview && (
            <Button onClick={() => navigate(`/admin/donations/${id}/review`)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Review
            </Button>
          )}
          
          {canApprove && (
            <Button onClick={() => navigate(`/admin/donations/${id}/approve`)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Donatur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Nama Donatur</p>
                <p className="font-medium">{donation.donorName}</p>
              </div>
              
              {donation.donorEmail && (
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{donation.donorEmail}</p>
                </div>
              )}
              
              {donation.donorPhone && (
                <div>
                  <p className="text-sm text-gray-500">No. Telepon</p>
                  <p className="font-medium">{donation.donorPhone}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Tipe Donatur</p>
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
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Detail Donasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Jumlah</p>
                <p className="font-medium text-2xl">
                  Rp {Number(donation.amount).toLocaleString("id-ID")}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Tanggal Donasi</p>
                <p className="font-medium">
                  {new Date(donation.donationDate).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              
              {donation.paymentMethod && (
                <div>
                  <p className="text-sm text-gray-500">Metode Pembayaran</p>
                  <p className="font-medium">{donation.paymentMethod}</p>
                </div>
              )}
              
              {donation.notes && (
                <div>
                  <p className="text-sm text-gray-500">Catatan</p>
                  <p className="font-medium">{donation.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status & Workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={statusMap[donation.status]?.variant} className="mt-1">
                  {statusMap[donation.status]?.label}
                </Badge>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Dibuat Oleh</p>
                <p className="font-medium capitalize">
                  {donation.createdByRole.replace("_", " ")}
                </p>
              </div>
              
              {donation.reviewedByBendaharaAt && (
                <div>
                  <p className="text-sm text-gray-500">Reviewed At</p>
                  <p className="font-medium">
                    {new Date(donation.reviewedByBendaharaAt).toLocaleDateString("id-ID")}
                  </p>
                </div>
              )}
              
              {donation.approvedAt && (
                <div>
                  <p className="text-sm text-gray-500">Approved At</p>
                  <p className="font-medium">
                    {new Date(donation.approvedAt).toLocaleDateString("id-ID")}
                  </p>
                </div>
              )}
              
              {donation.rejectionReason && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">
                    Alasan Penolakan
                  </p>
                  <p className="text-red-800 mt-1">{donation.rejectionReason}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50">
            <CardHeader>
              <CardTitle>Privacy Setting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-700 font-medium">
                  Tampilan di Cash Flow:
                </p>
                {donation.showName ? (
                  <div className="mt-2">
                    <Badge variant="default">Show Name</Badge>
                    <p className="text-sm text-gray-600 mt-2">
                      Nama akan ditampilkan di cash flow
                    </p>
                  </div>
                ) : (
                  <div className="mt-2">
                    <Badge variant="secondary">Hamba Allah</Badge>
                    <p className="text-sm text-gray-600 mt-2">
                      Nama akan disembunyikan (anonim)
                    </p>
                  </div>
                )}
              </div>
              
              <div className="bg-white p-3 rounded border border-blue-200">
                <p className="text-xs text-gray-500 mb-1">Preview Keterangan:</p>
                <p className="font-medium text-gray-800">{cashFlowPreview}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}