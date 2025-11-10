// src/pages/admin/UsersManagement.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import Footer from "../../components/Footer";
import { adminAPI, isAdmin, getErrorMessage, formatDateTime } from "../../api";
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Eye,
  DollarSign,
  RefreshCw
} from "lucide-react";

const UsersManagement = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState(searchParams.get("filter") || "all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceForm, setBalanceForm] = useState({ currency: "btc", amount: "", action: "add" });

  useEffect(() => {
    if (!isAdmin()) {
      navigate("/login");
      return;
    }
    fetchUsers();
  }, [navigate, filterStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus !== "all") {
        params.status = filterStatus;
      }

      const response = await adminAPI.getAllUsers(params);
      console.log("Users Response:", response.data);
      
      if (response.data.success) {
        setUsers(response.data.users || []);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      alert(`Error: ${getErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    if (!window.confirm("Are you sure you want to approve this user?")) return;

    try {
      const response = await adminAPI.approveUser(userId);
      if (response.data.success) {
        alert("User approved successfully!");
        fetchUsers();
      }
    } catch (err) {
      alert(`Error: ${getErrorMessage(err)}`);
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (!window.confirm("Are you sure you want to deactivate this user?")) return;

    try {
      const response = await adminAPI.deactivateUser(userId);
      if (response.data.success) {
        alert("User deactivated successfully!");
        fetchUsers();
      }
    } catch (err) {
      alert(`Error: ${getErrorMessage(err)}`);
    }
  };

  const handleActivateUser = async (userId) => {
    if (!window.confirm("Are you sure you want to activate this user?")) return;

    try {
      const response = await adminAPI.activateUser(userId);
      if (response.data.success) {
        alert("User activated successfully!");
        fetchUsers();
      }
    } catch (err) {
      alert(`Error: ${getErrorMessage(err)}`);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone!")) return;

    try {
      const response = await adminAPI.deleteUser(userId);
      if (response.data.success) {
        alert("User deleted successfully!");
        fetchUsers();
      }
    } catch (err) {
      alert(`Error: ${getErrorMessage(err)}`);
    }
  };

  const handleUpdateBalance = async () => {
    if (!selectedUser || !balanceForm.amount) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const response = await adminAPI.updateUserBalance(selectedUser._id, balanceForm);
      if (response.data.success) {
        alert("Balance updated successfully!");
        setShowBalanceModal(false);
        setSelectedUser(null);
        setBalanceForm({ currency: "btc", amount: "", action: "add" });
        fetchUsers();
      }
    } catch (err) {
      alert(`Error: ${getErrorMessage(err)}`);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    // Default to 'active' if status is undefined or null
    const userStatus = status || "active";
    
    const styles = {
      active: "bg-green-500/20 text-green-400 border-green-500",
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500",
      deactivated: "bg-red-500/20 text-red-400 border-red-500",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs border font-semibold ${styles[userStatus] || styles.active}`}>
        {userStatus.toUpperCase()}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    return role === "admin" ? (
      <span className="px-3 py-1 rounded-full text-xs border border-purple-500 bg-purple-500/20 text-purple-400 font-semibold">
        ADMIN
      </span>
    ) : (
      <span className="px-3 py-1 rounded-full text-xs border border-blue-500 bg-blue-500/20 text-blue-400 font-semibold">
        USER
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#111] text-white font-sans">
      <AdminNavbar />

      <main className="px-4 md:px-10 lg:px-20 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Users Management</h1>
            <p className="text-gray-400">Manage all platform users</p>
          </div>
          <button
            onClick={fetchUsers}
            className="mt-4 md:mt-0 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded font-semibold flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-black border border-[#222] rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by username or email..."
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded pl-10 pr-4 py-2 text-white focus:outline-none focus:border-yellow-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded pl-10 pr-4 py-2 text-white focus:outline-none focus:border-yellow-500 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="deactivated">Deactivated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-black border border-[#222] rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1a1a1a]">
                  <tr className="border-b border-gray-700">
                    <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">Username</th>
                    <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">Email</th>
                    <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">Role</th>
                    <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">Status</th>
                    <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">Balance</th>
                    <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">Joined</th>
                    <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="border-b border-gray-800 hover:bg-[#1a1a1a] transition">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-white">{user.username}</div>
                      </td>
                      <td className="py-4 px-4 text-gray-300">{user.email}</td>
                      <td className="py-4 px-4">{getRoleBadge(user.role)}</td>
                      <td className="py-4 px-4">{getStatusBadge(user.status)}</td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div className="text-yellow-400 font-semibold">
                            ${(user.accountBalance || 0).toFixed(2)}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-sm">
                        {formatDateTime(user.createdAt)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {(user.status === "pending" || !user.status) && (
                            <button
                              onClick={() => handleApproveUser(user._id)}
                              className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded transition"
                              title="Approve User"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {user.status === "active" && (
                            <button
                              onClick={() => handleDeactivateUser(user._id)}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition"
                              title="Deactivate User"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          {user.status === "deactivated" && (
                            <button
                              onClick={() => handleActivateUser(user._id)}
                              className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded transition"
                              title="Activate User"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowBalanceModal(true);
                            }}
                            className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded transition"
                            title="Update Balance"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/users/${user._id}`)}
                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {user.role !== "admin" && (
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Balance Update Modal */}
      {showBalanceModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-yellow-500 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-yellow-400 mb-4">
              Update Balance - {selectedUser.username}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Currency</label>
                <select
                  value={balanceForm.currency}
                  onChange={(e) => setBalanceForm({ ...balanceForm, currency: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded px-4 py-2 text-white"
                >
                  <option value="account">Account Balance (USD)</option>
                  <option value="btc">Bitcoin (BTC)</option>
                  <option value="usdt">USDT</option>
                  <option value="eth">Ethereum (ETH)</option>
                  <option value="trx">Tron (TRX)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Action</label>
                <select
                  value={balanceForm.action}
                  onChange={(e) => setBalanceForm({ ...balanceForm, action: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded px-4 py-2 text-white"
                >
                  <option value="add">Add</option>
                  <option value="subtract">Subtract</option>
                  <option value="set">Set</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Amount</label>
                <input
                  type="number"
                  value={balanceForm.amount}
                  onChange={(e) => setBalanceForm({ ...balanceForm, amount: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded px-4 py-2 text-white"
                  placeholder="0.00"
                  step="0.0001"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleUpdateBalance}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black py-2 rounded font-semibold"
                >
                  Update
                </button>
                <button
                  onClick={() => {
                    setShowBalanceModal(false);
                    setSelectedUser(null);
                    setBalanceForm({ currency: "btc", amount: "", action: "add" });
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

export default UsersManagement;