import React from "react";
import SupportImg from "../assets/support.png";
import ServerImg from "../assets/server.png";
import WarrantyImg from "../assets/warranty.png";
import WithdrawalsImg from "../assets/withdrawals.png";
import TeamImg from "../assets/team.png";
import EvsslImg from "../assets/ev-ssl.png";



const features = [
  {
    icon: SupportImg,
    title: "24/7 SUPPORT",
    description:
      "Our support team is at your disposal 24 hours a day, 7 days a week. If you have any questions, write to us.",
  },
  {
    icon: ServerImg,
    title: "DEDICATED SERVER",
    description:
      "Our site is located on a very secure and stable dedicated server. You do not have to worry about any breaks in its operation.",
  },
  {
    icon: WarrantyImg,
    title: "WARRANTY",
    description:
      "The stability of our company and income guarantee that your deposit is safe throughout the entire investment plan.",
  },
  {
    icon: WithdrawalsImg,
    title: "INSTANT WITHDRAWALS",
    description:
      "You can withdraw money at any time if your balance allows it. Minimum withdrawal amount is only 2 USD.",
  },
  {
    icon: TeamImg,
    title: "TEAM",
    description:
      "We are a well-coordinated team that takes responsibility for fulfilling the contract. You could not find a better place.",
  },
  {
    icon: EvsslImg,
    title: "EV-SSL SAFETY",
    description:
      "Your data is secured with an EV-SSL certificate, guaranteeing the confidentiality of their transmission.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="bg-[#1a1a1a] text-white py-16 px-4">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-extrabold text-yellow-400 mb-2">
          Our Features
        </h2>
        <p className="text-gray-300 text-base lg:text-lg">
          Accruals in all plans are carried out for life.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-18 max-w-6xl mx-auto">
        {features.map((feature, index) => (
          <div
            key={index}
            className="text-center flex flex-col items-center group transition-transform"
          >
            {/* Icon Placeholder */}
            <div className="w-30 h-30 mb-4 flex items-center justify-center 
              transition-all duration-300 ">
              <span className="text-gray-400 text-xs text-center">
                  <img
                src={feature.icon}
                alt={feature.title}
                className="w-12 h-12 object-contain"
              />
              </span>
            </div>

            <h3 className="text-yellow-400 font-bold text-lg mb-2 uppercase transition-colors duration-300 group-hover:text-yellow-300">
              {feature.title}
            </h3>

            <p className="text-gray-300 text-sm leading-relaxed transition-colors duration-300 group-hover:text-gray-200">
              {feature.description}
            </p>

            {/* Card Shadow on Hover */}
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition duration-300"></div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
