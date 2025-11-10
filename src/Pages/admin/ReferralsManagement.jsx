// src/pages/admin/ReferralsManagement.jsx - UPDATED WITH REFERRAL SERVICE
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import Footer from "../../components/Footer";
import { isAdmin, getErrorMessage, formatDateTime } from "../../api";
// ✅ FIXED: Import referralService instead of using adminAPI directly
import { 
  getAllReferrals, 
  getAdminReferralStats, 
  getTopEarners,
  getReferralById,
  updateReferral,
  addCommission,
  searchReferrals
} from "../../services/referralService";
import { 
  Search, 
  Filter, 
  RefreshCw,
  Eye,
  Edit,
  DollarSign,
  Users,
  TrendingUp,
  Award,
  Copy,
  CheckCircle,
  Plus
} from "lucide-react";

const ReferralsManagement = () => {
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [stats, setStats] = useState(null);
  const [topEarners, setTopEarners] = useState([]);
  
  // Modal states
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddCommissionModal, setShowAddCommissionModal] = useState(false);
  
  // ✅ FIXED: Added referralCode to editData
  const [editData, setEditData] = useState({
    referralCode: "",
    referralEarnings: 0,
    totalCommission: 0
  });
  
  // Commission data
  const [commissionData, setCommissionData] = useState({
    amount: "",
    description: ""
  });
  
  const [processingId, setProcessingId] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    if (!isAdmin()) {
      navigate("/login");
      return;
    }
    fetchAllData();
  }, [navigate]);

  // ✅ FIXED: Using referralService functions
  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchReferrals(),
        fetchStats(),
        fetchTopEarners()
      ]);
    } catch (err) {
      console.error("Error fetching data:", err);
      alert(`Error: ${getErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Using referralService
  const fetchReferrals = async () => {
    try {
      console.log('📊 Fetching referrals...');
      const response = await getAllReferrals(1, 100);
      
      if (response.success) {
        console.log('✅ Referrals loaded:', response.referrals.length);
        setReferrals(response.referrals);
      }
    } catch (err) {
      console.error("Error fetching referrals:", err);
    }
  };

  // ✅ FIXED: Using referralService
  const fetchStats = async () => {
    try {
      const response = await getAdminReferralStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // ✅ FIXED: Using referralService
  const fetchTopEarners = async () => {
    try {
      const response = await getTopEarners(5);
      if (response.success) {
        setTopEarners(response.topEarners);
      }
    } catch (err) {
      console.error("Error fetching top earners:", err);
    }
  };

  // ✅ FIXED: Using referralService
  const handleViewDetails = async (referral) => {
    try {
      setProcessingId(referral._id);
      const response = await getReferralById(referral._id);
      
      if (response.success) {
        setSelectedReferral(response.referral);
        setShowDetailsModal(true);
      }
    } catch (err) {
      alert(`Error: ${getErrorMessage(err)}`);
    } finally {
      setProcessingId(null);
    }
  };

  // ✅ FIXED: Include referralCode in editData
  const handleEditReferral = (referral) => {
    setSelectedReferral(referral);
    setEditData({
      referralCode: referral.referralCode || "",
      referralEarnings: referral.referralEarnings || 0,
      totalCommission: referral.totalCommission || 0
    });
    setShowEditModal(true);
  };

  // ✅ FIXED: Using referralService with proper validation
  const handleUpdateReferral = async () => {
    if (!selectedReferral) return;

    // Validate referral code
    if (!editData.referralCode || editData.referralCode.trim() === "") {
      alert("Referral code is required!");
      return;
    }

    try {
      setProcessingId(selectedReferral._id);
      console.log('📝 Updating referral:', selectedReferral._id, editData);
      
      const response = await updateReferral(selectedReferral._id, {
        referralCode: editData.referralCode.toUpperCase(),
        referralEarnings: parseFloat(editData.referralEarnings) || 0,
        totalCommission: parseFloat(editData.totalCommission) || 0
      });
      
      if (response.success) {
        alert("✅ Referral updated successfully!");
        setShowEditModal(false);
        setSelectedReferral(null);
        // ✅ IMPORTANT: Refresh all data after update
        await fetchAllData();
      }
    } catch (err) {
      console.error('Update error:', err);
      alert(`❌ Error: ${getErrorMessage(err)}`);
    } finally {
      setProcessingId(null);
    }
  };

  // ✅ FIXED: Using referralService with better validation
  const handleAddCommission = async () => {
    if (!selectedReferral) {
      alert("No user selected");
      return;
    }

    if (!commissionData.amount || commissionData.amount.trim() === "") {
      alert("Please enter a commission amount");
      return;
    }

    const amount = parseFloat(commissionData.amount);
    
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid positive amount");
      return;
    }

    try {
      setProcessingId(selectedReferral._id);
      console.log('💰 Adding commission:', amount, 'to user:', selectedReferral._id);
      
      const response = await addCommission(selectedReferral._id, {
        amount: amount,
        description: commissionData.description || "Admin added commission"
      });
      
      if (response.success) {
        alert(`✅ Commission of $${amount.toFixed(2)} added successfully!`);
        setShowAddCommissionModal(false);
        setSelectedReferral(null);
        setCommissionData({ amount: "", description: "" });
        // ✅ IMPORTANT: Refresh all data after adding commission
        await fetchAllData();
      }
    } catch (err) {
      console.error("Add commission error:", err);
      alert(`❌ Error: ${getErrorMessage(err)}`);
    } finally {
      setProcessingId(null);
    }
  };

  // ✅ FIXED: Better referral code copying
  const copyReferralCode = (code) => {
    if (!code) {
      alert("This user doesn't have a referral code yet");
      return;
    }
    const referralUrl = `${window.location.origin}/register?ref=${code}`;
    navigator.clipboard.writeText(referralUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // ✅ FIXED: Using referralService for search
  const handleSearch = async () => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      // If search is empty, load all referrals
      fetchReferrals();
      return;
    }

    try {
      setLoading(true);
      const response = await searchReferrals(searchTerm);
      
      if (response.success) {
        setReferrals(response.results);
      }
    } catch (err) {
      console.error("Search error:", err);
      alert(`Search failed: ${getErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      approved: "bg-green-500/20 text-green-400 border-green-500",
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500",
      rejected: "bg-red-500/20 text-red-400 border-red-500",
      suspended: "bg-gray-500/20 text-gray-400 border-gray-500"
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs border ${styles[status] || styles.pending}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const filteredReferrals = referrals.filter(referral => {
    if (filterType === "all") return true;
    if (filterType === "active") return referral.referredUsersCount > 0;
    if (filterType === "earning") return (referral.totalCommission || 0) > 0;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading referrals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-yellow-400 mb-2">Referrals Management</h1>
          <p className="text-gray-400">Manage user referrals, commissions, and earnings</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="text-blue-400" size={24} />
                <TrendingUp className="text-green-400" size={20} />
              </div>
              <p className="text-gray-400 text-sm">Total Users with Referrals</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.totalUsersWithReferrals || 0}
              </p>
            </div>

            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="text-yellow-400" size={24} />
                <TrendingUp className="text-green-400" size={20} />
              </div>
              <p className="text-gray-400 text-sm">Total Referred Users</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.totalReferredUsers || 0}
              </p>
            </div>

            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="text-green-400" size={24} />
                <TrendingUp className="text-green-400" size={20} />
              </div>
              <p className="text-gray-400 text-sm">Total Commission Paid</p>
              <p className="text-2xl font-bold text-green-400 mt-1">
                ${(stats.totalCommissionPaid || 0).toFixed(2)}
              </p>
            </div>

            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="text-purple-400" size={24} />
                <TrendingUp className="text-green-400" size={20} />
              </div>
              <p className="text-gray-400 text-sm">Active Referrals</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.activeReferrals || 0}
              </p>
            </div>
          </div>
        )}

        {/* Top Earners Section */}
        {topEarners.length > 0 && (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center">
              <Award className="mr-2" size={20} />
              Top Referral Earners
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {topEarners.map((earner, index) => (
                <div key={earner._id} className="bg-black rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🏅"}
                  </div>
                  <p className="text-white font-semibold truncate">{earner.username}</p>
                  <p className="text-green-400 text-lg font-bold mt-1">
                    ${(earner.totalCommission || 0).toFixed(2)}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {earner.referredUsersCount || 0} referrals
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by username, email, or referral code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full bg-black border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400" size={20} />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-yellow-500 focus:outline-none"
              >
                <option value="all">All Referrals</option>
                <option value="active">Active (Has Referrals)</option>
                <option value="earning">Earning Commission</option>
              </select>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-semibold transition"
            >
              Search
            </button>

            {/* Refresh Button */}
            <button
              onClick={fetchAllData}
              className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition"
              title="Refresh Data"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Referrals Table */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black border-b border-gray-800">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-400">User</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-400">Referral Code</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-400">Status</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-400">Total Commission</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-400">Referrals</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReferrals.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-gray-400">
                      No referrals found
                    </td>
                  </tr>
                ) : (
                  filteredReferrals.map((referral) => (
                    <tr key={referral._id} className="border-b border-gray-800 hover:bg-black/50 transition">
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-white font-semibold">{referral.username}</p>
                          <p className="text-gray-400 text-xs">{referral.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <code className="bg-black px-2 py-1 rounded text-yellow-400 text-sm">
                            {referral.referralCode || 'N/A'}
                          </code>
                          {referral.referralCode && (
                            <button
                              onClick={() => copyReferralCode(referral.referralCode)}
                              className="text-gray-400 hover:text-yellow-400 transition"
                              title="Copy Referral URL"
                            >
                              {copiedCode === referral.referralCode ? (
                                <CheckCircle size={16} className="text-green-400" />
                              ) : (
                                <Copy size={16} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(referral.status)}
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-green-400 font-semibold">
                          ${(referral.totalCommission || 0).toFixed(2)}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Users size={16} className="text-gray-400" />
                          <span className="text-white">{referral.referredUsersCount || 0}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(referral)}
                            disabled={processingId === referral._id}
                            className="text-blue-400 hover:text-blue-300 transition p-2 hover:bg-blue-500/10 rounded"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEditReferral(referral)}
                            className="text-yellow-400 hover:text-yellow-300 transition p-2 hover:bg-yellow-500/10 rounded"
                            title="Edit Referral Data"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReferral(referral);
                              setShowAddCommissionModal(true);
                            }}
                            className="text-green-400 hover:text-green-300 transition p-2 hover:bg-green-500/10 rounded"
                            title="Add Commission"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 text-center text-gray-400 text-sm">
          Showing {filteredReferrals.length} of {referrals.length} referrals
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedReferral && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-yellow-500 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-semibold text-yellow-400 mb-6">Referral Details</h3>

            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Username</p>
                  <p className="text-white font-semibold">{selectedReferral.username}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white">{selectedReferral.email}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Referral Code</p>
                  <div className="flex items-center space-x-2">
                    <code className="bg-black px-3 py-1 rounded text-yellow-400">
                      {selectedReferral.referralCode}
                    </code>
                    <button
                      onClick={() => copyReferralCode(selectedReferral.referralCode)}
                      className="text-gray-400 hover:text-yellow-400"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  {getStatusBadge(selectedReferral.status)}
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Total Commission</p>
                  <p className="text-green-400 text-xl font-bold">
                    ${(selectedReferral.totalCommission || 0).toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Referral Earnings</p>
                  <p className="text-green-400 text-xl font-bold">
                    ${(selectedReferral.referralEarnings || 0).toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-sm">Member Since</p>
                  <p className="text-white">{formatDateTime(selectedReferral.createdAt)}</p>
                </div>
              </div>
            </div>

            {selectedReferral.referredUsers && selectedReferral.referredUsers.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-yellow-400 mb-3">
                  Referred Users ({selectedReferral.referredUsers.length})
                </h4>
                <div className="bg-black rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[#0d0d0d]">
                      <tr className="border-b border-gray-800">
                        <th className="py-3 px-4 text-left text-sm text-gray-400">Username</th>
                        <th className="py-3 px-4 text-left text-sm text-gray-400">Email</th>
                        <th className="py-3 px-4 text-left text-sm text-gray-400">Status</th>
                        <th className="py-3 px-4 text-left text-sm text-gray-400">Total Deposits</th>
                        <th className="py-3 px-4 text-left text-sm text-gray-400">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReferral.referredUsers.map((user) => (
                        <tr key={user._id} className="border-b border-gray-800">
                          <td className="py-3 px-4 text-white">{user.username}</td>
                          <td className="py-3 px-4 text-gray-400 text-sm">{user.email}</td>
                          <td className="py-3 px-4">{getStatusBadge(user.status)}</td>
                          <td className="py-3 px-4 text-green-400">
                            ${(user.totalDeposits || 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-gray-400 text-sm">
                            {formatDateTime(user.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedReferral.recentCommissions && selectedReferral.recentCommissions.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-yellow-400 mb-3">Recent Commissions</h4>
                <div className="space-y-2">
                  {selectedReferral.recentCommissions.map((commission) => (
                    <div key={commission._id} className="bg-black rounded p-3 flex justify-between items-center">
                      <div>
                        <p className="text-white font-semibold">
                          ${commission.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-400">{commission.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">
                          {formatDateTime(commission.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal - ✅ UPDATED with referralCode field */}
      {showEditModal && selectedReferral && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-yellow-500 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-yellow-400 mb-4">Edit Referral Data</h3>

            <div className="space-y-4">
              <div>
                <p className="text-gray-300 mb-2">
                  User: <span className="font-semibold text-white">{selectedReferral.username}</span>
                </p>
              </div>

              {/* ✅ NEW: Referral Code Field */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">Referral Code *</label>
                <input
                  type="text"
                  value={editData.referralCode}
                  onChange={(e) => setEditData({ ...editData, referralCode: e.target.value.toUpperCase() })}
                  className="w-full bg-black border border-gray-700 rounded px-4 py-2 text-white uppercase"
                  maxLength={8}
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  8 characters max, will be converted to uppercase
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Referral Earnings ($)</label>
                <input
                  type="number"
                  value={editData.referralEarnings}
                  onChange={(e) => setEditData({ ...editData, referralEarnings: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-black border border-gray-700 rounded px-4 py-2 text-white"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Total Commission ($)</label>
                <input
                  type="number"
                  value={editData.totalCommission}
                  onChange={(e) => setEditData({ ...editData, totalCommission: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-black border border-gray-700 rounded px-4 py-2 text-white"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleUpdateReferral}
                  disabled={processingId === selectedReferral._id}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black py-2 rounded font-semibold"
                >
                  {processingId === selectedReferral._id ? 'Updating...' : 'Update'}
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedReferral(null);
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Commission Modal */}
      {showAddCommissionModal && selectedReferral && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-green-500 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-green-400 mb-4">Add Commission</h3>

            <div className="space-y-4">
              <div>
                <p className="text-gray-300 mb-2">
                  User: <span className="font-semibold text-white">{selectedReferral.username}</span>
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  Current Commission: <span className="text-green-400 font-semibold">${(selectedReferral.totalCommission || 0).toFixed(2)}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Commission Amount ($) *</label>
                <input
                  type="number"
                  value={commissionData.amount}
                  onChange={(e) => setCommissionData({ ...commissionData, amount: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded px-4 py-2 text-white"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Description</label>
                <textarea
                  value={commissionData.description}
                  onChange={(e) => setCommissionData({ ...commissionData, description: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded px-4 py-2 text-white h-24"
                  placeholder="Optional description for this commission..."
                />
              </div>

              {/* Preview */}
              {commissionData.amount && !isNaN(parseFloat(commissionData.amount)) && parseFloat(commissionData.amount) > 0 && (
                <div className="bg-green-500/10 border border-green-500 rounded p-3">
                  <p className="text-xs text-gray-400 mb-1">Preview:</p>
                  <p className="text-sm text-green-400">
                    New Commission: <span className="font-bold">
                      ${((selectedReferral.totalCommission || 0) + parseFloat(commissionData.amount)).toFixed(2)}
                    </span>
                  </p>
                </div>
              )}

              <div className="bg-blue-500/10 border border-blue-500 rounded p-3">
                <p className="text-xs text-gray-400 mb-1">Note:</p>
                <p className="text-xs text-blue-400">
                  This will add commission to the user's referral earnings and update their account balance.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleAddCommission}
                  disabled={processingId === selectedReferral._id}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white py-2 rounded font-semibold"
                >
                  {processingId === selectedReferral._id ? 'Processing...' : 'Add Commission'}
                </button>
                <button
                  onClick={() => {
                    setShowAddCommissionModal(false);
                    setSelectedReferral(null);
                    setCommissionData({ amount: "", description: "" });
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ReferralsManagement;