// src/pages/Partners.jsx - MOBILE OPTIMIZED
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
      
      {/* Referral Commission Section - Mobile Optimized */}
      <section className="px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10">
        <div className="text-center bg-gradient-to-br from-[#0b0b0b] to-black py-6 sm:py-8 px-4 sm:px-6 rounded-xl mb-8 sm:mb-12 border border-yellow-600/30 shadow-lg">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#f5c84c] mb-3 flex items-center justify-center gap-2">
            <span className="text-2xl sm:text-3xl">🤝</span>
            Referral Commission
          </h2>
          <p className="text-base sm:text-lg text-gray-300">2 level affiliate program</p>
        </div>

        {/* Content Section - Mobile Optimized */}
        <div className="bg-gradient-to-br from-black to-[#0a0a0a] py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 rounded-xl mb-8 sm:mb-12 border border-[#222] shadow-lg">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-10">
            {/* Text Content - Mobile Optimized */}
            <div className="flex-1 text-gray-300 space-y-4 leading-relaxed text-sm sm:text-base">
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
                <span className="text-[#f5c84c] font-bold text-base sm:text-lg">7%</span> from the
                investments made by your direct referrals and{" "}
                <span className="text-[#f5c84c] font-bold text-base sm:text-lg">3%</span> from the
                investments of your second-level referrals. You can withdraw your
                earnings at any time.
              </p>
            </div>

            {/* Levels Visualization - Mobile Optimized */}
            <div className="flex-1 flex flex-col items-center space-y-10 sm:space-y-12 lg:space-y-16 mt-6 lg:mt-0">
              {/* 7% Level 1 */}
              <div className="flex flex-col items-center">
                <span className="text-xs sm:text-sm text-gray-300 mb-2 font-semibold">
                  1 level (7%)
                </span>
                <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center overflow-hidden border-2 border-yellow-500 shadow-lg shadow-yellow-500/30">
                  <img
                    src={ThreePercentImg}
                    alt="7 percent level 1"
                    className="w-24 h-24 sm:w-32 sm:h-32 object-contain opacity-90"
                  />
                </div>
                <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-2">
                  <p className="text-yellow-400 text-xs sm:text-sm font-semibold">
                    Direct Referrals
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              <div className="flex flex-col items-center">
                <div className="h-12 sm:h-16 lg:h-20 w-0.5 bg-gradient-to-b from-yellow-500 to-yellow-600"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-lg shadow-yellow-500/50"></div>
                <div className="h-12 sm:h-16 lg:h-20 w-0.5 bg-gradient-to-b from-yellow-600 to-yellow-700"></div>
              </div>

              {/* 3% Level 2 */}
              <div className="flex flex-col items-center">
                <span className="text-xs sm:text-sm text-gray-300 mb-2 font-semibold">
                  2 level (3%)
                </span>
                <div className="w-28 h-28 sm:w-36 sm:h-36 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center overflow-hidden border-2 border-yellow-600 shadow-lg shadow-yellow-600/20">
                  <img
                    src={OnePercentImg}
                    alt="3 percent level 2"
                    className="w-20 h-20 sm:w-28 sm:h-28 object-contain opacity-90"
                  />
                </div>
                <div className="mt-3 bg-yellow-600/10 border border-yellow-600/30 rounded-lg px-4 py-2">
                  <p className="text-yellow-400 text-xs sm:text-sm font-semibold">
                    Indirect Referrals
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box - Mobile Optimized */}
          <div className="max-w-4xl mx-auto mt-8 sm:mt-12 bg-yellow-900/20 border border-yellow-600 rounded-xl p-4 sm:p-6">
            <h3 className="text-yellow-400 font-bold mb-3 text-base sm:text-lg flex items-center gap-2">
              <span className="text-xl sm:text-2xl">💡</span>
              How It Works
            </h3>
            <ul className="text-gray-300 space-y-2 text-xs sm:text-sm">
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">•</span>
                <span>Share your unique referral link with friends and family</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">•</span>
                <span>Earn 7% commission when they make a deposit</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">•</span>
                <span>Earn additional 3% when your referrals refer others</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-0.5">•</span>
                <span>Withdraw your earnings anytime, no minimum balance required</span>
              </li>
            </ul>
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