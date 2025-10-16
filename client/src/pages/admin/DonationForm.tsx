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

  const { data: donationData, isLoading: isLoadingData } = useQuery({
    queryKey: ["donation", id],
    queryFn: () => getDonationDetail(Number(id)),
    enabled: isEdit,
  });

  useEffect(() => {
    if (donationData?.data) {
      const d = donationData.data;
      setFormData({
        donorName: d.donorName || "",
        donorEmail: d.donorEmail || "",
        donorPhone: d.donorPhone || "",
        donorType: d.donorType || "warga",
        donationType: d.donationType || "sumbangan",
        amount: d.amount ? d.amount.toString() : "",
        showName: d.showName === 1 || d.showName === true,
        paymentMethod: d.paymentMethod || "",
        notes: d.notes || "",
        donationDate: d.donationDate
          ? new Date(d.donationDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      });
    }
  }, [donationData]);

  const createMutation = useMutation({
    mutationFn: createDonation,
    onSuccess: () => {
      toast({ title: "Berhasil", description: "Donasi berhasil dibuat" });
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
      toast({ title: "Berhasil", description: "Donasi berhasil diubah" });
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
    if (!formData.donorName.trim() || !formData.amount) {
      toast({
        title: "Error",
        description: "Nama dan jumlah donasi wajib diisi",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    isEdit ? updateMutation.mutate(payload) : createMutation.mutate(payload);
  };

  const handleChange = (field: string, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const donorDisplay = formData.showName
    ? `Bapak/Ibu ${formData.donorName || "[Nama]"}`
    : "Hamba Allah";

  if (isEdit && isLoadingData)
    return <div className="text-center py-10">Memuat data...</div>;

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/admin/donations")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEdit ? "Edit Donasi" : "Input Donasi Baru"}
            </h1>
            <p className="text-gray-500">
              {isEdit
                ? "Ubah data donasi"
                : "Tambahkan data donasi atau iuran warga"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Donatur Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Donatur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label>Nama Donatur *</Label>
                  <Input
                    value={formData.donorName}
                    onChange={(e) => handleChange("donorName", e.target.value)}
                    placeholder="Nama lengkap donatur..."
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    value={formData.donorEmail}
                    onChange={(e) => handleChange("donorEmail", e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <Label>No. Telepon</Label>
                  <Input
                    value={formData.donorPhone}
                    onChange={(e) => handleChange("donorPhone", e.target.value)}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>

                <div>
                  <Label>Tipe Donatur *</Label>
                  <select
                    id="donorType"
                    name="donorType"
                    value={formData.donorType}
                    onChange={(e) => handleChange("donorType", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg 
                              focus:ring-2 focus:ring-emerald-500 focus:border-transparent 
                              transition-colors bg-white text-gray-900"
                  >
                    <option value="warga">Warga</option>
                    <option value="luar_warga">Luar Warga</option>
                  </select>
                </div>

                <div>
                  <Label>Jenis Donasi *</Label>
                  <select
                    id="donorType"
                    name="donorType"
                    value={formData.donationType}
                    onChange={(e) => handleChange("donationType", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg 
                              focus:ring-2 focus:ring-emerald-500 focus:border-transparent 
                              transition-colors bg-white text-gray-900"
                  >
                    <option value="sumbangan">Sumbangan</option>
                    <option value="iuran">Iuran</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detail Donasi */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Donasi</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Jumlah Donasi (Rp) *</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  placeholder="Masukkan jumlah..."
                />
              </div>

              <div>
                <Label>Tanggal Donasi *</Label>
                <Input
                  type="date"
                  value={formData.donationDate}
                  onChange={(e) => handleChange("donationDate", e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <Label>Metode Pembayaran</Label>
                <select
                    id="donorType"
                    name="donorType"
                    value={formData.paymentMethod}
                    onChange={(e) => handleChange("paymentMethod", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg 
                              focus:ring-2 focus:ring-emerald-500 focus:border-transparent 
                              transition-colors bg-white text-gray-900"
                  >
                    <option value="Cash">Cash / Tunai</option>
                    <option value="Transfer Bank">Transfer Bank</option>
                    <option value="E-Wallet">E-Wallet (OVO, GoPay, Dana, dll)</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Privasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div className="space-y-1 flex-1 pr-4">
                  <Label>Tampilkan Nama di Cash Flow</Label>
                  <p className="text-sm text-gray-600">
                    Akan tampil sebagai:{" "}
                    <span className="font-medium">{donorDisplay}</span>
                  </p>
                </div>
                <Switch
                  checked={formData.showName}
                  onCheckedChange={(checked) => handleChange("showName", checked)}
                />
              </div>

              <div>
                <Label>Catatan</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Catatan tambahan..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sticky bottom-0 bg-gray-50 p-4 sm:p-6 -mx-6 -mb-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/donations")}
              className="w-full sm:w-auto"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="w-full sm:flex-1"
            >
              {isEdit ? "Simpan Perubahan" : "Simpan Donasi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
