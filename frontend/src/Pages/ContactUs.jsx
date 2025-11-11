import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { Mail, Send, CheckCircle, AlertCircle } from "lucide-react";
import UKRegisteredCompanySection from "../components/UkRegisteredCompany";
import Footer from "../components/Footer";
import axios from "axios";

const Support = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({
        type: "error",
        message: "Please fill in all fields"
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatus({
        type: "error",
        message: "Please enter a valid email address"
      });
      return;
    }

    try {
      setLoading(true);
      setStatus({ type: "", message: "" });

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      
      const response = await axios.post(`${API_URL}/support/contact`, formData);

      if (response.data.success) {
        setStatus({
          type: "success",
          message: "Message sent successfully! We'll respond within 24 hours."
        });
        
        // Clear form
        setFormData({
          name: "",
          email: "",
          message: ""
        });
      }
    } catch (error) {
      console.error("Support form error:", error);
      setStatus({
        type: "error",
        message: error.response?.data?.message || "Failed to send message. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

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
            <form onSubmit={handleSubmit} className="flex-1 space-y-5">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full bg-[#d9d9d9] text-black px-4 py-3 rounded-sm outline-none focus:ring-2 focus:ring-[#f5c84c]"
                disabled={loading}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your email"
                className="w-full bg-[#d9d9d9] text-black px-4 py-3 rounded-sm outline-none focus:ring-2 focus:ring-[#f5c84c]"
                disabled={loading}
              />
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                placeholder="Your message"
                className="w-full bg-[#d9d9d9] text-black px-4 py-3 rounded-sm outline-none resize-none focus:ring-2 focus:ring-[#f5c84c]"
                disabled={loading}
              ></textarea>

              {/* Status Messages */}
              {status.message && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-sm ${
                    status.type === "success"
                      ? "bg-green-500/20 border border-green-500 text-green-400"
                      : "bg-red-500/20 border border-red-500 text-red-400"
                  }`}
                >
                  {status.type === "success" ? (
                    <CheckCircle size={20} />
                  ) : (
                    <AlertCircle size={20} />
                  )}
                  <p className="text-sm">{status.message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`flex items-center justify-center gap-2 w-full md:w-auto bg-[#f5c84c] text-black px-6 py-3 rounded-sm font-semibold transition ${
                  loading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-[#e5b73d]"
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>

            {/* Right Side — Info */}
            <div className="flex-1 flex flex-col justify-center space-y-6 text-gray-300 text-sm md:text-base">
              <div className="flex items-start gap-3">
                <Mail className="text-[#f5c84c] mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold text-white mb-2">How to Get Support</p>
                  <p className="leading-relaxed">
                    Fill out the form with your name, email, and detailed message. 
                    Our support team will review your inquiry and respond directly 
                    to your email within 24 hours.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="text-[#f5c84c] mt-1 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold text-white mb-2">What to Include</p>
                  <ul className="space-y-1 leading-relaxed list-disc list-inside">
                    <li>A clear description of your issue or question</li>
                    <li>Your account username (if applicable)</li>
                    <li>Any relevant transaction IDs or details</li>
                  </ul>
                </div>
              </div>

              <div className="bg-[#f5c84c]/10 border border-[#f5c84c] rounded-sm p-4">
                <p className="text-[#f5c84c] font-semibold mb-1">Quick Response</p>
                <p className="text-sm text-gray-300">
                  We prioritize all support requests and aim to resolve your 
                  concerns as quickly as possible.
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