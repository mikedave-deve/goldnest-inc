import React from "react";
import Navbar from "../components/Navbar";
import { Mail } from "lucide-react"; // using lucide-react for the small email icon
import { VscDebugBreakpointConditionalUnverified } from "react-icons/vsc";
import UKRegisteredCompanySection from "../components/UkRegisteredCompany";
import Footer from "../components/Footer";

const Support = () => {
  return (
    <div className="bg-black text-white min-h-screen">
      {/* 🔝 Navbar */}
      <Navbar />

      {/* 🟡 Support Section */}
      <section className="bg-[#171717] py-16 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#f5c84c] mb-2">
              Support
            </h2>
            <p className="text-gray-300">
              Our support team will answer any questions within 24 hours
            </p>
          </div>

          {/* Form + Info Layout */}
          <div className="flex flex-col md:flex-row justify-between gap-10">
            {/* Left Side — Form */}
            <form className="flex-1 space-y-5">
              <input
                type="text"
                placeholder="Your name"
                className="w-full bg-[#d9d9d9] text-black px-4 py-3 rounded-sm outline-none"
              />
              <input
                type="email"
                placeholder="Your email"
                className="w-full bg-[#d9d9d9] text-black px-4 py-3 rounded-sm outline-none"
              />
              <textarea
                rows="5"
                placeholder="Your message"
                className="w-full bg-[#d9d9d9] text-black px-4 py-3 rounded-sm outline-none resize-none"
              ></textarea>
              <button
                type="submit"
                className="bg-[#f5c84c] text-black px-6 py-2 rounded-sm hover:bg-[#e5b73d] transition"
              >
                Send
              </button>
            </form>

            {/* Right Side — Info */}
            <div className="flex-1 flex flex-col justify-center space-y-6 text-gray-300 text-sm md:text-base">
              

              <div className="flex items-start gap-3">
                <Mail className="text-[#f5c84c] mt-1" size={20} />
                <p>
                  Use contact form after creating support ticket in dashboard,
                  ad messages send on our e-mail!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <UKRegisteredCompanySection />
      <Footer />
    </div>
  );
};

export default Support;
