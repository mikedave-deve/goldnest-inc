// src/pages/admin/TransactionsManagement.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import Footer from "../../components/Footer";
import { adminAPI, isAdmin, getErrorMessage, formatDateTime } from "../../api";
import { 
  Search, 
  Filter, 
  RefreshCw,
  Plus,
  X,
  DollarSign,
  TrendingUp,
  TrendingDown
} from "lucide-react";

const TransactionsManagement = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // User search states
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [newTransaction, setNewTransaction] = useState({
    userId: "",
    type: "deposit",
    amount: "",
    currency: "btc",
    description: "",
  });

  useEffect(() => {
    if (!isAdmin()) {
      navigate("/login");
      return;
    }
    fetchTransactions();
  }, [navigate, filterType]);

  // Search users as user types
  useEffect(() => {
    if (userSearchTerm.length >= 2) {
      const timeoutId = setTimeout(() => {
        searchUsers();
      }, 300); // Debounce 300ms
      return () => clearTimeout(timeoutId);
    } else {
      setUserSearchResults([]);
    }
  }, [userSearchTerm]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterType !== "all") {
        params.type = filterType;
      }

      const response = await adminAPI.getAllTransactions(params);
      if (response.data.success) {
        setTransactions(response.data.transactions);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      alert(`Error: ${getErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    try {
      setSearchingUsers(true);
      const response = await adminAPI.searchUsers(userSearchTerm);
      if (response.data.success) {
        setUserSearchResults(response.data.users);
      }
    } catch (err) {
      console.error("Error searching users:", err);
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setNewTransaction({ ...newTransaction, userId: user._id });
    setUserSearchTerm(user.username);
    setUserSearchResults([]);
  };

  const handleClearUser = () => {
    setSelectedUser(null);
    setNewTransaction({ ...newTransaction, userId: "" });
    setUserSearchTerm("");
  };

  const handleCreateTransaction = async () => {
    if (!newTransaction.userId || !newTransaction.amount) {
      alert("Please select a user and enter an amount");
      return;
    }

    const amount = parseFloat(newTransaction.amount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      const response = await adminAPI.createTransaction({
        ...newTransaction,
        amount
      });
      
      if (response.data.success) {
        alert("Transaction created successfully!");
        setShowCreateModal(false);
        setNewTransaction({
          userId: "",
          type: "deposit",
          amount: "",
          currency: "usd",
          description: "",
        });
        setSelectedUser(null);
        setUserSearchTerm("");
        fetchTransactions();
      }
    } catch (err) {
      alert(`Error: ${getErrorMessage(err)}`);
    }
  };

  const filteredTransactions = transactions.filter((transaction) =>
    transaction.user?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeBadge = (type) => {
    const styles = {
      deposit: "bg-green-500/20 text-green-400 border-green-500",
      withdrawal: "bg-purple-500/20 text-purple-400 border-purple-500",
      earning: "bg-blue-500/20 text-blue-400 border-blue-500",
      commission: "bg-yellow-500/20 text-yellow-400 border-yellow-500",
      bonus: "bg-pink-500/20 text-pink-400 border-pink-500",
      refund: "bg-orange-500/20 text-orange-400 border-orange-500",
    };

    return (
      <span className={`px-2 md:px-3 py-1 rounded-full text-xs border font-semibold ${styles[type] || styles.deposit}`}>
        {type.toUpperCase()}
      </span>
    );
  };

  const getTotalStats = () => {
    const deposits = transactions.filter(t => t.type === "deposit").reduce((sum, t) => sum + t.amount, 0);
    const withdrawals = transactions.filter(t => t.type === "withdrawal").reduce((sum, t) => sum + t.amount, 0);
    const earnings = transactions.filter(t => t.type === "earning").reduce((sum, t) => sum + t.amount, 0);
    return { deposits, withdrawals, earnings, total: transactions.length };
  };

  const stats = getTotalStats();

  return (
    <div className="min-h-screen bg-[#111] text-white font-sans">
      <AdminNavbar />

      <main className="px-4 md:px-10 lg:px-20 py-6 md:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Transactions Management</h1>
            <p className="text-sm md:text-base text-gray-400">View all platform transactions</p>
          </div>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-semibold flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create</span>
            </button>
            <button
              onClick={fetchTransactions}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded font-semibold flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6">
          <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm mb-1">Total Transactions</p>
                <h3 className="text-xl md:text-2xl font-bold text-blue-400">{stats.total}</h3>
              </div>
              <DollarSign className="w-8 h-8 md:w-10 md:h-10 text-blue-400" />
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500 rounded-lg p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm mb-1">Deposits</p>
                <h3 className="text-lg md:text-xl font-bold text-green-400">${stats.deposits.toFixed(2)}</h3>
              </div>
              <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-green-400" />
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500 rounded-lg p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm mb-1">Withdrawals</p>
                <h3 className="text-lg md:text-xl font-bold text-purple-400">${stats.withdrawals.toFixed(2)}</h3>
              </div>
              <TrendingDown className="w-8 h-8 md:w-10 md:h-10 text-purple-400" />
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs md:text-sm mb-1">Earnings</p>
                <h3 className="text-lg md:text-xl font-bold text-yellow-400">${stats.earnings.toFixed(2)}</h3>
              </div>
              <DollarSign className="w-8 h-8 md:w-10 md:h-10 text-yellow-400" />
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
                placeholder="Search by username, email or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded pl-9 md:pl-10 pr-4 py-2 text-white placeholder-gray-500 text-sm md:text-base"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded pl-9 md:pl-10 pr-4 py-2 text-white text-sm md:text-base appearance-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="earning">Earning</option>
                <option value="commission">Commission</option>
                <option value="bonus">Bonus</option>
                <option value="refund">Refund</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions Table/Cards */}
        <div className="bg-black border border-[#222] rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No transactions found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#1a1a1a]">
                    <tr className="border-b border-gray-700">
                      <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">User</th>
                      <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">Type</th>
                      <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">Amount</th>
                      <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">Currency</th>
                      <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">Description</th>
                      <th className="py-4 px-4 text-left text-sm font-semibold text-yellow-400">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction._id} className="border-b border-gray-800 hover:bg-[#1a1a1a] transition">
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-semibold text-white">{transaction.user?.username}</div>
                            <div className="text-xs text-gray-400">{transaction.user?.email}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">{getTypeBadge(transaction.type)}</td>
                        <td className="py-4 px-4">
                          <div className={`font-semibold ${transaction.type === "withdrawal" ? "text-red-400" : "text-green-400"}`}>
                            {transaction.type === "withdrawal" ? "-" : "+"}${transaction.amount.toFixed(2)}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300 uppercase">
                            {transaction.currency}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-300 max-w-xs truncate">
                          {transaction.description || "—"}
                        </td>
                        <td className="py-4 px-4 text-gray-400 text-sm">
                          {formatDateTime(transaction.date)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden p-4 space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction._id} className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-sm mb-1">{transaction.user?.username}</h3>
                        <p className="text-xs text-gray-400">{transaction.user?.email}</p>
                      </div>
                      {getTypeBadge(transaction.type)}
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Amount</span>
                        <span className={`text-sm font-semibold ${transaction.type === "withdrawal" ? "text-red-400" : "text-green-400"}`}>
                          {transaction.type === "withdrawal" ? "-" : "+"}${transaction.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Currency</span>
                        <span className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300 uppercase">
                          {transaction.currency}
                        </span>
                      </div>
                      {transaction.description && (
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-gray-500">Description</span>
                          <span className="text-xs text-gray-300 text-right max-w-[60%]">
                            {transaction.description}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Date</span>
                        <span className="text-xs text-gray-400">{formatDateTime(transaction.date)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Create Transaction Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] border border-green-500 rounded-lg p-4 md:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg md:text-xl font-semibold text-green-400 mb-4">Create Transaction</h3>

            <div className="space-y-4">
              {/* User Search */}
              <div className="relative">
                <label className="block text-xs md:text-sm text-gray-300 mb-2">Select User *</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    placeholder="Search by username or email..."
                    className="w-full bg-black border border-gray-700 rounded pl-10 pr-10 py-2 text-white text-sm md:text-base"
                    disabled={!!selectedUser}
                  />
                  {selectedUser && (
                    <button
                      onClick={handleClearUser}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Selected User Display */}
                {selectedUser && (
                  <div className="mt-2 p-3 bg-green-900/20 border border-green-500 rounded">
                    <p className="text-xs md:text-sm text-green-400">✓ Selected: {selectedUser.username}</p>
                    <p className="text-xs text-gray-400">{selectedUser.email}</p>
                  </div>
                )}

                {/* Search Results Dropdown */}
                {!selectedUser && userSearchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-[#0d0d0d] border border-gray-700 rounded-lg max-h-60 overflow-y-auto">
                    {searchingUsers ? (
                      <div className="p-4 text-center text-gray-400 text-sm">Searching...</div>
                    ) : (
                      userSearchResults.map((user) => (
                        <button
                          key={user._id}
                          onClick={() => handleSelectUser(user)}
                          className="w-full text-left px-4 py-3 hover:bg-[#1a1a1a] border-b border-gray-800 last:border-0"
                        >
                          <div className="font-semibold text-white text-sm">{user.username}</div>
                          <div className="text-xs text-gray-400">{user.email}</div>
                          <div className="text-xs text-gray-500">ID: {user._id}</div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs md:text-sm text-gray-300 mb-2">Type</label>
                <select
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded px-3 md:px-4 py-2 text-white text-sm md:text-base"
                >
                  <option value="deposit">Deposit</option>
                  <option value="withdrawal">Withdrawal</option>
                  <option value="earning">Earning</option>
                  <option value="commission">Commission</option>
                  <option value="bonus">Bonus</option>
                  <option value="refund">Refund</option>
                </select>
              </div>

              <div>
                <label className="block text-xs md:text-sm text-gray-300 mb-2">Amount *</label>
                <input
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded px-3 md:px-4 py-2 text-white text-sm md:text-base"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm text-gray-300 mb-2">Currency</label>
                <select
                  value={newTransaction.currency}
                  onChange={(e) => setNewTransaction({ ...newTransaction, currency: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded px-3 md:px-4 py-2 text-white text-sm md:text-base"
                >
                  <option value="usd">USD</option>
                  <option value="bitcoin">Bitcoin (BTC)</option>
                  <option value="usdt">USDT (Tether)</option>
                  <option value="ethereum">Ethereum (ETH)</option>
                  <option value="tron">Tron (TRX)</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs md:text-sm text-gray-300 mb-2">Description</label>
                <textarea
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                  className="w-full bg-black border border-gray-700 rounded px-3 md:px-4 py-2 text-white h-20 md:h-24 text-sm md:text-base"
                  placeholder="Optional description..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={handleCreateTransaction}
                  disabled={!selectedUser}
                  className={`flex-1 ${selectedUser ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-600 cursor-not-allowed'} text-white py-2 rounded font-semibold`}
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewTransaction({
                      userId: "",
                      type: "deposit",
                      amount: "",
                      currency: "btc",
                      description: "",
                    });
                    setSelectedUser(null);
                    setUserSearchTerm("");
                    setUserSearchResults([]);
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

export default TransactionsManagement;