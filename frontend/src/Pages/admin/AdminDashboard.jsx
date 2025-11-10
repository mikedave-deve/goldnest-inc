// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import Footer from "../../components/Footer";
import { adminAPI, isAdmin, getErrorMessage } from "../../api";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check admin access
    if (!isAdmin()) {
      navigate("/login");
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activitiesRes] = await Promise.all([
        adminAPI.getStatistics(),
        adminAPI.getActivities(),
      ]);

      console.log("Stats Response:", statsRes.data);
      console.log("Activities Response:", activitiesRes.data);

      if (statsRes.data.success) {
        setStats(statsRes.data.statistics);
      }

      // Handle activities - backend returns an object with separate arrays
      if (activitiesRes.data.success) {
        const activitiesData = activitiesRes.data.activities || {};
        
        // Combine all activities into a single array
        const allActivities = [];
        
        // Add deposits
        if (Array.isArray(activitiesData.recentDeposits)) {
          activitiesData.recentDeposits.forEach(deposit => {
            allActivities.push({
              type: "deposit",
              username: deposit.username || deposit.userId?.username || "Unknown",
              amount: deposit.amount,
              status: deposit.status,
              date: deposit.createdAt || deposit.date,
              _id: deposit._id
            });
          });
        }
        
        // Add withdrawals
        if (Array.isArray(activitiesData.recentWithdrawals)) {
          activitiesData.recentWithdrawals.forEach(withdrawal => {
            allActivities.push({
              type: "withdrawal",
              username: withdrawal.username || withdrawal.userId?.username || "Unknown",
              amount: withdrawal.amount,
              status: withdrawal.status,
              date: withdrawal.createdAt || withdrawal.date,
              _id: withdrawal._id
            });
          });
        }
        
        // Add registrations
        if (Array.isArray(activitiesData.recentRegistrations)) {
          activitiesData.recentRegistrations.forEach(user => {
            allActivities.push({
              type: "registration",
              username: user.username || "Unknown",
              amount: null,
              status: user.status,
              date: user.createdAt || user.date,
              _id: user._id
            });
          });
        }
        
        // Sort by date (newest first)
        allActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setRecentActivity(allActivities);
      } else {
        setRecentActivity([]);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(getErrorMessage(err));
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111]">
        <AdminNavbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-yellow-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#111]">
        <AdminNavbar />
        <div className="flex items-center justify-center h-screen px-4">
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 max-w-md text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded font-semibold"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "blue",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500",
      textColor: "text-blue-400",
    },
    {
      title: "Active Users",
      value: stats?.activeUsers || 0,
      icon: Activity,
      color: "green",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500",
      textColor: "text-green-400",
    },
    {
      title: "Pending Users",
      value: stats?.pendingUsers || 0,
      icon: Clock,
      color: "yellow",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500",
      textColor: "text-yellow-400",
    },
    {
      title: "Total Deposits",
      value: `$${(stats?.totalDeposits || 0).toFixed(2)}`,
      icon: DollarSign,
      color: "emerald",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500",
      textColor: "text-emerald-400",
    },
    {
      title: "Active Deposits",
      value: stats?.activeDepositsCount || 0,
      icon: TrendingUp,
      color: "cyan",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500",
      textColor: "text-cyan-400",
    },
    {
      title: "Pending Deposits",
      value: stats?.pendingDepositsCount || 0,
      icon: Clock,
      color: "orange",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500",
      textColor: "text-orange-400",
    },
    {
      title: "Total Withdrawals",
      value: `$${(stats?.totalWithdrawals || 0).toFixed(2)}`,
      icon: TrendingDown,
      color: "purple",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500",
      textColor: "text-purple-400",
    },
    {
      title: "Pending Withdrawals",
      value: stats?.pendingWithdrawalsCount || 0,
      icon: Clock,
      color: "pink",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500",
      textColor: "text-pink-400",
    },
  ];

  const getStatusBadge = (status) => {
    if (!status) return null;
    
    const styles = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500",
      approved: "bg-green-500/20 text-green-400 border-green-500",
      active: "bg-blue-500/20 text-blue-400 border-blue-500",
      completed: "bg-green-500/20 text-green-400 border-green-500",
      rejected: "bg-red-500/20 text-red-400 border-red-500",
      cancelled: "bg-gray-500/20 text-gray-400 border-gray-500",
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs border ${styles[status] || styles.pending}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#111] text-white font-sans">
      <AdminNavbar />

      <main className="px-4 md:px-10 lg:px-20 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here's what's happening with your platform.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className={`${card.bgColor} border ${card.borderColor} rounded-lg p-6 transition hover:scale-105`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`w-8 h-8 ${card.textColor}`} />
                </div>
                <p className="text-gray-400 text-sm mb-1">{card.title}</p>
                <h2 className={`text-2xl font-bold ${card.textColor}`}>{card.value}</h2>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <button
            onClick={() => navigate("/admin/users?filter=pending")}
            className="bg-yellow-500/10 border border-yellow-500 hover:bg-yellow-500/20 rounded-lg p-6 text-left transition"
          >
            <Clock className="w-8 h-8 text-yellow-400 mb-3" />
            <h3 className="text-lg font-semibold text-yellow-400 mb-1">Pending Approvals</h3>
            <p className="text-gray-400 text-sm">Review user registrations</p>
          </button>

          <button
            onClick={() => navigate("/admin/deposits?status=pending")}
            className="bg-orange-500/10 border border-orange-500 hover:bg-orange-500/20 rounded-lg p-6 text-left transition"
          >
            <DollarSign className="w-8 h-8 text-orange-400 mb-3" />
            <h3 className="text-lg font-semibold text-orange-400 mb-1">Pending Deposits</h3>
            <p className="text-gray-400 text-sm">Approve deposit requests</p>
          </button>

          <button
            onClick={() => navigate("/admin/withdrawals?status=pending")}
            className="bg-pink-500/10 border border-pink-500 hover:bg-pink-500/20 rounded-lg p-6 text-left transition"
          >
            <TrendingDown className="w-8 h-8 text-pink-400 mb-3" />
            <h3 className="text-lg font-semibold text-pink-400 mb-1">Pending Withdrawals</h3>
            <p className="text-gray-400 text-sm">Process withdrawal requests</p>
          </button>

          <button
            onClick={() => navigate("/admin/users")}
            className="bg-blue-500/10 border border-blue-500 hover:bg-blue-500/20 rounded-lg p-6 text-left transition"
          >
            <Users className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold text-blue-400 mb-1">Manage Users</h3>
            <p className="text-gray-400 text-sm">View and edit users</p>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-black border border-[#222] rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-yellow-400">Recent Activity</h3>
          
          {recentActivity.length === 0 ? (
            <p className="text-center text-gray-400 py-6">No recent activity</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-400 text-sm">
                    <th className="py-3 text-left">Type</th>
                    <th className="py-3 text-left">User</th>
                    <th className="py-3 text-left">Amount</th>
                    <th className="py-3 text-left">Status</th>
                    <th className="py-3 text-left">Date</th>
                    <th className="py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((activity, index) => (
                    <tr key={activity._id || index} className="border-b border-gray-800 hover:bg-[#1a1a1a] transition">
                      <td className="py-3">
                        <span className="capitalize font-semibold text-white">{activity.type}</span>
                      </td>
                      <td className="py-3 text-gray-300">{activity.username}</td>
                      <td className="py-3 text-gray-300">
                        {activity.amount ? `$${activity.amount.toFixed(2)}` : "N/A"}
                      </td>
                      <td className="py-3">{getStatusBadge(activity.status)}</td>
                      <td className="py-3 text-gray-400 text-sm">
                        {new Date(activity.date).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => {
                            if (activity.type === "deposit") {
                              navigate(`/admin/deposits`);
                            } else if (activity.type === "withdrawal") {
                              navigate(`/admin/withdrawals`);
                            } else {
                              navigate(`/admin/users`);
                            }
                          }}
                          className="text-yellow-400 hover:text-yellow-300 text-sm font-semibold"
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;