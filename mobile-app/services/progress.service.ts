import api from './api';
import { ProgressStats, HistoryItem } from '../types';

export const progressService = {
  async getStats() {
    const response = await api.get<ProgressStats>('/progress/stats');
    return response.data;
  },

  async getHistory() {
    const response = await api.get<HistoryItem[]>('/progress/history');
    return response.data;
  },
};
