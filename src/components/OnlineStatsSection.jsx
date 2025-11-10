import React from "react";
import { CalendarDays, Users, Landmark, CreditCard } from "lucide-react"; // Placeholder icons

const stats = [
  {
    icon: <CalendarDays size={48} className="text-yellow-400 mb-2" />,
    label: "Work",
    value: "7983",
  },
  {
    icon: <Users size={48} className="text-yellow-400 mb-2" />,
    label: "Investor",
    value: "99769",
  },
  {
    icon: <Landmark size={48} className="text-yellow-400 mb-2" />,
    label: "Deposit",
    value: "$ 7000856080.60",
  },
  {
    icon: <CreditCard size={48} className="text-yellow-400 mb-2" />,
    label: "Payment",
    value: "$ 852772997.00",
  },
];

const OnlineStatsSection = () => {
  return (
    <section className="bg-black text-white py-16 px-4 ">
      {/* Header */}
      <div className="text-center mb-15">
        <h2 className="text-3xl lg:text-4xl font-extrabold text-yellow-400 mb-2">
          Online Statistic
        </h2>
        <p className="text-gray-300 text-base lg:text-lg">
          Thanks to you, our company is developing steadily and increasing its capacity.
        </p>
      </div>

      {/* Stats */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-center mb-5">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col items-center">
            {stat.icon}
            <p className="text-gray-300 text-sm mb-1">{stat.label}</p>
            <p className="text-yellow-400 text-xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OnlineStatsSection;
