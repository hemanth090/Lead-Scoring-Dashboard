import axios from 'axios';
import { LeadFormData, LeadScore, Lead, LeadStats } from '../types';

// Create axios instance with base URL
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV
      ? 'http://localhost:8000' // Local development
      : 'https://YOUR-BACKEND.vercel.app'), // Production fallback (Vercel)
});

// API functions
export const scoreLead = async (leadData: LeadFormData): Promise<LeadScore> => {
  try {
    const response = await api.post<LeadScore>('/score', leadData);
    return response.data;
  } catch (error) {
    console.error('Error scoring lead:', error);
    throw error;
  }
};

export const getLeads = async (): Promise<Lead[]> => {
  try {
    const response = await api.get<Lead[]>('/leads');
    return response.data;
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }
};

export const getLeadStats = async (): Promise<LeadStats> => {
  try {
    const response = await api.get<LeadStats>('/leads/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching lead stats:', error);
    throw error;
  }
};

export const checkHealth = async (): Promise<{ status: string; model_loaded: boolean }> => {
  try {
    const response = await api.get<{ status: string; model_loaded: boolean }>('/health');
    return response.data;
  } catch (error) {
    console.error('Error checking API health:', error);
    throw error;
  }
};