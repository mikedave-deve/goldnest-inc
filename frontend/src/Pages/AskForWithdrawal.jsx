import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PostNavBar from "./PostNavBar.jsx";
import Footer from "../components/Footer.jsx";
import WelcomeAction from "./WelcomeAction.jsx";
import {
  userAPI,
  withdrawalAPI,
  isAuthenticated,
  getErrorMessage,
} from "../api.js";

const AskForWithdrawal = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    fetchUserData();
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Call the correct backend endpoint: GET /api/user/balances
      const response = await userAPI.getBalances();

      if (response.data.success) {
        setUserData(response.data.balances);
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(getErrorMessage(err));

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const accounts = [
    {
      name: "bitcoin",
      label: "Bitcoin (BTC)",
      balance: userData?.btcBalance || 0,
      minWithdraw: 0.0001,
    },
    {
      name: "usdt",
      label: "USDT (TRC20)",
      balance: userData?.usdtBalance || 0,
      minWithdraw: 10,
    },
    {
      name: "ethereum",
      label: "Ethereum (ETH)",
      balance: userData?.ethBalance || 0,
      minWithdraw: 0.001,
    },
    {
      name: "tron",
      label: "Tron (TRX)",
      balance: userData?.trxBalance || 0,
      minWithdraw: 10,
    },
  ];

  const handleWithdraw = async () => {
    setError("");
    setSuccess("");

    // Validation
    if (!selectedAccount) {
      setError("Please select an account");
      return;
    }

    if (!walletAddress.trim()) {
      setError("Please enter your wallet address");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    const withdrawAmount = parseFloat(amount);

    if (withdrawAmount < selectedAccount.minWithdraw) {
      setError(
        `Minimum withdrawal amount is ${
          selectedAccount.minWithdraw
        } ${selectedAccount.name.toUpperCase()}`
      );
      return;
    }

    if (withdrawAmount > selectedAccount.balance) {
      setError("Insufficient balance");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare withdrawal data
      const withdrawalData = {
        currency: selectedAccount.name,
        walletAddress: walletAddress.trim(),
        amount: withdrawAmount,
      };

      // Call the correct backend endpoint: POST /api/withdrawals/request
      const response = await withdrawalAPI.request(withdrawalData);

      if (response.data.success) {
        setSuccess(
          `Withdrawal request submitted successfully!\n\n` +
            `Amount: ${withdrawAmount} ${selectedAccount.name.toUpperCase()}\n` +
            `Transaction ID: ${response.data.withdrawal.transactionId}\n\n` +
            `Please check your email to confirm this withdrawal (2-click security).`
        );

        // Clear form
        setSelectedAccount(null);
        setWalletAddress("");
        setAmount("");

        // Show alert and redirect after delay
        setTimeout(() => {
          alert(
            `✅ Withdrawal Request Submitted!\n\n` +
              `A confirmation email has been sent to your registered email address.\n` +
              `Please click the confirmation link to proceed with your withdrawal.\n\n` +
              `Amount: ${withdrawAmount} ${selectedAccount.name.toUpperCase()}\n` +
              `Status: Pending Confirmation`
          );
          navigate("/PostDashboard");
        }, 2000);
      }
    } catch (err) {
      console.error("Withdrawal Error:", err);
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
      alert(`⚠️ Withdrawal Failed: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
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

  return (
    <div className="min-h-screen bg-[#111] text-white font-sans">
      <PostNavBar />
      <main className="px-4 md:px-10 lg:px-20 py-10">
        <WelcomeAction />

        <div className="max-w-4xl mx-auto">
          <div className="bg-black rounded-lg p-6 md:p-8 border border-[#222]">
            <h2 className="text-2xl font-semibold mb-6 text-yellow-400">
              Request <span className="text-white">Withdrawal</span>
            </h2>

            {/* Account Selection */}
            <div className="mb-6">
              <label className="block text-sm mb-3 text-gray-300 font-semibold">
                Select Account
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accounts.map((account) => (
                  <div
                    key={account.name}
                    onClick={() => setSelectedAccount(account)}
                    className={`cursor-pointer p-4 rounded-lg border-2 transition ${
                      selectedAccount?.name === account.name
                        ? "border-yellow-500 bg-yellow-500/10"
                        : "border-[#222] hover:border-yellow-600 bg-[#0a0a0a]"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{account.label}</p>
                        <p className="text-sm text-gray-400">
                          Min: {account.minWithdraw}{" "}
                          {account.name.toUpperCase()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-yellow-400">
                          {account.balance.toFixed(4)}
                        </p>
                        <p className="text-xs text-gray-400">Available</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wallet Address */}
            <div className="mb-6">
              <label className="block text-sm mb-2 text-gray-300 font-semibold">
                {selectedAccount
                  ? `${selectedAccount.label} Wallet Address *`
                  : "Wallet Address *"}
              </label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="w-full bg-transparent border border-yellow-500 rounded px-4 py-3 text-white outline-none focus:border-yellow-400"
                placeholder={
                  selectedAccount?.name === "bitcoin"
                    ? "bc1q... or 1... or 3..."
                    : selectedAccount?.name === "ethereum"
                    ? "0x..."
                    : selectedAccount?.name === "tron" ||
                      selectedAccount?.name === "usdt"
                    ? "T..."
                    : "Enter your wallet address"
                }
                disabled={!selectedAccount || isSubmitting}
              />
            </div>

            {/* Amount */}
            <div className="mb-6">
              <label className="block text-sm mb-2 text-gray-300 font-semibold">
                Withdrawal Amount *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent border border-yellow-500 rounded px-4 py-3 text-white outline-none focus:border-yellow-400"
                  placeholder="0.00"
                  step="0.0001"
                  min={selectedAccount?.minWithdraw || 0}
                  max={selectedAccount?.balance || 0}
                  disabled={!selectedAccount || isSubmitting}
                />
                {selectedAccount && (
                  <button
                    onClick={() =>
                      setAmount(selectedAccount.balance.toString())
                    }
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded text-sm font-semibold"
                    disabled={isSubmitting}
                  >
                    Max
                  </button>
                )}
              </div>
              {selectedAccount && (
                <p className="text-xs text-gray-400 mt-1">
                  Available: {selectedAccount.balance.toFixed(4)}{" "}
                  {selectedAccount.name.toUpperCase()}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-900/30 border border-red-500 rounded p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 bg-green-900/30 border border-green-500 rounded p-3 text-green-400 text-sm whitespace-pre-line">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleWithdraw}
              disabled={!selectedAccount || isSubmitting}
              className={`w-full font-semibold px-6 py-3 rounded transition ${
                !selectedAccount || isSubmitting
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-600 text-black"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Request Withdrawal"
              )}
            </button>

            {/* Important Notice */}
            <div className="mt-6 bg-yellow-900/20 border border-yellow-600 rounded p-4">
              <h4 className="text-yellow-400 font-semibold mb-2">
                ⚠️ Important Notice
              </h4>
              <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
                <li>Double-check your wallet address before submitting</li>
                <li>Wrong addresses cannot be recovered</li>
                <li>
                  You will receive a confirmation email (2-click security)
                </li>
                <li>Withdrawals are processed after admin approval</li>
                <li>Processing time: 24-48 hours after confirmation</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AskForWithdrawal;
