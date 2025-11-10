import React from "react";
import Navbar from "../components/Navbar";
import ThreePercentImg from "../assets/threepercent.png";
import OnePercentImg from "../assets/onepercent.png";
import UKRegisteredCompanySection from "../components/UkRegisteredCompany";
import Footer from "../components/Footer";

const Partners = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      {/* Referral Commission Section */}
      <section>
        <div className="text-center bg-black py-5 px-4 rounded-lg mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#f5c84c] mb-3">
            Referral Commission
          </h2>
          <p className="text-lg text-gray-300">2 level affiliate program</p>
        </div>

        {/* Content Section */}
        <div className="bg-black py-16 px-6 rounded-lg mb-12">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Text Content */}
            <div className="flex-1 text-gray-300 space-y-4 leading-relaxed">
              <p>
                At Goldnest, we believe that the most effective way to grow our
                business is through the recommendations of our satisfied clients.
                With this in mind, Goldnest has introduced a highly rewarding
                two-tier affiliate program that offers attractive incentives for
                those who share our services with others.
              </p>
              <p>
                Goldnest rewards individuals for helping to promote its investment
                program and anyone can participate. To earn rewards, simply invite
                your friends, family, and colleagues to join through your unique
                referral link.
              </p>
              <p>
                You can earn through our affiliate program and withdraw your
                referral rewards even if you don't have an active deposit in the
                project.
              </p>
              <p>
                You will earn{" "}
                <span className="text-[#f5c84c] font-semibold">7%</span> from the
                investments made by your direct referrals and{" "}
                <span className="text-[#f5c84c] font-semibold">3%</span> from the
                investments of your second-level referrals. You can withdraw your
                earnings at any time.
              </p>
            </div>

            {/* Levels Visualization */}
            <div className="flex-1 flex flex-col items-center space-y-16 mt-10 lg:mt-0">
              {/* 7% Level 1 */}
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-300 mb-2">1 level (7%)</span>
                <div className="w-40 h-40 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden border border-gray-700">
                  <img
                    src={ThreePercentImg}
                    alt="7 percent level 1"
                    className="w-32 h-32 object-contain opacity-80"
                  />
                </div>
              </div>

              {/* Connector Line */}
              <div className="h-20 w-px bg-yellow-500"></div>

              {/* 3% Level 2 */}
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-300 mb-2">2 level (3%)</span>
                <div className="w-36 h-36 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden border border-gray-700">
                  <img
                    src={OnePercentImg}
                    alt="3 percent level 2"
                    className="w-28 h-28 object-contain opacity-80"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UK Registered Company Section */}
      <UKRegisteredCompanySection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Partners;