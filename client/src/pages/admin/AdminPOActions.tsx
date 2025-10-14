import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  inputPrice,
  reviewBendahara,
  approveKetua,
  submitPO,
  type PurchaseOrder,
} from "@/services/poApi";

interface Props {
  po: PurchaseOrder;
  role: "admin" | "tim_procurement" | "bendahara" | "ketua";
  onActionComplete: () => void;
}

export default function AdminPOActions({ po, role, onActionComplete }: Props) {
  const [loading, setLoading] = useState(false);

  const handleSubmitPO = async () => {
    if (!confirm("Kirim PO ini untuk direview?")) return;
    try {
      setLoading(true);
      await submitPO(po.id);
      alert("PO dikirim untuk review.");
      onActionComplete();
    } catch (err) {
      alert("Gagal submit PO");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveKetua = async (isApprove: boolean) => {
    const reasonInput = !isApprove ? prompt("Masukkan alasan penolakan:") : undefined;
    const reason = reasonInput === null ? undefined : reasonInput;

    try {
      setLoading(true);
      await approveKetua(po.id, {
        action: isApprove ? "approve" : "reject",
        rejectionReason: reason,
      });
      alert(isApprove ? "PO disetujui Ketua" : "PO ditolak Ketua");
      onActionComplete();
    } catch {
      alert("Gagal proses persetujuan Ketua");
    } finally {
      setLoading(false);
    }
  };

  const handleReviewBendahara = async (isApprove: boolean) => {
    const reasonInput = !isApprove ? prompt("Masukkan alasan penolakan:") : undefined;
    const reason = reasonInput === null ? undefined : reasonInput;

    try {
      setLoading(true);
      await reviewBendahara(po.id, {
        action: isApprove ? "approve" : "reject",
        rejectionReason: reason,
      });
      alert(isApprove ? "PO disetujui Bendahara" : "PO ditolak Bendahara");
      onActionComplete();
    } catch {
      alert("Gagal review Bendahara");
    } finally {
      setLoading(false);
    }
  };

  const handleInputHarga = async () => {
    const items = po.items?.map((item) => ({
      id: item.id!,
      quantity: item.quantity,
      unitPrice:
        Number(prompt(`Masukkan harga satuan untuk ${item.itemName}:`)) || 0,
    }));
    try {
      setLoading(true);
      await inputPrice(po.id, { items: items! });
      alert("Harga berhasil disimpan");
      onActionComplete();
    } catch {
      alert("Gagal input harga");
    } finally {
      setLoading(false);
    }
  };

  // UI per role
  if (role === "tim_procurement") {
    if (po.status === "draft") {
      return (
        <div className="flex gap-2">
          <Button onClick={handleInputHarga} disabled={loading}>
            Input Harga
          </Button>
          <Button onClick={handleSubmitPO} disabled={loading} variant="secondary">
            Submit untuk Review
          </Button>
        </div>
      );
    }
  }

  if (role === "bendahara" && po.status === "submitted") {
    return (
      <div className="flex gap-2">
        <Button onClick={() => handleReviewBendahara(true)} disabled={loading}>
          Setujui
        </Button>
        <Button
          onClick={() => handleReviewBendahara(false)}
          disabled={loading}
          variant="destructive"
        >
          Tolak
        </Button>
      </div>
    );
  }

  if (role === "ketua" && po.status === "reviewed") {
    return (
      <div className="flex gap-2">
        <Button onClick={() => handleApproveKetua(true)} disabled={loading}>
          Setujui
        </Button>
        <Button
          onClick={() => handleApproveKetua(false)}
          disabled={loading}
          variant="destructive"
        >
          Tolak
        </Button>
      </div>
    );
  }

  return null;
}
