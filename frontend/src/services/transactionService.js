// src/services/transactionService.js
import api from '../api/axios';

export const transactionService = {
  // Get transaction history
  getHistory: async (page = 1, limit = 20) => {
    const response = await api.get(`/transactions/history?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Search transactions
  searchTransactions: async (query, filters = {}) => {
    const params = new URLSearchParams({ query, ...filters }).toString();
    const response = await api.get(`/transactions/search?${params}`);
    return response.data;
  },

  // Filter transactions
  filterTransactions: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/transactions/filter?${params}`);
    return response.data;
  },

  // Get statistics
  getStatistics: async () => {
    const response = await api.get('/transactions/statistics');
    return response.data;
  },

  // Get transaction by ID
  getTransactionById: async (transactionId) => {
    const response = await api.get(`/transactions/${transactionId}`);
    return response.data;
  },
};