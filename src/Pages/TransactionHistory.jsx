// src/pages/TransactionHistory.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PostNavbar from "./PostNavBar.jsx";
import UkRegisteredCompany from "../components/UkRegisteredCompany.jsx";
import Footer from "../components/Footer.jsx";
import WelcomeAction from "./WelcomeAction.jsx";
import { transactionAPI, isAuthenticated, getErrorMessage } from "../api";

const TransactionHistory = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [transactionType, setTransactionType] = useState("All transactions");
  const [currency, setCurrency] = useState("All eCurrencies");
  const [fromDate, setFromDate] = useState({ month: "Jan", day: "01", year: "2025" });
  const [toDate, setToDate] = useState({ month: "Dec", day: "31", year: "2025" });
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");

  // Fetch transactions
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    fetchTransactions();
  }, [navigate]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      // Fetch transaction history from backend: GET /api/transactions/history
      const response = await transactionAPI.getHistory();

      if (response.data.success) {
        const transData = response.data.transactions || [];
        
        console.log("Transactions fetched:", transData.length);

        // Transform backend data to match component format
        const formattedTransactions = transData.map((t) => ({
          id: t._id || t.id,
          type: capitalizeFirst(t.type), // deposit, withdrawal, earning, commission, etc.
          currency: t.currency?.toUpperCase() || "USD",
          amount: t.amount || 0,
          date: t.createdAt || t.date,
          status: t.status,
          description: t.description,
        }));

        setTransactions(formattedTransactions);
        setFiltered(formattedTransactions);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        navigate("/login");
      } else {
        // Set empty array on error but don't redirect
        setTransactions([]);
        setFiltered([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to capitalize first letter
  const capitalizeFirst = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Apply Filters
  const applyFilter = () => {
    let result = [...transactions];

    // Filter by transaction type
    if (transactionType !== "All transactions") {
      result = result.filter(
        (t) => t.type.toLowerCase() === transactionType.toLowerCase()
      );
    }

    // Filter by currency
    if (currency !== "All eCurrencies") {
      result = result.filter(
        (t) => t.currency.toUpperCase() === currency.toUpperCase()
      );
    }

    // Filter by date range
    try {
      const from = new Date(`${fromDate.month} ${fromDate.day}, ${fromDate.year}`);
      const to = new Date(`${toDate.month} ${toDate.day}, ${toDate.year}`);

      result = result.filter((t) => {
        const date = new Date(t.date);
        return date >= from && date <= to;
      });
    } catch (err) {
      console.warn("Date filter error:", err);
    }

    setFiltered(result);
  };

  const totalTransaction = filtered.reduce(
    (sum, t) => sum + Number(t.amount || 0),
    0
  );

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const years = ["2024", "2025", "2026", "2027"];

  return (
    <section className="bg-[#111111] text-gray-200 min-h-screen font-sans">
      <PostNavbar />

      <div className="px-4 md:px-10 py-10">
        <WelcomeAction username={username} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT FILTER + STATISTICS */}
          <div className="flex flex-col gap-8">
            {/* Filter Section */}
            <div className="bg-black p-6 rounded-lg border border-[#2a2a2a] shadow-md">
              <h3 className="text-[#fdc700] font-semibold text-lg mb-6">
                Transactions Filter
              </h3>

              <div className="mb-4">
                <select
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-[#333] rounded-full text-[#fdc700] px-4 py-3 focus:outline-none"
                >
                  <option>All transactions</option>
                  <option>Deposit</option>
                  <option>Withdrawal</option>
                  <option>Earning</option>
                  <option>Commission</option>
                  <option>Bonus</option>
                  <option>Adjustment</option>
                </select>
              </div>

              <div className="mb-6">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-[#333] rounded-full text-[#fdc700] px-4 py-3 focus:outline-none"
                >
                  <option>All eCurrencies</option>
                  <option>BITCOIN</option>
                  <option>USDT</option>
                  <option>ETHEREUM</option>
                  <option>TRON</option>
                  <option>PAYPAL</option>
                </select>
              </div>

              {/* Date Pickers */}
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>From</span>
                <span>To</span>
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                {[{ date: fromDate, setter: setFromDate }, { date: toDate, setter: setToDate }].map(
                  ({ date, setter }, idx) => (
                    <div key={idx} className="flex gap-2 w-full md:w-1/2">
                      <select
                        value={date.month}
                        onChange={(e) => setter({ ...date, month: e.target.value })}
                        className="bg-[#0d0d0d] border border-[#333] rounded-full text-sm px-3 py-2 w-1/3"
                      >
                        {months.map((m) => (
                          <option key={m}>{m}</option>
                        ))}
                      </select>
                      <select
                        value={date.day}
                        onChange={(e) => setter({ ...date, day: e.target.value })}
                        className="bg-[#0d0d0d] border border-[#333] rounded-full text-sm px-3 py-2 w-1/3"
                      >
                        {days.map((d) => (
                          <option key={d}>{d}</option>
                        ))}
                      </select>
                      <select
                        value={date.year}
                        onChange={(e) => setter({ ...date, year: e.target.value })}
                        className="bg-[#0d0d0d] border border-[#333] rounded-full text-sm px-3 py-2 w-1/3"
                      >
                        {years.map((y) => (
                          <option key={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  )
                )}
              </div>

              <button
                onClick={applyFilter}
                className="bg-[#fdc700] text-black font-semibold w-full py-3 mt-6 rounded-md hover:bg-[#dcae69] transition"
              >
                Apply filter
              </button>
            </div>

            {/* Stats Section */}
            <div className="bg-black p-6 rounded-lg border border-[#2a2a2a] shadow-md">
              <h3 className="text-[#fdc700] font-semibold text-lg mb-4">
                Financial Statistics
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-300">
                  <span>Total Transactions</span>
                  <span className="text-white font-semibold">
                    {filtered.length}
                  </span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Total Amount</span>
                  <span className="text-white font-semibold">
                    ${totalTransaction.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT TRANSACTIONS TABLE */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="bg-[#161616] p-6 rounded-lg border border-[#2a2a2a] shadow-md">
              <h3 className="text-[#fdc700] font-semibold text-lg mb-4">
                Transactions History
              </h3>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading transactions...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm md:text-base">
                    <thead>
                      <tr className="border-b border-[#333] text-[#fdc700]">
                        <th className="py-3 text-left">Type</th>
                        <th className="py-3 text-left">Currency</th>
                        <th className="py-3 text-left">Amount</th>
                        <th className="py-3 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td
                            colSpan="4"
                            className="text-center text-gray-400 py-6 italic"
                          >
                            No transactions found
                          </td>
                        </tr>
                      ) : (
                        filtered.map((t, i) => (
                          <tr
                            key={t.id || i}
                            className="border-b border-[#2a2a2a] hover:bg-[#202020] transition"
                          >
                            <td className="py-3 text-white">
                              <span
                                className={`inline-block px-2 py-1 rounded text-xs ${
                                  t.type === "Deposit"
                                    ? "bg-blue-900/30 text-blue-400"
                                    : t.type === "Withdrawal"
                                    ? "bg-red-900/30 text-red-400"
                                    : t.type === "Earning"
                                    ? "bg-green-900/30 text-green-400"
                                    : t.type === "Commission"
                                    ? "bg-purple-900/30 text-purple-400"
                                    : "bg-gray-900/30 text-gray-400"
                                }`}
                              >
                                {t.type}
                              </span>
                            </td>
                            <td className="py-3 text-gray-300">{t.currency}</td>
                            <td className="py-3 text-gray-300 font-semibold">
                              ${t.amount.toFixed(2)}
                            </td>
                            <td className="py-3 text-gray-400">
                              {new Date(t.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <UkRegisteredCompany />
      <Footer />
    </section>
  );
};

export default TransactionHistory;
