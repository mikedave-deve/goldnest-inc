import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PostNavBar from "./PostNavBar.jsx";
import Footer from "../components/Footer.jsx";
import { depositAPI, getErrorMessage } from "../api.js";

const DepositConfirmation = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [transactionId, setTransactionId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Redirect if no deposit data
  if (!state || !state.plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111] text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">No deposit data found</p>
          <button
            onClick={() => navigate("/AddDeposit")}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { plan, amount, currency, userData } = state;

  // Wallet addresses for different currencies
  const walletAddresses = {
    bitcoin: "bc1q8j9k7l6m5n4p3q2r1s0t9u8v7w6x5y4z3a2b1c0",
    usdt: "TYexampleTRC20AddressForUSDTDeposits123456",
    ethereum: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    tron: "TXexampleTronAddressForTRXDeposits123456789",
    paypal: "payments@goldnest-investment.com",
  };

  const walletAddress =
    walletAddresses[currency] || "Contact support for wallet address";

  const handleConfirmDeposit = async () => {
    // Validation
    if (!transactionId.trim()) {
      setError("Please enter your Transaction ID");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      // Prepare deposit data
      const depositData = {
        amount: Number(amount),
        currency: currency,
        plan: plan.name,
        profitPercentage: plan.profitPercentage,
        duration: plan.duration,
        transactionId: transactionId.trim(),
      };

      // Call the correct backend endpoint: POST /api/deposits/create
      const response = await depositAPI.create(depositData);

      if (response.data.success) {
        // Show success message
        alert(
          `✅ Deposit request submitted successfully!\n\n` +
            `Transaction ID: ${response.data.deposit.transactionId}\n` +
            `Amount: $${amount}\n` +
            `Plan: ${plan.name}\n\n` +
            `Your deposit is pending admin approval. You will receive an email once approved.`
        );

        // Redirect to dashboard
        navigate("/PostDashboard");
      }
    } catch (err) {
      console.error("Deposit Error:", err);
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);

      // Show error in alert as well
      alert(`⚠️ Error: ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate expected profit
  const expectedProfit = ((amount * plan.profitPercentage) / 100).toFixed(2);
  const totalReturn = (Number(amount) + Number(expectedProfit)).toFixed(2);

  return (
    <div className="min-h-screen bg-[#111] text-white font-sans">
      <PostNavBar />

      <main className="flex justify-center px-4 md:px-10 lg:px-20 py-12">
        <div className="bg-black border border-[#222] rounded-lg p-8 w-full max-w-3xl">
          <h2 className="text-2xl text-yellow-400 mb-2">
            Deposit <span className="text-white">Confirmation</span>
          </h2>

          <p className="text-gray-300 text-lg mt-6 mb-4">
            Please send your payment to the address below:
          </p>

          {/* Wallet Address Display */}
          <div className="bg-[#0a0a0a] border border-yellow-500 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-400 mb-2">
              {currency.toUpperCase()} Wallet Address:
            </p>
            <div className="flex items-center justify-between">
              <p className="text-yellow-400 text-sm md:text-base break-all flex-1">
                {walletAddress}
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(walletAddress);
                  alert("Wallet address copied!");
                }}
                className="ml-3 bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded text-sm font-semibold"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Deposit Details */}
          <div className="space-y-3 text-sm md:text-base mb-6">
            <div className="bg-[#0a0a0a] p-4 rounded">
              <h3 className="text-yellow-400 font-semibold mb-3">
                Deposit Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Plan:</span>
                  <span className="font-semibold">{plan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Profit Rate:</span>
                  <span className="font-semibold text-green-400">
                    {plan.profitPercentage}%{" "}
                    {plan.duration === 1 ? "after 24h" : "daily"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="font-semibold">
                    {plan.duration} {plan.duration === 1 ? "day" : "days"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Principal Return:</span>
                  <span className="font-semibold text-green-400">
                    {plan.principalReturn}
                  </span>
                </div>
                <div className="border-t border-gray-700 my-2"></div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Deposit Amount:</span>
                  <span className="font-bold text-lg">${amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Deposit Fee:</span>
                  <span className="font-semibold">$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Expected Profit:</span>
                  <span className="font-semibold text-green-400">
                    +${expectedProfit}
                  </span>
                </div>
                <div className="border-t border-gray-700 my-2"></div>
                <div className="flex justify-between text-lg">
                  <span className="text-yellow-400 font-bold">
                    Total Return:
                  </span>
                  <span className="font-bold text-yellow-400">
                    ${totalReturn}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction ID Input */}
          <div className="mb-6">
            <label className="block text-sm mb-2 text-gray-300 font-semibold">
              Enter Transaction ID *
            </label>
            <p className="text-xs text-gray-500 mb-2">
              After sending the payment, enter your transaction ID/hash from
              your wallet
            </p>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full bg-transparent border border-yellow-500 rounded px-4 py-3 text-white outline-none focus:border-yellow-400"
              placeholder="e.g., 0x1234567890abcdef..."
              disabled={isSaving}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-900/30 border border-red-500 rounded p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleConfirmDeposit}
              disabled={isSaving || !transactionId.trim()}
              className={`flex-1 font-semibold px-6 py-3 rounded transition ${
                isSaving || !transactionId.trim()
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-600 text-black"
              }`}
            >
              {isSaving ? (
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
                "Confirm Deposit"
              )}
            </button>
            <button
              onClick={() => navigate("/AddDeposit")}
              disabled={isSaving}
              className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded transition"
            >
              Cancel
            </button>
          </div>

          {/* Important Notice */}
          <div className="mt-6 bg-yellow-900/20 border border-yellow-600 rounded p-4">
            <h4 className="text-yellow-400 font-semibold mb-2">
              ⚠️ Important Notice
            </h4>
            <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
              <li>Send payment to the exact address shown above</li>
              <li>Enter the correct transaction ID after payment</li>
              <li>Your deposit will be pending admin approval</li>
              <li>You will receive an email once your deposit is approved</li>
              <li>Profits will start accruing after approval</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DepositConfirmation;
