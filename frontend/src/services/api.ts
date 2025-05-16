import axios, { AxiosError } from 'axios';
import { Credential, User, UserRole, DashboardMetrics, ProductHistory, Activity } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Custom error class for API errors
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// DID Services
export const createDID = async (issuerIdentifier: string, subjectIdentifier: string): Promise<any> => {
  try {
    const response = await api.post('/did/create', {
      issuerIdentifier,
      subjectIdentifier,
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Verifiable Credential Services
export const issueVC = async (issuerDid: string, subjectDid: string, credentialData: any): Promise<any> => {
  try {
    const response = await api.post('/vc/issue', {
      issuerDid,
      subjectDid,
      credentialData,
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const verifyVC = async (subjectDid: string): Promise<any> => {
  try {
    const response = await api.post('/vc/verify', { subjectDid });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// User Services
export const connectDID = async (did: string, role: UserRole): Promise<User> => {
  try {
    const response = await api.post('/user/connect', { did, role });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Product Services
export const getProductHistory = async (productId: string): Promise<ProductHistory> => {
  try {
    const response = await api.get(`/product/${productId}/history`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getProductTimeline = async (productId: string): Promise<{ product: ProductHistory; timeline: Activity[] }> => {
  try {
    const response = await api.get(`/api/products/${productId}/timeline`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new APIError('Product not found');
      }
      throw new APIError(error.response?.data?.message || 'Failed to fetch product timeline');
    }
    throw new APIError('Failed to fetch product timeline');
  }
};

// Dashboard Services
export const getDashboardMetrics = async (role: UserRole): Promise<DashboardMetrics> => {
  try {
    const response = await api.get(`/dashboard/metrics?role=${role}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message: string }>;
      if (axiosError.response?.status === 404) {
        throw new APIError('Dashboard metrics endpoint not found. Please check if the backend server is running.');
      }
      throw new APIError(
        axiosError.response?.data?.message || 'Failed to fetch dashboard metrics',
        axiosError.response?.status
      );
    }
    throw new APIError('Failed to fetch dashboard metrics');
  }
};

export const createSubjectDID = async (productDetails: any, issuerDID: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/did/create-subject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productDetails, issuerDID }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new APIError(error.message || 'Failed to create subject DID');
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Failed to create subject DID');
  }
};

// Error handling helper
const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message: string }>;
    // Check for network errors or connection refused
    if (!axiosError.response || axiosError.code === 'ERR_NETWORK' || axiosError.code === 'ECONNREFUSED') {
      throw new APIError('Backend service is currently unavailable. Using offline data.', 503);
    }
    throw new APIError(
      axiosError.response?.data?.message || 'An unexpected error occurred',
      axiosError.response?.status,
      axiosError.code
    );
  }
  throw new APIError('An unexpected error occurred');
};

// Error handling interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      // Log network errors but don't show them to the user
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        console.warn('Backend service unavailable:', error.message);
      } else {
        console.error('API Error:', error.response?.data || error.message);
      }
    }
    return Promise.reject(error);
  }
);

export const getPotentialRecipients = async (role: string): Promise<Array<{ did: string; name: string }>> => {
  try {
    const response = await api.get(`/did/potential-recipients?role=${role}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new APIError(error.response?.data?.message || 'Failed to fetch potential recipients');
    }
    throw new APIError('Failed to fetch potential recipients');
  }
};

export default api; 