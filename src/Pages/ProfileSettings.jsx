// src/pages/ProfileSettings.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PostNavBar from "./PostNavBar.jsx";
import UkRegisteredCompany from "../components/UkRegisteredCompany.jsx";
import Footer from "../components/Footer.jsx";
import { Eye, EyeOff } from "lucide-react";
import { userAPI, authAPI, isAuthenticated, getErrorMessage } from "../api";

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

      // Fetch user profile from backend: GET /api/user/profile
      const response = await userAPI.getProfile();

      if (response.data.success) {
        const userData = response.data.profile || response.data.user;
        
        console.log("User data fetched:", userData);
        setUser(userData);
        
        // Set form data with user info
        setFormData({
          fullName: userData.username || "",
          email: userData.email || "",
          currentPassword: "",
          newPassword: "",
          retypePassword: "",
        });

        // Set wallet addresses if they exist
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
        alert(`Error loading profile: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle wallet address changes
  const handleWalletChange = (e) => {
    const { name, value } = e.target;
    setWalletAddresses((prev) => ({ ...prev, [name]: value }));
  };

  // Handle password update
  const handleSaveChanges = async () => {
    try {
      // Validate password fields
      if (formData.newPassword || formData.retypePassword || formData.currentPassword) {
        // If any password field is filled, all must be filled
        if (!formData.currentPassword) {
          alert("Please enter your current password");
          return;
        }

        if (!formData.newPassword) {
          alert("Please enter a new password");
          return;
        }

        if (!formData.retypePassword) {
          alert("Please retype your new password");
          return;
        }

        // Check if passwords match
        if (formData.newPassword !== formData.retypePassword) {
          alert("New passwords do not match!");
          return;
        }

        // Check password length
        if (formData.newPassword.length < 6) {
          alert("New password must be at least 6 characters long");
          return;
        }

        // Check if new password is different from current
        if (formData.currentPassword === formData.newPassword) {
          alert("New password must be different from current password");
          return;
        }
      } else {
        // No password fields filled
        alert("Please fill in password fields if you want to change your password");
        return;
      }

      setSaving(true);

      // Call backend to change password: PUT /api/auth/change-password
      const passwordData = {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.retypePassword,
      };

      const response = await authAPI.changePassword(passwordData);

      if (response.data.success) {
        alert("Password updated successfully! Please login again with your new password.");
        
        // Clear password fields
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          retypePassword: "",
        }));

        // Optional: Logout user and redirect to login
        // Uncomment if you want to force re-login after password change
        // localStorage.removeItem("token");
        // localStorage.removeItem("userInfo");
        // navigate("/login");
      }
    } catch (error) {
      console.error("Password update error:", error);
      const errorMsg = getErrorMessage(error);
      
      if (error.response?.status === 401) {
        alert("Current password is incorrect");
      } else {
        alert(`Failed to update password: ${errorMsg}`);
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

  return (
    <div className="min-h-screen bg-[#111] text-gray-200 font-sans">
      <PostNavBar />

      <main className="px-4 md:px-10 lg:px-20 py-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- LEFT CARD --- */}
          <aside className="bg-[#0b0b0b] border border-[#222] rounded-lg overflow-hidden shadow-md text-center">
            <div className="bg-[#f5c84c] py-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {user.username}
              </h2>
            </div>

            <div className="p-6">
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 rounded-full border-4 border-[#f5c84c] flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-20 h-20 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0"
                    />
                  </svg>
                </div>
              </div>

              <p className="text-gray-400 mb-2">
                Registration:{" "}
                {user.registrationDate
                  ? new Date(user.registrationDate).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"}
              </p>
              <p className="text-gray-300 mb-6">{user.email}</p>
            </div>
          </aside>

          {/* --- MIDDLE CARD --- */}
          <section className="bg-[#0b0b0b] border border-[#222] rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-[#f5c84c] mb-6">
              Personal Details
            </h3>

            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <label className="w-40 text-gray-300">Full Name:</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled
                  className="flex-1 bg-transparent border border-gray-600 rounded-full px-4 py-2 text-gray-400 focus:outline-none"
                  title="Username cannot be changed"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="w-40 text-gray-300">E-mail:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled
                  className="flex-1 bg-transparent border border-gray-600 rounded-full px-4 py-2 text-gray-400 focus:outline-none"
                  title="Email cannot be changed"
                />
              </div>

              <div className="border-t border-gray-700 pt-4 mt-6">
                <p className="text-sm text-gray-400 mb-4">Change Password</p>

                <div className="space-y-4">
                  {/* Current Password with visibility toggle */}
                  <div className="flex items-center gap-3">
                    <label className="w-40 text-gray-300">Current Password:</label>
                    <div className="flex-1 relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className="w-full bg-transparent border border-gray-600 rounded-full px-4 py-2 pr-12 text-gray-100 focus:outline-none focus:border-[#f5c84c]"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
                        tabIndex={-1}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password with visibility toggle */}
                  <div className="flex items-center gap-3">
                    <label className="w-40 text-gray-300">New Password:</label>
                    <div className="flex-1 relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="w-full bg-transparent border border-gray-600 rounded-full px-4 py-2 pr-12 text-gray-100 focus:outline-none focus:border-[#f5c84c]"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
                        tabIndex={-1}
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Retype Password with visibility toggle */}
                  <div className="flex items-center gap-3">
                    <label className="w-40 text-gray-300">Retype Password:</label>
                    <div className="flex-1 relative">
                      <input
                        type={showRetypePassword ? "text" : "password"}
                        name="retypePassword"
                        value={formData.retypePassword}
                        onChange={handleChange}
                        className="w-full bg-transparent border border-gray-600 rounded-full px-4 py-2 pr-12 text-gray-100 focus:outline-none focus:border-[#f5c84c]"
                        placeholder="Retype new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRetypePassword(!showRetypePassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none"
                        tabIndex={-1}
                      >
                        {showRetypePassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSaveChanges}
                  disabled={saving}
                  className={`bg-[#f5c84c] hover:bg-[#e3b85b] text-black font-semibold px-6 py-2 rounded-md transition ${
                    saving ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </section>

          {/* --- RIGHT CARD - Wallet Addresses --- */}
          <section className="bg-[#0b0b0b] border border-[#222] rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-[#f5c84c] mb-6">
              Wallet Addresses
            </h3>

            <div className="space-y-6">
              {/* Bitcoin */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-[#f7931a] rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">₿</span>
                  </div>
                  <label className="text-gray-300 font-semibold">Bitcoin</label>
                </div>
                <input
                  type="text"
                  name="bitcoin"
                  value={walletAddresses.bitcoin}
                  onChange={handleWalletChange}
                  disabled
                  className="w-full bg-transparent border border-gray-600 rounded px-4 py-2 text-gray-400 text-sm focus:outline-none"
                  placeholder="No Bitcoin address set"
                />
              </div>

              {/* USDT */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-[#26a17b] rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">₮</span>
                  </div>
                  <label className="text-gray-300 font-semibold">USDT (TRC20)</label>
                </div>
                <input
                  type="text"
                  name="usdt"
                  value={walletAddresses.usdt}
                  onChange={handleWalletChange}
                  disabled
                  className="w-full bg-transparent border border-gray-600 rounded px-4 py-2 text-gray-400 text-sm focus:outline-none"
                  placeholder="No USDT address set"
                />
              </div>

              {/* Ethereum */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-[#627eea] rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">Ξ</span>
                  </div>
                  <label className="text-gray-300 font-semibold">Ethereum</label>
                </div>
                <input
                  type="text"
                  name="ethereum"
                  value={walletAddresses.ethereum}
                  onChange={handleWalletChange}
                  disabled
                  className="w-full bg-transparent border border-gray-600 rounded px-4 py-2 text-gray-400 text-sm focus:outline-none"
                  placeholder="No Ethereum address set"
                />
              </div>

              {/* Tron */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-[#eb0029] rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xs">T</span>
                  </div>
                  <label className="text-gray-300 font-semibold">Tron</label>
                </div>
                <input
                  type="text"
                  name="tron"
                  value={walletAddresses.tron}
                  onChange={handleWalletChange}
                  disabled
                  className="w-full bg-transparent border border-gray-600 rounded px-4 py-2 text-gray-400 text-sm focus:outline-none"
                  placeholder="No Tron address set"
                />
              </div>

              <p className="text-xs text-gray-500 mt-4">
                * Wallet addresses are set when you make a withdrawal request
              </p>
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