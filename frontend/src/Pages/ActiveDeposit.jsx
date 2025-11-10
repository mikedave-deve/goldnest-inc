import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PostNavbar from "./PostNavBar.jsx";
import WelcomeAction from "./WelcomeAction.jsx";
import UkRegisteredCompany from "../components/UkRegisteredCompany.jsx";
import Footer from "../components/Footer.jsx";
import DepoImg from "../assets/depo.png";
import { depositAPI, isAuthenticated, getErrorMessage } from "../api.js";

const ActiveDeposit = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [activeDeposits, setActiveDeposits] = useState([
    {
      plan: "BASIC PLAN",
      range: "$50.00 - $999.00",
      profit: 3.8,
      deposits: [],
    },
    {
      plan: "PROFESSIONAL PLAN",
      range: "$1000.00 - $4999.00",
      profit: 4.5,
      deposits: [],
    },
    {
      plan: "GOLDEN PLAN",
      range: "$5000.00 - $10000.00",
      profit: 5.0,
      deposits: [],
    },
    {
      plan: "VIP TRIAL PLAN",
      range: "$10000.00 - $100000.00",
      profit: 0.5,
      deposits: [],
    },
    {
      plan: "INVESTORS PLAN",
      range: "$10000.00 - $1000000.00",
      profit: 1.0,
      deposits: [],
    },
  ]);
  const [totalActive, setTotalActive] = useState(0);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    fetchActiveDeposits();
  }, [navigate]);

  const fetchActiveDeposits = async () => {
    try {
      setLoading(true);

      // Fetch user's deposits from backend: GET /api/deposits/user-deposits
      const response = await depositAPI.getUserDeposits();

      if (response.data.success) {
        const userDeposits = response.data.deposits || [];

        // Get username if available
        if (response.data.username) {
          setUsername(response.data.username);
        }

        // Filter only active/approved deposits
        const activeOnly = userDeposits.filter(
          (dep) =>
            dep.status === "approved" ||
            dep.status === "active" ||
            dep.status === "processing"
        );

        // Calculate total active deposit amount
        const total = activeOnly.reduce(
          (sum, dep) => sum + (dep.amount || 0),
          0
        );
        setTotalActive(total);

        // Group deposits by plan
        const planGroups = [
          {
            plan: "BASIC PLAN",
            range: "$50.00 - $999.00",
            profit: 3.8,
            deposits: [],
          },
          {
            plan: "PROFESSIONAL PLAN",
            range: "$1000.00 - $4999.00",
            profit: 4.5,
            deposits: [],
          },
          {
            plan: "GOLDEN PLAN",
            range: "$5000.00 - $10000.00",
            profit: 5.0,
            deposits: [],
          },
          {
            plan: "VIP TRIAL PLAN",
            range: "$10000.00 - $100000.00",
            profit: 0.5,
            deposits: [],
          },
          {
            plan: "INVESTORS PLAN",
            range: "$10000.00 - $1000000.00",
            profit: 1.0,
            deposits: [],
          },
        ];

        // Organize deposits into their respective plans
        activeOnly.forEach((deposit) => {
          const planGroup = planGroups.find((p) => p.plan === deposit.plan);
          if (planGroup) {
            planGroup.deposits.push({
              id: deposit._id || deposit.id,
              name: deposit.plan,
              amount: deposit.amount,
              date: deposit.createdAt,
              status: deposit.status,
              currency: deposit.currency,
              expectedProfit: deposit.expectedProfit,
              maturityDate: deposit.maturityDate,
              daysRemaining: deposit.daysRemaining,
            });
          }
        });

        setActiveDeposits(planGroups);
        console.log("Active deposits fetched:", activeOnly.length);
      }
    } catch (err) {
      console.error("Error fetching active deposits:", err);
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

  if (loading) {
    return (
      <section className="bg-[#1a1a1a] text-gray-200 min-h-screen font-sans flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-yellow-400">Loading active deposits...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-[#1a1a1a] text-gray-200 min-h-screen font-sans">
        <PostNavbar />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 max-w-md text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchActiveDeposits}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded font-semibold"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#1a1a1a] text-gray-200 min-h-screen font-sans">
      <PostNavbar />
      <div className="px-4 md:px-10 lg:px-20 py-10">
        <WelcomeAction username={username} />

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10 mt-8">
          {/* LEFT SIDE – Active Deposits Summary */}
          <div className="bg-black border border-[#222] rounded-lg p-6 flex flex-col items-start text-left">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={DepoImg}
                alt="Active Deposits Icon"
                className="w-10 h-10"
              />
              <div>
                <p className="text-[11px] uppercase tracking-wide text-yellow-400 font-semibold">
                  Active Deposits
                </p>
                <h3 className="text-2xl font-bold text-white mt-1">
                  ${totalActive.toFixed(2)}
                </h3>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE – Investment Plans */}
          <div className="bg-black border border-[#222] rounded-lg p-6 w-full">
            {activeDeposits.map((plan, i) => (
              <div key={i} className="mb-8">
                {/* PLAN HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                  <h3 className="text-yellow-400 font-semibold text-sm md:text-base">
                    {plan.plan}
                  </h3>
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 text-xs md:text-sm text-yellow-400">
                    <p>
                      <span className="text-gray-400 mr-1">
                        Amount spend ($)
                      </span>
                      {plan.range}
                    </p>
                    <p>
                      <span className="text-gray-400 mr-1">Profit(%)</span>
                      {plan.profit.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* TABLE HEADER */}
                <div className="grid grid-cols-3 md:grid-cols-4 border border-gray-700 text-yellow-400 text-xs md:text-sm font-semibold px-3 py-2">
                  <span>Plan</span>
                  <span className="col-span-2 md:col-span-3">Deposit Info</span>
                </div>

                {/* DEPOSITS */}
                {plan.deposits.length === 0 ? (
                  <div className="border border-gray-700 border-t-0 px-4 py-3 text-sm text-gray-300">
                    No deposit for this plan
                  </div>
                ) : (
                  plan.deposits.map((dep, index) => (
                    <div
                      key={index}
                      className="border border-gray-700 border-t-0 px-4 py-3 text-sm text-gray-200"
                    >
                      <div className="flex flex-col md:flex-row md:justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="font-semibold">{dep.name}</span>
                          <span className="text-xs text-gray-400">
                            {dep.currency?.toUpperCase()} • Status: {dep.status}
                          </span>
                        </div>
                        <div className="flex flex-col md:text-right">
                          <span className="font-bold text-yellow-400">
                            ${dep.amount.toFixed(2)}
                          </span>
                          {dep.expectedProfit && (
                            <span className="text-xs text-green-400">
                              Expected: +${dep.expectedProfit.toFixed(2)}
                            </span>
                          )}
                          {dep.daysRemaining !== undefined && (
                            <span className="text-xs text-gray-400">
                              {dep.daysRemaining > 0
                                ? `${dep.daysRemaining} days remaining`
                                : "Matured"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <UkRegisteredCompany />
      <Footer />
    </section>
  );
};

export default ActiveDeposit;
