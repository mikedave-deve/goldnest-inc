// src/pages/admin/WithdrawalsManagement.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import Footer from "../../components/Footer";
import { adminAPI, isAdmin, getErrorMessage, formatDateTime } from "../../api";
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle,
  Eye,
  RefreshCw,
  TrendingDown,
  Clock,
  AlertCircle
} from "lucide-react";

const WithdrawalsManagement = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "all");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [completionData, setCompletionData] = useState({ transactionHash: "" });
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (!isAdmin()) {
      navigate("/login");
      return;
    }
    fetchWithdrawals();
  }, [navigate, filterStatus]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus !== "all") {
        params.status = filterStatus;
      }

      const response = await adminAPI.getAllWithdrawals(params);
      if (response.data.success) {
        setWithdrawals(response.data.withdrawals);
      }
    } catch (err) {
      console.error("Error fetching withdrawals:", err);
      alert(`Error: ${getErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWithdrawal = async (withdrawalId) => {
    if (!window.confirm("Are you sure you want to approve this withdrawal? This will deduct the amount from user's balance.")) return;

    try {
      setProcessingId(withdrawalId);
      const response = await adminAPI.approveWithdrawal(withdrawalId);
      if (response.data.success) {
        alert("Withdrawal approved successfully! User's balance has been updated.");
        fetchWithdrawals();
      }
    } catch (err) {
      alert(`Error: ${getErrorMessage(err)}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectWithdrawal = async () => {
    if (!selectedWithdrawal || !rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      setProcessingId(selectedWithdrawal._id);
      const response = await adminAPI.rejectWithdrawal(selectedWithdrawal._id, { reason: rejectReason });
      if (response.data.success) {
        alert("Withdrawal rejected successfully! User has been notified.");
        setShowRejectModal(false);
        setSelectedWithdrawal(null);
        setRejectReason("");
        fetchWithdrawals();
      }
    } catch (err) {
      alert(`Error: ${getErrorMessage(err)}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCompleteWithdrawal = async () => {
    if (!selectedWithdrawal || !completionData.transactionHash.trim()) {
      alert("Please provide the transaction hash");
      return;
    }

    try {
      setProcessingId(selectedWithdrawal._id);
      const response = await adminAPI.completeWithdrawal(selectedWithdrawal._id, completionData);
      if (response.data.success) {
        alert("Withdrawal marked as completed! User has been notified.");
        setShowCompleteModal(false);
        setSelectedWithdrawal(null);
        setCompletionData({ transactionHash: "" });
        fetchWithdrawals();
      }
    } catch (err) {
      alert(`Error: ${getErrorMessage(err)}`);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredWithdrawals = withdrawals.filter((withdrawal) =>
    withdrawal.user?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    withdrawal.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    withdrawal.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500",
      confirmed: "bg-blue-500/20 text-blue-400 border-blue-500",
      approved: "bg-green-500/20 text-green-400 border-green-500",
      processing: "bg-cyan-500/20 text-cyan-400 border-cyan-500",
      completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500",
      rejected: "bg-red-500/20 text-red-400 border-red-500",
      cancelled: "bg-gray-500/20 text-gray-400 border-gray-500",
    };

    return (
      <span className={`px-2 md:px-3 py-1 rounded-full text-xs border font-semibold ${styles[status] || styles.pending}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getTotalStats = () => {
    const total = withdrawals.reduce((sum, w) => sum + (w.amount || 0), 0);
    const needsAction = withdrawals.filter(w => w.status === "pending" || w.status === "confirmed").length;
    const completed = withdrawals.filter(w => w.status === "completed").length;
    return { total, needsAction, completed };
  };

  const stats = getTotalStats();

  // Check if withdrawal can be approved/rejected
  const canApproveReject = (status) => {
    return status === "pending" || status === "confirmed";
  };

  // Check if withdrawal can be completed
  const canComplete = (status) => {
    return status === "approved" || status === "processing";
  };

  return (
    <div className="min-h-screen bg-[#111] text-white font-sans">
      <AdminNavbar />

      <main className="px-4 md:px-10 lg:px-20 py-6 md:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Withdrawals Management</h1>
            <p className="text-sm md:text-base text-gray-400">Review and process withdrawal requests</p>
          </div>
          <button
            onClick={fetchWithdrawals}
            disabled={loading}
            className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black px-4 py-2 rounded font-semibold flex items-center justify-center space-x-2 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Alert for pending withdrawals */}
        {stats.needsAction > 0 && (
          <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-4 mb-6 rounded">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" />
              <div>
                <p className="font-semibold text-yellow-400 text-sm md:text-base">Action Required!</p>
                <p className="text-xs md:text-sm text-gray-300">You have {stats.needsAction} withdrawal(s) waiting for your approval.</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6">
          <div className="bg-purple-500/10 border border-purple-500 rounded-lg p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm mb-1">Total Withdrawals</p>
                <h3 className="text-xl md:text-2xl font-bold text-purple-400">${stats.total.toFixed(2)}</h3>
              </div>
              <TrendingDown className="w-8 h-8 md:w-10 md:h-10 text-purple-400" />
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm mb-1">Needs Action</p>
                <h3 className="text-xl md:text-2xl font-bold text-yellow-400">{stats.needsAction}</h3>
              </div>
              <Clock className="w-8 h-8 md:w-10 md:h-10 text-yellow-400" />
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500 rounded-lg p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm mb-1">Completed</p>
                <h3 className="text-xl md:text-2xl font-bold text-emerald-400">{stats.completed}</h3>
              </div>
              <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-black border border-[#222] rounded-lg p-4 md:p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by username, email, or wallet address..."
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded pl-9 md:pl-10 pr-4 py-2 text-white placeholder-gray-500 text-sm md:text-base"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded pl-9 md:pl-10 pr-4 py-2 text-white text-sm md:text-base cursor-pointer appearance-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="approved">Approved</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Withdrawals Table/Cards */}
        <div className="bg-black border border-[#222] rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading withdrawals...</p>
            </div>
          ) : filteredWithdrawals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No withdrawals found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#1a1a1a]">
                    <tr className="border-b border-gray-700">
                      <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">User</th>
                      <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">Amount</th>
                      <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">Currency</th>
                      <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">Wallet</th>
                      <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">Status</th>
                      <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">Date</th>
                      <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWithdrawals.map((withdrawal) => (
                      <tr key={withdrawal._id} className="border-b border-gray-800 hover:bg-[#1a1a1a] transition">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-semibold text-white">{withdrawal.user?.username}</div>
                            <div className="text-xs text-gray-400">{withdrawal.user?.email}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-purple-400">${withdrawal.amount.toFixed(2)}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300 uppercase">
                            {withdrawal.currency}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-xs text-gray-400 max-w-[150px] truncate">
                            {withdrawal.walletAddress}
                          </div>
                        </td>
                        <td className="py-4 px-4">{getStatusBadge(withdrawal.status)}</td>
                        <td className="py-4 px-4 text-gray-400 text-sm">
                          {formatDateTime(withdrawal.createdAt)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedWithdrawal(withdrawal);
                                setShowDetailsModal(true);
                              }}
                              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            {canApproveReject(withdrawal.status) && (
                              <>
                                <button
                                  onClick={() => handleApproveWithdrawal(withdrawal._id)}
                                  disabled={processingId === withdrawal._id}
                                  className="p-2 bg-green-500/20 hover:bg-green-500/30 disabled:bg-gray-600 text-green-400 rounded transition"
                                  title="Approve Withdrawal"
                                >
                                  {processingId === withdrawal._id ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedWithdrawal(withdrawal);
                                    setShowRejectModal(true);
                                  }}
                                  disabled={processingId === withdrawal._id}
                                  className="p-2 bg-red-500/20 hover:bg-red-500/30 disabled:bg-gray-600 text-red-400 rounded transition"
                                  title="Reject Withdrawal"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            
                            {canComplete(withdrawal.status) && (
                              <button
                                onClick={() => {
                                  setSelectedWithdrawal(withdrawal);
                                  setShowCompleteModal(true);
                                }}
                                disabled={processingId === withdrawal._id}
                                className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 disabled:bg-gray-600 text-emerald-400 rounded transition"
                                title="Mark as Completed"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden p-4 space-y-4">
                {filteredWithdrawals.map((withdrawal) => (
                  <div key={withdrawal._id} className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-sm mb-1">{withdrawal.user?.username}</h3>
                        <p className="text-xs text-gray-400">{withdrawal.user?.email}</p>
                      </div>
                      {getStatusBadge(withdrawal.status)}
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Amount</span>
                        <span className="text-sm font-semibold text-purple-400">${withdrawal.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Currency</span>
                        <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300 uppercase">
                          {withdrawal.currency}
                        </span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs text-gray-500">Wallet</span>
                        <span className="text-xs text-gray-400 break-all text-right max-w-[60%]">
                          {withdrawal.walletAddress}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Date</span>
                        <span className="text-xs text-gray-400">{formatDateTime(withdrawal.createdAt)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-800">
                      <button
                        onClick={() => {
                          setSelectedWithdrawal(withdrawal);
                          setShowDetailsModal(true);
                        }}
                        className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 rounded text-xs font-semibold transition flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                      
                      {canApproveReject(withdrawal.status) && (
                        <>
                          <button
                            onClick={() => handleApproveWithdrawal(withdrawal._id)}
                            disabled={processingId === withdrawal._id}
                            className="bg-green-500/20 hover:bg-green-500/30 disabled:bg-gray-600 text-green-400 py-2 rounded text-xs font-semibold transition flex items-center justify-center gap-1"
                          >
                            {processingId === withdrawal._id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3 h-3" />
                            )}
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedWithdrawal(withdrawal);
                              setShowRejectModal(true);
                            }}
                            disabled={processingId === withdrawal._id}
                            className="bg-red-500/20 hover:bg-red-500/30 disabled:bg-gray-600 text-red-400 py-2 rounded text-xs font-semibold transition flex items-center justify-center gap-1"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                      
                      {canComplete(withdrawal.status) && (
                        <button
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal);
                            setShowCompleteModal(true);
                          }}
                          disabled={processingId === withdrawal._id}
                          className="col-span-2 bg-emerald-500/20 hover:bg-emerald-500/30 disabled:bg-gray-600 text-emerald-400 py-2 rounded text-xs font-semibold transition flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Mark Complete</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Details Modal */}
      {showDetailsModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-yellow-500 rounded-lg p-4 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg md:text-xl font-semibold text-yellow-400 mb-4">Withdrawal Details</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">User</p>
                  <p className="text-white font-semibold text-sm md:text-base">{selectedWithdrawal.user?.username}</p>
                  <p className="text-gray-400 text-xs">{selectedWithdrawal.user?.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Status</p>
                  {getStatusBadge(selectedWithdrawal.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Amount</p>
                  <p className="text-purple-400 font-semibold text-base md:text-lg">${selectedWithdrawal.amount.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Currency</p>
                  <p className="text-white uppercase text-sm md:text-base">{selectedWithdrawal.currency}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-xs md:text-sm">Wallet Address</p>
                <p className="text-white text-xs md:text-sm break-all bg-black p-2 rounded">{selectedWithdrawal.walletAddress}</p>
              </div>

              <div>
                <p className="text-gray-400 text-xs md:text-sm">Requested At</p>
                <p className="text-white text-sm md:text-base">{formatDateTime(selectedWithdrawal.createdAt)}</p>
              </div>

              {selectedWithdrawal.confirmedAt && (
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Confirmed At</p>
                  <p className="text-white text-sm md:text-base">{formatDateTime(selectedWithdrawal.confirmedAt)}</p>
                </div>
              )}

              {selectedWithdrawal.approvedAt && (
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Approved At</p>
                  <p className="text-white text-sm md:text-base">{formatDateTime(selectedWithdrawal.approvedAt)}</p>
                </div>
              )}

              {selectedWithdrawal.completedAt && (
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Completed At</p>
                  <p className="text-white text-sm md:text-base">{formatDateTime(selectedWithdrawal.completedAt)}</p>
                </div>
              )}

              {selectedWithdrawal.transactionHash && (
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Transaction Hash</p>
                  <p className="text-green-400 text-xs md:text-sm break-all bg-black p-2 rounded">{selectedWithdrawal.transactionHash}</p>
                </div>
              )}

              {selectedWithdrawal.rejectReason && (
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Rejection Reason</p>
                  <p className="text-red-400 text-sm md:text-base">{selectedWithdrawal.rejectReason}</p>
                </div>
              )}

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

      {/* Reject Modal */}
      {showRejectModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-red-500 rounded-lg p-4 md:p-6 max-w-md w-full">
            <h3 className="text-lg md:text-xl font-semibold text-red-400 mb-4">Reject Withdrawal</h3>

            <div className="space-y-4">
              <div>
                <p className="text-gray-300 mb-2 text-sm md:text-base">
                  User: <span className="font-semibold text-white">{selectedWithdrawal.user?.username}</span>
                </p>
                <p className="text-gray-300 mb-4 text-sm md:text-base">
                  Amount: <span className="font-semibold text-purple-400">${selectedWithdrawal.amount.toFixed(2)}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs md:text-sm text-gray-300 mb-2">Reason for Rejection *</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-black border border-gray-700 rounded px-3 md:px-4 py-2 text-white h-24 md:h-32 text-sm md:text-base"
                  placeholder="Enter reason..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleRejectWithdrawal}
                  disabled={processingId === selectedWithdrawal._id}
                  className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 text-white py-2 rounded font-semibold"
                >
                  {processingId === selectedWithdrawal._id ? 'Processing...' : 'Reject'}
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedWithdrawal(null);
                    setRejectReason("");
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

      {/* Complete Modal */}
      {showCompleteModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-emerald-500 rounded-lg p-4 md:p-6 max-w-md w-full">
            <h3 className="text-lg md:text-xl font-semibold text-emerald-400 mb-4">Complete Withdrawal</h3>

            <div className="space-y-4">
              <div>
                <p className="text-gray-300 mb-2 text-sm md:text-base">
                  User: <span className="font-semibold text-white">{selectedWithdrawal.user?.username}</span>
                </p>
                <p className="text-gray-300 mb-4 text-sm md:text-base">
                  Amount: <span className="font-semibold text-purple-400">${selectedWithdrawal.amount.toFixed(2)}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs md:text-sm text-gray-300 mb-2">Transaction Hash *</label>
                <input
                  type="text"
                  value={completionData.transactionHash}
                  onChange={(e) => setCompletionData({ transactionHash: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded px-3 md:px-4 py-2 text-white text-sm md:text-base"
                  placeholder="Enter blockchain transaction hash..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCompleteWithdrawal}
                  disabled={processingId === selectedWithdrawal._id}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 text-white py-2 rounded font-semibold"
                >
                  {processingId === selectedWithdrawal._id ? 'Processing...' : 'Complete'}
                </button>
                <button
                  onClick={() => {
                    setShowCompleteModal(false);
                    setSelectedWithdrawal(null);
                    setCompletionData({ transactionHash: "" });
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

export default WithdrawalsManagement;