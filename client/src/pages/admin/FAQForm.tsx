import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createFAQ, updateFAQ, getFAQDetail } from "@/services/faqApi";

export default function FAQForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;
  
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "Umum",
    displayOrder: 0,
    isActive: true,
  });
  
  // Fetch FAQ if edit mode
  const { data: faqData, isLoading: isLoadingData } = useQuery({
    queryKey: ["faq", id],
    queryFn: () => getFAQDetail(Number(id)),
    enabled: isEdit,
  });
  
  useEffect(() => {
    if (faqData?.data) {
      const faq = faqData.data;
      setFormData({
        question: faq.question || "",
        answer: faq.answer || "",
        category: faq.category || "Umum",
        displayOrder: faq.displayOrder || 0,
        isActive: faq.isActive === 1,
      });
    }
  }, [faqData]);
  
  const createMutation = useMutation({
    mutationFn: createFAQ,
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "FAQ berhasil dibuat",
      });
      navigate("/admin/faqs");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal membuat FAQ",
        variant: "destructive",
      });
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: (payload: any) => updateFAQ(Number(id), payload),
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "FAQ berhasil diubah",
      });
      navigate("/admin/faqs");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal mengubah FAQ",
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast({
        title: "Error",
        description: "Pertanyaan dan jawaban harus diisi",
        variant: "destructive",
      });
      return;
    }
    
    const payload = {
      question: formData.question.trim(),
      answer: formData.answer.trim(),
      category: formData.category,
      displayOrder: formData.displayOrder,
      isActive: formData.isActive ? 1 : 0,
    };
    
    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };
  
  if (isEdit && isLoadingData) {
    return <div className="p-4 md:p-6">Loading...</div>;
  }
  
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/faqs")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {isEdit ? "Edit FAQ" : "Tambah FAQ Baru"}
          </h1>
          <p className="text-sm md:text-base text-gray-500">
            {isEdit ? "Ubah FAQ" : "Buat FAQ baru"}
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi FAQ</CardTitle>
            <CardDescription>
              Isi pertanyaan dan jawaban yang sering ditanyakan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="question">
                Pertanyaan <span className="text-red-500">*</span>
              </Label>
              <Input
                id="question"
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
                placeholder="Tulis pertanyaan..."
                required
              />
            </div>
            
            <div>
              <Label htmlFor="answer">
                Jawaban <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="answer"
                value={formData.answer}
                onChange={(e) =>
                  setFormData({ ...formData, answer: e.target.value })
                }
                placeholder="Tulis jawaban..."
                rows={6}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Kategori</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="Contoh: Umum, Donasi, dll"
                />
              </div>
              
              <div>
                <Label htmlFor="displayOrder">Urutan Tampilan</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  min="0"
                  value={formData.displayOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Angka lebih kecil akan tampil lebih dulu
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div>
                <Label htmlFor="isActive" className="text-base font-medium cursor-pointer">
                  Aktifkan FAQ
                </Label>
                <p className="text-sm text-gray-500">
                  FAQ yang aktif akan tampil di halaman publik
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/faqs")}
            className="w-full sm:w-auto"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            Batal
          </Button>
          <Button
            type="submit"
            className="w-full sm:flex-1"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending
              ? "Menyimpan..."
              : isEdit
              ? "Simpan Perubahan"
              : "Simpan FAQ"}
          </Button>
        </div>
      </form>
    </div>
  );
}
