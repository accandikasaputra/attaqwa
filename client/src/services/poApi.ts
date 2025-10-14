import api from "./api";

export interface POItem {
  id?: number;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  totalPrice?: number;
  notes?: string;
  isSelectedByBendahara?: boolean;
}

export interface PurchaseOrder {
  id: number;
  poNumber: string;
  category: string;
  totalAmount: number;
  status: string;
  createdBy: number;
  createdByRole: string;
  reviewedByBendahara?: number;
  approvedByKetua?: number;
  rejectedBy?: number;
  rejectionReason?: string;
  notes?: string;
  items?: POItem[];
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePORequest {
  category: string;
  notes?: string;
  items: {
    itemName: string;
    quantity: number;
    unit: string;
    unitPrice?: number;
    notes?: string;
  }[];
}

export interface InputPriceRequest {
  items: {
    id: number;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface ReviewBendaharaRequest {
  action: "approve" | "reject";
  selectedItems?: number[];
  rejectionReason?: string;
}

export interface ApproveKetuaRequest {
  action: "approve" | "reject";
  rejectionReason?: string;
}

// Get all POs with filters
export const getPOs = async (params?: {
  status?: string;
  category?: string;
  role?: string;
  search?: string;
}) => {
  const { data } = await api.get("/po", { params });
  return data;
};

// Get PO detail
export const getPODetail = async (id: number) => {
  const { data } = await api.get(`/po/${id}`);
  return data;
};

// Create PO
export const createPO = async (payload: CreatePORequest) => {
  const { data } = await api.post("/po", payload);
  return data;
};

// Input price (tim_procurement only)
export const inputPrice = async (id: number, payload: InputPriceRequest) => {
  const { data } = await api.put(`/po/${id}/input-price`, payload);
  return data;
};

// Submit PO for review
export const submitPO = async (id: number) => {
  const { data } = await api.put(`/po/${id}/submit`);
  return data;
};

// Review by bendahara
export const reviewBendahara = async (id: number, payload: ReviewBendaharaRequest) => {
  const { data } = await api.put(`/po/${id}/review-bendahara`, payload);
  return data;
};

// Approve by ketua
export const approveKetua = async (id: number, payload: ApproveKetuaRequest) => {
  const { data } = await api.put(`/po/${id}/approve-ketua`, payload);
  return data;
};

// Delete PO
export const deletePO = async (id: number) => {
  const { data } = await api.delete(`/po/${id}`);
  return data;
};