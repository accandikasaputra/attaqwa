import api from "./api";

export interface Donation {
  id: number;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  donorType: "warga" | "luar_warga";
  donationType: "sumbangan" | "iuran";
  amount: number;
  showName: number;
  status: string;
  createdBy: number;
  createdByRole: string;
  reviewedByBendahara?: number;
  approvedBy?: number;
  rejectedBy?: number;
  rejectionReason?: string;
  paymentMethod?: string;
  paymentProofUrl?: string;
  notes?: string;
  cashFlowId?: number;
  donationDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDonationRequest {
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  donorType: "warga" | "luar_warga";
  donationType: "sumbangan" | "iuran";
  amount: number;
  showName: boolean;
  paymentMethod?: string;
  paymentProofUrl?: string;
  notes?: string;
  donationDate?: string;
}

export interface ReviewDonationRequest {
  action: "approve" | "reject";
  rejectionReason?: string;
}

// Get all donations with filters
export const getDonations = async (params?: {
  status?: string;
  donorType?: string;
  donationType?: string;
  search?: string;
}) => {
  const { data } = await api.get("/donations", { params });
  return data;
};

// Get donation detail
export const getDonationDetail = async (id: number) => {
  const { data } = await api.get(`/donations/${id}`);
  return data;
};

// Create donation
export const createDonation = async (payload: CreateDonationRequest) => {
  const { data } = await api.post("/donations", payload);
  return data;
};

// Update donation
export const updateDonation = async (id: number, payload: Partial<CreateDonationRequest>) => {
  const { data } = await api.put(`/donations/${id}`, payload);
  return data;
};

// Submit donation
export const submitDonation = async (id: number) => {
  const { data } = await api.put(`/donations/${id}/submit`);
  return data;
};

// Review by bendahara
export const reviewDonation = async (id: number, payload: ReviewDonationRequest) => {
  const { data } = await api.put(`/donations/${id}/review-bendahara`, payload);
  return data;
};

// Approve by ketua
export const approveDonation = async (id: number, payload: ReviewDonationRequest) => {
  const { data } = await api.put(`/donations/${id}/approve-ketua`, payload);
  return data;
};

// Delete donation
export const deleteDonation = async (id: number) => {
  const { data } = await api.delete(`/donations/${id}`);
  return data;
};