// src/services/withdrawalService.js
import api from '../api/axios';

export const withdrawalService = {
  // Request withdrawal (first click)
  requestWithdrawal: async (withdrawalData) => {
    const response = await api.post('/withdrawals/request', withdrawalData);
    return response.data;
  },

  // Confirm withdrawal (second click)
  confirmWithdrawal: async (withdrawalId) => {
    const response = await api.put(`/withdrawals/confirm/${withdrawalId}`);
    return response.data;
  },

  // Get user withdrawals
  getUserWithdrawals: async () => {
    const response = await api.get('/withdrawals/user-withdrawals');
    return response.data;
  },

  // Get withdrawal by ID
  getWithdrawalById: async (withdrawalId) => {
    const response = await api.get(`/withdrawals/${withdrawalId}`);
    return response.data;
  },
};