// src/services/depositService.js
import api from '../api/axios';

export const depositService = {
  // Create deposit
  createDeposit: async (depositData) => {
    const response = await api.post('/deposits/create', depositData);
    return response.data;
  },

  // Get user deposits
  getUserDeposits: async () => {
    const response = await api.get('/deposits/user-deposits');
    return response.data;
  },

  // Get active deposits
  getActiveDeposits: async () => {
    const response = await api.get('/deposits/active');
    return response.data;
  },

  // Get deposit by ID
  getDepositById: async (depositId) => {
    const response = await api.get(`/deposits/${depositId}`);
    return response.data;
  },
};