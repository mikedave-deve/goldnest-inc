// src/pages/ProfileSettings.jsx - MOBILE OPTIMIZED
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PostNavBar from "./PostNavBar.jsx";
import UkRegisteredCompany from "../components/UkRegisteredCompany.jsx";
import Footer from "../components/Footer.jsx";
import { Eye, EyeOff } from "lucide-react";
import { userAPI, authAPI, isAuthenticated, getErrorMessage } from "../api.js";

const ProfileSettings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    retypePassword: "",
  });
  const [walletAddresses, setWalletAddresses] = useState({
    bitcoin: "",
    usdt: "",
    ethereum: "",
    tron: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);

  // Fetch user data from backend
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    fetchUser();
  }, [navigate]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile();

      if (response.data.success) {
        const userData = response.data.profile || response.data.user;

        console.log("User data fetched:", userData);
        setUser(userData);

        setFormData({
          fullName: userData.username || "",
          email: userData.email || "",
          currentPassword: "",
          newPassword: "",
          retypePassword: "",
        });

        if (userData.walletAddresses) {
          setWalletAddresses({
            bitcoin: userData.walletAddresses.bitcoin || "",
            usdt: userData.walletAddresses.usdt || "",
            ethereum: userData.walletAddresses.ethereum || "",
            tron: userData.walletAddresses.tron || "",
          });
        }
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      const errorMsg = getErrorMessage(err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        navigate("/login");
      } else {
        setErrorMessage(`Error loading profile: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear messages when user types
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleWalletChange = (e) => {
    const { name, value } = e.target;
    setWalletAddresses((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      setSuccessMessage("");
      setErrorMessage("");

      // Validate password fields
      if (
        formData.newPassword ||
        formData.retypePassword ||
        formData.currentPassword
      ) {
        if (!formData.currentPassword) {
          setErrorMessage("Please enter your current password");
          return;
        }

        if (!formData.newPassword) {
          setErrorMessage("Please enter a new password");
          return;
        }

        if (!formData.retypePassword) {
          setErrorMessage("Please retype your new password");
          return;
        }

        if (formData.newPassword !== formData.retypePassword) {
          setErrorMessage("New passwords do not match!");
          return;
        }

        if (formData.newPassword.length < 6) {
          setErrorMessage("New password must be at least 6 characters long");
          return;
        }

        if (formData.currentPassword === formData.newPassword) {
          setErrorMessage("New password must be different from current password");
          return;
        }
      } else {
        setErrorMessage(
          "Please fill in password fields if you want to change your password"
        );
        return;
      }

      setSaving(true);

      const passwordData = {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.retypePassword,
      };

      const response = await authAPI.changePassword(passwordData);

      if (response.data.success) {
        setSuccessMessage(
          "Password changed successfully! A security alert email has been sent to your inbox."
        );

        // Clear password fields
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          retypePassword: "",
        }));

        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error) {
      console.error("Password update error:", error);
      const errorMsg = getErrorMessage(error);

      if (error.response?.status === 401) {
        setErrorMessage("Current password is incorrect");
      } else {
        setErrorMessage(`Failed to update password: ${errorMsg}`);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-300 bg-[#111]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-yellow-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-300 bg-[#111]">
        <div className="text-center">
          <p className="text-red-400 mb-4">Failed to load profile</p>
          <button
            onClick={fetchUser}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Format registration date
  const registrationDate = user.createdAt
    ? new Date(user.createdAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "N/A";

  return (
    <div className="min-h-screen bg-[#111] text-white">
      <PostNavBar username={user.username} />

      {/* Mobile-Optimized Main Content */}
      <main className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10 pb-20">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-900/30 text-green-400 border border-green-500 rounded-lg p-4 mb-6">
            <p className="flex items-start gap-2">
              <span className="text-xl">✓</span>
              <span>{successMessage}</span>
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-900/30 text-red-400 border border-red-500 rounded-lg p-4 mb-6">
            <p className="flex items-start gap-2">
              <span className="text-xl">⚠</span>
              <span>{errorMessage}</span>
            </p>
          </div>
        )}

        {/* Profile Header Card - Mobile Optimized */}
        <div className="bg-gradient-to-br from-[#0b0b0b] to-black border border-yellow-600 rounded-xl shadow-2xl p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-yellow-500 bg-[#1a1a1a] flex items-center justify-center shadow-lg">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-gray-600 bg-gray-800 flex items-center justify-center">
                  <span className="text-gray-400 text-2xl sm:text-3xl">👤</span>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-2">
                {user.username || "User"}
              </h2>
              <p className="text-sm sm:text-base text-gray-300 mb-1 break-all">
                {user.email}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                Registration: <span className="text-gray-400">{registrationDate}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Forms Grid - Mobile Optimized */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Personal Details Card */}
          <section className="bg-[#0b0b0b] border border-[#222] rounded-xl shadow-lg p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-[#f5c84c] mb-4 sm:mb-6 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Personal Details
            </h3>

            {/* Full Name */}
            <div className="mb-4 sm:mb-6">
              <label className="block text-xs sm:text-sm text-gray-400 mb-2 font-medium">
                Full Name:
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full bg-black border border-gray-600 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-gray-100 text-sm sm:text-base focus:outline-none focus:border-[#f5c84c] focus:ring-1 focus:ring-[#f5c84c] transition"
                placeholder="Enter your full name"
                disabled
              />
            </div>

            {/* Email */}
            <div className="mb-6 sm:mb-8">
              <label className="block text-xs sm:text-sm text-gray-400 mb-2 font-medium">
                E-mail:
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-black border border-gray-600 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-gray-100 text-sm sm:text-base focus:outline-none focus:border-[#f5c84c] focus:ring-1 focus:ring-[#f5c84c] transition"
                placeholder="Enter your email"
                disabled
              />
            </div>

            {/* Change Password Section */}
            <div className="border-t border-gray-700 pt-4 sm:pt-6">
              <p className="text-sm sm:text-base text-[#f5c84c] mb-4 font-semibold flex items-center gap-2">
                <span className="text-xl">🔒</span>
                Change Password
              </p>

              <div className="space-y-3 sm:space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-xs sm:text-sm text-gray-400 mb-2">
                    Current Password:
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full bg-black border border-gray-600 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-gray-100 text-sm sm:text-base focus:outline-none focus:border-[#f5c84c] focus:ring-1 focus:ring-[#f5c84c] transition"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
                      tabIndex={-1}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs sm:text-sm text-gray-400 mb-2">
                    New Password:
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full bg-black border border-gray-600 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-gray-100 text-sm sm:text-base focus:outline-none focus:border-[#f5c84c] focus:ring-1 focus:ring-[#f5c84c] transition"
                      placeholder="Enter new password (min 6 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
                      tabIndex={-1}
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Retype Password */}
                <div>
                  <label className="block text-xs sm:text-sm text-gray-400 mb-2">
                    Retype Password:
                  </label>
                  <div className="relative">
                    <input
                      type={showRetypePassword ? "text" : "password"}
                      name="retypePassword"
                      value={formData.retypePassword}
                      onChange={handleChange}
                      className="w-full bg-black border border-gray-600 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-gray-100 text-sm sm:text-base focus:outline-none focus:border-[#f5c84c] focus:ring-1 focus:ring-[#f5c84c] transition"
                      placeholder="Retype new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRetypePassword(!showRetypePassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
                      tabIndex={-1}
                    >
                      {showRetypePassword ? (
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Requirements Info */}
              <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                <p className="text-xs text-gray-400">
                  <span className="text-yellow-500">ℹ️</span> Password must be at least 6 characters and different from your current password
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 sm:pt-6">
              <button
                onClick={handleSaveChanges}
                disabled={saving}
                className={`w-full bg-[#f5c84c] hover:bg-[#e3b85b] text-black font-bold px-6 py-3 rounded-lg transition shadow-lg hover:shadow-xl ${
                  saving ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {saving ? "Saving..." : "Change Password"}
              </button>
            </div>
          </section>

          {/* Wallet Addresses Card */}
          <section className="bg-[#0b0b0b] border border-[#222] rounded-xl shadow-lg p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-[#f5c84c] mb-4 sm:mb-6 flex items-center gap-2">
              <span className="text-2xl">💳</span>
              Wallet Addresses
            </h3>

            <div className="space-y-4 sm:space-y-6">
              {/* Bitcoin */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#f7931a] rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm sm:text-base">₿</span>
                  </div>
                  <label className="text-gray-300 font-semibold text-sm sm:text-base">Bitcoin</label>
                </div>
                <input
                  type="text"
                  name="bitcoin"
                  value={walletAddresses.bitcoin}
                  onChange={handleWalletChange}
                  disabled
                  className="w-full bg-black border border-gray-600 rounded-lg px-3 sm:px-4 py-2.5 text-gray-400 text-xs sm:text-sm focus:outline-none"
                  placeholder="No Bitcoin address set"
                />
              </div>

              {/* USDT */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#26a17b] rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm sm:text-base">₮</span>
                  </div>
                  <label className="text-gray-300 font-semibold text-sm sm:text-base">
                    USDT (TRC20)
                  </label>
                </div>
                <input
                  type="text"
                  name="usdt"
                  value={walletAddresses.usdt}
                  onChange={handleWalletChange}
                  disabled
                  className="w-full bg-black border border-gray-600 rounded-lg px-3 sm:px-4 py-2.5 text-gray-400 text-xs sm:text-sm focus:outline-none"
                  placeholder="No USDT address set"
                />
              </div>

              {/* Ethereum */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#627eea] rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm sm:text-base">Ξ</span>
                  </div>
                  <label className="text-gray-300 font-semibold text-sm sm:text-base">
                    Ethereum
                  </label>
                </div>
                <input
                  type="text"
                  name="ethereum"
                  value={walletAddresses.ethereum}
                  onChange={handleWalletChange}
                  disabled
                  className="w-full bg-black border border-gray-600 rounded-lg px-3 sm:px-4 py-2.5 text-gray-400 text-xs sm:text-sm focus:outline-none"
                  placeholder="No Ethereum address set"
                />
              </div>

              {/* Tron */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#eb0029] rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm sm:text-base">T</span>
                  </div>
                  <label className="text-gray-300 font-semibold text-sm sm:text-base">Tron</label>
                </div>
                <input
                  type="text"
                  name="tron"
                  value={walletAddresses.tron}
                  onChange={handleWalletChange}
                  disabled
                  className="w-full bg-black border border-gray-600 rounded-lg px-3 sm:px-4 py-2.5 text-gray-400 text-xs sm:text-sm focus:outline-none"
                  placeholder="No Tron address set"
                />
              </div>

              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3 mt-4">
                <p className="text-xs text-gray-400 flex items-start gap-2">
                  <span className="text-yellow-500 text-lg">ℹ️</span>
                  <span>Wallet addresses are set when you make a withdrawal request</span>
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <UkRegisteredCompany />
      <Footer />
    </div>
  );
};

export default ProfileSettings;