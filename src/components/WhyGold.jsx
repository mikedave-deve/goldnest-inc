import React from "react";

const WhyGoldSection = () => {
  return (
    <section className="bg-[#1a1a1a] text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Top: Two Columns Text */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column */}
          <div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-yellow-400 mb-6">
              🌟 Why We Chose Gold
            </h2>

            <p className="text-gray-300 text-base lg:text-lg mb-4">
              For centuries, gold has symbolized wealth, power, and security — and it continues to be one of the most dependable stores of value in the modern financial world.
            </p>

            <p className="text-gray-400 text-base lg:text-lg mb-6">
              Unlike stocks or currencies that can lose their worth overnight, gold retains its intrinsic value across time and generations.
            </p>

            <p className="text-gray-400 text-base lg:text-lg">
              At GoldNest Inc., we believe in the timeless strength of gold as a foundation for stable growth. By focusing on tangible, asset-backed investments, we provide our clients with a safe, resilient alternative to traditional markets — one that preserves capital while creating long-term opportunity.
            </p>
          </div>

          {/* Right Column */}
          <div>
            <h3 className="text-3xl lg:text-4xl font-extrabold text-yellow-400 mb-6">
              🏛 About GoldNest Inc.
            </h3>

            <p className="text-gray-300 text-base lg:text-lg mb-4">
              GoldNest Inc. is a premier investment firm specializing in the acquisition, management, and production of physical gold assets — including gold coins, bullion, and metal-backed instruments.
            </p>

            <p className="text-gray-400 text-base lg:text-lg mb-4">
              Our operations extend far beyond trading. We are directly involved in the extraction and processing of gold from select mining regions across Russia, Uzbekistan, Indonesia, and China, ensuring complete control and transparency from mine to market.
            </p>

            <p className="text-gray-400 text-base lg:text-lg mb-4">
              This vertical integration gives us a unique edge — allowing us to capture value at every stage of the gold supply chain. With established global partnerships and a robust network of distribution channels, we guarantee continuous liquidity and consistent growth potential for our investors.
            </p>

            <p className="text-gray-400 text-base lg:text-lg mb-6">
              Driven by precision, integrity, and expertise, GoldHive Inc. transforms one of the world’s oldest assets into a modern vehicle for lasting prosperity.
            </p>

            <button className="border border-yellow-400 text-yellow-400 px-6 py-3 rounded text-base lg:text-lg font-semibold hover:bg-gray-400 transition cursor-pointer">
              Learn More
            </button>
          </div>
        </div>

        
        
      </div>
    </section>
  );
};

export default WhyGoldSection;
