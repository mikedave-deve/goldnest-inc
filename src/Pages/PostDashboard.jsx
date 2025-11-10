// src/pages/PostDashboard.jsx - UPDATED WITH PROPER REFERRAL CODE
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PostNavBar from "./PostNavBar.jsx";
import WelcomeAction from "./WelcomeAction.jsx";
import WalletIcon from "../assets/wallet.png";
import DepositIcon from "../assets/deposit.png";
import UKRegisteredCompanySection from "../components/UkRegisteredCompany.jsx";
import Footer from "../components/Footer.jsx";
import { userAPI, isAuthenticated, getErrorMessage } from "../api";

const PostDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    fetchDashboard();
  }, [navigate]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      // ✅ FIXED: Get fresh dashboard data
      const res = await userAPI.getDashboard();

      if (res.data.success) {
        console.log('📊 Dashboard data received:', res.data.dashboard);
        console.log('📝 Referral code:', res.data.dashboard.referralCode);
        setUserData(res.data.dashboard);
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      const errorMsg = getErrorMessage(err);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        navigate("/login");
      } else {
        alert(`Error loading dashboard: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Use actual referral code from userData
  const handleCopyReferralLink = () => {
    if (!userData?.referralCode) {
      setMessage("No referral code available");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    
    // ✅ FIXED: Use the actual referral code from backend
    const referralUrl = `http://goldnest-inc.biz/register?ref=${userData.referralCode}`;
    
    navigator.clipboard
      .writeText(referralUrl)
      .then(() => {
        setMessage("✅ Referral link copied!");
        setTimeout(() => setMessage(""), 3000);
      })
      .catch((err) => {
        console.error("Copy failed:", err);
        setMessage("❌ Failed to copy link");
        setTimeout(() => setMessage(""), 3000);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-yellow-400 bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111] px-4">
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 max-w-md text-center">
          <p className="text-red-400 mb-4">Failed to load dashboard</p>
          <button
            onClick={fetchDashboard}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const quickInfo = [
    { label: "Minimum Deposit", value: "$50" },
    { label: "Minimum Withdrawal", value: "$1" },
    { label: "Withdrawal Time", value: "Anytime" },
    { label: "Deposits visible", value: "After 1 Blockchain confirmation" },
    { label: "Referral Commission", value: "7%" },
  ];

  const currencies = [
    { name: "Bitcoin", symbol: "BTC", amount: userData.btcBalance || 0 },
    { name: "USDT (TRC20)", symbol: "USDT", amount: userData.usdtBalance || 0 },
    { name: "Ethereum", symbol: "ETH", amount: userData.ethBalance || 0 },
    { name: "Tron", symbol: "TRX", amount: userData.trxBalance || 0 },
  ];

  return (
    <div className="min-h-screen bg-[#111] text-white font-sans">
      <PostNavBar username={userData.username} />
      
      <main className="px-6 py-10">
        <WelcomeAction username={userData.username} />
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: "EARNED TOTAL", value: userData.earnedTotal || 0 },
            { label: "TOTAL DEPOSITS", value: userData.totalDeposits || 0 },
            { label: "ACTIVE DEPOSIT", value: userData.activeDeposit || 0 },
            { label: "TOTAL WITHDRAW", value: userData.totalWithdraw || 0 },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-black rounded-xl p-6 text-center shadow-md"
            >
              <img
                src={WalletIcon}
                alt="icon"
                className="mx-auto mb-3 w-10 h-10 object-contain"
              />
              <p className="text-yellow-500 text-sm">{item.label}</p>
              <h2 className="text-2xl font-bold">
                ${(item.value || 0).toFixed(2)}
              </h2>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Financial Statistics */}
          <div className="bg-black rounded-lg p-6 border border-[#222]">
            <h3 className="text-xl font-semibold mb-4 text-yellow-400">
              Financial Statistics
            </h3>
            <p className="text-gray-300 mb-2">
              Account Balance:{" "}
              <span className="text-white">
                ${(userData.accountBalance || 0).toFixed(2)}
              </span>
            </p>
            <div className="space-y-3 mt-4">
              {currencies.map((coin, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center bg-[#141414] p-3 rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={DepositIcon}
                      alt={`${coin.symbol} icon`}
                      className="w-6 h-6"
                    />
                    <p>{coin.name}</p>
                  </div>
                  <p className="text-gray-300">${coin.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info */}
          <div className="bg-black rounded-lg p-6 border border-[#222]">
            <h3 className="text-xl font-semibold mb-4 text-yellow-400">
              Quick Info
            </h3>
            <div className="divide-y divide-gray-800">
              {quickInfo.map((info, i) => (
                <div
                  key={i}
                  className="flex justify-between py-3 text-sm text-gray-300"
                >
                  <span>{info.label}</span>
                  <span className="font-semibold text-white">{info.value}</span>
                </div>
              ))}
            </div>

            {/* ✅ FIXED: Referral Section with proper code display */}
            <div className="mt-6 p-4 bg-[#141414] rounded-lg">
              <h4 className="text-lg font-semibold mb-3 text-yellow-400">
                Your Referral Program
              </h4>
              
             
              

              {/* Referral URL */}
              <div>
                <p className="text-gray-400 text-xs mb-2">Share Your Referral Link:</p>
                <div className="flex flex-col md:flex-row items-center justify-between bg-black px-3 py-2 rounded-md gap-2">
                  <p className="text-yellow-400 text-xs truncate flex-1">
                    {userData.referralCode 
                      ? `goldnest-inc.com/register?ref=${userData.referralCode}`
                      : "No referral code available"
                    }
                  </p>
                  <button
                    onClick={handleCopyReferralLink}
                    disabled={!userData.referralCode}
                    className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black px-4 py-1 rounded font-semibold cursor-pointer transition text-sm"
                  >
                    Copy Link
                  </button>
                </div>
              </div>

              {/* Success/Error Message */}
              {message && (
                <p className="text-center mt-3 text-sm font-semibold">
                  {message}
                </p>
              )}

              {/* Info Box */}
              <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded p-2">
                <p className="text-yellow-400 text-xs">
                  💰 Earn 7% commission on every deposit your referrals make!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <UKRegisteredCompanySection />
      <Footer />
    </div>
  );
};

export default PostDashboard;