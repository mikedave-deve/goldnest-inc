import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { authAPI, getErrorMessage } from "../api";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing"); // 'processing', 'success', 'error'
  const [message, setMessage] = useState("Processing your password reset...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid reset link. Please request a new password reset.");
      return;
    }

    // Automatically call the reset password API
    resetPassword();
  }, [token]);

  const resetPassword = async () => {
    try {
      setStatus("processing");
      setMessage("Generating your new secure password...");

      const response = await authAPI.resetPassword(token);

      if (response.data.success) {
        setStatus("success");
        setMessage(
          "Password reset successful! A new password has been sent to your email. Please check your inbox."
        );

        // Redirect to login after 8 seconds
        setTimeout(() => {
          navigate("/login");
        }, 8000);
      }
    } catch (err) {
      console.error("Password Reset Error:", err);

      const errorMsg = getErrorMessage(err);
      setStatus("error");
      setMessage(errorMsg);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#181818] px-4">
      <div className="bg-black text-white rounded-sm shadow-2xl p-8 lg:w-[600px] w-full max-w-full">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link to="/Home">
            <img
              src={logo}
              alt="Goldnest Logo"
              className="w-40 object-contain"
            />
          </Link>
        </div>

        {/* Title with gold lines */}
        <div className="flex items-center justify-center mb-8">
          <span className="flex-grow h-[1px] bg-[#D4AF37]"></span>
          <span className="mx-3 text-[#fdc700] text-sm font-semibold tracking-wider">
            PASSWORD RESET
          </span>
          <span className="flex-grow h-[1px] bg-[#D4AF37]"></span>
        </div>

        {/* Status Display */}
        <div className="text-center">
          {status === "processing" && (
            <div>
              <div className="flex justify-center mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400"></div>
              </div>
              <p className="text-gray-300 text-lg mb-4">{message}</p>
              <p className="text-gray-500 text-sm">Please wait...</p>
            </div>
          )}

          {status === "success" && (
            <div>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-green-400 mb-4">
                Success!
              </h2>
              <p className="text-gray-300 text-base mb-6">{message}</p>

              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 mb-6">
                <p className="text-yellow-400 text-sm">
                  <strong>Next Steps:</strong>
                  <br />
                  1. Check your email for your new password
                  <br />
                  2. Use the new password to login
                  <br />
                  3. Consider changing it to something memorable in your profile
                  settings
                </p>
              </div>

              <button
                onClick={() => navigate("/login")}
                className="bg-[#D4AF37] hover:bg-[#c6a030] text-black font-semibold px-8 py-3 rounded transition w-full"
              >
                GO TO LOGIN
              </button>

              <p className="text-gray-500 text-xs mt-4">
                Redirecting automatically in a few seconds...
              </p>
            </div>
          )}

          {status === "error" && (
            <div>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-red-400 mb-4">
                Reset Failed
              </h2>
              <p className="text-gray-300 text-base mb-6">{message}</p>

              <div className="space-y-3">
                <button
                  onClick={() => navigate("/forgot-password")}
                  className="bg-[#D4AF37] hover:bg-[#c6a030] text-black font-semibold px-8 py-3 rounded transition w-full"
                >
                  REQUEST NEW RESET LINK
                </button>

                <button
                  onClick={() => navigate("/login")}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-8 py-3 rounded transition w-full"
                >
                  BACK TO LOGIN
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="text-center mt-8 pt-6 border-t border-gray-800">
          <p className="text-gray-500 text-xs">
            Need help? Contact us at{" "}
            <a
              href="mailto:support@goldnest-inc.biz"
              className="text-[#fdc700] hover:underline"
            >
              admin@goldnest-inc.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
