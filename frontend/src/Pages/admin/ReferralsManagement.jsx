// src/pages/admin/ReferralsManagement.jsx - MOBILE RESPONSIVE VERSION
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import Footer from "../../components/Footer";
import { isAdmin, getErrorMessage, formatDateTime } from "../../api";
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
  
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddCommissionModal, setShowAddCommissionModal] = useState(false);
  
  const [editData, setEditData] = useState({
    referralCode: "",
    referralEarnings: 0,
    totalCommission: 0
  });
  
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

  const fetchReferrals = async () => {
    try {
      const response = await getAllReferrals(1, 100);
      if (response.success) {
        setReferrals(response.referrals);
      }
    } catch (err) {
      console.error("Error fetching referrals:", err);
    }
  };

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

  const handleEditReferral = (referral) => {
    setSelectedReferral(referral);
    setEditData({
      referralCode: referral.referralCode || "",
      referralEarnings: referral.referralEarnings || 0,
      totalCommission: referral.totalCommission || 0
    });
    setShowEditModal(true);
  };

  const handleUpdateReferral = async () => {
    if (!selectedReferral) return;
    if (!editData.referralCode || editData.referralCode.trim() === "") {
      alert("Referral code is required!");
      return;
    }

    try {
      setProcessingId(selectedReferral._id);
      const response = await updateReferral(selectedReferral._id, {
        referralCode: editData.referralCode.toUpperCase(),
        referralEarnings: parseFloat(editData.referralEarnings) || 0,
        totalCommission: parseFloat(editData.totalCommission) || 0
      });
      
      if (response.success) {
        alert("✅ Referral updated successfully!");
        setShowEditModal(false);
        setSelectedReferral(null);
        await fetchAllData();
      }
    } catch (err) {
      alert(`❌ Error: ${getErrorMessage(err)}`);
    } finally {
      setProcessingId(null);
    }
  };

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
      const response = await addCommission(selectedReferral._id, {
        amount: amount,
        description: commissionData.description || "Admin added commission"
      });
      
      if (response.success) {
        alert("✅ Commission added successfully!");
        setShowAddCommissionModal(false);
        setSelectedReferral(null);
        setCommissionData({ amount: "", description: "" });
        await fetchAllData();
      }
    } catch (err) {
      alert(`❌ Error: ${getErrorMessage(err)}`);
    } finally {
      setProcessingId(null);
    }
  };

  const copyReferralCode = (code) => {
    const referralUrl = `${window.location.origin}/register?ref=${code}`;
    navigator.clipboard.writeText(referralUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-green-500/20 text-green-400 border-green-500",
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500",
      deactivated: "bg-red-500/20 text-red-400 border-red-500",
    };
    return (
      <span className={`px-2 md:px-3 py-1 rounded-full text-xs border font-semibold ${styles[status] || styles.active}`}>
        {status?.toUpperCase() || 'ACTIVE'}
      </span>
    );
  };

  const filteredReferrals = referrals.filter((ref) => {
    const matchesSearch = ref.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ref.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ref.referralCode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === "all") return matchesSearch;
    if (filterType === "active") return matchesSearch && (ref.referredUsersCount > 0);
    if (filterType === "earning") return matchesSearch && (ref.totalCommission > 0);
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#111] text-white font-sans">
      <AdminNavbar />

      <main className="px-4 md:px-10 lg:px-20 py-6 md:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Referrals Management</h1>
            <p className="text-sm md:text-base text-gray-400">Manage referral system and commissions</p>
          </div>
          <button
            onClick={fetchAllData}
            className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded font-semibold flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
            <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm mb-1">Total Users</p>
                  <h3 className="text-xl md:text-2xl font-bold text-blue-400">{stats.totalUsers || 0}</h3>
                </div>
                <Users className="w-8 h-8 md:w-10 md:h-10 text-blue-400" />
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm mb-1">Active Referrers</p>
                  <h3 className="text-xl md:text-2xl font-bold text-green-400">{stats.activeReferrers || 0}</h3>
                </div>
                <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-green-400" />
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm mb-1">Total Commission</p>
                  <h3 className="text-lg md:text-xl font-bold text-yellow-400">${(stats.totalCommissionPaid || 0).toFixed(2)}</h3>
                </div>
                <DollarSign className="w-8 h-8 md:w-10 md:h-10 text-yellow-400" />
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500 rounded-lg p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm mb-1">Total Referrals</p>
                  <h3 className="text-xl md:text-2xl font-bold text-purple-400">{stats.totalReferrals || 0}</h3>
                </div>
                <Users className="w-8 h-8 md:w-10 md:h-10 text-purple-400" />
              </div>
            </div>
          </div>
        )}

        {/* Top Earners */}
        {topEarners.length > 0 && (
          <div className="bg-black border border-[#222] rounded-lg p-4 md:p-6 mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Award className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
              <h3 className="text-lg md:text-xl font-semibold text-yellow-400">Top Earners</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
              {topEarners.map((earner, index) => (
                <div key={earner._id} className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-3 md:p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-yellow-400 font-bold text-lg">#{index + 1}</span>
                    <span className="text-sm font-semibold text-white truncate">{earner.username}</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-1">{earner.referredUsersCount || 0} referrals</div>
                  <div className="text-green-400 font-bold text-sm md:text-base">${(earner.totalCommission || 0).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-black border border-[#222] rounded-lg p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
              <input
                type="text"
                placeholder="Search by username, email or referral code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded pl-9 md:pl-10 pr-4 py-2 text-white placeholder-gray-500 text-sm md:text-base"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded pl-9 md:pl-10 pr-4 py-2 text-white text-sm md:text-base appearance-none cursor-pointer"
              >
                <option value="all">All Referrals</option>
                <option value="active">Active (Has Referrals)</option>
                <option value="earning">Earning Commission</option>
              </select>
            </div>
          </div>
        </div>

        {/* Referrals Table/Cards */}
        <div className="bg-black border border-[#222] rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading referrals...</p>
            </div>
          ) : filteredReferrals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No referrals found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#1a1a1a]">
                    <tr className="border-b border-gray-700">
                      <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">User</th>
                      <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">Referral Code</th>
                      <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">Status</th>
                      <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">Commission</th>
                      <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">Referrals</th>
                      <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReferrals.map((referral) => (
                      <tr key={referral._id} className="border-b border-gray-800 hover:bg-[#1a1a1a] transition">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-semibold text-white">{referral.username}</div>
                            <div className="text-xs text-gray-400">{referral.email}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <code className="bg-black px-2 py-1 rounded text-yellow-400 text-sm">
                              {referral.referralCode || 'N/A'}
                            </code>
                            {referral.referralCode && (
                              <button
                                onClick={() => copyReferralCode(referral.referralCode)}
                                className="text-gray-400 hover:text-yellow-400 transition"
                              >
                                {copiedCode === referral.referralCode ? (
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">{getStatusBadge(referral.status)}</td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-green-400">
                            ${(referral.totalCommission || 0).toFixed(2)}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-white">{referral.referredUsersCount || 0}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewDetails(referral)}
                              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditReferral(referral)}
                              className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded transition"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedReferral(referral);
                                setShowAddCommissionModal(true);
                              }}
                              className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded transition"
                              title="Add Commission"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden p-4 space-y-4">
                {filteredReferrals.map((referral) => (
                  <div key={referral._id} className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-sm mb-1">{referral.username}</h3>
                        <p className="text-xs text-gray-400">{referral.email}</p>
                      </div>
                      {getStatusBadge(referral.status)}
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Referral Code</span>
                        <div className="flex items-center space-x-2">
                          <code className="bg-black px-2 py-1 rounded text-yellow-400 text-xs">
                            {referral.referralCode || 'N/A'}
                          </code>
                          {referral.referralCode && (
                            <button
                              onClick={() => copyReferralCode(referral.referralCode)}
                              className="text-gray-400 hover:text-yellow-400"
                            >
                              {copiedCode === referral.referralCode ? (
                                <CheckCircle className="w-3 h-3 text-green-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Commission</span>
                        <span className="text-sm font-semibold text-green-400">
                          ${(referral.totalCommission || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Referrals</span>
                        <span className="text-sm text-white">{referral.referredUsersCount || 0}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-800">
                      <button
                        onClick={() => handleViewDetails(referral)}
                        className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 rounded text-xs font-semibold transition flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleEditReferral(referral)}
                        className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 py-2 rounded text-xs font-semibold transition flex items-center justify-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedReferral(referral);
                          setShowAddCommissionModal(true);
                        }}
                        className="bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 rounded text-xs font-semibold transition flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add $</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Details Modal - Simplified for brevity */}
      {showDetailsModal && selectedReferral && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-yellow-500 rounded-lg p-4 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg md:text-xl font-semibold text-yellow-400 mb-4">Referral Details</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400">User</p>
                  <p className="text-sm font-semibold text-white">{selectedReferral.username}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Referral Code</p>
                  <code className="text-sm text-yellow-400">{selectedReferral.referralCode}</code>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400">Total Commission</p>
                  <p className="text-base font-bold text-green-400">${(selectedReferral.totalCommission || 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Referrals</p>
                  <p className="text-base font-bold text-white">{selectedReferral.referredUsersCount || 0}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded font-semibold mt-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedReferral && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-yellow-500 rounded-lg p-4 md:p-6 max-w-md w-full">
            <h3 className="text-lg md:text-xl font-semibold text-yellow-400 mb-4">Edit Referral Data</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs md:text-sm text-gray-300 mb-2">Referral Code *</label>
                <input
                  type="text"
                  value={editData.referralCode}
                  onChange={(e) => setEditData({ ...editData, referralCode: e.target.value.toUpperCase() })}
                  className="w-full bg-black border border-gray-700 rounded px-3 md:px-4 py-2 text-white uppercase text-sm md:text-base"
                  maxLength={8}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-gray-300 mb-2">Referral Earnings ($)</label>
                <input
                  type="number"
                  value={editData.referralEarnings}
                  onChange={(e) => setEditData({ ...editData, referralEarnings: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-black border border-gray-700 rounded px-3 md:px-4 py-2 text-white text-sm md:text-base"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-gray-300 mb-2">Total Commission ($)</label>
                <input
                  type="number"
                  value={editData.totalCommission}
                  onChange={(e) => setEditData({ ...editData, totalCommission: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-black border border-gray-700 rounded px-3 md:px-4 py-2 text-white text-sm md:text-base"
                  step="0.01"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
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
          <div className="bg-[#1a1a1a] border border-green-500 rounded-lg p-4 md:p-6 max-w-md w-full">
            <h3 className="text-lg md:text-xl font-semibold text-green-400 mb-4">Add Commission</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-300 mb-2">
                  User: <span className="font-semibold text-white">{selectedReferral.username}</span>
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Current: <span className="text-green-400 font-semibold">${(selectedReferral.totalCommission || 0).toFixed(2)}</span>
                </p>
              </div>
              <div>
                <label className="block text-xs md:text-sm text-gray-300 mb-2">Amount ($) *</label>
                <input
                  type="number"
                  value={commissionData.amount}
                  onChange={(e) => setCommissionData({ ...commissionData, amount: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded px-3 md:px-4 py-2 text-white text-sm md:text-base"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm text-gray-300 mb-2">Description</label>
                <textarea
                  value={commissionData.description}
                  onChange={(e) => setCommissionData({ ...commissionData, description: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded px-3 md:px-4 py-2 text-white h-20 text-sm md:text-base"
                  placeholder="Optional..."
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
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