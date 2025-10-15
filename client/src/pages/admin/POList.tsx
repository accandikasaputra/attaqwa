import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Trash2, FileEdit, Send, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { getPOs, deletePO, submitPO } from "@/services/poApi";

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

export default function POList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    status: "",
    category: "",
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitId, setSubmitId] = useState<number | null>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role;
  const canCreatePO = ["tim_konstruksi", "tim_procurement"].includes(userRole);

  const { data, isLoading } = useQuery({
    queryKey: ["pos", filters],
    queryFn: () => getPOs(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePO,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos"] });
      toast({ title: "Berhasil", description: "Purchase Order berhasil dihapus" });
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal menghapus PO",
        variant: "destructive",
      });
    },
  });

  const submitMutation = useMutation({
    mutationFn: submitPO,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos"] });
      toast({
        title: "Berhasil",
        description: "PO berhasil di-submit untuk review",
      });
      setSubmitId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal submit PO",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Purchase Orders</h1>
          <p className="text-gray-500">Kelola Purchase Order</p>
        </div>
        {canCreatePO && (
          <Button onClick={() => navigate("/admin/po/new")} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Buat PO
          </Button>
        )}
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari PO Number atau Notes..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>

          {/* Filter toggle (mobile) */}
          <Button
            type="button"
            variant="outline"
            className="sm:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" /> Filter
          </Button>

          {/* Filter inline (desktop) */}
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
              <option value="approved_ketua">Approved Ketua</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">Semua Kategori</option>
              <option value="material">Material</option>
              <option value="tenaga_kerja">Tenaga Kerja</option>
              <option value="operasional">Operasional</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
        </div>

        {/* Mobile expanded filters */}
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
                <option value="approved_ketua">Approved Ketua</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Semua Kategori</option>
                <option value="material">Material</option>
                <option value="tenaga_kerja">Tenaga Kerja</option>
                <option value="operasional">Operasional</option>
                <option value="lainnya">Lainnya</option>
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
              <TableHead>PO Number</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Tanggal</TableHead>
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
              data?.data?.map((po: any) => (
                <TableRow key={po.id}>
                  <TableCell>{po.poNumber}</TableCell>
                  <TableCell>{categoryMap[po.category]}</TableCell>
                  <TableCell>Rp {Number(po.totalAmount).toLocaleString("id-ID")}</TableCell>
                  <TableCell>{po.itemCount} items</TableCell>
                  <TableCell>
                    <Badge variant={statusMap[po.status]?.variant}>
                      {statusMap[po.status]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">
                    {po.createdByRole.replace("_", " ")}
                  </TableCell>
                  <TableCell>{new Date(po.createdAt).toLocaleDateString("id-ID")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/po/${po.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {userRole === "tim_procurement" && po.status === "draft" && (
                        <Button variant="outline" size="sm" onClick={() => setSubmitId(po.id)}>
                          <Send className="h-4 w-4" />
                        </Button>
                      )}

                      {userRole === "tim_procurement" &&
                        po.createdByRole === "tim_konstruksi" &&
                        po.status === "draft" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/po/${po.id}/input-price`)}
                          >
                            <FileEdit className="h-4 w-4" />
                          </Button>
                        )}

                      {po.status === "draft" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteId(po.id)}
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
            <AlertDialogTitle>Hapus Purchase Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini tidak dapat dibatalkan. PO dan semua itemnya akan dihapus.
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
            <AlertDialogTitle>Submit PO untuk Review?</AlertDialogTitle>
            <AlertDialogDescription>
              PO akan dikirim ke bendahara untuk direview. Pastikan semua data sudah benar.
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
