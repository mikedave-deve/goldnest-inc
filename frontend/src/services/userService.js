// src/services/userService.js
import api from '../api/axios';

export const userService = {
  // Get dashboard data
  getDashboard: async () => {
    const response = await api.get('/user/dashboard');
    return response.data;
  },

  // Get profile
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },

  // Get balances
  getBalances: async () => {
    const response = await api.get('/user/balances');
    return response.data;
  },

  // Get referral data
  getReferrals: async () => {
    const response = await api.get('/user/referrals');
    return response.data;
  },

  // Get statistics
  getStatistics: async () => {
    const response = await api.get('/user/statistics');
    return response.data;
  },
};