import { Link } from "react-router-dom";
import React from "react";
import Navbar from "../components/Navbar";
import UKRegisteredCompanySection from "../components/UkRegisteredCompany";
import Footer from "../components/Footer";

const Investment = () => {
  const plans = [
    {
      title: "BASIC PLAN",
      rate: "1.5%",
      time: "Per Day for 365 days",
    min: "$50",
    max: "$499",
    },
    {
      title: "PROFESSIONAL PLAN",
      rate: "2.5%",
      time: "Per Day for 365 days",
      min: "$500",
      max: "$1,499",
    },
    {
      title: "GOLDEN PLAN",
      rate: "5.0%",
       time: "Per Day for 365 days",
    min: "$1,500",
    max: "$2,999",
    },
    {
      title: "GOLDEN PLAN",
      rate: "5.0%",
       time: "Per Day for 365 days",
    min: "$1,500",
    max: "$2,999",
    },
    {
      title: "VIP TRIAL PLAN",
      rate: "10.0%",
      time: "After 24 hours",
      min: "$3,000",
      max: "$6,999",
    },
    {
      title: "INVESTOR PLAN",
      rate: "20.0%",
       time: "After 24 hours",
    min: "$10,000",
    max: "$100,000",
    },
  ];
 
  return (
    <div className="bg-black text-white min-h-screen">
      {/* 🔝 Navbar */}
      <Navbar />

      {/* 🎯 Hero Section */}
      <section className="text-center py-24 px-4 bg-black">
        <h1 className="text-4xl md:text-5xl font-semibold mb-4">Investment</h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
          We offer the ideas that raise your investment above the expected
          income.
        </p>
      </section>

      {/* 🟡 Investment Section */}
      <section className="max-w-5xl mx-auto text-center px-6 py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-[#f5c84c] mb-10">
          About our investment offer
        </h2>

        <div className="text-left space-y-6 text-gray-300 leading-relaxed">
          <p>
            As part of the program to expand staff and staff, increase the
            investment portfolio and modernize technical capacities
            (professional equipment including marine and continental dredges,
            metal detectors, industrial instruments, industrial equipment, and
            localizers are used in the work), this online platform was created.
            This is the main and only instrument for attracting investments from
            individuals. Our investment activity is regulated at the legislative
            level and is accompanied by guarantees of timely payments to
            investors and partners.
          </p>

          <p>
            As part of the program to expand staff and staff, increase the
            investment portfolio and modernize technical capacities
            (professional equipment including marine and continental dredges,
            metal detectors, industrial instruments, industrial equipment, and
            localizers are used in the work), this online platform was created.
            This is the main and only instrument for attracting investments from
            individuals. Our investment activity is regulated at the legislative
            level and is accompanied by guarantees of timely payments to
            investors and partners.
          </p>

          <p className="text-gray-200 font-medium">
            Our minimum withdrawal amount is:{" "}
            <span className="text-[#f5c84c]">
              0.1 Payeer/Perfect Money, 0.001 BTC, 0.02 ETH, 0.012 LTC, 200 DOGE
            </span>
            .
          </p>

          <p>
            All payments are made in manual mode within 48 hours from the time
            of creating request, but usually much faster.
          </p>

          <p>
            You can withdraw your deposit at any time, with penalty 5% of the
            deposit amount.
          </p>
        </div>
      </section>

      {/* 💰 Investment Plans Section */}
      <section className="bg-black text-white py-20 px-6 border-t border-gray-800">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#f5c84c] mb-3">
            Initial investment in gold
          </h2>
          <p className="text-lg md:text-xl text-gray-300">
            What do we offer to investors?
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="bg-[#1a1a1a] rounded-lg shadow-lg overflow-hidden border border-gray-800 "
            >
              {/* Header */}
              <div className="text-center py-3 font-semibold text-sm bg-[#2c2c2c]">
                {plan.title}
              </div>

              {/* Content */}
              <div className="text-center py-6 px-4 bg-[#1c1c1c]">
                <h3 className="text-4xl font-extrabold text-[#fdc700] mb-1">
                  {plan.rate}
                </h3>
                <p className="text-gray-300 mb-6">{plan.time}</p>

                <div className="text-sm text-gray-400 space-y-1">
                  <p>Deposit Return</p>
                  <p>Minimum {plan.min}</p>
                  <p className="mb-5">Maximum {plan.max}</p>
                </div>
                <Link to="/Login">
                  <button className="absolute bg-[#fdc700] hover:bg-[#e0b84b] text-black text-sm font-semibold py-2 px-5 rounded w-40 cursor-pointer -ml-20">
                    Deposit Now
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <UKRegisteredCompanySection />

      <Footer />
    </div>
  );
};

export default Investment;
