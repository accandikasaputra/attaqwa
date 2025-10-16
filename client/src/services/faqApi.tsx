import api from "./api";

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  isActive: number;
  createdBy: number;
  updatedBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFAQRequest {
  question: string;
  answer: string;
  category: string;
  displayOrder?: number;
  isActive?: number;
}

// Get active FAQs (public)
export const getActiveFAQs = async () => {
  const { data } = await api.get("/faqs");
  return data;
};

// Get all FAQs with filters (admin)
export const getAllFAQs = async (params?: {
  category?: string;
  search?: string;
}) => {
  const { data } = await api.get("/faqs/all", { params });
  return data;
};

// Get FAQ detail
export const getFAQDetail = async (id: number) => {
  const { data } = await api.get(`/faqs/${id}`);
  return data;
};

// Create FAQ
export const createFAQ = async (payload: CreateFAQRequest) => {
  const { data } = await api.post("/faqs", payload);
  return data;
};

// Update FAQ
export const updateFAQ = async (id: number, payload: Partial<CreateFAQRequest>) => {
  const { data } = await api.put(`/faqs/${id}`, payload);
  return data;
};

// Delete FAQ
export const deleteFAQ = async (id: number) => {
  const { data } = await api.delete(`/faqs/${id}`);
  return data;
};

// Reorder FAQs
export const reorderFAQs = async (orders: { id: number; displayOrder: number }[]) => {
  const { data } = await api.put("/faqs/reorder", { orders });
  return data;
};