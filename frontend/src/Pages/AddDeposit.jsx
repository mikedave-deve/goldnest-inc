import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PostNavBar from "./PostNavBar.jsx";
import UkRegisteredCompany from "../components/UkRegisteredCompany.jsx";
import Footer from "../components/Footer.jsx";
import WelcomeAction from "./WelcomeAction.jsx";
import { userAPI, isAuthenticated, getErrorMessage } from "../api.js";

const AddDeposit = () => {
  const [processor, setProcessor] = useState("bitcoin");
  const [amount, setAmount] = useState(50);
  const [balance, setBalance] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

      // Try multiple endpoints to get user data
      let response;
      let userData;

      try {
        // First try /api/user/profile
        response = await userAPI.getProfile();
        console.log("Profile response:", response.data);

        // Handle different response formats
        if (response.data.success && response.data.profile) {
          userData = response.data.profile;
        } else if (response.data.user) {
          userData = response.data.user;
        } else if (response.data.success) {
          // Data might be directly in response.data
          userData = response.data;
        } else {
          userData = response.data;
        }
      } catch (profileErr) {
        console.log("Profile endpoint failed, trying balances:", profileErr);

        // Fallback to /api/user/balances
        try {
          response = await userAPI.getBalances();
          console.log("Balances response:", response.data);

          if (response.data.success && response.data.balances) {
            userData = response.data.balances;
          } else if (response.data.success) {
            userData = response.data;
          } else {
            userData = response.data;
          }
        } catch (balanceErr) {
          console.log(
            "Balances endpoint failed, trying dashboard:",
            balanceErr
          );

          // Last fallback to /api/user/dashboard
          response = await userAPI.getDashboard();
          console.log("Dashboard response:", response.data);

          if (response.data.success && response.data.dashboard) {
            userData = response.data.dashboard;
          } else if (response.data.success) {
            userData = response.data;
          } else {
            userData = response.data;
          }
        }
      }

      console.log("Final userData:", userData);

      if (userData) {
        setUserData(userData);

        // Try to get account balance from different possible fields
        const accountBalance =
          userData.accountBalance ||
          userData.balance ||
          userData.totalBalance ||
          0;

        setBalance(accountBalance);
      } else {
        throw new Error("No user data received from backend");
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      console.error("Error details:", err.response);

      const errorMsg = getErrorMessage(err);
      setError(errorMsg);

      // Only redirect to login on auth errors
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        alert("Session expired. Please login again.");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const paymentOptions = [
    { value: "bitcoin", label: "Bitcoin (BTC)" },
    { value: "usdt", label: "USDT (TRC20)" },
    { value: "ethereum", label: "Ethereum (ETH)" },
    { value: "tron", label: "Tron (TRX)" },
    { value: "paypal", label: "PayPal" },
  ];

  const investmentPlans = [
    {
      name: "BASIC PLAN",
      profit: "1.5%",
      profitPercentage: 1.5,
      min: 50,
      max: 499,
      duration: 365,
      description: "1.5% daily for 365 days",
      principalReturn: "Yes",
      principalWithdraw: "Not available",
    },
    {
      name: "PROFESSIONAL PLAN",
      profit: "2.5%",
      profitPercentage: 2.5,
      min: 500,
      max: 1499,
      duration: 365,
      description: "2.5% daily for 365 days",
      principalReturn: "Yes",
      principalWithdraw: "Not available",
    },
    {
      name: "GOLDEN PLAN",
      profit: "5.0%",
      profitPercentage: 5.0,
      min: 1500,
      max: 2999,
      duration: 365,
      description: "5.0% daily for 365 days",
      principalReturn: "Yes",
      principalWithdraw: "Not available",
    },
    {
      name: "VIP TRIAL PLAN",
      profit: "10.0%",
      profitPercentage: 10.0,
      min: 3000,
      max: 6999,
      duration: 1,
      description: "10.0% after 24 hours",
      principalReturn: "Yes",
      principalWithdraw: "Not available",
    },
    {
      name: "INVESTORS PLAN",
      profit: "20.0%",
      profitPercentage: 20.0,
      min: 10000,
      max: 100000,
      duration: 1,
      description: "20.0% after 24 hours",
      principalReturn: "Yes",
      principalWithdraw: "Not available",
    },
  ];

  const handleMakeDeposit = () => {
    if (!selectedPlan) {
      alert("Please select an investment plan.");
      return;
    }

    const depositAmount = Number(amount);

    if (depositAmount < selectedPlan.min || depositAmount > selectedPlan.max) {
      alert(
        `Amount must be between $${selectedPlan.min} and $${selectedPlan.max} for this plan.`
      );
      return;
    }

    // Navigate to confirmation page with deposit data
    navigate("/DepositConfirmation", {
      state: {
        plan: selectedPlan,
        amount: depositAmount,
        currency: processor,
        userData: userData,
      },
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-yellow-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state but allow continuing
  if (error && !userData) {
    return (
      <div className="min-h-screen bg-[#111]">
        <PostNavBar />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 max-w-md text-center">
            <p className="text-red-400 mb-2 font-semibold">
              Error loading user data
            </p>
            <p className="text-gray-400 text-sm mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={fetchUser}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded font-semibold"
              >
                Retry
              </button>
              <button
                onClick={() => navigate("/PostDashboard")}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded font-semibold"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111] text-white font-sans">
      <PostNavBar />
      <main className="px-4 md:px-10 lg:px-20 py-10">
        <WelcomeAction username={userData?.username || "User"} />

        {error && (
          <div className="mb-4 bg-yellow-900/30 border border-yellow-500 rounded-lg p-4 max-w-4xl mx-auto">
            <p className="text-yellow-400 text-sm">
              ⚠️ Could not load all account data. Some features may be limited.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-10">
          {/* Deposit Form */}
          <div className="bg-black rounded-lg p-6 border border-[#222] w-full">
            <h2 className="text-xl font-semibold mb-6 text-yellow-400">
              Make an <span className="text-white">Investment</span>
            </h2>

            <div className="mb-5">
              <label className="block text-sm mb-2 text-gray-300">
                Payment Currency
              </label>
              <select
                value={processor}
                onChange={(e) => setProcessor(e.target.value)}
                className="w-full bg-transparent border border-yellow-500 rounded-full px-4 py-3 text-white outline-none cursor-pointer"
              >
                {paymentOptions.map((option, i) => (
                  <option key={i} value={option.value} className="bg-black">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-sm mb-2 text-gray-300">
                Deposit amount ($)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent border border-yellow-500 rounded-full px-4 py-3 text-white outline-none"
                placeholder="Enter deposit amount"
                min="50"
              />
              {selectedPlan && (
                <p className="text-xs text-gray-400 mt-1">
                  Min: ${selectedPlan.min} | Max: ${selectedPlan.max}
                </p>
              )}
            </div>

            <button
              onClick={handleMakeDeposit}
              disabled={!selectedPlan}
              className={`font-semibold px-6 py-3 rounded transition cursor-pointer w-full ${
                selectedPlan
                  ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              {selectedPlan ? "Make deposit" : "Select a plan first"}
            </button>

            {/* Balance Display */}
            <div className="mt-8 bg-black border border-[#222] rounded-lg p-4">
              <h3 className="text-yellow-400 mb-2">Available Balance</h3>
              <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
              <p className="text-sm text-gray-400">Account balance</p>
            </div>
          </div>

          {/* Investment Plans */}
          <div className="bg-black rounded-lg p-6 border border-[#222]">
            <h2 className="text-xl font-semibold mb-6 text-yellow-400">
              Investment Plans
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {investmentPlans.map((plan, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedPlan(plan)}
                  className={`bg-[#0b0b0b] border rounded-md overflow-hidden flex flex-col items-center text-center cursor-pointer transition transform hover:scale-105 ${
                    selectedPlan?.name === plan.name
                      ? "border-yellow-500 shadow-lg shadow-yellow-500/50"
                      : "border-[#222] hover:border-yellow-600"
                  }`}
                >
                  <div
                    className={`w-full py-3 ${
                      selectedPlan?.name === plan.name
                        ? "bg-[#fdc700] text-black"
                        : "bg-[#0b0b0b] text-white"
                    }`}
                  >
                    <h3 className="text-sm font-semibold">{plan.name}</h3>
                  </div>
                  <div className="flex-1 flex flex-col justify-center items-center py-6 px-4">
                    <p className="text-5xl font-bold mb-2 text-white">
                      {plan.profit}
                    </p>
                    <p className="text-white font-semibold mb-3">
                      Daily Profit
                    </p>
                    <p className="text-[#fdc700] mb-1">Min: ${plan.min}</p>
                    <p className="text-[#fdc700] mb-2">Max: ${plan.max}</p>
                    <p className="text-[#fdc700] text-sm mb-2">
                      {plan.description}
                    </p>
                    {selectedPlan?.name === plan.name && (
                      <div className="mt-2 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                        SELECTED
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <UkRegisteredCompany />
      <Footer />
    </div>
  );
};

export default AddDeposit;
