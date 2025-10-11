import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance with auth interceptor
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface News {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string | null;
  category: 'update-pembangunan' | 'kegiatan' | 'pengumuman';
  status: 'draft' | 'published';
  publishedAt: string | null;
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewsListResponse {
  success: boolean;
  message: string;
  data: News[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface NewsResponse {
  success: boolean;
  message: string;
  data: News;
}

export const newsApi = {
  // Get all news with pagination & filter
  getAll: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
  }): Promise<NewsListResponse> => {
    const response = await api.get('/news', { params });
    return response.data;
  },

  // Get single news by ID
  getById: async (id: number): Promise<NewsResponse> => {
    const response = await api.get(`/news/${id}`);
    return response.data;
  },

  // Create news
  create: async (data: Omit<News, 'id' | 'slug' | 'createdAt' | 'updatedAt' | 'authorId'>): Promise<NewsResponse> => {
    const response = await api.post('/news', data);
    return response.data;
  },

  // Update news
  update: async (id: number, data: Partial<Omit<News, 'id' | 'createdAt' | 'updatedAt' | 'authorId'>>): Promise<NewsResponse> => {
    const response = await api.put(`/news/${id}`, data);
    return response.data;
  },

  // Delete news
  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/news/${id}`);
    return response.data;
  },

  // Quick update status
  updateStatus: async (id: number, status: 'draft' | 'published'): Promise<NewsResponse> => {
    const response = await api.put(`/news/${id}`, { status });
    return response.data;
  },
};