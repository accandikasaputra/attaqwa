import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Eye, Trash2, Filter, Search, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useToast } from "@/hooks/use-toast";
import { getAllFeedback, deleteFeedback } from "@/services/feedbackApi";

const statusMap: Record<string, { label: string; variant: any }> = {
  new: { label: "New", variant: "default" },
  read: { label: "Read", variant: "secondary" },
  replied: { label: "Replied", variant: "default" },
};

export default function FeedbackList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    page: 1,
    limit: 10,
  });
  
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  // Fetch feedback
  const { data, isLoading } = useQuery({
    queryKey: ["feedback", filters],
    queryFn: () => getAllFeedback(filters),
  });
  const pagination = data?.pagination;
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      toast({
        title: "Berhasil",
        description: "Feedback berhasil dihapus",
      });
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal menghapus feedback",
        variant: "destructive",
      });
    },
  });
  
  const feedbackList = data?.data || [];
  
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Kritik & Saran</h1>
          <p className="text-sm md:text-base text-gray-500">Kelola feedback dari jamaah</p>
        </div>
      </div>
      
      {/* Filters Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
            
            {/* Toggle for mobile */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="sm:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search - always visible */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari nama, subjek, atau pesan..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
          
          {/* Desktop filters - inline */}
          <div className="hidden sm:flex gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Semua Status</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
            </select>
          </div>
          
          {/* Mobile filters - expandable */}
          {showFilters && (
            <div className="sm:hidden space-y-4 border-t border-gray-200 pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Semua Status</option>
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                </select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Table Card - Responsive */}
      <Card>
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Subjek</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : feedbackList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Tidak ada feedback
                    </TableCell>
                  </TableRow>
                ) : (
                  feedbackList.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString("id-ID")}
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.subject}</TableCell>
                      <TableCell>
                        <Badge variant={statusMap[item.status]?.variant}>
                          {statusMap[item.status]?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/feedback/${item.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteId(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
          
          {/* Mobile Cards */}
          <div className="md:hidden divide-y">
            {isLoading ? (
              <div className="p-6 text-center text-gray-500">Loading...</div>
            ) : feedbackList.length === 0 ? (
              <div className="p-6 text-center text-gray-500">Tidak ada feedback</div>
            ) : (
              feedbackList.map((item: any) => (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.subject}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(item.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                    <Badge variant={statusMap[item.status]?.variant}>
                      {statusMap[item.status]?.label}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/admin/feedback/${item.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-2" /> Detail
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteId(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Feedback?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini tidak dapat dibatalkan. Feedback akan dihapus permanen.
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
    </div>
  );
}