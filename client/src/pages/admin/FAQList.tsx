import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Plus, Eye, Edit, Trash2, Filter, Search, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
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
import { getAllFAQs, deleteFAQ, updateFAQ } from "@/services/faqApi";

export default function FAQList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    search: "",
  });
  
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  // Fetch FAQs
  const { data, isLoading } = useQuery({
    queryKey: ["faqs-admin", filters],
    queryFn: () => getAllFAQs(filters),
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteFAQ,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs-admin"] });
      toast({
        title: "Berhasil",
        description: "FAQ berhasil dihapus",
      });
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal menghapus FAQ",
        variant: "destructive",
      });
    },
  });
  
  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: number }) =>
      updateFAQ(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs-admin"] });
      toast({
        title: "Berhasil",
        description: "Status FAQ berhasil diubah",
      });
    },
  });
  
  const faqsList = data?.data || [];
  
  // Group by category - FIX: Convert Set to Array properly
  const categories = Array.from(new Set(faqsList.map((faq: any) => faq.category)));
  
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">FAQ Management</h1>
          <p className="text-sm md:text-base text-gray-500">Kelola Frequently Asked Questions</p>
        </div>
        <Button onClick={() => navigate("/admin/faqs/new")} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Tambah FAQ
        </Button>
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
              placeholder="Cari pertanyaan atau jawaban..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
          
          {/* Desktop filters - inline */}
          <div className="hidden sm:flex gap-4">
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat: string) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          {/* Mobile filters - expandable */}
          {showFilters && (
            <div className="sm:hidden space-y-4 border-t border-gray-200 pt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Semua Kategori</option>
                  {categories.map((cat: string) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* FAQ List - Responsive */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              Loading...
            </CardContent>
          </Card>
        ) : faqsList.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              Tidak ada FAQ
            </CardContent>
          </Card>
        ) : (
          faqsList.map((faq: any) => (
            <Card key={faq.id}>
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Drag Handle - Desktop only */}
                  <div className="hidden md:flex items-start pt-1">
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base md:text-lg">
                          {faq.question}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {faq.answer}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="shrink-0">
                          {faq.category}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Active:</span>
                        <Switch
                          checked={faq.isActive === 1}
                          onCheckedChange={(checked) =>
                            toggleActiveMutation.mutate({
                              id: faq.id,
                              isActive: checked ? 1 : 0,
                            })
                          }
                        />
                      </div>
                      
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-none"
                          onClick={() => navigate(`/admin/faqs/${faq.id}/edit`)}
                        >
                          <Edit className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteId(faq.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus FAQ?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini tidak dapat dibatalkan. FAQ akan dihapus permanen.
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
