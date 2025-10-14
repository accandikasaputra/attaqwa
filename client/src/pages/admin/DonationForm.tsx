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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { createDonation, updateDonation, getDonationDetail } from "@/services/donationApi";

export default function DonationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;
  
  const [formData, setFormData] = useState({
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    donorType: "warga" as "warga" | "luar_warga",
    donationType: "sumbangan" as "sumbangan" | "iuran",
    amount: "",
    showName: true,
    paymentMethod: "",
    notes: "",
    donationDate: new Date().toISOString().split("T")[0],
  });
  
  // Fetch donation if edit mode
  const { data: donationData, isLoading: isLoadingData } = useQuery({
    queryKey: ["donation", id],
    queryFn: () => getDonationDetail(Number(id)),
    enabled: isEdit,
  });
  
  // Set form data when donation data is loaded
  useEffect(() => {
    if (donationData?.data) {
      const donation = donationData.data;
      setFormData({
        donorName: donation.donorName || "",
        donorEmail: donation.donorEmail || "",
        donorPhone: donation.donorPhone || "",
        donorType: donation.donorType || "warga",
        donationType: donation.donationType || "sumbangan",
        amount: donation.amount ? donation.amount.toString() : "",
        showName: donation.showName === 1 || donation.showName === true,
        paymentMethod: donation.paymentMethod || "",
        notes: donation.notes || "",
        donationDate: donation.donationDate 
          ? new Date(donation.donationDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      });
    }
  }, [donationData]);
  
  const createMutation = useMutation({
    mutationFn: createDonation,
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Donasi berhasil dibuat",
      });
      navigate("/admin/donations");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal membuat donasi",
        variant: "destructive",
      });
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: (payload: any) => updateDonation(Number(id), payload),
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Donasi berhasil diubah",
      });
      navigate("/admin/donations");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal mengubah donasi",
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.donorName.trim()) {
      toast({
        title: "Error",
        description: "Nama donatur harus diisi",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.amount) {
      toast({
        title: "Error",
        description: "Jumlah donasi harus diisi",
        variant: "destructive",
      });
      return;
    }
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Error",
        description: "Jumlah donasi tidak valid",
        variant: "destructive",
      });
      return;
    }
    
    const payload = {
      donorName: formData.donorName.trim(),
      donorEmail: formData.donorEmail.trim() || undefined,
      donorPhone: formData.donorPhone.trim() || undefined,
      donorType: formData.donorType,
      donationType: formData.donationType,
      amount,
      showName: formData.showName,
      paymentMethod: formData.paymentMethod.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      donationDate: formData.donationDate,
    };
    
    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };
  
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Calculate preview
  const donorDisplay = formData.showName 
    ? `Bapak/Ibu ${formData.donorName || "[Nama]"}`
    : "Hamba Allah";
  const typeLabel = formData.donationType === "iuran" ? "Iuran" : "Donasi";
  const cashFlowPreview = `${typeLabel} dari ${donorDisplay}`;
  
  if (isEdit && isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/donations")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEdit ? "Edit Donasi" : "Input Donasi Baru"}
          </h1>
          <p className="text-gray-500">
            {isEdit ? "Ubah data donasi" : "Input data donasi atau iuran warga"}
          </p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Donatur</CardTitle>
            <CardDescription>
              Data donatur yang memberikan donasi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="donorName">
                  Nama Donatur <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="donorName"
                  value={formData.donorName}
                  onChange={(e) => handleChange("donorName", e.target.value)}
                  placeholder="Nama lengkap donatur..."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="donorEmail">Email</Label>
                <Input
                  id="donorEmail"
                  type="email"
                  value={formData.donorEmail}
                  onChange={(e) => handleChange("donorEmail", e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="donorPhone">No. Telepon</Label>
                <Input
                  id="donorPhone"
                  value={formData.donorPhone}
                  onChange={(e) => handleChange("donorPhone", e.target.value)}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
              
              <div>
                <Label htmlFor="donorType">
                  Tipe Donatur <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.donorType}
                  onValueChange={(value: any) => handleChange("donorType", value)}
                >
                  <SelectTrigger id="donorType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warga">Warga</SelectItem>
                    <SelectItem value="luar_warga">Luar Warga</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="donationType">
                  Jenis Donasi <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.donationType}
                  onValueChange={(value: any) => handleChange("donationType", value)}
                >
                  <SelectTrigger id="donationType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sumbangan">Sumbangan</SelectItem>
                    <SelectItem value="iuran">Iuran</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Detail Donasi</CardTitle>
            <CardDescription>
              Informasi jumlah dan metode pembayaran
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">
                  Jumlah Donasi (Rp) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  placeholder="Masukkan jumlah..."
                  required
                />
                {formData.amount && parseFloat(formData.amount) > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Rp {parseFloat(formData.amount).toLocaleString("id-ID")}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="donationDate">
                  Tanggal Donasi <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="donationDate"
                  type="date"
                  value={formData.donationDate}
                  onChange={(e) => handleChange("donationDate", e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => handleChange("paymentMethod", value)}
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="Pilih metode pembayaran..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash / Tunai</SelectItem>
                    <SelectItem value="Transfer Bank">Transfer Bank</SelectItem>
                    <SelectItem value="E-Wallet">E-Wallet (OVO, GoPay, Dana, dll)</SelectItem>
                    <SelectItem value="Lainnya">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Opsional - Metode pembayaran yang digunakan
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan Privacy</CardTitle>
            <CardDescription>
              Pengaturan tampilan nama di cash flow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="space-y-1 flex-1 pr-4">
                <Label htmlFor="showName" className="text-base font-medium cursor-pointer">
                  Tampilkan Nama di Cash Flow
                </Label>
                <p className="text-sm text-gray-600">
                  {formData.showName
                    ? `Akan muncul sebagai: "${cashFlowPreview}"`
                    : `Akan muncul sebagai: "${typeLabel} dari Hamba Allah"`}
                </p>
              </div>
              <Switch
                id="showName"
                checked={formData.showName}
                onCheckedChange={(checked) => handleChange("showName", checked)}
              />
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>ℹ️ Info:</strong> Jika dimatikan, nama donatur akan diganti 
                dengan <strong>"Hamba Allah"</strong> untuk menjaga privasi di laporan cash flow publik.
              </p>
            </div>
            
            <div>
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Catatan tambahan mengenai donasi ini..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Preview Card */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle>Preview Cash Flow Entry</CardTitle>
            <CardDescription>
              Bagaimana donasi ini akan tampil di cash flow setelah disetujui
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-lg border-2 border-green-200">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                      PEMASUKAN
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded capitalize">
                      {formData.donationType}
                    </span>
                  </div>
                  <p className="font-medium text-lg">{cashFlowPreview}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.donationDate 
                      ? new Date(formData.donationDate).toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })
                      : "-"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    + Rp {formData.amount 
                      ? parseFloat(formData.amount).toLocaleString("id-ID")
                      : "0"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/donations")}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending
              ? "Menyimpan..."
              : isEdit
              ? "Simpan Perubahan"
              : "Simpan Donasi"}
          </Button>
        </div>
      </form>
    </div>
  );
}