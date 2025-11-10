import { Link } from "react-router-dom";
import React from "react";

const plans = [
  {
    name: "BASIC PLAN",
    percentage: "1.5%",
    time: "Per Day for 365 days",
    min: "$50",
    max: "$499",
  },
  {
    name: "PROFESSIONAL PLAN",
    percentage: "2.5%",
    time: "Per Day for 365 days",
    min: "$500",
    max: "$1,499",
  },
   {
    name: "GOLDEN PLAN",
    percentage: "5.0%",
    time: "Per Day for 365 days",
    min: "$1,500",
    max: "$2,999",
  },
  {
    name: "VIP TRIAL PLAN",
    percentage: "10.0%",
    time: "After 24 hours",
    min: "$3,000",
    max: "$6,999",
  },
  {
    name: "INVESTORS PLAN",
    percentage: "20.0%",
    time: "After 24 hours",
    min: "$10,000",
    max: "$100,000",
  },
];

const InvestmentPlansSection = () => {
  return (
    <section className="bg-black text-white py-16 px-4">
      {/* Section Title */}
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-extrabold text-yellow-400 mb-2">
          Choose a suitable investment plan
        </h2>
        <p className="text-gray-300 text-base lg:text-lg">
          What do we offer to investors?
        </p>
      </div>

      {/* Plans Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {plans.slice(0, 3).map((plan, index) => (
            <PlanCard key={index} plan={plan} />
          ))}
        </div>

        {/* Second Row (2 cards centered) */}
        <div className="mt-8 flex flex-col items-center md:grid md:grid-cols-2 md:gap-8 md:justify-center lg:flex lg:flex-row lg:justify-center">
          {plans.slice(3).map((plan, index) => (
            <div key={index} className="mt-4 md:mt-0 lg:mx-4">
              <PlanCard plan={plan} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const PlanCard = ({ plan }) => (
  <div className="w-72 bg-[#1c1c1c] rounded-lg overflow-hidden shadow-lg text-center ">
    {/* Header */}
    <div className="bg-[#2c2c2c] py-3">
      <h3 className="font-semibold uppercase text-sm lg:text-base">
        {plan.name}
      </h3>
    </div>

    {/* Body */}
    <div className="py-6 px-4">
      <div className="text-yellow-400 text-4xl font-extrabold mb-1">
        {plan.percentage}
      </div>
      <p className="text-gray-300 mb-4">{plan.time}</p>

      <p className="text-gray-400 text-sm">Deposit Return</p>
      <p className="text-gray-300 text-sm mt-1">Minimum {plan.min}</p>
      <p className="text-gray-300 text-sm mb-6">Maximum {plan.max}</p>
<Link to="/Login">
      <button className=" absolute bg-yellow-500 hover:bg-yellow-600 text-black text-sm font-semibold px-5 py-2 rounded w-40 cursor-pointer -ml-20">
        Deposit Now
      </button>
      </Link>
    </div>
  </div>
);

export default InvestmentPlansSection;
