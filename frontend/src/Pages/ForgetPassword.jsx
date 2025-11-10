import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { authAPI, getErrorMessage } from "../api";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const [isLoading, setIsLoading] = useState(false);

  const handleRecover = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setIsLoading(true);

    try {
      // Call backend to request password reset
      // Backend should send first email: "Password request confirmation" with link
      const response = await authAPI.forgotPassword({ email });

      if (response.data.success) {
        setMessage(
          response.data.message || 
          "Password reset link sent to your email! Please check your inbox."
        );
        setMessageType("success");
        
        // Clear email field
        setEmail("");
        
        // Redirect to login after 5 seconds
        setTimeout(() => navigate("/login"), 5000);
      }
    } catch (err) {
      console.error("Password Recovery Error:", err);
      
      const errorMsg = getErrorMessage(err);
      setMessage(errorMsg);
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#181818] px-4 lg:pt-40">
      <div className="-mt-70 bg-black text-white rounded-sm shadow-2xl p-5 lg:w-[550px] w-450 max-w-full">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Goldnest Logo" className="w-40 object-contain" />
        </div>

        {/* Title with gold lines */}
        <div className="flex items-center justify-center mb-8">
          <span className="flex-grow h-[1px] bg-[#D4AF37]"></span>
          <span className="mx-3 text-[#fdc700] text-sm font-semibold tracking-wider">
            FORGOT PASSWORD
          </span>
          <span className="flex-grow h-[1px] bg-[#D4AF37]"></span>
        </div>

        <p className="text-gray-300 text-sm text-center mb-6">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {/* Form */}
        <form onSubmit={handleRecover}>
          <div className="mb-6">
            <label className="block text-sm mb-2 text-[#fdc700]">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-3 bg-white text-black rounded focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full ${
              isLoading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-[#D4AF37] hover:bg-[#c6a030]"
            } text-black font-semibold py-3 rounded transition`}
          >
            {isLoading ? "SENDING..." : "RECOVER"}
          </button>
        </form>

        {message && (
          <div
            className={`text-center mt-4 text-sm p-3 rounded ${
              messageType === "success"
                ? "bg-green-900/30 text-green-400 border border-green-500"
                : "bg-red-900/30 text-red-400 border border-red-500"
            }`}
          >
            {message}
          </div>
        )}

        {/* Back to login */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Remember your password?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#fdc700] hover:underline font-semibold"
            >
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;