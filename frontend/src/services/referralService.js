// services/referralService.js - Frontend service for referral operations
import api from '../api';

/**
 * Referral Service
 * Handles all referral-related API calls
 */

// ============================================================
// USER REFERRAL ENDPOINTS
// ============================================================

/**
 * Get current user's referral data
 * @returns {Promise} User referral data including code, URL, and earnings
 */
export const getUserReferralData = async () => {
  try {
    const response = await api.get('/referrals/me');
    return response.data;
  } catch (error) {
    console.error('Get user referral data error:', error);
    throw error;
  }
};

/**
 * Get current user's referral statistics
 * @returns {Promise} Referral statistics including counts and earnings
 */
export const getReferralStats = async () => {
  try {
    const response = await api.get('/referrals/me/stats');
    return response.data;
  } catch (error) {
    console.error('Get referral stats error:', error);
    throw error;
  }
};

/**
 * Get list of users referred by current user
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of results per page
 * @returns {Promise} List of referred users with pagination
 */
export const getReferredUsers = async (page = 1, limit = 10) => {
  try {
    const response = await api.get('/referrals/me/referred-users', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Get referred users error:', error);
    throw error;
  }
};

// ============================================================
// ADMIN REFERRAL ENDPOINTS
// ============================================================

/**
 * Get all referrals (Admin only)
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of results per page
 * @returns {Promise} List of all referrals with pagination
 */
export const getAllReferrals = async (page = 1, limit = 100) => {
  try {
    const response = await api.get('/referrals/admin/all', {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Get all referrals error:', error);
    throw error;
  }
};

/**
 * Get admin referral statistics (Admin only)
 * @returns {Promise} Overall referral statistics for admin dashboard
 */
export const getAdminReferralStats = async () => {
  try {
    const response = await api.get('/referrals/admin/stats');
    return response.data;
  } catch (error) {
    console.error('Get admin referral stats error:', error);
    throw error;
  }
};

/**
 * Get top referral earners (Admin only)
 * @param {number} limit - Number of top earners to return
 * @returns {Promise} List of top referral earners
 */
export const getTopEarners = async (limit = 10) => {
  try {
    const response = await api.get('/referrals/admin/top-earners', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Get top earners error:', error);
    throw error;
  }
};

/**
 * Search referrals by username or code (Admin only)
 * @param {string} query - Search query string
 * @returns {Promise} List of matching referrals
 */
export const searchReferrals = async (query) => {
  try {
    const response = await api.get('/referrals/admin/search', {
      params: { query }
    });
    return response.data;
  } catch (error) {
    console.error('Search referrals error:', error);
    throw error;
  }
};

/**
 * Get specific referral by ID (Admin only)
 * @param {string} referralId - User/Referral ID
 * @returns {Promise} Detailed referral information
 */
export const getReferralById = async (referralId) => {
  try {
    const response = await api.get(`/referrals/admin/${referralId}`);
    return response.data;
  } catch (error) {
    console.error('Get referral by ID error:', error);
    throw error;
  }
};

/**
 * Update referral data (Admin only)
 * @param {string} referralId - User/Referral ID
 * @param {Object} data - Data to update (referralEarnings, totalCommission, referralCode)
 * @returns {Promise} Updated referral data
 */
export const updateReferral = async (referralId, data) => {
  try {
    const response = await api.put(`/referrals/admin/${referralId}`, data);
    return response.data;
  } catch (error) {
    console.error('Update referral error:', error);
    throw error;
  }
};

/**
 * Add commission to referral (Admin only)
 * @param {string} referralId - User/Referral ID
 * @param {Object} data - Commission data { amount, description }
 * @returns {Promise} Updated user and transaction data
 */
export const addCommission = async (referralId, data) => {
  try {
    // Validate amount before sending
    if (!data.amount || isNaN(data.amount) || Number(data.amount) <= 0) {
      throw new Error('Valid commission amount is required');
    }

    const response = await api.post(`/referrals/admin/${referralId}/commission`, {
      amount: Number(data.amount),
      description: data.description || 'Admin added referral commission'
    });
    return response.data;
  } catch (error) {
    console.error('Add commission error:', error);
    throw error;
  }
};

/**
 * Delete/Reset referral record (Admin only)
 * @param {string} referralId - User/Referral ID
 * @returns {Promise} Confirmation of deletion
 */
export const deleteReferral = async (referralId) => {
  try {
    const response = await api.delete(`/referrals/admin/${referralId}`);
    return response.data;
  } catch (error) {
    console.error('Delete referral error:', error);
    throw error;
  }
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Generate referral URL for a given referral code
 * @param {string} referralCode - The referral code
 * @param {string} baseUrl - Base URL of the frontend (optional)
 * @returns {string} Complete referral URL
 */
export const generateReferralUrl = (referralCode, baseUrl) => {
  const frontendUrl = baseUrl || window.location.origin;
  return `${frontendUrl}/register?ref=${referralCode}`;
};

/**
 * Copy referral URL to clipboard
 * @param {string} referralUrl - The referral URL to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyReferralUrl = async (referralUrl) => {
  try {
    await navigator.clipboard.writeText(referralUrl);
    return true;
  } catch (error) {
    console.error('Copy to clipboard error:', error);
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = referralUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (fallbackError) {
      console.error('Fallback copy error:', fallbackError);
      return false;
    }
  }
};

/**
 * Format commission amount for display
 * @param {number} amount - Commission amount
 * @param {string} currency - Currency symbol (default: $)
 * @returns {string} Formatted commission string
 */
export const formatCommission = (amount, currency = '$') => {
  if (!amount || isNaN(amount)) return `${currency}0.00`;
  return `${currency}${Number(amount).toFixed(2)}`;
};

/**
 * Calculate commission based on deposit amount and rate
 * @param {number} depositAmount - Deposit amount
 * @param {number} commissionRate - Commission rate (percentage)
 * @returns {number} Calculated commission
 */
export const calculateCommission = (depositAmount, commissionRate) => {
  if (!depositAmount || !commissionRate || isNaN(depositAmount) || isNaN(commissionRate)) {
    return 0;
  }
  return (Number(depositAmount) * Number(commissionRate)) / 100;
};

// Export all functions as default object
export default {
  // User endpoints
  getUserReferralData,
  getReferralStats,
  getReferredUsers,
  
  // Admin endpoints
  getAllReferrals,
  getAdminReferralStats,
  getTopEarners,
  searchReferrals,
  getReferralById,
  updateReferral,
  addCommission,
  deleteReferral,
  
  // Helper functions
  generateReferralUrl,
  copyReferralUrl,
  formatCommission,
  calculateCommission
};