import React from "react";
import Navbar from "../components/Navbar";
import goldImg1 from "../assets/gold.png"; 
import goldImg2 from "../assets/gold2.png"; 
import UKRegisteredCompanySection from "../components/UkRegisteredCompany";
import Footer from "../components/Footer";

const About = () => {
  return (
    <div className="bg-black text-white min-h-screen">
      {/* 🔝 Navbar */}
      <Navbar />

      {/* 🎯 Hero Section */}
      <section className="text-center py-24 px-4 bg-black">
        <h1 className="text-4xl md:text-5xl font-semibold mb-4">About Us</h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
          We offer the ideas that raise your investment above the expected income.
        </p>
      </section>

      {/* 🟡 Section 1 - About Working With Gold */}
      <section className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 px-6 py-16">
        {/* Text */}
        <div className="md:w-2/3">
          <h2 className="text-2xl md:text-3xl font-bold text-[#f5c84c] mb-2">
            About working with gold
          </h2>
          <h3 className="text-lg text-gray-200 mb-6">Overview</h3>
          <p className="text-gray-300 leading-relaxed mb-4">
            In the 21st century, gold is no longer used as money or a direct
            means of payment. Instead, it stands as one of the most liquid,
            time-tested, and reliable stores of value. Investing in gold remains
            one of the most popular ways to diversify any investment portfolio,
            regardless of its size. This is because gold has long served as a
            foundation for monetary security, requires no special storage
            conditions, and is resistant to damage unaffected by time, fire, or
            water.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Legal gold mining involves several preparatory stages focused on
            exploring and enriching deposits. To enhance efficiency and
            extraction speed, specialized equipment and machinery are used. The
            mined materials are then processed using gravity methods, flotation
            techniques, and combined approaches for treating mineral ores.
          </p>
        </div>

        {/* Image */}
        <div className="md:w-1/3 flex justify-center">
          <img
            src={goldImg1}
            alt="Gold Illustration"
            className="w-full max-w-sm rounded-lg"
          />
        </div>
      </section>

      {/* 🟡 Section 2 - What We Do */}
      <section className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 px-6 py-16">
        {/* Image */}
        <div className="md:w-1/3 order-2 md:order-1 flex justify-center">
          <img
            src={goldImg2}
            alt="Gold Bag"
            className="w-full max-w-sm rounded-lg"
          />
        </div>

        {/* Text */}
        <div className="md:w-2/3 order-1 md:order-2">
          <h2 className="text-2xl md:text-3xl font-bold text-[#f5c84c] mb-3">
            What we do
          </h2>
          <p className="text-gray-200 mb-4">
            Our company is engaged in investing in gold coins, metal bills.
          </p>
          <p className="text-gray-300 leading-relaxed mb-4">
            This investment approach carries no risk of capital loss, as gold
            can never lose its entire value unlike stocks, for example.
            Moreover, leading industry analysts forecast a steady rise in gold
            prices for 2020–2021. The value of this precious metal has shown
            consistent growth: in early 2016, one ounce was priced at just over
            $1,050; by July 2018, it had risen to $1,220; and by October 2019,
            it reached approximately $1,500. Therefore, in just over three
            years, an investment in gold would have yielded nearly a 50%
            return.
          </p>
          <p className="text-gray-300 leading-relaxed">
            However, Goldnest goes beyond simply buying and selling “gold
            assets” (including gold trading on the Forex market); the company is
            also directly involved in extracting gold from ores in Russia,
            Uzbekistan, Indonesia, and China. All required licenses and permits
            have been duly obtained to ensure full legal compliance.
          </p>
        </div>
      </section>

      <UKRegisteredCompanySection />

      <Footer />
    </div>
  );
};

export default About;