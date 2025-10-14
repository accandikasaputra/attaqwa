import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { getDonations, deleteDonation, submitDonation } from "@/services/donationApi";

const statusMap: Record<string, { label: string; variant: any }> = {
  draft: { label: "Draft", variant: "secondary" },
  pending_review: { label: "Pending Review", variant: "default" },
  approved_bendahara: { label: "Waiting Ketua", variant: "default" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
};

const donorTypeMap: Record<string, string> = {
  warga: "Warga",
  luar_warga: "Luar Warga",
};

const donationTypeMap: Record<string, string> = {
  sumbangan: "Sumbangan",
  iuran: "Iuran",
};

export default function DonationList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState({
    status: "",
    donorType: "",
    donationType: "",
    search: "",
  });
  
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitId, setSubmitId] = useState<number | null>(null);
  
  // Get user role
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role;
  
  // Fetch donations
  const { data, isLoading } = useQuery({
    queryKey: ["donations", filters],
    queryFn: () => getDonations(filters),
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteDonation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      toast({
        title: "Berhasil",
        description: "Donasi berhasil dihapus",
      });
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal menghapus donasi",
        variant: "destructive",
      });
    },
  });
  
  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: submitDonation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      toast({
        title: "Berhasil",
        description: "Donasi berhasil di-submit",
      });
      setSubmitId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal submit donasi",
        variant: "destructive",
      });
    },
  });
  
  const canCreateDonation = ["bendahara", "tim_pendanaan"].includes(userRole);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Donasi & Iuran</h1>
          <p className="text-gray-500">Kelola data donasi dan iuran warga</p>
        </div>
        {canCreateDonation && (
          <Button onClick={() => navigate("/admin/donations/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Input Donasi
          </Button>
        )}
      </div>
      
      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="Cari nama donatur..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="max-w-xs"
        />
        
        <Select
          value={filters.status ?? ""}
          onValueChange={(value) => setFilters({ ...filters, status: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Semua Tipe Donasi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__Semua__">Semua Tipe</SelectItem>
            <SelectItem value="sumbangan">Sumbangan</SelectItem>
            <SelectItem value="iuran">Iuran</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Nama Donatur</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Jumlah</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Privacy</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((donation: any) => (
                <TableRow key={donation.id}>
                  <TableCell>
                    {new Date(donation.donationDate).toLocaleDateString("id-ID")}
                  </TableCell>
                  <TableCell className="font-medium">
                    {donation.donorName}
                  </TableCell>
                  <TableCell>{donorTypeMap[donation.donorType]}</TableCell>
                  <TableCell>{donationTypeMap[donation.donationType]}</TableCell>
                  <TableCell>
                    Rp {Number(donation.amount).toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusMap[donation.status]?.variant}>
                      {statusMap[donation.status]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {donation.showName ? (
                      <Badge variant="outline">Show Name</Badge>
                    ) : (
                      <Badge variant="secondary">Hamba Allah</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/donations/${donation.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {/* Submit button */}
                      {donation.status === "draft" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSubmitId(donation.id)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {/* Delete button - only draft */}
                      {donation.status === "draft" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteId(donation.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Donasi?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini tidak dapat dibatalkan. Data donasi akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Submit Dialog */}
      <AlertDialog open={!!submitId} onOpenChange={() => setSubmitId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Donasi?</AlertDialogTitle>
            <AlertDialogDescription>
              {userRole === "bendahara"
                ? "Donasi akan langsung menunggu approval ketua."
                : "Donasi akan dikirim ke bendahara untuk direview."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => submitId && submitMutation.mutate(submitId)}
            >
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}