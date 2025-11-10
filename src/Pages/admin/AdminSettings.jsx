// src/pages/admin/AdminSettings.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar";
import Footer from "../../components/Footer";
import { adminAPI, isAdmin, getErrorMessage } from "../../api";
import { 
  Save,
  RefreshCw,
  Settings as SettingsIcon
} from "lucide-react";

const AdminSettings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    siteName: "GoldNest Inc",
    siteEmail: "support@goldnest-inc.biz",
    minDeposit: 50,
    minWithdrawal: 1,
    depositFee: 0,
    withdrawalFee: 0,
    referralCommission: 7,
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    autoApproveDeposits: false,
    autoApproveWithdrawals: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin()) {
      navigate("/login");
      return;
    }
    fetchSettings();
  }, [navigate]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSettings();
      if (response.data.success) {
        setSettings(response.data.settings);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
      // If settings don't exist, use defaults
      console.log("Using default settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await adminAPI.updateSettings(settings);
      if (response.data.success) {
        alert("Settings saved successfully!");
      }
    } catch (err) {
      alert(`Error: ${getErrorMessage(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111]">
        <AdminNavbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-yellow-400">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111] text-white font-sans">
      <AdminNavbar />

      <main className="px-4 md:px-10 lg:px-20 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Platform Settings</h1>
            <p className="text-gray-400">Configure platform parameters</p>
          </div>
          <button
            onClick={fetchSettings}
            className="mt-4 md:mt-0 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded font-semibold flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* General Settings */}
          <div className="bg-black border border-[#222] rounded-lg p-6 mb-6">
            <div className="flex items-center space-x-3 mb-6">
              <SettingsIcon className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-semibold text-yellow-400">General Settings</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Site Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => handleChange("siteName", e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Support Email</label>
                <input
                  type="email"
                  value={settings.siteEmail}
                  onChange={(e) => handleChange("siteEmail", e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-4 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Minimum Deposit ($)</label>
                  <input
                    type="number"
                    value={settings.minDeposit}
                    onChange={(e) => handleChange("minDeposit", parseFloat(e.target.value))}
                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-4 py-2 text-white"
                    step="1"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Minimum Withdrawal ($)</label>
                  <input
                    type="number"
                    value={settings.minWithdrawal}
                    onChange={(e) => handleChange("minWithdrawal", parseFloat(e.target.value))}
                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-4 py-2 text-white"
                    step="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Deposit Fee (%)</label>
                  <input
                    type="number"
                    value={settings.depositFee}
                    onChange={(e) => handleChange("depositFee", parseFloat(e.target.value))}
                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-4 py-2 text-white"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Withdrawal Fee (%)</label>
                  <input
                    type="number"
                    value={settings.withdrawalFee}
                    onChange={(e) => handleChange("withdrawalFee", parseFloat(e.target.value))}
                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-4 py-2 text-white"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-2">Referral Commission (%)</label>
                  <input
                    type="number"
                    value={settings.referralCommission}
                    onChange={(e) => handleChange("referralCommission", parseFloat(e.target.value))}
                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded px-4 py-2 text-white"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="bg-black border border-[#222] rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-yellow-400 mb-6">Feature Toggles</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded">
                <div>
                  <p className="font-semibold text-white">Maintenance Mode</p>
                  <p className="text-sm text-gray-400">Disable site access for users</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded">
                <div>
                  <p className="font-semibold text-white">Allow Registration</p>
                  <p className="text-sm text-gray-400">Enable new user registrations</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowRegistration}
                    onChange={(e) => handleChange("allowRegistration", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded">
                <div>
                  <p className="font-semibold text-white">Require Email Verification</p>
                  <p className="text-sm text-gray-400">Users must verify email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.requireEmailVerification}
                    onChange={(e) => handleChange("requireEmailVerification", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded">
                <div>
                  <p className="font-semibold text-white">Auto-Approve Deposits</p>
                  <p className="text-sm text-gray-400">Automatically approve deposits</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoApproveDeposits}
                    onChange={(e) => handleChange("autoApproveDeposits", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded">
                <div>
                  <p className="font-semibold text-white">Auto-Approve Withdrawals</p>
                  <p className="text-sm text-gray-400">Automatically approve withdrawals</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoApproveWithdrawals}
                    onChange={(e) => handleChange("autoApproveWithdrawals", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-8 py-3 rounded font-semibold flex items-center space-x-2 transition ${
                saving
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              <Save className="w-5 h-5" />
              <span>{saving ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminSettings;