// src/services/adminService.js
import api from '../api/axios';

export const adminService = {
  // Get dashboard statistics
  getStatistics: async () => {
    const response = await api.get('/admin/statistics');
    return response.data;
  },

  // Get recent activities
  getActivities: async (limit = 20) => {
    const response = await api.get(`/admin/activities?limit=${limit}`);
    return response.data;
  },

  // USER MANAGEMENT
  getAllUsers: async (page = 1, limit = 20, filters = {}) => {
    const params = new URLSearchParams({ page, limit, ...filters }).toString();
    const response = await api.get(`/admin/users?${params}`);
    return response.data;
  },

  getUserDetails: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  approveUser: async (userId) => {
    const response = await api.post(`/admin/users/${userId}/approve`);
    return response.data;
  },

  rejectUser: async (userId) => {
    const response = await api.post(`/admin/users/${userId}/reject`);
    return response.data;
  },

  updateUserBalances: async (userId, balances) => {
    const response = await api.put(`/admin/users/${userId}/balances`, balances);
    return response.data;
  },

  resetUserPassword: async (userId) => {
    const response = await api.post(`/admin/users/${userId}/reset-password`);
    return response.data;
  },

  // DEPOSIT MANAGEMENT
  getAllDeposits: async (page = 1, limit = 20, filters = {}) => {
    const params = new URLSearchParams({ page, limit, ...filters }).toString();
    const response = await api.get(`/admin/deposits?${params}`);
    return response.data;
  },

  // WITHDRAWAL MANAGEMENT
  getAllWithdrawals: async (page = 1, limit = 20, filters = {}) => {
    const params = new URLSearchParams({ page, limit, ...filters }).toString();
    const response = await api.get(`/admin/withdrawals?${params}`);
    return response.data;
  },

  // REFERRAL MANAGEMENT
  getAllReferrals: async (page = 1, limit = 20) => {
    const response = await api.get(`/admin/referrals?page=${page}&limit=${limit}`);
    return response.data;
  },

  updateReferralCommission: async (userId, commissionPercentage) => {
    const response = await api.put(`/admin/referrals/${userId}/commission`, {
      commissionPercentage,
    });
    return response.data;
  },
};