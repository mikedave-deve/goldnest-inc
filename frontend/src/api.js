// src/api.js - COMPLETE FIXED VERSION WITH REFERRAL SUPPORT
import axios from "axios";

// ========== CONFIGURATION ==========
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://goldnest-inc-backend.vercel.app/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// ========== INTERCEPTORS ==========
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ========== AUTH APIs ==========
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  confirmPasswordReset: (data) => api.post("/auth/confirm-password-reset", data),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  changePassword: (data) => api.put("/auth/change-password", data),
};

// ========== USER APIs ==========
export const userAPI = {
  getProfile: () => api.get("/user/profile"),
  getBalances: () => api.get("/user/balances"),
  getDashboard: () => api.get("/user/dashboard"),
  getReferrals: () => api.get("/user/referrals"),
  getStatistics: () => api.get("/user/statistics"),
};

// ========== DEPOSIT APIs ==========
export const depositAPI = {
  create: (data) => api.post("/deposits/create", data),
  getUserDeposits: (params) => api.get("/deposits/user-deposits", { params }),
  getById: (id) => api.get(`/deposits/${id}`),
  approve: (id) => api.put(`/deposits/approve/${id}`),
  reject: (id, data) => api.put(`/deposits/reject/${id}`, data),
};

// ========== WITHDRAWAL APIs ==========
export const withdrawalAPI = {
  request: (data) => api.post("/withdrawals/request", data),
  confirm: (id) => api.put(`/withdrawals/confirm/${id}`),
  getUserWithdrawals: (params) => api.get("/withdrawals/user-withdrawals", { params }),
  getById: (id) => api.get(`/withdrawals/${id}`),
  approve: (id) => api.put(`/withdrawals/approve/${id}`),
  reject: (id, data) => api.put(`/withdrawals/reject/${id}`, data),
};

// ========== TRANSACTION APIs ==========
export const transactionAPI = {
  getHistory: (params) => api.get("/transactions/history", { params }),
  search: (params) => api.get("/transactions/search", { params }),
  filter: (params) => api.get("/transactions/filter", { params }),
  getStatistics: () => api.get("/transactions/statistics"),
  getById: (id) => api.get(`/transactions/${id}`),
};

// ========== ADMIN APIs - COMPLETE ==========
export const adminAPI = {
  // ===== Dashboard & Statistics =====
  getStatistics: () => api.get("/admin/statistics"),
  getActivities: () => api.get("/admin/activities"),

  // ===== User Management =====
  getAllUsers: (params) => api.get("/admin/users", { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  approveUser: (id) => api.post(`/admin/users/${id}/approve`),
  rejectUser: (id, data) => api.post(`/admin/users/${id}/reject`, data),
  updateUserBalances: (id, data) => api.put(`/admin/users/${id}/balances`, data),
  resetUserPassword: (id) => api.post(`/admin/users/${id}/reset-password`),
  searchUsers: (searchTerm) => api.get("/admin/users/search", { params: { q: searchTerm } }),

  // ===== Deposit Management =====
  getAllDeposits: (params) => api.get("/admin/deposits", { params }),
  approveDeposit: (id) => api.put(`/deposits/approve/${id}`),
  rejectDeposit: (id, data) => api.put(`/deposits/reject/${id}`, data),

  // ===== Withdrawal Management ===== 
  getAllWithdrawals: (params) => api.get("/withdrawals/all", { params }),
  approveWithdrawal: (id, data = {}) => api.put(`/withdrawals/approve/${id}`, data),
  completeWithdrawal: (withdrawalId, data) => api.put(`/withdrawals/complete/${withdrawalId}`, data),
  rejectWithdrawal: (id, data) => api.put(`/withdrawals/reject/${id}`, data),

  // ===== Transaction Management =====
  getAllTransactions: (params) => api.get("/transactions/all", { params }),
  createTransaction: (data) => api.post("/admin/transactions", data),
  updateTransaction: (id, data) => api.put(`/admin/transactions/${id}`, data),
  deleteTransaction: (id) => api.delete(`/admin/transactions/${id}`),

 // ===== Settings Management =====
  getSettings: () => api.get("/admin/settings"),
  updateSettings: (settings) => api.put("/admin/settings", settings),

  // ===== Referral Management - COMPLETE =====
  // Generic methods for direct API access
  get: (endpoint, config) => api.get(endpoint, config),
  put: (endpoint, data) => api.put(endpoint, data),
  post: (endpoint, data) => api.post(endpoint, data),
  delete: (endpoint) => api.delete(endpoint),
};

// ========== AUTHENTICATION HELPERS ==========
export const storeAuth = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("userInfo", JSON.stringify(user));
};

export const getUserInfo = () => {
  const userInfo = localStorage.getItem("userInfo");
  return userInfo ? JSON.parse(userInfo) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

export const isAdmin = () => {
  const userInfo = getUserInfo();
  return userInfo?.role === "admin";
};

export const isApproved = () => {
  const userInfo = getUserInfo();
  return userInfo?.status === "approved";
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userInfo");
  window.location.href = "/login";
};

// ========== UTILITY HELPERS ==========
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return "An unexpected error occurred. Please try again.";
};

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getStatusColor = (status) => {
  const statusColors = {
    pending: "text-yellow-400",
    approved: "text-green-400",
    rejected: "text-red-400",
    completed: "text-green-400",
    cancelled: "text-gray-400",
    active: "text-green-400",
    inactive: "text-gray-400",
  };
  return statusColors[status?.toLowerCase()] || "text-gray-400";
};

export const getTransactionTypeLabel = (type) => {
  const labels = {
    deposit: "Deposit",
    withdrawal: "Withdrawal",
    profit: "Profit",
    earning: "Earning",
    referral_commission: "Referral Commission",
    commission: "Commission",
    bonus: "Bonus",
    refund: "Refund",
    fee: "Fee",
  };
  return labels[type] || type;
};

export const calculatePercentageChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s-()]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy:", error);
    return false;
  }
};

export const downloadJSON = (data, filename) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ========== CONSTANTS ==========
export const TRANSACTION_TYPES = {
  DEPOSIT: "deposit",
  WITHDRAWAL: "withdrawal",
  EARNING: "earning",
  PROFIT: "profit",
  REFERRAL_COMMISSION: "referral_commission",
  COMMISSION: "commission",
  BONUS: "bonus",
  REFUND: "refund",
  FEE: "fee",
};

export const TRANSACTION_STATUSES = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const USER_STATUSES = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  ACTIVE: "active",
  INACTIVE: "inactive",
};

export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
};

export default api;