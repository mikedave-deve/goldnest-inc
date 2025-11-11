// src/pages/admin/DepositsManagement.jsx
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
  DollarSign
} from "lucide-react";

const DepositsManagement = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "all");
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    if (!isAdmin()) {
      navigate("/login");
      return;
    }
    fetchDeposits();
  }, [navigate, filterStatus]);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus !== "all") {
        params.status = filterStatus;
      }

      const response = await adminAPI.getAllDeposits(params);
      if (response.data.success) {
        setDeposits(response.data.deposits);
      }
    } catch (err) {
      console.error("Error fetching deposits:", err);
      alert(`Error: ${getErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDeposit = async (depositId) => {
    if (!window.confirm("Are you sure you want to approve this deposit?")) return;

    try {
      const response = await adminAPI.approveDeposit(depositId);
      if (response.data.success) {
        alert("Deposit approved successfully!");
        fetchDeposits();
      }
    } catch (err) {
      alert(`Error: ${getErrorMessage(err)}`);
    }
  };

  const handleRejectDeposit = async () => {
    if (!selectedDeposit || !rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      const response = await adminAPI.rejectDeposit(selectedDeposit._id, { reason: rejectReason });
      if (response.data.success) {
        alert("Deposit rejected successfully!");
        setShowRejectModal(false);
        setSelectedDeposit(null);
        setRejectReason("");
        fetchDeposits();
      }
    } catch (err) {
      alert(`Error: ${getErrorMessage(err)}`);
    }
  };

  const handleDeleteDeposit = async (depositId) => {
    if (!window.confirm("Are you sure you want to delete this deposit? This action cannot be undone!")) return;

    try {
      const response = await adminAPI.deleteDeposit(depositId);
      if (response.data.success) {
        alert("Deposit deleted successfully!");
        fetchDeposits();
      }
    } catch (err) {
      alert(`Error: ${getErrorMessage(err)}`);
    }
  };

  const filteredDeposits = deposits.filter((deposit) =>
    deposit.user?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deposit.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deposit.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500",
      approved: "bg-green-500/20 text-green-400 border-green-500",
      active: "bg-blue-500/20 text-blue-400 border-blue-500",
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
    const total = deposits.reduce((sum, d) => sum + (d.amount || 0), 0);
    const pending = deposits.filter(d => d.status === "pending").length;
    const approved = deposits.filter(d => d.status === "approved" || d.status === "active").length;
    return { total, pending, approved };
  };

  const stats = getTotalStats();

  return (
    <div className="min-h-screen bg-[#111] text-white font-sans">
      <AdminNavbar />

      <main className="px-4 md:px-10 lg:px-20 py-6 md:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Deposits Management</h1>
            <p className="text-sm md:text-base text-gray-400">Review and manage deposit requests</p>
          </div>
          <button
            onClick={fetchDeposits}
            className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded font-semibold flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6">
          <div className="bg-emerald-500/10 border border-emerald-500 rounded-lg p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm mb-1">Total Deposits</p>
                <h3 className="text-xl md:text-2xl font-bold text-emerald-400">${stats.total.toFixed(2)}</h3>
              </div>
              <DollarSign className="w-8 h-8 md:w-10 md:h-10 text-emerald-400" />
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm mb-1">Pending Review</p>
                <h3 className="text-xl md:text-2xl font-bold text-yellow-400">{stats.pending}</h3>
              </div>
              <RefreshCw className="w-8 h-8 md:w-10 md:h-10 text-yellow-400" />
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm mb-1">Approved</p>
                <h3 className="text-xl md:text-2xl font-bold text-green-400">{stats.approved}</h3>
              </div>
              <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-green-400" />
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
                placeholder="Search users or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded pl-9 md:pl-10 pr-4 py-2 text-white placeholder-gray-500 text-sm md:text-base"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded pl-9 md:pl-10 pr-4 py-2 text-white text-sm md:text-base appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Deposits Table/Cards */}
        <div className="bg-black border border-[#222] rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading deposits...</p>
            </div>
          ) : filteredDeposits.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No deposits found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#1a1a1a]">
                    <tr className="border-b border-gray-700">
                      <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">User</th>
                      <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">Plan</th>
                      <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">Amount</th>
                      <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">Currency</th>
                      <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">Status</th>
                      <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">Date</th>
                      <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeposits.map((deposit) => (
                      <tr key={deposit._id} className="border-b border-gray-800 hover:bg-[#1a1a1a] transition">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-semibold text-white">{deposit.user?.username}</div>
                            <div className="text-xs text-gray-400">{deposit.user?.email}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-300">{deposit.plan}</td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-yellow-400">${deposit.amount.toFixed(2)}</div>
                          <div className="text-xs text-gray-400">{deposit.profitPercentage}% profit</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300 uppercase">
                            {deposit.currency}
                          </span>
                        </td>
                        <td className="py-4 px-4">{getStatusBadge(deposit.status)}</td>
                        <td className="py-4 px-4 text-gray-400 text-sm">
                          {formatDateTime(deposit.createdAt)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedDeposit(deposit);
                                setShowDetailsModal(true);
                              }}
                              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {deposit.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleApproveDeposit(deposit._id)}
                                  className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded transition"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedDeposit(deposit);
                                    setShowRejectModal(true);
                                  }}
                                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
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
                {filteredDeposits.map((deposit) => (
                  <div key={deposit._id} className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-sm mb-1">{deposit.user?.username}</h3>
                        <p className="text-xs text-gray-400">{deposit.user?.email}</p>
                      </div>
                      {getStatusBadge(deposit.status)}
                    </div>

                    {/* Details Grid */}
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Plan</span>
                        <span className="text-sm text-gray-300">{deposit.plan}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Amount</span>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-yellow-400">${deposit.amount.toFixed(2)}</div>
                          <div className="text-xs text-gray-400">{deposit.profitPercentage}% profit</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Currency</span>
                        <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300 uppercase">
                          {deposit.currency}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Date</span>
                        <span className="text-xs text-gray-400">{formatDateTime(deposit.createdAt)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-gray-800">
                      <button
                        onClick={() => {
                          setSelectedDeposit(deposit);
                          setShowDetailsModal(true);
                        }}
                        className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 rounded text-sm font-semibold transition flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      {deposit.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApproveDeposit(deposit._id)}
                            className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 rounded text-sm font-semibold transition flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDeposit(deposit);
                              setShowRejectModal(true);
                            }}
                            className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded text-sm font-semibold transition flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </>
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
      {showDetailsModal && selectedDeposit && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-yellow-500 rounded-lg p-4 md:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg md:text-xl font-semibold text-yellow-400 mb-4">Deposit Details</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">User</p>
                  <p className="text-white font-semibold text-sm md:text-base">{selectedDeposit.user?.username}</p>
                  <p className="text-gray-400 text-xs">{selectedDeposit.user?.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Status</p>
                  {getStatusBadge(selectedDeposit.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Plan</p>
                  <p className="text-white font-semibold text-sm md:text-base">{selectedDeposit.plan}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Amount</p>
                  <p className="text-yellow-400 font-semibold text-base md:text-lg">${selectedDeposit.amount.toFixed(2)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Currency</p>
                  <p className="text-white uppercase text-sm md:text-base">{selectedDeposit.currency}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Profit Rate</p>
                  <p className="text-green-400 font-semibold text-sm md:text-base">{selectedDeposit.profitPercentage}%</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Duration</p>
                  <p className="text-white text-sm md:text-base">{selectedDeposit.duration} days</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Transaction ID</p>
                  <p className="text-white text-xs break-all">{selectedDeposit.transactionId}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-xs md:text-sm">Created At</p>
                <p className="text-white text-sm md:text-base">{formatDateTime(selectedDeposit.createdAt)}</p>
              </div>

              {selectedDeposit.approvedAt && (
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Approved At</p>
                  <p className="text-white text-sm md:text-base">{formatDateTime(selectedDeposit.approvedAt)}</p>
                </div>
              )}

              {selectedDeposit.rejectReason && (
                <div>
                  <p className="text-gray-400 text-xs md:text-sm">Rejection Reason</p>
                  <p className="text-red-400 text-sm md:text-base">{selectedDeposit.rejectReason}</p>
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
      {showRejectModal && selectedDeposit && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-red-500 rounded-lg p-4 md:p-6 max-w-md w-full">
            <h3 className="text-lg md:text-xl font-semibold text-red-400 mb-4">Reject Deposit</h3>

            <div className="space-y-4">
              <div>
                <p className="text-gray-300 mb-2 text-sm md:text-base">
                  User: <span className="font-semibold text-white">{selectedDeposit.user?.username}</span>
                </p>
                <p className="text-gray-300 mb-4 text-sm md:text-base">
                  Amount: <span className="font-semibold text-yellow-400">${selectedDeposit.amount.toFixed(2)}</span>
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
                  onClick={handleRejectDeposit}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded font-semibold"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedDeposit(null);
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

      <Footer />
    </div>
  );
};

export default DepositsManagement;