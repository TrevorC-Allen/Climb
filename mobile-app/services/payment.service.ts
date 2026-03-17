import api from './api';
import { Payment, CreatePaymentDto } from '../types';

export const paymentService = {
  async create(amount: number, type: 'gym_ticket' | 'membership' | 'coaching', description?: string) {
    const response = await api.post<Payment>('/payments', {
      amount,
      type,
      description,
    });
    return response.data;
  },

  async getByOrderId(orderId: string) {
    const response = await api.get<Payment>(`/payments/orders/${orderId}`);
    return response.data;
  },

  async getMyPayments() {
    const response = await api.get<Payment[]>('/payments');
    return response.data;
  },
};
