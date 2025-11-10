import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PostNavbar from "./PostNavBar.jsx";
import WelcomeAction from "./WelcomeAction.jsx";
import ThreePercentImg from "../assets/threepercent.png";
import OnePercentImg from "../assets/onepercent.png";
import UKRegisteredCompanySection from "../components/UkRegisteredCompany";
import Footer from "../components/Footer";
import { userAPI, isAuthenticated, getErrorMessage } from "../api";

const Referral = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [referralData, setReferralData] = useState(null);
  const [copiedMessage, setCopiedMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    fetchReferralData();
  }, [navigate]);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch referral data from backend: GET /api/user/referrals
      const response = await userAPI.getReferrals();

      if (response.data.success) {
        const data = response.data.referralData || response.data;
        
        // Build referral URL if not provided
        let referralUrl = data.referralUrl;
        if (!referralUrl && data.referralCode) {
          // Build URL from referralCode
          referralUrl = `${window.location.origin}/register?ref=${data.referralCode}`;
        } else if (!referralUrl && data.username) {
          // Fallback: use username
          referralUrl = `${window.location.origin}/register?ref=${data.username}`;
        }

        // Format the data properly
        const formattedData = {
          username: data.username || "User",
          referralCode: data.referralCode || data.username,
          referralUrl: referralUrl || `${window.location.origin}/register`,
          
          // Handle referredBy - might be ObjectId, username, or null
          referredBy: data.referredBy 
            ? (typeof data.referredBy === 'string' ? data.referredBy : data.referredBy.username || "Unknown")
            : null,
          
          // Referral counts - check multiple possible field names
          referralsCount: data.referralsCount || 
                         data.totalReferrals || 
                         (data.referrals ? data.referrals.length : 0) || 
                         0,
          
          activeReferrals: data.activeReferrals || 0,
          
          // Commission - check multiple possible field names
          totalCommission: data.totalCommission || data.referralEarnings || 0,
          
          // Referrals list
          referrals: data.referrals || []
        };

        setReferralData(formattedData);
        console.log("Referral data fetched and formatted:", formattedData);
      } else {
        throw new Error(response.data.message || "Failed to fetch referral data");
      }
    } catch (err) {
      console.error("Error fetching referral data:", err);
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReferralLink = () => {
    if (!referralData?.referralUrl) return;

    navigator.clipboard
      .writeText(referralData.referralUrl)
      .then(() => {
        setCopiedMessage("✓ Referral link copied!");
        setTimeout(() => setCopiedMessage(""), 3000);
      })
      .catch((err) => {
        console.error("Copy failed:", err);
        setCopiedMessage("Failed to copy");
        setTimeout(() => setCopiedMessage(""), 3000);
      });
  };

  if (loading) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-yellow-400">Loading referral data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black text-white min-h-screen">
        <PostNavbar />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 max-w-md text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchReferralData}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded font-semibold"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Navbar */}
      <PostNavbar />

      <div className="px-4 md:px-10 lg:px-20 py-10">
        <WelcomeAction username={referralData?.username} />

        {/* Hero Section */}
        <section className="text-center py-16 px-4">
          <h1 className="text-4xl md:text-5xl font-semibold mb-4">Partners</h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            We offer the ideas that raise your investment above the expected income.
          </p>
        </section>

        {/* Referral Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
          <div className="bg-[#171717] border border-[#333] rounded-lg p-6 text-center">
            <p className="text-gray-400 text-sm mb-2">Total Referrals</p>
            <p className="text-3xl font-bold text-yellow-400">
              {referralData?.referralsCount || 0}
            </p>
          </div>
          <div className="bg-[#171717] border border-[#333] rounded-lg p-6 text-center">
            <p className="text-gray-400 text-sm mb-2">Active Referrals</p>
            <p className="text-3xl font-bold text-green-400">
              {referralData?.activeReferrals || 0}
            </p>
          </div>
          <div className="bg-[#171717] border border-[#333] rounded-lg p-6 text-center">
            <p className="text-gray-400 text-sm mb-2">Total Commission</p>
            <p className="text-3xl font-bold text-yellow-400">
              ${(referralData?.totalCommission || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Referral Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-[35%_65%] gap-8 mb-12 max-w-6xl mx-auto">
          {/* LEFT - Referral Info Box */}
          <div className="bg-[#171717] border border-[#333] rounded-lg p-6">
            <h3 className="text-xl font-semibold text-yellow-400 mb-4">
              Your Referral Info
            </h3>
            
            <div className="space-y-4">
              {/* Your referral url */}
              <div>
                <p className="text-gray-400 text-sm mb-1">Your referral url</p>
                <p className="text-yellow-400 text-sm break-all">
                  {referralData?.referralUrl || "Not available"}
                </p>
              </div>

              {/* Your status */}
              <div className="py-3 border-t border-[#2a2a2a] flex justify-between">
                <span className="text-gray-400">Your status</span>
                <span className="text-white">Client</span>
              </div>

              {/* Your upline */}
              <div className="py-3 border-t border-[#2a2a2a] flex justify-between">
                <span className="text-gray-400">Your upline</span>
                <span className="text-white">
                  {referralData?.referredBy || "None"}
                </span>
              </div>

              {/* Referrals */}
              <div className="py-3 border-t border-[#2a2a2a] flex justify-between">
                <span className="text-gray-400">Referrals</span>
                <span className="text-white font-semibold">
                  {referralData?.referralsCount || 0}
                </span>
              </div>

              {/* Active referrals */}
              <div className="py-3 border-t border-[#2a2a2a] flex justify-between">
                <span className="text-gray-400">Active referrals</span>
                <span className="text-green-400 font-semibold">
                  {referralData?.activeReferrals || 0}
                </span>
              </div>

              {/* Total commission */}
              <div className="py-3 border-t border-[#2a2a2a] flex justify-between">
                <span className="text-gray-400">Total commission</span>
                <span className="text-yellow-400 font-bold">
                  ${(referralData?.totalCommission || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT - Earnings Banner & Copy Link */}
          <div className="space-y-6">
            {/* Earnings Banner */}
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-lg p-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-2">
                YOUR REFERRALS
              </h2>
              <p className="text-xl md:text-2xl font-semibold text-black">
                YOU HAVE EARNED ${(referralData?.totalCommission || 0).toFixed(2)} FROM REFERRALS SO FAR!
              </p>
            </div>

            {/* Copy Referral Link */}
            <div className="bg-[#171717] border border-[#333] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-400 mb-4">
                Share Your Referral Link
              </h3>
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  value={referralData?.referralUrl || ""}
                  readOnly
                  className="flex-1 bg-[#0d0d0d] border border-[#333] rounded px-4 py-3 text-gray-300 outline-none text-sm"
                />
                <button
                  onClick={handleCopyReferralLink}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded transition whitespace-nowrap"
                >
                  Copy Link
                </button>
              </div>
              {copiedMessage && (
                <p className="text-green-400 text-sm mt-2">{copiedMessage}</p>
              )}
            </div>
          </div>
        </div>

        {/* Referral Commission Section */}
        <div className="text-center bg-[#171717] py-12 px-6 rounded-lg mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#f5c84c] mb-3">
            Referral Commission
          </h2>
          <p className="text-lg text-gray-300">2 level affiliate program</p>
        </div>

        {/* Content Section */}
        <div className="bg-[#171717] py-16 px-6 rounded-lg">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Text Content */}
            <div className="flex-1 text-gray-300 space-y-4 leading-relaxed">
              <p>
                At Goldnest, we believe that the most effective way to grow our
                business is through the recommendations of our satisfied clients.
                With this in mind, Goldnest has introduced a highly rewarding
                two-tier affiliate program that offers attractive incentives for
                those who share our services with others.
              </p>

              <p>
                Goldnest rewards individuals for helping to promote its investment
                program and anyone can participate. To earn rewards, simply invite
                your friends, family, and colleagues to join through your unique
                referral link.
              </p>

              <p>
                You can earn through our affiliate program and withdraw your
                referral rewards even if you don't have an active deposit in the
                project.
              </p>

              <p>
                You will earn{" "}
                <span className="text-[#f5c84c] font-semibold">7%</span> from the
                investments made by your direct referrals and{" "}
                <span className="text-[#f5c84c] font-semibold">3%</span> from the
                investments of your second-level referrals. You can withdraw your
                earnings at any time.
              </p>
            </div>

            {/* Levels Visualization */}
            <div className="flex-1 flex flex-col items-center space-y-16 mt-10 lg:mt-0">
              {/* 7% Level 1 */}
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-300 mb-2">1 level (7%)</span>
                <div className="w-40 h-40 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden border border-gray-700">
                  <img
                    src={ThreePercentImg}
                    alt="7 percent level 1"
                    className="w-32 h-32 object-contain opacity-80"
                  />
                </div>
              </div>

              {/* Connector Line */}
              <div className="h-20 w-px bg-yellow-500"></div>

              {/* 3% Level 2 */}
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-300 mb-2">2 level (3%)</span>
                <div className="w-36 h-36 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden border border-gray-700">
                  <img
                    src={OnePercentImg}
                    alt="3 percent level 2"
                    className="w-28 h-28 object-contain opacity-80"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Referral List Table */}
        {referralData?.referrals && referralData.referrals.length > 0 && (
          <div className="mt-12 bg-[#171717] rounded-lg p-6">
            <h3 className="text-xl font-semibold text-yellow-400 mb-4">
              Your Referrals
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#333] text-yellow-400">
                    <th className="py-3 text-left">Username</th>
                    <th className="py-3 text-left">Join Date</th>
                    <th className="py-3 text-left">Status</th>
                    <th className="py-3 text-left">Active Deposit</th>
                    <th className="py-3 text-left">Commission Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {referralData.referrals.map((ref, index) => (
                    <tr
                      key={ref.id || ref._id || index}
                      className="border-b border-[#2a2a2a] hover:bg-[#202020] transition"
                    >
                      <td className="py-3 text-white">
                        {ref.username || ref.referralUsername || "Unknown"}
                      </td>
                      <td className="py-3 text-gray-400">
                        {ref.registrationDate || ref.joinDate
                          ? new Date(ref.registrationDate || ref.joinDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs ${
                            ref.isActive
                              ? "bg-green-900/30 text-green-400"
                              : "bg-red-900/30 text-red-400"
                          }`}
                        >
                          {ref.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 text-gray-300">
                        ${(ref.activeDeposit || 0).toFixed(2)}
                      </td>
                      <td className="py-3 text-yellow-400 font-semibold">
                        ${(ref.totalCommission || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <UKRegisteredCompanySection />
      <Footer />
    </div>
  );
};

export default Referral;