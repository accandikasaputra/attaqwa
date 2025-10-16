import api from "./api";

export interface Feedback {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied";
  reply?: string;
  readBy?: number;
  readAt?: string;
  repliedBy?: number;
  repliedAt?: string;
  createdAt: string;
}

export interface CreateFeedbackRequest {
  name: string;
  email?: string;
  phone?: string;
  subject: string;
  message: string;
}

// Get all feedback with filters (admin)
export const getAllFeedback = async (params?: {
  status?: string;
  search?: string;
}) => {
  const { data } = await api.get("/feedback", { params });
  return data;
};

// Get feedback detail
export const getFeedbackDetail = async (id: number) => {
  const { data } = await api.get(`/feedback/${id}`);
  return data;
};

// Create feedback (public)
export const createFeedback = async (payload: CreateFeedbackRequest & { recaptchaToken?: string }) => {
  const { data } = await api.post("/feedback", payload);
  return data;
};

// Mark as read
export const markFeedbackAsRead = async (id: number) => {
  const { data } = await api.put(`/feedback/${id}/read`);
  return data;
};

// Reply to feedback
export const replyFeedback = async (id: number, reply: string) => {
  const { data } = await api.put(`/feedback/${id}/reply`, { reply });
  return data;
};

// Delete feedback
export const deleteFeedback = async (id: number) => {
  const { data } = await api.delete(`/feedback/${id}`);
  return data;
};