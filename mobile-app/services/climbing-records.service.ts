import api from './api';
import { ClimbingRecord, CreateRecordDto } from '../types';

export const climbingRecordsService = {
  async create(record: CreateRecordDto) {
    const response = await api.post<ClimbingRecord>('/climbing-records', record);
    return response.data;
  },

  async getAll(limit?: number) {
    const response = await api.get<ClimbingRecord[]>('/climbing-records', {
      params: { limit },
    });
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get<ClimbingRecord>(`/climbing-records/${id}`);
    return response.data;
  },
};
