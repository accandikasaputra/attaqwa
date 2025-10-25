import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Trash2, Send, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/Pagination";
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
    page: 1,
    limit: 10, // Add limit

  });
  const [showFilters, setShowFilters] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitId, setSubmitId] = useState<number | null>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role;
  const canCreateDonation = ["bendahara", "tim_pendanaan"].includes(userRole);

  const { data, isLoading } = useQuery({
    queryKey: ["donations", filters],
    queryFn: () => getDonations(filters),
  });

  const donations = data?.data || [];
  const pagination = data?.pagination;
  

  const deleteMutation = useMutation({
    mutationFn: deleteDonation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      toast({ title: "Berhasil", description: "Donasi berhasil dihapus" });
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

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Donasi & Iuran</h1>
          <p className="text-gray-500">Kelola data donasi dan iuran warga</p>
        </div>
        {canCreateDonation && (
          <Button onClick={() => navigate("/admin/donations/new")} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Input Donasi
          </Button>
        )}
      </div>

      {/* Filter section */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        {/* Search + toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari nama donatur..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>

          {/* Toggle for mobile */}
          <Button
            type="button"
            variant="outline"
            className="sm:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>

          {/* Inline filters for desktop */}
          <div className="hidden sm:flex gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option>
              <option value="approved_bendahara">Approved Bendahara</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={filters.donationType}
              onChange={(e) => setFilters({ ...filters, donationType: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Semua Jenis</option>
              <option value="sumbangan">Sumbangan</option>
              <option value="iuran">Iuran</option>
            </select>
          </div>
        </div>

        {/* Expanded mobile filter */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-200 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Semua Status</option>
                <option value="draft">Draft</option>
                <option value="pending_review">Pending Review</option>
                <option value="approved_bendahara">Approved Bendahara</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Donasi</label>
              <select
                value={filters.donationType}
                onChange={(e) => setFilters({ ...filters, donationType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Semua Jenis</option>
                <option value="sumbangan">Sumbangan</option>
                <option value="iuran">Iuran</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg shadow-sm overflow-x-auto">
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
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  Tidak ada data
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((donation: any) => (
                <TableRow key={donation.id}>
                  <TableCell>{new Date(donation.donationDate).toLocaleDateString("id-ID")}</TableCell>
                  <TableCell className="font-medium">{donation.donorName}</TableCell>
                  <TableCell>{donorTypeMap[donation.donorType]}</TableCell>
                  <TableCell>{donationTypeMap[donation.donationType]}</TableCell>
                  <TableCell>Rp {Number(donation.amount).toLocaleString("id-ID")}</TableCell>
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

                      {donation.status === "draft" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSubmitId(donation.id)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteId(donation.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {/* Pagination */}
        {pagination && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={(page) => setFilters({ ...filters, page })}
          />
        )}
      </div>
      
      {/* Dialogs */}
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
            <AlertDialogAction onClick={() => submitId && submitMutation.mutate(submitId)}>
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
