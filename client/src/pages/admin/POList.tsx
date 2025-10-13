import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Trash2, FileEdit, Send } from "lucide-react";
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
  
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [submitId, setSubmitId] = useState<number | null>(null);
  
  // Get user role from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = user.role;
  
  // Fetch POs
  const { data, isLoading } = useQuery({
    queryKey: ["pos", filters],
    queryFn: () => getPOs(filters),
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deletePO,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos"] });
      toast({
        title: "Berhasil",
        description: "Purchase Order berhasil dihapus",
      });
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
  
  // Submit mutation
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
  
  const handleDelete = (id: number) => {
    setDeleteId(id);
  };
  
  const handleSubmit = (id: number) => {
    setSubmitId(id);
  };
  
  const canCreatePO = ["tim_konstruksi", "tim_procurement"].includes(userRole);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Purchase Orders</h1>
          <p className="text-gray-500">Kelola Purchase Order</p>
        </div>
        {canCreatePO && (
          <Button onClick={() => navigate("/admin/po/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Buat PO
          </Button>
        )}
      </div>
      
      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Cari PO Number atau Notes..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="max-w-xs"
        />
        
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters({ ...filters, status: value })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__semua__">Semua Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="approved_bendahara">Approved Bendahara</SelectItem>
            <SelectItem value="approved_ketua">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={filters.category}
          onValueChange={(value) => setFilters({ ...filters, category: value })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__semua__">Semua Kategori</SelectItem>
            <SelectItem value="material">Material</SelectItem>
            <SelectItem value="tenaga_kerja">Tenaga Kerja</SelectItem>
            <SelectItem value="operasional">Operasional</SelectItem>
            <SelectItem value="lainnya">Lainnya</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Table */}
      <div className="border rounded-lg">
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
              data?.data?.map((po: any) => (
                <TableRow key={po.id}>
                  <TableCell className="font-medium">{po.poNumber}</TableCell>
                  <TableCell>{categoryMap[po.category]}</TableCell>
                  <TableCell>
                    Rp {Number(po.totalAmount).toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell>{po.itemCount} items</TableCell>
                  <TableCell>
                    <Badge variant={statusMap[po.status]?.variant}>
                      {statusMap[po.status]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">
                    {po.createdByRole.replace("_", " ")}
                  </TableCell>
                  <TableCell>
                    {new Date(po.createdAt).toLocaleDateString("id-ID")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/po/${po.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {/* Submit button - only for tim_procurement on draft */}
                      {userRole === "tim_procurement" && po.status === "draft" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSubmit(po.id)}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {/* Input Price button - only for tim_procurement if created by tim_konstruksi */}
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
                      
                      {/* Delete button - only for creator on draft */}
                      {po.status === "draft" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(po.id)}
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